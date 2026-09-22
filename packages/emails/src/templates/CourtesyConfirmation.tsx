import { Heading, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { bodyTextStyle, EmailDetails, headingStyle } from "./EmailDetails";
import { EmailShell } from "./EmailShell";

export type CourtesyConfirmationProps = {
  name: string;
  lastName: string;
  rut: string;
  company: string;
  cargo: string;
  eventName: string;
  eventLocation: string;
  logoUrl?: string;
};

export function CourtesyConfirmation(props: CourtesyConfirmationProps) {
  return (
    <EmailShell eventLocation={props.eventLocation} eventName={props.eventName} logoUrl={props.logoUrl} preview={`Recibimos tu solicitud de entrada para ${props.eventName}`} variant="food-service">
      <Heading style={headingStyle}>Recibimos tu solicitud de entrada</Heading>
      <Text style={bodyTextStyle}>Hola {props.name}, registramos tu solicitud de cortesía para Food &amp; Service 2026.</Text>
      <EmailDetails rows={[
        { label: "Nombre", value: `${props.name} ${props.lastName}`.trim() },
        { label: "RUT", value: props.rut },
        { label: "Empresa", value: props.company },
        { label: "Cargo", value: props.cargo },
        { label: "Lugar / stand", value: props.eventLocation },
      ]} />
      <Text style={{ ...bodyTextStyle, color: colors.navy, margin: "20px 0 0" }}>
        Revisaremos los antecedentes y te contactaremos para continuar con la solicitud.
      </Text>
    </EmailShell>
  );
}
