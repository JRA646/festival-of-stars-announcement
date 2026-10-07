-- First Love Night production event + RSVP flow
-- Creates a public-safe event read endpoint and a validated RSVP write endpoint.

create table if not exists public.first_love_night_announcements (
  event_id uuid primary key references public.events(id) on delete cascade,
  slug text not null unique,
  published_at timestamptz not null default now(),
  registration_enabled boolean not null default true,
  seo_title text not null,
  seo_description text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.first_love_night_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  confirmation_code text not null default (
    'FLN-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))
  ),
  full_name text not null,
  email text not null,
  mobile text,
  age_group text not null check (age_group in ('high_school','college')),
  guardian_name text,
  guardian_mobile text,
  guardian_consent boolean not null default false,
  guest_count smallint not null default 0 check (guest_count between 0 and 5),
  church_group text,
  dietary_requirements text not null default 'None',
  referral_source text,
  message text,
  consent boolean not null default false,
  status text not null default 'confirmed'
    check (status in ('registered','confirmed','cancelled','checked_in','no_show','waitlisted')),
  registered_at timestamptz not null default now(),
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint first_love_night_rsvp_name_ck
    check (char_length(trim(full_name)) between 2 and 120),
  constraint first_love_night_rsvp_email_ck
    check (char_length(trim(email)) between 5 and 254),
  constraint first_love_night_guardian_ck
    check (
      age_group <> 'high_school'
      or (
        char_length(trim(coalesce(guardian_name,''))) between 2 and 120
        and char_length(trim(coalesce(guardian_mobile,''))) between 7 and 30
        and guardian_consent = true
      )
    )
);

create unique index if not exists first_love_night_rsvp_event_email_uq
  on public.first_love_night_rsvps(event_id, lower(trim(email)));

create unique index if not exists first_love_night_rsvp_confirmation_uq
  on public.first_love_night_rsvps(confirmation_code);

create index if not exists first_love_night_rsvp_event_status_idx
  on public.first_love_night_rsvps(event_id, status, registered_at desc);

insert into public.events (
  name, description, start_at, end_at, location, event_type_id, is_active
)
select
  'First Love Night: The Formal',
  'A Christ-centred formal night for high school and college students to celebrate, connect and encounter Jesus.',
  '2026-11-14 00:00:00+08'::timestamptz,
  null,
  'TBA',
  et.id,
  true
from public.event_types et
where et.name = 'Youth'
  and not exists (
    select 1 from public.events e
    where lower(trim(e.name)) = lower('First Love Night: The Formal')
  )
limit 1;

