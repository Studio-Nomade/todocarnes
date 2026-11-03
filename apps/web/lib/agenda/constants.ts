import { availableDays } from "./availability";
import type { AgendaEvent, BookingModality, CommercialArea, ContactOrigin } from "./types";

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

export const MODALITY_OPTIONS: { value: BookingModality; label: string; description: string }[] = [
  { value: "videollamada", label: "Videollamada", description: "Te enviamos el enlace por correo." },
  { value: "oficina", label: "Reunión en nuestras oficinas", description: "Coordinamos la dirección contigo." },
  { value: "visita", label: "Visita a tu empresa", description: "Indícanos dónde te visitamos." },
];

export const MODALITY_LABELS: Record<BookingModality, string> = Object.fromEntries(
  MODALITY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<BookingModality, string>;

/** Texto de "lugar" que viaja en el correo, el .ics y el resumen según la modalidad elegida. */
export function modalityLocation(modality: BookingModality | "", locationDetail: string): string {
  if (modality === "videollamada") return "Videollamada (te enviaremos el enlace)";
  if (modality === "oficina") return "Oficinas de Todo Carnes (dirección por confirmar)";
  if (modality === "visita") return locationDetail.trim() ? `Visita en ${locationDetail.trim()}` : "Visita a tu empresa";
  return "Por confirmar";
}

/** Configuración de respaldo cuando no hay base de datos: misma agenda, sin reservas reales. */
export const FALLBACK_EVENT: AgendaEvent = {
  id: "00000000-0000-4000-8000-000000000000",
  name: "Agenda comercial Todo Carnes",
  location: "Videollamada, oficina o visita",
  days: availableDays(
    { blackoutDates: [], days: null, horizonDays: 14, kind: "permanent", minNoticeHours: 24, slotTimes: ["10:00:00"], weekdays: [1, 2, 3, 4, 5] },
    new Date(),
  ),
  slotTimes: ["09:00:00", "10:00:00", "11:00:00", "12:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"],
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

/**
 * Áreas que aparecen en la etiqueta pública del vendedor: las líneas de negocio del sitio.
 * Maquila y desarrollo, marca propia y "otro" existen para enrutar el contacto al vendedor
 * correcto, no para describirlo frente al cliente.
 */
export const PUBLIC_LABEL_AREAS: readonly CommercialArea[] = ["mmpp_trimmings", "retail_ggcc", "food_service", "ventas_nacionales"];

/** Etiqueta pública del vendedor: solo líneas de negocio; si no cubre ninguna, muestra todas sus áreas. */
export function representativeAreasLabel(areas: readonly CommercialArea[] | null | undefined, fallback: CommercialArea | null = null) {
  const list = areas?.length ? areas : fallback ? [fallback] : [];
  const visible = list.filter((area) => PUBLIC_LABEL_AREAS.includes(area));
  return areasLabel(visible.length ? visible : list);
}
