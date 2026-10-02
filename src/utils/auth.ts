import { UserAccount, SubscriptionTier } from '../types';

export const OWNER_EMAIL = 'dawnmilazzo7@gmail.com';

const USERS_STORAGE_KEY = 'omni_oracle_users_db';
const CURRENT_USER_STORAGE_KEY = 'omni_oracle_current_user';

// Get today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Initial seed accounts if none exist
function getSeedUsers(): UserAccount[] {
  const today = getTodayDateString();
  return [
    {
      id: 'usr_owner_dawn',
      email: OWNER_EMAIL,
      name: 'Dawn Milazzo',
      birthDate: '1988-07-07',
      birthTime: '11:11',
      birthPlace: 'San Francisco, CA',
      zodiacSign: 'Cancer',
      tier: 'creator',
      subscriptionActive: true,
      subscriptionPlan: 'creator',
      subscriptionEnd: 'never',
      createdAt: '2026-01-01T00:00:00.000Z',
      readingsTodayCount: 0,
      lastReadingDate: today,
      paymentMethod: {
        brand: 'Oracle Seal',
        last4: '9999',
        expMonth: '12',
        expYear: '2099'
      }
    },
    {
      id: 'usr_demo_seeker',
      email: 'seeker@omnioracle.app',
      name: 'Mystic Seeker',
      birthDate: '1996-10-24',
      birthTime: '08:45',
      birthPlace: 'Austin, TX',
      zodiacSign: 'Scorpio',
      tier: 'free',
      subscriptionActive: false,
      createdAt: '2026-03-01T00:00:00.000Z',
      readingsTodayCount: 1,
      lastReadingDate: today
    },
    {
      id: 'usr_demo_premium',
      email: 'premium@omnioracle.app',
      name: 'Cassandra Star',
      birthDate: '1994-03-25',
      birthTime: '19:30',
      birthPlace: 'London, UK',
      zodiacSign: 'Aries',
      tier: 'premium',
      subscriptionActive: true,
      subscriptionPlan: 'monthly',
      subscriptionEnd: '2026-11-02T00:00:00.000Z',
      createdAt: '2026-02-15T00:00:00.000Z',
      readingsTodayCount: 0,
      lastReadingDate: today,
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expMonth: '08',
        expYear: '2028'
      }
    }
  ];
}

// Retrieve all stored users
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const seeded = getSeedUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    // Ensure owner account always exists with creator status
    if (!parsed.some(u => u.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
      parsed.unshift(getSeedUsers()[0]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return getSeedUsers();
  }
}

// Save users list
export function saveAllUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database', e);
  }
}

// Get the current logged in user
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) {
      // Default to guest / not logged in
      return null;
    }
    const user: UserAccount = JSON.parse(raw);
    const today = getTodayDateString();

    // Reset daily reading count if on a new day
    if (user.lastReadingDate !== today) {
      user.readingsTodayCount = 0;
      user.lastReadingDate = today;
      setCurrentUser(user);
    }
    return user;
  } catch (e) {
    return null;
  }
}

// Set current user
export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      // Also update in all users list
      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        users[idx] = user;
        saveAllUsers(users);
      }
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

// Check if user has premium access (including permanent Owner / Creator bypass)
export function hasPremiumAccess(user: UserAccount | null): boolean {
  if (!user) return false;

  // Lifetime Creator Bypass
  if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase() || user.tier === 'creator') {
    return true;
  }

  // Active subscription for Premium or Founder
  if (user.subscriptionActive && (user.tier === 'premium' || user.tier === 'founder')) {
    return true;
  }

  return false;
}

// Check if user is the Owner/Creator
export function isOwner(user: UserAccount | null): boolean {
  if (!user) return false;
  return user.email.toLowerCase() === OWNER_EMAIL.toLowerCase() || user.tier === 'creator';
}

