/**
 * How It Works Page - ChainChat
 * Step-by-step guide and process explanation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hiw-hero">
        <div className="hiw-hero-content">
          <h1 className="hiw-title">
            DeFi Made Simple
            <br />
            <span className="gradient-text">In 4 Easy Steps</span>
          </h1>
          <p className="hiw-lead">
            Start earning optimized yields in minutes. No complex charts,
            no technical jargon - just simple, AI-powered DeFi.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="content-wrapper">
          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">
                <span className="number">1</span>
              </div>
              <div className="step-content">
                <h2 className="step-title">Connect Your Wallet</h2>
                <p className="step-description">
                  Choose from 600+ supported wallets via WalletConnect or use
                  popular Stacks wallets like Xverse and Leather. Your keys,
                  your crypto - we never have access to your funds.
                </p>
                <div className="step-features">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>600+ wallet options</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>One-click connection</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Full self-custody</span>
                  </div>
                </div>
              </div>
              <div className="step-visual">
                <div className="visual-box wallet-visual">
                  <div className="wallet-icon">👛</div>
                  <div className="wallet-text">Connect Wallet</div>
                </div>
              </div>
            </div>

            <div className="step-connector"></div>

            {/* Step 2 */}
            <div className="step-card step-reverse">
              <div className="step-number">
                <span className="number">2</span>
              </div>
              <div className="step-visual">
                <div className="visual-box deposit-visual">
                  <div className="deposit-icon">💰</div>
                  <div className="deposit-amount">100 STX</div>
                  <div className="deposit-arrow">↓</div>
                </div>
              </div>
              <div className="step-content">
                <h2 className="step-title">Deposit STX to Vault</h2>
                <p className="step-description">
                  Deposit your STX tokens into our secure smart contract vault.
                  Your funds are protected by Bitcoin's security through Stacks.
                  Withdraw anytime with no lock-up periods.
                </p>
                <div className="step-features">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Bitcoin-secured vault</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>No minimum deposit</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Withdraw anytime</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-connector"></div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">
                <span className="number">3</span>
              </div>
              <div className="step-content">
                <h2 className="step-title">Choose Your Strategy</h2>
                <p className="step-description">
                  Simply tell our AI what you want to do using natural language.
                  "Start safe strategy" for conservative returns, or "Start growth
                  strategy" for higher yields. Our AI handles the rest.
                </p>
                <div className="step-features">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Natural language commands</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Multiple strategy options</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>AI-optimized execution</span>
                  </div>
                </div>
              </div>
              <div className="step-visual">
                <div className="visual-box strategy-visual">
                  <div className="strategy-icon">🤖</div>
                  <div className="strategy-text">"Start safe strategy"</div>
                  <div className="strategy-result">✓ Executing...</div>
                </div>
              </div>
            </div>

            <div className="step-connector"></div>

            {/* Step 4 */}
            <div className="step-card step-reverse">
              <div className="step-number">
                <span className="number">4</span>
              </div>
              <div className="step-visual">
                <div className="visual-box earn-visual">
                  <div className="earn-chart">
                    <div className="chart-bar" style={{height: '40%'}}></div>
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar" style={{height: '80%'}}></div>
                    <div className="chart-bar" style={{height: '100%'}}></div>
                  </div>
                  <div className="earn-text">+15% APY</div>
                </div>
              </div>
              <div className="step-content">
                <h2 className="step-title">Earn & Monitor</h2>
                <p className="step-description">
                  Sit back and watch your yields grow. Track performance in
                  real-time, adjust strategies on the fly, or withdraw earnings
                  whenever you want. Full transparency, zero surprises.
                </p>
                <div className="step-features">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Real-time tracking</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Auto-compounding</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Instant withdrawals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="features-deep-dive">
        <div className="content-wrapper">
          <div className="section-header">
            <h2 className="section-title">Powered by Advanced Technology</h2>
            <p className="section-subtitle">
              Under the hood: the tech that makes it all work
            </p>
          </div>

          <div className="deep-dive-grid">
            <div className="dive-card">
              <div className="dive-icon">🔐</div>
              <h3 className="dive-title">Smart Contract Vault</h3>
              <p className="dive-description">
                Your STX is stored in audited Clarity smart contracts on Stacks.
                Every transaction is verified on Bitcoin, ensuring immutability
                and security. Emergency stop mechanisms and access controls
                protect your funds 24/7.
              </p>
            </div>

            <div className="dive-card">
              <div className="dive-icon">🧠</div>
              <h3 className="dive-title">AI Strategy Engine</h3>
              <p className="dive-description">
                Our AI command parser understands natural language and maps it
                to specific DeFi operations. Risk assessment, position sizing,
                and execution timing are all optimized automatically based on
                market conditions.
              </p>
            </div>

            <div className="dive-card">
              <div className="dive-icon">📡</div>
              <h3 className="dive-title">Real-Time Chainhooks</h3>
              <p className="dive-description">
                Hiro Platform Chainhooks deliver instant notifications for every
                blockchain event. Track deposits, withdrawals, strategy executions,
                and more - all in real-time with decoded Clarity values.
              </p>
            </div>

            <div className="dive-card">
              <div className="dive-icon">⚡</div>
              <h3 className="dive-title">Bitcoin Settlement</h3>
              <p className="dive-description">
                Every Stacks transaction settles on Bitcoin, inheriting its
                proof-of-work security. Unlike other Layer 2s, Stacks provides
                true Bitcoin finality for all smart contract operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hiw-cta">
        <div className="content-wrapper">
          <div className="cta-box">
            <h2 className="cta-title">Ready to Start Earning?</h2>
            <p className="cta-description">
              Connect your wallet and execute your first strategy in under 2 minutes
            </p>
            <Link to="/app" className="btn btn-cta">
              Launch App Now
              <span className="btn-arrow">→</span>
            </Link>
            <p className="cta-note">No signup required • Start with any amount</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
