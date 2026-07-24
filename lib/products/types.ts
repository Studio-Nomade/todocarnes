import type { ProductInput, ProductStatus } from "@/lib/validators/product";

export type CategoryOption = {
  id: string;
  name: "Cerdo" | "Pollo" | "Vacuno" | "Trimming";
  slug: string;
  sort_order: number;
};

export type CutOption = {
  category_id: string;
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ProductRecord = ProductInput & {
  category: CategoryOption;
  created_at: string;
  cut: CutOption;
  id: string;
  status: ProductStatus;
  updated_at: string;
};

export type ProductOptions = {
  brands: string[];
  categories: CategoryOption[];
  cuts: CutOption[];
};

export type ProductListResult = ProductOptions & {
  products: ProductRecord[];
};

export type ProductMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
