import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  signInUser,
  signUpUser,
  resetUserPassword,
  OWNER_EMAIL
} from '../utils/auth';
import { soundEngine } from '../utils/audio';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  Crown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your seeker name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const newUser = signUpUser(name, email, password);
        soundEngine.playSingingBowl(528);
        onAuthSuccess(newUser);
        onClose();
      } else if (mode === 'signin') {
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter your account email.');
        }

        const user = signInUser(email, password);
        soundEngine.playSingingBowl(528);
        onAuthSuccess(user);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter your email to receive recovery instructions.');
        }

        resetUserPassword(email);
        setResetSent(true);
        setSuccessMessage('A sacred password reset link has been dispatched to your email address.');
        soundEngine.playSingingBowl(432);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    }
  };

  const quickSignInAs = (targetEmail: string, displayName: string) => {
    try {
      setError(null);
      const user = signInUser(targetEmail);
      soundEngine.playSingingBowl(528);
      onAuthSuccess(user);
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121526] border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Glow header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-200">
                {mode === 'signin' && 'Sign In to OmniOracle'}
                {mode === 'signup' && 'Create Your Seeker Account'}
                {mode === 'forgot' && 'Reset Sacred Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mode === 'signin' && 'Access your divination journal & cloud sync'}
                {mode === 'signup' && 'Begin your journey across the hidden realms'}
                {mode === 'forgot' && 'Restore access to your divination chamber'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Seeker Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cassandra of Thebes"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seeker@realm.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-amber-400/80 hover:text-amber-300 underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Code'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Switch Modes */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Fast Test Sign-In Shortcuts */}
        <div className="bg-slate-900/80 p-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Instant Demo & Creator Access:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickSignInAs(OWNER_EMAIL, 'Dawn Milazzo')}
              className="px-2.5 py-1.5 rounded bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900/60 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Sign In as Dawn</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80">👑 Keeper</span>
            </button>

            <button
              type="button"
              onClick={() => quickSignInAs('seeker@omnioracle.app', 'Free Seeker')}
              className="px-2.5 py-1.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-left"
            >
              <span className="truncate">Free Seeker Demo</span>
              <span className="text-[10px] font-mono text-slate-400">3/day</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
