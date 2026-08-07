import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { MatchStats } from '../types/game';
import { Trophy, RotateCcw, Zap, Flame, Sparkles } from 'lucide-react';

interface Props {
  winnerName: string;
  winnerAvatar: string;
  stats: MatchStats;
  onRematch: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<Props> = ({
  winnerName,
  winnerAvatar,
  stats,
  onRematch,
  onClose,
}) => {
  useEffect(() => {
    // Launch fireworks confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card victory-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trophy-badge">
          <Trophy size={48} color="#f6d365" />
        </div>

        <h2 className="victory-title">JUARA MATCH!</h2>
        <div className="winner-profile">
          <img src={winnerAvatar} alt={winnerName} className="winner-avatar" />
          <h3>{winnerName}</h3>
        </div>

        {/* Match Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <Zap size={18} className="stat-icon yellow" />
            <div>
              <span className="stat-value">{stats.maxBallSpeed.toFixed(1)} km/h</span>
              <span className="stat-label">Kecepatan Maks</span>
            </div>
          </div>

          <div className="stat-card">
            <Sparkles size={18} className="stat-icon blue" />
            <div>
              <span className="stat-value">{stats.maxCombo}x</span>
              <span className="stat-label">Max Rally Combo</span>
            </div>
          </div>

          <div className="stat-card">
            <Flame size={18} className="stat-icon red" />
            <div>
              <span className="stat-value">{stats.ultimatesUsed}</span>
              <span className="stat-label">Meteor Smash</span>
            </div>
          </div>
        </div>

        <div className="victory-actions">
          <button onClick={onRematch} className="primary-btn glow-btn rematch-btn">
            <RotateCcw size={20} /> TANDING LAGI (REMATCH)
          </button>
        </div>
      </div>
    </div>
  );
};
