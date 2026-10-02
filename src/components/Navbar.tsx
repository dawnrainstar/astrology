import React from 'react';
import { DivinationTab, UserAccount } from '../types';
import { hasPremiumAccess, isOwner, getUserBadge, getTodayDateString } from '../utils/auth';
import {
  Sparkles,
  BookOpen,
  Compass,
  Eye,
  SunMoon,
  Shield,
  Volume2,
  VolumeX,
  History,
  Info,
  Crown,
  User,
  Home,
  LogOut,
  Lock,
  MessageSquare,
  Phone,
  Star
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  activeTab: DivinationTab;
  setActiveTab: (tab: DivinationTab) => void;
  onOpenHistory: () => void;
  onOpenLibrary: () => void;
  isAmbientPlaying: boolean;
  setIsAmbientPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSubscribe: () => void;
  onOpenChatSupport: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHistory,
  onOpenLibrary,
  isAmbientPlaying,
  setIsAmbientPlaying,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenSubscribe,
  onOpenChatSupport,
  onSignOut
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const isCreatorAccount = isOwner(currentUser);
  const badgeInfo = getUserBadge(currentUser);

  // Daily quota calculation
  const today = getTodayDateString();
  const readingsCount = currentUser?.lastReadingDate === today ? (currentUser?.readingsTodayCount || 0) : 0;
  const remainingFree = Math.max(0, 3 - readingsCount);

  const tabs: { id: DivinationTab; label: string; icon: React.ReactNode; isPremiumOnly?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'tarot', label: 'Tarot', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'horoscope', label: 'Horoscope', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'runes', label: 'Runes', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'iching', label: 'I-Ching', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'scrying', label: 'Scrying', icon: <Eye className="w-3.5 h-3.5" />, isPremiumOnly: true },
    { id: 'astrology', label: 'Astrology', icon: <SunMoon className="w-3.5 h-3.5" /> },
    { id: 'sigil', label: 'Sigils', icon: <Shield className="w-3.5 h-3.5" />, isPremiumOnly: true }
  ];

  const toggleSound = () => {
    const newState = soundEngine.toggleAmbient();
    setIsAmbientPlaying(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b0d17]/95 backdrop-blur-md border-b border-amber-900/30 px-3 md:px-6 py-2.5 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-900/40 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                OMNIORACLE
              </h1>
              {isCreatorAccount ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/80 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                  👑 Creator
                </span>
              ) : isPremium ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-300">
                  ✨ Premium
                </span>
              ) : null}
            </div>
            <p className="text-[10px] text-amber-400/70 tracking-widest font-mono uppercase">
              Unlock the hidden language of fate
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Home, Tarot, Runes, I-Ching, Scrying, Astrology, Sigils) */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isLocked = tab.isPremiumOnly && !isPremium;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playSingingBowl(320);
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-950/90 to-purple-950/90 text-amber-200 border border-amber-500/60 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {isLocked && (
                  <Lock className="w-2.5 h-2.5 text-purple-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Sound, Library, Journal, Upgrade Button & User Account */}
        <div className="flex items-center gap-2">
          {/* Daily Quota Pill for Free / Unmetered */}
          <div className="hidden lg:flex items-center">
            {isPremium ? (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/80 border border-amber-900/40 text-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Unlimited</span>
              </span>
            ) : (
              <span
                onClick={onOpenSubscribe}
                title="Free Seeker Daily Limit"
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300/90 flex items-center gap-1 cursor-pointer hover:border-amber-400 transition-colors"
              >
                <span>🔮</span>
                <span>{remainingFree}/3 free</span>
              </span>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isAmbientPlaying ? 'Mute Sacred Ambient Sound' : 'Play 432Hz Ambient Drone'}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isAmbientPlaying
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-300'
            }`}
          >
            {isAmbientPlaying ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reference Grimoire */}
          <button
            onClick={onOpenLibrary}
            title="Grimoire Reference Library"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Reading Journal History */}
          <button
            onClick={onOpenHistory}
            title="Divination Journal & Saved Records"
            className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          {/* AI Chat & Phone Support */}
          <button
            onClick={() => {
              soundEngine.playSingingBowl(432);
              onOpenChatSupport();
            }}
            title="AI Oracle Chat, Billing, Refunds & Phone Support"
            className="p-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
          >
            <MessageSquare className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden xl:inline text-[11px] font-medium">AI Support & Call</span>
          </button>

          {/* Subscribe $10/month button (shown if not premium / creator) */}
          {!isPremium && (
            <button
              onClick={onOpenSubscribe}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upgrade</span>
              <span>$10/mo</span>
            </button>
          )}

          {/* Account Profile / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenProfile}
                title="My Account Sanctum"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:border-amber-400 text-xs transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-300">
                  {isCreatorAccount ? <Crown className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3" />}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-slate-200">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-300 rounded hover:bg-slate-800/80 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-amber-400 text-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
