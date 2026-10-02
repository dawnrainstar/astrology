import { SigilConfig } from '../types';

// Letter to Number Mapping (Pythagorean 1-9)
const LETTER_TO_NUM: Record<string, number> = {
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

export function cleanseIntention(raw: string): { cleansedLetters: string; numericCode: string } {
  const upper = raw.toUpperCase().replace(/[^A-Z]/g, '');
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);

  const seen = new Set<string>();
  const letters: string[] = [];

  for (const char of upper) {
    if (!vowels.has(char) && !seen.has(char)) {
      seen.add(char);
      letters.push(char);
    }
  }

  const cleansedLetters = letters.join('');
  const numericCode = letters.map((c) => LETTER_TO_NUM[c.toLowerCase()] || 1).join('');

  return { cleansedLetters, numericCode };
}

export interface SigilPoint {
  x: number;
  y: number;
  letter: string;
  num: number;
}

// Generate points for Kamea or Rose Wheel geometry
export function generateSigilPoints(
  cleansedLetters: string,
  sigilType: SigilConfig['sigilType'],
  size: number = 300
): SigilPoint[] {
  const center = size / 2;
  const radius = size * 0.38;
  const points: SigilPoint[] = [];

  if (sigilType === 'rose') {
    // Witch's Rose Wheel: 26 letters arranged in concentric rings or circle
    const letterArray = cleansedLetters.split('');
    letterArray.forEach((letter, i) => {
      const code = letter.charCodeAt(0) - 65; // 0 to 25
      const angle = (code / 26) * 2 * Math.PI - Math.PI / 2;
      const r = radius * (0.5 + (code % 2 === 0 ? 0.4 : 0.2));
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      const num = LETTER_TO_NUM[letter.toLowerCase()] || 1;
      points.push({ x, y, letter, num });
    });
  } else if (sigilType === 'kamea') {
    // Saturn/Jupiter Kamea 3x3 Grid
    const gridSize = 3;
    const cellWidth = (size * 0.7) / gridSize;
    const startX = center - (cellWidth * gridSize) / 2;
    const startY = center - (cellWidth * gridSize) / 2;

    cleansedLetters.split('').forEach((letter) => {
      const num = LETTER_TO_NUM[letter.toLowerCase()] || 1;
      const gridIndex = num - 1; // 0 to 8
      const col = gridIndex % 3;
      const row = Math.floor(gridIndex / 3);
      // Add slight jitter for duplicate cell visits
      const jitterX = (Math.random() - 0.5) * 12;
      const jitterY = (Math.random() - 0.5) * 12;
      const x = startX + col * cellWidth + cellWidth / 2 + jitterX;
      const y = startY + row * cellWidth + cellWidth / 2 + jitterY;
      points.push({ x, y, letter, num });
    });
  } else if (sigilType === 'bindrune') {
    // Angular Runic Staves branching from central axis
    cleansedLetters.split('').forEach((letter, i) => {
      const num = LETTER_TO_NUM[letter.toLowerCase()] || 1;
      const angle = ((i * 137.5) * Math.PI) / 180; // Golden angle distribution
      const r = radius * (0.3 + (i / Math.max(1, cleansedLetters.length)) * 0.6);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push({ x, y, letter, num });
    });
  } else {
    // Standard Geometric Circular Ring
    const len = Math.max(1, cleansedLetters.length);
    cleansedLetters.split('').forEach((letter, i) => {
      const angle = (i / len) * 2 * Math.PI - Math.PI / 2;
      const num = LETTER_TO_NUM[letter.toLowerCase()] || 1;
      const r = radius * (0.6 + (num / 9) * 0.35);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push({ x, y, letter, num });
    });
  }

  return points;
}
