export const PROCESS_VIDEOS = [
  { title: "Corte", slug: "corte", description: "Cortes precisos según producto, rendimiento y uso final.", fallbackPoster: "/landing/hero-processing.jpg" },
  { title: "Gramaje", slug: "gramaje", description: "Porciones consistentes para controlar costo y operación.", fallbackPoster: "/landing/capability.jpg" },
  { title: "Porcionado", slug: "porcionado", description: "Formatos listos para simplificar la preparación.", fallbackPoster: "/landing/processing.jpg" },
  { title: "Procesamiento", slug: "procesamiento", description: "Procesos adaptados a requerimientos productivos específicos.", fallbackPoster: "/landing/processing.jpg" },
  { title: "Descongelado", slug: "descongelado", description: "Manejo controlado para preservar calidad y continuidad.", fallbackPoster: "/landing/warehouse.jpg" },
  { title: "Embalaje", slug: "embalaje", description: "Protección y presentación alineadas a cada canal.", fallbackPoster: "/landing/capability.jpg" },
  { title: "Etiquetado", slug: "etiquetado", description: "Identificación y terminaciones listas para comercializar.", fallbackPoster: "/landing/plant-aerial.jpg" },
  { title: "Maquila", slug: "maquila", description: "Capacidad productiva para desarrollar soluciones a medida.", fallbackPoster: "/landing/hero-processing.jpg" },
  { title: "Marca Propia", slug: "marca-propia", description: "Productos desarrollados para representar tu marca.", fallbackPoster: "/landing/don-pancho.jpg" },
] as const;

export type ProcessVideoSlug = (typeof PROCESS_VIDEOS)[number]["slug"];

export function buildProcessAssetUrl(
  supabaseUrl: string | undefined,
  slug: ProcessVideoSlug,
  extension: "mp4" | "webp",
) {
  const baseUrl = supabaseUrl?.trim().replace(/\/+$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/process-videos/${slug}.${extension}`;
}
