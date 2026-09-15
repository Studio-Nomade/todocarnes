import type { ReactNode } from "react";
import { Body, Container, Head, Html, Img, Preview, Section } from "@react-email/components";
import { colors } from "@todocarnes/brand";

export function EmailShell({
  children,
  preview,
  logoUrl,
}: {
  children: ReactNode;
  preview: string;
  logoUrl?: string;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors["gray-50"], fontFamily: "Arial, sans-serif", margin: 0 }}>
        <Container style={{ backgroundColor: colors.white, margin: "32px auto", maxWidth: 600, padding: 32 }}>
          <Section style={{ borderBottom: `3px solid ${colors.blue}`, marginBottom: 24, paddingBottom: 20 }}>
            {logoUrl ? <Img alt="Todo Carnes" height="52" src={logoUrl} /> : null}
          </Section>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
