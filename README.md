# Festival of Stars Announcement

Production-style React + TypeScript + Vite event announcement for First Love Church Philippines.

## Routes

- `/festivalofstars` — public announcement
- `/festivalofstars/register` — public RSVP and creative showcase registration
- `/festivalofstars/register?talent=singing` — preselect singing
- `/festivalofstars/register?talent=rap` — preselect rap
- `/festivalofstars/register?talent=acting` — preselect acting

## Stack

- React 19 + TypeScript
- Vite
- Supabase (FLC project)
- Lucide icons

## Supabase

The site reads the published Festival of Stars announcement through:

`public.get_public_festival_of_stars(text)`

Public submission tables:

- `festival_registrations`
- `festival_talent_submissions`
- `festival_analytics_events`

Announcement content, publication state, SEO copy and feature content live in `festival_announcements.content`.

The event countdown is driven by `events.start_at` from FLC. Do not hardcode the event date in the frontend.

## Local development

```bash
git checkout main
git pull origin main
npm install
npm run dev
```

Build:

```bash
npm run build
```

The supplied Festival of Stars mood board is referenced from `public/festival-assets/festival-moodboard.jpg`. The AI hero artwork is stored locally at `public/images/ai-festival-singer.webp`.

Never put a Supabase service-role key in the browser.
