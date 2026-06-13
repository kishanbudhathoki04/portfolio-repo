"use client";

import { useState } from 'react';
import JiraModal from './JiraModal';

export default function BugHunter({ setSystemStatus, setStatusClass }) {
  const [foundBugs, setFoundBugs] = useState({
    logo: false,
    typo: false,
    logical: false
  });
  const [activeTicket, setActiveTicket] = useState(null);
  const [isJiraOpen, setIsJiraOpen] = useState(false);

  const bugTickets = {
    logo: {
      key: 'KS-BUG-101',
      summary: '[UI Layout] Dashboard logo overlays title text',
      severity: 'Medium',
      reproduce: '1. Load Dashboard Card.\n2. Observe task monitor SVG logo is pushed horizontally and overlaps title text.'
    },
    typo: {
      key: 'KS-BUG-102',
      summary: '[Typo] Metric details contain typo spelling "stablue"',
      severity: 'Low',
      reproduce: '1. Load Dashboard widget.\n2. View metric panel details.\n3. Observe indicator spelling: "100% stablue".'
    },
    logical: {
      key: 'KS-BUG-103',
      summary: '[UI Render] Scan button displays raw HTML tags in text string',
      severity: 'High',
      reproduce: '1. Locate Dashboard actions.\n2. Observe scan CTA button text displays raw XML tags: "<button> Run Quick Scan".'
    }
  };

  const handleBugClick = (bugKey) => {
    if (foundBugs[bugKey]) {
      // If already found, just re-open the ticket modal
      setActiveTicket(bugTickets[bugKey]);
      setIsJiraOpen(true);
      return;
    }

    const updatedBugs = { ...foundBugs, [bugKey]: true };
    setFoundBugs(updatedBugs);
    setActiveTicket(bugTickets[bugKey]);
    setIsJiraOpen(true);

    // Calculate score
    const score = Object.values(updatedBugs).filter(Boolean).length;
    if (score === 3) {
      setStatusClass('success');
      setSystemStatus('Audit Complete (3 Bugs Found)');
    }
  };

  const resetSandbox = () => {
    setFoundBugs({ logo: false, typo: false, logical: false });
    setIsJiraOpen(false);
    setActiveTicket(null);
    setStatusClass('');
    setSystemStatus('System Normal');
  };

  const bugCount = Object.values(foundBugs).filter(Boolean).length;

  return (
    <div className="bug-hunter-layout">
      <div className="bug-hunter-instructions">
        <h3>Audit this Dashboard Card</h3>
        <p>There are exactly <strong>3 visual/logical bugs</strong> injected into the mock user dashboard widget below. Can you click and report them all?</p>
        
        <div className="score-display">
          <span>Bugs Reported:</span>
          <span 
            className="score-number" 
            style={{ color: bugCount === 3 ? 'var(--accent-green)' : 'var(--accent-teal)' }}
          >
            {bugCount} / 3
          </span>
        </div>

        <button className="btn btn-secondary-small" onClick={resetSandbox}>Reset Sandbox</button>
      </div>

      <div className="bug-hunter-workspace">
        {/* Sandbox Widget */}
        <div className="sandbox-widget">
          <div className="widget-header">
            <div 
              className={`widget-logo bug-zone ${foundBugs.logo ? 'resolved' : ''}`} 
              style={{ position: foundBugs.logo ? 'static' : 'absolute', top: '10px', left: '30px' }}
              onClick={() => handleBugClick('logo')}
              title="Report Issue"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <span 
              className="widget-title" 
              style={{ paddingLeft: foundBugs.logo ? '0px' : '28px' }}
            >
              Kishan Task Monitor
            </span>
            <span className="widget-badge bg-active">Active</span>
          </div>
          
          <div className="widget-body">
            <div className="metric-row">
              <div className="metric-item">
                <span className="metric-label">Sanity Status</span>
                <span className="metric-value text-green">PASS</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">API Health</span>
                <span 
                  className={`metric-value bug-zone ${foundBugs.typo ? 'resolved text-green' : 'text-blue'}`}
                  onClick={() => handleBugClick('typo')}
                  title="Report Issue"
                >
                  {foundBugs.typo ? '100% stable' : '100% stablue'}
                </span>
              </div>
            </div>

            <div className="widget-chart-placeholder">
              <div className="bar-chart">
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
                <div className="bar" style={{ height: '55%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
              </div>
              <span className="chart-label">Server Load Trend (24h)</span>
            </div>

            <div className="widget-actions">
              <button 
                className={`widget-action-btn bug-zone ${foundBugs.logical ? 'resolved' : ''}`}
                style={{ color: foundBugs.logical ? 'var(--accent-teal)' : 'var(--text-dim)' }}
                onClick={() => handleBugClick('logical')}
                title="Report Issue"
              >
                {foundBugs.logical ? 'Run Quick Scan' : '<button> Run Quick Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Jira Ticket Modal */}
        <JiraModal 
          isOpen={isJiraOpen} 
          onClose={() => setIsJiraOpen(false)} 
          ticket={activeTicket} 
        />
      </div>
    </div>
  );
}
