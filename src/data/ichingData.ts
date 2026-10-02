import { Hexagram } from '../types';

export const TRIGRAMS: Record<string, { name: string; symbol: string; element: string; nature: string }> = {
  '111': { name: 'Qian (Heaven)', symbol: '☰', element: 'Metal', nature: 'Creative, Strong' },
  '000': { name: 'Kun (Earth)', symbol: '☷', element: 'Earth', nature: 'Receptive, Yielding' },
  '100': { name: 'Zhen (Thunder)', symbol: '☳', element: 'Wood', nature: 'Arousing, Movement' },
  '010': { name: 'Kan (Water)', symbol: '☵', element: 'Water', nature: 'Abysmal, Dangerous' },
  '001': { name: 'Gen (Mountain)', symbol: '☶', element: 'Earth', nature: 'Stillness, Resting' },
  '110': { name: 'Xun (Wind)', symbol: '☴', element: 'Wood', nature: 'Gentle, Penetrating' },
  '101': { name: 'Li (Fire)', symbol: '☲', element: 'Fire', nature: 'Clarity, Radiance' },
  '011': { name: 'Dui (Lake)', symbol: '☱', element: 'Metal', nature: 'Joyous, Open' },
};

// Key King Wen Hexagrams dataset
export const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    name: 'The Creative',
    chineseName: '乾 (Qián)',
    englishName: 'The Creative / Pure Strong Energy',
    upperTrigram: 'Qian (Heaven)',
    upperSymbol: '☰',
    lowerTrigram: 'Qian (Heaven)',
    lowerSymbol: '☰',
    binaryPattern: '111111',
    judgment: 'The Creative works sublime success, furthering through perseverance. Pure Yang power initiates supreme manifestation.',
    image: 'Heaven moves with eternal power. The noble person strengthens themselves without ceasing.'
  },
  {
    number: 2,
    name: 'The Receptive',
    chineseName: '坤 (Kūn)',
    englishName: 'The Receptive / Devoted Earth',
    upperTrigram: 'Kun (Earth)',
    upperSymbol: '☷',
    lowerTrigram: 'Kun (Earth)',
    lowerSymbol: '☷',
    binaryPattern: '000000',
    judgment: 'The Receptive brings sublime success through the perseverance of a mare. Yielding nurtures all life into physical form.',
    image: 'The earth capacity is vast. The noble person carries the world with generous virtue.'
  },
  {
    number: 3,
    name: 'Difficulty at the Beginning',
    chineseName: '屯 (Zhūn)',
    englishName: 'Sprouting / Initial Obstacle',
    upperTrigram: 'Kan (Water)',
    upperSymbol: '☵',
    lowerTrigram: 'Zhen (Thunder)',
    lowerSymbol: '☳',
    binaryPattern: '100010',
    judgment: 'Initial chaos contains great potential. Seek helpers, build foundation, and do not act rashly.',
    image: 'Clouds and thunder. The noble person brings order out of initial tangle.'
  },
  {
    number: 4,
    name: 'Youthful Folly',
    chineseName: '蒙 (Méng)',
    englishName: 'Inexperience / Student Mind',
    upperTrigram: 'Gen (Mountain)',
    upperSymbol: '☶',
    lowerTrigram: 'Kan (Water)',
    lowerSymbol: '☵',
    binaryPattern: '010001',
    judgment: 'It is not I who seek the young fool; the young fool seeks me. Cultivate patience and humility to receive wisdom.',
    image: 'A spring wells up at the foot of the mountain. The noble person fosters character through disciplined habits.'
  },
  {
    number: 5,
    name: 'Waiting (Nourishment)',
    chineseName: '需 (Xū)',
    englishName: 'Patient Waiting',
    upperTrigram: 'Kan (Water)',
    upperSymbol: '☵',
    lowerTrigram: 'Qian (Heaven)',
    lowerSymbol: '☰',
    binaryPattern: '111010',
    judgment: 'Patience in the face of danger. Nourish your spirit with food and drink while waiting for the right tide.',
    image: 'Clouds rise up to heaven. The noble person eats and drinks, remaining cheerful and calm.'
  },
  {
    number: 6,
    name: 'Conflict',
    chineseName: '訟 (Sòng)',
    englishName: 'Strife / Resolution',
    upperTrigram: 'Qian (Heaven)',
    upperSymbol: '☰',
    lowerTrigram: 'Kan (Water)',
    lowerSymbol: '☵',
    binaryPattern: '010111',
    judgment: 'You are sincere, but met with opposition. Seek mediation halfway; do not push conflict to the bitter end.',
    image: 'Heaven and water move in opposite directions. The noble person plans the initial steps carefully.'
  },
  {
    number: 7,
    name: 'The Army',
    chineseName: '師 (Shī)',
    englishName: 'Disciplined Force',
    upperTrigram: 'Kun (Earth)',
    upperSymbol: '☷',
    lowerTrigram: 'Kan (Water)',
    lowerSymbol: '☵',
    binaryPattern: '010000',
    judgment: 'Leadership requires strict discipline, moral integrity, and clear purpose. The army needs an experienced general.',
    image: 'In the middle of the earth sits water. The noble person increases their crowd by generosity to the people.'
  },
  {
    number: 8,
    name: 'Holding Together (Union)',
    chineseName: '比 (Bǐ)',
    englishName: 'Alliance / Sacred Unity',
    upperTrigram: 'Kan (Water)',
    upperSymbol: '☵',
    lowerTrigram: 'Kun (Earth)',
    lowerSymbol: '☷',
    binaryPattern: '000010',
    judgment: 'Good fortune. Inquire of the oracle once more whether you have sincerity. Unity requires mutual trust.',
    image: 'On the earth flows water. The ancient kings forged alliances with neighboring lords.'
  },
  {
    number: 11,
    name: 'Peace (Harmony)',
    chineseName: '泰 (Tài)',
    englishName: 'Harmony & Prosperity',
    upperTrigram: 'Kun (Earth)',
    upperSymbol: '☷',
    lowerTrigram: 'Qian (Heaven)',
    lowerSymbol: '☰',
    binaryPattern: '111000',
    judgment: 'The small departs, the great approaches. Good fortune and smooth progress across all endeavors.',
    image: 'Heaven and earth combine in mutual communion. The ruler regulates the order of heaven and earth.'
  },
  {
    number: 12,
    name: 'Stagnation (Standstill)',
    chineseName: '否 (Pǐ)',
    englishName: 'Blockade / Division',
    upperTrigram: 'Qian (Heaven)',
    upperSymbol: '☰',
    lowerTrigram: 'Kun (Earth)',
    lowerSymbol: '☷',
    binaryPattern: '000111',
    judgment: 'The great departs, the small approaches. Confusion and blockages; preserve inner virtue in quiet reserve.',
    image: 'Heaven and earth do not interact. The noble person retreats into their inner worth to avoid danger.'
  },
  {
    number: 14,
    name: 'Possession in Great Measure',
    chineseName: '大有 (Dà Yǒu)',
    englishName: 'Abundance / Great Havings',
    upperTrigram: 'Li (Fire)',
    upperSymbol: '☲',
    lowerTrigram: 'Qian (Heaven)',
    lowerSymbol: '☰',
    binaryPattern: '111101',
    judgment: 'Supreme success. Bright fire shines high in the heavens, illuminating all with wisdom and generosity.',
    image: 'Fire high above the sky. The noble person curbs evil and promotes good, obeying the benevolent will of Heaven.'
  },
  {
    number: 24,
    name: 'Return (The Turning Point)',
    chineseName: '復 (Fù)',
    englishName: 'Rebirth of Light',
    upperTrigram: 'Kun (Earth)',
    upperSymbol: '☷',
    lowerTrigram: 'Zhen (Thunder)',
    lowerSymbol: '☳',
    binaryPattern: '100000',
    judgment: 'Return brings success. Movement in and out without injury. Friends come without blame. The light line returns below.',
    image: 'Thunder within the earth. Ancient kings closed the passes on the winter solstice to rest and recharge.'
  },
  {
    number: 30,
    name: 'The Clinging (Fire)',
    chineseName: '離 (Lí)',
    englishName: 'Radiant Clarity / Attachment',
    upperTrigram: 'Li (Fire)',
    upperSymbol: '☲',
    lowerTrigram: 'Li (Fire)',
    lowerSymbol: '☲',
    binaryPattern: '101101',
    judgment: 'Perseverance pays. Brightness doubled. Care for the cow brings good fortune; stay attached to what is pure.',
    image: 'Bright light shines twice. The noble person perpetuates brightness by shedding light in all directions.'
  },
  {
    number: 57,
    name: 'The Gentle (Wind)',
    chineseName: '巽 (Xùn)',
    englishName: 'Penetrating Influence',
    upperTrigram: 'Xun (Wind)',
    upperSymbol: '☴',
    lowerTrigram: 'Xun (Wind)',
    lowerSymbol: '☴',
    binaryPattern: '011011',
    judgment: 'Subtle, consistent influence overcomes rigid obstacles. Repeated clarity brings lasting success.',
    image: 'Winds follow one upon another. The noble person clarifies their commands and executes their deeds.'
  },
  {
    number: 63,
    name: 'After Completion',
    chineseName: '既濟 (Jì Jì)',
    englishName: 'Order Restored / Equilibrium',
    upperTrigram: 'Kan (Water)',
    upperSymbol: '☵',
    lowerTrigram: 'Li (Fire)',
    lowerSymbol: '☲',
    binaryPattern: '101010',
    judgment: 'Success in small matters. At the beginning good fortune; at the end disorder if vigilance slackens.',
    image: 'Water above fire. The noble person takes thought of misfortune and prepares against it in advance.'
  },
  {
    number: 64,
    name: 'Before Completion',
    chineseName: '未濟 (Wèi Jì)',
    englishName: 'On the Threshold of Change',
    upperTrigram: 'Li (Fire)',
    upperSymbol: '☲',
    lowerTrigram: 'Kan (Water)',
    lowerSymbol: '☵',
    binaryPattern: '010101',
    judgment: 'Success. But if the little fox gets its tail wet when nearly crossing, nothing is brought to completion.',
    image: 'Fire above water. The noble person carefully differentiates things so that each finds its proper place.'
  }
];

