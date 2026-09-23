import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ "cambiar-clave"?: string }>;
}) {
  const profile = await requireRole(["admin", "commercial"]);
  const query = await searchParams;
  const requiredChange = profile.mustChangePassword || query["cambiar-clave"] === "1";

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Cuenta personal</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">Mi perfil</h1>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        Configura tus datos comerciales y revisa cómo aparecerá tu firma en los correos.
      </p>
      {requiredChange ? (
        <div className="mt-6 rounded-xl bg-blue-50 px-5 py-4 text-sm font-medium leading-6 text-navy" role="alert">
          Por seguridad, debes cambiar la contraseña inicial para continuar.
        </div>
      ) : null}
      <div className="mt-8 space-y-8">
        <PasswordForm requiredChange={requiredChange} />
        <ProfileEditor
          initialProfile={{
            email: profile.email,
            jobTitle: profile.jobTitle,
            name: profile.name,
            phone: profile.phone,
          }}
        />
      </div>
    </div>
  );
}
