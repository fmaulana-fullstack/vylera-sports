export type SportType = 'tennis' | 'pingpong' | 'airhockey' | 'soccer' | 'basketball' | 'bowling';

export type GameMode = 'vs-ai' | 'local' | 'online';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'fireball' | 'speed' | 'freeze' | 'shield' | 'mega';

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: PowerUpType;
  duration: number; // in ms
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number; // timestamp
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  isGoogleUser?: boolean;
  email?: string;
  wins: number;
  matches: number;
  level?: number;
  xp?: number;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  isFireball?: boolean;
  isUltimate?: boolean;
  trailHistory: Array<{ x: number; y: number; radius: number; alpha: number }>;
}

export interface PaddleState {
  x?: number;
  y: number;
  score: number;
  height: number;
  width?: number;
  speed: number;
  rage: number; // 0 - 100%
  isFrozen?: boolean;
  shieldActive?: boolean;
  activePowerUp?: ActivePowerUp | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type?: 'spark' | 'ring' | 'star' | 'flame';
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface AnnouncerBanner {
  text: string;
  subtext?: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface MatchStats {
  totalRallies: number;
  maxBallSpeed: number;
  powerupsCollected: number;
  leftHitCount: number;
  rightHitCount: number;
  maxCombo: number;
  ultimatesUsed: number;
}

export interface PeerMessage {
  type: 'INIT_STATE' | 'STATE_UPDATE' | 'PLAYER_ACTION' | 'REMATCH' | 'PING' | 'PADDLE_MOVE' | 'TRIGGER_ULTIMATE' | 'CHANGE_SPORT';
  payload: any;
}
