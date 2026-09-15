"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingMutationState } from "@/lib/bookings/types";
import { bookingMutationSchema } from "@/lib/bookings/validation";

async function setBookingStatus(id: string, status: "confirmed" | "cancelled", actor: Awaited<ReturnType<typeof requireRole>>): Promise<BookingMutationState> {
  let update = createAdminClient().from("bookings").update({ status }).eq("id", id);
  if (actor.role === "commercial") update = update.eq("rep_id", actor.id);
  const result = await update.select("id").maybeSingle();
  if (result.error || !result.data) return { error: "No tienes acceso a esta reserva o ya no existe.", success: false };
  revalidatePath("/agenda");
  return { success: true };
}

export async function confirmBooking(_state: BookingMutationState, formData: FormData): Promise<BookingMutationState> {
  const actor = await requireRole(["admin", "commercial"]);
  const parsed = bookingMutationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Reserva inválida.", success: false };
  return setBookingStatus(parsed.data.id, "confirmed", actor);
}

export async function cancelBooking(_state: BookingMutationState, formData: FormData): Promise<BookingMutationState> {
  const actor = await requireRole(["admin", "commercial"]);
  const parsed = bookingMutationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Reserva inválida.", success: false };
  return setBookingStatus(parsed.data.id, "cancelled", actor);
}
