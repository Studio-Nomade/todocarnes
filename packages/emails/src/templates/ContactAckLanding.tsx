import { Heading, Text } from "@react-email/components";
import { bodyTextStyle, EmailDetails, headingStyle } from "./EmailDetails";
import { EmailShell } from "./EmailShell";

export type ContactAckLandingProps = {
  name: string;
  area?: string | null;
  logoUrl?: string;
};

export function ContactAckLanding(props: ContactAckLandingProps) {
  return (
    <EmailShell logoUrl={props.logoUrl} preview="Recibimos tu mensaje en Todo Carnes">
      <Heading style={headingStyle}>Recibimos tu mensaje</Heading>
      <Text style={bodyTextStyle}>Hola {props.name}, gracias por contarnos qué necesita tu negocio.</Text>
      <EmailDetails rows={[{ label: "Derivación", value: props.area ? `Equipo de ${props.area}` : "Equipo comercial Todo Carnes" }]} />
      <Text style={{ ...bodyTextStyle, margin: "20px 0 0" }}>Derivamos tu mensaje al equipo indicado. Una persona se pondrá en contacto contigo a la brevedad.</Text>
    </EmailShell>
  );
}
