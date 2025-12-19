/**
 * Dashboard Page - ChainChat
 * Main app interface with wallet connection and strategy dashboard
 */

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import StrategyDashboard from '../components/StrategyDashboard';
import { useWallet } from '../hooks/useWallet';
import './DashboardPage.css';

const DashboardPage = () => {
  const { isConnected } = useWallet();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="dashboard-title">ChainChat Dashboard</h1>
            <p className="dashboard-subtitle">AI-Powered DeFi Strategies on Stacks</p>
          </div>
          <button
            className="info-button"
            onClick={() => setShowInfo(!showInfo)}
            title="About ChainChat"
          >
            ℹ️
          </button>
        </div>

        {showInfo && (
          <div className="info-banner">
            <h3>About ChainChat</h3>
            <p>
              ChainChat is an AI-powered DeFi strategy engine built on the Stacks blockchain.
              It allows you to execute sophisticated DeFi strategies using simple natural language commands.
            </p>
            <ul>
              <li>🔗 Connected via Reown (WalletConnect) - 600+ wallets supported</li>
              <li>🔒 Secure STX vault for strategy execution</li>
              <li>🤖 AI command parser for natural language interaction</li>
              <li>📊 Real-time strategy monitoring and management</li>
            </ul>
            <button className="btn-close" onClick={() => setShowInfo(false)}>
              Close
            </button>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        <div className="container">
          {!isConnected ? (
            <section className="connect-section">
              <WalletConnect />
            </section>
          ) : (
            <section className="strategy-section">
              <StrategyDashboard />
            </section>
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            Powered by <strong>Stacks</strong> | Connected via <strong>Reown (WalletConnect)</strong>
          </p>
          <div className="footer-links">
            <a href="https://www.stacks.co/" target="_blank" rel="noopener noreferrer">
              Stacks Blockchain
            </a>
            <span>•</span>
            <a href="https://reown.com/" target="_blank" rel="noopener noreferrer">
              Reown (WalletConnect)
            </a>
            <span>•</span>
            <a href="https://github.com/gboigwe/ChainChat" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
