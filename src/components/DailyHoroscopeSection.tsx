import React, { useState, useEffect } from 'react';
import { SavedReading, UserAccount } from '../types';
import { calculateSunSign } from '../data/astrologyData';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess, checkReadingAllowance, updateUserProfile } from '../utils/auth';
import {
  Sparkles,
  Star,
  Sun,
  Moon,
  Calendar,
  Clock,
  Compass,
  BookmarkPlus,
  Check,
  Crown,
  RefreshCw,
  Download,
  Flame,
  Heart,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Copy,
  Layers,
  Sparkle
} from 'lucide-react';

interface DailyHoroscopeSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onUserUpdated?: (updatedUser: UserAccount) => void;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
  onOpenChatSupport?: () => void;
}

const ZODIAC_GLYPHS: Record<string, { symbol: string; dates: string; element: string; color: string }> = {
  Aries: { symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', color: 'from-red-500/20 to-amber-500/20 border-red-500/40 text-red-400' },
  Taurus: { symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400' },
  Gemini: { symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', color: 'from-amber-500/20 to-yellow-500/20 border-yellow-500/40 text-yellow-300' },
  Cancer: { symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300' },
  Leo: { symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400' },
  Virgo: { symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-300' },
  Libra: { symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300' },
  Scorpio: { symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', color: 'from-purple-500/20 to-rose-500/20 border-purple-500/40 text-purple-300' },
  Sagittarius: { symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-400' },
  Capricorn: { symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', color: 'from-slate-500/20 to-stone-500/20 border-slate-500/40 text-slate-300' },
  Aquarius: { symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40 text-sky-300' },
  Pisces: { symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300' }
};

const FOCUS_REALMS = [
  { id: 'Holistic Cosmic Forecast', label: '🌟 All Realms (Holistic)', desc: 'Complete daily energetic synthesis' },
  { id: 'Love, Soulmates & Relationships', label: '💖 Love & Intimacy', desc: 'Heart chakra, romantic currents & connections' },
  { id: 'Ambition, Career & Financial Flow', label: '⚡ Career & Wealth', desc: 'Material manifestation & leadership' },
  { id: 'Intuition, Magic & Spiritual Growth', label: '🔮 Intuition & Mysticism', desc: 'Third-eye, dreams & psychic alignment' },
  { id: 'Vitality, Healing & Well-being', label: '🌿 Vitality & Wellness', desc: 'Physical prana & nervous system alignment' }
];

export const DailyHoroscopeSection: React.FC<DailyHoroscopeSectionProps> = ({
  onSaveReading,
  currentUser,
  onUserUpdated,
  onRequireUpgrade,
  onReadingPerformed,
  onOpenChatSupport
}) => {
  const isPremium = hasPremiumAccess(currentUser);

  // Default birth date from profile or fallback
  const [birthDate, setBirthDate] = useState<string>(() => {
    return currentUser?.birthDate || '1992-07-07';
  });
  const [birthTime, setBirthTime] = useState<string>(() => {
    return currentUser?.birthTime || '12:00';
  });
  const [birthPlace, setBirthPlace] = useState<string>(() => {
    return currentUser?.birthPlace || '';
  });

  // Keep state synced if currentUser prop updates
  useEffect(() => {
    if (currentUser?.birthDate) setBirthDate(currentUser.birthDate);
    if (currentUser?.birthTime) setBirthTime(currentUser.birthTime);
    if (currentUser?.birthPlace) setBirthPlace(currentUser.birthPlace);
  }, [currentUser?.birthDate, currentUser?.birthTime, currentUser?.birthPlace]);

  // Target Forecast Date
  const todayStr = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(todayStr);
  const [focusArea, setFocusArea] = useState<string>('Holistic Cosmic Forecast');

  // UI accordion state
  const [isEditingNatal, setIsEditingNatal] = useState<boolean>(false);
  const [natalSaveSuccess, setNatalSaveSuccess] = useState<boolean>(false);

  // Forecast generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Calculate current Sun Sign
  const getDerivedSign = (bDate: string) => {
    try {
      const parts = bDate.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        return calculateSunSign(month, day);
      }
    } catch (e) {}
    return 'Cancer';
  };

  const currentSign = getDerivedSign(birthDate);
  const glyphInfo = ZODIAC_GLYPHS[currentSign] || ZODIAC_GLYPHS['Cancer'];

  // Save changes to User Profile
  const handleSaveNatalToProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundEngine.playSingingBowl(528);

    if (currentUser) {
      try {
        const updated = updateUserProfile(currentUser.id, {
          birthDate,
          birthTime,
          birthPlace,
          zodiacSign: currentSign
        });
        if (onUserUpdated) onUserUpdated(updated);
        setNatalSaveSuccess(true);
        setTimeout(() => {
          setNatalSaveSuccess(false);
          setIsEditingNatal(false);
        }, 1800);
      } catch (err: any) {
        alert(err.message || 'Failed to update user profile');
      }
    } else {
      // Guest mode
      setNatalSaveSuccess(true);
      setTimeout(() => {
        setNatalSaveSuccess(false);
        setIsEditingNatal(false);
      }, 1500);
    }
  };

  // Generate Daily Horoscope with AI
  const generateDailyHoroscope = async () => {
    const quota = checkReadingAllowance(currentUser);
    if (!quota.allowed) {
      onRequireUpgrade('Daily Personalized Horoscopes', 'limit');
      return;
    }

    setIsLoading(true);
    soundEngine.playSingingBowl(432);
    setForecast(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/divination/daily-horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
          targetDate,
          focusArea,
          userName: currentUser?.name || 'Seeker',
          userTier: currentUser?.tier || 'free'
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to channel daily horoscope.');
      }

      const data = await response.json();
      setForecast(data.forecast);
      setForecastData(data.natal);
      onReadingPerformed();
      soundEngine.playSingingBowl(528);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error generating daily astrological forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save to Journal
  const handleSave = () => {
    if (!forecast) return;

    const item: SavedReading = {
      id: `horoscope-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'horoscope',
      title: `Daily Horoscope: ${currentSign} (${targetDate})`,
      question: `Personalized Forecast for ${birthDate} • Focus: ${focusArea}`,
      summary: `Astrological forecast for ${currentSign} Sun on ${targetDate}. Realm: ${focusArea}`,
      fullReading: forecast,
      detailsData: {
        birthDate,
        birthTime,
        birthPlace,
        targetDate,
        focusArea,
        sign: currentSign,
        element: glyphInfo.element
      }
    };

    onSaveReading(item);
    setIsSaved(true);
    soundEngine.playSingingBowl(528);
  };

  const handleCopyForecast = () => {
    if (!forecast) return;
    navigator.clipboard.writeText(`OMNIORACLE DAILY HOROSCOPE: ${currentSign} (${targetDate})\n\n${forecast}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadForecast = () => {
    if (!forecast) return;
    const blob = new Blob(
      [
        `# OMNIORACLE CELESTIAL HOROSCOPE\n` +
        `**Seeker:** ${currentUser?.name || 'Divination Seeker'}\n` +
        `**Zodiac Sign:** ${currentSign} (${glyphInfo.symbol})\n` +
        `**Birth Date:** ${birthDate}\n` +
        `**Forecast Date:** ${targetDate}\n` +
        `**Focus Realm:** ${focusArea}\n\n` +
        `---\n\n` +
        forecast
      ],
      { type: 'text/markdown' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Horoscope_${currentSign}_${targetDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Star className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Hermetic Zodiac & Planetary Transits</span>
          <span className="text-slate-500">•</span>
          <span>AI Astrological Forecast</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100">
          Personalized Daily Horoscope
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Deep, personalized cosmic forecasts channeled in real-time by the OmniOracle AI Master Astrologer, calibrated to the exact celestial transits impacting your birth coordinates today.
        </p>
      </div>

      {/* Seeker Profile & Natal Coordinates Banner */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-[#121528] via-[#0d1020] to-[#17132a] p-6 shadow-xl relative overflow-hidden">
        {/* Subtle Constellation Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Seeker Sign Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${glyphInfo.color} flex flex-col items-center justify-center border shadow-lg shrink-0`}>
              <span className="text-2xl font-serif">{glyphInfo.symbol}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider">{glyphInfo.element}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-xl text-amber-200">
                  {currentSign} Sun
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-500/40 text-amber-300">
                  {glyphInfo.dates}
                </span>
                {currentUser?.birthDate ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>Linked to Account</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 border border-purple-500/40 text-purple-300">
                    Guest Coordinates
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">
                Seeker: <strong className="text-amber-300">{currentUser?.name || 'Divination Seeker'}</strong> • Born: <span className="font-mono text-slate-200">{birthDate}</span>
                {birthTime && <span className="font-mono text-slate-400"> @ {birthTime}</span>}
                {birthPlace && <span className="text-slate-400"> in {birthPlace}</span>}
              </p>
            </div>
          </div>

          {/* Action to Toggle Natal Edit */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditingNatal(!isEditingNatal)}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditingNatal ? 'Close Natal Editor' : 'Edit Birth Date & Coordinates'}</span>
              {isEditingNatal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Natal Editor Drawer */}
        {isEditingNatal && (
          <form
            onSubmit={handleSaveNatalToProfile}
            className="mt-6 pt-6 border-t border-amber-900/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fade-in"
          >
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Birth Date (Powers Your Horoscope)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Birth Time (For Ascendant / Houses)
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Birth City / Place
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Automatically syncs and saves into your user profile.</span>
              </span>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {natalSaveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Profile!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save to My Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Forecast Controls: Target Date & Focus Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Selection */}
        <div className="rounded-xl border border-slate-800 bg-[#0f1222] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Forecast Transit Date</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Channel today's celestial weather or explore upcoming transits:
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTargetDate(todayStr)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                targetDate === todayStr
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setTargetDate(tomorrow.toISOString().split('T')[0]);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                targetDate !== todayStr
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tomorrow
            </button>
          </div>

          <div className="pt-1">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none"
            />
          </div>
        </div>

        {/* Focus Realm Selection (Span 2 cols) */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#0f1222] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Cosmic Realm of Focus</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Personalized Alchemical Lenses
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Select which sphere of your existence to emphasize in today's reading:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {FOCUS_REALMS.map((realm) => {
              const isSelected = focusArea === realm.id;
              return (
                <button
                  key={realm.id}
                  type="button"
                  onClick={() => setFocusArea(realm.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/80 to-purple-950/80 border-amber-400/80 text-amber-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">
                    {realm.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {realm.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Channel Forecast Trigger Button */}
      <div className="text-center pt-2">
        <button
          onClick={generateDailyHoroscope}
          disabled={isLoading}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-black text-sm tracking-wider uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Attuning to Celestial Spheres...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Channel Daily Horoscope for {currentSign}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-950/20 text-slate-950 font-mono">
                {targetDate === todayStr ? 'Today' : targetDate}
              </span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          Harmonized with the 7 classical planets & current solar-lunar transits.
        </p>
      </div>

      {/* Loading Skeleton & Orbiting Planetary Ring */}
      {isLoading && (
        <div className="p-12 rounded-2xl bg-[#0f1222]/90 border border-amber-500/30 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-amber-500/30 border-t-amber-400 animate-spin" />
            {/* Inner ring */}
            <div className="absolute inset-3 rounded-full border border-purple-500/30 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            {/* Center glyph */}
            <span className="text-3xl text-amber-300 font-serif animate-pulse">{glyphInfo.symbol}</span>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="font-serif font-bold text-lg text-amber-200">
              Calculating Celestial Intersections
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Synthesizing {currentSign} natal degree with today's planetary positions, solar aspects, and elemental currents...
            </p>
          </div>
        </div>
      )}

      {/* Generated Forecast Display */}
      {forecast && !isLoading && (
        <div className="rounded-2xl border border-amber-500/50 bg-[#0e1122] p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Top Cosmic Gold Bar */}
          <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-purple-500 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6" />

          {/* Reading Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif text-amber-300">{glyphInfo.symbol}</span>
                <h3 className="font-serif font-bold text-2xl text-amber-100">
                  {currentSign} Celestial Horoscope
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Date: <strong className="text-slate-200">{targetDate}</strong> • Focus: <span className="text-amber-300">{focusArea}</span> • Seeker: <span className="text-slate-200">{currentUser?.name || 'Seeker'}</span>
              </p>
            </div>

            {/* Actions: Save to Journal, Copy, Download, Ask AI */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSaved
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved in Journal</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save to Journal</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyForecast}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500 transition-all cursor-pointer"
                title="Copy Forecast to Clipboard"
              >
                {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadForecast}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500 transition-all cursor-pointer"
                title="Download Forecast Markdown Dossier"
              >
                <Download className="w-4 h-4" />
              </button>

              {onOpenChatSupport && (
                <button
                  onClick={onOpenChatSupport}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-200 hover:bg-purple-900/80 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                  <span>Discuss with AI Oracle</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Cosmic Vibrations Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-rose-900/30 space-y-1">
              <div className="flex items-center justify-between text-rose-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Love</span>
                </span>
                <span className="font-mono font-bold text-rose-400">89%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '89%' }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-amber-900/30 space-y-1">
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Career</span>
                </span>
                <span className="font-mono font-bold text-amber-400">92%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-purple-900/30 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Intuition</span>
                </span>
                <span className="font-mono font-bold text-purple-400">96%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-900/30 space-y-1">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Vitality</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">84%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>
          </div>

          {/* Forecast Markdown Body */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4 font-sans bg-slate-950/40 p-6 rounded-xl border border-slate-800/80">
            {forecast.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('###') || paragraph.startsWith('##') || paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('4.') || paragraph.startsWith('5.')) {
                return (
                  <h4 key={idx} className="font-serif font-bold text-base text-amber-200 pt-3 pb-1 border-b border-amber-900/30 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{paragraph.replace(/^#+\s*/, '')}</span>
                  </h4>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-slate-300">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx} className="text-slate-300">
                        {line.replace(/^[-*]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Daily Celestial Affirmation Parchment */}
          <div className="p-5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-amber-950/40 text-center space-y-2 shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Sparkle className="w-3.5 h-3.5" />
              <span>Daily Celestial Decree</span>
              <Sparkle className="w-3.5 h-3.5" />
            </div>
            <p className="font-serif italic text-base sm:text-lg text-amber-100 max-w-xl mx-auto">
              "As above in the starry heavens, so below in my grounded earthly temple. The cosmic currents yield wisdom and peace to my spirit today."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
