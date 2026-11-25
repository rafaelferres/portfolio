/** The conversion funnel tracked on the site. */
export const FUNNEL_EVENTS = [
  "agent_open",
  "agent_message",
  "brief_created",
  "lead_sent",
  "booking_open",
  "booking_slot_selected",
  "booking_confirmed",
  "contact_form_sent",
  "cv_download",
] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];
