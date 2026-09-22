export type CourtesyRequestInput = {
  eventId: string;
  name: string;
  lastName: string;
  rut: string;
  company: string;
  cargo: string;
  email: string;
  phone: string;
  website: string;
};

export type CreateCourtesyRequestResult =
  | { ok: true; requestId: string; emailSent: boolean }
  | { ok: false; error: "invalid_data" | "server_error" };
