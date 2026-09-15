"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/requireRole";
import { assertWithinDailyLimit } from "@/lib/images/daily-limit";
import { ImageGenerationError } from "@/lib/images/errors";
import { buildPrompt } from "@/lib/images/prompt-builder";
import { getImageProvider } from "@/lib/images/provider";
import { imageSlotSchema, type ProductImageSlot } from "@/lib/images/slots";
import type { ImageMutationResult } from "@/lib/images/types";
import { validateAndConvertImage } from "@/lib/images/upload";
import { createAdminClient } from "@/lib/supabase/admin";
import { productIdSchema } from "@/lib/validators/product";

const roles = ["admin", "commercial"] as const;
const imageIdSchema = z.string().uuid("La imagen no es válida.");
const uploadSchema = z.object({
  file: z.instanceof(File),
  productId: productIdSchema,
});
const manualUploadSchema = uploadSchema.extend({ slot: imageSlotSchema });
const generationSchema = z.object({ productId: productIdSchema, slot: imageSlotSchema });

const generationProductSchema = z.object({
  category_id: z.string().uuid(),
  cut_id: z.string().uuid(),
  id: z.string().uuid(),
  title: z.string().min(1),
});

const namedEntitySchema = z.object({ name: z.string().min(1) });
const sourceImageSchema = z.object({ storage_path: z.string().min(1) });
const idResultSchema = z.object({ id: z.string().uuid() });

function imageFile(formData: FormData): unknown {
  return formData.get("file");
}

function imagePath(productId: string, slot: ProductImageSlot): string {
  return `${productId}/${slot}/${randomUUID()}.webp`;
}

async function storeImage(input: {
  buffer: Buffer;
  createdBy: string;
  generatedByAi: boolean;
  productId: string;
  promptUsed: string | null;
  slot: ProductImageSlot;
}): Promise<string> {
  const admin = createAdminClient();
  const storagePath = imagePath(input.productId, input.slot);
  const upload = await admin.storage
    .from("product-images")
    .upload(storagePath, input.buffer, { contentType: "image/webp", upsert: false });
  if (upload.error) {
    throw new Error(`No se pudo guardar la imagen: ${upload.error.message}`);
  }

  const image = await admin
    .from("product_images")
    .insert({
      created_by: input.createdBy,
      generated_by_ai: input.generatedByAi,
      product_id: input.productId,
      prompt_used: input.promptUsed,
      slot: input.slot,
      status: "pending",
      storage_path: storagePath,
    })
    .select("id")
    .single();
  const parsedImage = idResultSchema.safeParse(image.data);
  if (image.error || !parsedImage.success) {
    await admin.storage.from("product-images").remove([storagePath]);
    throw new Error("No se pudo registrar la imagen.");
  }

  return parsedImage.data.id;
}

async function approveStoredImage(imageId: string): Promise<void> {
  const admin = createAdminClient();
  const result = await admin.rpc("approve_product_image", { target_image_id: imageId });
  if (result.error) {
    throw new Error(`No se pudo aprobar la imagen: ${result.error.message}`);
  }
}

async function generationContext(productId: string) {
  const admin = createAdminClient();
  const productResult = await admin
    .from("products")
    .select("id,title,category_id,cut_id")
    .eq("id", productId)
    .single();
  const product = generationProductSchema.safeParse(productResult.data);
  if (productResult.error || !product.success) {
    throw new Error("No se encontró el producto.");
  }

  const [categoryResult, cutResult, sourceResult] = await Promise.all([
    admin.from("categories").select("name").eq("id", product.data.category_id).single(),
    admin.from("cuts").select("name").eq("id", product.data.cut_id).single(),
    admin
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId)
      .eq("slot", "source")
      .eq("status", "approved")
      .maybeSingle(),
  ]);
  const category = namedEntitySchema.safeParse(categoryResult.data);
  const cut = namedEntitySchema.safeParse(cutResult.data);
  const source = sourceImageSchema.safeParse(sourceResult.data);
  if (categoryResult.error || cutResult.error || !category.success || !cut.success) {
    throw new Error("El producto no tiene categoría o corte válido.");
  }
  if (sourceResult.error || !source.success) {
    throw new Error("Sube una imagen fuente antes de generar.");
  }

  return {
    product: { category: category.data.name, cut: cut.data.name, title: product.data.title },
    sourcePath: source.data.storage_path,
  };
}

export async function uploadSourceImage(
  productId: unknown,
  formData: FormData,
): Promise<ImageMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = uploadSchema.safeParse({ file: imageFile(formData), productId });
  if (!parsed.success) {
    return { error: "Selecciona una imagen JPG, PNG o WebP.", success: false };
  }

  try {
    const buffer = await validateAndConvertImage(parsed.data.file);
    const id = await storeImage({
      buffer,
      createdBy: profile.id,
      generatedByAi: false,
      productId: parsed.data.productId,
      promptUsed: null,
      slot: "source",
    });
    await approveStoredImage(id);
    revalidatePath(`/products/${parsed.data.productId}`);
    return { id, success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen.", success: false };
  }
}

