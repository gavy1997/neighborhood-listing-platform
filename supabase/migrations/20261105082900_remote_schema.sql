SET local check_function_bodies = off;

DROP POLICY "Providers and Admins can view service bookings" ON "public"."bookings";

DROP POLICY "Profiles are viewable by owner and admin" ON "public"."profiles";

DROP POLICY "Admins can manage categories" ON "public"."service_categories";

DROP POLICY "Public visitors can view active categories" ON "public"."service_categories";

DROP POLICY "Public read category mappings for approved services" ON "public"."service_category_mappings";

DROP POLICY "Admins full management on services" ON "public"."services";

DROP POLICY "Public visitors can view approved services" ON "public"."services";

ALTER TABLE "public"."bookings"
  DROP CONSTRAINT "bookings_service_id_fkey";

ALTER TABLE "public"."inquiries"
  DROP CONSTRAINT "inquiries_message_check";

ALTER TABLE "public"."inquiries"
  DROP CONSTRAINT "inquiries_sender_id_fkey";

ALTER TABLE "public"."profiles"
  DROP CONSTRAINT "profiles_id_fkey";

ALTER TABLE "public"."properties"
  DROP CONSTRAINT "properties_owner_id_fkey";

ALTER TABLE "public"."property_sponsors"
  DROP CONSTRAINT "property_sponsors_pkey";

ALTER TABLE "public"."property_sponsors"
  DROP CONSTRAINT "property_sponsors_sponsor_id_fkey";

ALTER TABLE "public"."service_category_mappings"
  DROP CONSTRAINT "service_category_mappings_category_id_fkey";

ALTER TABLE "public"."service_category_mappings"
  DROP CONSTRAINT "service_category_mappings_service_id_fkey";

ALTER TABLE "public"."services"
  DROP CONSTRAINT "services_provider_id_fkey";

DROP FUNCTION "public"."is_admin"();

ALTER TABLE "public"."sponsors"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."inquiries"
  DROP COLUMN "sender_id";

ALTER TABLE "public"."profiles"
  DROP COLUMN "updated_at";

ALTER TABLE "public"."properties"
  DROP COLUMN "updated_at";

ALTER TABLE "public"."property_sponsors"
  DROP COLUMN "created_at";

ALTER TABLE "public"."property_sponsors"
  DROP COLUMN "id";

DROP TABLE "public"."bookings";

DROP TABLE "public"."service_categories";

DROP TABLE "public"."service_category_mappings";

DROP TABLE "public"."services";

CREATE EXTENSION "pgtap" SCHEMA "public";

ALTER TABLE "public"."inquiries"
  ADD COLUMN "user_id" uuid NOT NULL;

ALTER TABLE "public"."profiles"
  ADD COLUMN "email" text NOT NULL;

ALTER TABLE "public"."properties"
  ADD COLUMN "description" text;

ALTER TABLE "public"."properties"
  ADD COLUMN "is_published" boolean DEFAULT false;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "company_name" text NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "status" text NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "is_active" boolean DEFAULT true;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "placement" text NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "start_date" date NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "end_date" date NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "target_zip_codes" text[] NOT NULL;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "priority" integer DEFAULT 0;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "impression_count" integer DEFAULT 0;

ALTER TABLE "public"."sponsors"
  ADD COLUMN "destination_url" text NOT NULL;

ALTER TABLE "public"."inquiries"
  ALTER COLUMN "created_at" DROP NOT NULL;

ALTER TABLE "public"."profiles"
  ALTER COLUMN "created_at" DROP NOT NULL;

ALTER TABLE "public"."properties"
  ALTER COLUMN "approved" DROP NOT NULL;

ALTER TABLE "public"."properties"
  ALTER COLUMN "created_at" DROP NOT NULL;

ALTER TABLE "public"."properties"
  ALTER COLUMN "owner_id" DROP NOT NULL;

