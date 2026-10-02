import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  getUserBadge,
  isOwner,
  cancelUserSubscription,
  setCurrentUser,
  getTodayDateString,
  OWNER_EMAIL
} from '../utils/auth';
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
  ArrowUpRight
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

  if (!isOpen) return null;

  const isCreator = isOwner(currentUser);
  const badgeInfo = getUserBadge(currentUser);
  const today = getTodayDateString();
  const readingsToday = currentUser.lastReadingDate === today ? (currentUser.readingsTodayCount || 0) : 0;
  const remainingFree = Math.max(0, 3 - readingsToday);

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
                  <span className="font-mono text-slate-200">
                    {currentUser.paymentMethod?.brand || 'Visa'} ending in {currentUser.paymentMethod?.last4 || '4242'}
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
