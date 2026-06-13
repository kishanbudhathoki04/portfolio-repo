"use client";

import { useState } from 'react';
import ApiClient from './ApiClient';
import BugHunter from './BugHunter';
import SchemaInspector from './SchemaInspector';

export default function QALab({ setSystemStatus, setStatusClass }) {
  const [activeTab, setActiveTab] = useState('api-tester');

  return (
    <section className="interactive-section" id="interactive-lab">
      <div className="section-container">
        <h2 className="section-title">Interactive QA Sandbox</h2>
        <p className="section-desc">Experience my skills firsthand. Interact with the live API Sandbox, audit the UI simulation card, or test object schema rules.</p>
        
        <div className="tabs-container">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'api-tester' ? 'active' : ''}`}
              onClick={() => setActiveTab('api-tester')}
            >
              <span></span> API Client Simulator
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bug-hunter' ? 'active' : ''}`}
              onClick={() => setActiveTab('bug-hunter')}
            >
              <span></span> UI Bug Hunting Game
            </button>
            <button 
              className={`tab-btn ${activeTab === 'schema-inspector' ? 'active' : ''}`}
              onClick={() => setActiveTab('schema-inspector')}
            >
              <span></span> Schema Inspector
            </button>
          </div>

          <div className="tab-content-wrapper">
            {/* Tab 1: API Tester */}
            <div className={`tab-content ${activeTab === 'api-tester' ? 'active' : ''}`}>
              {activeTab === 'api-tester' && <ApiClient />}
            </div>

            {/* Tab 2: Bug Hunter */}
            <div className={`tab-content ${activeTab === 'bug-hunter' ? 'active' : ''}`}>
              {activeTab === 'bug-hunter' && (
                <BugHunter setSystemStatus={setSystemStatus} setStatusClass={setStatusClass} />
              )}
            </div>

            {/* Tab 3: Schema Inspector */}
            <div className={`tab-content ${activeTab === 'schema-inspector' ? 'active' : ''}`}>
              {activeTab === 'schema-inspector' && <SchemaInspector />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
