import React from 'react';
import { Activity, ShieldCheck, Zap, Wifi } from 'lucide-react';

export const VyleraFooter: React.FC = () => {
  return (
    <footer className="vylera-terminal-footer">
      <div className="vylera-status-bar">
        <div className="status-item main-kernel">
          <Activity size={16} className="pulse-icon" />
          <span>VYLERA NEURAL KERNEL v2.4</span>
        </div>

        <div className="status-divider" />

        <div className="status-item green">
          <ShieldCheck size={16} />
          <span>SYSTEM: SECURE (Sanctuary-v1)</span>
        </div>

        <div className="status-divider" />

        <div className="status-item blue">
          <Wifi size={14} />
          <span>REGION: JAKARTA (asia-southeast2)</span>
        </div>

        <div className="status-divider" />

        <div className="status-item purple">
          <Zap size={14} />
          <span>VERTEX AI: OPTIMIZED</span>
        </div>
      </div>

      <div className="vylera-copyright">
        <span>© 2026 PT Vylera Labs Indonesia. Engineered for Ambient & Neural Intelligence.</span>
      </div>
    </footer>
  );
};
