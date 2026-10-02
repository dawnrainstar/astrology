import React, { useState } from 'react';
import { RUNE_SPREADS, ELDER_FUTHARK_RUNES } from '../data/runeData';
import { DrawnRune, RuneSpread, SavedReading, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess, checkReadingAllowance } from '../utils/auth';
import { Sparkles, RotateCw, BookmarkPlus, Check, Flame, ShieldAlert, Mountain, Lock, Crown } from 'lucide-react';

interface RuneSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const RuneSection: React.FC<RuneSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const [selectedSpread, setSelectedSpread] = useState<RuneSpread>(RUNE_SPREADS[0]); // 1 Rune default for Free
  const [question, setQuestion] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnRunes, setDrawnRunes] = useState<DrawnRune[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectSpread = (spread: RuneSpread) => {
    const isPremiumSpread = spread.id === 'three_norns' || spread.id === 'five_cross';
    if (isPremiumSpread && !isPremium) {
      onRequireUpgrade(`${spread.name} (${spread.runeCount} Runes)`);
      return;
    }
    setSelectedSpread(spread);
    setDrawnRunes([]);
    setAiReading(null);
    soundEngine.playSingingBowl(350);
  };

  const drawRuneCast = () => {
    // Check reading quota
    const quota = checkReadingAllowance(currentUser);
    if (!quota.allowed) {
      onRequireUpgrade('Unlimited Daily Readings', 'limit');
      return;
    }

    soundEngine.playRuneStoneDraw();
    setIsDrawing(true);
    setDrawnRunes([]);
    setAiReading(null);
    setIsSaved(false);

    // Record reading used
    onReadingPerformed();

    setTimeout(() => {
      const shuffled = [...ELDER_FUTHARK_RUNES].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, selectedSpread.runeCount);

      const drawn: DrawnRune[] = chosen.map((rune, idx) => {
        const isMerkstave = rune.id !== 'wyrd' && Math.random() < 0.25; // 25% chance Merkstave
        const pos = selectedSpread.positions[idx] || {
          label: `Position ${idx + 1}`,
          description: 'Position'
        };

        return {
          rune,
          isMerkstave,
          positionLabel: pos.label,
          positionDescription: pos.description
        };
      });

      setDrawnRunes(drawn);
      setIsDrawing(false);
      soundEngine.playSingingBowl(432);
    }, 600);
  };

  const generateAiReading = async () => {
    if (drawnRunes.length === 0) return;

    if (!isPremium) {
      onRequireUpgrade('Elder Futhark AI Runic Volva Interpretation');
      return;
    }

    setIsLoadingAi(true);
    soundEngine.playSingingBowl(432);

    try {
      const res = await fetch('/api/divination/runes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spreadName: selectedSpread.name,
          runes: drawnRunes.map((dr) => ({
            name: dr.rune.name,
            symbol: dr.rune.symbol,
            positionLabel: dr.positionLabel,
            isMerkstave: dr.isMerkstave,
            phonetic: dr.rune.phonetic,
            traditionalMeaning: dr.rune.traditionalMeaning,
            deity: dr.rune.deity,
            element: dr.rune.element
          }))
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiReading(`Error: ${data.error}`);
      } else {
        setAiReading(data.reading);
      }
    } catch (err) {
      setAiReading('Error consulting the Runic Volva.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    if (!drawnRunes.length) return;
    const item: SavedReading = {
      id: `rune-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'runes',
      title: `${selectedSpread.name} Cast`,
      question: question || 'Runic Wisdom of Wyrd',
      summary: drawnRunes.map((r) => `${r.positionLabel}: ${r.rune.name} (${r.rune.symbol})`).join(' | '),
      fullReading: aiReading || 'Runes drawn without AI synthesis.',
      detailsData: drawnRunes
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
              <Mountain className="w-3.5 h-3.5" /> Elder Futhark Runic Oracle (24 Staves + Wyrd)
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100">
              Elder Futhark Rune Casting
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {RUNE_SPREADS.map((spread) => {
              const isLocked = (spread.id === 'three_norns' || spread.id === 'five_cross') && !isPremium;
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
                  <span>{spread.name} ({spread.runeCount})</span>
                  {isLocked && <Lock className="w-3 h-3 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intention & Draw Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-slate-950/60 border border-amber-900/20 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-1">
              Spread: {selectedSpread.name}
            </span>
            {selectedSpread.description}
          </div>

          <div className="md:col-span-2 flex flex-col justify-between gap-2">
            <label className="text-xs font-medium text-amber-200/80">
              Focus on your query for the Norns and draw from the pouch:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., What force governs my obstacle and how do I fortify my shield?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
              />
              <button
                onClick={drawRuneCast}
                disabled={isDrawing}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
                {isDrawing ? 'DRAWING...' : 'DRAW RUNES'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rune Stones Cast Display */}
      {drawnRunes.length > 0 && (
        <div className="space-y-6">
          <div
            className={`grid gap-6 ${
              drawnRunes.length === 1
                ? 'grid-cols-1 max-w-sm mx-auto'
                : drawnRunes.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
            }`}
          >
            {drawnRunes.map((drawnRune, index) => {
              const rune = drawnRune.rune;

              return (
                <div
                  key={index}
                  className="bg-gradient-to-b from-[#1c1d2e] to-[#0f111c] border-2 border-amber-500/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col justify-between space-y-4 hover:scale-102 transition-transform"
                >
                  {/* Position Header */}
                  <div className="text-center border-b border-amber-900/40 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      {drawnRune.positionLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {drawnRune.positionDescription}
                    </span>
                  </div>

                  {/* Stone Rune Glyphs */}
                  <div className="flex flex-col items-center py-2">
                    <div
                      className={`w-20 h-24 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 flex flex-col items-center justify-center text-amber-200 shadow-inner mb-2 relative ${
                        drawnRune.isMerkstave ? 'rotate-180' : ''
                      }`}
                    >
                      <span className="text-4xl font-serif font-bold tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]">
                        {rune.symbol}
                      </span>
                    </div>

                    <h4 className="text-lg font-serif font-bold text-amber-100">
                      {rune.name}
                    </h4>

                    {drawnRune.isMerkstave && (
                      <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 mt-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                        <ShieldAlert className="w-3 h-3" /> Merkstave (Reversed)
                      </span>
                    )}
                  </div>

                  {/* Rune Info */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/20 text-xs text-slate-300 space-y-1.5 leading-tight">
                    <div className="flex justify-between text-[10px] font-mono text-amber-400">
                      <span>Phonetic: {rune.phonetic}</span>
                      <span>Deity: {rune.deity}</span>
                    </div>
                    <p className="font-semibold text-amber-200">
                      {rune.traditionalMeaning}
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      {drawnRune.isMerkstave ? rune.merkstaveMeaning : rune.uprightMeaning}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Volva Reading Button */}
          <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 text-center space-y-4">
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
                    <span>CONSULT RUNIC VOLVA (PREMIUM)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'CONSULTING RUNIC VOLVA...' : 'GENERATE RUNIC WISDOM READING'}</span>
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
                  Volva Runic Prophecy
                </span>
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
