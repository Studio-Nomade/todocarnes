import { z } from "zod";

export const imageSlots = ["main", "secondary_1", "secondary_2", "secondary_3"] as const;
export const allImageSlots = ["source", ...imageSlots] as const;

export const imageSlotSchema = z.enum(imageSlots);
export const allImageSlotSchema = z.enum(allImageSlots);

export type ImageSlot = z.infer<typeof imageSlotSchema>;
export type ProductImageSlot = z.infer<typeof allImageSlotSchema>;
