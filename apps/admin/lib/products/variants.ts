import type { ProductInput } from "../validators/product";

export type VariantField = "box_weight" | "code" | "format" | "units";
export type VariantRow = Record<VariantField, string>;

export const variantFields = ["code", "format", "box_weight", "units"] as const;
export const variantFieldLimits: Record<VariantField, number> = {
  box_weight: 240,
  code: 160,
  format: 240,
  units: 240,
};

export const emptyVariantRow = (): VariantRow => ({
  box_weight: "",
  code: "",
  format: "",
  units: "",
});

function lines(value: string): string[] {
  return value.split("\n");
}

function isActive(row: VariantRow): boolean {
  return variantFields.some((field) => row[field].trim().length > 0);
}

export function buildVariantRows(product: ProductInput): VariantRow[] {
  const rowCount = Math.max(1, ...variantFields.map((field) => lines(product[field]).length));
  return Array.from({ length: rowCount }, (_, rowIndex) =>
    Object.fromEntries(
      variantFields.map((field) => [field, lines(product[field])[rowIndex] ?? ""]),
    ) as VariantRow,
  );
}

export function serializeVariantRows(rows: VariantRow[]): Pick<ProductInput, VariantField> {
  const activeRows = rows.filter(isActive);
  const normalized = activeRows.length ? activeRows : [emptyVariantRow()];
  return Object.fromEntries(
    variantFields.map((field) => [
      field,
      normalized.map((row) => row[field].trim()).join("\n"),
    ]),
  ) as Pick<ProductInput, VariantField>;
}

export function variantInputBudget(
  rows: VariantRow[],
  rowIndex: number,
  field: VariantField,
): number {
  const otherActiveRows = rows.filter((row, index) => index !== rowIndex && isActive(row));
  const usedByOtherRows = otherActiveRows.reduce(
    (total, row) => total + row[field].trim().length,
    0,
  );
  const newlineBudget = otherActiveRows.length;
  return Math.max(0, variantFieldLimits[field] - usedByOtherRows - newlineBudget);
}
