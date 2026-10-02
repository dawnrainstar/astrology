import React, { useState } from 'react';
import { TAROT_SPREADS, TAROT_DECK } from '../data/tarotData';
import { DrawnTarotCard, SavedReading, TarotSpread, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess, checkReadingAllowance } from '../utils/auth';
import { Sparkles, Shuffle, RotateCw, BookmarkPlus, Check, Flame, ShieldAlert, BookOpen, Lock, Crown } from 'lucide-react';

interface TarotSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const TarotSection: React.FC<TarotSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(TAROT_SPREADS[1]); // 3-card default
  const [question, setQuestion] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawnTarotCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Spread selection with premium gate for 5-card & 10-card
  const handleSelectSpread = (spread: TarotSpread) => {
    const isPremiumSpread = spread.id === 'five_card' || spread.id === 'celtic_cross';
    if (isPremiumSpread && !isPremium) {
      onRequireUpgrade(`${spread.name} (${spread.cardCount} Cards)`);
      return;
    }
    setSelectedSpread(spread);
    setDrawnCards([]);
    setAiReading(null);
    soundEngine.playSingingBowl(350);
  };

  // Shuffle & Draw Cards with Daily Quota Check
  const handleShuffleAndDraw = () => {
    // Check reading quota
    const quota = checkReadingAllowance(currentUser);
    if (!quota.allowed) {
      onRequireUpgrade('Unlimited Daily Readings', 'limit');
      return;
    }

    soundEngine.playCardFlip();
    setIsShuffling(true);
    setDrawnCards([]);
    setFlippedIndices(new Set());
    setAiReading(null);
    setIsSaved(false);

    // Record reading used
    onReadingPerformed();

    setTimeout(() => {
      // Pick random unique cards from deck
      const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, selectedSpread.cardCount);

      const drawn: DrawnTarotCard[] = chosen.map((card, idx) => {
        const isReversed = Math.random() < 0.25; // 25% chance reversed
        const pos = selectedSpread.positions[idx] || {
          label: `Position ${idx + 1}`,
          description: 'Aspect of the reading'
        };
        return {
          card,
          isReversed,
          positionLabel: pos.label,
          positionDescription: pos.description
        };
      });

      setDrawnCards(drawn);
      setIsShuffling(false);
      soundEngine.playSingingBowl(432);
    }, 600);
  };

  const flipCard = (index: number) => {
    soundEngine.playCardFlip();
    setFlippedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const flipAllCards = () => {
    soundEngine.playSingingBowl(528);
    const all = new Set(drawnCards.map((_, i) => i));
    setFlippedIndices(all);
  };

  const generateAiReading = async () => {
    if (drawnCards.length === 0) return;

    // Gate AI Master Reading for Free Tier
    if (!isPremium) {
      onRequireUpgrade('Hermetic AI Master Tarot Reading');
      return;
    }

    setIsLoadingAi(true);
    soundEngine.playSingingBowl(432);

    try {
      const res = await fetch('/api/divination/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spreadName: selectedSpread.name,
          cards: drawnCards.map((dc) => ({
            name: dc.card.name,
            positionLabel: dc.positionLabel,
            isReversed: dc.isReversed,
            keywords: dc.card.keywords,
            element: dc.card.element,
            meaningUpright: dc.card.meaningUpright,
            meaningReversed: dc.card.meaningReversed
          }))
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiReading(`Error generating reading: ${data.error}`);
      } else {
        setAiReading(data.reading);
      }
    } catch (err: any) {
      setAiReading('Connection error while consulting the Tarot oracle.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    if (!drawnCards.length) return;
    const readingItem: SavedReading = {
      id: `tarot-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'tarot',
      title: `${selectedSpread.name} Reading`,
      question: question || 'General Soul Wisdom',
      summary: drawnCards.map((c) => `${c.positionLabel}: ${c.card.name} (${c.isReversed ? 'Rev' : 'Upr'})`).join(' | '),
      fullReading: aiReading || 'Cards drawn without AI synthesis.',
      detailsData: drawnCards
    };

    onSaveReading(readingItem);
    setIsSaved(true);
    soundEngine.playSingingBowl(639);
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="bg-[#121526]/80 backdrop-blur border border-amber-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30 mb-2">
              <BookOpen className="w-3.5 h-3.5" /> Rider-Waite-Smith Tarot Deck (78 Cards)
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100">
              Consult the Tarot Oracle
            </h2>
          </div>

          {/* Spread Selection */}
          <div className="flex flex-wrap items-center gap-2">
            {TAROT_SPREADS.map((spread) => {
              const isLocked = (spread.id === 'five_card' || spread.id === 'celtic_cross') && !isPremium;
              return (
                <button
                  key={spread.id}
                  onClick={() => handleSelectSpread(spread)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedSpread.id === spread.id
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                      : isLocked
                      ? 'bg-slate-900/40 text-slate-500 border border-purple-900/30 hover:border-purple-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-amber-300 border border-slate-800'
                  }`}
                >
                  <span>{spread.name} ({spread.cardCount})</span>
                  {isLocked && <Lock className="w-3 h-3 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spread Description & Question Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-1 bg-slate-950/60 border border-amber-900/20 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-1">
              Spread: {selectedSpread.name}
            </span>
            {selectedSpread.description}
          </div>

          <div className="md:col-span-2 flex flex-col justify-between gap-2">
            <label className="text-xs font-medium text-amber-200/80">
              Hold your intention or state your question for the cards:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., What step should I take regarding my creative journey?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
              <button
                onClick={handleShuffleAndDraw}
                disabled={isShuffling}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                {isShuffling ? 'SHUFFLING...' : 'DRAW SPREAD'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Display Grid */}
      {drawnCards.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Cards Drawn ({drawnCards.length})
            </h3>
            <button
              onClick={flipAllCards}
              className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1 bg-amber-950/40 border border-amber-900/30 px-3 py-1.5 rounded-lg transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" /> Reveal All Cards
            </button>
          </div>

          <div
            className={`grid gap-6 ${
              drawnCards.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : drawnCards.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : drawnCards.length === 5
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            }`}
          >
            {drawnCards.map((drawnCard, index) => {
              const isFlipped = flippedIndices.has(index);
              const card = drawnCard.card;

              return (
                <div
                  key={index}
                  className="group relative flex flex-col items-center cursor-pointer"
                  onClick={() => flipCard(index)}
                >
                  {/* Position Header */}
                  <div className="text-center mb-2">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      {drawnCard.positionLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 block max-w-[200px] truncate">
                      {drawnCard.positionDescription}
                    </span>
                  </div>

                  {/* 3D Card Container */}
                  <div className="w-full aspect-[2/3.4] relative rounded-2xl perspective-1000 transition-transform duration-300 group-hover:scale-105">
                    <div
                      className={`w-full h-full rounded-2xl border transition-all duration-700 transform-style-3d relative ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD BACK */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#18112e] via-[#0e0c1f] to-[#1e153b] border-2 border-amber-500/40 p-3 flex flex-col items-center justify-between shadow-xl backface-hidden">
                        <div className="w-full h-full border border-amber-500/20 rounded-xl p-2 flex flex-col items-center justify-center text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950">
                          <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400/80 mb-2">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="text-[10px] font-mono text-amber-300/60 uppercase tracking-widest">
                            Tap to Reveal
                          </span>
                        </div>
                      </div>

                      {/* CARD FRONT */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-[#1c1d2e] to-[#0f111c] border-2 border-amber-500/60 p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(212,175,55,0.2)] backface-hidden rotate-y-180 overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-900/10 pointer-events-none" />

                        {/* Top Badge */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80 z-10">
                          <span>{card.arcana === 'major' ? `I - ${card.number}` : card.suit?.toUpperCase()}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">
                            {card.element}
                          </span>
                        </div>

                        {/* Center Visual Art Symbol */}
                        <div className="my-auto text-center flex flex-col items-center z-10">
                          <div
                            className={`w-16 h-16 rounded-full border border-amber-400/50 bg-amber-950/40 flex items-center justify-center text-amber-300 mb-2 shadow-inner ${
                              drawnCard.isReversed ? 'rotate-180' : ''
                            }`}
                          >
                            <Flame className="w-8 h-8 text-amber-400" />
                          </div>

                          <h4 className="text-sm font-serif font-bold text-amber-100 text-center leading-snug">
                            {card.name}
                          </h4>

                          {drawnCard.isReversed && (
                            <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 mt-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                              <ShieldAlert className="w-3 h-3" /> Reversed
                            </span>
                          )}
                        </div>

                        {/* Keywords Footer */}
                        <div className="z-10 text-[10px] text-slate-300 leading-tight bg-slate-950/80 p-2 rounded-lg border border-amber-900/20">
                          <p className="font-semibold text-amber-300 mb-0.5">
                            {drawnCard.isReversed ? 'Reversed Insight:' : 'Upright Power:'}
                          </p>
                          <p className="line-clamp-2 italic text-slate-400">
                            {drawnCard.isReversed ? card.meaningReversed : card.meaningUpright}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Reading Action Bar */}
          <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 text-center space-y-4">
            <div className="max-w-xl mx-auto space-y-2">
              <h4 className="text-lg font-serif font-semibold text-amber-200">
                Synthesize the Cards with Hermetic AI Oracle
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect the archetype of each card position into a unified reading addressing your question.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={generateAiReading}
                disabled={isLoadingAi}
                className={`px-6 py-3 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isPremium
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110'
                    : 'bg-gradient-to-r from-purple-900/90 to-amber-950/90 text-amber-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-amber-400'
                } disabled:opacity-50`}
              >
                {!isPremium ? (
                  <>
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>GENERATE AI READING (PREMIUM)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'ORACLE SYNTHESIZING...' : 'GENERATE AI READING'}</span>
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

            {/* AI Reading Text Area */}
            {aiReading && (
              <div className="mt-6 text-left bg-slate-950/90 border border-amber-500/30 rounded-xl p-6 text-slate-200 text-sm leading-relaxed font-sans shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Hermetic AI Tarot Reading
                  </span>
                  <span className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-sm whitespace-pre-wrap">
                  {aiReading}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
