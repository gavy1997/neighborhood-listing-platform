-- Midterm services, categories, mappings, and bookings.
begin;

-- Keep the existing Lab 5 profile roles and add the midterm roles.
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  drop constraint if exists profiles_role_midterm_check;

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

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 3),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  active_status boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) >= 5),
  hourly_rate numeric(10, 2) not null check (hourly_rate >= 0),
  duration_minutes integer not null check (duration_minutes >= 15),
  coverage_radius_miles integer not null check (coverage_radius_miles > 0),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.service_category_mappings (
  service_id uuid not null references public.services(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, category_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  client_email text not null
    check (client_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  requested_date date not null,
  notes text not null check (char_length(notes) between 10 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists services_provider_id_idx
  on public.services(provider_id);
create index if not exists services_status_idx
  on public.services(status);
create index if not exists service_category_mappings_category_id_idx
  on public.service_category_mappings(category_id);
create index if not exists bookings_service_id_idx
  on public.bookings(service_id);
create index if not exists bookings_requested_date_idx
  on public.bookings(requested_date);

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_category_mappings enable row level security;
alter table public.bookings enable row level security;

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

drop policy if exists "Clients can create their own profile" on public.profiles;
create policy "Clients can create their own profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'client'
  );

drop policy if exists "Public can read active service categories"
  on public.service_categories;
create policy "Public can read active service categories"
  on public.service_categories for select to anon, authenticated
  using (active_status = true);

drop policy if exists "Public can read approved services" on public.services;
create policy "Public can read approved services"
  on public.services for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "Providers can read their own services" on public.services;
create policy "Providers can read their own services"
  on public.services for select to authenticated
  using (
    provider_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'provider'
    )
  );

drop policy if exists "Providers can create draft services" on public.services;
create policy "Providers can create draft services"
  on public.services for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'provider'
    )
  );

drop policy if exists "Providers can update their draft or suspended services"
  on public.services;
create policy "Providers can update their draft or suspended services"
  on public.services for update to authenticated
  using (
    provider_id = (select auth.uid())
    and status in ('draft', 'suspended')
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'provider'
    )
  )
  with check (
    provider_id = (select auth.uid())
    and status in ('draft', 'suspended')
  );

drop policy if exists "Providers can delete their draft services"
  on public.services;
create policy "Providers can delete their draft services"
  on public.services for delete to authenticated
  using (
    provider_id = (select auth.uid())
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'provider'
    )
  );

drop policy if exists "Public can read visible service category mappings"
  on public.service_category_mappings;
create policy "Public can read visible service category mappings"
  on public.service_category_mappings for select to anon, authenticated
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
    and exists (
      select 1 from public.service_categories c
      where c.id = category_id and c.active_status = true
    )
  );

drop policy if exists "Providers can add categories to their draft services"
  on public.service_category_mappings;
create policy "Providers can add categories to their draft services"
  on public.service_category_mappings for insert to authenticated
  with check (
    exists (
      select 1 from public.services s
      join public.profiles p on p.id = s.provider_id
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and s.status in ('draft', 'suspended')
        and p.role = 'provider'
    )
  );

drop policy if exists "Providers can remove categories from their draft services"
  on public.service_category_mappings;
create policy "Providers can remove categories from their draft services"
  on public.service_category_mappings for delete to authenticated
  using (
    exists (
      select 1 from public.services s
      join public.profiles p on p.id = s.provider_id
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and s.status in ('draft', 'suspended')
        and p.role = 'provider'
    )
  );

drop policy if exists "Visitors can submit bookings for approved services"
  on public.bookings;
create policy "Visitors can submit bookings for approved services"
  on public.bookings for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.status = 'approved'
    )
  );

drop policy if exists "Providers can read bookings for their services"
  on public.bookings;
create policy "Providers can read bookings for their services"
  on public.bookings for select to authenticated
  using (
    exists (
      select 1 from public.services s
      join public.profiles p on p.id = s.provider_id
      where s.id = service_id
        and s.provider_id = (select auth.uid())
        and p.role = 'provider'
    )
  );

grant usage on schema public to anon, authenticated, service_role;

revoke all on public.service_categories,
  public.services,
  public.service_category_mappings,
  public.bookings
from anon, authenticated;

grant select on public.service_categories, public.services,
  public.service_category_mappings to anon, authenticated;

grant select, insert on public.profiles to authenticated;
grant insert, update, delete on public.services to authenticated;
grant insert, delete on public.service_category_mappings to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;

grant all privileges on public.service_categories,
  public.services,
  public.service_category_mappings,
  public.bookings to service_role;

commit;