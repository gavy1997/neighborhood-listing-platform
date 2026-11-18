begin;

create table if not exists public.sponsor_impressions (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  placement text not null,
  page_context text not null
    check (page_context in ('home', 'property_detail', 'services')),
  created_at timestamptz not null default now()
);

alter table public.sponsor_impressions enable row level security;

create index if not exists sponsor_impressions_sponsor_created_idx
  on public.sponsor_impressions (sponsor_id, created_at desc);

create or replace function public.record_sponsor_impression(
  p_sponsor_id uuid,
  p_placement text,
  p_page_context text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_page_context is null
     or p_page_context not in ('home', 'property_detail', 'services') then
    raise exception 'Invalid page context.';
  end if;

  update public.sponsors
  set impression_count = coalesce(impression_count, 0) + 1
  where id = p_sponsor_id
    and status = 'APPROVED'
    and is_active = true
    and active = true
    and approved = true
    and placement = p_placement
    and current_date between start_date and end_date;

  if not found then
    raise exception 'Sponsor is not eligible.';
  end if;

  insert into public.sponsor_impressions (
    sponsor_id,
    placement,
    page_context
  )
  values (
    p_sponsor_id,
    p_placement,
    p_page_context
  );
end;
$$;

revoke all on public.sponsor_impressions from anon, authenticated;
revoke all on function public.record_sponsor_impression(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.record_sponsor_impression(uuid, text, text)
  to service_role;

commit;