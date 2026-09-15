const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const catalogStatusLabels = {
  draft: "Borrador",
  exported: "Publicado",
  ready: "En revisión",
} as const;

export function monthName(month: number): string {
  return monthNames[month - 1] ?? "";
}

export function catalogPeriod(month: number, year: number): string {
  return `${monthName(month)} ${year}`.trim();
}

export function catalogPdfFilename(month: number, date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Santiago",
    year: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}${value("month")}${value("day")}_Catalogo Oficial Todo Carnes - ${monthName(month)}.pdf`;
}
