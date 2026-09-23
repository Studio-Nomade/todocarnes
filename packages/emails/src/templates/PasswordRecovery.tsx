import { Button, Heading, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { bodyTextStyle, headingStyle } from "./EmailDetails";
import { EmailShell } from "./EmailShell";

const publicHeaderUrl = "https://todocarnes.cl/emails/header-correos.jpg";

export type PasswordRecoveryProps = {
  recoveryUrl: string;
};

export function PasswordRecovery({ recoveryUrl }: PasswordRecoveryProps) {
  return (
    <EmailShell logoUrl={publicHeaderUrl} preview="Restablece tu contraseña de Todo Carnes" variant="tc">
      <Heading style={headingStyle}>Restablece tu contraseña</Heading>
      <Text style={bodyTextStyle}>Hola, recibimos una solicitud para cambiar la contraseña de tu cuenta de Todo Carnes.</Text>
      <Button
        href={recoveryUrl}
        style={{
          backgroundColor: colors.blue,
          borderRadius: 999,
          color: colors.navy,
          display: "inline-block",
          fontSize: 14,
          fontWeight: 700,
          margin: "8px 0 20px",
          padding: "13px 22px",
          textDecoration: "none",
        }}
      >
        Crear nueva contraseña
      </Button>
      <Text style={bodyTextStyle}>Este enlace vence por seguridad. Si no solicitaste el cambio, puedes ignorar este mensaje.</Text>
      <Text style={{ ...bodyTextStyle, color: colors.ink, fontSize: 12, margin: "18px 0 0", opacity: 0.7, wordBreak: "break-all" }}>
        Si el botón no funciona, copia y pega este enlace en tu navegador: {recoveryUrl}
      </Text>
    </EmailShell>
  );
}
