"use client";

import { useState, useRef, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';

/**
 * FixedDropdown — a mini dropdown that uses position:fixed so it
 * always escapes any parent container (including CSS tables).
 */
function FixedDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Recalculate position each time it opens
  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current  && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        className="fixed-dropdown-trigger"
        onClick={handleOpen}
      >
        <span>{selected?.label}</span>
        <span className="arrow" style={{ marginLeft: 8 }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed-dropdown-panel"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            minWidth: Math.max(coords.width, 90),
            zIndex: 99999,
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              className={`fixed-dropdown-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function ApiClient() {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/profile');
  const [includeDetails, setIncludeDetails] = useState('false');
  const [activeTab, setActiveTab] = useState('params');
  const [status, setStatus] = useState('200 OK');
  const [time, setTime] = useState('0 ms');
  const [response, setResponse] = useState(`{
  "status": "Ready",
  "message": "Click SEND to query the API simulator endpoints."
}`);
  const [isCopying, setIsCopying] = useState(false);

  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' }
  ];

  const endpointOptions = [
    { value: '/profile', label: '/profile' },
    { value: '/skills', label: '/skills' },
    { value: '/kishan', label: '/kishan-status' }
  ];

  const includeDetailsOptions = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' }
  ];

  const triggerFetch = async () => {
    setStatus('PENDING');
    setTime('...');
    setResponse('// Handshaking with Next.js Serverless Backend, verifying endpoint schema...');

    const start = performance.now();
    try {
      const url = `/api${endpoint}?include_details=${includeDetails}`;
      const options = {
        method: method,
        headers: {
          'Authorization': 'Bearer kishan_qa_token_2026',
          'Content-Type': 'application/json'
        }
      };

      if (method === 'POST') {
        options.body = JSON.stringify({
          editor: "QA Sandbox",
          payload_type: "Handshake Check",
          scope: ["regression", "unit_test"]
        });
      }

      const res = await fetch(url, options);
      const json = await res.json();
      const end = performance.now();

      setStatus(res.status === 201 ? '201 Created' : `${res.status} OK`);
      setTime(`${Math.round(end - start)} ms`);
      setResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      const end = performance.now();
      setStatus('500 Internal Error');
      setTime(`${Math.round(end - start)} ms`);
      setResponse(JSON.stringify({
        error: "Network Exception",
        message: err.message
      }, null, 2));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response).then(() => {
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 1500);
    });
  };

  return (
    <div className="api-client">
      <div className="api-client-header">
        <div className="api-client-tabs">
          <span className="active-tab">REST Client (Connected to Next.js API Routes)</span>
        </div>
        <div className="api-client-actions">
          <span 
            className="status-badge" 
            style={{ 
              background: status === 'PENDING' ? '#e2a100' : (status.startsWith('50') ? 'var(--accent-red)' : 'var(--accent-green)') 
            }}
          >
            {status}
          </span>
          <span className="time-badge">{time}</span>
        </div>
      </div>

      <div className="api-input-row">
        {/* HTTP Method — native select for reliable sizing */}
        <select
          className="api-method-select"
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          {methodOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* URL bar */}
        <div className="api-url-bar">
          <span className="api-base-url">https://api.kishan.io/v1</span>
          <CustomSelect
            options={endpointOptions}
            value={endpoint}
            onChange={setEndpoint}
            className="api-select-endpoint"
          />
        </div>

        {/* Send */}
        <button className="btn-send" onClick={triggerFetch}>SEND</button>
      </div>

      <div className="api-panel">
        <div className="panel-tabs">
          <button 
            className={`panel-tab-btn ${activeTab === 'params' ? 'active' : ''}`}
            onClick={() => setActiveTab('params')}
          >
            Params
          </button>
          <button 
            className={`panel-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
        </div>
        <div className="panel-content">
          {activeTab === 'params' && (
            <div className="panel-pane active">
              <table className="params-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="text" className="table-input" value="include_details" readOnly /></td>
                    <td className="td-overflow-visible">
                      <FixedDropdown
                        options={includeDetailsOptions}
                        value={includeDetails}
                        onChange={setIncludeDetails}
                      />
                    </td>
                    <td>Include nested object values</td>
                  </tr>
                  <tr>
                    <td><input type="text" className="table-input" value="env" readOnly /></td>
                    <td><input type="text" className="table-input" value="production" readOnly /></td>
                    <td>Active target environment</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'headers' && (
            <div className="panel-pane active">
              <table className="params-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Authorization</code></td>
                    <td><code>Bearer kishan_qa_token_2026</code></td>
                  </tr>
                  <tr>
                    <td><code>Accept</code></td>
                    <td><code>application/json</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="api-response-wrapper">
        <div className="response-header">
          <span>Response Payload</span>
          <button className="btn-copy" onClick={copyToClipboard}>
            {isCopying ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        <pre className="response-body">
          <code id="api-response-code">{response}</code>
        </pre>
      </div>
    </div>
  );
}
