export const bookingStatuses = ["pending", "confirmed", "cancelled"] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};
