"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { ProductOptions } from "@/lib/products/types";
import type { ProductImageRecord } from "@/lib/images/types";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { ProductFormFields } from "./ProductFormFields";
import { ProductLivePreview } from "./ProductLivePreview";
import { ProductImageGallery } from "./ProductImageGallery";

type ProductEditorProps = ProductOptions & {
  initialProduct: ProductInput;
  images?: ProductImageRecord[];
  productId?: string;
};

export function ProductEditor({
  categories,
  cuts,
  images = [],
  initialProduct,
  productId,
}: ProductEditorProps) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof ProductInput>(key: Key, value: ProductInput[Key]) {
    setProduct((current) => {
      if (key === "category_id" && value !== current.category_id) {
        return { ...current, category_id: String(value), cut_id: "" };
      }
      return { ...current, [key]: value };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = productSchema.safeParse(product);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios.");
      return;
    }

    startTransition(async () => {
      const result = productId
        ? await updateProduct(productId, parsed.data)
        : await createProduct(parsed.data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/products/${result.id}?saved=1`);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(420px,1fr)_605px]">
        <form className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6" onSubmit={handleSubmit}>
        <ProductFormFields categories={categories} cuts={cuts} onChange={updateField} product={product} />
        {error ? (
          <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-ink/65 hover:bg-gray-50" href="/products">Cancelar</Link>
          <button className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-wait disabled:opacity-60" disabled={isPending} type="submit">
            {isPending ? "Guardando…" : productId ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
        </form>
        <ProductLivePreview categories={categories} cuts={cuts} images={images} product={product} />
      </div>
      {productId ? <ProductImageGallery images={images} productId={productId} /> : null}
    </div>
  );
}
