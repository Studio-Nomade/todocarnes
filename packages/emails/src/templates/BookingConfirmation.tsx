import { Heading, Hr, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { EmailShell } from "./EmailShell";

export type BookingConfirmationProps = {
  clientName: string;
  area?: string | null;
  representativeName: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  location: string;
  eventName: string;
  logoUrl?: string;
};

export function BookingConfirmation(props: BookingConfirmationProps) {
  return (
    <EmailShell logoUrl={props.logoUrl} preview={`Reunión confirmada con ${props.representativeName}`}>
      <Heading style={{ color: colors.navy, fontSize: 28 }}>Tu reunión está confirmada</Heading>
      <Text>Hola {props.clientName}, reservamos tu espacio para conversar con Todo Carnes.</Text>
      <Hr style={{ borderColor: colors["blue-50"] }} />
      <Text><strong>Evento:</strong> {props.eventName}</Text>
      <Text><strong>Representante:</strong> {props.representativeName}</Text>
      {props.area ? <Text><strong>Área:</strong> {props.area}</Text> : null}
      <Text><strong>Fecha:</strong> {props.dateLabel}</Text>
      <Text><strong>Hora:</strong> {props.timeLabel} ({props.durationMinutes} minutos)</Text>
      <Text><strong>Lugar:</strong> {props.location}</Text>
      <Text style={{ color: colors.ink }}>Adjuntamos una invitación para agregar la reunión a tu calendario.</Text>
    </EmailShell>
  );
}
