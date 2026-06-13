"use client";

import { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';

export default function SchemaInspector() {
  const [template, setTemplate] = useState('user');
  const [payloadText, setPayloadText] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const templates = {
    user: {
      label: 'User Profile Schema',
      schema: {
        type: 'object',
        properties: {
          id: 'number',
          name: 'string',
          email: 'string',
          roles: 'array'
        },
        required: ['id', 'name', 'email']
      },
      defaultPayload: {
        id: 104,
        name: "Devon Lane",
        email: "devon@synthbit.io",
        roles: ["QA_Lead", "Engineer"]
      }
    },
    metrics: {
      label: 'Server Metric Schema',
      schema: {
        type: 'object',
        properties: {
          server_id: 'string',
          cpu_load: 'number',
          active_connections: 'number',
          status: 'string'
        },
        required: ['server_id', 'cpu_load', 'status']
      },
      defaultPayload: {
        server_id: "synthbit-node-prod-02",
        cpu_load: 42.8,
        active_connections: 1240,
        status: "healthy"
      }
    }
  };

  const templateOptions = [
    { value: 'user', label: 'User Profile Schema' },
    { value: 'metrics', label: 'Server Metric Schema' }
  ];

  // Set default text when template changes
  useEffect(() => {
    setPayloadText(JSON.stringify(templates[template].defaultPayload, null, 2));
    setValidationResult(null);
  }, [template]);

  const validateSchema = () => {
    try {
      const parsed = JSON.parse(payloadText);
      const activeSchema = templates[template].schema;
      const errors = [];

      // 1. Check object type
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        errors.push({ type: 'SCHEMA', msg: 'Expected JSON root to be an object.' });
      } else {
        // 2. Check required fields
        activeSchema.required.forEach(field => {
          if (!(field in parsed)) {
            errors.push({ type: 'REQUIRED', msg: `Required property "${field}" is missing.` });
          }
        });

        // 3. Check property types
        Object.keys(parsed).forEach(key => {
          if (key in activeSchema.properties) {
            const expectedType = activeSchema.properties[key];
            const val = parsed[key];
            let isValidType = true;

            if (expectedType === 'array') {
              isValidType = Array.isArray(val);
            } else if (expectedType === 'number') {
              isValidType = typeof val === 'number' && !isNaN(val);
            } else {
              isValidType = typeof val === expectedType;
            }

            if (!isValidType) {
              errors.push({ 
                type: 'TYPE', 
                msg: `Property "${key}" expected type "${expectedType}", received "${Array.isArray(val) ? 'array' : typeof val}".` 
              });
            }
          }
        });
      }

      if (errors.length === 0) {
        setValidationResult({
          valid: true,
          msg: '✓ SUCCESS: Payload structure conforms perfectly to JSON schema specifications.'
        });
      } else {
        setValidationResult({
          valid: false,
          errors: errors
        });
      }

    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [{ type: 'SYNTAX', msg: `✗ Invalid JSON format: ${err.message}` }]
      });
    }
  };

  const activeSchema = templates[template].schema;

  return (
    <div className="api-client">
      <div className="api-client-header">
        <span className="active-tab">JSON Schema Verification Suite</span>
        <div style={{ width: '220px' }}>
          <CustomSelect 
            options={templateOptions} 
            value={template} 
            onChange={setTemplate} 
          />
        </div>
      </div>

      <div className="inspector-layout">
        {/* Left: Schema definition display */}
        <div className="inspector-pane">
          <div className="inspector-pane-header">
            <span>Defined Schema rules</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>read-only</span>
          </div>
          <pre className="response-body" style={{ background: '#020202', margin: 0, height: '100%' }}>
            <code style={{ color: 'var(--accent-teal)' }}>
              {JSON.stringify(activeSchema, null, 2)}
            </code>
          </pre>
        </div>

        {/* Right: Interactive payload editor */}
        <div className="inspector-pane">
          <div className="inspector-pane-header">
            <span>Editable Payload JSON</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>edit fields below to test validation</span>
          </div>
          <textarea
            className="inspector-editor"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            spellCheck="false"
          />
        </div>
      </div>

      <button className="btn btn-primary validate-btn" onClick={validateSchema}>
        Validate Payload Structure
      </button>

      {/* Validation Result Box */}
      {validationResult && (
        <div 
          className="api-response-wrapper" 
          style={{ 
            marginTop: '24px', 
            border: validationResult.valid ? '1px solid rgba(176, 194, 157, 0.3)' : '1px solid rgba(200, 90, 90, 0.3)'
          }}
        >
          <div className="response-header">
            <span>Validation Result</span>
            <span 
              style={{ 
                color: validationResult.valid ? 'var(--accent-green)' : 'var(--accent-red)',
                fontWeight: '700' 
              }}
            >
              {validationResult.valid ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <div className="inspector-results">
            {validationResult.valid ? (
              <div style={{ color: 'var(--accent-green)' }}>{validationResult.msg}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {validationResult.errors.map((err, idx) => (
                  <div key={idx} style={{ color: 'var(--accent-red)' }}>
                    <strong>[{err.type} ERROR]</strong> {err.msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
