export const leadStatuses = ["new", "contacted", "qualified", "closed", "discarded"] as const;
export const commercialAreas = ["food_service", "retail_ggcc", "mmpp_trimmings", "ventas_nacionales", "maquila_desarrollo", "marca_propia", "otro"] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type CommercialArea = (typeof commercialAreas)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed: "Cerrado",
  discarded: "Descartado",
};

export const AREA_LABELS: Record<CommercialArea, string> = {
  food_service: "Food Service",
  retail_ggcc: "Retail / GGCC",
  mmpp_trimmings: "MMPP / Trimmings",
  ventas_nacionales: "Ventas nacionales",
  maquila_desarrollo: "Maquila / Desarrollo",
  marca_propia: "Marca propia",
  otro: "Otro",
};

export const LEAD_PAGE_SIZE = 20;

const transitions: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ["contacted", "discarded"],
  contacted: ["qualified", "closed", "discarded"],
  qualified: ["closed", "discarded"],
  closed: [],
  discarded: [],
};

export function availableLeadStatuses(current: LeadStatus): readonly LeadStatus[] {
  return transitions[current];
}

export function canTransitionLead(current: LeadStatus, next: LeadStatus): boolean {
  return current === next || transitions[current].includes(next);
}

/** "Retail / GGCC + Food Service"; cae al área principal si no hay lista. */
export function areasLabel(areas: readonly CommercialArea[] | null | undefined, fallback: CommercialArea | null = null) {
  const list = areas?.length ? [...new Set(areas)] : fallback ? [fallback] : [];
  return list.length ? list.map((area) => AREA_LABELS[area]).join(" + ") : null;
}
