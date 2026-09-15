type VariantColumn = "boxWeight" | "code" | "format" | "units";

type ProductVariantTableProps = {
  boxWeight?: string | null;
  code?: string | null;
  format?: string | null;
  units?: string | null;
};

const columns = [
  ["format", "Formato"],
  ["units", "Unidades"],
  ["code", "Código"],
  ["boxWeight", "Peso caja"],
] as const satisfies ReadonlyArray<readonly [VariantColumn, string]>;

function split(value: string | null | undefined): string[] {
  return value?.split("\n") ?? [""];
}

export function hasMultipleVariants(values: ProductVariantTableProps): boolean {
  return columns.some(([key]) => split(values[key]).length > 1);
}

export function ProductVariantTable(values: ProductVariantTableProps) {
  const rowCount = Math.max(...columns.map(([key]) => split(values[key]).length));
  const rowClass = rowCount > 5
    ? "h-[28px] text-[8px]"
    : "h-[32px] text-[9px]";

  return (
    <div className="mt-1 overflow-hidden border-y border-ink/20">
      <div className="grid h-[24px] grid-cols-[1.35fr_1.15fr_0.75fr_1.1fr] bg-navy text-white">
        {columns.map(([, label]) => (
          <div
            className="flex items-center border-r border-white/20 px-1.5 text-[9px] font-semibold uppercase leading-none last:border-r-0"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <div
          className={`grid grid-cols-[1.35fr_1.15fr_0.75fr_1.1fr] border-b border-ink/15 text-ink last:border-b-0 ${rowClass}`}
          key={rowIndex}
        >
          {columns.map(([key]) => (
            <div
              className="flex min-w-0 items-center overflow-hidden border-r border-ink/15 px-1.5 font-medium uppercase leading-[1.1] last:border-r-0"
              key={key}
            >
              {split(values[key])[rowIndex]?.trim() || "N/A"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
