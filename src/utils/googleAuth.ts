import type { PlayerProfile } from '../types/game';

const STORAGE_KEY = 'vylera_google_user';
const CLIENT_ID_KEY = 'vylera_google_client_id';

// Default preset avatars if user wants to pick or fallback
export const PRESET_AVATARS = [
  { id: 'google-user-1', name: 'Mba Aytakin', url: new URL('../assets/mba aytakin .png', import.meta.url).href },
  { id: 'google-user-2', name: 'Pak Putra', url: new URL('../assets/pak putra .png', import.meta.url).href },
  { id: 'cyber-pro', name: 'Cyber Ace', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: 'neon-champ', name: 'Neon Champ', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'tennis-star', name: 'Tennis Queen', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
];

export function getStoredUser(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }
  return null;
}

export function saveUser(user: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user to localStorage', e);
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear user from localStorage', e);
  }
}

export function getGoogleClientId(): string {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem(CLIENT_ID_KEY) ||
    ''
  );
}

export function saveGoogleClientId(clientId: string): void {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

// Decode JWT token payload from Google GIS
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token', e);
    return null;
  }
}

// Helper to create or convert Google JWT payload to PlayerProfile
export function createProfileFromGoogleToken(credentialToken: string): PlayerProfile {
  const payload = parseJwt(credentialToken);
  if (payload) {
    return {
      id: payload.sub || `google-${Date.now()}`,
      name: payload.name || payload.given_name || 'Pemain Google',
      email: payload.email || 'user@gmail.com',
      avatar: payload.picture || PRESET_AVATARS[0].url,
      isGoogleUser: true,
      wins: 0,
      matches: 0,
    };
  }

  return createDemoGoogleUser('Pemain Google');
}

// Demo Google Login fallback for easy 1-click login on Vercel without pre-configuring OAuth client
export function createDemoGoogleUser(nameInput: string = 'Asep Google'): PlayerProfile {
  const cleanName = nameInput.trim() || 'Pemain Google';
  const emailName = cleanName.toLowerCase().replace(/\s+/g, '.');
  return {
    id: `google-demo-${Date.now()}`,
    name: cleanName,
    email: `${emailName}@gmail.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
    isGoogleUser: true,
    wins: 0,
    matches: 0,
  };
}
