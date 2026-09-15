import { Heading, Hr, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { EmailShell } from "./EmailShell";

export type CourtesyConfirmationProps = {
  name: string;
  company: string;
  cargo: string;
  area: string;
  eventName: string;
  eventLocation: string;
  logoUrl?: string;
};

export function CourtesyConfirmation(props: CourtesyConfirmationProps) {
  return (
    <EmailShell logoUrl={props.logoUrl} preview={`Solicitud de cortesía recibida para ${props.eventName}`}>
      <Heading style={{ color: colors.navy, fontSize: 28 }}>Recibimos tu solicitud de entrada</Heading>
      <Text>Hola {props.name}, registramos tu solicitud de cortesía para {props.eventName}.</Text>
      <Hr style={{ borderColor: colors["blue-50"] }} />
      <Text><strong>Empresa:</strong> {props.company}</Text>
      <Text><strong>Cargo:</strong> {props.cargo}</Text>
      <Text><strong>Área de interés:</strong> {props.area}</Text>
      <Text><strong>Lugar:</strong> {props.eventLocation}</Text>
      <Text style={{ color: colors.ink }}>
        Esta confirmación registra tu solicitud. El equipo de Todo Carnes se pondrá en contacto contigo
        si necesita antecedentes adicionales.
      </Text>
    </EmailShell>
  );
}
