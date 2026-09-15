import { sendLeadAck } from "../src/senders";

const recipient = process.env.RESEND_SMOKE_TO?.trim();
if (!recipient) throw new Error("Definí RESEND_SMOKE_TO para ejecutar el envío de humo.");

const result = await sendLeadAck({
  lead: {
    name: "Prueba Todo Carnes",
    email: recipient,
  },
});

if (!result.ok) throw new Error(result.error);
console.log(`Correo de humo enviado: ${result.id}`);
