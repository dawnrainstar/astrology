import { AstrologicalChartData, NumerologyProfile } from '../types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const PLANETS = [
  { name: 'Sun', symbol: '☉', meaning: 'Core Identity & Ego' },
  { name: 'Moon', symbol: '☽', meaning: 'Emotions & Subconscious' },
  { name: 'Mercury', symbol: '☿', meaning: 'Intellect & Communication' },
  { name: 'Venus', symbol: '♀', meaning: 'Love, Harmony & Beauty' },
  { name: 'Mars', symbol: '♂', meaning: 'Drive, Passion & Action' },
  { name: 'Jupiter', symbol: '♃', meaning: 'Expansion, Fortune & Wisdom' },
  { name: 'Saturn', symbol: '♄', meaning: 'Structure, Karma & Discipline' }
];

// Helper to determine Sun sign based on birth date
export function calculateSunSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

// Approximate planetary placements based on birth month/day/year for rich interactive birth chart display
export function calculateBirthChart(birthdateStr: string, timeStr: string): AstrologicalChartData {
  const date = new Date(birthdateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const sunSign = calculateSunSign(month, day);
  
  // Approximate moon sign offset based on day
  const moonIndex = (month * 2 + day + Math.floor(year / 4)) % 12;
  const moonSign = ZODIAC_SIGNS[moonIndex];

  // Approximate Rising / Ascendant based on birth hour if provided
  let hour = 12;
  if (timeStr) {
    const parts = timeStr.split(':');
    hour = parseInt(parts[0], 10) || 12;
  }
  const sunIndex = ZODIAC_SIGNS.indexOf(sunSign);
  const risingIndex = (sunIndex + Math.floor(hour / 2)) % 12;
  const risingSign = ZODIAC_SIGNS[risingIndex];

  const mercurySign = ZODIAC_SIGNS[(sunIndex + (day % 3) - 1 + 12) % 12];
  const venusSign = ZODIAC_SIGNS[(sunIndex + (month % 3) - 1 + 12) % 12];
  const marsSign = ZODIAC_SIGNS[(sunIndex + (year % 5)) % 12];
  const jupiterSign = ZODIAC_SIGNS[(year + 3) % 12];
  const saturnSign = ZODIAC_SIGNS[(year + 8) % 12];

  // Element breakdown
  const elementsCount: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const signElementMap: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };

  [sunSign, moonSign, risingSign, mercurySign, venusSign, marsSign, jupiterSign, saturnSign].forEach((s) => {
    const el = signElementMap[s];
    if (el) elementsCount[el]++;
  });

  let dominantElement: 'Fire' | 'Earth' | 'Air' | 'Water' = 'Fire';
  let maxCount = -1;
  Object.entries(elementsCount).forEach(([el, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = el as any;
    }
  });

  return {
    sunSign,
    moonSign,
    risingSign,
    mercurySign,
    venusSign,
    marsSign,
    jupiterSign,
    saturnSign,
    dominantElement,
    qualities: { cardinal: 3, fixed: 3, mutable: 2 }
  };
}

// Pythagoras Numerology Calculator
const PYTHAGOREAN_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

function reduceNumerology(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num; // Master Numbers
  while (num > 9) {
    num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    if (num === 11 || num === 22 || num === 33) break;
  }
  return num;
}

export function calculateNumerology(fullName: string, birthdateStr: string): NumerologyProfile {
  // 1. Life Path Number (from Date of Birth)
  const dateObj = new Date(birthdateStr);
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  const y = dateObj.getFullYear();

  const mReduced = reduceNumerology(m);
  const dReduced = reduceNumerology(d);
  const yReduced = reduceNumerology(y);
  const lifePathNumber = reduceNumerology(mReduced + dReduced + yReduced);

  // 2. Expression Number (All letters in name)
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
  let expressionSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;

  for (const char of cleanName) {
    const val = PYTHAGOREAN_VALUES[char] || 0;
    expressionSum += val;
    if (VOWELS.has(char)) {
      soulUrgeSum += val;
    } else {
      personalitySum += val;
    }
  }

  const expressionNumber = reduceNumerology(expressionSum);
  const soulUrgeNumber = reduceNumerology(soulUrgeSum);
  const personalityNumber = reduceNumerology(personalitySum);

  // Personal Year Number for Current Year (2026)
  const currentYear = new Date().getFullYear();
  const personalYear = reduceNumerology(reduceNumerology(m) + reduceNumerology(d) + reduceNumerology(currentYear));

  const LIFE_PATH_MEANINGS: Record<number, string> = {
    1: 'The Sovereign Leader: Innovation, independence, courage, and pioneering new trails.',
    2: 'The Peacemaker & Diplomat: Harmony, intuition, partnership, and deep sensitivity.',
    3: 'The Creative Catalyst: Artistic expression, joy, communication, and inspiration.',
    4: 'The Master Builder: Discipline, order, solid foundations, and practical integrity.',
    5: 'The Freedom Seeker: Adaptability, adventure, versatility, and breaking boundaries.',
    6: 'The Nurturing Guardian: Compassion, healing, family sanctuary, and responsibility.',
    7: 'The Mystic Scholar: Spiritual introspection, analytical truth-seeking, and wisdom.',
    8: 'The Power Strategist: Abundance, material mastery, leadership, and balance.',
    9: 'The Universal Humanitarian: Altruism, completion, wisdom, and transformation.',
    11: 'Master Spiritual Messenger: Higher intuition, visionary illumination, and inspiration.',
    22: 'Master Architect of Reality: Turning grand spiritual visions into physical structures.',
    33: 'Master Teacher of Compassion: Elevating collective consciousness through selfless love.'
  };

  return {
    lifePathNumber,
    lifePathMeaning: LIFE_PATH_MEANINGS[lifePathNumber] || 'Unique vibrational path of transformation.',
    expressionNumber,
    expressionMeaning: `Expression Number ${expressionNumber} represents your innate talents and destiny gifts.`,
    soulUrgeNumber,
    soulUrgeMeaning: `Soul Urge Number ${soulUrgeNumber} reveals your secret heart desire and soul motivation.`,
    personalityNumber,
    personalityMeaning: `Personality Number ${personalityNumber} reflects the outer energy others perceive.`,
    personalYear
  };
}
