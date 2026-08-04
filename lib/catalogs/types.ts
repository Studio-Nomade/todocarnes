export type CatalogStatus = "draft" | "ready" | "exported";

export type CatalogRecord = {
  clientLogoPath: string | null;
  clientLogoUrl: string | null;
  clientName: string | null;
  id: string;
  title: string;
  month: number;
  year: number;
  status: CatalogStatus;
  itemCount: number;
  updatedAt: string;
};

export type CatalogItemProduct = {
  productId: string;
  itemSortOrder: number;
  category: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  cut: string;
  title: string;
  status: "draft" | "active" | "inactive";
  hasApprovedImages: boolean;
};

export type CatalogMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
