import { Resend } from "resend";
import { buildIcs } from "./ics";
import { BookingConfirmation, CourtesyConfirmation, LeadAck, LeadNotification } from "./templates";
import type {
  BookingEmailData,
  BookingEventData,
  BookingRepresentative,
  CourtesyEmailData,
  LeadEmailData,
  SendResult,
} from "./types";

if (typeof window !== "undefined") {
  throw new Error("@todocarnes/emails/senders solo puede importarse desde el servidor.");
}

export async function sendCourtesyConfirmation({
  request,
  event,
}: {
  request: CourtesyEmailData;
  event: { name: string; location: string };
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const resend = new Resend(config.apiKey);
    const response = await resend.emails.send({
      from: config.from,
      to: request.email,
      replyTo: config.replyTo,
      subject: "Recibimos tu solicitud de entrada — Todo Carnes",
      react: (
        <CourtesyConfirmation
          {...request}
          eventLocation={event.location}
          eventName={event.name}
          logoUrl={config.logoUrl}
        />
      ),
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

type EmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
  logoUrl: string;
};

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://todocarnes.cl";
  return {
    apiKey,
    from,
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    logoUrl: `${siteUrl}/brand/logo-completo-horizontal.webp`,
  };
}

function failed(error: unknown): SendResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "No fue posible enviar el correo.",
  };
}

function dateParts(start: Date, timezone: string) {
  return {
    dateLabel: new Intl.DateTimeFormat("es-CL", {
      dateStyle: "full",
      timeZone: timezone,
    }).format(start),
    timeLabel: new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(start),
  };
}

export async function sendBookingConfirmation({
  booking,
  rep,
  event,
}: {
  booking: BookingEmailData;
  rep: BookingRepresentative;
  event: BookingEventData;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const timezone = event.timezone ?? "America/Santiago";
    const labels = dateParts(booking.start, timezone);
    const calendar = buildIcs({
      uid: booking.icsUid,
      title: `Reunión Todo Carnes — ${event.name}`,
      description: booking.topics ?? `Reunión comercial del área ${booking.area ?? "Todo Carnes"}.`,
      location: event.location,
      start: booking.start,
      durationMinutes: event.slotMinutes,
      organizer: rep,
      attendee: { name: booking.name, email: booking.email },
      timezone,
    });
    const resend = new Resend(config.apiKey);
    const response = await resend.emails.send({
      from: config.from,
      to: booking.email,
      cc: rep.email,
      replyTo: config.replyTo ?? rep.email,
      subject: "Tu reunión con Todo Carnes está confirmada",
      react: (
        <BookingConfirmation
          area={booking.area}
          clientName={booking.name}
          dateLabel={labels.dateLabel}
          durationMinutes={event.slotMinutes}
          eventName={event.name}
          location={event.location}
          logoUrl={config.logoUrl}
          representativeName={rep.name}
          timeLabel={labels.timeLabel}
        />
      ),
      attachments: [
        {
          content: Buffer.from(calendar, "utf8").toString("base64"),
          filename: "reunion-todo-carnes.ics",
        },
      ],
    });

    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

export async function sendLeadAck({ lead }: { lead: LeadEmailData }): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const resend = new Resend(config.apiKey);
    const response = await resend.emails.send({
      from: config.from,
      to: lead.email,
      replyTo: config.replyTo,
      subject: "Recibimos tu contacto — Todo Carnes",
      react: <LeadAck logoUrl={config.logoUrl} name={lead.name} />,
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

export async function sendLeadNotification({
  lead,
  rep,
}: {
  lead: LeadEmailData;
  rep?: BookingRepresentative | null;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };
  const recipient = rep?.email ?? config.replyTo;
  if (!recipient) return { ok: false, error: "Falta un vendedor o EMAIL_REPLY_TO de respaldo." };

  try {
    const resend = new Resend(config.apiKey);
    const response = await resend.emails.send({
      from: config.from,
      to: recipient,
      replyTo: lead.email,
      subject: `Nuevo contacto comercial — ${lead.name}`,
      react: <LeadNotification {...lead} logoUrl={config.logoUrl} />,
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}
