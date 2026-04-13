export function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function pickRandom<T>(array: T[], n: number, exclude: T[] = []): T[] {
  return shuffle(array.filter((item) => !exclude.includes(item))).slice(0, n);
}
