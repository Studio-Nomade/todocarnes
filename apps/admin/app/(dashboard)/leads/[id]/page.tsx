import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadAssignmentForm, LeadStatusForm } from "@/components/leads/LeadMutationForms";
import { requireRole } from "@/lib/auth/requireRole";
import { AREA_LABELS, LEAD_STATUS_LABELS } from "@/lib/leads/constants";
import { getLead, listCommercialOptions } from "@/lib/leads/data";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{value || "No informado"}</dd></div>;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole(["admin", "commercial"]);
  const { id } = await params;
  const [lead, representatives] = await Promise.all([getLead(id), listCommercialOptions()]);
  if (!lead) notFound();
  return <section className="space-y-7"><Link className="text-sm font-semibold text-blue-700" href="/leads">← Volver a leads</Link><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Detalle del lead</p><h1 className="mt-2 text-3xl font-semibold text-navy">{lead.name}</h1><p className="mt-2 text-sm text-ink/60">Recibido el {new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeStyle: "short", timeZone: "America/Santiago" }).format(new Date(lead.createdAt))}</p></div><span className="w-fit rounded-full bg-blue/15 px-4 py-2 text-sm font-semibold text-navy">{LEAD_STATUS_LABELS[lead.status]}</span></header><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><dl className="grid gap-6 rounded-2xl border border-ink/10 bg-white p-6 sm:grid-cols-2"><Field label="Empresa" value={lead.company} /><Field label="Área" value={lead.area ? AREA_LABELS[lead.area] : null} /><Field label="Email" value={lead.email} /><Field label="Teléfono" value={lead.phone} /><Field label="Origen" value={lead.source === "landing" ? "Landing" : "Contacto desde agenda"} /><Field label="Cómo llegó" value={lead.cameFrom} /><Field label="Vendedor" value={lead.assignedRepName} /><div className="sm:col-span-2"><Field label="Mensaje" value={lead.message} /></div></dl><aside className="space-y-6"><div className="rounded-2xl border border-ink/10 bg-white p-5"><h2 className="mb-4 font-semibold text-navy">Gestionar estado</h2><LeadStatusForm id={lead.id} status={lead.status} /></div>{profile.role === "admin" ? <div className="rounded-2xl border border-ink/10 bg-white p-5"><h2 className="mb-4 font-semibold text-navy">Asignación</h2><LeadAssignmentForm assignedRepId={lead.assignedRepId} id={lead.id} representatives={representatives} /></div> : null}</aside></div></section>;
}