// Fallback algorithm to compute or match any of the 64 binary patterns
export function findHexagramByBinary(binary: string): Hexagram {
  const match = HEXAGRAMS.find((h) => h.binaryPattern === binary);
  if (match) return match;

  // Generate dynamic hexagram for missing numbers in sample dataset
  const lowerBits = binary.substring(0, 3);
  const upperBits = binary.substring(3, 6);
  const upper = TRIGRAMS[upperBits] || { name: 'Upper Sky', symbol: '☰', element: 'Air', nature: 'Active' };
  const lower = TRIGRAMS[lowerBits] || { name: 'Lower Earth', symbol: '☷', element: 'Earth', nature: 'Grounding' };

  // Calculate hexagram number deterministically from binary
  const num = parseInt(binary, 2) + 1;

  return {
    number: num,
    name: `Hexagram #${num}`,
    chineseName: `卦 #${num}`,
    englishName: `${upper.name.split(' ')[0]} over ${lower.name.split(' ')[0]}`,
    upperTrigram: upper.name,
    upperSymbol: upper.symbol,
    lowerTrigram: lower.name,
    lowerSymbol: lower.symbol,
    binaryPattern: binary,
    judgment: `Interlocking energies of ${upper.nature} above and ${lower.nature} below. Maintain balance and inner sincerity.`,
    image: `The upper trigram ${upper.symbol} interacts with lower trigram ${lower.symbol}. The noble person adapts with quiet wisdom.`
  };
}
