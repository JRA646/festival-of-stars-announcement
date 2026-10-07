-- Expand event analytics for the First Love Night conversion funnel.

alter table public.festival_analytics_events
  drop constraint if exists festival_analytics_event_type_ck;

alter table public.festival_analytics_events
  add constraint festival_analytics_event_type_ck
  check (
    event_type = any (
      array[
        'page_view',
        'register_click',
        'register_submit',
        'rsvp_step',
        'calendar_click',
        'faq_open',
        'talent_view',
        'talent_select',
        'talent_submit',
        'share_click',
        'directions_click',
        'sound_toggle'
      ]
    )
  );
