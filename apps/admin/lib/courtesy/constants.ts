export const courtesyStatuses = ["pending", "confirmed", "cancelled"] as const;

export type CourtesyStatus = (typeof courtesyStatuses)[number];

export const COURTESY_STATUS_LABELS: Record<CourtesyStatus, string> = {
  cancelled: "Cancelada",
  confirmed: "Confirmada",
  pending: "Pendiente",
};

export const COURTESY_PAGE_SIZE = 20;
