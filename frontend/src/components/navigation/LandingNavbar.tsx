import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../services/context/ThemeContext';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

export const LandingNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar navbar--landing ${isScrolled ? 'navbar--scrolled' : ''}`}>
      {/* Soft atmospheric radial light glow behind header when not scrolled */}
      {!isScrolled && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1280px',
            height: '180px',
            background: `
              radial-gradient(
                ellipse 75% 70% at 50% 30%,
                rgba(255, 255, 255, 0.82) 0%,
                rgba(255, 255, 255, 0.60) 32%,
                rgba(255, 255, 255, 0.35) 58%,
                rgba(255, 255, 255, 0.12) 80%,
                transparent 100%
              )
            `,
            filter: 'blur(28px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div className="navbar__container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src="/favicon.png" alt="UniGigs" className="navbar__logo-icon" />
          <span className="navbar__logo-text">UniGigs</span>
        </Link>

        {/* Public Desktop Nav Links */}
        <nav className="navbar__nav">
          <Link to="/gigs" className="navbar__link">
            Explore Gigs
          </Link>
          <a href="#why-unigigs" className="navbar__link">
            Why UniGigs
          </a>
          <a href="#how-it-works" className="navbar__link">
            How It Works
          </a>
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
          <ThemeToggle currentTheme={theme} onToggle={toggleTheme} />

          <div className="navbar__auth">
            <Link to="/login" className="navbar__btn navbar__btn--ghost">
              Sign In
            </Link>
            <Link to="/signup" className="navbar__btn navbar__btn--primary">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="navbar__mobile-menu">
          <nav className="navbar__mobile-nav">
            <Link to="/gigs" className="navbar__mobile-link">
              Explore Gigs
            </Link>
            <a href="#why-unigigs" className="navbar__mobile-link">
              Why UniGigs
            </a>
            <a href="#how-it-works" className="navbar__mobile-link">
              How It Works
            </a>
          </nav>

          <div className="navbar__mobile-auth">
            <Link to="/login" className="navbar__btn navbar__btn--ghost navbar__btn--full">
              Sign In
            </Link>
            <Link to="/signup" className="navbar__btn navbar__btn--primary navbar__btn--full">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
