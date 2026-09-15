import type { CommercialArea } from "@/lib/agenda/types";

export const LANDING_AREA_OPTIONS: { value: CommercialArea; label: string }[] = [
  { value: "food_service", label: "Food Service" },
  { value: "retail_ggcc", label: "Retail / GGCC" },
  { value: "mmpp_trimmings", label: "MMPP / Trimmings" },
  { value: "ventas_nacionales", label: "Ventas Nacionales" },
  { value: "maquila_desarrollo", label: "Maquila / desarrollo" },
  { value: "marca_propia", label: "Marca propia" },
  { value: "otro", label: "Otro" },
];
