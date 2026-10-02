import React, { useRef, useEffect, useState } from 'react';
import { SavedReading, UserAccount } from '../types';
import { soundEngine } from '../utils/audio';
import { hasPremiumAccess } from '../utils/auth';
import { Eye, Sparkles, Camera, RefreshCw, BookmarkPlus, Check, Flame, Lock, Crown } from 'lucide-react';

interface ScryingMirrorSectionProps {
  onSaveReading: (reading: SavedReading) => void;
  currentUser: UserAccount | null;
  onRequireUpgrade: (featureName: string, reason?: 'limit' | 'feature') => void;
  onReadingPerformed: () => void;
}

export const ScryingMirrorSection: React.FC<ScryingMirrorSectionProps> = ({
  onSaveReading,
  currentUser,
  onRequireUpgrade,
  onReadingPerformed
}) => {
  const isPremium = hasPremiumAccess(currentUser);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [intention, setIntention] = useState('');
  const [focalState, setFocalState] = useState('Swirling Ethereal Mist');
  const [useWebcam, setUseWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScrying, setIsScrying] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Canvas Swirling Smoke Particle Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particle pool for dark obsidian smoke / silver liquid
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 40 + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.2 + 0.05
      });
    }

    const render = () => {
      // Dark obsidian reflection background
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle silver radial mirror ring
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.1,
        width / 2, height / 2, width * 0.45
      );
      gradient.addColorStop(0, 'rgba(180, 160, 220, 0.08)');
      gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.04)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.44, 0, Math.PI * 2);
      ctx.fill();

      // Render particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = `rgba(180, 170, 220, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle Webcam Toggle
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseWebcam(true);
      soundEngine.playSingingBowl(380);
    } catch (e) {
      alert('Camera access unavailable or declined.');
    }
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      soundEngine.playSingingBowl(528);
    }
  };

  const scryMirror = async () => {
    if (!isPremium) {
      onRequireUpgrade('AI Obsidian Scrying Mirror');
      return;
    }

    setIsScrying(true);
    soundEngine.playSingingBowl(432);
    onReadingPerformed();

    try {
      const res = await fetch('/api/divination/scrying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intention,
          focalPoint: focalState,
          imageBase64: capturedImage
        })
      });

      const data = await res.json();
      if (data.error) {
        setAiReading(`Error: ${data.error}`);
      } else {
        setAiReading(data.reading);
      }
    } catch (err) {
      setAiReading('The obsidian mirror mist remains silent. Check connection.');
    } finally {
      setIsScrying(false);
    }
  };

  const handleSave = () => {
    if (!aiReading) return;
    const item: SavedReading = {
      id: `scrying-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: new Date().toLocaleString(),
      type: 'scrying',
      title: 'Obsidian Scrying Mirror Vision',
      question: intention || 'Unseen Shadows & Prophetic Vision',
      summary: `Scrying Focal: ${focalState}`,
      fullReading: aiReading
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
                The AI Obsidian Scrying Mirror requires an active $10/month subscription or Creator pass.
              </p>
            </div>
          </div>

          <button
            onClick={() => onRequireUpgrade('AI Obsidian Scrying Mirror')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Unlock Premium • $10/mo</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#121526]/80 backdrop-blur border border-amber-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30 mb-2">
              <Eye className="w-3.5 h-3.5 animate-pulse" /> Black Obsidian & Liquid Silver Scrying Lens
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100">
              AI Obsidian Scrying Mirror
            </h2>
          </div>

          <div className="flex gap-2">
            {!useWebcam ? (
              <button
                onClick={startWebcam}
                className="px-4 py-2 bg-slate-900 border border-amber-500/40 text-amber-200 hover:bg-amber-950/50 text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-amber-400" /> Enable Camera Mirror
              </button>
            ) : (
              <button
                onClick={captureWebcamSnapshot}
                className="px-4 py-2 bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all"
              >
                Capture Vision Reflection
              </button>
            )}
          </div>
        </div>

        {/* Intention Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-amber-200/80">
            Set your gaze and intention before the mirror:
          </label>
          <input
            type="text"
            placeholder="e.g., Reveal the hidden truth behind my current direction..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            className="w-full bg-slate-950/80 border border-amber-900/40 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Scrying Canvas / Camera Mirror Frame */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Mirror Frame Display */}
        <div className="bg-gradient-to-b from-[#18112e] via-[#0e0c1f] to-[#1e153b] border-4 border-amber-500/60 rounded-full aspect-square max-w-md mx-auto w-full p-4 shadow-[0_0_40px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Inner Golden Ring */}
          <div className="absolute inset-2 rounded-full border border-amber-400/30 pointer-events-none" />

          {useWebcam && !capturedImage ? (
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-full filter contrast-125 brightness-75 sepia-50"
                autoPlay
                playsInline
                muted
              />
            </div>
          ) : capturedImage ? (
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img
                src={capturedImage}
                alt="Scried Reflection"
                className="w-full h-full object-cover filter contrast-125 sepia-50"
              />
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute bottom-4 left-0 right-0 mx-auto w-max px-3 py-1 bg-slate-950/80 text-amber-300 border border-amber-500/40 text-[11px] rounded-full"
              >
                Clear Image
              </button>
            </div>
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-full cursor-pointer"
                onClick={() => {
                  soundEngine.playSingingBowl(528);
                  setFocalState('Rippling Water & Silver Flares');
                }}
              />
              <div className="absolute bottom-6 text-[10px] font-mono text-amber-300/80 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-900/40 pointer-events-none">
                Tap Canvas to Stir the Mists
              </div>
            </div>
          )}
        </div>

        {/* Scrying Guidance & Action */}
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-amber-100 mb-2">
              Channel the Obsidian Oracle
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gaze into the dark mirror, allowing surface thoughts to dissolve. The AI Scrying Mirror interprets subconscious reflections, archetypal mists, and intuitive patterns.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/30 text-xs space-y-2">
            <span className="font-semibold text-amber-300 block">
              Focal Energy Movement:
            </span>
            <p className="text-slate-400 italic">{focalState}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={scryMirror}
              disabled={isScrying}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Eye className={`w-4 h-4 ${isScrying ? 'animate-spin' : ''}`} />
              {isScrying ? 'SCRYING OBSIDIAN DEPTHS...' : 'SCRY THE MIRROR'}
            </button>

            {aiReading && (
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full py-3 rounded-xl text-xs font-mono tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-amber-500/30 text-amber-200 hover:bg-amber-950/50'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> VISION SAVED
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-amber-400" /> SAVE VISION TO JOURNAL
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Reading Display */}
      {aiReading && (
        <div className="bg-[#121526] border border-amber-900/40 rounded-2xl p-6">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block border-b border-amber-900/40 pb-2 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Prophetic Vision Unveiled
          </span>
          <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {aiReading}
          </div>
        </div>
      )}
    </div>
  );
};
