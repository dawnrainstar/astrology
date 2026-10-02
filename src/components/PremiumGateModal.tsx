import React from 'react';
import { Sparkles, Crown, CheckCircle2, Lock, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PremiumGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscribe: () => void;
  featureName?: string;
  reason?: 'limit' | 'feature';
}

export const PremiumGateModal: React.FC<PremiumGateModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscribe,
  featureName = 'AI Master Divination',
  reason = 'feature'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131628] border-2 border-amber-500/50 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden text-slate-200 relative animate-in fade-in zoom-in-95">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-amber-200">
              {reason === 'limit' ? 'Daily Reading Limit Reached' : 'Premium Oracle Feature'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-900/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            {reason === 'limit' ? <Lock className="w-7 h-7 text-amber-400" /> : <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />}
          </div>

          <div>
            <h4 className="font-serif font-bold text-xl text-slate-100">
              {reason === 'limit'
                ? 'Your 3 Free Readings for Today are Complete'
                : `Unlock ${featureName}`}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {reason === 'limit'
                ? 'Free seekers receive 3 consultations every 24 hours. Ascend to OmniOracle Premium for unlimited readings anytime.'
                : `${featureName} is reserved for OmniOracle Premium seekers. Unlock unlimited readings and AI mastery.`}
            </p>
          </div>

          {/* Quick Perks */}
          <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Unlimited readings (no daily 3-limit)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hermetic AI Master Readings & Syntheses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Obsidian Scrying Mirror & Sacred Sigil Forge</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cloud History Sync & Dossier Reports</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                soundEngine.playSingingBowl(528);
                onClose();
                onOpenSubscribe();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Unlock Premium • $10/month</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Continue on Free Tier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
