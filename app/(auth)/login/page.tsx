import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl shadow-navy/10">
        <Image alt="Todo Carnes" className="mx-auto h-auto w-40" height={4500} priority src="/brand/logo_completo.png" width={4500} />
        <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-blue">Creador de catálogo</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Bienvenido</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">Ingresá con las credenciales internas de Todo Carnes.</p>
        <LoginForm />
      </section>
    </main>
  );
}