ALTER TABLE "public"."property_sponsors"
  ALTER COLUMN "sponsor_id" DROP DEFAULT;

ALTER TABLE "public"."property_sponsors"
  ALTER COLUMN "sponsor_id" TYPE text USING "sponsor_id"::text;

ALTER TABLE "public"."sponsors"
  ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "public"."sponsors"
  ALTER COLUMN "id" TYPE text USING "id"::text;

ALTER TABLE "public"."inquiries"
  ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();

ALTER TABLE "public"."profiles"
  ALTER COLUMN "role" SET DEFAULT 'public'::text;

ALTER TABLE "public"."properties"
  ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();

CREATE OR REPLACE FUNCTION public.get_active_sponsor (
  p_property_id uuid,
  p_target_zip  text
)
  RETURNS TABLE (
    id               text,
    company_name     text,
    priority         integer,
    destination_url  text,
    impression_count integer,
    start_date       date,
    end_date         date
  )
  LANGUAGE sql
  SECURITY DEFINER
  AS $function$
    SELECT 
        s.id,
        s.company_name,
        s.priority,
        s.destination_url,
        s.impression_count,
        s.start_date,
        s.end_date
    FROM sponsors s
    CROSS JOIN properties p
    WHERE p.id = p_property_id
      AND s.status = 'APPROVED'
      AND s.is_active = TRUE
      AND CURRENT_DATE BETWEEN s.start_date AND s.end_date
      AND (
          p_target_zip = ANY(s.target_zip_codes)
          OR s.target_zip_codes::text LIKE '%' || p_target_zip || '%'
      )
    ORDER BY 
        s.priority ASC,
        s.impression_count ASC
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_active_sponsors (
  p_property_zip text,
  p_current_date date
)
  RETURNS SETOF public.sponsors
  LANGUAGE plpgsql
  AS $function$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM sponsors s
    WHERE 
        -- 1. Administrative Status Enforcement
        s.status = 'APPROVED'
        AND s.is_active = TRUE
        
        -- 2. Temporal Validity Enforcement
        AND p_current_date BETWEEN s.start_date AND s.end_date
        
        -- 3. Spatial / ZIP Scoping Enforcement
        AND p_property_zip = ANY(s.target_zip_codes)
        
    ORDER BY s.priority DESC, s.impression_count ASC, s.id ASC;
END;
$function$;

ALTER TABLE "public"."inquiries"
  ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_role_check" CHECK ((role = ANY (ARRAY['public'::text, 'owner'::text, 'admin'::text])));

ALTER TABLE "public"."properties"
  ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."property_sponsors"
  ADD CONSTRAINT "property_sponsors_pkey" PRIMARY KEY (property_id, sponsor_id);

CREATE POLICY "Owners can delete their own properties" ON "public"."properties"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = owner_id));

CREATE POLICY "Owners can insert own properties" ON "public"."properties"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((owner_id = auth.uid()));

CREATE POLICY "Owners can insert their own properties" ON "public"."properties"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = owner_id));

CREATE POLICY "Owners can update own unapproved properties" ON "public"."properties"
  FOR UPDATE
  TO "authenticated"
  USING (((owner_id = auth.uid()) AND (approved = false)))
  WITH CHECK (((owner_id = auth.uid()) AND (approved = false)));

CREATE POLICY "Owners can update their own properties" ON "public"."properties"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = owner_id))
  WITH CHECK ((auth.uid() = owner_id));

CREATE POLICY "Public can view published properties" ON "public"."properties"
  FOR SELECT
  TO "anon", "authenticated"
  USING ((is_published = true));

COMMENT ON EXTENSION "pgtap" IS 'Unit testing for PostgreSQL';

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsor"(uuid, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_active_sponsor"(uuid, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsor"(uuid, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsor"(uuid, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsors"(text, date) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_active_sponsors"(text, date) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsors"(text, date) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_active_sponsors"(text, date) TO "service_role";

