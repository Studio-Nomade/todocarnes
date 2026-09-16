import { Heading, Text } from "@react-email/components";
import { bodyTextStyle, EmailDetails, headingStyle } from "./EmailDetails";
import { EmailShell } from "./EmailShell";

export type ContactAckAgendaProps = {
  name: string;
  area?: string | null;
  representativeName?: string | null;
  logoUrl?: string;
};

export function ContactAckAgenda(props: ContactAckAgendaProps) {
  return (
    <EmailShell logoUrl={props.logoUrl} preview="Recibimos tu solicitud de contacto en Todo Carnes">
      <Heading style={headingStyle}>Recibimos tu solicitud de contacto</Heading>
      <Text style={bodyTextStyle}>Hola {props.name}, recibimos tus datos desde la agenda de Food &amp; Service 2026.</Text>
      <EmailDetails rows={[
        { label: "Área", value: props.area },
        { label: "Representante", value: props.representativeName },
      ]} />
      <Text style={{ ...bodyTextStyle, margin: "20px 0 0" }}>La persona indicada de nuestro equipo comercial se pondrá en contacto contigo a la brevedad.</Text>
    </EmailShell>
  );
}
