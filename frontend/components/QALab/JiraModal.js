"use client";

export default function JiraModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="jira-modal active">
      <div className="jira-modal-header">
        <span className="jira-logo">Jira Ticket</span>
        <button className="jira-close" onClick={onClose}>&times;</button>
      </div>
      <div className="jira-modal-body">
        <div className="jira-field">
          <span className="field-label">Issue Key:</span>
          <strong className="field-val" style={{ fontFamily: 'var(--font-mono)' }}>{ticket.key}</strong>
        </div>
        <div className="jira-field">
          <span className="field-label">Summary:</span>
          <span className="field-val">{ticket.summary}</span>
        </div>
        <div className="jira-field">
          <span className="field-label">Type:</span>
          <span className="field-val badge-jira-type">BUG</span>
        </div>
        <div className="jira-field">
          <span className="field-label">Severity:</span>
          <span
            className="field-val"
            style={{
              color: ticket.severity === 'High' ? 'var(--accent-red)' : (ticket.severity === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-teal)')
            }}
          >
            {ticket.severity}
          </span>
        </div>
        <div className="jira-field">
          <span className="field-label">Steps to Reproduce:</span>
          <pre className="field-paragraph" style={{ whiteSpace: 'pre-wrap' }}>{ticket.reproduce}</pre>
        </div>
        <div className="jira-field">
          <span className="field-label">Status:</span>
          <span className="field-val badge-status">BACKLOG (KISHAN)</span>
        </div>
      </div>
    </div>
  );
}
