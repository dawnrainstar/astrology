import { ElderRune, RuneSpread } from '../types';

export const RUNE_SPREADS: RuneSpread[] = [
  {
    id: 'single',
    name: "Odin's Sight (1 Rune)",
    description: 'A single rune drawn from the sacred pouch for quick daily clarity or focal meditation.',
    runeCount: 1,
    positions: [
      { label: 'Runic Focal Point', description: 'The dominant cosmic force at play right now.' }
    ]
  },
  {
    id: 'three_norns',
    name: 'The Three Norns (Past, Present, Future)',
    description: 'Consult Urd (Past), Verdandi (Present), and Skuld (Future/Necessity).',
    runeCount: 3,
    positions: [
      { label: 'Urd (Past / That Which Has Been)', description: 'Historical cause and ancestral foundation.' },
      { label: 'Verdandi (Present / That Which Is Becoming)', description: 'Current active energy and choice point.' },
      { label: 'Skuld (Future / That Which Must Be)', description: 'Evolving destiny and necessary outcome.' }
    ]
  },
  {
    id: 'five_cross',
    name: 'The Runic Elemental Cross (5 Runes)',
    description: 'A comprehensive 5-rune spread exploring foundation, resistance, helper, action, and core result.',
    runeCount: 5,
    positions: [
      { label: '1. Root / Foundation', description: 'Underlying cause or situation.' },
      { label: '2. Challenge / Ice', description: 'Obstacle or resisting force.' },
      { label: '3. Helper / Aegis', description: 'Source of strength and guidance.' },
      { label: '4. Action / Flame', description: 'Required action or step.' },
      { label: '5. Resolution / Destiny', description: 'Culmination of the runic cast.' }
    ]
  }
];

