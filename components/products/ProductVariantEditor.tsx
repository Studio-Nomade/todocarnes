"use client";

import type { ProductInput } from "@/lib/validators/product";

type VariantField = "box_weight" | "code" | "format" | "units";
type ProductVariantEditorProps = {
  onChange: <Key extends keyof ProductInput>(key: Key, value: ProductInput[Key]) => void;
  product: ProductInput;
};

const columns = [
  { field: "code", label: "Código", placeholder: "CF-0000" },
  { field: "format", label: "Formato", placeholder: "Envasado / caja" },
  { field: "box_weight", label: "Peso caja", placeholder: "20 KG" },
  { field: "units", label: "Unidades", placeholder: "4 unidades" },
] as const satisfies ReadonlyArray<{
  field: VariantField;
  label: string;
  placeholder: string;
}>;

const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

function lines(value: string): string[] {
  return value.split("\n");
}

export function ProductVariantEditor({ onChange, product }: ProductVariantEditorProps) {
  const rowCount = Math.max(1, ...columns.map(({ field }) => lines(product[field]).length));
  const rows = Array.from({ length: rowCount }, (_, rowIndex) =>
    Object.fromEntries(
      columns.map(({ field }) => [field, lines(product[field])[rowIndex] ?? ""]),
    ) as Record<VariantField, string>,
  );

  function save(nextRows: Array<Record<VariantField, string>>) {
    for (const { field } of columns) {
      onChange(field, nextRows.map((row) => row[field]).join("\n"));
    }
  }

  function update(rowIndex: number, field: VariantField, value: string) {
    save(rows.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row)));
  }

  function add() {
    save([
      ...rows,
      { box_weight: "", code: "", format: "", units: "" },
    ]);
  }

  function remove(rowIndex: number) {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    save(nextRows.length ? nextRows : [{ box_weight: "", code: "", format: "", units: "" }]);
  }

  return (
    <fieldset className="rounded-xl border border-ink/10 bg-gray-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <legend className="text-sm font-semibold text-navy">Variantes comerciales</legend>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Usá una fila por combinación de código, formato, peso y unidades.
          </p>
        </div>
        <button
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-blue-50"
          onClick={add}
          type="button"
        >
          + Agregar variante
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((row, rowIndex) => (
          <div className="rounded-lg border border-ink/10 bg-white p-3" key={rowIndex}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue">
                Variante {rowIndex + 1}
              </span>
              {rows.length > 1 ? (
                <button
                  className="text-xs font-semibold text-red-700 hover:underline"
                  onClick={() => remove(rowIndex)}
                  type="button"
                >
                  Quitar
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {columns.map(({ field, label, placeholder }) => (
                <label className="text-xs font-medium text-navy" key={field}>
                  {label}
                  <input
                    className={inputClass}
                    maxLength={240}
                    onChange={(event) => update(rowIndex, field, event.target.value)}
                    placeholder={placeholder}
                    value={row[field]}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
