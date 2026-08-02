import { ServiceManager } from "@/components/services/ServiceManager";
import { requireRole } from "@/lib/auth/requireRole";
import { getServices } from "@/lib/services/data";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  await requireRole(["admin", "commercial"]);
  const services = await getServices();

  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Propuesta comercial</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Servicios</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Administra los servicios que se incorporan automáticamente en la presentación del catálogo.
        </p>
      </div>
      <ServiceManager initialServices={services} />
    </section>
  );
}
