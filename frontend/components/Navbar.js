"use client";

import { useState } from 'react';

export default function Navbar({ profileData }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const logoName = (profileData?.name || 'Kishan Budhathoki').toUpperCase().replace(/\s+/g, '_');

  return (
    <header>
      <div className="nav-container">
        <a href="#" className="logo" onClick={closeMenu}>
          <span className="logo-tag">&lt;</span>{logoName}<span className="logo-tag"> /&gt;</span>
        </a>
        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="#projects" className="nav-link" onClick={closeMenu}>Project Showcase</a>
          <a href="#skills" className="nav-link" onClick={closeMenu}>Skills</a>
          <a href="#interactive-lab" className="nav-link" onClick={closeMenu}>QA Lab</a>
          <a href="#experience" className="nav-link" onClick={closeMenu}>Experience</a>
          <a href="#contact" className="nav-link btn-secondary-nav" onClick={closeMenu}>Log an Issue(Contact)</a>
        </nav>
        <div className="nav-right">
          <button
            className={`hamburger-btn ${isOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
