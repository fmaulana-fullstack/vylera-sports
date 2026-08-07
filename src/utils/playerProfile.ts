import type { PlayerProfile } from '../types/game';

const STORAGE_KEY = 'vylera_player_profile';

export const PRESET_AVATARS = [
  { id: 'av-1', name: 'Mba Aytakin', url: new URL('../assets/mba aytakin .png', import.meta.url).href },
  { id: 'av-2', name: 'Pak Putra', url: new URL('../assets/pak putra .png', import.meta.url).href },
  { id: 'av-3', name: 'Pak Mechev', url: new URL('../assets/pak mechev.png', import.meta.url).href },
  { id: 'av-4', name: 'Cyber Ace', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberAce' },
  { id: 'av-5', name: 'Neon Champ', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonChamp' },
  { id: 'av-6', name: 'Tennis Queen', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TennisQueen' },
];

export const COOL_NAME_PREFIXES = ['Cyber', 'Neon', 'Pro', 'Super', 'Hyper', 'Master', 'Ace', 'Vylera'];
export const COOL_NAME_SUFFIXES = ['Player', 'Smash', 'Striker', 'Champ', 'Legend', 'Ninja', 'Rider'];

export function generateRandomName(): string {
  const pref = COOL_NAME_PREFIXES[Math.floor(Math.random() * COOL_NAME_PREFIXES.length)];
  const suff = COOL_NAME_SUFFIXES[Math.floor(Math.random() * COOL_NAME_SUFFIXES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${pref} ${suff} #${num}`;
}

export function getStoredUser(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse profile from localStorage', e);
  }
  return null;
}

export function saveUser(user: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove profile', e);
  }
}

export function createInstantProfile(nameInput?: string, avatarUrl?: string): PlayerProfile {
  const finalName = nameInput?.trim() || generateRandomName();
  const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`;

  return {
    id: `player-${Date.now()}`,
    name: finalName,
    avatar: finalAvatar,
    wins: 0,
    matches: 0,
  };
}
