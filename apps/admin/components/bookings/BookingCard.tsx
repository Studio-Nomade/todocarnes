"use client";

import { useActionState } from "react";
import { cancelBooking, confirmBooking } from "@/lib/actions/bookings";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings/constants";
import type { BookingItem, BookingMutationState } from "@/lib/bookings/types";

const initialState: BookingMutationState = { success: false };

function MutationMessage({ state }: { state: BookingMutationState }) {
  if (state.error) return <p className="mt-2 text-xs font-medium text-red-700" role="alert">{state.error}</p>;
  if (state.success) return <p className="mt-2 text-xs font-medium text-emerald-700" role="status">Reserva actualizada.</p>;
  return null;
}

export function BookingCard({ booking }: { booking: BookingItem }) {
  const [confirmState, confirmAction, confirming] = useActionState(confirmBooking, initialState);
  const [cancelState, cancelAction, cancelling] = useActionState(cancelBooking, initialState);
  const cancelled = booking.status === "cancelled";
  return <details className={`rounded-xl border p-3 ${cancelled ? "border-ink/10 bg-gray-50 opacity-65" : "border-blue/30 bg-blue/10"}`}><summary className="cursor-pointer list-none"><span className="block text-sm font-semibold text-navy">{booking.name}</span><span className="mt-1 block text-xs text-ink/60">{booking.company || "Sin empresa"} · {booking.repName}</span><span className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-navy">{BOOKING_STATUS_LABELS[booking.status]}</span></summary><dl className="mt-3 space-y-2 border-t border-ink/10 pt-3 text-xs"><div><dt className="font-semibold text-ink/55">Cargo</dt><dd>{booking.cargo || "No informado"}</dd></div><div><dt className="font-semibold text-ink/55">Email</dt><dd className="break-all">{booking.email}</dd></div><div><dt className="font-semibold text-ink/55">Teléfono</dt><dd>{booking.phone || "No informado"}</dd></div><div><dt className="font-semibold text-ink/55">Temas</dt><dd className="whitespace-pre-wrap">{booking.topics || "No informados"}</dd></div><div><dt className="font-semibold text-ink/55">Origen</dt><dd>{booking.cameFrom || "No informado"}</dd></div></dl>{cancelled ? null : <div className="mt-3 flex flex-wrap gap-2 border-t border-ink/10 pt-3">{booking.status === "pending" ? <form action={confirmAction}><input name="id" type="hidden" value={booking.id} /><button className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" disabled={confirming || cancelling}>Confirmar</button></form> : null}<form action={cancelAction}><input name="id" type="hidden" value={booking.id} /><button className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50" disabled={confirming || cancelling}>Cancelar</button></form></div>}<MutationMessage state={confirmState.error || confirmState.success ? confirmState : cancelState} /></details>;
}
