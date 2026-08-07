import React, { useState } from 'react';
import type { PlayerProfile } from '../types/game';
import {
  generateRandomName,
  PRESET_AVATARS,
  saveUser,
} from '../utils/playerProfile';
import { UserCheck, Dices, Sparkles, Check, Trophy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: PlayerProfile | null;
  onProfileSave: (user: PlayerProfile) => void;
}

export const PlayerProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileSave,
}) => {
  const [nickname, setNickname] = useState(currentUser?.name || generateRandomName());
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser?.avatar || PRESET_AVATARS[0].url
  );

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomName = generateRandomName();
    setNickname(randomName);
    setSelectedAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(randomName)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: PlayerProfile = {
      id: currentUser?.id || `player-${Date.now()}`,
      name: nickname.trim() || 'Pemain Tennis',
      avatar: selectedAvatar,
      wins: currentUser?.wins || 0,
      matches: currentUser?.matches || 0,
    };

    saveUser(updatedUser);
    onProfileSave(updatedUser);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <div className="profile-icon-badge">
            <UserCheck size={28} color="#7be3ff" />
          </div>
          <h2>Profil Pemain Instant</h2>
          <p>
            Buat nickname & pilih avatar tanpa perlu register atau login ribet! Langsung bisa main online.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Nickname Input & Randomizer */}
          <div className="form-group">
            <label>Gaming Nickname / Nama Kamu:</label>
            <div className="input-with-action">
              <input
                type="text"
                placeholder="Masukkan nama pemain..."
                value={nickname}
                maxLength={20}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <button
                type="button"
                className="secondary-btn icon-only"
                onClick={handleRandomize}
                title="Acak Nama & Avatar"
              >
                <Dices size={18} />
              </button>
            </div>
          </div>

          {/* Avatar Selector Grid */}
          <div className="form-group">
            <label>Pilih Avatar Karakter:</label>
            <div className="avatar-picker-grid">
              {PRESET_AVATARS.map((item) => (
                <div
                  key={item.id}
                  className={`avatar-option ${selectedAvatar === item.url ? 'active' : ''}`}
                  onClick={() => setSelectedAvatar(item.url)}
                >
                  <img src={item.url} alt={item.name} className="avatar-option-img" />
                  <span>{item.name}</span>
                  {selectedAvatar === item.url && (
                    <div className="option-check">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats if exists */}
          {currentUser && (
            <div className="profile-stats-box">
              <Trophy size={16} color="#f6d365" />
              <span>Statistik Match: <strong>{currentUser.wins} Menang</strong> / {currentUser.matches} Main</span>
            </div>
          )}

          <button type="submit" className="primary-btn glow-btn submit-profile-btn">
            <Sparkles size={18} /> Simpan Profil & Main
          </button>
        </form>
      </div>
    </div>
  );
};
