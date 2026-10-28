-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can create a basic own profile" on public.profiles;
create policy "Users can create a basic own profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'property_professional'
  );


-- 2. Properties Table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  title text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

drop policy if exists "Public can read approved properties" on public.properties;
create policy "Public can read approved properties"
  on public.properties for select to anon, authenticated
  using (approved = true);

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
    and approved = false
  )
  with check (
    owner_id = (select auth.uid())
    and approved = false
  );


-- 3. Sponsors Table
create table if not exists public.sponsors (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete restrict,
    name text not null,
    active boolean not null default false,
    approved boolean not null default false,
    created_at timestamptz not null default now()
);

drop policy if exists "Public can read active approved sponsors" on public.sponsors;
create policy "Public can read active approved sponsors"
  on public.sponsors for select to anon, authenticated
  using (active = true and approved = true);

drop policy if exists "Sponsors can read their own records" on public.sponsors;
create policy "Sponsors can read their own records"
  on public.sponsors for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Owners can create inactive unapproved sponsors" on public.sponsors;
create policy "Owners can create inactive unapproved sponsors"
  on public.sponsors for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and active = false
    and approved = false
  );

drop policy if exists "Owners can update their own unapproved sponsors" on public.sponsors;
create policy "Owners can update their own unapproved sponsors"
  on public.sponsors for update to authenticated
  using (
    owner_id = (select auth.uid())
  );

alter table public.sponsors enable row level security;


-- 4. Property Sponsors Junction Table
create table if not exists public.property_sponsors (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.property_sponsors enable row level security;


-- 5. Inquiries Table
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (
    length(trim(message)) between 1 and 2000
  ),
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;
