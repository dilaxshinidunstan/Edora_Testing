import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
// import logo from '../../assets/images/botlogo.png';
import EdoraWordLogo from '../../assets/images/logo/edora_word_logo_white.png'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      
      <div className="navbar-brand">
      {/* <div className="shrink-0">
        <img className="size-8" src={logo} alt="edora" />
      </div> */}
      
        <div className="logo-container">
            <img className="logos" src={EdoraWordLogo} alt="edora" />
        </div>
        {/* <h1>Ξｄｏｒａ𝕰𝖉𝖔𝖗𝖆꧁✬◦°⋆⋆°◦. ℰ𝒹ℴ𝓇𝒶 ◦°⋆⋆°◦✬꧂</h1> */}
      </div>

      <div className='deskview'>
        <a href="/home" className="navbar-linkd" aria-label="Go to Home">Home</a>
        <a href="/about" className="navbar-linkd" aria-label="Go to About">About</a>
        <a href="/blog" className="navbar-linkd" aria-label="Go to Blog">Blog</a>
        {/* <a href="/festival/start" className="navbar-linkd festival-link" aria-label="festival">Festival</a> */}

      </div>
      {/* Overlay for background blur */}
      <div
        className={`menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Close mobile menu"
      ></div>

      {/* Mobile Menu */}
      <div className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <button
          className="close-menu-button"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <FaTimes size={20} />
        </button>
        <a href="/home" className="navbar-link" aria-label="Go to Home">Home</a>
        <a href="/about" className="navbar-link" aria-label="Go to About">About</a>
        <a href="/blog" className="navbar-link" aria-label="Go to Blog">Blog</a>
        {/* <a href="/festival/start" className="navbar-link festival-link" aria-label="festival">Festival</a> */}
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <a href="/signup" className="stusignup-button" aria-label="Sign in">Signup</a>
        <button onClick={toggleDarkMode} className="theme-toggle-button" aria-label="Toggle dark mode">
          {isDarkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          <FaBars size={20} />
        </button>
        
      </div>
    </nav>
  );
};

export default Navbar;
