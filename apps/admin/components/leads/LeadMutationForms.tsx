"use client";

import { useActionState } from "react";
import { assignLead, updateLeadStatus } from "@/lib/actions/leads";
import { availableLeadStatuses, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads/constants";
import type { CommercialOption, LeadMutationState } from "@/lib/leads/types";

const initialState: LeadMutationState = { success: false };

function Result({ state }: { state: LeadMutationState }) {
  if (state.error) return <p className="text-sm font-medium text-red-700" role="alert">{state.error}</p>;
  if (state.success) return <p className="text-sm font-medium text-emerald-700" role="status">Cambio guardado.</p>;
  return null;
}

export function LeadStatusForm({ id, status }: { id: string; status: LeadStatus }) {
  const [state, action, pending] = useActionState(updateLeadStatus, initialState);
  const nextStatuses = availableLeadStatuses(status);
  if (!nextStatuses.length) return <p className="text-sm text-ink/60">Este lead ya está finalizado.</p>;
  return <form action={action} className="space-y-3"><input name="id" type="hidden" value={id} /><label className="block text-sm font-semibold text-navy">Nuevo estado<select className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-ink" name="status">{nextStatuses.map((next) => <option key={next} value={next}>{LEAD_STATUS_LABELS[next]}</option>)}</select></label><button className="admin-button-primary px-4" disabled={pending} type="submit">{pending ? "Guardando…" : "Cambiar estado"}</button><Result state={state} /></form>;
}

export function LeadAssignmentForm({ id, representatives, assignedRepId }: { id: string; representatives: CommercialOption[]; assignedRepId: string | null }) {
  const [state, action, pending] = useActionState(assignLead, initialState);
  return <form action={action} className="space-y-3"><input name="id" type="hidden" value={id} /><label className="block text-sm font-semibold text-navy">Vendedor asignado<select className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-ink" defaultValue={assignedRepId ?? ""} name="assignedRepId" required><option disabled value="">Selecciona un vendedor</option>{representatives.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}</select></label><button className="admin-button-secondary px-4" disabled={pending} type="submit">{pending ? "Asignando…" : "Asignar vendedor"}</button><Result state={state} /></form>;
}
