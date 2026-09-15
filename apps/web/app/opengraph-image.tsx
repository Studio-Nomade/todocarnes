import { ImageResponse } from "next/og";
import { colors } from "@todocarnes/brand";

export const alt = "Todo Carnes — soluciones cárnicas B2B";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const background = `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navy} 58%, ${colors.blue} 58%, ${colors.blue} 100%)`;
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", color: colors.white, background, fontFamily: "Montserrat, sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 700 }}><span style={{ display: "flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 32, background: colors.blue, color: colors.navy }}>TC</span>Todo Carnes</div><div style={{ display: "flex", maxWidth: 850, fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>Más que carne: soluciones para tu negocio.</div><div style={{ display: "flex", fontSize: 26, color: colors["blue-50"] }}>Abastecer · producir · vender mejor</div></div>, size);
}
