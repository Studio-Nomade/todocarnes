"use server";

import { sendLeadAck, sendLeadNotification } from "@todocarnes/emails/senders";
import { createAgendaAdminClient } from "@/lib/agenda/server";
import { areasLabel } from "@/lib/agenda/constants";
import type { AgendaLeadFormState, CreateAgendaLeadResult } from "@/lib/agenda/types";
import { agendaLeadInputSchema } from "@/lib/agenda/validation";

export async function createAgendaLead(input: AgendaLeadFormState & { repId: string }): Promise<CreateAgendaLeadResult> {
  const parsed = agendaLeadInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_data" };

  try {
    const client = createAgendaAdminClient();
    const repResult = parsed.data.repId
      ? await client
          .from("profiles")
          .select("id,name,area,areas,contact_email")
          .eq("id", parsed.data.repId)
          .eq("role", "commercial")
          .eq("is_public", true)
          .eq("status", "active")
          .maybeSingle()
      : { data: null, error: null };

    if (parsed.data.repId && (repResult.error || !repResult.data)) {
      return { ok: false, error: "invalid_data" };
    }

    const rep = repResult.data;
    const { data: lead, error } = await client
      .from("leads")
      .insert({
        name: parsed.data.name,
        company: parsed.data.company || null,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message || null,
        source: "agenda_contact",
        assigned_rep_id: rep?.id ?? null,
        area: rep?.area ?? null,
        areas: rep?.areas ?? [],
      })
      .select("id")
      .single();

    if (error || !lead) {
      console.error("[agenda] No fue posible guardar el contacto directo.");
      return { ok: false, error: "server_error" };
    }

    const emailLead = {
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email,
      phone: parsed.data.phone,
      area: rep ? areasLabel(rep.areas, rep.area) : null,
      message: parsed.data.message || null,
    };
    const emailRep = rep ? { name: rep.name, email: rep.contact_email } : null;
    const [ack, notification] = await Promise.all([
      sendLeadAck({ lead: emailLead, origin: "agenda_contact", rep: emailRep }),
      sendLeadNotification({
        lead: emailLead,
        origin: "agenda_contact",
        rep: emailRep,
      }),
    ]);
    const emailSent = ack.ok && notification.ok;
    if (!emailSent) console.error("[agenda] El lead se guardó, pero uno o más correos fallaron.", { leadId: lead.id, acuse: ack.ok ? "ok" : ack.error, interno: notification.ok ? "ok" : notification.error });

    return { ok: true, leadId: lead.id, emailSent };
  } catch {
    console.error("[agenda] Error inesperado al guardar el contacto directo.");
    return { ok: false, error: "server_error" };
  }
}
