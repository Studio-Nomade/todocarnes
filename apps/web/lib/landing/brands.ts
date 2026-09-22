export type Brand = {
  name: string;
  slug: string;
  /** Sitio oficial de la marca. Vacío = el logo se muestra sin enlace (Don Pancho y Perdix no tienen sitio). */
  url: string;
};

// Logos en /public/landing/brands/<slug>.webp (lienzo uniforme 360×140, fondo transparente).
export const BRANDS: Brand[] = [
  { name: "Don Pancho", slug: "don-pancho", url: "" },
  { name: "Golden Phoenix", slug: "golden-phoenix", url: "https://www.goldenphoenixbrand.com/" },
  { name: "Patel", slug: "patel", url: "https://www.patel.es/" },
  { name: "Perdix", slug: "perdix", url: "" },
  { name: "Sadia", slug: "sadia", url: "https://www.sadia.cl/" },
  { name: "Seara", slug: "seara", url: "https://www.searainternational.com/" },
  { name: "Sulita", slug: "sulita", url: "https://sulita.com.br/" },
  { name: "Tyson", slug: "tyson", url: "https://www.tysonfoods.com/" },
];
