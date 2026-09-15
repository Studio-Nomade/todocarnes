import Link from "next/link";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { requireRole } from "@/lib/auth/requireRole";
import { AREA_LABELS, LEAD_STATUS_LABELS } from "@/lib/leads/constants";
import { listCommercialOptions, listLeads } from "@/lib/leads/data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pageHref(params: Record<string, string | string[] | undefined>, page: number): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (typeof value === "string" && key !== "page") query.set(key, value); });
  query.set("page", String(page));
  return `/leads?${query.toString()}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireRole(["admin", "commercial"]);
  const params = await searchParams;
  const [result, representatives] = await Promise.all([listLeads(params), listCommercialOptions()]);

  return <section className="space-y-7"><header><p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Comercial</p><h1 className="mt-2 text-3xl font-semibold text-navy">Leads</h1><p className="mt-2 text-sm text-ink/60">{profile.role === "admin" ? "Todos los contactos recibidos desde el sitio y la agenda." : "Contactos asignados a tu gestión comercial."}</p></header><LeadFilters filters={result.filters} representatives={representatives} showRepresentative={profile.role === "admin"} /><div className="overflow-hidden rounded-2xl border border-ink/10 bg-white"><div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 text-sm"><span className="font-semibold text-navy">{result.total} leads</span><span className="text-ink/55">Página {result.page} de {result.pageCount}</span></div>{result.items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink/55"><tr><th className="px-5 py-3">Contacto</th><th className="px-5 py-3">Área</th><th className="px-5 py-3">Vendedor</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Fecha</th></tr></thead><tbody className="divide-y divide-ink/10">{result.items.map((lead) => <tr key={lead.id} className="hover:bg-gray-50"><td className="px-5 py-4"><Link className="font-semibold text-navy underline-offset-4 hover:underline" href={`/leads/${lead.id}`}>{lead.name}</Link><span className="mt-1 block text-xs text-ink/55">{lead.company || lead.email}</span></td><td className="px-5 py-4">{lead.area ? AREA_LABELS[lead.area] : "Sin área"}</td><td className="px-5 py-4">{lead.assignedRepName ?? "Sin asignar"}</td><td className="px-5 py-4"><span className="rounded-full bg-blue/15 px-3 py-1 text-xs font-semibold text-navy">{LEAD_STATUS_LABELS[lead.status]}</span></td><td className="px-5 py-4 text-ink/65">{new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" }).format(new Date(lead.createdAt))}</td></tr>)}</tbody></table></div> : <p className="px-5 py-12 text-center text-sm text-ink/55">No hay leads para estos filtros.</p>}</div><nav aria-label="Paginación" className="flex justify-end gap-3">{result.page > 1 ? <Link className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-navy" href={pageHref(params, result.page - 1)}>Anterior</Link> : null}{result.page < result.pageCount ? <Link className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-navy" href={pageHref(params, result.page + 1)}>Siguiente</Link> : null}</nav></section>;
}
