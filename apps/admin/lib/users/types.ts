import type { Role } from "@/lib/auth/types";
import type { CommercialArea } from "@/lib/leads/constants";

export type UserRecord = {
  createdAt: string;
  email: string;
  id: string;
  area: CommercialArea | null;
  /** Todas las áreas que cubre; `area` es la principal (= areas[0]). */
  areas: CommercialArea[];
  isPublic: boolean;
  jobTitle: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  publicBio: string;
  publicOrder: number;
  role: Role;
  status: "active" | "inactive";
  whatsapp: string;
};

export type UserMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };

export type PublicProfileMutationResult =
  | { error: string; success: false }
  | { profile: Pick<UserRecord, "area" | "areas" | "isPublic" | "photoUrl" | "publicBio" | "publicOrder" | "whatsapp">; success: true };

export type ProfilePhotoMutationResult =
  | { error: string; success: false }
  | { photoUrl: string; success: true };
