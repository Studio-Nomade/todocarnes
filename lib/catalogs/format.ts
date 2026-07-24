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

export function monthName(month: number): string {
  return monthNames[month - 1] ?? "";
}

export function catalogPeriod(month: number, year: number): string {
  return `${monthName(month)} ${year}`.trim();
}
