import Link from "next/link";

export default function DashboardPage() {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Panel principal</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">Creador de catálogo</h1>
      <p className="mt-4 max-w-xl leading-7 text-ink/70">Creá y mantené la base comercial mientras ves cada ficha actualizarse en tiempo real.</p>
      <Link className="mt-7 inline-flex rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90" href="/products">Ver productos</Link>
    </section>
  );
}
