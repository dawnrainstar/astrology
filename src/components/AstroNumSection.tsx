import React, { useState } from 'react';
import { calculateBirthChart, calculateNumerology, PLANETS } from '../data/astrologyData';
import { AstrologicalChartData, NumerologyProfile, SavedReading, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess } from '../utils/auth';
import { SunMoon, Sparkles, BookmarkPlus, Check, Star, Calendar, User, Crown } from 'lucide-react';

interface AstroNumSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const AstroNumSection: React.FC<AstroNumSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const [fullName, setFullName] = useState('Sophia Starling');
  const [birthdate, setBirthdate] = useState('1998-07-23');
  const [birthTime, setBirthTime] = useState('14:30');
  const [chartData, setChartData] = useState<AstrologicalChartData | null>(null);
  const [numerology, setNumerology] = useState<NumerologyProfile | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const calculateProfile = () => {
    if (!birthdate) return;
    soundEngine.playSingingBowl(528);

    const chart = calculateBirthChart(birthdate, birthTime);
    const num = calculateNumerology(fullName || 'Seeker', birthdate);

    setChartData(chart);
    setNumerology(num);
    setAiReading(null);
    setIsSaved(false);
  };

  const generateAiReading = async () => {
    if (!chartData || !numerology) return;

    if (!isPremium) {
      onRequireUpgrade('AI Master Astrological Synthesis');
      return;
    }

    setIsLoadingAi(true);
    soundEngine.playSingingBowl(432);
    onReadingPerformed();

    try {
      const res = await fetch('/api/divination/astrology-numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: { fullName, birthdate, birthTime, chart: chartData },
          numerologyData: numerology,
          queryType: 'Full Astrological & Numerological Cosmic Profile'
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiReading(`Error: ${data.error}`);
      } else {
        setAiReading(data.reading);
      }
    } catch (err) {
      setAiReading('Error generating Astrological reading.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    if (!chartData || !numerology) return;
    const item: SavedReading = {
      id: `astronum-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'astrology',
      title: `${fullName} Cosmic Blueprint`,
      question: `Birthdate: ${birthdate} ${birthTime}`,
      summary: `Sun: ${chartData.sunSign} | Moon: ${chartData.moonSign} | Rising: ${chartData.risingSign} | Life Path: ${numerology.lifePathNumber}`,
      fullReading: aiReading || 'Profile calculated without AI synthesis.',
      detailsData: { chartData, numerology }
    };

    onSaveReading(item);
    setIsSaved(true);
    soundEngine.playSingingBowl(639);
  };

  return (
    <div className="space-y-8">
      {/* Header & Birth Input Controls */}
      <div className="bg-[#121526]/80 backdrop-blur border border-amber-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
            <SunMoon className="w-3.5 h-3.5" /> Astrology & Pythagorean Numerology Calculator
          </span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-amber-100 mb-6">
          Cosmic Blueprint & Numerological Profile
        </h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-200/80 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-400" /> Full Birth Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full birth name for Numerology"
              className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-200/80 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-200/80 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Birth Time (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-500/60"
              />
              <button
                onClick={calculateProfile}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all whitespace-nowrap"
              >
                COMPUTE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Results Grid */}
      {chartData && numerology && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Astrological Chart Card */}
            <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                  <SunMoon className="w-5 h-5 text-amber-400" /> Astrological Triad & Planets
                </h3>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {chartData.dominantElement} Element Dominant
                </span>
              </div>

              {/* Core Triad */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block">Sun Sign</span>
                  <span className="text-base font-serif font-bold text-amber-100">{chartData.sunSign}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block">Moon Sign</span>
                  <span className="text-base font-serif font-bold text-amber-100">{chartData.moonSign}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] font-mono text-amber-400 uppercase block">Rising / Asc</span>
                  <span className="text-base font-serif font-bold text-amber-100">{chartData.risingSign}</span>
                </div>
              </div>

              {/* Planetary Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-amber-300 block">Planetary Placements:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-slate-950/50 p-2 rounded-lg flex justify-between">
                    <span>Mercury (Intellect):</span> <strong className="text-amber-200">{chartData.mercurySign}</strong>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg flex justify-between">
                    <span>Venus (Love):</span> <strong className="text-amber-200">{chartData.venusSign}</strong>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg flex justify-between">
                    <span>Mars (Drive):</span> <strong className="text-amber-200">{chartData.marsSign}</strong>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg flex justify-between">
                    <span>Jupiter (Luck):</span> <strong className="text-amber-200">{chartData.jupiterSign}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Numerology Profile Card */}
            <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Pythagorean Numerology
                </h3>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                  2026 Personal Year #{numerology.personalYear}
                </span>
              </div>

              {/* Core Life Path Highlight */}
              <div className="bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-serif font-extrabold text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  {numerology.lifePathNumber}
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-300 uppercase block">Life Path Number</span>
                  <p className="text-xs text-slate-200 leading-snug font-medium">
                    {numerology.lifePathMeaning}
                  </p>
                </div>
              </div>

              {/* Secondary Numbers */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-900/30">
                  <span className="text-[10px] font-mono text-slate-400 block">Expression</span>
                  <span className="text-lg font-serif font-bold text-amber-200">{numerology.expressionNumber}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-900/30">
                  <span className="text-[10px] font-mono text-slate-400 block">Soul Urge</span>
                  <span className="text-lg font-serif font-bold text-amber-200">{numerology.soulUrgeNumber}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-900/30">
                  <span className="text-[10px] font-mono text-slate-400 block">Personality</span>
                  <span className="text-lg font-serif font-bold text-amber-200">{numerology.personalityNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Astrologer Synthesis */}
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
                    <span>SYNTHESIZE COSMIC PORTRAIT (PREMIUM)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'ANALYZING COSMIC ALIGNMENT...' : 'GENERATE AI ASTRO-NUMEROLOGY READING'}</span>
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
                    <Check className="w-4 h-4 text-emerald-400" /> BLUEPRINT SAVED
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-amber-400" /> SAVE BLUEPRINT TO JOURNAL
                  </>
                )}
              </button>
            </div>

            {aiReading && (
              <div className="mt-6 text-left bg-slate-950/90 border border-amber-500/30 rounded-xl p-6 text-slate-200 text-sm leading-relaxed shadow-inner">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block border-b border-amber-900/40 pb-2 mb-3">
                  Astrological & Numerological Master Portrait
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
