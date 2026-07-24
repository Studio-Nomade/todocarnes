"use client";

import type { CategoryOption, CutOption } from "@/lib/products/types";
import type { ProductInput } from "@/lib/validators/product";

type ProductFormFieldsProps = {
  categories: CategoryOption[];
  cuts: CutOption[];
  onChange: <Key extends keyof ProductInput>(key: Key, value: ProductInput[Key]) => void;
  product: ProductInput;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

export function ProductFormFields({
  categories,
  cuts,
  onChange,
  product,
}: ProductFormFieldsProps) {
  const availableCuts = cuts.filter((cut) => cut.category_id === product.category_id);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-navy">
          Categoría *
          <select
            className={inputClass}
            onChange={(event) => onChange("category_id", event.target.value)}
            required
            value={product.category_id}
          >
            <option value="">Seleccionar</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-navy">
          Corte *
          <select
            className={inputClass}
            disabled={!product.category_id}
            onChange={(event) => onChange("cut_id", event.target.value)}
            required
            value={product.cut_id}
          >
            <option value="">Seleccionar</option>
            {availableCuts.map((cut) => (
              <option key={cut.id} value={cut.id}>{cut.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-navy">
        Nombre del producto *
        <input className={inputClass} maxLength={160} onChange={(event) => onChange("title", event.target.value)} required value={product.title} />
      </label>

      <label className="block text-sm font-medium text-navy">
        Encabezado
        <input className={inputClass} maxLength={120} onChange={(event) => onChange("eyebrow", event.target.value)} placeholder="Ej. Costillar Brasil" value={product.eyebrow} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" name="code" onChange={onChange} product={product} textarea />
        <Field label="Marca" name="brand" onChange={onChange} product={product} />
        <Field label="Procedencia" name="origin" onChange={onChange} product={product} />
        <Field label="Peso caja" name="box_weight" onChange={onChange} product={product} textarea />
        <Field label="Formato" name="format" onChange={onChange} product={product} textarea />
        <Field label="Unidades" name="units" onChange={onChange} product={product} textarea />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-navy">
          Estado
          <select className={inputClass} onChange={(event) => onChange("status", event.target.value as ProductInput["status"])} value={product.status}>
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </label>
        <label className="text-sm font-medium text-navy">
          Mes / campaña
          <input className={inputClass} maxLength={80} onChange={(event) => onChange("month_tag", event.target.value)} placeholder="Ej. Julio 2026" value={product.month_tag} />
        </label>
      </div>

      <label className="block text-sm font-medium text-navy">
        Notas internas
        <textarea className={`${inputClass} min-h-24 resize-y`} maxLength={1000} onChange={(event) => onChange("notes", event.target.value)} value={product.notes} />
      </label>
    </div>
  );
}

type FieldName = "box_weight" | "brand" | "code" | "format" | "origin" | "units";

function Field({
  label,
  name,
  onChange,
  product,
  textarea = false,
}: {
  label: string;
  name: FieldName;
  onChange: ProductFormFieldsProps["onChange"];
  product: ProductInput;
  textarea?: boolean;
}) {
  const props = {
    className: `${inputClass} ${textarea ? "min-h-[42px] resize-y" : ""}`,
    maxLength: 240,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, event.target.value),
    value: product[name],
  };

  return (
    <label className="text-sm font-medium text-navy">
      {label}
      {textarea ? <textarea {...props} rows={1} /> : <input {...props} />}
    </label>
  );
}
