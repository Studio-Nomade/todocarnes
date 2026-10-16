export const PRODUCT_USES = ["parrilla", "sarten", "olla"] as const;

export type ProductUse = (typeof PRODUCT_USES)[number];

export const PRODUCT_USE_LABELS: Record<ProductUse, string> = {
  olla: "Olla",
  parrilla: "Parrilla",
  sarten: "Sartén",
};
