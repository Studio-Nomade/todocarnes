import assert from "node:assert/strict";
import test from "node:test";
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
} from "./templates";

const commonContact = {
  area: "Food Service",
  company: "Ejemplo SpA",
  email: "camila@example.com",
  message: "Necesitamos abastecimiento mensual.",
  name: "Camila",
  phone: "+56 9 1234 5678",
  representativeName: "Víctor Andrades",
};

test("renderiza las ocho plantillas transaccionales con sus dos familias", async () => {
  const templates = await Promise.all([
    render(<BookingConfirmation area="Food Service" clientName="Camila" dateLabel="martes, 29 de septiembre de 2026" durationMinutes={30} eventName="Feria Food & Service 2026" location="Espacio Riesco · Stand 2-A100" representativeName="Víctor Andrades" timeLabel="11:00" />),
    render(<CourtesyConfirmation area="Food Service" cargo="Jefa de compras" company="Ejemplo SpA" eventLocation="Espacio Riesco · Stand 2-A100" eventName="Feria Food & Service 2026" name="Camila" />),
    render(<ContactAckAgenda area="Food Service" name="Camila" representativeName="Víctor Andrades" />),
    render(<ContactAckLanding area="Food Service" name="Camila" />),
    render(<BookingNotification {...commonContact} cameFrom="Invitación" cargo="Jefa de compras" dateLabel="martes, 29 de septiembre de 2026" durationMinutes={30} eventName="Feria Food & Service 2026" location="Espacio Riesco · Stand 2-A100" timeLabel="11:00" topics="Formatos y abastecimiento" />),
    render(<CourtesyNotification {...commonContact} cargo="Jefa de compras" eventLocation="Espacio Riesco · Stand 2-A100" eventName="Feria Food & Service 2026" />),
    render(<ContactNotifAgenda {...commonContact} />),
    render(<ContactNotifLanding {...commonContact} />),
  ]);

  assert.equal(templates.length, 8);
  for (const html of templates) {
    assert.match(html, /max-width:600px/);
    assert.match(html, /Montserrat, Arial, sans-serif/);
    assert.match(html, /Todo Carnes/);
  }
  assert.match(templates[0], /Todo Carnes \| Espacio Food Service/);
  assert.match(templates[0], /archivo \.ics/);
  assert.match(templates[1], /te contactaremos/);
  assert.match(templates[2], /desde la agenda/);
  assert.match(templates[3], /Equipo de Food Service/);
  assert.match(templates[4], /Cómo llegó/);
  assert.match(templates[5], /Teléfono/);
  assert.match(templates[6], /Agenda Food &amp; Service 2026/);
  assert.match(templates[7], /Landing Todo Carnes/);
});

test("las notificaciones internas muestran campos faltantes sin ocultarlos", async () => {
  const html = await render(<ContactNotifAgenda email="camila@example.com" name="Camila" />);
  assert.match(html, /Empresa/);
  assert.match(html, /No informado/);
  assert.match(html, /camila@example\.com/);
});
