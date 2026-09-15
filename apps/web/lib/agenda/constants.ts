import type { AgendaEvent, CommercialArea, ContactOrigin, PublicRepresentative } from "./types";

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
  location: "Stand Todo Carnes — Feria Food & Service 2026 (espacio por confirmar)",
  days: ["2026-09-29", "2026-09-30", "2026-10-01"],
  slotTimes: ["11:00:00", "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"],
  slotMinutes: 30,
};

const placeholderDetails = [
  ["Víctor Andrades", "food_service", "Soluciones y formatos para operadores gastronómicos y cadenas de restaurantes."],
  ["Paulina Urbina", "retail_ggcc", "Abastecimiento, formatos y desarrollo para grandes cadenas."],
  ["Fernando Salinas", "mmpp_trimmings", "Materias primas para procesos industriales y productivos."],
  ["Javiera Martínez", "ventas_nacionales", "Asesoramiento y distribución para distintos rubros y clientes nacionales."],
] as const;

export const PLACEHOLDER_REPRESENTATIVES: PublicRepresentative[] = placeholderDetails.map(
  ([name, area, bio], index) => ({
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    name,
    area,
    areaLabel: AREA_LABELS[area],
    photoUrl: null,
    whatsapp: null,
    contactEmail: null,
    bio,
    isPlaceholder: true,
  }),
);

export function areaLabel(area: CommercialArea | null) {
  return area ? AREA_LABELS[area] : "Área comercial";
}
