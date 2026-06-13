"use client";

import { useState, useEffect, useRef } from 'react';

export default function Hero({ systemStatus, statusClass, setSystemStatus, setStatusClass, profileData }) {
  const [typedText, setTypedText] = useState("");
  const [consoleLines, setConsoleLines] = useState([
    { text: 'npm run test:suite', type: 'command' },
    { text: 'Initialising Kishan Automated Test Runners...', type: 'dim' },
    { text: '[INFO] Scanning endpoints on environment: \'production\'', type: 'info' },
    { text: '✓ GET /api/v1/health - Status: 200 OK (45ms)', type: 'success' },
    { text: '✓ GET /api/v1/features - Status: 200 OK (82ms)', type: 'success' },
    { text: '✓ POST /api/v1/auth - Status: 201 Created (120ms)', type: 'success' },
    { text: '[INFO] Initiating visual manual sanity check...', type: 'info' },
    { text: '✓ Viewport responsiveness audit passed.', type: 'success' },
    { text: '✓ Accessibility standards: WCAG AAA compliant.', type: 'success' },
    { text: 'Test Summary: 5 passed, 0 failed. Quality: 100%', type: 'highlight' }
  ]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const consoleRef = useRef(null);

  // Typewriter parameters
  const words = profileData?.specialization && profileData.specialization.length > 0
    ? profileData.specialization.map(s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_'))
    : ['manual_testing', 'api_verification', 'bug_hunting', 'regression_checks', 'quality_advocacy'];
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);

  useEffect(() => {
    let timer;
    const typeEffect = () => {
      const currentWord = words[wordIndex.current];
      if (isDeleting.current) {
        setTypedText(currentWord.substring(0, charIndex.current - 1));
        charIndex.current--;
      } else {
        setTypedText(currentWord.substring(0, charIndex.current + 1));
        charIndex.current++;
      }

      let speed = isDeleting.current ? 50 : 100;

      if (!isDeleting.current && charIndex.current === currentWord.length) {
        isDeleting.current = true;
        speed = 2000;
      } else if (isDeleting.current && charIndex.current === 0) {
        isDeleting.current = false;
        wordIndex.current = (wordIndex.current + 1) % words.length;
        speed = 500;
      }

      timer = setTimeout(typeEffect, speed);
    };

    timer = setTimeout(typeEffect, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Diagnostics Execution
  const runDiagnostics = () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setStatusClass('checking');
    setSystemStatus('Running Diagnostics...');
    setConsoleLines([]);

    const diagnosticLines = [
      { text: 'npm run test:suite', type: 'command' },
      { text: 'Initialising Kishan Diagnostics...', type: 'dim' },
      { text: '[INFO] Scanning active endpoints on production...', type: 'info' },
      { text: '✓ GET /api/profile - Status: 200 OK (32ms)', type: 'success' },
      { text: '✓ GET /api/skills - Status: 200 OK (48ms)', type: 'success' },
      { text: '✓ GET /api/kishan - Status: 200 OK (42ms)', type: 'success' },
      { text: '[INFO] Checking REST schema structure validations...', type: 'info' },
      { text: '✓ 14 JSON models audited - 0 schema issues.', type: 'success' },
      { text: '[INFO] Performing visual UI layout audits...', type: 'info' },
      { text: '✓ Viewport responsiveness audits passed.', type: 'success' },
      { text: '✓ Contrast & accessibility AAA verification passed.', type: 'success' },
      { text: 'Test Summary: 14 passed, 0 failed. Quality: 100%', type: 'highlight' }
    ];

    let lineIndex = 0;
    const printNextLine = () => {
      if (lineIndex < diagnosticLines.length) {
        const line = diagnosticLines[lineIndex];
        setConsoleLines(prev => [...prev, line]);
        lineIndex++;

        // Auto scroll console to bottom
        if (consoleRef.current) {
          setTimeout(() => {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
          }, 50);
        }

        const delay = line.type === 'command' ? 800 : Math.random() * 250 + 150;
        setTimeout(printNextLine, delay);
      } else {
        setIsDiagnosing(false);
        setStatusClass('success');
        setSystemStatus('System Healthy');
      }
    };

    setTimeout(printNextLine, 300);
  };

  return (
    <section className="hero-section" id="hero">
      <div style={{ position: 'absolute', top: '76px', right: 'var(--side-pad)', zIndex: 10 }}>
        <div className={`status-indicator ${statusClass}`}>
          <span className="status-dot"></span>
          <span className="status-text">{systemStatus}</span>
        </div>
      </div>
      <div className="hero-container">
        <div className="hero-content">
          
          <h1>Breaking Code To Make It <span className="gradient-text">Unbreakable</span>.</h1>
          <p className="hero-lead">
            Quality isn't an afterthought; it's a core requirement. I specialize in software testing from deep API layers to the front-end user experience ensuring that releases are stable and secure. I bridge the gap between rapid delivery and absolute reliability.
          </p>

          <div className="typed-container">
            <span className="typed-prefix">focus_area: </span>
            <span className="typed-text">{typedText}</span><span className="typed-cursor">|</span>
          </div>

          <div className="hero-actions">
            <a href="#interactive-lab" className="btn btn-primary">Enter QA Lab</a>
            <button
              className="btn btn-secondary"
              onClick={runDiagnostics}
              disabled={isDiagnosing}
              style={{ opacity: isDiagnosing ? 0.6 : 1 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Run Diagnostic
            </button>
          </div>
        </div>

        {/* Console Box visual */}
        <div className="hero-visual">
          <div className="terminal-card">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-title">Kishan-test-suite.sh</div>
            </div>
            <div className="terminal-body" ref={consoleRef} id="terminal-console">
              {consoleLines.map((line, idx) => (
                <div key={idx} className="terminal-line">
                  {line.type === 'command' && (
                    <>
                      <span className="term-prompt">$</span> {line.text}
                    </>
                  )}
                  {line.type === 'dim' && <span className="term-dim">{line.text}</span>}
                  {line.type === 'info' && <span className="term-info">{line.text}</span>}
                  {line.type === 'success' && <span className="term-success">{line.text}</span>}
                  {line.type === 'highlight' && <span className="term-highlight">{line.text}</span>}
                </div>
              ))}
              <div className="terminal-line">
                <span className="term-prompt">$</span> <span className="term-cursor">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
