const SORT_RANDOM_THRESHOLD = 0.5;

export function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - SORT_RANDOM_THRESHOLD);
}

export function pickRandom<T>(array: T[], count: number, exclude: T[] = []): T[] {
  return shuffle(array.filter((item) => !exclude.includes(item))).slice(0, count);
}
