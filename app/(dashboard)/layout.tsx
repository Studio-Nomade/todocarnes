import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth/requireRole";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole(["admin", "commercial"]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-ink">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <Link className="flex items-center gap-3" href="/dashboard">
            <Image alt="Todo Carnes" className="h-9 w-9" height={4500} priority src="/brand/isologo_completo.png" width={4501} />
            <span className="text-lg font-semibold text-navy">Todo Carnes</span>
            <span className="text-xs uppercase tracking-widest text-blue">Catálogos</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <nav className="flex gap-5" aria-label="Principal">
              <Link href="/dashboard">Inicio</Link>
              <Link href="/products">Productos</Link>
              <Link href="/catalogs">Catálogos</Link>
              {profile.role === "admin" ? <Link href="/settings">Configuración</Link> : null}
            </nav>
            <span className="text-ink/60">{profile.name}</span>
            <form action={logout}>
              <button className="font-medium text-navy" type="submit">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-12">{children}</main>
      <footer className="mt-12 border-t border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 py-6 text-center text-xs text-ink/45 sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Image alt="Studio Nomade" className="h-8 w-8 object-contain opacity-55 grayscale" height={4500} src="/brand/nomade-logo.png" width={4500} />
            <span>Prototipo desarrollado por Studio Nomade</span>
          </div>
          <span>Todos los derechos reservados · Prohibida su reproducción</span>
        </div>
      </footer>
    </div>
  );
}
