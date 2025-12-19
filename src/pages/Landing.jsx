/**
 * Landing Page - ChainChat
 * Modern, professional landing page with hero section
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">⚡</span>
            <span>Powered by Stacks & Bitcoin</span>
          </div>

          <h1 className="hero-title">
            AI-Powered DeFi
            <br />
            <span className="gradient-text">Made Simple</span>
          </h1>

          <p className="hero-description">
            Execute sophisticated DeFi strategies using natural language commands.
            Built on the Stacks blockchain, secured by Bitcoin.
          </p>

          <div className="hero-buttons">
            <Link to="/app" className="btn btn-hero-primary">
              Launch App
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/how-it-works" className="btn btn-hero-secondary">
              How It Works
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">600+</div>
              <div className="stat-label">Supported Wallets</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-value">$1M+</div>
              <div className="stat-label">Total Value Locked</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">💰</div>
            <div className="card-text">Auto-Compound</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🤖</div>
            <div className="card-text">AI Strategies</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">🔒</div>
            <div className="card-text">Secure Vault</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose ChainChat?</h2>
          <p className="section-subtitle">
            Experience the future of DeFi with AI-powered automation
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">AI-Powered Intelligence</h3>
            <p className="feature-description">
              Execute complex strategies using simple natural language commands.
              Our AI understands your intent and optimizes execution.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3 className="feature-title">Multi-Wallet Support</h3>
            <p className="feature-description">
              Connect with 600+ wallets via WalletConnect (Reown).
              Xverse, Leather, and all major Stacks wallets supported.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Built on Stacks for instant finality and low fees.
              Secured by Bitcoin's unmatched security.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">Battle-Tested Security</h3>
            <p className="feature-description">
              Smart contracts audited and verified. Emergency stop mechanisms
              and risk management built-in.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Real-Time Analytics</h3>
            <p className="feature-description">
              Track your positions, profits, and performance in real-time.
              Chainhooks provide instant blockchain event notifications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3 className="feature-title">Optimized Yields</h3>
            <p className="feature-description">
              Automated yield optimization across multiple DeFi protocols.
              Maximize returns while minimizing risk.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of users already earning with ChainChat
          </p>
          <Link to="/app" className="btn btn-cta">
            Launch Application
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
