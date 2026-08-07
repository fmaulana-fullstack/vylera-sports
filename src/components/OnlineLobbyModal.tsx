import React, { useState } from 'react';
import type { PlayerProfile } from '../types/game';
import { Globe, Copy, Check, Users, Play, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: PlayerProfile | null;
  onHostRoom: (roomCode: string) => void;
  onJoinRoom: (roomCode: string) => void;
  statusText: string;
  isConnected: boolean;
  roomCode: string;
}

export const OnlineLobbyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onHostRoom,
  onJoinRoom,
  statusText,
  isConnected,
  roomCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card lobby-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <div className="online-icon-badge">
            <Globe size={28} />
          </div>
          <h2>Mode Online Multiplayer</h2>
          <p>Main bareng teman secara live tanpa lag via WebRTC P2P!</p>
        </div>

        {/* User Card */}
        {user && (
          <div className="current-user-banner">
            <img src={user.avatar} alt={user.name} className="user-avatar-tiny" />
            <div>
              <strong>{user.name}</strong>
              <span className="google-tag">Profil Pemain Aktif</span>
            </div>
          </div>
        )}

        {/* Host / Room Created View */}
        {roomCode ? (
          <div className="room-created-box">
            <div className="code-display">
              <span className="code-label">KODE ROOM:</span>
              <strong className="code-value">{roomCode}</strong>
            </div>

            <p className="status-badge-text">{statusText}</p>

            <button onClick={handleCopyLink} className="secondary-btn copy-btn">
              {copiedLink ? <Check size={18} /> : <Copy size={18} />}
              {copiedLink ? 'Link Berhasil Disalin!' : 'Bagikan Link Room ke Teman'}
            </button>

            {isConnected && (
              <button onClick={onClose} className="primary-btn glow-btn ready-btn">
                <Play size={18} /> Mulai Pertandingan!
              </button>
            )}
          </div>
        ) : (
          <div className="lobby-options">
            {/* Host Button */}
            <div className="option-card">
              <h3><Users size={20} /> Buat Room Baru</h3>
              <p>Dapatkan Kode / Link Room lalu kirimkan ke lawan mainmu.</p>
              <button
                onClick={() => onHostRoom('')}
                className="primary-btn glow-btn"
              >
                Buat Room Online
              </button>
            </div>

            <div className="divider-or">
              <span>ATAU</span>
            </div>

            {/* Join Form */}
            <div className="option-card">
              <h3><ArrowRight size={20} /> Gabung Room Teman</h3>
              <p>Masukkan 4 digit kode room dari temanmu.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputCode.trim()) onJoinRoom(inputCode.trim());
                }}
                className="join-form"
              >
                <input
                  type="text"
                  placeholder="Masukkan Kode (Cth: 8821)"
                  value={inputCode}
                  maxLength={6}
                  onChange={(e) => setInputCode(e.target.value)}
                />
                <button type="submit" className="secondary-btn">
                  Gabung Room
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
