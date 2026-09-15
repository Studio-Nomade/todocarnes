export function OrganizationJsonLd() {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl").replace(/\/$/, "");
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Todo Carnes", url: origin, logo: `${origin}/brand/logo-completo-horizontal.webp`, description: "Soluciones cárnicas B2B para la industria alimentaria." };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />;
}
