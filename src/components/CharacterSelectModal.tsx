import React from 'react';
import type { PlayerProfile } from '../types/game';
import { PRESET_AVATARS } from '../utils/googleAuth';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar: string;
  onSelectAvatar: (avatarUrl: string, name: string) => void;
  currentUser: PlayerProfile | null;
}

export const CharacterSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedAvatar,
  onSelectAvatar,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card character-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <div className="character-icon-badge">
            <Sparkles size={28} />
          </div>
          <h2>Pilih Karakter / Avatar</h2>
          <p>Karakter ini akan tampil di papan skor dan lapangan pertandingan!</p>
        </div>

        <div className="avatar-grid">
          {currentUser && currentUser.isGoogleUser && (
            <div
              className={`avatar-card ${selectedAvatar === currentUser.avatar ? 'active' : ''}`}
              onClick={() => onSelectAvatar(currentUser.avatar, currentUser.name)}
            >
              <img src={currentUser.avatar} alt="Google Avatar" className="avatar-img" />
              <span className="avatar-name">Profil Google</span>
              {selectedAvatar === currentUser.avatar && (
                <div className="check-badge">
                  <Check size={14} />
                </div>
              )}
            </div>
          )}

          {PRESET_AVATARS.map((item) => (
            <div
              key={item.id}
              className={`avatar-card ${selectedAvatar === item.url ? 'active' : ''}`}
              onClick={() => onSelectAvatar(item.url, item.name)}
            >
              <img src={item.url} alt={item.name} className="avatar-img" />
              <span className="avatar-name">{item.name}</span>
              {selectedAvatar === item.url && (
                <div className="check-badge">
                  <Check size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
