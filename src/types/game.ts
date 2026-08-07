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
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  isFireball?: boolean;
}

export interface PaddleState {
  y: number;
  score: number;
  height: number;
  speed: number;
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
}

export interface MatchStats {
  totalRallies: number;
  maxBallSpeed: number;
  powerupsCollected: number;
  leftHitCount: number;
  rightHitCount: number;
}

export interface PeerMessage {
  type: 'INIT_STATE' | 'STATE_UPDATE' | 'PLAYER_ACTION' | 'REMATCH' | 'PING' | 'PADDLE_MOVE';
  payload: any;
}
