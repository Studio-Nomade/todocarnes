import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10">
        <Image alt="Todo Carnes" className="mx-auto h-auto w-40" height={4500} priority src="/brand/logo_completo.png" width={4500} />
        <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-blue">Creador de catálogo</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Bienvenido</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">Ingresa con las credenciales internas de Todo Carnes.</p>
        {query.error === "enlace-vencido" ? (
          <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800" role="alert">
            El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.
          </p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
