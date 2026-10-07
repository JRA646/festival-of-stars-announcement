-- First Love Night brand and copy refinement
-- Keeps the event identity consistent across the public API and the redesigned page.

update public.events
set
  description = 'First Love Night is a Christ-centred formal night for high school and college students — a generation gathered to celebrate, connect and encounter Jesus.',
  updated_at = now()
where lower(trim(name)) = lower('First Love Night: The Formal');

update public.first_love_night_announcements
set
  seo_title = 'First Love Night · The Formal',
  seo_description = 'First Love Night: The Formal — a Christ-centred night for the next generation to celebrate friendship, make memories and encounter Jesus.',
  content = content || jsonb_build_object(
    'title', 'FIRST LOVE NIGHT',
    'subtitle', 'THE FORMAL',
    'tagline', 'A Christ-Centred Night for the Next Generation',
    'audience', 'HIGH SCHOOL + COLLEGE STUDENTS',
    'venue_label', 'VENUE TO BE ANNOUNCED',
    'time_label', 'TIME TO BE ANNOUNCED',
    'vision_title', 'First Love Night is more than a formal.',
    'vision_copy', 'A special night where young people can dress beautifully, have fun, build friendships and experience the love of Jesus. Come dressed, come expectant, and make room for an encounter that goes deeper than the event itself.'
  ),
  updated_at = now()
where slug = 'first-love-night';
