import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { render } from "@react-email/render";
import {
  BookingConfirmation,
  BookingNotification,
  ContactAckAgenda,
  ContactAckLanding,
  ContactNotifAgenda,
  ContactNotifLanding,
  CourtesyConfirmation,
  CourtesyNotification,
} from "../src/templates";

const outputDirectory = fileURLToPath(new URL("../previews/", import.meta.url));
const logoUrl = "../assets/logo-blanco.png";
const contact = {
  area: "Food Service",
  company: "Ejemplo SpA",
  email: "camila@example.com",
  message: "Necesitamos evaluar formatos y abastecimiento mensual.",
  name: "Camila Rojas",
  phone: "+56 9 1234 5678",
  representativeName: "Víctor Andrades",
};
const event = {
  eventLocation: "Espacio Riesco · Hall 2 · Stand 2-A100",
  eventName: "Feria Food & Service 2026",
};

const previews = [
  ["01-booking-confirmation.html", <BookingConfirmation area={contact.area} clientName={contact.name} dateLabel="martes, 29 de septiembre de 2026" durationMinutes={30} eventName={event.eventName} location={event.eventLocation} logoUrl={logoUrl} representativeName={contact.representativeName} timeLabel="11:00" />],
  ["02-courtesy-confirmation.html", <CourtesyConfirmation area={contact.area} cargo="Jefa de compras" company={contact.company} eventLocation={event.eventLocation} eventName={event.eventName} logoUrl={logoUrl} name={contact.name} />],
  ["03-contact-ack-agenda.html", <ContactAckAgenda area={contact.area} logoUrl={logoUrl} name={contact.name} representativeName={contact.representativeName} />],
  ["04-contact-ack-landing.html", <ContactAckLanding area={contact.area} logoUrl={logoUrl} name={contact.name} />],
  ["05-booking-notification.html", <BookingNotification {...contact} cameFrom="Invitación comercial" cargo="Jefa de compras" dateLabel="martes, 29 de septiembre de 2026" durationMinutes={30} eventName={event.eventName} location={event.eventLocation} logoUrl={logoUrl} timeLabel="11:00" topics="Formatos, abastecimiento y desarrollo" />],
  ["06-courtesy-notification.html", <CourtesyNotification {...contact} cargo="Jefa de compras" eventLocation={event.eventLocation} eventName={event.eventName} logoUrl={logoUrl} />],
  ["07-contact-notif-agenda.html", <ContactNotifAgenda {...contact} logoUrl={logoUrl} />],
  ["08-contact-notif-landing.html", <ContactNotifLanding {...contact} logoUrl={logoUrl} />],
] as const;

await mkdir(outputDirectory, { recursive: true });
for (const [filename, template] of previews) {
  await writeFile(`${outputDirectory}${filename}`, await render(template, { pretty: true }), "utf8");
}

console.log(`Generados ${previews.length} previews en ${outputDirectory}`);
