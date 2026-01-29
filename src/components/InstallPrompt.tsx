/**
 * Install Prompt Component
 * PWA installation prompt
 */

import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <span className="install-icon">📱</span>
        <div className="install-text">
          <h3>Install ChainChat</h3>
          <p>Install our app for a better experience</p>
        </div>
      </div>
      <div className="install-actions">
        <button className="install-btn" onClick={handleInstall}>
          Install
        </button>
        <button className="dismiss-btn" onClick={handleDismiss}>
          ✕
        </button>
      </div>

      <style jsx>{`
        .install-prompt {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .install-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .install-icon {
          font-size: 2rem;
        }

        .install-text h3 {
          margin: 0;
          font-size: 1rem;
          color: #333;
        }

        .install-text p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #666;
        }

        .install-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .install-btn {
          padding: 0.5rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .dismiss-btn {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
        }

        @media (min-width: 769px) {
          .install-prompt {
            max-width: 400px;
            left: auto;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;
