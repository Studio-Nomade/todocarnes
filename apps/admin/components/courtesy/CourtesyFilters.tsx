import Link from "next/link";
import { COURTESY_STATUS_LABELS, courtesyStatuses } from "@/lib/courtesy/constants";
import type { CourtesyFilters as CourtesyFilterValues } from "@/lib/courtesy/types";

export function CourtesyFilters({ filters }: { filters: CourtesyFilterValues }) {
  return (
    <form className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-4 md:grid-cols-[2fr_1fr_auto_auto]" method="get">
      <label className="text-xs font-semibold text-ink/60">
        Buscar
        <input
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink"
          defaultValue={filters.search}
          name="search"
          placeholder="Nombre, RUT, empresa, cargo o email"
        />
      </label>
      <label className="text-xs font-semibold text-ink/60">
        Estado
        <select className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink" defaultValue={filters.status ?? ""} name="status">
          <option value="">Todos</option>
          {courtesyStatuses.map((status) => <option key={status} value={status}>{COURTESY_STATUS_LABELS[status]}</option>)}
        </select>
      </label>
      <button className="admin-button-primary self-end" type="submit">Filtrar</button>
      <Link className="admin-button-secondary self-end" href="/cortesias">Limpiar</Link>
    </form>
  );
}
