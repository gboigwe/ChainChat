/**
 * Wallet Button Component
 * Compact button for wallet connection/disconnection
 */

import { useState, useEffect } from 'react';
import { walletManager } from '../../services/wallets/WalletManager';
import { WalletAccount } from '../../services/wallets/WalletAdapter';

interface WalletButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  showAddress?: boolean;
  showNetwork?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
  showAddress = true,
  showNetwork = false,
  variant = 'primary',
}) => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [walletName, setWalletName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Get initial state
    updateAccountInfo();

    // Subscribe to wallet changes
    const unsubscribe = walletManager.subscribe((state) => {
      updateAccountInfo();
    });

    return unsubscribe;
  }, []);

  const updateAccountInfo = () => {
    const activeAccount = walletManager.getActiveAccount();
    const activeAdapter = walletManager.getActiveAdapter();

    setAccount(activeAccount);
    setWalletName(activeAdapter?.metadata.name || '');
  };

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    }
    setIsDropdownOpen(false);
  };

  const handleDisconnect = async () => {
    const state = walletManager.getState();
    if (state.activeWallet) {
      try {
        await walletManager.disconnect(state.activeWallet);
        if (onDisconnect) {
          onDisconnect();
        }
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
    setIsDropdownOpen(false);
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!account) {
    return (
      <button
        className={`wallet-button wallet-button-${variant} connect`}
        onClick={handleConnect}
      >
        <span className="wallet-icon">👛</span>
        <span className="wallet-text">Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="wallet-button-container">
      <button
        className={`wallet-button wallet-button-${variant} connected`}
        onClick={toggleDropdown}
      >
        <span className="wallet-status-indicator"></span>
        {showAddress && (
          <span className="wallet-address">{formatAddress(account.address)}</span>
        )}
        {showNetwork && account.network && (
          <span className="wallet-network">{account.network}</span>
        )}
        <span className="wallet-dropdown-icon">▾</span>
      </button>

      {isDropdownOpen && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown-header">
            <span className="wallet-name">{walletName}</span>
          </div>

          <div className="wallet-dropdown-content">
            <div className="wallet-info-item">
              <span className="label">Address:</span>
              <span className="value">{formatAddress(account.address)}</span>
            </div>

            {account.network && (
              <div className="wallet-info-item">
                <span className="label">Network:</span>
                <span className="value">{account.network}</span>
              </div>
            )}
          </div>

          <div className="wallet-dropdown-actions">
            <button className="btn btn-sm btn-secondary" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        </div>
      )}

      {isDropdownOpen && (
        <div className="wallet-dropdown-overlay" onClick={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
};

export default WalletButton;
