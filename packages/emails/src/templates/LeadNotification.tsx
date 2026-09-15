import { Heading, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { EmailShell } from "./EmailShell";

export type LeadNotificationProps = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  message?: string | null;
  logoUrl?: string;
};

export function LeadNotification(props: LeadNotificationProps) {
  return (
    <EmailShell logoUrl={props.logoUrl} preview={`Nuevo contacto comercial: ${props.name}`}>
      <Heading style={{ color: colors.navy, fontSize: 28 }}>Nuevo contacto comercial</Heading>
      <Text><strong>Nombre:</strong> {props.name}</Text>
      {props.company ? <Text><strong>Empresa:</strong> {props.company}</Text> : null}
      <Text><strong>Correo:</strong> {props.email}</Text>
      {props.phone ? <Text><strong>Teléfono:</strong> {props.phone}</Text> : null}
      {props.area ? <Text><strong>Área:</strong> {props.area}</Text> : null}
      {props.message ? <Text><strong>Mensaje:</strong> {props.message}</Text> : null}
    </EmailShell>
  );
}
