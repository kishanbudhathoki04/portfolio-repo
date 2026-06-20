"use client";

import { useState } from 'react';
import Link from 'next/link';

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
        <Link href="/" className="logo" onClick={closeMenu}>
          <span className="logo-tag">&lt;</span>{logoName}<span className="logo-tag"> /&gt;</span>
        </Link>
        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <Link href="/#about" className="nav-link" onClick={closeMenu}>About</Link>
          <Link href="/#projects" className="nav-link" onClick={closeMenu}>Project Showcase</Link>
          <Link href="/#skills" className="nav-link" onClick={closeMenu}>Skills</Link>
          <Link href="/#interactive-lab" className="nav-link" onClick={closeMenu}>QA Lab</Link>
          <Link href="/#experience" className="nav-link" onClick={closeMenu}>Experience</Link>
          <Link href="/#contact" className="nav-link btn-secondary-nav" onClick={closeMenu}>Log an Issue(Contact)</Link>
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
