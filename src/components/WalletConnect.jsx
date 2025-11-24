/**
 * WalletConnect Component
 * UI for connecting Stacks wallets using Reown (WalletConnect)
 */

import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnect = () => {
  const {
    isConnected,
    isConnecting,
    error,
    address,
    connectionType,
    connect,
    connectViaWalletConnect,
    disconnect,
  } = useWallet();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="connection-badge">
            {connectionType === 'walletconnect' ? (
              <span className="badge walletconnect">WalletConnect</span>
            ) : (
              <span className="badge standard">Connected</span>
            )}
          </div>
          <div className="address-display">
            <span className="address-label">Address:</span>
            <span className="address-value">{formatAddress(address)}</span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect-container">
      <div className="connect-header">
        <h2>Connect Your Wallet</h2>
        <p>Choose your preferred connection method</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="connect-options">
        <button
          className="btn btn-primary btn-walletconnect"
          onClick={connectViaWalletConnect}
          disabled={isConnecting}
        >
          <div className="btn-content">
            <span className="btn-icon">🔗</span>
            <div className="btn-text">
              <strong>WalletConnect (Reown)</strong>
              <small>600+ wallets supported</small>
            </div>
          </div>
        </button>

        <button
          className="btn btn-outline"
          onClick={connect}
          disabled={isConnecting}
        >
          <div className="btn-content">
            <span className="btn-icon">👛</span>
            <div className="btn-text">
              <strong>Auto-Detect Wallet</strong>
              <small>Browser extension wallets</small>
            </div>
          </div>
        </button>
      </div>

      {isConnecting && (
        <div className="connecting-status">
          <div className="spinner"></div>
          <p>Connecting wallet...</p>
        </div>
      )}

      <div className="wallet-info-section">
        <h3>Supported Wallets</h3>
        <ul>
          <li>Xverse (WalletConnect supported)</li>
          <li>Leather (Hiro Wallet)</li>
          <li>Asigna</li>
          <li>600+ more via WalletConnect</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletConnect;
