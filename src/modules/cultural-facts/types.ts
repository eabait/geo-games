export type FactCategory = 'food' | 'festival' | 'instrument' | 'tradition';

export type FactsDifficulty = 'easy' | 'hard';

export interface CulturalFact {
  id: string;
  countryName: string;
  flagCode: string;
  fact: string;
  category: FactCategory;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  tier: 1 | 2;
}
