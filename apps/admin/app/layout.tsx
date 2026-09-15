import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creador de Catálogo | Todo Carnes",
  description: "Herramienta interna para crear el catálogo comercial de Todo Carnes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
