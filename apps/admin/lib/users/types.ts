import type { Role } from "@/lib/auth/types";

export type UserRecord = {
  createdAt: string;
  email: string;
  id: string;
  jobTitle: string;
  name: string;
  phone: string;
  role: Role;
  status: "active" | "inactive";
};

export type UserMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
