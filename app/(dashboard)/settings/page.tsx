import { requireRole } from "@/lib/auth/requireRole";

export default async function SettingsPage() {
  await requireRole(["admin"]);

  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Solo administradores</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">Configuración</h1>
      <p className="mt-4 text-ink/70">La administración de usuarios y prompts se habilitará en sus hitos correspondientes.</p>
    </section>
  );
}
