begin;

alter table public.sponsors
  add column if not exists tier text not null default 'Silver'
    check (tier in ('Platinum', 'Gold', 'Silver')),
  add column if not exists coverage_radius_miles numeric(6, 2) not null default 0
    check (coverage_radius_miles >= 0);

alter table public.property_sponsors
  add column if not exists distance_miles numeric(6, 2)
    check (distance_miles >= 0);

comment on column public.property_sponsors.distance_miles is
  'Approximate miles from this property to this sponsor, used for contextual matching.';

commit;