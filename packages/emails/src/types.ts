export type ContactPerson = {
  name: string;
  email: string;
};

export type BookingEmailData = {
  name: string;
  company?: string | null;
  email: string;
  area?: string | null;
  topics?: string | null;
  icsUid: string;
  start: Date;
};

export type BookingRepresentative = ContactPerson;

export type BookingEventData = {
  name: string;
  location: string;
  slotMinutes: number;
  timezone?: string;
};

export type CourtesyEmailData = {
  name: string;
  company: string;
  cargo: string;
  email: string;
  area: string;
};

export type LeadEmailData = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  message?: string | null;
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
