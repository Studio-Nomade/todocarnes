import "server-only";

import sharp from "sharp";
import type { ImageProvider } from "./provider";

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const slotLabels = {
  main: "Imagen principal",
  secondary_1: "Secundaria 1 · Empaque",
  secondary_2: "Secundaria 2 · Ángulo",
  secondary_3: "Secundaria 3 · Caja",
} as const;

export class MockImageProvider implements ImageProvider {
  async generate({ slot }: Parameters<ImageProvider["generate"]>[0]) {
    await delay(1000);
    const label = slotLabels[slot];
    const svg = `
      <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1536" height="1024" fill="#f8f8f9"/>
        <circle cx="1120" cy="270" r="390" fill="#eff4fe"/>
        <path d="M0 880 360 480l260 220 270-340 646 555v109H0Z" fill="#98c0fd" opacity=".55"/>
        <path d="M0 950 380 590l250 210 250-300 656 470v54H0Z" fill="#8ab1fd" opacity=".48"/>
        <rect x="96" y="96" width="1344" height="832" rx="38" fill="none" stroke="#0d244f" stroke-width="4" opacity=".14"/>
        <text x="768" y="485" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#0d244f">${label}</text>
        <text x="768" y="550" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#424242">1536 × 1024 · vista de producto</text>
      </svg>`;
    const buffer = await sharp(Buffer.from(svg)).webp({ quality: 88 }).toBuffer();

    return { buffer, model: "mock-landscape-1536x1024" };
  }
}
