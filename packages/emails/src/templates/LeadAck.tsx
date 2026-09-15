import { Heading, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { EmailShell } from "./EmailShell";

export type LeadAckProps = {
  name: string;
  logoUrl?: string;
};

export function LeadAck({ name, logoUrl }: LeadAckProps) {
  return (
    <EmailShell logoUrl={logoUrl} preview="Recibimos tus datos en Todo Carnes">
      <Heading style={{ color: colors.navy, fontSize: 28 }}>Gracias por contactarnos</Heading>
      <Text>Hola {name}, recibimos tus datos correctamente.</Text>
      <Text>Un integrante de nuestro equipo comercial se pondrá en contacto contigo a la brevedad.</Text>
    </EmailShell>
  );
}
