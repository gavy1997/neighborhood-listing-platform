-- Admin access is assigned through the trusted profiles.role field.
-- Client users cannot set this role themselves: profile inserts are restricted
-- to property_professional, and clients have no profile update grant or policy.

create policy "Admins can read all properties"
  on public.properties
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );

create policy "Admins can update all properties"
  on public.properties
  for update
  to authenticated
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