export async function uploadManualImage(
  productId: unknown,
  slot: unknown,
  formData: FormData,
): Promise<ImageMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = manualUploadSchema.safeParse({ file: imageFile(formData), productId, slot });
  if (!parsed.success) {
    return { error: "La imagen o el slot no son válidos.", success: false };
  }

  try {
    const buffer = await validateAndConvertImage(parsed.data.file);
    const id = await storeImage({
      buffer,
      createdBy: profile.id,
      generatedByAi: false,
      productId: parsed.data.productId,
      promptUsed: null,
      slot: parsed.data.slot,
    });
    revalidatePath(`/products/${parsed.data.productId}`);
    return { id, success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen.", success: false };
  }
}

export async function generateProductImage(
  productId: unknown,
  slot: unknown,
): Promise<ImageMutationResult> {
  const profile = await requireRole([...roles]);
  const parsed = generationSchema.safeParse({ productId, slot });
  if (!parsed.success) {
    return { error: "El producto o el slot no son válidos.", success: false };
  }

  const admin = createAdminClient();
  let jobId: string | null = null;
  let jobModel = "pending";
  try {
    await assertWithinDailyLimit();
    const context = await generationContext(parsed.data.productId);
    const prompt = await buildPrompt(context.product, parsed.data.slot);
    const source = await admin.storage.from("product-images").download(context.sourcePath);
    if (source.error || !source.data) {
      throw new Error("No se pudo leer la imagen fuente.");
    }

    const jobResult = await admin
      .from("image_generation_jobs")
      .insert({
        created_by: profile.id,
        model: "pending",
        product_id: parsed.data.productId,
        prompt,
        requested_slot: parsed.data.slot,
        status: "processing",
      })
      .select("id")
      .single();
    const job = idResultSchema.safeParse(jobResult.data);
    if (jobResult.error || !job.success) {
      throw new Error("No se pudo iniciar la generación.");
    }
    jobId = job.data.id;

    const generated = await getImageProvider().generate({
      prompt,
      slot: parsed.data.slot,
      sourceImage: Buffer.from(await source.data.arrayBuffer()),
    });
    jobModel = generated.model;
    const imageId = await storeImage({
      buffer: generated.buffer,
      createdBy: profile.id,
      generatedByAi: true,
      productId: parsed.data.productId,
      promptUsed: prompt,
      slot: parsed.data.slot,
    });
    const completed = await admin
      .from("image_generation_jobs")
      .update({ model: generated.model, result_image_id: imageId, status: "completed" })
      .eq("id", jobId);
    if (completed.error) {
      throw new Error("La imagen se guardó, pero no se pudo cerrar su historial.");
    }

    revalidatePath(`/products/${parsed.data.productId}`);
    return { id: imageId, success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo generar la imagen.";
    if (jobId) {
      const logMessage = error instanceof ImageGenerationError ? error.logMessage : message;
      const model = error instanceof ImageGenerationError ? error.model : jobModel;
      await admin
        .from("image_generation_jobs")
        .update({ error_message: logMessage, model, status: "failed" })
        .eq("id", jobId);
    }
    return { error: message, success: false };
  }
}

export async function approveImage(imageId: unknown): Promise<ImageMutationResult> {
  await requireRole([...roles]);
  const parsedId = imageIdSchema.safeParse(imageId);
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "La imagen no es válida.", success: false };
  }

  const admin = createAdminClient();
  const imageResult = await admin
    .from("product_images")
    .select("id,product_id")
    .eq("id", parsedId.data)
    .single();
  const image = z.object({ id: imageIdSchema, product_id: productIdSchema }).safeParse(imageResult.data);
  if (imageResult.error || !image.success) {
    return { error: "No se encontró la imagen.", success: false };
  }

  try {
    await approveStoredImage(image.data.id);
    revalidatePath(`/products/${image.data.product_id}`);
    return { id: image.data.id, success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "No se pudo aprobar.", success: false };
  }
}

export async function rejectImage(imageId: unknown): Promise<ImageMutationResult> {
  await requireRole([...roles]);
  const parsedId = imageIdSchema.safeParse(imageId);
  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message ?? "La imagen no es válida.", success: false };
  }

  const admin = createAdminClient();
  const result = await admin
    .from("product_images")
    .update({ status: "rejected" })
    .eq("id", parsedId.data)
    .select("id,product_id")
    .single();
  const image = z.object({ id: imageIdSchema, product_id: productIdSchema }).safeParse(result.data);
  if (result.error || !image.success) {
    return { error: "No se pudo rechazar la imagen.", success: false };
  }

  revalidatePath(`/products/${image.data.product_id}`);
  return { id: image.data.id, success: true };
}
