const singleAliases: Record<string, string> = {
  hemra: "hembra",
  hembra: "hembra",
  palmani: "palmali",
  palmali: "palmali",
  polmani: "palmali",
  sulita: "sulita",
  surita: "sulita",
  trutro: "trutro",
  truto: "trutro",
};

const bigramAliases: Record<string, string> = {
  "c vale": "cvale",
  "campo frio": "campofrio",
  "flp foods": "flp",
  "le vida": "levida",
  "mountaire farms": "mountaire",
};

const pluralAliases: Record<string, string> = {
  chuleta: "chuletas",
  costillita: "costillitas",
  ribs: "ribs",
  trutros: "trutro",
};

export const exclusiveTokenGroups = [
  ["vetada", "centro"],
  ["entero", "cuarto", "ala", "corto", "largo"],
  ["deshuesada", "con-hueso"],
  ["porcionada", "interfoliada", "marinada"],
] as const;

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokens(value: string): string[] {
  const raw = normalizeName(value).split(" ").filter(Boolean);
  const result: string[] = [];

  for (let index = 0; index < raw.length; index += 1) {
    const bigram = `${raw[index]} ${raw[index + 1] ?? ""}`.trim();
    const bigramAlias = bigramAliases[bigram];
    if (bigramAlias) {
      result.push(bigramAlias);
      index += 1;
      continue;
    }

    const token = singleAliases[raw[index]] ?? pluralAliases[raw[index]] ?? raw[index];
    if (token === "con" && raw[index + 1] === "hueso") {
      result.push("con-hueso");
      index += 1;
      continue;
    }
    result.push(token);
  }

  return result;
}

export function normalizedNumbers(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/\d+(?:[.,-]\d+)*/g)?.map((number) => number.replace(/[.,-]/g, "")) ?? [];
}
