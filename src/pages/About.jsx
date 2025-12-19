/**
 * About Page - ChainChat
 * Company mission, vision, and team information
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-title">
            Building the Future of
            <br />
            <span className="gradient-text">Decentralized Finance</span>
          </h1>
          <p className="about-lead">
            ChainChat is revolutionizing DeFi by combining AI intelligence with
            Bitcoin's unmatched security through the Stacks blockchain.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="content-wrapper">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h2 className="mission-title">Our Mission</h2>
              <p className="mission-text">
                To democratize access to sophisticated DeFi strategies by making
                them as simple as having a conversation. We believe everyone should
                benefit from the opportunities in decentralized finance, regardless
                of their technical expertise.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">🔮</div>
              <h2 className="mission-title">Our Vision</h2>
              <p className="mission-text">
                A world where AI-powered financial tools are accessible to everyone,
                where Bitcoin's security protects every transaction, and where users
                maintain full control of their assets while earning optimized yields.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">⚡</div>
              <h2 className="mission-title">Our Values</h2>
              <p className="mission-text">
                Security first. User sovereignty always. Transparency in everything.
                We build with the community, for the community, ensuring every line
                of code is audited and every strategy is battle-tested.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="content-wrapper">
          <div className="section-header">
            <h2 className="section-title">Built on Cutting-Edge Technology</h2>
            <p className="section-subtitle">
              We leverage the best blockchain infrastructure and AI models
            </p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-logo">₿</div>
              <h3 className="tech-name">Bitcoin</h3>
              <p className="tech-description">
                Ultimate security and immutability through Bitcoin's proof-of-work
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-logo">⚡</div>
              <h3 className="tech-name">Stacks</h3>
              <p className="tech-description">
                Smart contracts that settle on Bitcoin with Clarity language
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-logo">🔗</div>
              <h3 className="tech-name">Reown (WalletConnect)</h3>
              <p className="tech-description">
                Connect with 600+ wallets seamlessly and securely
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-logo">🤖</div>
              <h3 className="tech-name">AI Engine</h3>
              <p className="tech-description">
                Natural language processing for intuitive strategy execution
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-logo">📡</div>
              <h3 className="tech-name">Chainhooks</h3>
              <p className="tech-description">
                Real-time blockchain event notifications via Hiro Platform
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-logo">🛡️</div>
              <h3 className="tech-name">Clarity</h3>
              <p className="tech-description">
                Decidable smart contract language - no unexpected behavior
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="content-wrapper">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">2024</div>
              <div className="stat-label">Founded</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">$1M+</div>
              <div className="stat-label">Total Value Locked</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <div className="content-wrapper">
          <div className="community-content">
            <h2 className="community-title">Join Our Community</h2>
            <p className="community-text">
              Connect with thousands of users, share strategies, and stay updated
              on the latest features and developments.
            </p>
            <div className="community-links">
              <a
                href="https://github.com/gboigwe/ChainChat"
                target="_blank"
                rel="noopener noreferrer"
                className="community-btn"
              >
                <span className="btn-icon">🐙</span>
                GitHub
              </a>
              <a
                href="https://discord.gg/chainchat"
                target="_blank"
                rel="noopener noreferrer"
                className="community-btn"
              >
                <span className="btn-icon">💬</span>
                Discord
              </a>
              <a
                href="https://twitter.com/chainchat"
                target="_blank"
                rel="noopener noreferrer"
                className="community-btn"
              >
                <span className="btn-icon">🐦</span>
                Twitter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="content-wrapper">
          <h2 className="cta-title">Ready to Start Your DeFi Journey?</h2>
          <p className="cta-description">
            Join ChainChat today and experience AI-powered DeFi
          </p>
          <Link to="/app" className="btn btn-cta">
            Launch App
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
