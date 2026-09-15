import type { Database } from "@todocarnes/db";

export type CommercialArea = Database["public"]["Enums"]["area_comercial"];
export type ContactOrigin = Database["public"]["Enums"]["contact_origin"];

export type PublicRepresentative = {
  id: string;
  name: string;
  area: CommercialArea | null;
  areaLabel: string;
  photoUrl: string | null;
  whatsapp: string | null;
  bio: string;
  isPlaceholder: boolean;
};

export type AgendaEvent = {
  id: string;
  name: string;
  location: string;
  days: string[];
  slotTimes: string[];
  slotMinutes: number;
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
};

export type CreateBookingInput = BookingFormState & {
  eventId: string;
  repId: string;
  day: string;
  slotTime: string;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: "invalid_data" | "invalid_selection" | "slot_taken" | "server_error" };
