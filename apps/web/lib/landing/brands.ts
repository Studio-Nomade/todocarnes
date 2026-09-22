export type Brand = {
  name: string;
  slug: string;
  /** Sitio oficial de la marca. Vacío = el logo se muestra sin enlace. */
  url: string;
};

// Logos en /public/landing/brands/<slug>.webp (lienzo uniforme 360×140, fondo transparente).
export const BRANDS: Brand[] = [
  { name: "Don Pancho", slug: "don-pancho", url: "" },
  { name: "Golden Phoenix", slug: "golden-phoenix", url: "" },
  { name: "Patel", slug: "patel", url: "" },
  { name: "Perdix", slug: "perdix", url: "" },
  { name: "Sadia", slug: "sadia", url: "" },
  { name: "Seara", slug: "seara", url: "" },
  { name: "Sulita", slug: "sulita", url: "" },
  { name: "Tyson", slug: "tyson", url: "" },
];
