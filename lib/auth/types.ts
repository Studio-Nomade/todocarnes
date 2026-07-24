export const roles = ["admin", "commercial"] as const;

export type Role = (typeof roles)[number];

export type Profile = {
  id: string;
  name: string;
  role: Role;
  status: "active" | "inactive";
};
