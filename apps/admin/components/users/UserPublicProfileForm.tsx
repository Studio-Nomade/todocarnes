"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { updateCommercialPublicProfile, uploadCommercialPhoto } from "@/lib/actions/users";
import { AREA_LABELS, commercialAreas } from "@/lib/leads/constants";
import type { UserRecord } from "@/lib/users/types";

export function UserPublicProfileForm({
  onChange,
  user,
}: {
  onChange: (profile: Partial<UserRecord>) => void;
  user: UserRecord;
}) {
  const [area, setArea] = useState(user.area ?? "");
  const [bio, setBio] = useState(user.publicBio);
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [order, setOrder] = useState(String(user.publicOrder));
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await updateCommercialPublicProfile({
        area: area || null,
        isPublic,
        publicBio: bio,
        publicOrder: order,
        userId: user.id,
        whatsapp,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChange(result.profile);
      setNotice("Perfil público actualizado.");
    });
  }

  function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setNotice("");
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadCommercialPhoto(user.id, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChange({ photoUrl: result.photoUrl });
      setNotice("Fotografía actualizada.");
    });
    event.target.value = "";
  }

  const inputClass = "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

  return (
    <form className="mt-4 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2" onSubmit={save}>
      <div className="flex items-center gap-4 sm:col-span-2">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blue-50">
          {user.photoUrl ? (
            <Image alt={`Fotografía de ${user.name}`} className="object-cover" fill sizes="80px" src={user.photoUrl} />
          ) : (
            <span className="grid h-full place-items-center font-semibold text-navy/50">Sin foto</span>
          )}
        </div>
        <label className="text-sm font-semibold text-navy">
          Fotografía pública
          <input accept="image/jpeg,image/png,image/webp" className="mt-2 block max-w-full text-xs font-normal text-ink/60" disabled={isPending} onChange={upload} type="file" />
        </label>
      </div>
      <label className="text-sm font-semibold text-navy">
        Área
        <select className={inputClass} disabled={isPending} onChange={(event) => setArea(event.target.value)} value={area}>
          <option value="">Sin área</option>
          {commercialAreas.map((value) => <option key={value} value={value}>{AREA_LABELS[value]}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-navy">
        Orden público
        <input className={inputClass} disabled={isPending} max="999" min="0" onChange={(event) => setOrder(event.target.value)} type="number" value={order} />
      </label>
      <label className="text-sm font-semibold text-navy sm:col-span-2">
        WhatsApp
        <input className={inputClass} disabled={isPending} onChange={(event) => setWhatsapp(event.target.value)} placeholder="+56 9 1234 5678" value={whatsapp} />
      </label>
      <label className="text-sm font-semibold text-navy sm:col-span-2">
        Biografía pública
        <textarea className={`${inputClass} min-h-24`} disabled={isPending} maxLength={600} onChange={(event) => setBio(event.target.value)} value={bio} />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy sm:col-span-2">
        <input checked={isPublic} disabled={isPending} onChange={(event) => setIsPublic(event.target.checked)} type="checkbox" />
        Mostrar en el sitio y la agenda
      </label>
      {error ? <p className="text-sm text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-700 sm:col-span-2" role="status">{notice}</p> : null}
      <div className="sm:col-span-2">
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Guardar perfil público"}
        </button>
      </div>
    </form>
  );
}
