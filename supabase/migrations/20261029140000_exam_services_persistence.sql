-- Migration: 20261029140000_exam_services_persistence.sql
-- Description: Schema DDL & Row-Level Security (RLS) for Neighborhood Services Subsystem

BEGIN;

--------------------------------------------------------------------------------
-- 1. SCHEMAS & TABLES CREATION
--------------------------------------------------------------------------------

-- Profiles Table (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'merchant', 'provider', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Service Categories Table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) >= 3),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
    active_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(title) >= 5),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    coverage_radius_miles INTEGER NOT NULL CHECK (coverage_radius_miles > 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Junction Table: Category Mappings
CREATE TABLE IF NOT EXISTS public.service_category_mappings (
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, category_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    client_email TEXT NOT NULL CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    requested_date DATE NOT NULL,
    notes TEXT NOT NULL CHECK (char_length(notes) >= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 2. ENABLE DEFAULT-DENY ROW-LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 3. RLS SECURITY POLICIES
--------------------------------------------------------------------------------

-- Helper Function: Check Admin Status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--- PROFILES POLICIES ---
CREATE POLICY "Profiles are viewable by owner and admin" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

--- SERVICE CATEGORIES POLICIES ---
CREATE POLICY "Public visitors can view active categories" 
ON public.service_categories FOR SELECT 
USING (active_status = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" 
ON public.service_categories FOR ALL 
USING (public.is_admin());

--- SERVICES POLICIES ---
-- Anonymous / Public Read: Only approved services
CREATE POLICY "Public visitors can view approved services" 
ON public.services FOR SELECT 
USING (status = 'approved' OR provider_id = auth.uid() OR public.is_admin());

-- Provider Insert: Must set provider_id to own auth.uid()
CREATE POLICY "Providers can create own services" 
ON public.services FOR INSERT 
WITH CHECK (
  auth.uid() = provider_id 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('provider', 'merchant'))
);

-- Provider Update: Restricted to modifying draft or suspended listings only
CREATE POLICY "Providers can update own non-approved services" 
ON public.services FOR UPDATE 
USING (
  auth.uid() = provider_id 
  AND status IN ('draft', 'suspended')
)
WITH CHECK (
  auth.uid() = provider_id 
  AND status IN ('draft', 'pending', 'suspended')
);

-- Provider Delete: Only own drafts
CREATE POLICY "Providers can delete own draft services" 
ON public.services FOR DELETE 
USING (auth.uid() = provider_id AND status = 'draft');

-- Admin Full Access on Services
CREATE POLICY "Admins full management on services" 
ON public.services FOR ALL 
USING (public.is_admin());

--- SERVICE CATEGORY MAPPING POLICIES ---
CREATE POLICY "Public read category mappings for approved services" 
ON public.service_category_mappings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE id = service_id AND (status = 'approved' OR provider_id = auth.uid())
  ) OR public.is_admin()
);

--- BOOKINGS POLICIES ---
-- Anyone (Public/Client) can submit a booking
CREATE POLICY "Anyone can create a booking" 
ON public.bookings FOR INSERT 
WITH CHECK (true);

-- Clients have 0 SELECT access. Only service owners & admins can read bookings
CREATE POLICY "Providers and Admins can view service bookings" 
ON public.bookings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE id = bookings.service_id AND provider_id = auth.uid()
  ) OR public.is_admin()
);

COMMIT;

-- Migration: 20261029140000_exam_services_persistence.sql
-- Description: DDL & RLS policies for Local Merchant Services & Bookings Subsystem

-- ==========================================
-- 1. TABLES CREATION
-- ==========================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'merchant', 'provider', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Service Categories Table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) >= 3),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
    active_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(title) >= 5),
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    coverage_radius_miles INTEGER NOT NULL CHECK (coverage_radius_miles > 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Service Category Mappings Junction Table
CREATE TABLE IF NOT EXISTS public.service_category_mappings (
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, category_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    client_email TEXT NOT NULL CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    requested_date DATE NOT NULL,
    notes TEXT NOT NULL CHECK (char_length(notes) >= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. ROW-LEVEL SECURITY (RLS) ACTIVATION
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

-- --- Profiles Policies ---
CREATE POLICY "profiles_read_own_or_admin" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- --- Service Categories Policies ---
CREATE POLICY "categories_public_read_active" ON public.service_categories
    FOR SELECT USING (active_status = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- --- Services Policies ---
-- Public Read: Only approved services
CREATE POLICY "services_public_read_approved" ON public.services
    FOR SELECT USING (status = 'approved' OR provider_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Provider Insert: Can create draft listings linked to self
CREATE POLICY "services_provider_insert" ON public.services
    FOR INSERT WITH CHECK (
        auth.uid() = provider_id AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('merchant', 'provider', 'admin'))
    );

-- Provider Update/Delete: Scoped to own listings only when status is draft or suspended
CREATE POLICY "services_provider_update" ON public.services
    FOR UPDATE USING (
        (provider_id = auth.uid() AND status IN ('draft', 'suspended')) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "services_provider_delete" ON public.services
    FOR DELETE USING (
        (provider_id = auth.uid() AND status IN ('draft', 'suspended')) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- --- Category Mappings Policies ---
CREATE POLICY "mappings_public_read" ON public.service_category_mappings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.services WHERE id = service_id AND (status = 'approved' OR provider_id = auth.uid()))
    );

-- --- Bookings Policies ---
-- Public/Client Insert: Anyone can book a service
CREATE POLICY "bookings_public_insert" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Read Access: Only designated provider of the service or admin can view client bookings
CREATE POLICY "bookings_provider_admin_read" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.services 
            WHERE services.id = bookings.service_id 
            AND services.provider_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );