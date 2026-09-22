export type ContactPerson = {
  name: string;
  email: string;
};

export type BookingEmailData = {
  name: string;
  company?: string | null;
  cargo?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  topics?: string | null;
  cameFrom?: string | null;
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
  lastName: string;
  rut: string;
  company: string;
  cargo: string;
  email: string;
  phone: string;
};

export type LeadEmailData = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  message?: string | null;
};

export type EmailContactOrigin = "agenda_contact" | "landing";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
