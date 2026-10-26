-- Core tables for the neighborhood listings app.
-- Admin changes are intended to use trusted server-side code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'property_professional'
    check (role in ('property_professional', 'local_sponsor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  street text not null check (length(trim(street)) > 0),
  city text not null check (length(trim(city)) > 0),
  state text not null check (state ~ '^[A-Z]{2}$'),
  zip_code text not null check (zip_code ~ '^[0-9]{5}(-[0-9]{4})?$'),
  price numeric(12, 2) not null check (price >= 0),
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms numeric(4, 1) not null check (bathrooms >= 0),
  square_feet integer not null check (square_feet >= 0),
  amenities text[] not null default '{}',
  image_url text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  business_name text not null check (length(trim(business_name)) > 0),
  category text not null,
  website_url text not null check (website_url ~ '^https?://'),
  active boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_sponsors (
  property_id uuid not null references public.properties(id) on delete cascade,
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (property_id, sponsor_id)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (
    length(trim(message)) between 1 and 2000
  ),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.sponsors enable row level security;
alter table public.property_sponsors enable row level security;
alter table public.inquiries enable row level security;

-- A user may read their own profile and create only a basic profile.
-- No client policy permits changing a profile role.
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can create a basic own profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'property_professional'
  );

-- Anyone can read approved listings. Owners can also read their own listings.
drop policy if exists "Owners can read their own properties" on public.properties;
create policy "Owners can read their own properties"
  on public.properties for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Owners can create unapproved properties" on public.properties;
create policy "Owners can create unapproved properties"
  on public.properties for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and approved = false
  );

drop policy if exists "Owners can update their own unapproved properties" on public.properties;
create policy "Owners can update their own unapproved properties"
  on public.properties for update to authenticated
  using (
    owner_id = (select auth.uid())
  );

drop policy if exists "Owners can update unapproved properties" on public.properties;
create policy "Owners can update unapproved properties"
  on public.properties for update to authenticated
  using (
    owner_id = (select auth.uid())
    and approved = false
  )
  with check (
    owner_id = (select auth.uid())
    and approved = false
  );

-- Public sponsor visibility requires both active and approved status.
drop policy if exists "Public can read active approved sponsors" on public.sponsors;
create policy "Public can read active approved sponsors"
  on public.sponsors for select to anon, authenticated
  using (active = true and approved = true);

drop policy if exists "Sponsors can read their own records" on public.sponsors;
create policy "Sponsors can read their own records"
  on public.sponsors for select to authenticated
  using (owner_id = (select auth.uid()));
    and active = false
    and approved = false
  );

create policy "Owners can update their own unapproved sponsors"
  on public.sponsors for update to authenticated
  using (
    owner_id = (select auth.uid())
    and approved = false
  )
  with check (
    owner_id = (select auth.uid())
    and approved = false
  );

-- Public can read only sponsor links for approved properties and
-- active, approved sponsors. Owners may link an approved sponsor
-- to their own unapproved property.
create policy "Public can read visible property sponsor links"
  on public.property_sponsors for select to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.approved = true
    )
    and exists (
      select 1 from public.sponsors s
      where s.id = sponsor_id and s.active = true and s.approved = true
    )
  );

create policy "Owners can link approved sponsors to own unapproved properties"
  on public.property_sponsors for insert to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
        and p.approved = false
    )
    and exists (
      select 1 from public.sponsors s
      where s.id = sponsor_id
        and s.active = true
        and s.approved = true
    )
  );

create policy "Owners can unlink sponsors from own unapproved properties"
  on public.property_sponsors for delete to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.owner_id = (select auth.uid())
        and p.approved = false
    )
  );

-- Authenticated users may submit and read their own inquiries.
-- The owner of the related property may also read its inquiries.
create policy "Senders can read their own inquiries"
  on public.inquiries for select to authenticated
  using (sender_id = (select auth.uid()));

create policy "Property owners can read listing inquiries"
  on public.inquiries for select to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.owner_id = (select auth.uid())
    )
  );

create policy "Users can submit inquiries for approved properties"
  on public.inquiries for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.approved = true
    )
  );

  grant usage on schema public to anon, authenticated;

grant select on public.properties to anon, authenticated;
grant insert, update on public.properties to authenticated;

grant select on public.sponsors to anon, authenticated;
grant insert, update on public.sponsors to authenticated;

grant select on public.property_sponsors to anon, authenticated;
grant insert, delete on public.property_sponsors to authenticated;

grant select, insert on public.inquiries to authenticated;

grant select, insert on public.profiles to authenticated;
