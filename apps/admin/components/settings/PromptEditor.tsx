"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updatePromptTemplate } from "@/lib/actions/settings";
import { promptLabels } from "@/lib/settings/config";
import type { PromptSetting } from "@/lib/settings/types";

export function PromptEditor({ setting }: { setting: PromptSetting }) {
  const router = useRouter();
  const [value, setValue] = useState(setting.value);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await updatePromptTemplate(setting.key, value);
      if (!result.success) {
        setMessage(result.error);
        return;
      }
      setMessage("Prompt actualizado.");
      router.refresh();
    });
  }

  return (
    <article className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy">{promptLabels[setting.key]}</h3>
          <p className="mt-1 font-mono text-xs text-ink/45">{setting.key}</p>
        </div>
        <button
          className="admin-button-primary px-4 py-2"
          disabled={isPending || value === setting.value}
          onClick={save}
          type="button"
        >
          {isPending ? "Guardando…" : "Guardar prompt"}
        </button>
      </div>
      <textarea
        className="mt-4 min-h-64 w-full resize-y rounded-lg border border-ink/15 px-4 py-3 text-sm leading-6 outline-none focus:border-blue"
        onChange={(event) => setValue(event.target.value)}
        spellCheck
        value={value}
      />
      <div className="mt-2 flex flex-col gap-1 text-xs text-ink/45 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span>Variables permitidas: producto, corte y categoría.</span>
        <span>{value.length.toLocaleString("es-CL")} caracteres</span>
      </div>
      {message ? (
        <p className="mt-3 text-sm font-medium text-ink/70" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}
