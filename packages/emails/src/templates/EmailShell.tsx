import type { ReactNode } from "react";
import { Body, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";
import { EMAIL_HEADER_HEIGHT, EMAIL_HEADER_WIDTH } from "../email-header";

export type EmailShellVariant = "tc" | "food-service";

export function EmailShell({
  children,
  preview,
  logoUrl,
  variant = "tc",
  eventName,
  eventLocation,
}: {
  children: ReactNode;
  preview: string;
  logoUrl?: string;
  variant?: EmailShellVariant;
  eventName?: string;
  eventLocation?: string;
}) {
  const foodService = variant === "food-service";

  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors["gray-50"], color: colors.ink, fontFamily: "Montserrat, Arial, sans-serif", margin: 0, padding: "24px 12px" }}>
        <Container style={{ backgroundColor: colors.white, border: `1px solid ${colors["blue-50"]}`, borderRadius: 16, margin: "0 auto", maxWidth: 600, overflow: "hidden" }}>
          {/* Cabecera única de todos los correos: banner de marca a todo el ancho. */}
          <Section style={{ backgroundColor: colors.navy, fontSize: 0, lineHeight: 0, padding: 0 }}>
            {logoUrl ? (
              <Img alt="TodoCarnes" height={EMAIL_HEADER_HEIGHT} src={logoUrl} style={{ display: "block", height: "auto", width: "100%" }} width={EMAIL_HEADER_WIDTH} />
            ) : (
              <Text style={{ color: colors.white, fontSize: 20, fontWeight: 700, margin: 0, padding: "24px 28px" }}>TodoCarnes</Text>
            )}
          </Section>
          {foodService ? (
            <Section style={{ backgroundColor: colors.navy, padding: "0 28px 20px" }}>
              <Text style={{ color: colors.blue, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, margin: 0, textTransform: "uppercase" }}>
                Espacio Food Service 2026
              </Text>
            </Section>
          ) : null}
          {foodService ? (
            <Section style={{ backgroundColor: colors["blue-50"], borderBottom: `1px solid ${colors.blue}`, padding: "16px 28px" }}>
              <Text style={{ color: colors.navy, fontSize: 14, fontWeight: 700, margin: 0 }}>{eventName ?? "Food & Service 2026"}</Text>
              <Text style={{ color: colors.ink, fontSize: 13, lineHeight: "20px", margin: "4px 0 0" }}>{eventLocation || "Stand 2-A100"}</Text>
            </Section>
          ) : null}
          <Section style={{ backgroundColor: colors.white, padding: "28px" }}>
            {children}
          </Section>
          <Section style={{ backgroundColor: colors.navy, padding: "20px 28px", textAlign: "center" }}>
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: 700, margin: 0 }}>
              {foodService ? "TodoCarnes | Espacio Food Service" : "TodoCarnes"}
            </Text>
            <Text style={{ color: colors.blue, fontSize: 11, lineHeight: "18px", margin: "6px 0 0" }}>
              Soluciones cárnicas para cada forma de operar.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
