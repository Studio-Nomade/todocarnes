import type { Database } from "@todocarnes/db";

export type CommercialArea = Database["public"]["Enums"]["area_comercial"];
export type ContactOrigin = Database["public"]["Enums"]["contact_origin"];
export type BookingModality = "videollamada" | "oficina" | "visita";

export type PublicRepresentative = {
  id: string;
  name: string;
  area: CommercialArea | null;
  areas: CommercialArea[];
  areaLabel: string;
  photoUrl: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  bio: string;
};

/** Lo que consume la sección de agenda: los días ya vienen calculados para la ventana vigente. */
export type AgendaEvent = {
  id: string;
  name: string;
  location: string;
  days: string[];
  slotTimes: string[];
  slotMinutes: number;
};

export type PermanentAgendaEvent = Omit<AgendaEvent, "days"> & {
  blackoutDates: string[];
  days: null;
  horizonDays: number;
  kind: "permanent";
  minNoticeHours: number;
  weekdays: number[];
};

export type AgendaSlot = {
  day: string;
  slotTime: string;
  taken: boolean;
};

export type AgendaPageData = {
  event: AgendaEvent;
  representatives: PublicRepresentative[];
  configured: boolean;
  notice?: string;
};

export type BookingFormState = {
  name: string;
  company: string;
  cargo: string;
  email: string;
  phone: string;
  topics: string;
  cameFrom: ContactOrigin | "";
  modality: BookingModality | "";
  locationDetail: string;
};

export type CreateBookingInput = BookingFormState & {
  eventId: string;
  repId: string;
  day: string;
  slotTime: string;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string; emailSent: boolean }
  | { ok: false; error: "invalid_data" | "invalid_selection" | "slot_taken" | "server_error" };
