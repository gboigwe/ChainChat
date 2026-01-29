/**
 * Wallet Selector Component
 * UI for selecting and connecting to different wallets
 */

import { useState, useEffect } from 'react';
import { walletManager, WalletId } from '../../services/wallets/WalletManager';
import WalletAdapter from '../../services/wallets/WalletAdapter';

interface WalletOption {
  id: WalletId;
  adapter: WalletAdapter;
  isInstalled: boolean;
}

interface WalletSelectorProps {
  onWalletSelect?: (walletId: WalletId) => void;
  onConnect?: (walletId: WalletId, address: string) => void;
  showInstalledOnly?: boolean;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({
  onWalletSelect,
  onConnect,
  showInstalledOnly = false,
}) => {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState<WalletId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWallets();
  }, [showInstalledOnly]);

  const loadWallets = async () => {
    const adapters = walletManager.getAdapters();
    const walletOptions: WalletOption[] = [];

    for (const [id, adapter] of adapters) {
      try {
        const isInstalled = await adapter.isInstalled();

        if (!showInstalledOnly || isInstalled) {
          walletOptions.push({
            id: id as WalletId,
            adapter,
            isInstalled,
          });
        }
      } catch (error) {
        console.error(`Error checking ${id}:`, error);
      }
    }

    setWallets(walletOptions);
  };

  const handleConnect = async (walletId: WalletId) => {
    setConnecting(walletId);
    setError(null);

    try {
      const account = await walletManager.connect(walletId, {
        appName: 'ChainChat',
        onFinish: (data: any) => {
          console.log('Wallet connected:', data);
        },
        onCancel: () => {
          console.log('Wallet connection cancelled');
        },
      });

      if (onConnect) {
        onConnect(walletId, account.address);
      }

      if (onWalletSelect) {
        onWalletSelect(walletId);
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(null);
    }
  };

  const handleDownload = (wallet: WalletOption) => {
    if (wallet.adapter.metadata.downloadUrl) {
      window.open(wallet.adapter.metadata.downloadUrl, '_blank');
    }
  };

  return (
    <div className="wallet-selector">
      <h3 className="wallet-selector-title">Select Your Wallet</h3>

      {error && (
        <div className="wallet-selector-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="wallet-options">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`wallet-option ${!wallet.isInstalled ? 'not-installed' : ''}`}
          >
            <div className="wallet-info">
              <div className="wallet-icon">
                <img
                  src={wallet.adapter.metadata.icon}
                  alt={wallet.adapter.metadata.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23667eea"/></svg>';
                  }}
                />
              </div>
              <div className="wallet-details">
                <h4 className="wallet-name">{wallet.adapter.metadata.name}</h4>
                <p className="wallet-description">
                  {wallet.adapter.metadata.description}
                </p>
                <div className="wallet-badges">
                  {wallet.adapter.metadata.mobileSupport && (
                    <span className="badge mobile">📱 Mobile</span>
                  )}
                  {wallet.adapter.metadata.desktopSupport && (
                    <span className="badge desktop">💻 Desktop</span>
                  )}
                  {!wallet.isInstalled && (
                    <span className="badge not-installed">Not Installed</span>
                  )}
                </div>
              </div>
            </div>

            <div className="wallet-actions">
              {wallet.isInstalled ? (
                <button
                  className="btn btn-primary"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connecting === wallet.id}
                >
                  {connecting === wallet.id ? (
                    <>
                      <span className="spinner"></span>
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={() => handleDownload(wallet)}
                >
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="wallet-empty">
          <p>No wallets available. Please install a Stacks wallet.</p>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;
