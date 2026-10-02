import React, { useState } from 'react';
import { SavedReading, UserAccount } from '../types';
import { generatePrintableReport, exportReadingAsMarkdown } from '../utils/readingStore';
import { soundEngine } from '../utils/audio';
import {
  X,
  Search,
  Trash2,
  Download,
  BookOpen,
  Compass,
  Sparkles,
  Eye,
  SunMoon,
  Shield,
  Printer,
  FileText,
  Cloud,
  CheckCircle2
} from 'lucide-react';

interface ReadingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: SavedReading[];
  onDeleteReading: (id: string) => void;
  onClearAll: () => void;
  currentUser?: UserAccount | null;
}

export const ReadingHistoryModal: React.FC<ReadingHistoryModalProps> = ({
  isOpen,
  onClose,
  readings,
  onDeleteReading,
  onClearAll,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = readings.filter((r) => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportJournalJSON = () => {
    soundEngine.playSingingBowl(432);
    const jsonStr = JSON.stringify(readings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnioracle-journal-${Date.now()}.json`;
    a.click();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tarot': return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'iching': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'runes': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'scrying': return <Eye className="w-4 h-4 text-amber-400" />;
      case 'astrology': return <SunMoon className="w-4 h-4 text-amber-400" />;
      case 'sigil': return <Shield className="w-4 h-4 text-amber-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121526] border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-amber-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> Saved Divination Journal
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{readings.length} Recorded Readings</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Cloud className="w-3.5 h-3.5" />
                <span>
                  {currentUser ? `Account Cloud Sync (${currentUser.name})` : 'Local Seeker Storage'}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="p-4 bg-slate-950/60 border-b border-amber-900/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search journal queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-amber-900/40 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['all', 'tarot', 'horoscope', 'iching', 'runes', 'scrying', 'astrology', 'sigil'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportJournalJSON}
              disabled={readings.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 hover:bg-amber-900/50 disabled:opacity-40 transition-colors"
              title="Download Full Archive JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={onClearAll}
              disabled={readings.length === 0}
              className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/30 text-rose-400 text-xs flex items-center gap-1 hover:bg-rose-900/50 disabled:opacity-40 transition-colors"
              title="Clear Journal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Journal Entries List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <p>No divination records found matching your filter.</p>
              <p className="text-[11px] text-slate-600">
                Perform a Tarot, Rune, I-Ching, or Scrying reading and click &ldquo;Save to Journal&rdquo;.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-amber-900/30 rounded-xl p-4 transition-all hover:border-amber-500/40 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-950/60 border border-amber-500/30 rounded-lg">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-amber-100">{item.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{item.date}</span>
                      </div>
                    </div>

                    {/* Report Download & Delete Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => generatePrintableReport(item, currentUser)}
                        title="Download / Print Sacred Dossier"
                        className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden md:inline text-[10px] font-mono">Dossier</span>
                      </button>

                      <button
                        onClick={() => exportReadingAsMarkdown(item, currentUser)}
                        title="Export Markdown Report"
                        className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden md:inline text-[10px] font-mono">MD</span>
                      </button>

                      <button
                        onClick={() => onDeleteReading(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-900"
                        title="Delete reading"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-amber-300/80 font-medium">
                    Query: &ldquo;{item.question}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 italic line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Expand Full AI Synthesis */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-[11px] font-mono text-amber-400 hover:underline pt-1 block cursor-pointer"
                  >
                    {isExpanded ? '- Collapse Oracle Synthesis' : '+ Read Full Oracle Synthesis'}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-amber-900/30 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-4 rounded-lg space-y-2">
                      <div className="text-[10px] font-mono uppercase text-amber-400/80">
                        Hermetic AI Interpretation
                      </div>
                      <div>{item.fullReading}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
