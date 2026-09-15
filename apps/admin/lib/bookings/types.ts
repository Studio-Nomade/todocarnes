import type { BookingStatus } from "./constants";

export type BookingEvent = {
  days: string[];
  id: string;
  location: string | null;
  name: string;
  slotMinutes: number;
  slotTimes: string[];
};

export type BookingItem = {
  cameFrom: string | null;
  cargo: string | null;
  company: string | null;
  createdAt: string;
  day: string;
  email: string;
  id: string;
  name: string;
  phone: string | null;
  repId: string;
  repName: string;
  slotTime: string;
  status: BookingStatus;
  topics: string | null;
};

export type BookingAgenda = {
  bookings: BookingItem[];
  event: BookingEvent;
  selectedDay?: string;
  selectedRepId?: string;
};

export type BookingMutationState = { error?: string; success: boolean };