// Get user badge string
export function getUserBadge(user: UserAccount | null): { label: string; color: string; isCreator: boolean } {
  if (!user) {
    return { label: 'Guest Seeker', color: 'text-slate-400 bg-slate-800/80 border-slate-700', isCreator: false };
  }
  if (isOwner(user)) {
    return { label: 'Oracle Keeper 👑', color: 'text-amber-300 bg-amber-950/80 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]', isCreator: true };
  }
  if (user.tier === 'founder') {
    return { label: '🌟 Founder Tier', color: 'text-amber-200 bg-amber-900/60 border-amber-400/60', isCreator: false };
  }
  if (user.tier === 'premium' && user.subscriptionActive) {
    return { label: '✨ Premium', color: 'text-purple-300 bg-purple-950/70 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]', isCreator: false };
  }
  return { label: 'Free Tier', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60', isCreator: false };
}

// Check reading quota allowance
export function checkReadingAllowance(user: UserAccount | null): {
  allowed: boolean;
  remainingToday: number;
  isUnlimited: boolean;
  message?: string;
} {
  if (hasPremiumAccess(user)) {
    return { allowed: true, remainingToday: Infinity, isUnlimited: true };
  }

  const today = getTodayDateString();
  const currentCount = user?.lastReadingDate === today ? (user.readingsTodayCount || 0) : 0;
  const maxFree = 3;
  const remaining = Math.max(0, maxFree - currentCount);

  if (remaining <= 0) {
    return {
      allowed: false,
      remainingToday: 0,
      isUnlimited: false,
      message: 'You have completed your 3 free readings for today. Unlock unlimited readings with OmniOracle Premium!'
    };
  }

  return {
    allowed: true,
    remainingToday: remaining,
    isUnlimited: false
  };
}

// Increment reading count for current user
export function recordReadingPerformed(user: UserAccount | null): UserAccount | null {
  if (!user) return null;

  const today = getTodayDateString();
  const currentCount = user.lastReadingDate === today ? (user.readingsTodayCount || 0) : 0;
  
  const updatedUser: UserAccount = {
    ...user,
    lastReadingDate: today,
    readingsTodayCount: currentCount + 1
  };

  setCurrentUser(updatedUser);
  return updatedUser;
}

// Sign up
export function signUpUser(name: string, email: string, passwordHash?: string): UserAccount {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const isCreatorEmail = normalizedEmail === OWNER_EMAIL.toLowerCase();
  const today = getTodayDateString();

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: name.trim() || 'Divination Seeker',
    passwordHash: passwordHash || 'mock_hash',
    tier: isCreatorEmail ? 'creator' : 'free',
    subscriptionActive: isCreatorEmail,
    subscriptionPlan: isCreatorEmail ? 'creator' : undefined,
    subscriptionEnd: isCreatorEmail ? 'never' : undefined,
    createdAt: new Date().toISOString(),
    readingsTodayCount: 0,
    lastReadingDate: today
  };

  users.push(newUser);
  saveAllUsers(users);
  setCurrentUser(newUser);
  return newUser;
}

// Sign in
export function signInUser(email: string, password?: string): UserAccount {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  let user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  // If signing in as the owner email for the first time, auto-provision
  if (!user && normalizedEmail === OWNER_EMAIL.toLowerCase()) {
    user = signUpUser('Dawn Milazzo (Oracle Keeper)', OWNER_EMAIL);
    return user;
  }

  if (!user) {
    throw new Error('No account found with this email. Please check your spelling or sign up.');
  }

  setCurrentUser(user);
  return user;
}

// Sign out
export function signOutUser(): void {
  setCurrentUser(null);
}

// Forgot password reset
export function resetUserPassword(email: string, newPassword?: string): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    throw new Error('No account found with that email address.');
  }
  user.passwordHash = 'updated_password_hash';
  saveAllUsers(users);
  return true;
}

// Update subscription
export function applySubscription(
  userId: string,
  tier: SubscriptionTier,
  plan: 'monthly' | 'lifetime',
  paymentMethod?: { brand: string; last4: string; expMonth: string; expYear: string }
): UserAccount {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    throw new Error('User not found.');
  }

  const user = users[idx];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  const updated: UserAccount = {
    ...user,
    tier,
    subscriptionActive: true,
    subscriptionPlan: plan,
    subscriptionEnd: plan === 'lifetime' ? 'never' : nextMonth.toISOString(),
    paymentMethod: paymentMethod || {
      brand: 'Visa',
      last4: '4242',
      expMonth: '12',
      expYear: '2028'
    }
  };

  users[idx] = updated;
  saveAllUsers(users);
  setCurrentUser(updated);
  return updated;
}

// Cancel subscription
export function cancelUserSubscription(userId: string): UserAccount {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    throw new Error('User not found.');
  }

  const user = users[idx];
  if (user.tier === 'creator') {
    return user; // Owner cannot be cancelled
  }

  const updated: UserAccount = {
    ...user,
    tier: 'free',
    subscriptionActive: false,
    subscriptionPlan: undefined,
    subscriptionEnd: undefined
  };

  users[idx] = updated;
  saveAllUsers(users);
  setCurrentUser(updated);
  return updated;
}

// Update user profile fields (birth date, birth time, birth place, etc.)
export function updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    throw new Error('User not found.');
  }

  const user = users[idx];
  const updated: UserAccount = {
    ...user,
    ...updates,
    id: user.id,
    email: user.email
  };

  users[idx] = updated;
  saveAllUsers(users);
  setCurrentUser(updated);
  return updated;
}
