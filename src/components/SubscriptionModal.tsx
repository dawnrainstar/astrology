import React, { useState } from 'react';
import { UserAccount, SubscriptionTier } from '../types';
import { applySubscription, hasPremiumAccess, isOwner } from '../utils/auth';
import { soundEngine } from '../utils/audio';
import {
  X,
  Sparkles,
  CreditCard,
  Lock,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Star,
  Zap,
  Tag
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onSubscriptionUpdated: (updatedUser: UserAccount) => void;
  onPromptAuth: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubscriptionUpdated,
  onPromptAuth
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  if (!isOpen) return null;

  const isCurrentOwner = isOwner(currentUser);
  const isAlreadyPremium = hasPremiumAccess(currentUser) && !isCurrentOwner;

  const basePrice = selectedPlan === 'monthly' ? 10.00 : 99.00;
  const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discountPct) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const fillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardZip('90210');
    setCardholderName(currentUser?.name || 'Dawn Seeker');
    soundEngine.playSingingBowl(320);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'DIVINE100' || code === 'ORACLE100' || code === 'DAWN') {
      setAppliedCoupon({ code, discountPct: 100 });
      soundEngine.playSingingBowl(528);
    } else if (code === 'ORACLE50') {
      setAppliedCoupon({ code, discountPct: 50 });
      soundEngine.playSingingBowl(528);
    } else {
      setErrorMessage('Unrecognized discount code.');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      onPromptAuth();
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvc) {
      setErrorMessage('Please provide complete payment card information.');
      return;
    }

    setIsProcessing(true);
    soundEngine.playSingingBowl(432);

    // Simulate Stripe payment processing
    setTimeout(() => {
      try {
        const tier: SubscriptionTier = selectedPlan === 'lifetime' ? 'founder' : 'premium';
        const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';

        const updated = applySubscription(currentUser.id, tier, selectedPlan, {
          brand: 'Visa',
          last4,
          expMonth: cardExpiry.split('/')[0] || '12',
          expYear: cardExpiry.split('/')[1] || '28'
        });

        setIsProcessing(false);
        setSuccessAnimation(true);
        soundEngine.playSingingBowl(528);

        setTimeout(() => {
          onSubscriptionUpdated(updated);
          onClose();
        }, 1200);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Payment processing failed.');
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121526] border border-amber-500/40 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden text-slate-200 relative my-8">
        {/* Top Gold Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-amber-200">
                Ascend to OmniOracle Premium
              </h2>
              <p className="text-xs text-amber-400/70 font-mono">
                Unlock the unrestricted language of the cosmos
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

        {isCurrentOwner ? (
          /* Creator Bypass Notice */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Crown className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-amber-200">
              Oracle Keeper Bypass Active
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your account (<span className="text-amber-300 font-mono">{currentUser?.email}</span>) holds permanent creator privileges. You have unlimited access to every divination tool, spread, and AI model with zero billing.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all"
              >
                Return to Sanctuary
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            {/* Success state celebration */}
            {successAnimation && (
              <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center space-y-3 animate-in zoom-in-90">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="font-serif text-xl font-bold text-emerald-200">
                  Sacred Subscription Activated!
                </h3>
                <p className="text-xs text-emerald-300">
                  Welcome to OmniOracle Premium. The celestial veils have opened.
                </p>
              </div>
            )}

            {!successAnimation && (
              <>
                {/* Plan Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'monthly'
                        ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase text-slate-300">
                        Monthly
                      </span>
                      {selectedPlan === 'monthly' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="text-2xl font-serif font-black text-amber-200">
                      $10.00
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                        / mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Billed monthly. Cancel anytime with 1 click.
                    </p>
                  </div>

                  {/* Lifetime Founder Plan */}
                  <div
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                      selectedPlan === 'lifetime'
                        ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl">
                      SAVE FOREVER
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase text-slate-300">
                        Founder Tier
                      </span>
                      {selectedPlan === 'lifetime' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div className="text-2xl font-serif font-black text-purple-200">
                      $99.00
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                        lifetime
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pay once. Never pay recurring fees.
                    </p>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-amber-900/30">
                  <p className="text-[11px] font-mono text-amber-300/80 mb-2 uppercase tracking-wider">
                    Included with OmniOracle Premium:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Unlimited readings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>AI Master Readings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>AI Scrying Mirror Lens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Sacred Sigil Forge</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Celtic Cross & Pentagram</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Dossier Reports & Cloud Sync</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Stripe Payment Form */}
                <form onSubmit={handleSubscribe} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Payment Method (Stripe Secure)</span>
                    </span>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                    >
                      Fill Demo Card (4242...)
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Cardholder Full Name"
                      required
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card number (e.g. 4242 •••• •••• 4242)"
                      required
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      required
                      className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center"
                    />
                    <input
                      type="text"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      placeholder="ZIP"
                      required
                      className="px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center"
                    />
                  </div>

                  {/* Promo Code Entry */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon / Seeker Code (e.g. DIVINE100)"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                      <span>Sacred Code &ldquo;{appliedCoupon.code}&rdquo; Applied:</span>
                      <span>-{appliedCoupon.discountPct}% Discount</span>
                    </div>
                  )}

                  {/* Price & Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Securing Oracle Sanctum...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Authorize & Activate • ${finalPrice.toFixed(2)}
                            {selectedPlan === 'monthly' ? '/mo' : ' one-time'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" />
                      <span>256-bit Encrypted</span>
                    </span>
                    <span>•</span>
                    <span>Stripe Recurring Billing</span>
                    <span>•</span>
                    <span>Cancel Anytime</span>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
