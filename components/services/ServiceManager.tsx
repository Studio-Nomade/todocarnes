"use client";

import { useState, useTransition } from "react";
import { createService, setServiceStatus, updateService } from "@/lib/actions/services";
import type { ServiceRecord } from "@/lib/services/types";
import { ServiceForm } from "./ServiceForm";

export function ServiceManager({ initialServices }: { initialServices: ServiceRecord[] }) {
  const [services, setServices] = useState(initialServices);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function add(values: { description: string; title: string }) {
    setError("");
    startTransition(async () => {
      const result = await createService(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setServices((current) => [
        ...current,
        { ...values, id: result.id, sortOrder: current.length, status: "active" },
      ]);
    });
  }

  function update(id: string, values: { description: string; title: string }) {
    setError("");
    startTransition(async () => {
      const result = await updateService(id, values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setServices((current) => current.map((service) => (
        service.id === id ? { ...service, ...values } : service
      )));
    });
  }

  function toggle(service: ServiceRecord) {
    const status = service.status === "active" ? "inactive" : "active";
    setError("");
    startTransition(async () => {
      const result = await setServiceStatus(service.id, status);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setServices((current) => current.map((item) => (
        item.id === service.id ? { ...item, status } : item
      )));
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
      <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-navy">Añadir servicio</h2>
        <p className="mt-1 text-sm text-ink/55">Se mostrará en los próximos catálogos.</p>
        <ServiceForm disabled={isPending} onSubmit={add} submitLabel="Añadir servicio" />
      </div>

      <div className="space-y-3">
        {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center text-sm text-ink/55">
            Todavía no hay servicios registrados.
          </div>
        ) : services.map((service) => (
          <details className="group rounded-xl border border-ink/10 bg-white shadow-sm" key={service.id}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-navy">{service.title}</h2>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    service.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-ink/55"
                  }`}>
                    {service.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{service.description}</p>
              </div>
              <span aria-hidden className="shrink-0 text-xl text-blue group-open:rotate-45">＋</span>
            </summary>
            <div className="border-t border-ink/10 p-5">
              <ServiceForm
                disabled={isPending}
                initialValues={service}
                onSubmit={(values) => update(service.id, values)}
                submitLabel="Guardar cambios"
              />
              <button
                className={`mt-4 text-sm font-semibold ${service.status === "active" ? "text-red-700" : "text-emerald-700"}`}
                disabled={isPending}
                onClick={() => toggle(service)}
                type="button"
              >
                {service.status === "active" ? "Desactivar servicio" : "Activar servicio"}
              </button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
