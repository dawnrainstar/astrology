import React from 'react';
import { MessageSquare, Sparkles, Phone, DollarSign } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface FloatingChatOrbProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingChatOrb: React.FC<FloatingChatOrbProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-45 group">
      {/* Floating Tooltip Bubble */}
      <div className="absolute -top-11 right-0 bg-[#12162a] border border-amber-500/50 text-amber-200 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Dawn Milazzo • Direct Phone & Support</span>
      </div>

      {/* Main Orb Button with Dawn's Photo */}
      <button
        onClick={() => {
          soundEngine.playSingingBowl(528);
          onClick();
        }}
        aria-label="Contact Dawn Milazzo & AI Support"
        className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:shadow-[0_0_35px_rgba(212,175,55,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full border-2 border-amber-400/80 animate-ping opacity-30 pointer-events-none" />

        <div className="w-full h-full rounded-full overflow-hidden relative">
          <img
            src="/src/assets/images/dawn_milazzo_photo_1790974327929.jpg"
            alt="Dawn Milazzo Customer Support"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Small Phone Badge Indicator */}
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-md">
          <Phone className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
        </span>
      </button>
    </div>
  );
};
