import { Column, Row, Section, Text } from "@react-email/components";
import { colors } from "@todocarnes/brand";

export type EmailDetail = {
  label: string;
  value?: string | number | null;
};

export function EmailDetails({ rows }: { rows: EmailDetail[] }) {
  return (
    <Section style={{ border: `1px solid ${colors["blue-50"]}`, borderRadius: 12, overflow: "hidden" }}>
      {rows.map((row, index) => (
        <Row key={row.label} style={{ backgroundColor: index % 2 === 0 ? colors["gray-50"] : colors.white, borderBottom: index === rows.length - 1 ? undefined : `1px solid ${colors["blue-50"]}` }}>
          <Column style={{ color: colors.navy, fontSize: 13, fontWeight: 700, padding: "11px 14px", verticalAlign: "top", width: "36%" }}>
            {row.label}
          </Column>
          <Column style={{ color: colors.ink, fontSize: 13, lineHeight: "20px", padding: "11px 14px", verticalAlign: "top" }}>
            {row.value === null || row.value === undefined || row.value === "" ? "No informado" : String(row.value)}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export const bodyTextStyle = {
  color: colors.ink,
  fontSize: 15,
  lineHeight: "24px",
  margin: "0 0 18px",
} as const;

export const headingStyle = {
  color: colors.navy,
  fontSize: 28,
  lineHeight: "34px",
  margin: "0 0 16px",
} as const;
