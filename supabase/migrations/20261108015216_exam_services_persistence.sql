-- Midterm: services, categories, mappings, and bookings.
-- Timestamps use timestamptz, which stores an absolute time independent of display timezone.

-- Keep existing Lab 5 roles and add the midterm roles.
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_midterm_check
  check (
    role in (
      'user',
      'property_professional',
      'local_sponsor',
      'admin',
      'client',
      'provider',
      'merchant'
    )
  );

-- Users may read their own profile. A user may register as a client;
-- provider and admin roles must be assigned through trusted admin tooling.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can create a basic own profile" on public.profiles;
create policy "Users can create a basic own profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'property_professional'
  );

create policy "Clients can create their own profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'client'
  );

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  description text not null check (length(trim(description)) > 0),
  neighborhood text not null check (length(trim(neighborhood)) > 0),
  coverage_radius_miles numeric(6, 2) not null
    check (coverage_radius_miles >= 0),
  price numeric(10, 2) not null check (price >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_category_mappings (
  service_id uuid not null references public.services(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, category_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null check (length(trim(client_name)) > 0),
  client_email text not null check (client_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  requested_date date not null,
  notes text not null check (length(trim(notes)) between 10 and 2000),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index services_provider_id_idx on public.services(provider_id);
create index services_status_idx on public.services(status);
create index service_category_mappings_category_id_idx
  on public.service_category_mappings(category_id);
create index bookings_service_id_idx on public.bookings(service_id);
create index bookings_requested_date_idx on public.bookings(requested_date);

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_category_mappings enable row level security;
alter table public.bookings enable row level security;

-- Public visitors can read active categories and approved services.
create policy "Public can read active service categories"
  on public.service_categories for select to anon, authenticated
  using (is_active = true);

create policy "Public can read approved services"
  on public.services for select to anon, authenticated
  using (status = 'approved');

-- Providers can see their own services and manage only their draft or suspended services.
create policy "Providers can read their own services"
  on public.services for select to authenticated
  using (provider_id = (select auth.uid()));

create policy "Providers can create draft services"
  on public.services for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'provider'
    )
  );

create policy "Providers can update their draft or suspended services"
  on public.services for update to authenticated
  using (
    provider_id = (select auth.uid())
    and status in ('draft', 'suspended')
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'provider'
    )
  )
  with check (
    provider_id = (select auth.uid())
    and status in ('draft', 'suspended')
  );

create policy "Providers can delete their draft services"
  on public.services for delete to authenticated
  using (
    provider_id = (select auth.uid())
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'provider'
    )
  );

-- Public can see category links only when both the service and category are public.
create policy "Public can read visible service category mappings"
  on public.service_category_mappings for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
    and exists (
      select 1 from public.service_categories c
      where c.id = category_id and c.is_active = true
    )
  );

create policy "Providers can add categories to their draft services"
  on public.service_category_mappings for insert to authenticated
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and s.status in ('draft', 'suspended')
    )
  );

create policy "Providers can remove categories from their draft services"
  on public.service_category_mappings for delete to authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and s.status in ('draft', 'suspended')
    )
  );

-- Anyone can submit a booking for an approved service.
-- Clients cannot read bookings; the service provider can read bookings for their services.
create policy "Visitors can submit bookings for approved services"
  on public.bookings for insert to anon, authenticated
  with check (
    client_id is not distinct from (select auth.uid())
    and exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
  );

create policy "Providers can read bookings for their services"
  on public.bookings for select to authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and exists (
          select 1 from public.profiles p
          where p.id = (select auth.uid())
            and p.role = 'provider'
        )
    )
  );

-- Admin-only changes and reads must go through trusted server-side code.
-- Never expose the Supabase service-role key to the browser.

grant usage on schema public to anon, authenticated;

revoke all on public.service_categories,
  public.services,
  public.service_category_mappings,
  public.bookings
from anon, authenticated;

grant select on public.service_categories, public.services,
  public.service_category_mappings to anon, authenticated;

grant insert, update, delete on public.services to authenticated;
grant insert, delete on public.service_category_mappings to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;
grant select on public.bookings to service_role;
grant select, update on public.services to service_role;