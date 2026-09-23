export type AssignedSlot = {
  file: string;
  order: number;
  slot: "main" | "secondary_1" | "secondary_2" | "secondary_3";
  status: "approved" | "pending";
};

function byteSort(values: string[]): string[] {
  return [...values].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

function basenameWithoutExtension(file: string): string {
  return (file.split("/").pop() ?? file).replace(/\.[^.]+$/, "");
}

function targetFromKeyword(file: string): AssignedSlot["slot"] | null {
  const name = basenameWithoutExtension(file).toLowerCase();
  if (/caja|box/.test(name)) return "secondary_3";
  if (/empaque|etiqueta|vacio|vacío|bolsa|pack/.test(name)) return "secondary_1";
  return null;
}

export function assignSlots(files: string[]): AssignedSlot[] {
  const eligible = byteSort(files.filter((file) => /\.(?:jpe?g|png)$/i.test(file) && basenameWithoutExtension(file) !== ".DS_Store"));
  if (eligible.length === 0) return [];

  const vistaOneHero = eligible.find((file) => /^catalogo vista 1$/i.test(basenameWithoutExtension(file)));
  const exactHero = eligible.find((file) => basenameWithoutExtension(file).toLowerCase() === "catalogo");
  const prefixedHero = eligible.find((file) => basenameWithoutExtension(file).toLowerCase().startsWith("catalogo"));
  const hero = vistaOneHero ?? exactHero ?? prefixedHero ?? eligible[0];
  const assigned: AssignedSlot[] = [{ file: hero, order: 0, slot: "main", status: "approved" }];
  const usedApproved = new Set<AssignedSlot["slot"]>(["main"]);
  const remaining: string[] = [];

  for (const file of eligible) {
    if (file === hero) continue;
    const keywordSlot = targetFromKeyword(file);
    if (keywordSlot) {
      const approved = !usedApproved.has(keywordSlot);
      assigned.push({ file, order: 0, slot: keywordSlot, status: approved ? "approved" : "pending" });
      if (approved) usedApproved.add(keywordSlot);
    } else if (basenameWithoutExtension(file).toLowerCase().startsWith("catalogo")) {
      assigned.push({ file, order: 0, slot: "main", status: "pending" });
    } else {
      remaining.push(file);
    }
  }

  const preferredSlots: AssignedSlot["slot"][] = ["secondary_1", "secondary_2", "secondary_3"];
  for (const file of remaining) {
    const available = preferredSlots.find((slot) => !usedApproved.has(slot));
    const slot = available ?? "secondary_2";
    const approved = !usedApproved.has(slot);
    assigned.push({ file, order: 0, slot, status: approved ? "approved" : "pending" });
    if (approved) usedApproved.add(slot);
  }

  const orders = new Map<AssignedSlot["slot"], number>();
  return assigned
    .sort((left, right) => left.file < right.file ? -1 : left.file > right.file ? 1 : 0)
    .map((item) => {
      const order = orders.get(item.slot) ?? 0;
      orders.set(item.slot, order + 1);
      return { ...item, order };
    });
}
