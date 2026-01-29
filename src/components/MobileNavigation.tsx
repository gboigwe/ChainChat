/**
 * Mobile Navigation Component
 * Hamburger menu and bottom navigation for mobile devices
 */

import React, { useState } from 'react';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose,
}) => {
  return (
    <>
      {/* Hamburger Button */}
      <button className="hamburger-menu" onClick={onToggle} aria-label="Toggle menu">
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={onClose}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h2>ChainChat</h2>
              <button className="close-button" onClick={onClose} aria-label="Close menu">
                ✕
              </button>
            </div>

            <ul className="mobile-menu-list">
              <li>
                <a href="/" onClick={onClose}>
                  <span className="menu-icon">🏠</span>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/chat" onClick={onClose}>
                  <span className="menu-icon">💬</span>
                  <span>Chat</span>
                </a>
              </li>
              <li>
                <a href="/portfolio" onClick={onClose}>
                  <span className="menu-icon">📊</span>
                  <span>Portfolio</span>
                </a>
              </li>
              <li>
                <a href="/wallet" onClick={onClose}>
                  <span className="menu-icon">👛</span>
                  <span>Wallet</span>
                </a>
              </li>
              <li>
                <a href="/settings" onClick={onClose}>
                  <span className="menu-icon">⚙️</span>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav mobile-only">
        <a href="/" className="bottom-nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </a>
        <a href="/chat" className="bottom-nav-item">
          <span className="nav-icon">💬</span>
          <span className="nav-label">Chat</span>
        </a>
        <a href="/portfolio" className="bottom-nav-item">
          <span className="nav-icon">📊</span>
          <span className="nav-label">Portfolio</span>
        </a>
        <a href="/wallet" className="bottom-nav-item">
          <span className="nav-icon">👛</span>
          <span className="nav-label">Wallet</span>
        </a>
      </nav>

      <style jsx>{`
        .hamburger-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .hamburger-line {
          width: 24px;
          height: 2px;
          background: #333;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .hamburger-line.open:nth-child(2) {
          opacity: 0;
        }

        .hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          max-width: 80vw;
          background: white;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          overflow-y: auto;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .mobile-menu-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #667eea;
        }

        .close-button {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          color: #666;
        }

        .mobile-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mobile-menu-list li {
          border-bottom: 1px solid #f0f0f0;
        }

        .mobile-menu-list a {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          color: #333;
          text-decoration: none;
          transition: background 0.2s;
        }

        .mobile-menu-list a:hover {
          background: #f8f9fa;
        }

        .menu-icon {
          font-size: 1.5rem;
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          background: white;
          border-top: 1px solid #e0e0e0;
          padding: 0.5rem 0;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          color: #666;
          text-decoration: none;
          transition: color 0.2s;
        }

        .bottom-nav-item:hover,
        .bottom-nav-item.active {
          color: #667eea;
        }

        .nav-icon {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (min-width: 1025px) {
          .hamburger-menu,
          .mobile-menu-overlay,
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;
