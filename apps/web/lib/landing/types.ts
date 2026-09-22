import type { CommercialArea } from "@/lib/agenda/types";

export type LandingLeadInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  areas: CommercialArea[];
  website: string;
  submissionId: string;
};

export type LandingLeadResult =
  | { ok: true; leadId: string; emailSent: boolean }
  | { ok: false; error: "invalid_data" | "rate_limited" | "server_error" };
