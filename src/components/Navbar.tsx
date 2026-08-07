import React from 'react';
import type { PlayerProfile, GameMode } from '../types/game';
import {
  Volume2,
  VolumeX,
  User,
  Globe,
  Bot,
  Users,
  Sparkles,
} from 'lucide-react';

interface Props {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  user: PlayerProfile | null;
  onOpenProfileModal: () => void;
  onOpenCharacterModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<Props> = ({
  mode,
  onSelectMode,
  user,
  onOpenProfileModal,
  onOpenCharacterModal,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="top-navbar">
      <div className="nav-brand">
        <div className="brand-logo">🎾</div>
        <div>
          <h1 className="brand-title">Vylera Tennis</h1>
          <span className="brand-badge">PRO MULTIPLAYER</span>
        </div>
      </div>

      {/* Game Mode Selector */}
      <nav className="mode-selector">
        <button
          className={`mode-tab ${mode === 'vs-ai' ? 'active' : ''}`}
          onClick={() => onSelectMode('vs-ai')}
        >
          <Bot size={16} /> Vs AI
        </button>
        <button
          className={`mode-tab ${mode === 'local' ? 'active' : ''}`}
          onClick={() => onSelectMode('local')}
        >
          <Users size={16} /> Local 2P
        </button>
        <button
          className={`mode-tab ${mode === 'online' ? 'active' : ''}`}
          onClick={() => onSelectMode('online')}
        >
          <Globe size={16} /> Online Live
        </button>
      </nav>

      {/* Action Controls */}
      <div className="nav-actions">
        <button
          className="icon-action-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Suara' : 'Aktifkan Suara'}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        <button
          className="secondary-btn nav-btn"
          onClick={onOpenCharacterModal}
        >
          <Sparkles size={16} /> Karakter
        </button>

        <button
          className="primary-btn glow-btn nav-google-btn"
          onClick={onOpenProfileModal}
        >
          {user ? (
            <>
              <img src={user.avatar} alt={user.name} className="nav-user-avatar" />
              <span className="nav-user-name">{user.name}</span>
            </>
          ) : (
            <>
              <User size={16} /> Profil Pemain
            </>
          )}
        </button>
      </div>
    </header>
  );
};
