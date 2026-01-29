/**
 * WalletConnect Component
 * UI for connecting Stacks wallets with multi-wallet support
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useWalletConnection } from '../hooks/useWalletConnection';
import WalletModal from './WalletConnect/WalletModal';
import WalletButton from './WalletConnect/WalletButton';
import WalletSwitcher from './WalletConnect/WalletSwitcher';
import { WalletId } from '../services/wallets/WalletManager';

const WalletConnect = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Legacy hook for backwards compatibility
  const {
    isConnected: legacyConnected,
    isConnecting: legacyConnecting,
    error: legacyError,
    address: legacyAddress,
    connectionType,
    connect: legacyConnect,
    connectViaWalletConnect,
    disconnect: legacyDisconnect,
  } = useWallet();

  // New multi-wallet hook
  const {
    account,
    activeWallet,
    connectedWallets,
    isConnected,
    isConnecting,
    error,
    disconnect,
  } = useWalletConnection();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const handleModalConnect = (walletId: WalletId, address: string) => {
    console.log('Connected:', walletId, address);
    setIsModalOpen(false);
  };

  const handleDisconnect = async () => {
    // Disconnect from new multi-wallet system
    if (activeWallet) {
      await disconnect(activeWallet);
    }

    // Also disconnect from legacy system if connected
    if (legacyConnected) {
      await legacyDisconnect();
    }
  };

  // Check if any wallet is connected (new or legacy)
  const hasConnection = isConnected || legacyConnected;
  const displayAddress = account?.address || legacyAddress;

  if (hasConnection) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="connection-badge">
            {connectionType === 'walletconnect' ? (
              <span className="badge walletconnect">WalletConnect</span>
            ) : activeWallet ? (
              <span className="badge multi-wallet">{activeWallet}</span>
            ) : (
              <span className="badge standard">Connected</span>
            )}
          </div>
          <div className="address-display">
            <span className="address-label">Address:</span>
            <span className="address-value">{formatAddress(displayAddress)}</span>
          </div>

          {/* Show wallet switcher if multiple wallets connected */}
          {connectedWallets.length > 1 && (
            <div className="wallet-switcher-section">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowSwitcher(!showSwitcher)}
              >
                Switch Wallet ({connectedWallets.length})
              </button>

              {showSwitcher && (
                <div className="wallet-switcher-container">
                  <WalletSwitcher
                    variant="list"
                    onSwitch={() => setShowSwitcher(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="wallet-actions">
          <button className="btn btn-secondary" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect-container">
      <div className="connect-header">
        <h2>Connect Your Wallet</h2>
        <p>Choose your preferred connection method</p>
      </div>

      {(error || legacyError) && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error?.message || legacyError}</span>
        </div>
      )}

      <div className="connect-options">
        {/* New Multi-Wallet Option */}
        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={isConnecting || legacyConnecting}
        >
          <div className="btn-content">
            <span className="btn-icon">👛</span>
            <div className="btn-text">
              <strong>Connect Wallet</strong>
              <small>Xverse, Leather, Boom, Ledger</small>
            </div>
          </div>
        </button>

        {/* Legacy WalletConnect Option */}
        <button
          className="btn btn-outline btn-walletconnect"
          onClick={connectViaWalletConnect}
          disabled={isConnecting || legacyConnecting}
        >
          <div className="btn-content">
            <span className="btn-icon">🔗</span>
            <div className="btn-text">
              <strong>WalletConnect (Reown)</strong>
              <small>600+ wallets supported</small>
            </div>
          </div>
        </button>

        {/* Legacy Auto-Detect Option */}
        <button
          className="btn btn-outline"
          onClick={legacyConnect}
          disabled={isConnecting || legacyConnecting}
        >
          <div className="btn-content">
            <span className="btn-icon">🔍</span>
            <div className="btn-text">
              <strong>Auto-Detect Wallet</strong>
              <small>Browser extension wallets</small>
            </div>
          </div>
        </button>
      </div>

      {(isConnecting || legacyConnecting) && (
        <div className="connecting-status">
          <div className="spinner"></div>
          <p>Connecting wallet...</p>
        </div>
      )}

      <div className="wallet-info-section">
        <h3>Supported Wallets</h3>
        <ul>
          <li>Xverse - Bitcoin & Stacks wallet</li>
          <li>Leather - Hiro Wallet for Stacks</li>
          <li>Boom - Fast Stacks wallet</li>
          <li>Ledger - Hardware wallet support</li>
          <li>600+ more via WalletConnect</li>
        </ul>
      </div>

      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleModalConnect}
      />
    </div>
  );
};

export default WalletConnect;
