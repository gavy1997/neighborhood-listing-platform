# Lab 5: Database Authorization and RLS Test Evidence

## Target table and project

The table tested was `public.properties` in my Supabase development project. Test listings and test accounts were created for this exercise. No production data or credentials were used.

The `properties` table has row-level security enabled. Its client permissions allow anonymous users to select rows and authenticated users to select, insert, and update rows. RLS policies determine which rows those operations can affect.

## Property policies

These policies are from the repository migrations. The admin policies were added in `20261026000100_admin_property_policies.sql`.

```sql
alter table public.properties enable row level security;

create policy "Public can read approved properties"
  on public.properties for select to anon, authenticated
  using (approved = true);

create policy "Owners can read their own properties"
  on public.properties for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners can create unapproved properties"
  on public.properties for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and approved = false
  );

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

create policy "Admins can read all properties"
  on public.properties for select to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );

create policy "Admins can update all properties"
  on public.properties for update to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );