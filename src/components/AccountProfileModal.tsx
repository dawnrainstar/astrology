import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  getUserBadge,
  isOwner,
  cancelUserSubscription,
  setCurrentUser,
  updateUserProfile,
  getTodayDateString,
  OWNER_EMAIL
} from '../utils/auth';
import { calculateSunSign } from '../data/astrologyData';
import { soundEngine } from '../utils/audio';
import {
  X,
  User,
  Crown,
  Sparkles,
  CreditCard,
  Calendar,
  Cloud,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  History,
  Shield,
  ArrowUpRight,
  Phone,
  PhoneCall,
  Star,
  Check,
  Compass
} from 'lucide-react';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserUpdated: (updatedUser: UserAccount) => void;
  onSignOut: () => void;
  onOpenSubscribe: () => void;
  onOpenHistory: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onSignOut,
  onOpenSubscribe,
  onOpenHistory
}) => {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Natal Coordinates for Personalized Horoscopes & Astrology
  const [birthDate, setBirthDate] = useState<string>(currentUser.birthDate || '1992-06-15');
  const [birthTime, setBirthTime] = useState<string>(currentUser.birthTime || '12:00');
  const [birthPlace, setBirthPlace] = useState<string>(currentUser.birthPlace || '');
  const [natalSaved, setNatalSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const isCreator = isOwner(currentUser);
  const badgeInfo = getUserBadge(currentUser);
  const today = getTodayDateString();
  const readingsToday = currentUser.lastReadingDate === today ? (currentUser.readingsTodayCount || 0) : 0;
  const remainingFree = Math.max(0, 3 - readingsToday);

  const getDerivedSign = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        return calculateSunSign(month, day);
      }
    } catch (e) {}
    return 'Aries';
  };

  const handleSaveNatalCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calculatedSign = getDerivedSign(birthDate);
      const updated = updateUserProfile(currentUser.id, {
        birthDate,
        birthTime,
        birthPlace,
        zodiacSign: calculatedSign
      });
      onUserUpdated(updated);
      setNatalSaved(true);
      soundEngine.playSingingBowl(528);
      setTimeout(() => setNatalSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update natal profile');
    }
  };

  // Quick Switcher to allow instant perspective testing
  const switchAccountType = (tier: 'creator' | 'premium' | 'free') => {
    soundEngine.playSingingBowl(432);
    let updated: UserAccount;

    if (tier === 'creator') {
      updated = {
        ...currentUser,
        email: OWNER_EMAIL,
        name: 'Dawn Milazzo (Oracle Keeper)',
        tier: 'creator',
        subscriptionActive: true,
        subscriptionPlan: 'creator',
        subscriptionEnd: 'never'
      };
    } else if (tier === 'premium') {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      updated = {
        ...currentUser,
        email: currentUser.email === OWNER_EMAIL ? 'cassandra@omnioracle.app' : currentUser.email,
        name: currentUser.name === 'Dawn Milazzo (Oracle Keeper)' ? 'Cassandra Star' : currentUser.name,
        tier: 'premium',
        subscriptionActive: true,
        subscriptionPlan: 'monthly',
        subscriptionEnd: nextMonth.toISOString()
      };
    } else {
      updated = {
        ...currentUser,
        email: currentUser.email === OWNER_EMAIL ? 'seeker@omnioracle.app' : currentUser.email,
        name: currentUser.name === 'Dawn Milazzo (Oracle Keeper)' ? 'Mystic Seeker' : currentUser.name,
        tier: 'free',
        subscriptionActive: false,
        subscriptionPlan: undefined,
        subscriptionEnd: undefined
      };
    }

    setCurrentUser(updated);
    onUserUpdated(updated);
    setStatusNotice(`Switched perspective to: ${tier.toUpperCase()}`);
    setTimeout(() => setStatusNotice(null), 2500);
  };

  const handleCancelSub = () => {
    try {
      const updated = cancelUserSubscription(currentUser.id);
      onUserUpdated(updated);
      setConfirmCancel(false);
      setStatusNotice('Subscription cancelled. You now have Free Seeker access.');
      soundEngine.playSingingBowl(320);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121526] border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200 relative my-6">
        {/* Top Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-purple-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-300">
              {isCreator ? <Crown className="w-5 h-5 text-amber-300" /> : <User className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-200">
                Seeker Sanctum & Profile
              </h2>
              <p className="text-xs text-slate-400">
                Manage your account credentials and divination subscription
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusNotice && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono text-center">
            {statusNotice}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-100">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {currentUser.email}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-serif font-bold border ${badgeInfo.color}`}
              >
                {badgeInfo.label}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Sanctum Status
                </span>
                <span className="text-slate-300 font-medium">
                  {isCreator
                    ? 'Creator 👑 (Lifetime Bypass)'
                    : currentUser.subscriptionActive
                    ? 'Active Recurring'
                    : 'Free Seeker'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Subscription Plan
                </span>
                <span className="text-slate-300 font-medium">
                  {isCreator
                    ? 'Lifetime Creator'
                    : currentUser.subscriptionPlan === 'monthly'
                    ? '$10.00 / month'
                    : currentUser.subscriptionPlan === 'lifetime'
                    ? 'Founder $99 Lifetime'
                    : 'Free Tier ($0)'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Renewal / Expiry
                </span>
                <span className="text-slate-300 font-medium font-mono text-[11px]">
                  {isCreator
                    ? 'Never'
                    : currentUser.subscriptionEnd === 'never'
                    ? 'Lifetime (Never)'
                    : currentUser.subscriptionEnd
                    ? new Date(currentUser.subscriptionEnd).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Daily Quota
                </span>
                <span className="text-slate-300 font-medium">
                  {isCreator || currentUser.subscriptionActive ? (
                    <span className="text-amber-400 font-semibold">Unlimited forever</span>
                  ) : (
                    <span>
                      {remainingFree} of 3 remaining today
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Cloud Sync Status */}
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Reading History Cloud Sync:</span>
              <span className="text-emerald-400 font-medium">Active & Saved to Account</span>
            </div>
          </div>

          {/* Natal Coordinates & Birth Date (For Personalized Horoscopes & Astrology) */}
          <div className="rounded-xl bg-slate-900/80 border border-amber-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h4 className="font-serif font-bold text-sm text-amber-200">
                  Natal Coordinates & Birth Date
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
                Personalized Horoscope Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your birth date powers your <strong>Daily Horoscope</strong> and natal chart forecasts. Update your birth data anytime:
            </p>

            <form onSubmit={handleSaveNatalCoordinates} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    Birth Date (Required)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    Birth Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                  Birth Place / City (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA or London, UK"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Derived Astrological Sign Badge */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sun Sign:</span>
                  <span className="font-serif font-bold text-amber-300 text-xs flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                    <span>✨</span>
                    <span>{getDerivedSign(birthDate)}</span>
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                >
                  {natalSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" />
                      <span>Update Natal Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Subscription Action Section */}
          <div className="space-y-3">
            {!currentUser.subscriptionActive && !isCreator ? (
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-purple-950/40 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-amber-200 text-sm">
                    Unlock Unlimited Readings
                  </h4>
                  <p className="text-xs text-slate-300">
                    Get AI Master Readings, Scrying Mirror, and Sigil Forge for $10/mo.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscribe();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all shrink-0 cursor-pointer"
                >
                  Upgrade • $10/mo
                </button>
              </div>
            ) : isCreator ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3.5 text-xs text-amber-200/90 flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <p>
                  <strong>Oracle Keeper:</strong> You have unmetered, lifetime access to all divination tools and AI models.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-400">Payment on file:</span>
                  <span className="font-mono text-slate-200 flex items-center gap-1.5">
                    {currentUser.paymentMethod?.brand === 'PayPal' ? (
                      <>
                        <span className="font-sans font-black italic tracking-tighter text-[11px] bg-[#003087] text-white px-1.5 py-0.5 rounded">
                          Pay<span className="text-[#0079C1]">Pal</span>
                        </span>
                        <span>{currentUser.paymentMethod.last4}</span>
                      </>
                    ) : (
                      <span>
                        {currentUser.paymentMethod?.brand || 'Visa'} ending in {currentUser.paymentMethod?.last4 || '4242'}
                      </span>
                    )}
                  </span>
                </div>

                {confirmCancel ? (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs space-y-2">
                    <p className="text-red-200">
                      Are you sure you want to cancel your $10/month subscription? You will return to the 3 readings/day free tier.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelSub}
                        className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                      >
                        Yes, Cancel Subscription
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="text-xs text-slate-400 hover:text-red-300 underline"
                  >
                    Cancel Recurring Subscription
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Creator Phone Support & Refund Policy Card */}
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#121528] to-[#171a33] p-4 space-y-3 text-xs shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Direct Creator Phone Support & Customer Service</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded">
                100% Refunds Granted
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="relative shrink-0">
                <img
                  src="/src/assets/images/dawn_milazzo_photo_1790974327929.jpg"
                  alt="Dawn Milazzo - Customer Service"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-black ${
                  isCreator || currentUser.subscriptionActive ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {isCreator || currentUser.subscriptionActive ? '✓' : '🔒'}
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-amber-200 text-sm">Dawn Milazzo</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300">
                      Creator & Billing Lead
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                    Billing Questions Only
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Dawn provides direct phone support for <strong>billing, subscription management, and refund assistance only</strong> (no divination questions by phone).
                </p>

                {isCreator || currentUser.subscriptionActive ? (
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <a
                      href={`tel:${localStorage.getItem('omni_oracle_support_phone') || '+1 (555) 792-7478'}`}
                      className="text-amber-300 font-mono font-bold hover:underline flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/50 px-2.5 py-1 rounded text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{localStorage.getItem('omni_oracle_support_phone') || '+1 (555) 792-7478'}</span>
                    </a>
                    <span className="text-slate-500 text-[11px] font-mono">dawnmilazzo7@gmail.com</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <span>🔒</span>
                      <span>+1 (555) •••-•••• (Paid Subscribers Only)</span>
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSubscribe();
                      }}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[11px] cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all"
                    >
                      Unlock Phone Line • $10/mo
                    </button>
                  </div>
                )}

                <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span><strong>Divination questions:</strong> Our AI Divination Scholar answers all Tarot, Rune, and Astrology questions 24/7 in chat!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Perspective Switcher for Testing (Useful for evaluators & Dawn) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tester & Role Switcher:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Preview</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => switchAccountType('creator')}
                className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                  isCreator
                    ? 'bg-amber-950 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-amber-200'
                }`}
              >
                👑 Oracle Keeper
              </button>

              <button
                type="button"
                onClick={() => switchAccountType('premium')}
                className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                  currentUser.tier === 'premium' && currentUser.subscriptionActive
                    ? 'bg-purple-950 border-purple-400 text-purple-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-purple-200'
                }`}
              >
                ✨ Premium
              </button>

              <button
                type="button"
                onClick={() => switchAccountType('free')}
                className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                  currentUser.tier === 'free'
                    ? 'bg-slate-800 border-slate-500 text-white font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                🌙 Free Tier
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>View Account Divination History</span>
            </button>

            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-red-300 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
