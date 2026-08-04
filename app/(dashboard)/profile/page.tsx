import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { requireRole } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await requireRole(["admin", "commercial"]);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Cuenta personal</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">Mi perfil</h1>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        Configura tus datos comerciales y revisa cómo aparecerá tu firma en los correos.
      </p>
      <div className="mt-8">
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
