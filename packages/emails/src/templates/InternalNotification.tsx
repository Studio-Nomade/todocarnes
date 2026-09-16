import { Heading, Text } from "@react-email/components";
import type { EmailDetail } from "./EmailDetails";
import { bodyTextStyle, EmailDetails, headingStyle } from "./EmailDetails";
import { EmailShell } from "./EmailShell";

export function InternalNotification({
  title,
  preview,
  rows,
  logoUrl,
}: {
  title: string;
  preview: string;
  rows: EmailDetail[];
  logoUrl?: string;
}) {
  return (
    <EmailShell logoUrl={logoUrl} preview={preview}>
      <Heading style={headingStyle}>{title}</Heading>
      <Text style={bodyTextStyle}>Se registró una nueva solicitud. Estos son todos los datos disponibles:</Text>
      <EmailDetails rows={rows} />
    </EmailShell>
  );
}
