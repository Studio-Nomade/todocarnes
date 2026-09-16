import { readFile } from "node:fs/promises";
import { Resend, type Attachment } from "resend";
import { buildIcs } from "./ics";
import {
  BookingConfirmation,
  BookingNotification,
  ContactAckAgenda,
  ContactAckLanding,
  ContactNotifAgenda,
  ContactNotifLanding,
  CourtesyConfirmation,
  CourtesyNotification,
} from "./templates";
import type {
  BookingEmailData,
  BookingEventData,
  BookingRepresentative,
  CourtesyEmailData,
  EmailContactOrigin,
  LeadEmailData,
  SendResult,
} from "./types";

if (typeof window !== "undefined") {
  throw new Error("@todocarnes/emails/senders solo puede importarse desde el servidor.");
}

type EmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
  internalTo?: string;
  logoUrl: string;
};

const EMAIL_LOGO_CONTENT_ID = "todo-carnes-logo";
const EMAIL_LOGO_URL = `cid:${EMAIL_LOGO_CONTENT_ID}`;
let logoContentPromise: Promise<string> | undefined;

async function emailLogoAttachment(): Promise<Attachment> {
  logoContentPromise ??= readFile(new URL("../assets/logo-blanco.png", import.meta.url))
    .then((content) => content.toString("base64"));
  return {
    content: await logoContentPromise,
    contentId: EMAIL_LOGO_CONTENT_ID,
    contentType: "image/png",
    filename: "todo-carnes-logo-blanco.png",
  };
}

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    internalTo: process.env.EMAIL_INTERNAL_TO?.trim() || undefined,
    logoUrl: EMAIL_LOGO_URL,
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
    dateLabel: new Intl.DateTimeFormat("es-CL", { dateStyle: "full", timeZone: timezone }).format(start),
    timeLabel: new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(start),
  };
}

function internalRecipient(config: EmailConfig): string | SendResult {
  return config.internalTo ?? { ok: false, error: "Falta configurar EMAIL_INTERNAL_TO." };
}

export async function sendBookingConfirmation({ booking, rep, event }: {
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
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: booking.email,
      cc: rep.email,
      replyTo: config.replyTo ?? rep.email,
      subject: "Tu reunión en Food & Service 2026 está confirmada",
      react: (
        <BookingConfirmation
          area={booking.area}
          clientName={booking.name}
          dateLabel={labels.dateLabel}
          durationMinutes={event.slotMinutes}
          eventName={event.name}
          location={event.location || "Espacio por confirmar"}
          logoUrl={config.logoUrl}
          representativeName={rep.name}
          timeLabel={labels.timeLabel}
        />
      ),
      attachments: [
        await emailLogoAttachment(),
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

export async function sendBookingNotification({ booking, rep, event }: {
  booking: BookingEmailData;
  rep?: BookingRepresentative | null;
  event: BookingEventData;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };
  const to = internalRecipient(config);
  if (typeof to !== "string") return to;

  try {
    const labels = dateParts(booking.start, event.timezone ?? "America/Santiago");
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      cc: rep?.email || undefined,
      replyTo: booking.email,
      subject: `Nueva reunión — ${booking.name} — ${booking.area ?? "Sin área"}`,
      attachments: [await emailLogoAttachment()],
      react: (
        <BookingNotification
          {...booking}
          dateLabel={labels.dateLabel}
          durationMinutes={event.slotMinutes}
          eventName={event.name}
          location={event.location || "Espacio por confirmar"}
          logoUrl={config.logoUrl}
          representativeName={rep?.name}
          timeLabel={labels.timeLabel}
        />
      ),
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

export async function sendCourtesyConfirmation({ request, event }: {
  request: CourtesyEmailData;
  event: { name: string; location: string };
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: request.email,
      replyTo: config.replyTo,
      subject: "Recibimos tu solicitud de entrada — Food & Service 2026",
      attachments: [await emailLogoAttachment()],
      react: (
        <CourtesyConfirmation
          {...request}
          eventLocation={event.location || "Espacio por confirmar"}
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

export async function sendCourtesyNotification({ request, event, rep }: {
  request: CourtesyEmailData;
  event: { name: string; location: string };
  rep?: BookingRepresentative | null;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };
  const to = internalRecipient(config);
  if (typeof to !== "string") return to;

  try {
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      cc: rep?.email || undefined,
      replyTo: request.email,
      subject: `Nueva solicitud de cortesía — ${request.name} — ${request.area}`,
      attachments: [await emailLogoAttachment()],
      react: (
        <CourtesyNotification
          {...request}
          eventLocation={event.location || "Espacio por confirmar"}
          eventName={event.name}
          logoUrl={config.logoUrl}
          representativeName={rep?.name}
        />
      ),
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

export async function sendLeadAck({ lead, origin, rep }: {
  lead: LeadEmailData;
  origin: EmailContactOrigin;
  rep?: BookingRepresentative | null;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const agenda = origin === "agenda_contact";
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: lead.email,
      replyTo: config.replyTo ?? rep?.email,
      subject: agenda
        ? "Recibimos tu solicitud de contacto — Todo Carnes"
        : "Recibimos tu mensaje — Todo Carnes",
      attachments: [await emailLogoAttachment()],
      react: agenda ? (
        <ContactAckAgenda area={lead.area} logoUrl={config.logoUrl} name={lead.name} representativeName={rep?.name} />
      ) : (
        <ContactAckLanding area={lead.area} logoUrl={config.logoUrl} name={lead.name} />
      ),
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}

export async function sendLeadNotification({ lead, origin, rep }: {
  lead: LeadEmailData;
  origin: EmailContactOrigin;
  rep?: BookingRepresentative | null;
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };
  const to = internalRecipient(config);
  if (typeof to !== "string") return to;

  try {
    const agenda = origin === "agenda_contact";
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      cc: rep?.email || undefined,
      replyTo: lead.email,
      subject: `${agenda ? "Contacto agenda" : "Contacto landing"} — ${lead.name} — ${lead.area ?? "Sin área"}`,
      attachments: [await emailLogoAttachment()],
      react: agenda ? (
        <ContactNotifAgenda {...lead} logoUrl={config.logoUrl} representativeName={rep?.name} />
      ) : (
        <ContactNotifLanding {...lead} logoUrl={config.logoUrl} representativeName={rep?.name} />
      ),
    });
    if (response.error || !response.data?.id) return failed(response.error);
    return { ok: true, id: response.data.id };
  } catch (error) {
    return failed(error);
  }
}
