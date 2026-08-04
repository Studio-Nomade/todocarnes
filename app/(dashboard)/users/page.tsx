import { UserManager } from "@/components/users/UserManager";
import { requireRole } from "@/lib/auth/requireRole";
import { listProfiles } from "@/lib/users/data";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const profile = await requireRole(["admin"]);
  const users = await listProfiles();

  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Solo administradores</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Usuarios</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Crea cuentas para el equipo comercial. Cada comercial gestiona sus catálogos y envía
          correos con su propia firma. Desactiva una cuenta para revocar el acceso sin borrarla.
        </p>
      </div>
      <UserManager currentUserId={profile.id} initialUsers={users} />
    </section>
  );
}
