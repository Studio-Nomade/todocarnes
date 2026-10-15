export type CutRecord = {
  categoryId: string;
  categoryName: string;
  id: string;
  name: string;
  productCount: number;
  slug: string;
  sortOrder: number;
};

export type CutCategory = { id: string; name: string; sortOrder: number };

export type CutMutationResult =
  | { error: string; success: false }
  | { id: string; success: true };
