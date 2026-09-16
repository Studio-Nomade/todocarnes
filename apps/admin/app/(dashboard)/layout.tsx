import Image from "next/image";
import Link from "next/link";
import { AdminNavigation } from "@/components/layout/AdminNavigation";
import { requireRole } from "@/lib/auth/requireRole";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole(["admin", "commercial"]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-ink">
      <header className="relative z-40 border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
          <Link className="flex items-center gap-3" href="/dashboard">
            <Image alt="Todo Carnes" className="h-9 w-9" height={4500} priority src="/brand/isologo_completo.png" width={4501} />
            <span className="text-base font-semibold text-navy sm:text-lg">Todo Carnes</span>
            <span className="hidden text-xs uppercase tracking-widest text-blue sm:inline">Administración comercial</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm lg:flex">
            <Link
              className="admin-button-secondary px-4 py-2"
              href="/profile"
            >
              {profile.name}
            </Link>
            <form action={logout}>
              <button className="admin-button-secondary px-4 py-2" type="submit">Salir</button>
            </form>
          </div>
          <details className="group relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-navy">
              Menú
              <span aria-hidden className="text-base group-open:rotate-45">＋</span>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-ink/10 bg-white p-3 shadow-xl">
              <AdminNavigation mobile role={profile.role} />
              <Link className="mt-3 block rounded-lg border-t border-ink/10 px-3 py-3 text-sm font-semibold text-navy hover:bg-gray-50" href="/profile">Mi perfil · {profile.name}</Link>
              <form action={logout} className="mt-2 border-t border-ink/10 pt-2">
                <button className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50" type="submit">Cerrar sesión</button>
              </form>
            </div>
          </details>
        </div>
        <AdminNavigation role={profile.role} />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 sm:py-12">{children}</main>
      <footer className="mt-12 border-t border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-xs text-ink/45 sm:flex-row sm:px-8 sm:text-left">
          <div className="flex items-center gap-3">
            <Image alt="Studio Nomade" className="h-8 w-8 object-contain opacity-55 grayscale" height={4500} src="/brand/nomade-logo.png" width={4500} />
            <span>Plataforma desarrollada por Studio Nomade</span>
          </div>
          <span>© 2026 Todo Carnes · Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
}
