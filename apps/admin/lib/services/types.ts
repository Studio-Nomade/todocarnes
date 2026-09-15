export type ServiceStatus = "active" | "inactive";

export type ServiceRecord = {
  description: string;
  id: string;
  sortOrder: number;
  status: ServiceStatus;
  title: string;
};

export type ServiceMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