insert into public.first_love_night_announcements (
  event_id, slug, published_at, registration_enabled, seo_title, seo_description, content
)
select
  e.id,
  'first-love-night',
  now(),
  true,
  'First Love Night · The Formal',
  'First Love Night: The Formal — a Christ-centred formal night for high school and college students in Manila, Philippines.',
  jsonb_build_object(
    'title','THE FORMAL',
    'subtitle','A Christ-Centred Formal Night',
    'audience','HIGH SCHOOL + COLLEGE STUDENTS',
    'date_label','14 NOVEMBER 2026',
    'weekday','SATURDAY',
    'time_label','TIME TBA',
    'venue_label','TBA',
    'city_label','MANILA, PHILIPPINES',
    'dress_code','Formal',
    'hero_image_url','/festival-assets/festival-moodboard.jpg',
    'vision_title','A Night to Celebrate, Connect and Encounter Jesus.',
    'vision_copy','A special formal night where young people can dress beautifully, have fun, build friendships and experience the love of Jesus.',
    'experience',jsonb_build_array(
      jsonb_build_object('title','ARRIVE','copy','Step into a real formal experience from the first moment.','icon','door'),
      jsonb_build_object('title','CELEBRATE','copy','Food, friendship, music and memories with your people.','icon','sparkles'),
      jsonb_build_object('title','ENCOUNTER','copy','Make room for a meaningful moment with Jesus.','icon','cross'),
      jsonb_build_object('title','CONNECT','copy','Leave with a clear next step into community.','icon','users')
    ),
    'timeline',jsonb_build_array(
      jsonb_build_object('time','TBA','title','Doors Open','copy','Arrive dressed up, check in and settle in.'),
      jsonb_build_object('time','TBA','title','Welcome + Photos','copy','Meet friends, take photos and experience the formal atmosphere.'),
      jsonb_build_object('time','TBA','title','Dinner + Celebration','copy','Enjoy food, music and the night's main celebration.'),
      jsonb_build_object('time','TBA','title','Encounter Jesus','copy','A meaningful worship and message moment centered on Jesus.'),
      jsonb_build_object('time','TBA','title','Connect','copy','End the night with friendship and your next step into community.')
    ),
    'dress_code_items',jsonb_build_array(
      jsonb_build_object('title','Formal Dresses','copy','Long dresses, cocktail dresses or elegant formalwear.'),
      jsonb_build_object('title','Suits + Formalwear','copy','Suit, blazer, dress shirt, trousers and formal shoes.'),
      jsonb_build_object('title','Keep It Elegant','copy','Choose polished, event-ready looks that help the night feel special.')
    ),
    'faqs',jsonb_build_array(
      jsonb_build_object('question','Who can attend?','answer','First Love Night is for high school and college students.'),
      jsonb_build_object('question','What should I wear?','answer','Formal attire. Detailed style guidance will be released closer to the event.'),
      jsonb_build_object('question','Do I need to RSVP?','answer','Yes. RSVP is required so the team can prepare for food, seating, check-in and the overall experience.'),
      jsonb_build_object('question','Can I bring friends?','answer','Absolutely. Invite your friends and RSVP them through the same flow.'),
      jsonb_build_object('question','Where is the venue?','answer','The venue is currently TBA in Manila, Philippines. Details will be updated here once confirmed.')
    )
  )
from public.events e
where lower(trim(e.name)) = lower('First Love Night: The Formal')
on conflict (event_id) do update set
  slug=excluded.slug,
  registration_enabled=excluded.registration_enabled,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  content=excluded.content,
  updated_at=now();

alter table public.first_love_night_announcements enable row level security;
alter table public.first_love_night_rsvps enable row level security;

drop policy if exists first_love_night_public_select on public.first_love_night_announcements;
create policy first_love_night_public_select
on public.first_love_night_announcements
for select to anon, authenticated
using (published_at is not null and published_at <= now());

drop policy if exists first_love_night_rsvp_manager_select on public.first_love_night_rsvps;
create policy first_love_night_rsvp_manager_select
on public.first_love_night_rsvps
for select to authenticated
using (
  has_permission('events.view')
  and exists (
    select 1
    from public.events e
    where e.id = first_love_night_rsvps.event_id
  )
);

drop policy if exists first_love_night_rsvp_manager_update on public.first_love_night_rsvps;
create policy first_love_night_rsvp_manager_update
on public.first_love_night_rsvps
for update to authenticated
using (has_permission('events.update'))
with check (has_permission('events.update'));

revoke all on public.first_love_night_announcements from anon, authenticated;
grant select on public.first_love_night_announcements to anon, authenticated;

revoke all on public.first_love_night_rsvps from anon, authenticated;
grant select on public.first_love_night_rsvps to authenticated;
grant update on public.first_love_night_rsvps to authenticated;

create or replace function public.get_public_first_love_night()
returns jsonb
language sql
security definer
set search_path=public
stable
as $$
  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id,
      'name', e.name,
      'description', e.description,
      'start_at', e.start_at,
      'end_at', e.end_at,
      'location', e.location
    ),
    'announcement', jsonb_build_object(
      'slug', a.slug,
      'published_at', a.published_at,
      'registration_enabled', a.registration_enabled,
      'seo_title', a.seo_title,
      'seo_description', a.seo_description,
      'content', a.content
    ),
    'registration_count', (
      select count(*)
      from public.first_love_night_rsvps r
      where r.event_id = e.id
        and r.status in ('registered','confirmed','checked_in')
    )
  )
  from public.first_love_night_announcements a
  join public.events e on e.id = a.event_id
  where a.slug = 'first-love-night'
    and a.published_at <= now()
    and e.is_active = true
  limit 1;
