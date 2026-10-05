export type PublicEvent = {
  id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  service_name: string | null;
};

export const FESTIVAL_SLUG = "festival-of-stars";
