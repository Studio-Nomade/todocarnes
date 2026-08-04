"use client";

import { useState, useTransition } from "react";
import { createCommercialUser, setUserStatus } from "@/lib/actions/users";
import type { UserRecord } from "@/lib/users/types";
import type { CommercialUserInput } from "@/lib/validators/user";
import { UserForm } from "./UserForm";

export function UserManager({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string;
  initialUsers: UserRecord[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function add(values: CommercialUserInput) {
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await createCommercialUser(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setUsers((current) => [
        ...current,
        {
          createdAt: new Date().toISOString(),
          email: values.email,
          id: result.id,
          jobTitle: values.jobTitle ?? "",
          name: values.name,
          phone: values.phone ?? "",
          role: "commercial",
          status: "active",
        },
      ]);
      setNotice(`Se creó la cuenta de ${values.name}.`);
    });
  }

  function toggle(user: UserRecord) {
    const status = user.status === "active" ? "inactive" : "active";
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await setUserStatus(user.id, status);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setUsers((current) => current.map((item) => (
        item.id === user.id ? { ...item, status } : item
      )));
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-navy">Nuevo comercial</h2>
        <p className="mt-1 text-sm text-ink/55">Podrá gestionar catálogos y enviar correos con su firma.</p>
        <UserForm disabled={isPending} onSubmit={add} />
      </div>

      <div className="space-y-3">
        {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
        {notice ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">{notice}</p> : null}
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
          <ul className="divide-y divide-ink/10">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <li className="flex flex-wrap items-center gap-3 px-5 py-4" key={user.id}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-navy">{user.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        user.role === "admin" ? "bg-blue-50 text-blue" : "bg-gray-100 text-ink/60"
                      }`}>
                        {user.role === "admin" ? "Admin" : "Comercial"}
                      </span>
                      {isSelf ? <span className="text-[11px] text-ink/40">tú</span> : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-ink/55">
                      {user.email}{user.jobTitle ? ` · ${user.jobTitle}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    user.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-ink/55"
                  }`}>
                    {user.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                  <button
                    className={`shrink-0 text-xs font-semibold disabled:opacity-30 ${
                      user.status === "active" ? "text-red-700 hover:underline" : "text-emerald-700 hover:underline"
                    }`}
                    disabled={isPending || (isSelf && user.status === "active")}
                    onClick={() => toggle(user)}
                    title={isSelf && user.status === "active" ? "No puedes desactivar tu propia cuenta" : undefined}
                    type="button"
                  >
                    {user.status === "active" ? "Desactivar" : "Activar"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
