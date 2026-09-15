export const roles = ["admin", "commercial"] as const;

export type Role = (typeof roles)[number];

export type Profile = {
  email: string;
  id: string;
  jobTitle: string;
  name: string;
  phone: string;
  role: Role;
  status: "active" | "inactive";
};
