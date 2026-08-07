import React from 'react';
import type { SportType } from '../types/game';
import { Cpu } from 'lucide-react';

interface Props {
  activeSport: SportType;
  onSelectSport: (sport: SportType) => void;
}

export const SportSelector: React.FC<Props> = ({
  activeSport,
  onSelectSport,
}) => {
  const sports: Array<{
    id: SportType;
    label: string;
    icon: string;
    description: string;
    badge: string;
  }> = [
    {
      id: 'tennis',
      label: 'Vylera Tennis',
      icon: '🎾',
      description: 'Layanan servis cepat & Meteor Ultimate Smash!',
      badge: 'POPULAR',
    },
    {
      id: 'pingpong',
      label: 'Ping Pong Blitz',
      icon: '🏓',
      description: 'Tenis meja super cepat dengan efek pukulan spin!',
      badge: 'FAST PACED',
    },
    {
      id: 'airhockey',
      label: 'Neon Air Hockey',
      icon: '🏒',
      description: 'Hoki udara meja es neon dengan pergerakan 2D!',
      badge: 'ARCADE',
    },
    {
      id: 'soccer',
      label: 'Cyber Head Soccer',
      icon: '⚽',
      description: 'Sepak bola tandukan kepala dengan gravitasi!',
      badge: 'GRAVITY',
    },
    {
      id: 'basketball',
      label: 'Quantum Hoops',
      icon: '🏀',
      description: 'Basket 3-point shootout dengan lintasan parabola!',
      badge: 'SHOOTOUT',
    },
    {
      id: 'bowling',
      label: 'Cyber Bowling',
      icon: '🎳',
      description: 'Bowling neon dengan bola curve & lemaparan strike!',
      badge: 'STRIKE',
    },
  ];

  return (
    <section className="sport-selector-container">
      <div className="sport-selector-header">
        <Cpu size={18} className="icon-blue" />
        <h2>Vylera Sports Center - Pilih Arena Arcade:</h2>
      </div>

      <div className="sport-grid">
        {sports.map((sp) => (
          <button
            key={sp.id}
            type="button"
            className={`sport-card ${activeSport === sp.id ? 'active' : ''}`}
            onClick={() => onSelectSport(sp.id)}
          >
            <div className="sport-card-top">
              <span className="sport-icon">{sp.icon}</span>
              <span className="sport-badge">{sp.badge}</span>
            </div>
            <h3 className="sport-title">{sp.label}</h3>
            <p className="sport-desc">{sp.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