$$;

revoke all on function public.get_public_first_love_night() from public;
grant execute on function public.get_public_first_love_night() to anon, authenticated;

create or replace function public.submit_first_love_night_rsvp(
  p_full_name text,
  p_email text,
  p_mobile text,
  p_age_group text,
  p_guardian_name text,
  p_guardian_mobile text,
  p_guardian_consent boolean,
  p_guest_count smallint,
  p_church_group text,
  p_dietary_requirements text,
  p_referral_source text,
  p_message text,
  p_consent boolean,
  p_honeypot text default ''
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_event_id uuid;
  v_registration public.first_love_night_rsvps;
begin
  if coalesce(trim(p_honeypot),'') <> '' then
    raise exception using errcode='P0001', message='Unable to complete registration.';
  end if;

  if not p_consent then
    raise exception using errcode='P0001', message='Consent is required.';
  end if;

  if p_age_group not in ('high_school','college') then
    raise exception using errcode='P0001', message='Please select your age group.';
  end if;

  if p_guest_count is null or p_guest_count < 0 or p_guest_count > 5 then
    raise exception using errcode='P0001', message='Guest count is invalid.';
  end if;

  if p_age_group = 'high_school'
     and (
       not coalesce(p_guardian_consent,false)
       or char_length(trim(coalesce(p_guardian_name,''))) < 2
       or char_length(trim(coalesce(p_guardian_mobile,''))) < 7
     ) then
    raise exception using errcode='P0001', message='Parent or guardian consent is required for high school attendees.';
  end if;

  select e.id
    into v_event_id
  from public.first_love_night_announcements a
  join public.events e on e.id=a.event_id
  where a.slug='first-love-night'
    and a.registration_enabled=true
    and a.published_at <= now()
    and e.is_active=true
  limit 1;

  if v_event_id is null then
    raise exception using errcode='P0001', message='Registration is currently unavailable.';
  end if;

  insert into public.first_love_night_rsvps (
    event_id, full_name, email, mobile, age_group,
    guardian_name, guardian_mobile, guardian_consent,
    guest_count, church_group, dietary_requirements,
    referral_source, message, consent, status
  )
  values (
    v_event_id,
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_mobile,'')),''),
    p_age_group,
    nullif(trim(coalesce(p_guardian_name,'')),''),
    nullif(trim(coalesce(p_guardian_mobile,'')),''),
    coalesce(p_guardian_consent,false),
    p_guest_count,
    nullif(trim(coalesce(p_church_group,'')),''),
    coalesce(nullif(trim(coalesce(p_dietary_requirements,'')),''),'None'),
    nullif(trim(coalesce(p_referral_source,'')),''),
    nullif(trim(coalesce(p_message,'')),''),
    p_consent,
    'confirmed'
  )
  returning * into v_registration;

  return jsonb_build_object(
    'id', v_registration.id,
    'confirmation_code', v_registration.confirmation_code,
    'full_name', v_registration.full_name,
    'guest_count', v_registration.guest_count,
    'registered_at', v_registration.registered_at,
    'status', v_registration.status
  );
exception
  when unique_violation then
    raise exception using errcode='23505', message='This email is already registered for First Love Night.';
end;
$$;

revoke all on function public.submit_first_love_night_rsvp(
  text,text,text,text,text,text,boolean,smallint,text,text,text,text,boolean,text
) from public;

grant execute on function public.submit_first_love_night_rsvp(
  text,text,text,text,text,text,boolean,smallint,text,text,text,text,boolean,text
) to anon, authenticated;

notify pgrst,'reload schema';
