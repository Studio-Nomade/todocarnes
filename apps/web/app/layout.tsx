import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { PlausibleAnalytics } from "@/components/analytics/PlausibleAnalytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Todo Carnes | Soluciones cárnicas B2B", template: "%s | Todo Carnes" },
  description: "Productos, formatos y soluciones cárnicas para abastecer, producir y vender mejor.",
  openGraph: { type: "website", locale: "es_CL", siteName: "Todo Carnes", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Todo Carnes — soluciones cárnicas B2B" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-CL">
      <body><a href="#contenido" className="skip-link">Saltar al contenido</a>{children}<PlausibleAnalytics /><Analytics /></body>
    </html>
  );
}
