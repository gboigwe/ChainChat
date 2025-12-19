/**
 * Navigation Component
 * Main header navigation with responsive menu
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ChainChat</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-active' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            className={`nav-link ${isActive('/how-it-works') ? 'nav-link-active' : ''}`}
            onClick={closeMobileMenu}
          >
            How It Works
          </Link>
          <Link
            to="/app"
            className="nav-link nav-link-app"
            onClick={closeMobileMenu}
          >
            Launch App
            <span className="app-arrow">→</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'mobile-menu-toggle-active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
