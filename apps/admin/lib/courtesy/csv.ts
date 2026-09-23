import { COURTESY_STATUS_LABELS } from "./constants";
import type { CourtesyRequestItem } from "./types";

const headers = ["Fecha de solicitud", "Nombres", "Apellidos", "RUT", "Empresa", "Cargo", "Email", "Teléfono", "Evento", "Estado"];

function csvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function courtesyRequestsCsv(items: CourtesyRequestItem[]): string {
  const rows = items.map((item) => [
    item.createdAt,
    item.name,
    item.lastName,
    item.rut,
    item.company,
    item.cargo,
    item.email,
    item.phone,
    item.eventName,
    COURTESY_STATUS_LABELS[item.status],
  ]);

  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
