import { Resend, type Attachment } from "resend";
import { buildIcs } from "./ics";
import { EMAIL_LOGO_BASE64, EMAIL_LOGO_FILENAME } from "./logo";
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
  internalTo: string[];
  logoUrl: string;
};

/** Convierte "a@x.cl, b@y.cl; c@z.cl" en una lista limpia y sin duplicados. */
export function parseEmailList(value: string | null | undefined): string[] {
  if (!value) return [];
  const emails = value.split(/[,;\s]+/).map((item) => item.trim().toLowerCase()).filter((item) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(item));
  return [...new Set(emails)];
}

/** Emails de vendedores para CC: sin vacíos, sin duplicados y sin repetir al destinatario principal. */
export function representativeCc(reps: (BookingRepresentative | null | undefined)[], exclude?: string): string[] {
  const skip = exclude?.trim().toLowerCase();
  const emails = reps.map((rep) => rep?.email?.trim().toLowerCase()).filter((email): email is string => Boolean(email) && email !== skip);
  return [...new Set(emails)];
}

const EMAIL_LOGO_CONTENT_ID = "todo-carnes-logo";
const EMAIL_LOGO_URL = `cid:${EMAIL_LOGO_CONTENT_ID}`;

/**
 * El logo va incrustado en base64 (ver ./logo.ts). No se lee del disco: el bundler reescribe
 * `new URL(..., import.meta.url)` a una ruta web, así que `readFile` fallaba en producción y tiraba
 * el envío antes de llegar a Resend.
 */
function emailLogoAttachment(): Attachment {
  return {
    content: EMAIL_LOGO_BASE64,
    contentId: EMAIL_LOGO_CONTENT_ID,
    contentType: "image/png",
    filename: EMAIL_LOGO_FILENAME,
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
    internalTo: parseEmailList(process.env.EMAIL_INTERNAL_TO),
    logoUrl: EMAIL_LOGO_URL,
  };
}

/** Conserva el motivo real: Resend devuelve un objeto `{ name, message }`, no un Error. */
function failed(error: unknown): SendResult {
  if (error instanceof Error) return { ok: false, error: error.message };
  if (error && typeof error === "object") {
    const { name, message } = error as { name?: unknown; message?: unknown };
    const detail = [name, message].filter((part): part is string => typeof part === "string" && part.length > 0).join(": ");
    if (detail) return { ok: false, error: detail };
  }
  return { ok: false, error: "No fue posible enviar el correo." };
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

function internalRecipient(config: EmailConfig): string[] | SendResult {
  return config.internalTo.length ? config.internalTo : { ok: false, error: "Falta configurar EMAIL_INTERNAL_TO." };
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
        emailLogoAttachment(),
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
  if (!Array.isArray(to)) return to;

  try {
    const labels = dateParts(booking.start, event.timezone ?? "America/Santiago");
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      replyTo: booking.email,
      subject: `Nueva reunión — ${booking.name} — ${booking.area ?? "Sin área"}`,
      attachments: [emailLogoAttachment()],
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
      attachments: [emailLogoAttachment()],
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
  if (!Array.isArray(to)) return to;

  try {
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      replyTo: request.email,
      subject: `Nueva solicitud de cortesía — ${request.name} — ${request.area}`,
      attachments: [emailLogoAttachment()],
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

export async function sendLeadAck({ lead, origin, rep, ccReps = [] }: {
  lead: LeadEmailData;
  origin: EmailContactOrigin;
  /** Vendedor principal (reply-to y nombre en la plantilla). */
  rep?: BookingRepresentative | null;
  /** Vendedores adicionales en copia (ej. todas las áreas elegidas en el landing). */
  ccReps?: (BookingRepresentative | null)[];
}): Promise<SendResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, error: "Falta configurar RESEND_API_KEY o EMAIL_FROM." };

  try {
    const agenda = origin === "agenda_contact";
    const cc = representativeCc([rep, ...ccReps], lead.email);
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: lead.email,
      cc: cc.length ? cc : undefined,
      replyTo: config.replyTo ?? rep?.email,
      subject: agenda
        ? "Recibimos tu solicitud de contacto — Todo Carnes"
        : "Recibimos tu mensaje — Todo Carnes",
      attachments: [emailLogoAttachment()],
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
  if (!Array.isArray(to)) return to;

  try {
    const agenda = origin === "agenda_contact";
    const response = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to,
      replyTo: lead.email,
      subject: `${agenda ? "Contacto agenda" : "Contacto landing"} — ${lead.name} — ${lead.area ?? "Sin área"}`,
      attachments: [emailLogoAttachment()],
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
