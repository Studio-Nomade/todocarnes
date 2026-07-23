export const imagePrompts = {
  image_prompt_base: `Create a realistic commercial product photography image for a meat product catalog.

Product: {{product_title}}
Category: {{category}}
Cut: {{cut}}
Brand: {{brand}}
Origin: {{origin}}

Use the provided reference image as the source of truth for the product shape, packaging, color, and visible brand elements. Keep the product realistic and commercially accurate. Place the product on a clean pure white studio background with soft natural shadows. The style must match a premium B2B frozen meat catalog: clean, bright, minimal, high-resolution, professional product photography.

Do not add text, labels, logos, seals, codes, or packaging information unless they are clearly visible in the provided reference image. Do not invent brand details. No people, no plates, no cooked food, no kitchen environment.

Output one isolated catalog-ready image.`,
  image_prompt_main: `Generate the main hero image for the catalog page. Show the product as the central subject, large and clean, with a realistic studio angle. Use a white background, soft shadows, and optional minimal garnish such as a rosemary sprig and peppercorns only if it matches the existing catalog style. Preserve product realism and do not invent packaging text.`,
  image_prompt_secondary_1: `Generate a secondary catalog image showing the product packaging or front presentation. Keep the image realistic, clean, and aligned with the reference. Use white background and soft shadows. Do not invent readable label details; only preserve visible information from the reference image.`,
  image_prompt_secondary_2: `Generate a secondary catalog image showing the product from an alternate side or diagonal angle. Keep the product consistent with the reference image. Use a clean white background, realistic frozen meat texture, and professional studio lighting.`,
  image_prompt_secondary_3: `Generate a secondary catalog image showing the product in its commercial presentation, such as inside a cardboard box, bag, or grouped packaging, only if this makes sense for the product. Keep the style consistent with a B2B frozen meat catalog. Use a white background and realistic shadows. Do not invent labels or technical information.`,
} as const;
