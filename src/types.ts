export type DivinationTab =
  | 'home'
  | 'tarot'
  | 'horoscope'
  | 'iching'
  | 'runes'
  | 'scrying'
  | 'astrology'
  | 'sigil';

export type SubscriptionTier = 'free' | 'premium' | 'founder' | 'creator';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM (optional)
  birthPlace?: string; // City, Country (optional)
  zodiacSign?: string;
  passwordHash?: string;
  tier: SubscriptionTier;
  subscriptionActive: boolean;
  subscriptionPlan?: 'monthly' | 'lifetime' | 'creator';
  subscriptionEnd?: string; // ISO date string or 'never'
  createdAt: string;
  readingsTodayCount: number;
  lastReadingDate: string; // YYYY-MM-DD for quota tracking
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: string;
    expYear: string;
  };
}

export type ArcanaType = 'major' | 'minor';
export type SuitType = 'wands' | 'cups' | 'swords' | 'pentacles' | 'major';

export interface TarotCard {
  id: string;
  number: number;
  name: string;
  arcana: ArcanaType;
  suit?: SuitType;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  element: string;
  zodiacOrPlanet: string;
  symbolism: string;
  imagePrompt?: string;
  svgIcon?: string;
}

export interface DrawnTarotCard {
  card: TarotCard;
  isReversed: boolean;
  positionLabel: string;
  positionDescription: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: { label: string; description: string }[];
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  englishName: string;
  upperTrigram: string;
  upperSymbol: string;
  lowerTrigram: string;
  lowerSymbol: string;
  judgment: string;
  image: string;
  binaryPattern: string; // e.g. "111111" for Qian
}

export interface CoinFlipResult {
  tossIndex: number; // 0 to 5 (from line 1 at bottom to line 6 at top)
  coins: [boolean, boolean, boolean]; // true = Heads (3), false = Tails (2)
  sum: number; // 6, 7, 8, or 9
  isChanging: boolean; // 6 or 9
  lineType: 'yang' | 'yin' | 'changing-yang' | 'changing-yin';
  binaryValue: 1 | 0; // primary line: 1 for yang, 0 for yin
}

export interface ElderRune {
  id: string;
  name: string;
  symbol: string;
  phonetic: string;
  traditionalMeaning: string;
  uprightMeaning: string;
  merkstaveMeaning: string;
  element: string;
  deity: string;
  keywords: string[];
}

export interface DrawnRune {
  rune: ElderRune;
  isMerkstave: boolean;
  positionLabel: string;
  positionDescription: string;
}

export interface RuneSpread {
  id: string;
  name: string;
  description: string;
  runeCount: number;
  positions: { label: string; description: string }[];
}

export interface AstrologicalChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  mercurySign: string;
  venusSign: string;
  marsSign: string;
  jupiterSign: string;
  saturnSign: string;
  dominantElement: 'Fire' | 'Earth' | 'Air' | 'Water';
  qualities: { cardinal: number; fixed: number; mutable: number };
}

export interface NumerologyProfile {
  lifePathNumber: number;
  lifePathMeaning: string;
  expressionNumber: number;
  expressionMeaning: string;
  soulUrgeNumber: number;
  soulUrgeMeaning: string;
  personalityNumber: number;
  personalityMeaning: string;
  personalYear: number;
}

export interface SigilConfig {
  intention: string;
  cleansedLetters: string;
  numericCode: string;
  sigilType: 'kamea' | 'rose' | 'geometric' | 'bindrune';
  glowColor: string;
  borderStyle: 'circle' | 'double-circle' | 'heptagram' | 'octagon';
  showPoints: boolean;
  gridSize: number;
}

export interface SavedReading {
  id: string;
  userId?: string;
  userEmail?: string;
  date: string;
  type: DivinationTab;
  title: string;
  question: string;
  summary: string;
  fullReading: string;
  detailsData?: any;
}
