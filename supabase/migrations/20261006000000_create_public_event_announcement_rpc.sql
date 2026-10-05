drop function if exists public.get_public_event_announcement(text);

create or replace function public.get_public_event_announcement(p_slug text)
returns table(
  id uuid, name text, description text, start_at timestamptz, end_at timestamptz,
  location text, event_type_name text, service_name varchar
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id,e.name,e.description,e.start_at,e.end_at,e.location,et.name as event_type_name,s.name as service_name
  from public.events e
  left join public.event_types et on et.id=e.event_type_id
  left join public.services s on s.id=e.service_id
  where e.is_active=true
    and (
      lower(regexp_replace(trim(e.name),'[^a-zA-Z0-9]+','-','g'))=lower(p_slug)
      or lower(regexp_replace(trim(e.name),'[^a-zA-Z0-9]+','-','g'))||'-'||left(e.id::text,8)=lower(p_slug)
    )
  limit 1;
$$;

revoke all on function public.get_public_event_announcement(text) from public;
grant execute on function public.get_public_event_announcement(text) to anon, authenticated;

notify pgrst, 'reload schema';