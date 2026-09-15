import type { CommercialOption, LeadFilters as LeadFilterValues } from "@/lib/leads/types";
import { AREA_LABELS, commercialAreas, LEAD_STATUS_LABELS, leadStatuses } from "@/lib/leads/constants";

export function LeadFilters({ filters, representatives, showRepresentative }: { filters: LeadFilterValues; representatives: CommercialOption[]; showRepresentative: boolean }) {
  return (
    <form className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]" method="get">
      <label className="text-xs font-semibold text-ink/60">Buscar<input className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink" defaultValue={filters.search} name="search" placeholder="Nombre, empresa o email" /></label>
      <label className="text-xs font-semibold text-ink/60">Estado<select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={filters.status ?? ""} name="status"><option value="">Todos</option>{leadStatuses.map((status) => <option key={status} value={status}>{LEAD_STATUS_LABELS[status]}</option>)}</select></label>
      <label className="text-xs font-semibold text-ink/60">Área<select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={filters.area ?? ""} name="area"><option value="">Todas</option>{commercialAreas.map((area) => <option key={area} value={area}>{AREA_LABELS[area]}</option>)}</select></label>
      {showRepresentative ? <label className="text-xs font-semibold text-ink/60">Vendedor<select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={filters.assignedRepId ?? ""} name="assignedRepId"><option value="">Todos</option>{representatives.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}</select></label> : <span />}
      <button className="self-end rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white" type="submit">Filtrar</button>
    </form>
  );
}
