import Image from "next/image";
import Link from "next/link";
import { RecoveryRequestForm } from "@/components/auth/RecoveryRequestForm";

export default function RecoverPasswordPage() {
  const appUrl = process.env.APP_URL ?? "";
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10">
        <Image alt="Todo Carnes" className="mx-auto h-auto w-40" height={4500} priority src="/brand/logo_completo.png" width={4500} />
        <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-blue">Recuperación de acceso</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Restablece tu contraseña</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">Te enviaremos un enlace si el correo pertenece a una cuenta activa.</p>
        <RecoveryRequestForm appUrl={appUrl} />
        <Link className="mt-6 block text-center text-sm font-semibold text-blue hover:underline" href="/login">
          Volver al ingreso
        </Link>
      </section>
    </main>
  );
}
