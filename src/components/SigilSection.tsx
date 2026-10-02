import React, { useState, useEffect, useRef } from 'react';
import { cleanseIntention, generateSigilPoints, SigilPoint } from '../utils/sigilEngine';
import { SavedReading, SigilConfig, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess } from '../utils/auth';
import { Shield, Sparkles, Download, Play, Check, BookmarkPlus, Palette, Lock, Crown } from 'lucide-react';

interface SigilSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const SigilSection: React.FC<SigilSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const [intention, setIntention] = useState('I AM PROTECTED AND ABUNDANT');
  const [sigilType, setSigilType] = useState<SigilConfig['sigilType']>('kamea');
  const [glowColor, setGlowColor] = useState('#D4AF37'); // Gold default
  const [borderStyle, setBorderStyle] = useState<SigilConfig['borderStyle']>('double-circle');
  const [isMeditating, setIsMeditating] = useState(false);

  const [cleansed, setCleansed] = useState<{ cleansedLetters: string; numericCode: string }>({
    cleansedLetters: 'MPRTCDBN',
    numericCode: '47923425'
  });

  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recalculate cleansed root upon intention change
  useEffect(() => {
    const res = cleanseIntention(intention);
    setCleansed(res);
    setAiGuidance(null);
    setIsSaved(false);
  }, [intention]);

  // Render Sigil on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const radius = size * 0.42;

    // Draw Outer Sacred Circle / Border
    ctx.strokeStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (borderStyle === 'double-circle') {
      ctx.beginPath();
      ctx.arc(center, center, radius - 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (borderStyle === 'octagon') {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
        const x = center + (radius - 4) * Math.cos(a);
        const y = center + (radius - 4) * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Generate Points & Connect Path
    const points: SigilPoint[] = generateSigilPoints(cleansed.cleansedLetters, sigilType, size);

    if (points.length > 0) {
      ctx.lineWidth = 3;

      // Draw path line by line
      ctx.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.stroke();

      // Start Circle at first point
      const startPt = points[0];
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // End Crossbar at last point
      const endPt = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(endPt.x - 8, endPt.y);
      ctx.lineTo(endPt.x + 8, endPt.y);
      ctx.moveTo(endPt.x, endPt.y - 8);
      ctx.lineTo(endPt.x, endPt.y + 8);
      ctx.stroke();
    }
  }, [cleansed, sigilType, glowColor, borderStyle]);

  // Download Sigil image
  const downloadSigil = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacred-sigil-${Date.now()}.png`;
    a.click();
    soundEngine.playSingingBowl(528);
  };

  const generateAiGuidance = async () => {
    if (!isPremium) {
      onRequireUpgrade('Sacred Sigil Consecration Rituals');
      return;
    }

    setIsLoadingAi(true);
    soundEngine.playSingingBowl(432);
    onReadingPerformed();

    try {
      const res = await fetch('/api/divination/sigil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawIntention: intention,
          cleansedLetters: cleansed.cleansedLetters,
          numericCode: cleansed.numericCode,
          sigilType
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiGuidance(`Error: ${data.error}`);
      } else {
        setAiGuidance(data.guidance);
      }
    } catch (err) {
      setAiGuidance('Error generating sigil activation guide.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSave = () => {
    const item: SavedReading = {
      id: `sigil-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'sigil',
      title: 'Sacred Sigil Manifestation',
      question: intention,
      summary: `Root Letters: ${cleansed.cleansedLetters} | Geometry: ${sigilType.toUpperCase()}`,
      fullReading: aiGuidance || 'Sigil forged and consecrated.'
    };

    onSaveReading(item);
    setIsSaved(true);
    soundEngine.playSingingBowl(639);
  };

  return (
    <div className="space-y-8">
      {/* Premium Exclusive Banner if Free */}
      {!isPremium && (
        <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-950/80 via-[#16122d] to-amber-950/80 p-5 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-200 text-sm">
                OmniOracle Premium Exclusive Portal
              </h3>
              <p className="text-xs text-slate-300">
                The Sacred Sigil Forge and AI Consecration Ritual requires an active $10/month subscription or Creator pass.
              </p>
            </div>
          </div>

          <button
            onClick={() => onRequireUpgrade('Sacred Sigil Forge')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Unlock Premium • $10/mo</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#121526]/80 backdrop-blur border border-amber-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" /> Kamea & Rose Wheel Letter Elimination Engine
          </span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-amber-100 mb-6">
          Sacred Sigil Generation & Consecration
        </h2>

        {/* Intention Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-medium text-amber-200/80">
            Enter your statement of intention or desire:
          </label>
          <input
            type="text"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-3 text-sm font-semibold text-amber-100 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Cleansed Output Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30 flex items-center justify-between">
            <span className="text-xs text-slate-400">Cleansed Consonant Staves:</span>
            <span className="text-sm font-mono font-bold text-amber-300 tracking-widest bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/30">
              {cleansed.cleansedLetters || 'NONE'}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/30 flex items-center justify-between">
            <span className="text-xs text-slate-400">Numerical Matrix Glyph:</span>
            <span className="text-sm font-mono font-bold text-amber-300 tracking-widest bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/30">
              {cleansed.numericCode || '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sigil Canvas & Geometry Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Canvas Display */}
        <div className="bg-gradient-to-b from-[#18112e] via-[#0e0c1f] to-[#1e153b] border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl relative">
          <canvas ref={canvasRef} className="max-w-full aspect-square my-2 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={downloadSigil}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download PNG Artifact
            </button>

            <button
              onClick={() => {
                setIsMeditating(true);
                soundEngine.startAmbient();
              }}
              className="px-4 py-2 bg-slate-900 border border-amber-500/40 text-amber-200 hover:bg-amber-950/50 text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 text-amber-400" /> Charge & Meditate
            </button>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-serif font-bold text-amber-100 border-b border-amber-900/40 pb-2">
            Sacred Geometry Parameters
          </h3>

          {/* Geometry Engine Choice */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-300 block">
              Sigil Geometry Method:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'kamea', label: 'Saturn Kamea Grid' },
                { id: 'rose', label: "Witch's Rose Wheel" },
                { id: 'geometric', label: 'Harmonic Circular' },
                { id: 'bindrune', label: 'Angular Bindrune Staves' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSigilType(m.id as any);
                    soundEngine.playSingingBowl(400);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                    sigilType === m.id
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glow Color Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-300 block flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Consecration Flame Color:
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Gold', color: '#D4AF37' },
                { name: 'Emerald', color: '#10B981' },
                { name: 'Violet', color: '#8B5CF6' },
                { name: 'Crimson', color: '#EF4444' },
                { name: 'Silver', color: '#E2E8F0' }
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setGlowColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    glowColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Border Ring Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-300 block">
              Outer Ring Boundary:
            </label>
            <div className="flex gap-2">
              {[
                { id: 'circle', label: 'Single Circle' },
                { id: 'double-circle', label: 'Double Circle' },
                { id: 'octagon', label: 'Sacred Octagon' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBorderStyle(b.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    borderStyle === b.id
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Consecration Guidance Action */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={generateAiGuidance}
              disabled={isLoadingAi}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
              {isLoadingAi ? 'GENERATING RITUAL GUIDE...' : 'GENERATE CONSECRATION RITUAL'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`w-full py-2.5 rounded-xl text-xs font-mono border transition-all flex items-center justify-center gap-2 ${
                isSaved
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-amber-500/30 text-amber-200 hover:bg-amber-950/50'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> SIGIL SAVED
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-amber-400" /> SAVE SIGIL TO JOURNAL
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Guidance Text */}
      {aiGuidance && (
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block border-b border-amber-900/40 pb-2 mb-4">
            Sigil Activation & Ritual Consecration Guide
          </span>
          <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {aiGuidance}
          </div>
        </div>
      )}

      {/* Fullscreen Charge & Meditate Overlay Modal */}
      {isMeditating && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <h3 className="text-xl font-serif font-bold text-amber-200">
              Focus & Embed Sigil into Subconscious
            </h3>
            <p className="text-xs text-slate-400">
              Gaze softly at the center starting point. Breathe deeply in 432Hz harmonic resonance.
            </p>

            <div className="w-64 h-64 mx-auto flex items-center justify-center animate-pulse">
              <canvas ref={canvasRef} className="w-full h-full drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" />
            </div>

            <button
              onClick={() => setIsMeditating(false)}
              className="px-6 py-2.5 bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              COMPLETE MEDITATION
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
