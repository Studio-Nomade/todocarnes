import { exclusiveTokenGroups, normalizeName, normalizedNumbers, tokens } from "./normalize";

export type MatchCandidate = {
  boxWeight: string | null;
  brand: string | null;
  category: string;
  code: string;
  cut: string;
  eyebrow?: string;
  format: string | null;
  title: string;
  units: string | null;
};

type ScoredCandidate = { candidate: MatchCandidate; score: number };

export type MatchResult = {
  alternatives: { code: string; score: number }[];
  candidate: MatchCandidate | null;
  margin: number;
  score: number;
  verdict: "ambiguous" | "matched" | "unmatched";
};

export type FolderMatch = {
  folderName: string;
  match: MatchResult;
};

export type OwnedFolderMatch = FolderMatch & { ownsApprovedSlots: boolean };

const ignoredTitleTokens = new Set(["de", "del", "sin", "foto", "cerdo", "pollo", "vacuno"]);

function candidateCode(candidate: MatchCandidate): string {
  return candidate.code.match(/CF-\d+/)?.[0] ?? candidate.code;
}

function byteCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizedCutTokens(cut: string): string[] {
  return tokens(cut).filter((token) => !ignoredTitleTokens.has(token));
}

function inferredFolderCut(folderTokens: Set<string>, candidates: MatchCandidate[]): string | null {
  const cuts = [...new Set(candidates.map((candidate) => candidate.cut))]
    .map((cut) => ({ cut, cutTokens: normalizedCutTokens(cut) }))
    .filter(({ cutTokens }) => cutTokens.length > 0 && cutTokens.every((token) => folderTokens.has(token)))
    .sort((left, right) => right.cutTokens.length - left.cutTokens.length || byteCompare(left.cut, right.cut));
  return cuts[0]?.cut ?? null;
}

function brandTokens(candidate: MatchCandidate): string[] {
  return candidate.brand ? tokens(candidate.brand).filter((token) => !ignoredTitleTokens.has(token)) : [];
}

function jaccardScore(folder: Set<string>, title: Set<string>): number {
  const intersection = [...folder].filter((token) => title.has(token)).length;
  const union = new Set([...folder, ...title]).size;
  return union === 0 ? 0 : Math.ceil((intersection / union) * 20);
}

function scoreCandidate(
  folderName: string,
  candidate: MatchCandidate,
  candidates: MatchCandidate[],
): ScoredCandidate | null {
  const folderTokenList = tokens(folderName);
  const folderTokens = new Set(folderTokenList.filter((token) => !/^\d+$/.test(token) && token !== "foto"));
  const candidateCut = candidate.cut;
  const folderCut = inferredFolderCut(folderTokens, candidates);
  if (folderCut && folderCut !== candidateCut) return null;

  let score = 0;
  const folderCodes = normalizeName(folderName).match(/cf\s*\d+/g)?.map((code) => code.replace(/\s+/g, "-").toUpperCase()) ?? [];
  if (folderCodes.some((code) => candidate.code.includes(code))) score += 50;
  if (folderCut === candidateCut) score += 30;

  const knownBrands = candidates.flatMap(brandTokens);
  const folderBrands = new Set(knownBrands.filter((brand) => folderTokens.has(brand)));
  const ownBrands = brandTokens(candidate);
  if (ownBrands.some((brand) => folderTokens.has(brand))) score += 25;
  else if (folderBrands.size > 0 && ownBrands.every((brand) => !folderBrands.has(brand))) score -= 40;

  const candidateTokens = new Set(tokens(`${candidate.title} ${candidate.brand ?? ""} ${candidate.cut}`));
  const cutTokens = normalizedCutTokens(candidate.cut);
  if (cutTokens.length > 1 || folderBrands.size === 0) {
    score += cutTokens.filter((token) => folderTokens.has(token)).length * 8;
  }

  for (const group of exclusiveTokenGroups) {
    const folderGroup = group.filter((token) => folderTokens.has(token));
    const candidateGroup = group.filter((token) => candidateTokens.has(token));
    score += folderGroup.filter((token) => candidateGroup.includes(token)).length * 8;
    if (folderGroup.length > 0 && candidateGroup.length > 0 && !folderGroup.some((token) => candidateGroup.includes(token))) {
      score -= 6;
    }
  }

  const folderNumbers = new Set(normalizedNumbers(folderName));
  const commercialNumbers = new Set(normalizedNumbers(`${candidate.units ?? ""} ${candidate.format ?? ""} ${candidate.boxWeight ?? ""}`));
  if ([...folderNumbers].some((number) => commercialNumbers.has(number))) score += 10;

  const titleTokens = new Set(tokens(candidate.title).filter((token) => !ignoredTitleTokens.has(token)));
  const eyebrowTokens = new Set(tokens(candidate.eyebrow ?? "").filter((token) => !ignoredTitleTokens.has(token)));
  score += Math.max(jaccardScore(folderTokens, titleTokens), jaccardScore(folderTokens, eyebrowTokens));
  return { candidate, score };
}

export function matchFolder(folderName: string, candidates: MatchCandidate[]): MatchResult {
  const scored = candidates
    .map((candidate) => scoreCandidate(folderName, candidate, candidates))
    .filter((result): result is ScoredCandidate => result !== null)
    .sort((left, right) => right.score - left.score || byteCompare(candidateCode(left.candidate), candidateCode(right.candidate)));
  const best = scored[0];
  const secondScore = scored[1]?.score ?? 0;

  if (!best || best.score < 60) {
    return { alternatives: scored.slice(0, 3).map(({ candidate, score }) => ({ code: candidateCode(candidate), score })), candidate: null, margin: best?.score ?? 0, score: best?.score ?? 0, verdict: "unmatched" };
  }

  const margin = best.score - secondScore;
  if (margin < 15) {
    const contenders = scored.filter((result) => best.score - result.score < 15 && result.score >= 60);
    return {
      alternatives: contenders.map(({ candidate, score }) => ({ code: candidateCode(candidate), score })),
      candidate: best.candidate,
      margin,
      score: best.score,
      verdict: "ambiguous",
    };
  }

  return {
    alternatives: scored.slice(0, 1).map(({ candidate, score }) => ({ code: candidateCode(candidate), score })),
    candidate: best.candidate,
    margin,
    score: best.score,
    verdict: "matched",
  };
}

function folderOrdinal(folderName: string): number {
  const ordinal = normalizeName(folderName).match(/^foto\s+(\d+)/)?.[1];
  return ordinal ? Number(ordinal) : Number.MAX_SAFE_INTEGER;
}

export function assignFolderOwners(matches: FolderMatch[]): OwnedFolderMatch[] {
  const owners = new Map<string, string>();
  const sorted = [...matches].sort(
    (left, right) => folderOrdinal(left.folderName) - folderOrdinal(right.folderName) || byteCompare(left.folderName, right.folderName),
  );

  for (const item of sorted) {
    const code = item.match.candidate ? candidateCode(item.match.candidate) : null;
    if (code && !owners.has(code)) owners.set(code, item.folderName);
  }

  return matches.map((item) => {
    const code = item.match.candidate ? candidateCode(item.match.candidate) : null;
    return { ...item, ownsApprovedSlots: !code || owners.get(code) === item.folderName };
  });
}
