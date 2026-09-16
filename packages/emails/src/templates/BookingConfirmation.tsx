import { Heading, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { bodyTextStyle, EmailDetails, headingStyle } from "./EmailDetails";
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
    <EmailShell eventLocation={props.location} eventName={props.eventName} logoUrl={props.logoUrl} preview={`Tu reunión con ${props.representativeName} está confirmada`} variant="food-service">
      <Heading style={headingStyle}>Tu reunión está confirmada</Heading>
      <Text style={bodyTextStyle}>Hola {props.clientName}, reservamos tu espacio para conversar con el equipo de Todo Carnes en Food &amp; Service 2026.</Text>
      <EmailDetails rows={[
        { label: "Área", value: props.area },
        { label: "Representante", value: props.representativeName },
        { label: "Fecha", value: props.dateLabel },
        { label: "Hora", value: props.timeLabel },
        { label: "Duración", value: `${props.durationMinutes} minutos` },
        { label: "Lugar / stand", value: props.location },
      ]} />
      <Text style={{ ...bodyTextStyle, color: colors.navy, fontWeight: 700, margin: "20px 0 0" }}>
        Adjuntamos el archivo .ics para que agregues la reunión a tu calendario.
      </Text>
    </EmailShell>
  );
}
