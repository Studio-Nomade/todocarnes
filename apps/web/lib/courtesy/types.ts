import type { CommercialArea } from "@/lib/agenda/types";

export type CourtesyRequestInput = {
  eventId: string;
  name: string;
  company: string;
  cargo: string;
  email: string;
  phone: string;
  area: CommercialArea | "";
  website: string;
};

export type CreateCourtesyRequestResult =
  | { ok: true; requestId: string; emailSent: boolean }
  | { ok: false; error: "invalid_data" | "server_error" };
