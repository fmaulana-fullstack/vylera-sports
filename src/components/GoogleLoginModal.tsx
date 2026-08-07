import React, { useEffect, useState } from 'react';
import type { PlayerProfile } from '../types/game';
import {
  createDemoGoogleUser,
  createProfileFromGoogleToken,
  getGoogleClientId,
  saveGoogleClientId,
  saveUser,
} from '../utils/googleAuth';
import { LogIn, User, Key, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: PlayerProfile) => void;
}

export const GoogleLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [demoName, setDemoName] = useState('');
  const [customClientId, setCustomClientId] = useState(getGoogleClientId());
  const [isSavedClientId, setIsSavedClientId] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const clientId = getGoogleClientId();
    if (!clientId) return;

    // Load Google Identity Services script dynamically
    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initGsi = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const user = createProfileFromGoogleToken(response.credential);
              saveUser(user);
              onLoginSuccess(user);
              onClose();
            }
          },
        });

        const targetDiv = document.getElementById('google-btn-container');
        if (targetDiv) {
          targetDiv.innerHTML = '';
          (window as any).google.accounts.id.renderButton(targetDiv, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 280,
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else {
      initGsi();
    }
  }, [isOpen, customClientId]);

  if (!isOpen) return null;

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = createDemoGoogleUser(demoName || 'Google Player');
    saveUser(user);
    onLoginSuccess(user);
    onClose();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleClientId(customClientId);
    setIsSavedClientId(true);
    setTimeout(() => setIsSavedClientId(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card google-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <div className="google-icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h2>Masuk dengan Google</h2>
          <p>
            Masuk untuk menyimpan profil, avatar kustom, dan main online bareng teman di Vercel!
          </p>
        </div>

        {/* Option 1: Official Google GIS Sign In */}
        <div className="login-section">
          <h3>Method 1: Google One-Tap / OAuth</h3>
          {getGoogleClientId() ? (
            <div id="google-btn-container" className="google-btn-wrapper"></div>
          ) : (
            <p className="hint-text">
              (Masukkan Google Client ID di bawah jika ingin tombol Google resmi)
            </p>
          )}
        </div>

        <div className="divider-or">
          <span>ATAU QUICK LOGIN</span>
        </div>

        {/* Option 2: 1-Click Simple Google Sign In */}
        <form onSubmit={handleDemoLogin} className="login-section demo-form">
          <h3>Method 2: Simple Google Fast Login</h3>
          <p className="hint-text">
            Sangat cocok untuk pengujian di Vercel tanpa pusing konfigurasi OAuth Google Console!
          </p>
          <div className="input-group">
            <User size={18} />
            <input
              type="text"
              placeholder="Masukkan Nama Kamu (Cth: Budi Google)"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
            />
          </div>
          <button type="submit" className="primary-btn glow-btn">
            <LogIn size={18} /> Masuk sebagai Google User
          </button>
        </form>

        <details className="client-id-accordion">
          <summary>
            <Key size={14} /> Pengaturan Custom Google Client ID (Opsional)
          </summary>
          <form onSubmit={handleSaveClientId} className="client-id-form">
            <p className="hint-text">
              Dapatkan Client ID dari Google Cloud Console dan tempel di sini.
            </p>
            <input
              type="text"
              placeholder="Cth: 123456789-abc.apps.googleusercontent.com"
              value={customClientId}
              onChange={(e) => setCustomClientId(e.target.value)}
            />
            <button type="submit" className="secondary-btn">
              {isSavedClientId ? <Check size={16} /> : 'Simpan Client ID'}
            </button>
          </form>
        </details>
      </div>
    </div>
  );
};
