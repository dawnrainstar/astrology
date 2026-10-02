import React, { useState, useEffect } from 'react';
import { DivinationTab, SavedReading, UserAccount } from './types';
import { getCurrentUser, signOutUser, recordReadingPerformed } from './utils/auth';
import { loadUserReadings, saveUserReadings } from './utils/readingStore';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { TarotSection } from './components/TarotSection';
import { IChingSection } from './components/IChingSection';
import { RuneSection } from './components/RuneSection';
import { ScryingMirrorSection } from './components/ScryingMirrorSection';
import { AstroNumSection } from './components/AstroNumSection';
import { SigilSection } from './components/SigilSection';
import { ReadingHistoryModal } from './components/ReadingHistoryModal';
import { CardModal } from './components/CardModal';
import { AuthModal } from './components/AuthModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PremiumGateModal } from './components/PremiumGateModal';
import { Sparkles, Crown, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<DivinationTab>('home');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  // Authentication & Subscription Modals
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState<boolean>(false);
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);
  const [gateFeature, setGateFeature] = useState<{ name: string; reason: 'limit' | 'feature' }>({
    name: 'AI Master Divination',
    reason: 'feature'
  });

  // Account-specific Saved Reading Journal
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => {
    return loadUserReadings(currentUser?.id);
  });

  // Reload readings when currentUser changes (e.g. logging into account)
  useEffect(() => {
    const readings = loadUserReadings(currentUser?.id);
    setSavedReadings(readings);
  }, [currentUser?.id]);

  // Save readings when updated
  useEffect(() => {
    saveUserReadings(savedReadings, currentUser?.id);
  }, [savedReadings, currentUser?.id]);

  const handleSaveReading = (newReading: SavedReading) => {
    const readingWithUser: SavedReading = {
      ...newReading,
      userId: currentUser?.id,
      userEmail: currentUser?.email
    };
    setSavedReadings((prev) => [readingWithUser, ...prev]);
  };

  const handleDeleteReading = (id: string) => {
    setSavedReadings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllReadings = () => {
    if (confirm('Are you sure you want to clear your saved divination journal entries?')) {
      setSavedReadings([]);
    }
  };

  const handleReadingPerformed = () => {
    if (currentUser) {
      const updated = recordReadingPerformed(currentUser);
      if (updated) {
        setCurrentUser(updated);
      }
    }
  };

  const handleRequireUpgrade = (featureName: string, reason: 'limit' | 'feature' = 'feature') => {
    setGateFeature({ name: featureName, reason });
    setIsGateOpen(true);
  };

  const handleSignOut = () => {
    signOutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0d17] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Starlight & Nebula Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />

      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          isAmbientPlaying={isAmbientPlaying}
          setIsAmbientPlaying={setIsAmbientPlaying}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Main Workspace Container */}
        <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {activeTab === 'home' && (
            <LandingHero
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'tarot' && (
            <TarotSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}

          {activeTab === 'iching' && (
            <IChingSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}

          {activeTab === 'runes' && (
            <RuneSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}

          {activeTab === 'scrying' && (
            <ScryingMirrorSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}

          {activeTab === 'astrology' && (
            <AstroNumSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}

          {activeTab === 'sigil' && (
            <SigilSection
              onSaveReading={handleSaveReading}
              currentUser={currentUser}
              onRequireUpgrade={handleRequireUpgrade}
              onReadingPerformed={handleReadingPerformed}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-900/20 bg-[#090b14]/80 py-6 text-center text-xs text-slate-500 relative z-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold text-amber-200/90">OMNIORACLE</span>
            <span className="text-slate-600">| Hermetic Divination System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <button
              onClick={() => setIsSubscribeOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              Subscription Plans ($10/mo)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="hover:text-amber-300 transition-colors"
            >
              Grimoire Reference Library
            </button>
            <span>•</span>
            <button
              onClick={() => (currentUser ? setIsProfileOpen(true) : setIsAuthOpen(true))}
              className="hover:text-amber-300 transition-colors"
            >
              {currentUser ? 'My Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ReadingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        readings={savedReadings}
        onDeleteReading={handleDeleteReading}
        onClearAll={handleClearAllReadings}
        currentUser={currentUser}
      />

      <CardModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {currentUser && (
        <AccountProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(updated) => setCurrentUser(updated)}
          onSignOut={handleSignOut}
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      <SubscriptionModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        currentUser={currentUser}
        onSubscriptionUpdated={(updated) => setCurrentUser(updated)}
        onPromptAuth={() => {
          setIsSubscribeOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <PremiumGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        featureName={gateFeature.name}
        reason={gateFeature.reason}
      />
    </div>
  );
}
