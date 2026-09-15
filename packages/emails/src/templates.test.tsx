import assert from "node:assert/strict";
import test from "node:test";
import { render } from "@react-email/render";
import { BookingConfirmation, LeadAck, LeadNotification } from "./templates";

test("renderiza las tres plantillas transaccionales", async () => {
  const booking = await render(
    <BookingConfirmation
      clientName="Camila"
      dateLabel="martes, 29 de septiembre de 2026"
      durationMinutes={30}
      eventName="Feria Food & Service 2026"
      location="Stand Todo Carnes"
      representativeName="Sebastián"
      timeLabel="11:00"
    />,
  );
  const ack = await render(<LeadAck name="Camila" />);
  const notification = await render(
    <LeadNotification email="camila@example.com" name="Camila" area="Food Service" />,
  );

  assert.match(booking, /Tu reunión está confirmada/);
  assert.match(booking, /11:00/);
  assert.match(ack, /Gracias por contactarnos/);
  assert.match(notification, /Nuevo contacto comercial/);
  assert.match(notification, /camila@example\.com/);
});
