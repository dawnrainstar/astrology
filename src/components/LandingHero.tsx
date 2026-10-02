import React from 'react';
import { DivinationTab, UserAccount } from '../types';
import { hasPremiumAccess, isOwner } from '../utils/auth';
import {
  Sparkles,
  BookOpen,
  Compass,
  Eye,
  SunMoon,
  Shield,
  ArrowRight,
  CheckCircle2,
  Crown,
  Lock,
  Star,
  Zap,
  Flame,
  Phone,
  PhoneCall
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LandingHeroProps {
  onSelectTab: (tab: DivinationTab) => void;
  onOpenSubscribe: () => void;
  onOpenAuth: () => void;
  currentUser: UserAccount | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectTab,
  onOpenSubscribe,
  onOpenAuth,
  currentUser
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const isCreatorAccount = isOwner(currentUser);

  const divinationModules: {
    id: DivinationTab;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    tier: 'free' | 'premium';
    badge: string;
  }[] = [
    {
      id: 'tarot',
      title: 'Tarot Deck',
      subtitle: '78-Card Rider-Waite-Smith',
      description: 'Consult the archetypes of the Major and Minor Arcana through dynamic 1-card, 3-card, 5-card Pentagram, and 10-card Celtic Cross spreads.',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      tier: 'free',
      badge: 'Free Spreads + AI'
    },
    {
      id: 'horoscope',
      title: 'Daily Horoscope',
      subtitle: 'Personalized Astrological Forecast',
      description: 'Channel tailored daily astrological insights, planetary transits, love & career meters, and lucky correspondences calibrated to your birth date.',
      icon: <Star className="w-6 h-6 text-amber-400" />,
      tier: 'free',
      badge: '✨ Natal Transits + AI'
    },
    {
      id: 'runes',
      title: 'Elder Futhark Runes',
      subtitle: 'Ancient Nordic Whispers',
      description: 'Draw sacred staves from the runic pouch. Interpret upright and merkstave polarities across the Web of Wyrd with the Three Norns.',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      tier: 'free',
      badge: 'Free Single + Spreads'
    },
    {
      id: 'iching',
      title: 'I-Ching Coin Casting',
      subtitle: 'The Book of Changes (Zhouyi)',
      description: 'Cast 3 bronze coins six times to synthesize hexagram lines, reveal mutating changing lines, and uncover future transformations.',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
      tier: 'free',
      badge: 'Free Coin Toss'
    },
    {
      id: 'scrying',
      title: 'AI Scrying Mirror',
      subtitle: 'Obsidian Liquid Reflection',
      description: 'Gaze into the dark obsidian water lens. Swirling ethereal mist and interactive fluid physics awaken subconscious prophetic visions.',
      icon: <Eye className="w-6 h-6 text-purple-400" />,
      tier: 'premium',
      badge: '✨ Premium Exclusive'
    },
    {
      id: 'astrology',
      title: 'Astrology & Numerology',
      subtitle: 'Cosmic Blueprint Calculation',
      description: 'Calculate your Sun, Moon, Rising placements alongside Pythagorean Life Path, Expression, and Soul Urge frequencies.',
      icon: <SunMoon className="w-6 h-6 text-amber-400" />,
      tier: 'free',
      badge: 'Free Chart + AI'
    },
    {
      id: 'sigil',
      title: 'Sacred Sigil Forge',
      subtitle: 'Esoteric Intention Geometry',
      description: 'Condense intentions into cleansed consonants and geometric glyphs using planetary Kameas, Rose Cross wheels, and consecration chants.',
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      tier: 'premium',
      badge: '✨ Premium Exclusive'
    }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Mystical Landing Page Header & Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#12162a]/90 via-[#0d1020]/95 to-[#0b0d18] p-8 md:p-14 text-center shadow-[0_0_50px_rgba(212,175,55,0.08)]">
        {/* Sacred Geometry Watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-purple-900/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-500/5 rounded-full pointer-events-none animate-[spin_120s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-dashed border-amber-500/10 rounded-full pointer-events-none animate-[spin_80s_linear_infinite_reverse]" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Creator / Status Indicator */}
          {isCreatorAccount ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/90 to-yellow-950/90 border border-amber-400/80 text-amber-300 text-xs font-serif tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Oracle Keeper 👑 • Unrestricted Creator Mode</span>
            </div>
          ) : isPremium ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-serif tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>✨ OmniOracle Premium Active • Unlimited Oracle Access</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300/90 text-xs font-serif tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sacred Divination & AI Oracle Portal</span>
            </div>
          )}

          {/* Brand Name */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 drop-shadow-sm">
            OMNIORACLE
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-amber-200/90 font-serif italic tracking-wide">
            &ldquo;Unlock the hidden language of fate.&rdquo;
          </p>

          {/* Seven Divination Pillars Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-w-3xl mx-auto py-3 text-sm text-slate-300">
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded-xl py-2 px-3">
              <span className="text-amber-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">Tarot Readings</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-500/40 bg-amber-950/20 rounded-xl py-2 px-3">
              <span className="text-amber-300">⭐</span>
              <span className="font-medium text-xs sm:text-sm text-amber-200">Daily Horoscope</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded-xl py-2 px-3">
              <span className="text-amber-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">Rune Casting</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded-xl py-2 px-3">
              <span className="text-amber-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">I-Ching Divination</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-purple-900/40 rounded-xl py-2 px-3">
              <span className="text-purple-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">AI Scrying Mirror</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded-xl py-2 px-3">
              <span className="text-amber-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">Astro & Numerology</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-purple-900/40 rounded-xl py-2 px-3">
              <span className="text-purple-400">✨</span>
              <span className="font-medium text-xs sm:text-sm">Sacred Sigil Creation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded-xl py-2 px-3">
              <span className="text-amber-400">💬</span>
              <span className="font-medium text-xs sm:text-sm">AI Oracle Chat</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                soundEngine.playSingingBowl(432);
                onSelectTab('tarot');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-slate-950 font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {!isPremium && (
              <button
                onClick={() => {
                  soundEngine.playSingingBowl(528);
                  onOpenSubscribe();
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-900/80 to-amber-950/80 border border-amber-400/60 text-amber-200 font-semibold text-sm tracking-wider hover:bg-amber-900/50 hover:border-amber-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)] cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Upgrade to Premium • $10/month</span>
              </button>
            )}

            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm transition-all cursor-pointer"
              >
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* The 6 Portals of Oracle Wisdom */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-200">
            Sacred Divination Portals
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Select a sacred medium to commune with ancient wisdom and hermetic insight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divinationModules.map((module) => {
            const isLocked = module.tier === 'premium' && !isPremium;
            return (
              <div
                key={module.id}
                onClick={() => {
                  if (isLocked) {
                    onOpenSubscribe();
                  } else {
                    soundEngine.playSingingBowl(432);
                    onSelectTab(module.id);
                  }
                }}
                className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer border group ${
                  isLocked
                    ? 'bg-[#111322]/80 border-purple-900/40 hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                    : 'bg-[#121629]/80 border-amber-900/30 hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {module.icon}
                    </div>
                    <span
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                        module.tier === 'premium'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {module.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-amber-400/70 font-mono mb-2">
                    {module.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {module.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {isLocked ? (
                    <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock with Premium ($10/mo)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 font-medium group-hover:translate-x-1 transition-transform">
                      <span>Begin Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    {isLocked ? 'Locked' : 'Open'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscription Pricing Comparison Matrix */}
      <section className="rounded-3xl border border-amber-500/30 bg-[#0d1020]/90 p-8 md:p-12 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
            TRANSPARENT REVENUE MODEL
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-100">
            Choose Your Sacred Plan
          </h2>
          <p className="text-sm text-slate-400">
            Start free with daily oracle readings, or ascend to Premium for unlimited AI Master readings, Obsidian Scrying, and Sacred Sigil generation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-slate-800 bg-[#121526]/70 p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-slate-200">Free Seeker</h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Basic
                </span>
              </div>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-serif font-black text-slate-100">$0</span>
                <span className="text-slate-400 text-xs ml-1">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>3 readings per day</strong> (resets daily)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Basic Tarot (1-card Odin's Eye & 3-card Time Stream)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Basic Rune draws (Single Rune Odin's Sight)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>I-Ching 3-coin casting & hexagram calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Astrology & Numerology chart calculations</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>AI Master Readings locked</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>Scrying Mirror & Sigil Generator locked</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                soundEngine.playSingingBowl(320);
                onSelectTab('tarot');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
            >
              Consult Free
            </button>
          </div>

          {/* Premium Tier ($10/month) - Highlighted */}
          <div className="relative rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-[#1c1836] to-[#121324] p-6 flex flex-col justify-between space-y-6 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-[11px] tracking-wider uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Choice</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-amber-200">
                  OmniOracle Premium
                </h3>
                <span className="text-xs font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded">
                  $10 / mo
                </span>
              </div>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-serif font-black text-amber-100">$10.00</span>
                <span className="text-amber-400/70 text-xs ml-1">/ month (cancel anytime)</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Unlimited readings</strong> (no daily restrictions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>AI Master Readings</strong> across Tarot, I-Ching, Runes, and Astro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Full AI Scrying Mirror</strong> (obsidian liquid reflection + visions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Sacred Sigil Generator</strong> & ritual consecration guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Premium Spreads</strong>: Celtic Cross (10 cards), Pentagram (5 cards), Three Norns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Reading History Cloud Sync</strong> & downloadable Dossier reports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                soundEngine.playSingingBowl(528);
                onOpenSubscribe();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>{isPremium ? 'Manage Subscription' : 'Unlock Premium • $10/month'}</span>
            </button>
          </div>

          {/* Founder Tier ($99 lifetime) */}
          <div className="rounded-2xl border border-amber-500/40 bg-[#15172b]/70 p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-yellow-200">
                  Founder Tier
                </h3>
                <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                  Limited Offer
                </span>
              </div>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-serif font-black text-amber-100">$99.00</span>
                <span className="text-slate-400 text-xs ml-1">one-time / lifetime access</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Everything in Premium</strong> forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Lifetime Access</strong> (never pay recurring fees)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Golden Founder Profile Badge & Discord Sigil</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Early access to upcoming Kabbalistic Tree of Life module</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Priority AI oracle model inference speed</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                soundEngine.playSingingBowl(528);
                onOpenSubscribe();
              }}
              className="w-full py-2.5 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Claim Founder • $99</span>
            </button>
          </div>
        </div>

        {/* Payment Methods Trust Banner */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 max-w-lg mx-auto pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="font-sans font-black italic tracking-tighter text-sm">
              <span className="text-[#0079C1]">Pay</span><span className="text-[#003087] bg-white px-0.5 rounded-sm">Pal</span>
            </span>
            <span className="text-slate-300">PayPal Supported</span>
          </span>
          <span>•</span>
          <span className="text-slate-300">Stripe Credit Cards</span>
          <span>•</span>
          <span className="text-slate-300">256-Bit SSL Encryption</span>
        </div>

        {/* Creator Direct Phone & Customer Service Card with Photo */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#121528] via-[#1a1733] to-[#121528] p-5 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-left">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="/src/assets/images/dawn_milazzo_photo_1790974327929.jpg"
                alt="Dawn Milazzo - Customer Service & App Creator"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black ${
                isPremium || isCreatorAccount ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`} title={isPremium || isCreatorAccount ? 'VIP Phone Line Active' : 'Paid Subscriber Perk'}>
                {isPremium || isCreatorAccount ? '✓' : '🔒'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-bold text-base text-amber-200">Dawn Milazzo</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-300 font-semibold">
                  App Creator & Billing Lead
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  Billing Questions Only
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                  100% Refunds Granted
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct phone support with Dawn is <strong>exclusive to active paid subscribers for billing and refund questions only</strong>. Dawn does not answer divination questions by phone.
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-xs flex-wrap">
                {isPremium || isCreatorAccount ? (
                  <a
                    href={`tel:${localStorage.getItem('omni_oracle_support_phone') || '+1 (555) 792-7478'}`}
                    className="font-mono text-amber-300 font-bold hover:underline flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/50 px-2.5 py-1 rounded-lg"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{localStorage.getItem('omni_oracle_support_phone') || '+1 (555) 792-7478'}</span>
                  </a>
                ) : (
                  <span className="font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
                    <span>🔒</span>
                    <span>+1 (555) •••-•••• (Paid Subscribers Only)</span>
                  </span>
                )}
                <span className="text-slate-500 text-[11px] font-mono">dawnmilazzo7@gmail.com</span>
              </div>
              <p className="text-[11px] text-amber-400/90 flex items-center gap-1 pt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span><strong>Divination questions:</strong> Our AI Divination Scholar answers all Tarot, Runes, and Astrology in chat!</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            {isPremium || isCreatorAccount ? (
              <a
                href={`tel:${localStorage.getItem('omni_oracle_support_phone') || '+1 (555) 792-7478'}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <PhoneCall className="w-4 h-4 text-slate-950" />
                <span>Call for Billing</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playSingingBowl(528);
                  onOpenSubscribe();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Subscribe to Call ($10/mo)</span>
              </button>
            )}
          </div>
        </div>

        {/* Creator Account Recognition Banner */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-900/40 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-amber-300">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">Creator Account:</span>
            <span className="font-mono text-slate-300">dawnmilazzo7@gmail.com</span>
          </div>
          <p className="text-slate-400">
            Permanent Lifetime Creator Bypass active • Label: <span className="text-amber-300 font-serif font-bold">&ldquo;Oracle Keeper 👑&rdquo;</span>
          </p>
        </div>
      </section>
    </div>
  );
};
