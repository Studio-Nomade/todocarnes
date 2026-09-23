import type { CourtesyStatus } from "./constants";

export type CourtesyRequestItem = {
  cargo: string;
  company: string;
  createdAt: string;
  email: string;
  eventId: string;
  eventName: string;
  id: string;
  lastName: string;
  name: string;
  phone: string;
  rut: string;
  status: CourtesyStatus;
};

export type CourtesyFilters = {
  page: number;
  search?: string;
  status?: CourtesyStatus;
};

export type CourtesyListResult = {
  filters: CourtesyFilters;
  items: CourtesyRequestItem[];
  page: number;
  pageCount: number;
  total: number;
};
