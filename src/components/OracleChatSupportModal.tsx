import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, SavedReading } from '../types';
import { soundEngine } from '../utils/audio';
import { isOwner, hasPremiumAccess } from '../utils/auth';
import {
  X,
  Sparkles,
  Send,
  Phone,
  MessageSquare,
  HelpCircle,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  User,
  Edit2,
  Check,
  AlertCircle,
  Lock,
  Crown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface OracleChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  recentReadings?: SavedReading[];
  onRefundGranted?: () => void;
  onOpenSubscribe?: () => void;
}

const DEFAULT_SUPPORT_PHONE = '+1 (555) 792-7478';

export const OracleChatSupportModal: React.FC<OracleChatSupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  recentReadings = [],
  onRefundGranted,
  onOpenSubscribe
}) => {
  const isPaidSubscriber = hasPremiumAccess(currentUser);
  const [supportPhone, setSupportPhone] = useState<string>(() => {
    return localStorage.getItem('omni_oracle_support_phone') || DEFAULT_SUPPORT_PHONE;
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(supportPhone);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Greetings, seeker. I am your **OmniOracle AI Divination Scholar & Support Guide**.\n\n🔮 **I am here to answer ALL your divination & reading questions**:\n- 🃏 **Tarot**: Card meanings, reversals, spreads, and archetypes\n- ᚠ **Elder Runes**: Stave wisdom, aettir, and merkstave polarities\n- ☯ **I-Ching**: Hexagrams, mutating lines, and Taoist reflections\n- 🌌 **Astrology & Daily Horoscopes**: Natal charts and daily cosmic transits\n- 🪞 **Scrying & Sigils**: Prophetic mirror visions and intention consecration\n\n💳 **Billing & Refunds**:\n- All refunds are **100% unconditionally granted upon request**.\n- 📞 **Subscriber Phone Support**: Active paid subscribers can call creator Dawn Milazzo for **billing and refund questions ONLY**. Dawn does not answer divination questions by phone—I handle all divination interpretations right here!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSavePhone = () => {
    const trimmed = tempPhone.trim();
    if (trimmed) {
      setSupportPhone(trimmed);
      localStorage.setItem('omni_oracle_support_phone', trimmed);
    }
    setIsEditingPhone(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    soundEngine.playSingingBowl(350);
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // If message is asking for a refund, auto trigger refund approval notification
    if (text.toLowerCase().includes('refund') || text.toLowerCase().includes('money back')) {
      setRefundStatus('Refund Approved & Processed');
      if (onRefundGranted) onRefundGranted();
    }

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          supportPhone,
          userContext: {
            name: currentUser?.name || 'Seeker',
            email: currentUser?.email || 'Guest',
            tier: currentUser?.tier || 'free',
            isPaidSubscriber,
            recentReadings: recentReadings.slice(0, 5).map((r) => ({
              type: r.type,
              title: r.title,
              question: r.question,
              summary: r.summary,
              date: r.date
            }))
          }
        })
      });

      const data = await res.json();
      soundEngine.playSingingBowl(528);

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.error || 'The Oracle is contemplative. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an ethereal disruption. You can reach the creator directly for phone support at **${supportPhone}** or email **dawnmilazzo7@gmail.com**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantRefundClick = () => {
    setRefundStatus('Refund 100% Granted');
    if (onRefundGranted) onRefundGranted();
    handleSendMessage('I would like to request a refund for my subscription.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden">
      <div className="bg-[#101322] border border-amber-500/40 rounded-3xl w-full max-w-2xl h-[90vh] max-h-[750px] shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col text-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-400" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-amber-900/30 flex items-center justify-between bg-[#121528]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-amber-200">
                  OmniOracle AI Guide & Support
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Divination wisdom, readings guidance, billing, refunds & phone calls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Direct Phone & Refund Guarantee Bar */}
        <div className="bg-[#161a32] px-5 py-3.5 border-b border-amber-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/src/assets/images/dawn_milazzo_photo_1790974327929.jpg"
                alt="Dawn Milazzo - Customer Service & App Creator"
                className="w-13 h-13 rounded-xl object-cover border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-black ${
                isPaidSubscriber ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`} title={isPaidSubscriber ? 'VIP Subscriber Phone Active' : 'Subscriber Exclusive'}>
                {isPaidSubscriber ? '✓' : <Lock className="w-2.5 h-2.5" />}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-amber-200 text-sm">Dawn Milazzo</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-300 font-semibold shadow-sm">
                  Creator & Billing Lead
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300">
                  100% Refunds Granted
                </span>
              </div>

              {isPaidSubscriber ? (
                <div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-slate-300 font-medium text-xs flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subscriber Billing Line:</span>
                    </span>
                    {isEditingPhone ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          placeholder="+1 (555) 792-7478"
                          className="px-2 py-0.5 bg-slate-900 border border-amber-400 rounded text-amber-300 font-mono text-xs focus:outline-none"
                        />
                        <button
                          onClick={handleSavePhone}
                          className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <a
                        href={`tel:${supportPhone}`}
                        className="font-mono text-amber-300 font-bold hover:underline flex items-center gap-1 text-xs bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded"
                      >
                        <span>{supportPhone}</span>
                      </a>
                    )}
                    {!isEditingPhone && isOwner(currentUser) && (
                      <button
                        onClick={() => {
                          setTempPhone(supportPhone);
                          setIsEditingPhone(true);
                        }}
                        title="Edit support phone number"
                        className="text-slate-400 hover:text-amber-300 p-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-300/90 font-mono mt-0.5">
                    ⚠️ <strong>Phone rule:</strong> Dawn answers <u>billing & refunds only</u> by phone. Divination questions are answered by the AI below.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-slate-400 font-medium text-xs flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Creator Phone Line:</span>
                    </span>
                    <span className="font-mono text-slate-500 text-xs">
                      +1 (555) •••-•••• (Paid Subscribers Only)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Phone calling is exclusive to paid subscribers for billing questions. <strong>Ask divination questions to our AI below!</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {isPaidSubscriber ? (
              <a
                href={`tel:${supportPhone}`}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
                <span>Call for Billing</span>
              </a>
            ) : (
              onOpenSubscribe && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscribe();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Subscribe to Call ($10/mo)</span>
                </button>
              )
            )}

            <button
              onClick={handleInstantRefundClick}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
            >
              <DollarSign className="w-3 h-3" />
              <span>100% Refund</span>
            </button>
          </div>
        </div>

        {/* Dedicated Divination AI Scholar Notice */}
        <div className="bg-[#101324] px-5 py-2 border-b border-amber-900/20 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-200 font-semibold">🔮 AI Divination Scholar Active:</span>
            <span className="text-slate-400">Ask any questions about Tarot cards, Runes, I-Ching, or Horoscopes below.</span>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded hidden sm:inline">
            Free 24/7 Reading Analysis
          </span>
        </div>

        {refundStatus && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-5 py-2 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Policy Activated:</strong> Refunds are 100% granted. Credited back to PayPal or Credit Card in 3-5 business days.</span>
            </div>
            <button
              onClick={() => setRefundStatus(null)}
              className="text-emerald-400 hover:text-white text-xs ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-medium rounded-tr-none shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'bg-slate-900/90 border border-amber-900/40 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div className="prose prose-invert prose-amber max-w-none text-xs">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[9px] font-mono text-right ${
                      isUser ? 'text-amber-950/70' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/80 border border-amber-900/30 rounded-2xl px-4 py-3 text-xs text-amber-300 font-mono flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>The Oracle AI is consulting the celestial spheres...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2 bg-[#121528] border-t border-amber-900/20 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 shrink-0 uppercase">
            Ask:
          </span>
          <button
            onClick={() => handleSendMessage('Can you explain the meaning of my latest divination reading?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-400 text-[11px] text-slate-300 hover:text-amber-200 whitespace-nowrap transition-colors cursor-pointer"
          >
            🔮 Explain my last reading
          </button>
          <button
            onClick={() => handleSendMessage('I would like to request a full refund for my subscription.')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 text-[11px] text-slate-300 hover:text-emerald-200 whitespace-nowrap transition-colors cursor-pointer"
          >
            💰 Refund policy & request
          </button>
          <button
            onClick={() => handleSendMessage(`What is the direct phone number to call the creator for app support?`)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-400 text-[11px] text-slate-300 hover:text-amber-200 whitespace-nowrap transition-colors cursor-pointer"
          >
            📞 Phone support number
          </button>
          <button
            onClick={() => handleSendMessage('How does the $10/month subscription work and what payment methods are accepted?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-400 text-[11px] text-slate-300 hover:text-purple-200 whitespace-nowrap transition-colors cursor-pointer"
          >
            💳 Billing & PayPal info
          </button>
          <button
            onClick={() => handleSendMessage('What is the difference between Upright and Reversed Tarot cards?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-400 text-[11px] text-slate-300 hover:text-amber-200 whitespace-nowrap transition-colors cursor-pointer"
          >
            🃏 Upright vs Reversed Tarot
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-[#0e111e] border-t border-amber-900/30 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about readings, cards, runes, billing, refunds, or support..."
            disabled={isLoading}
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
