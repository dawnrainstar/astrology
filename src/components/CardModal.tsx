import React, { useState } from 'react';
import { TAROT_DECK } from '../data/tarotData';
import { HEXAGRAMS } from '../data/ichingData';
import { ELDER_FUTHARK_RUNES } from '../data/runeData';
import { X, Search, BookOpen, Compass, Sparkles, Flame } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'tarot' | 'iching' | 'runes'>('tarot');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121526] border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-serif font-bold text-amber-100">
              Esoteric Grimoire & Reference Library
            </h3>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search */}
        <div className="p-4 bg-slate-950/60 border-b border-amber-900/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: 'tarot', label: '78 Tarot Cards', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'iching', label: '64 I-Ching Hexagrams', icon: <Compass className="w-3.5 h-3.5" /> },
              { id: 'runes', label: '25 Elder Runes', icon: <Sparkles className="w-3.5 h-3.5" /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  tab === t.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search symbol, element, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'tarot' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TAROT_DECK.filter(
                (c) =>
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-950/80 border border-amber-900/30 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      {card.arcana} {card.suit ? `- ${card.suit}` : ''}
                    </span>
                    <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/20">
                      {card.element}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-amber-100">{card.name}</h4>
                  <p className="text-xs text-slate-300">
                    <strong className="text-amber-300">Upright:</strong> {card.meaningUpright}
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong className="text-rose-400">Reversed:</strong> {card.meaningReversed}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === 'iching' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HEXAGRAMS.filter(
                (h) =>
                  h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  h.englishName.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((h) => (
                <div
                  key={h.number}
                  className="bg-slate-950/80 border border-amber-900/30 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">Hexagram #{h.number}</span>
                    <span className="text-lg font-serif text-amber-300">{h.upperSymbol}{h.lowerSymbol}</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-amber-100">
                    {h.name} ({h.chineseName})
                  </h4>
                  <p className="text-xs text-slate-300 italic">&ldquo;{h.judgment}&rdquo;</p>
                  <p className="text-[11px] text-slate-400">{h.image}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'runes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ELDER_FUTHARK_RUNES.filter(
                (r) =>
                  r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.traditionalMeaning.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-950/80 border border-amber-900/30 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-900/30 pb-2 mb-2">
                      <span className="text-2xl font-serif font-bold text-amber-300">{r.symbol}</span>
                      <span className="text-[10px] font-mono text-amber-400">{r.element}</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-amber-100">{r.name}</h4>
                    <p className="text-xs text-amber-300/80 font-medium">{r.traditionalMeaning}</p>
                    <p className="text-xs text-slate-300 mt-1">{r.uprightMeaning}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-amber-900/20">
                    Deity: {r.deity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
