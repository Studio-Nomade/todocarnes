"use server";

import { headers } from "next/headers";
import { sendLeadAck, sendLeadNotification } from "@todocarnes/emails/senders";
import { areasLabel } from "@/lib/agenda/constants";
import { createAgendaAdminClient } from "@/lib/agenda/server";
import { firstForwardedIp, hashRequestIp, LANDING_RATE_LIMIT, LANDING_RATE_WINDOW_MS } from "@/lib/landing/security";
import type { LandingLeadInput, LandingLeadResult } from "@/lib/landing/types";
import { landingLeadSchema } from "@/lib/landing/validation";

export async function createLandingLead(input: LandingLeadInput): Promise<LandingLeadResult> {
  if (input.website) return { ok: true, leadId: "filtered", emailSent: true };
  const parsed = landingLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const requestHeaders = await headers();
    const ipHash = hashRequestIp(firstForwardedIp(requestHeaders.get("x-forwarded-for"), requestHeaders.get("x-real-ip")));
    const client = createAgendaAdminClient();
    if (ipHash) {
      const since = new Date(Date.now() - LANDING_RATE_WINDOW_MS).toISOString();
      const { count, error: countError } = await client.from("leads").select("id", { count: "exact", head: true }).eq("source", "landing").gte("created_at", since).contains("utm", { ip_hash: ipHash });
      if (countError) throw countError;
      if ((count ?? 0) >= LANDING_RATE_LIMIT) return { ok: false, error: "rate_limited" };
    }

    const areas = parsed.data.areas;
    // Todos los vendedores que cubren alguna de las áreas elegidas, en orden de publicación.
    const { data: reps, error: repError } = await client.from("profiles").select("id,name,contact_email").eq("role", "commercial").eq("status", "active").eq("is_public", true).overlaps("areas", areas).order("public_order", { ascending: true });
    if (repError) throw repError;
    const primaryRep = reps?.[0] ?? null;
    const { data: lead, error } = await client.from("leads").insert({ name: parsed.data.name, company: parsed.data.company || null, email: parsed.data.email, phone: parsed.data.phone, area: areas[0], areas, source: "landing", assigned_rep_id: primaryRep?.id ?? null, utm: { ip_hash: ipHash, submission_id: parsed.data.submissionId } }).select("id").single();
    if (error || !lead) throw error ?? new Error("Lead no creado");

    const emailLead = { name: parsed.data.name, company: parsed.data.company || null, email: parsed.data.email, phone: parsed.data.phone, area: areasLabel(areas) };
    const recipients = (reps ?? []).map((rep) => ({ name: rep.name, email: rep.contact_email }));
    const [ack, notification] = await Promise.all([
      sendLeadAck({ lead: emailLead, origin: "landing", rep: recipients[0] ?? null, ccReps: recipients.slice(1) }),
      sendLeadNotification({ lead: emailLead, origin: "landing", rep: recipients[0] ?? null }),
    ]);
    const emailSent = ack.ok && notification.ok;
    if (!emailSent) console.error("[landing] El lead se guardó, pero uno o más correos fallaron.", { leadId: lead.id });
    return { ok: true, leadId: lead.id, emailSent };
  } catch {
    console.error("[landing] No fue posible procesar el contacto.");
    return { ok: false, error: "server_error" };
  }
}
