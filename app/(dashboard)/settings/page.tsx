import { DailyLimitEditor } from "@/components/settings/DailyLimitEditor";
import { GenerationHistory } from "@/components/settings/GenerationHistory";
import { PromptEditor } from "@/components/settings/PromptEditor";
import { SettingsOverview } from "@/components/settings/SettingsOverview";
import { requireRole } from "@/lib/auth/requireRole";
import {
  getGenerationHistory,
  getPromptSettings,
  getSettingsOverview,
} from "@/lib/settings/data";

export default async function SettingsPage() {
  await requireRole(["admin"]);
  const [overview, prompts, history] = await Promise.all([
    getSettingsOverview(),
    getPromptSettings(),
    getGenerationHistory(),
  ]);

  return (
    <section className="space-y-10">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue">Solo administradores</p>
      <div>
        <h1 className="text-3xl font-semibold text-navy">Configuración de imágenes</h1>
        <p className="mt-3 max-w-3xl text-ink/70">
          Controlá la conexión, el gasto diario y los prompts que usa cada vista del catálogo.
        </p>
      </div>

      <SettingsOverview connected={overview.connected} usage={overview.usage} />
      <DailyLimitEditor initialLimit={overview.usage.limit} />

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-navy">Prompts de generación</h2>
          <p className="mt-2 text-sm text-ink/60">
            Templates validados en español. Los cambios aplican a las próximas generaciones.
          </p>
        </div>
        <div className="space-y-5">
          {prompts.map((setting) => (
            <PromptEditor key={setting.key} setting={setting} />
          ))}
        </div>
      </section>

      <GenerationHistory items={history} />
    </section>
  );
}
