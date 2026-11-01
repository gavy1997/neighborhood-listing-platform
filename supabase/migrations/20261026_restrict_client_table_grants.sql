-- Remove unnecessary client privileges from the existing tables.
revoke all on table
  public.profiles,
  public.properties,
  public.sponsors,
  public.property_sponsors,
  public.inquiries
from anon, authenticated;

-- Restore only the client operations the app needs.
grant select on table public.properties to anon, authenticated;
grant insert, update on table public.properties to authenticated;

grant select on table public.sponsors to anon, authenticated;
grant insert, update on table public.sponsors to authenticated;

grant select on table public.property_sponsors to anon, authenticated;
grant insert, delete on table public.property_sponsors to authenticated;

grant select, insert on table public.inquiries to authenticated;
grant select, insert on table public.profiles to authenticated;

-- Keep future tables in this schema from automatically receiving client grants.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;