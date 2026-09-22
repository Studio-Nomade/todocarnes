import type { AgendaEvent, CommercialArea, ContactOrigin } from "./types";

export const AREA_LABELS: Record<CommercialArea, string> = {
  food_service: "Food Service",
  retail_ggcc: "Retail / GGCC",
  mmpp_trimmings: "MMPP / Trimmings",
  ventas_nacionales: "Ventas Nacionales",
  maquila_desarrollo: "Maquila y Desarrollo",
  marca_propia: "Marca Propia",
  otro: "Otra área",
};

export const ORIGIN_OPTIONS: { value: ContactOrigin; label: string }[] = [
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "mail_newsletter", label: "Mail / Newsletter" },
  { value: "invitacion_comercial", label: "Invitación Comercial" },
  { value: "buscar_google", label: "Buscar en Google" },
  { value: "a_traves_de_tercero", label: "A través de un tercero" },
  { value: "otro", label: "Otro medio" },
];

export const FALLBACK_EVENT: AgendaEvent = {
  id: "00000000-0000-4000-8000-000000000000",
  name: "Feria Food & Service 2026",
  location: "Stand 2-A100 — Feria Food & Service 2026",
  days: ["2026-09-29", "2026-09-30", "2026-10-01"],
  slotTimes: ["11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"],
  slotMinutes: 30,
};

export function areaLabel(area: CommercialArea | null) {
  return area ? AREA_LABELS[area] : "Área comercial";
}

/** Une varias áreas en una etiqueta legible ("Retail / GGCC + Food Service"). */
export function areasLabel(areas: readonly CommercialArea[] | null | undefined, fallback: CommercialArea | null = null) {
  const list = areas?.length ? [...new Set(areas)] : fallback ? [fallback] : [];
  return list.length ? list.map((area) => AREA_LABELS[area]).join(" + ") : "Área comercial";
}
