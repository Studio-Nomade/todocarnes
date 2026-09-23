import Image from "next/image";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/recuperar");

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10">
        <Image alt="Todo Carnes" className="mx-auto h-auto w-40" height={4500} priority src="/brand/logo_completo.png" width={4500} />
        <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-blue">Recuperación de acceso</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Crea una contraseña nueva</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">Debe tener al menos 8 caracteres.</p>
        <NewPasswordForm />
      </section>
    </main>
  );
}
