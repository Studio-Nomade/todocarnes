"use client";

import { useState } from "react";
import {
  buildVariantRows,
  emptyVariantRow,
  serializeVariantRows,
  variantInputBudget,
  type VariantField,
  type VariantRow,
} from "@/lib/products/variants";
import type { ProductInput } from "@/lib/validators/product";
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

export function ProductVariantEditor({ onChange, product }: ProductVariantEditorProps) {
  const [rows, setRows] = useState<VariantRow[]>(() => buildVariantRows(product));
  const newRowIndex = rows.length;
  const rowsWithEmpty = [...rows, emptyVariantRow()];
  const canAdd = columns.some(
    ({ field }) => variantInputBudget(rowsWithEmpty, newRowIndex, field) > 0,
  );

  function save(nextRows: VariantRow[]) {
    setRows(nextRows);
    const serialized = serializeVariantRows(nextRows);
    for (const { field } of columns) {
      onChange(field, serialized[field]);
    }
  }

  function update(rowIndex: number, field: VariantField, value: string) {
    save(rows.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row)));
  }

  function add() {
    if (canAdd) {
      save([...rows, emptyVariantRow()]);
    }
  }

  function remove(rowIndex: number) {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    save(nextRows.length ? nextRows : [emptyVariantRow()]);
  }

  return (
    <fieldset className="rounded-xl border border-ink/10 bg-gray-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <legend className="text-sm font-semibold text-navy">Variantes comerciales</legend>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Usa una fila por combinación de código, formato, peso y unidades.
          </p>
        </div>
        <button
          className="admin-button-secondary px-3 py-2 text-xs"
          disabled={!canAdd}
          onClick={add}
          title={canAdd ? "Agregar otra variante" : "Los campos alcanzaron su máximo de caracteres"}
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
                    maxLength={variantInputBudget(rows, rowIndex, field)}
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
