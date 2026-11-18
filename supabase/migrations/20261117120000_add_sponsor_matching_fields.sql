begin;

alter table public.sponsors
  add column if not exists status text,
  add column if not exists is_active boolean,
  add column if not exists placement text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists target_zip_codes text[],
  add column if not exists priority integer,
  add column if not exists impression_count integer,
  add column if not exists destination_url text;

update public.sponsors s
set
  status = coalesce(s.status, case when s.approved then 'APPROVED' else 'PENDING' end),
  is_active = coalesce(s.is_active, s.active, false),
  placement = coalesce(s.placement, 'sidebar'),
  start_date = coalesce(s.start_date, current_date),
  end_date = coalesce(s.end_date, (current_date + interval '1 year')::date),
  target_zip_codes = coalesce(
    s.target_zip_codes,
    array(
      select distinct p.zip_code
      from public.property_sponsors ps
      join public.properties p on p.id = ps.property_id
      where ps.sponsor_id = s.id
        and p.zip_code is not null
    )
  ),
  priority = coalesce(s.priority, 0),
  impression_count = coalesce(s.impression_count, 0),
  destination_url = coalesce(s.destination_url, s.website_url);

alter table public.sponsors
  alter column status set default 'PENDING',
  alter column status set not null,
  alter column is_active set default false,
  alter column is_active set not null,
  alter column placement set default 'sidebar',
  alter column placement set not null,
  alter column start_date set default current_date,
  alter column start_date set not null,
  alter column end_date set default ((current_date + interval '1 year')::date),
  alter column end_date set not null,
  alter column target_zip_codes set default '{}',
  alter column target_zip_codes set not null,
  alter column priority set default 0,
  alter column priority set not null,
  alter column impression_count set default 0,
  alter column impression_count set not null;

create index if not exists sponsors_target_zip_codes_gin
  on public.sponsors using gin (target_zip_codes);

create index if not exists property_sponsors_property_sponsor_idx
  on public.property_sponsors (property_id, sponsor_id);

commit;