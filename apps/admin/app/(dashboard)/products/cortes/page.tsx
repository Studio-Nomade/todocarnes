import { CutManager } from "@/components/products/CutManager";
import { requireRole } from "@/lib/auth/requireRole";
import { getCutManagementData } from "@/lib/cuts/data";

export const dynamic = "force-dynamic";

export default async function CutsPage() {
  await requireRole(["admin", "commercial"]);
  const data = await getCutManagementData();

  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Base comercial</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Categorías y cortes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">Crea, renombra y ordena los cortes disponibles en las fichas de producto.</p>
      </div>
      <CutManager categories={data.categories} cuts={data.cuts} />
    </section>
  );
}
