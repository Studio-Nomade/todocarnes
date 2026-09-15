import type { CommercialArea, LeadStatus } from "./constants";

export type CommercialOption = { id: string; name: string };

export type LeadListItem = {
  area: CommercialArea | null;
  assignedRepId: string | null;
  assignedRepName: string | null;
  company: string | null;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  source: "landing" | "agenda_contact";
  status: LeadStatus;
};

export type LeadDetail = LeadListItem & {
  cameFrom: string | null;
  message: string | null;
  phone: string | null;
};

export type LeadListResult = {
  filters: LeadFilters;
  items: LeadListItem[];
  page: number;
  pageCount: number;
  total: number;
};

export type LeadFilters = {
  area?: CommercialArea;
  assignedRepId?: string;
  page: number;
  search?: string;
  status?: LeadStatus;
};

export type LeadMutationState = { error?: string; success: boolean };
