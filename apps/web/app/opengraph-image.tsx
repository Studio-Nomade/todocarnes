import { ImageResponse } from "next/og";

export const alt = "Todo Carnes — soluciones cárnicas B2B";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", color: "white", background: "linear-gradient(135deg, #0d244f 0%, #0d244f 58%, #8ab1fd 58%, #8ab1fd 100%)", fontFamily: "sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 800 }}><span style={{ display: "flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 32, background: "#8ab1fd", color: "#0d244f" }}>TC</span>Todo Carnes</div><div style={{ display: "flex", maxWidth: 850, fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>Más que carne: soluciones para tu negocio.</div><div style={{ display: "flex", fontSize: 26, color: "#eff4fe" }}>Abastecer · producir · vender mejor</div></div>, size);
}
