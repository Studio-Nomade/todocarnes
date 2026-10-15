const STRIP_CENTER = 938;
const IMAGE_WIDTH = 272;
const GAP = 20;

export function secondaryLayout(count: 0 | 1 | 2 | 3): { left: number }[] {
  if (count === 0) {
    return [];
  }

  const totalWidth = count * IMAGE_WIDTH + (count - 1) * GAP;
  const start = STRIP_CENTER - totalWidth / 2;
  return Array.from({ length: count }, (_, index) => ({
    left: start + index * (IMAGE_WIDTH + GAP),
  }));
}
