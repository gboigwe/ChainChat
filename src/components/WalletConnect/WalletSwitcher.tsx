/**
 * Wallet Switcher Component
 * UI component for switching between multiple connected wallets
 */

import { useState } from 'react';
import { useWalletSwitcher } from '../../hooks/useWalletSwitcher';
import { WalletId } from '../../services/wallets/WalletManager';

interface WalletSwitcherProps {
  onSwitch?: (walletId: WalletId) => void;
  onRemove?: (walletId: WalletId) => void;
  showRemoveButton?: boolean;
  variant?: 'dropdown' | 'list' | 'grid';
}

const WalletSwitcher: React.FC<WalletSwitcherProps> = ({
  onSwitch,
  onRemove,
  showRemoveButton = true,
  variant = 'dropdown',
}) => {
  const { walletOptions, activeWalletId, canSwitch, switchToWallet, removeWallet } =
    useWalletSwitcher();
  const [isOpen, setIsOpen] = useState(false);
  const [removing, setRemoving] = useState<WalletId | null>(null);

  const handleSwitch = async (walletId: WalletId) => {
    try {
      switchToWallet(walletId);
      if (onSwitch) {
        onSwitch(walletId);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch wallet:', error);
    }
  };

  const handleRemove = async (walletId: WalletId, event: React.MouseEvent) => {
    event.stopPropagation();
    setRemoving(walletId);

    try {
      await removeWallet(walletId);
      if (onRemove) {
        onRemove(walletId);
      }
    } catch (error) {
      console.error('Failed to remove wallet:', error);
    } finally {
      setRemoving(null);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletOptions.length === 0) {
    return null;
  }

  if (!canSwitch && walletOptions.length === 1) {
    return null; // Don't show switcher if only one wallet
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className="wallet-switcher-dropdown">
        <button
          className="wallet-switcher-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className="wallet-switcher-label">
            {walletOptions.length} Wallet{walletOptions.length > 1 ? 's' : ''}
          </span>
          <span className="wallet-switcher-icon">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <>
            <div
              className="wallet-switcher-overlay"
              onClick={() => setIsOpen(false)}
            />
            <div className="wallet-switcher-menu">
              {walletOptions.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`wallet-switcher-item ${
                    wallet.isActive ? 'active' : ''
                  }`}
                  onClick={() => handleSwitch(wallet.id)}
                >
                  <div className="wallet-item-info">
                    <span className="wallet-item-name">{wallet.name}</span>
                    <span className="wallet-item-address">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>

                  {wallet.isActive && (
                    <span className="wallet-item-badge">Active</span>
                  )}

                  {showRemoveButton && !wallet.isActive && (
                    <button
                      className="wallet-item-remove"
                      onClick={(e) => handleRemove(wallet.id, e)}
                      disabled={removing === wallet.id}
                      aria-label={`Remove ${wallet.name}`}
                    >
                      {removing === wallet.id ? '...' : '✕'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div className="wallet-switcher-list">
        <h3 className="wallet-switcher-title">Connected Wallets</h3>
        {walletOptions.map((wallet) => (
          <div
            key={wallet.id}
            className={`wallet-list-item ${wallet.isActive ? 'active' : ''}`}
          >
            <div className="wallet-list-info">
              <span className="wallet-list-name">{wallet.name}</span>
              <span className="wallet-list-address">
                {formatAddress(wallet.address)}
              </span>
            </div>

            <div className="wallet-list-actions">
              {!wallet.isActive && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleSwitch(wallet.id)}
                >
                  Switch
                </button>
              )}

              {wallet.isActive && (
                <span className="wallet-list-badge">Active</span>
              )}

              {showRemoveButton && (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={(e) => handleRemove(wallet.id, e)}
                  disabled={removing === wallet.id}
                >
                  {removing === wallet.id ? 'Removing...' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="wallet-switcher-grid">
      <h3 className="wallet-switcher-title">Connected Wallets</h3>
      <div className="wallet-grid">
        {walletOptions.map((wallet) => (
          <div
            key={wallet.id}
            className={`wallet-grid-card ${wallet.isActive ? 'active' : ''}`}
            onClick={() => !wallet.isActive && handleSwitch(wallet.id)}
          >
            {wallet.isActive && (
              <span className="wallet-grid-badge">Active</span>
            )}

            <div className="wallet-grid-content">
              <h4 className="wallet-grid-name">{wallet.name}</h4>
              <p className="wallet-grid-address">
                {formatAddress(wallet.address)}
              </p>
            </div>

            {showRemoveButton && (
              <button
                className="wallet-grid-remove"
                onClick={(e) => handleRemove(wallet.id, e)}
                disabled={removing === wallet.id}
                aria-label={`Remove ${wallet.name}`}
              >
                {removing === wallet.id ? '...' : '✕'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletSwitcher;
