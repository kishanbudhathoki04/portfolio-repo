"use client";

import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options, value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'open' : ''} ${className}`} 
      ref={containerRef}
    >
      <button 
        type="button"
        className="custom-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || value}</span>
        <span className="arrow"></span>
      </button>
      <div className="custom-select-options">
        {options.map((option) => (
          <div 
            key={option.value} 
            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