export const ELDER_FUTHARK_RUNES: ElderRune[] = [
  {
    id: 'fehu',
    name: 'Fehu',
    symbol: 'ᚠ',
    phonetic: 'F',
    traditionalMeaning: 'Wealth, Cattle, Mobile Abundance',
    uprightMeaning: 'Flowing prosperity, financial gain, creative fertility, and earned abundance.',
    merkstaveMeaning: 'Loss of wealth, greed, burnout, financial blockage.',
    element: 'Fire / Earth',
    deity: 'Freyja & Freyr',
    keywords: ['Abundance', 'Wealth', 'Prosperity', 'Fertility', 'Reward']
  },
  {
    id: 'uruz',
    name: 'Uruz',
    symbol: 'ᚢ',
    phonetic: 'U',
    traditionalMeaning: 'Aurochs, Primordial Strength',
    uprightMeaning: 'Raw vital energy, physical health, untamed power, and stamina to overcome.',
    merkstaveMeaning: 'Weakened vitality, misdirected aggression, stubbornness, illness.',
    element: 'Earth',
    deity: 'Thor / Skadi',
    keywords: ['Vitality', 'Raw Strength', 'Health', 'Endurance', 'Primal Energy']
  },
  {
    id: 'thurisaz',
    name: 'Thurisaz',
    symbol: 'ᚦ',
    phonetic: 'Th',
    traditionalMeaning: 'Giant, Thorn, Mjolnir',
    uprightMeaning: 'Gateway of protection, breaking through obstacles, targeted defensive power.',
    merkstaveMeaning: 'Defensiveness, rash actions, vulnerability, malice.',
    element: 'Fire',
    deity: 'Thor',
    keywords: ['Protection', 'Thorn', 'Breakthrough', 'Boundary', 'Defense']
  },
  {
    id: 'ansuz',
    name: 'Ansuz',
    symbol: 'ᚨ',
    phonetic: 'A',
    traditionalMeaning: 'Odin, Divine Inspiration, Breath',
    uprightMeaning: 'Divine wisdom, eloquent speech, prophetic messages, spiritual guidance.',
    merkstaveMeaning: 'Miscommunication, deceit, trickery, ignoring inner wisdom.',
    element: 'Air',
    deity: 'Odin',
    keywords: ['Wisdom', 'Inspiration', 'Communication', 'Truth', 'Divine Voice']
  },
  {
    id: 'raidho',
    name: 'Raidho',
    symbol: 'ᚱ',
    phonetic: 'R',
    traditionalMeaning: 'Riding, Chariot, The Journey',
    uprightMeaning: 'Physical travel, spiritual evolution, rhythmic movement, personal momentum.',
    merkstaveMeaning: 'Stagnation, travel delays, broken rhythm, feeling lost.',
    element: 'Air',
    deity: 'Thor / Forseti',
    keywords: ['Journey', 'Rhythm', 'Movement', 'Path', 'Evolution']
  },
  {
    id: 'kenaz',
    name: 'Kenaz',
    symbol: 'ᚲ',
    phonetic: 'K / C',
    traditionalMeaning: 'Torch, Beacon, Inner Flame',
    uprightMeaning: 'Illumination, creative spark, revelation of hidden truths, craft mastery.',
    merkstaveMeaning: 'Lack of vision, hidden truth, creative block, burning out.',
    element: 'Fire',
    deity: 'Heimdall / Freyja',
    keywords: ['Torch', 'Illumination', 'Creativity', 'Revelation', 'Clarity']
  },
  {
    id: 'gebo',
    name: 'Gebo',
    symbol: 'ᚷ',
    phonetic: 'G',
    traditionalMeaning: 'Gift, Sacred Alliance',
    uprightMeaning: 'Generous gifts, equal partnership, sacred exchange, mutual trust.',
    merkstaveMeaning: 'Transactional obligation, imbalance in giving, codependency.',
    element: 'Air',
    deity: 'Odin & Gefjon',
    keywords: ['Gift', 'Partnership', 'Sacred Union', 'Generosity', 'Balance']
  },
  {
    id: 'wunjo',
    name: 'Wunjo',
    symbol: 'ᚹ',
    phonetic: 'W / V',
    traditionalMeaning: 'Joy, Harmony, Clan Fellowship',
    uprightMeaning: 'Pure joy, contentment, wish fulfillment, harmony within your tribe.',
    merkstaveMeaning: 'Melancholy, friction, alienation, short-lived satisfaction.',
    element: 'Earth',
    deity: 'Odin / Freyr',
    keywords: ['Joy', 'Harmony', 'Fulfillment', 'Fellowship', 'Peace']
  },
  {
    id: 'hagalaz',
    name: 'Hagalaz',
    symbol: 'ᚺ',
    phonetic: 'H',
    traditionalMeaning: 'Hail, Disruptive Weather',
    uprightMeaning: 'Sudden elemental awakening, purging outdated structures, necessary storm.',
    merkstaveMeaning: 'Uncontrolled devastation, lingering crisis, refusal to weather the storm.',
    element: 'Ice / Water',
    deity: 'Hel / Ymir',
    keywords: ['Hail', 'Disruption', 'Cleansing Storm', 'Transformation', 'Awakening']
  },
  {
    id: 'nauthiz',
    name: 'Nauthiz',
    symbol: 'ᚾ',
    phonetic: 'N',
    traditionalMeaning: 'Need, Necessity, Friction Fire',
    uprightMeaning: 'Overcoming hardship through self-reliance, necessity breeding innovation.',
    merkstaveMeaning: 'Desperation, poverty consciousness, resistance to reality.',
    element: 'Fire / Ice',
    deity: 'Skuld / Norns',
    keywords: ['Need', 'Necessity', 'Friction', 'Resilience', 'Endurance']
  },
  {
    id: 'isa',
    name: 'Isa',
    symbol: 'ᛁ',
    phonetic: 'I',
    traditionalMeaning: 'Ice, Stillness, Crystal Glacier',
    uprightMeaning: 'Sacred pause, concentration, freezing external noise, deep inner stillness.',
    merkstaveMeaning: 'Cold detachment, emotional freezing, paralysis, rigidity.',
    element: 'Ice',
    deity: 'Rindr / Verdandi',
    keywords: ['Ice', 'Stillness', 'Focus', 'Pause', 'Crystal Clarity']
  },
  {
    id: 'jera',
    name: 'Jera',
    symbol: 'ᛃ',
    phonetic: 'J / Y',
    traditionalMeaning: 'Year, Sacred Harvest',
    uprightMeaning: 'Reaping the rewards of patient labor, natural cycles, fruitful culmination.',
    merkstaveMeaning: 'Impatience, poor timing, premature harvest.',
    element: 'Earth',
    deity: 'Freyr & Sif',
    keywords: ['Harvest', 'Cycles', 'Reward', 'Patience', 'Fruitfulness']
  },
  {
    id: 'eihwaz',
    name: 'Eihwaz',
    symbol: 'ᛇ',
    phonetic: 'Ei',
    traditionalMeaning: 'Yggdrasil Yew Tree, Axis Mundi',
    uprightMeaning: 'Spiritual endurance, protection across realms, immortality, transformation.',
    merkstaveMeaning: 'Fear of death/change, spiritual instability, feeling rootless.',
    element: 'All Elements',
    deity: 'Ullr / Odin',
    keywords: ['Yew Tree', 'Endurance', 'Axis Mundi', 'Protection', 'Transformation']
  },
  {
    id: 'perthro',
    name: 'Perthro',
    symbol: 'ᛈ',
    phonetic: 'P',
    traditionalMeaning: 'Dice Cup, Mystery of Fate, Matrix',
    uprightMeaning: 'Hidden secrets revealed, mysterious fate, intuition, magical initiation.',
    merkstaveMeaning: 'Unwelcome surprises, secrets kept, gambling addiction, illusions.',
    element: 'Water',
    deity: 'Frigg / Norns',
    keywords: ['Mystery', 'Fate', 'Initiation', 'Secret', 'Matrix']
  },
  {
    id: 'algiz',
    name: 'Algiz',
    symbol: 'ᛉ',
    phonetic: 'Z',
    traditionalMeaning: 'Elk Horns, Sacred Sanctuary Shield',
    uprightMeaning: 'Unshakeable divine protection, spiritual sanctuary, higher connection.',
    merkstaveMeaning: 'Exposed vulnerability, hidden danger, ignoring red flags.',
    element: 'Air / Water',
    deity: 'Heimdall / Valkyries',
    keywords: ['Shield', 'Protection', 'Sanctuary', 'Higher Connection', 'Aegis']
  },
  {
    id: 'sowilo',
    name: 'Sowilo',
    symbol: 'ᛋ',
    phonetic: 'S',
    traditionalMeaning: 'Sun, Golden Wholeness, Victory',
    uprightMeaning: 'Sunlit clarity, triumphant victory, radiant health, spirit alignment.',
    merkstaveMeaning: 'Over-ego, sunburn/burnout, false pride, seeking validation.',
    element: 'Fire',
    deity: 'Sól / Sunna',
    keywords: ['Sun', 'Victory', 'Radiance', 'Wholeness', 'Vitality']
  },
  {
    id: 'tiwaz',
    name: 'Tiwaz',
    symbol: 'ᛏ',
    phonetic: 'T',
    traditionalMeaning: 'Tyr, Spiritual Warrior, Justice',
    uprightMeaning: 'Honor, noble sacrifice, unwavering leadership, victorious spiritual fight.',
    merkstaveMeaning: 'Loss of passion, compromised honor, defeatist attitude.',
    element: 'Air',
    deity: 'Tyr',
    keywords: ['Warrior', 'Honor', 'Justice', 'Sacrifice', 'Leadership']
  },
  {
    id: 'berkano',
    name: 'Berkano',
    symbol: 'ᛒ',
    phonetic: 'B',
    traditionalMeaning: 'Birch Goddess, Rebirth, Growth',
    uprightMeaning: 'Gentle rebirth, healing, sanctuary, nurturing new life or creative ideas.',
    merkstaveMeaning: 'Stunted growth, family strife, domestic friction, neglect.',
    element: 'Earth',
    deity: 'Berchta / Frigg',
    keywords: ['Birch', 'Rebirth', 'Nurturing', 'Growth', 'Sanctuary']
  },
  {
    id: 'ehwaz',
    name: 'Ehwaz',
    symbol: 'ᛗ',
    phonetic: 'E',
    traditionalMeaning: 'Sleipnir Horse, Sacred Partnership',
    uprightMeaning: 'Harmonious team progress, trust, steady momentum, symbiotic bond.',
    merkstaveMeaning: 'Mistrust, rocky alliance, restless desire to bolt.',
    element: 'Earth',
    deity: 'Freyr / Freyja',
    keywords: ['Horse', 'Trust', 'Alliance', 'Progress', 'Harmony']
  },
  {
    id: 'mannaz',
    name: 'Mannaz',
    symbol: 'ᛗ',
    phonetic: 'M',
    traditionalMeaning: 'Humanity, Collective Mind, Self',
    uprightMeaning: 'Human connection, intellectual unity, self-awareness, shared destiny.',
    merkstaveMeaning: 'Isolation, arrogance, feeling alien to your community.',
    element: 'Air',
    deity: 'Heimdall / Odin',
    keywords: ['Humanity', 'Self', 'Mind', 'Community', 'Interconnection']
  },
  {
    id: 'laguz',
    name: 'Laguz',
    symbol: 'ᛚ',
    phonetic: 'L',
    traditionalMeaning: 'Water, Flowing River, Deep Intuition',
    uprightMeaning: 'Flowing with life, emotional depth, dreams, intuitive awakening.',
    merkstaveMeaning: 'Drowning in emotion, illusion, feeling swept away by tides.',
    element: 'Water',
    deity: 'Njord / Ran',
    keywords: ['Water', 'Flow', 'Intuition', 'Emotion', 'Dreams']
  },
  {
    id: 'ingwaz',
    name: 'Ingwaz',
    symbol: 'ᛝ',
    phonetic: 'Ng',
    traditionalMeaning: 'Ing / Freyr, Seed of Potential',
    uprightMeaning: 'Gestation of powerful creative potential, internal completion, readiness.',
    merkstaveMeaning: 'Blocked potential, inability to complete tasks, feeling trapped.',
    element: 'Earth / Water',
    deity: 'Ing / Freyr',
    keywords: ['Seed', 'Gestation', 'Potential', 'Rest', 'Inner Fire']
  },
  {
    id: 'dagaz',
    name: 'Dagaz',
    symbol: 'ᛞ',
    phonetic: 'D',
    traditionalMeaning: 'Daybreak, Dawn, Infinity Transformation',
    uprightMeaning: 'Major breakthrough, illumination, darkness turning to light, radical awakening.',
    merkstaveMeaning: 'Blindness to the dawn, fear of major breakthrough, clinging to night.',
    element: 'Fire / Air',
    deity: 'Heimdall / Baldur',
    keywords: ['Dawn', 'Breakthrough', 'Transformation', 'Illumination', 'Daybreak']
  },
  {
    id: 'othala',
    name: 'Othala',
    symbol: 'ᛟ',
    phonetic: 'O',
    traditionalMeaning: 'Ancestral Homestead, Sacred Inheritance',
    uprightMeaning: 'Ancestral blessings, home, spiritual roots, enduring sacred wisdom.',
    merkstaveMeaning: 'Family displacement, alienation from roots, narrow nationalism.',
    element: 'Earth',
    deity: 'Odin',
    keywords: ['Homestead', 'Ancestry', 'Legacy', 'Heritage', 'Roots']
  },
  {
    id: 'wyrd',
    name: 'Wyrd (Blank Rune)',
    symbol: '᛫',
    phonetic: 'Silence',
    traditionalMeaning: 'The Unknowable, Destiny, Cosmos',
    uprightMeaning: 'Direct intervention of the Norns. The future is unwritten in this moment.',
    merkstaveMeaning: 'Fate is active. Surrender control to divine grace.',
    element: 'Ether / Cosmos',
    deity: 'The Three Norns',
    keywords: ['Wyrd', 'Blank Rune', 'Destiny', 'Unknowable', 'Cosmic Matrix']
  }
];
