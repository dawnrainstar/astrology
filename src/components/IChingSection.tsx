import React, { useState } from 'react';
import { HEXAGRAMS, findHexagramByBinary } from '../data/ichingData';
import { CoinFlipResult, Hexagram, SavedReading, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess, checkReadingAllowance } from '../utils/auth';
import { Compass, Sparkles, BookmarkPlus, Check, Coins, Crown } from 'lucide-react';

interface IChingSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const IChingSection: React.FC<IChingSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const [question, setQuestion] = useState('');
  const [lineResults, setLineResults] = useState<CoinFlipResult[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentCoins, setCurrentCoins] = useState<[boolean, boolean, boolean]>([true, true, false]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Cast 1 line (user clicks 6 times total)
  const castNextLine = () => {
    if (lineResults.length >= 6 || isFlipping) return;

    // Check reading quota when starting first line
    if (lineResults.length === 0) {
      const quota = checkReadingAllowance(currentUser);
      if (!quota.allowed) {
        onRequireUpgrade('Unlimited Daily Readings', 'limit');
        return;
      }
      onReadingPerformed();
    }

    soundEngine.playCoinClink();
    setIsFlipping(true);

    let flips = 0;
    const interval = setInterval(() => {
      setCurrentCoins([Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]);
      flips++;
      if (flips > 6) {
        clearInterval(interval);
        finalizeLine();
      }
    }, 80);
  };

  const finalizeLine = () => {
    const coin1 = Math.random() > 0.5; // true = Head (3), false = Tail (2)
    const coin2 = Math.random() > 0.5;
    const coin3 = Math.random() > 0.5;
    const coins: [boolean, boolean, boolean] = [coin1, coin2, coin3];

    const sum = (coin1 ? 3 : 2) + (coin2 ? 3 : 2) + (coin3 ? 3 : 2); // 6, 7, 8, 9

    let lineType: CoinFlipResult['lineType'] = 'yang';
    let isChanging = false;
    let binaryValue: 1 | 0 = 1;

    if (sum === 6) {
      lineType = 'changing-yin';
      isChanging = true;
      binaryValue = 0;
    } else if (sum === 7) {
      lineType = 'yang';
      binaryValue = 1;
    } else if (sum === 8) {
      lineType = 'yin';
      binaryValue = 0;
    } else if (sum === 9) {
      lineType = 'changing-yang';
      isChanging = true;
      binaryValue = 1;
    }

    const newResult: CoinFlipResult = {
      tossIndex: lineResults.length,
      coins,
      sum,
      isChanging,
      lineType,
      binaryValue
    };

    setLineResults((prev) => [...prev, newResult]);
    setIsFlipping(false);
    soundEngine.playCoinClink();

    if (lineResults.length === 5) {
      soundEngine.playSingingBowl(528);
    }
  };

  const castAllLinesAuto = () => {
    const quota = checkReadingAllowance(currentUser);
    if (!quota.allowed) {
      onRequireUpgrade('Unlimited Daily Readings', 'limit');
      return;
    }
    onReadingPerformed();

    setLineResults([]);
    setAiReading(null);
    setIsSaved(false);

    let count = 0;
    const timer = setInterval(() => {
      const c1 = Math.random() > 0.5;
      const c2 = Math.random() > 0.5;
      const c3 = Math.random() > 0.5;
      const sum = (c1 ? 3 : 2) + (c2 ? 3 : 2) + (c3 ? 3 : 2);

      let lineType: CoinFlipResult['lineType'] = 'yang';
      let isChanging = false;
      let binaryValue: 1 | 0 = 1;

      if (sum === 6) {
        lineType = 'changing-yin';
        isChanging = true;
        binaryValue = 0;
      } else if (sum === 7) {
        lineType = 'yang';
        binaryValue = 1;
      } else if (sum === 8) {
        lineType = 'yin';
        binaryValue = 0;
      } else if (sum === 9) {
        lineType = 'changing-yang';
        isChanging = true;
        binaryValue = 1;
      }

      setLineResults((prev) => [
        ...prev,
        { tossIndex: count, coins: [c1, c2, c3], sum, isChanging, lineType, binaryValue }
      ]);

      soundEngine.playCoinClink();
      count++;
      if (count >= 6) {
        clearInterval(timer);
        soundEngine.playSingingBowl(528);
      }
    }, 300);
  };

  const resetCast = () => {
    setLineResults([]);
    setAiReading(null);
    setIsSaved(false);
  };

  // Derive Primary Hexagram and Transformed Hexagram
  let primaryHexagram: Hexagram | null = null;
  let transformedHexagram: Hexagram | null = null;
  let changingLineIndices: number[] = [];

  if (lineResults.length === 6) {
    const primaryBinary = lineResults.map((l) => l.binaryValue).join(''); // e.g. "111000"
    primaryHexagram = findHexagramByBinary(primaryBinary);

    const hasChanging = lineResults.some((l) => l.isChanging);
    if (hasChanging) {
      changingLineIndices = lineResults
        .map((l, idx) => (l.isChanging ? idx + 1 : null))
        .filter(Boolean) as number[];

      const transformedBinary = lineResults
        .map((l) => {
          if (l.sum === 6) return '1'; // 6 changing yin turns yang
          if (l.sum === 9) return '0'; // 9 changing yang turns yin
          return l.binaryValue.toString();
        })
        .join('');

      transformedHexagram = findHexagramByBinary(transformedBinary);
    }
  }

  const generateAiReading = async () => {
    if (!primaryHexagram) return;

    if (!isPremium) {
      onRequireUpgrade('Taoist Sage AI Hexagram Interpretation');
      return;
    }

    setIsLoadingAi(true);
    soundEngine.playSingingBowl(432);

    try {
      const res = await fetch('/api/divination/iching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          primaryHexagram,
          changingLines: changingLineIndices,
          transformedHexagram
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiReading(`Error: ${data.error}`);
      } else {
        setAiReading(data.reading);
      }
    } catch (err) {
      setAiReading('Error communicating with I-Ching Oracle.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    if (!primaryHexagram) return;
    const item: SavedReading = {
      id: `iching-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'iching',
      title: `I-Ching #${primaryHexagram.number} ${primaryHexagram.name}`,
      question: question || 'Taoist Flow Guidance',
      summary: `Primary: #${primaryHexagram.number} ${primaryHexagram.name} ${
        transformedHexagram ? `-> Transformed: #${transformedHexagram.number} ${transformedHexagram.name}` : ''
      }`,
      fullReading: aiReading || 'Hexagram cast without AI synthesis.',
      detailsData: { primaryHexagram, transformedHexagram, lineResults }
    };

    onSaveReading(item);
    setIsSaved(true);
    soundEngine.playSingingBowl(639);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#121526]/80 backdrop-blur border border-amber-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30 mb-2">
              <Compass className="w-3.5 h-3.5" /> Book of Changes (64 Hexagrams)
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100">
              I-Ching 3-Coin Ritual Casting
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={castAllLinesAuto}
              disabled={isFlipping}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(212,175,55,0.3)] flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" /> Cast All 6 Lines
            </button>
            <button
              onClick={resetCast}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs rounded-xl transition-all"
            >
              Reset Dish
            </button>
          </div>
        </div>

        {/* Intention Input & Coin Dish */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-medium text-amber-200/80">
              State your situation or question for the Tao:
            </label>
            <input
              type="text"
              placeholder="e.g., How should I navigate this upcoming decision or transition?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Interactive Coin Flip Dish Button */}
          <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-amber-900/30 rounded-xl p-4 text-center">
            <div className="flex gap-3 mb-3">
              {currentCoins.map((isHead, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-full border-2 border-amber-400/80 flex items-center justify-center font-serif text-xs font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-transform duration-150 ${
                    isFlipping ? 'animate-bounce bg-amber-500 text-slate-950' : isHead ? 'bg-amber-600 text-slate-950' : 'bg-slate-900 text-amber-300'
                  }`}
                >
                  {isHead ? '☰ 3' : '☷ 2'}
                </div>
              ))}
            </div>

            <button
              onClick={castNextLine}
              disabled={lineResults.length >= 6 || isFlipping}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg text-xs font-mono disabled:opacity-40"
            >
              {lineResults.length >= 6
                ? 'HEXAGRAM COMPLETE'
                : `TOSS COINS (Line ${lineResults.length + 1} of 6)`}
            </button>
          </div>
        </div>
      </div>

      {/* Hexagram Lines Visualization (Built from Bottom Line 1 to Top Line 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lines Building Display */}
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6">
          <h3 className="text-base font-serif font-semibold text-amber-200 mb-4 flex items-center justify-between">
            <span>Hexagram Line Construction</span>
            <span className="text-xs font-mono text-amber-400">
              {lineResults.length}/6 Lines
            </span>
          </h3>

          <div className="flex flex-col-reverse gap-3 my-4">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const line = lineResults[index];

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    line
                      ? line.isChanging
                        ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                      : 'bg-slate-950/30 border-dashed border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="text-xs font-mono w-16 text-slate-400">
                    Line {index + 1}:
                  </span>

                  {line ? (
                    <div className="flex-1 flex items-center gap-3">
                      {/* Visual Line Representation */}
                      <div className="flex-1 h-4 flex items-center justify-center">
                        {line.sum === 7 && ( // Solid Yang
                          <div className="w-full h-2 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        )}
                        {line.sum === 8 && ( // Broken Yin
                          <div className="w-full h-2 flex justify-between gap-3">
                            <div className="w-[46%] h-full bg-slate-300 rounded-sm" />
                            <div className="w-[46%] h-full bg-slate-300 rounded-sm" />
                          </div>
                        )}
                        {line.sum === 9 && ( // Changing Yang (O)
                          <div className="w-full h-2 bg-amber-400 rounded-sm relative flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.6)]">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-amber-300 text-[9px] font-bold text-amber-300 flex items-center justify-center">
                              O
                            </span>
                          </div>
                        )}
                        {line.sum === 6 && ( // Changing Yin (X)
                          <div className="w-full h-2 flex justify-between gap-3 relative items-center">
                            <div className="w-[46%] h-full bg-rose-400 rounded-sm" />
                            <span className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-slate-950 border border-rose-400 text-[9px] font-bold text-rose-300 flex items-center justify-center">
                              X
                            </span>
                            <div className="w-[46%] h-full bg-rose-400 rounded-sm" />
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-mono text-amber-300 w-16 text-right">
                        Sum {line.sum}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-600">Awaiting toss...</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary & Transformed Hexagram Cards */}
        <div className="space-y-4">
          {primaryHexagram ? (
            <div className="bg-gradient-to-br from-[#181a2e] to-[#0d0f1a] border border-amber-500/50 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-amber-900/40 pb-3">
                <div>
                  <span className="text-xs font-mono text-amber-400 block uppercase">
                    Hexagram #{primaryHexagram.number}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-amber-100">
                    {primaryHexagram.name} {primaryHexagram.chineseName}
                  </h3>
                  <p className="text-xs text-amber-300/80">{primaryHexagram.englishName}</p>
                </div>
                <div className="text-2xl font-serif text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/30">
                  {primaryHexagram.upperSymbol}
                  <br />
                  {primaryHexagram.lowerSymbol}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-amber-300">Upper Trigram:</strong> {primaryHexagram.upperTrigram}
                </p>
                <p>
                  <strong className="text-amber-300">Lower Trigram:</strong> {primaryHexagram.lowerTrigram}
                </p>
                <p className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/20 italic">
                  &ldquo;{primaryHexagram.judgment}&rdquo;
                </p>
              </div>

              {transformedHexagram && (
                <div className="mt-4 pt-4 border-t border-amber-900/40 bg-purple-950/20 p-4 rounded-xl border border-purple-500/30">
                  <span className="text-[11px] font-mono text-purple-300 uppercase block mb-1">
                    Future Transformation -&gt; Hexagram #{transformedHexagram.number}
                  </span>
                  <h4 className="text-base font-serif font-bold text-purple-100">
                    {transformedHexagram.name} ({transformedHexagram.chineseName})
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 italic">{transformedHexagram.judgment}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-amber-500/40 animate-spin" />
              <p className="text-xs">
                Toss all 6 coin lines to reveal the primary Hexagram and changing forces.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Sage Reading Button & Result */}
      {primaryHexagram && (
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={generateAiReading}
              disabled={isLoadingAi}
              className={`px-6 py-3 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                isPremium
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110'
                  : 'bg-gradient-to-r from-purple-900/90 to-amber-950/90 text-amber-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-amber-400'
              } disabled:opacity-50`}
            >
              {!isPremium ? (
                <>
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>CONSULT TAOIST SAGE (PREMIUM)</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAi ? 'CONSULTING TAOIST SAGE...' : 'GENERATE I-CHING SYNTHESIS'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-5 py-3 rounded-xl text-xs font-mono tracking-wider border transition-all flex items-center gap-2 ${
                isSaved
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-amber-500/30 text-amber-200 hover:bg-amber-950/50'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> SAVED TO JOURNAL
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-amber-400" /> SAVE TO JOURNAL
                </>
              )}
            </button>
          </div>

          {aiReading && (
            <div className="mt-6 text-left bg-slate-950/90 border border-amber-500/30 rounded-xl p-6 text-slate-200 text-sm leading-relaxed shadow-inner">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block border-b border-amber-900/40 pb-2 mb-3">
                I-Ching Sage Interpretation
              </span>
              <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-sm whitespace-pre-wrap">
                {aiReading}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
