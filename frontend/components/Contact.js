"use client";

import { useState } from 'react';
import CustomSelect from './ui/CustomSelect';

export default function Contact() {
  const [reporter, setReporter] = useState('');
  const [email, setEmail] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [type, setType] = useState('Consultation');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const severityOptions = [
    { value: 'Low', label: 'Low (General Inquiry)' },
    { value: 'Medium', label: 'Medium (Collaboration Discussion)' },
    { value: 'High', label: 'High (Job Offer / Hiring Contract)' },
    { value: 'Critical', label: 'Critical (Immediate QA Audit Needed)' }
  ];

  const typeOptions = [
    { value: 'Consultation', label: 'Request Consultation' },
    { value: 'Hiring', label: 'Direct Hire / Contract' },
    { value: 'Feedback', label: 'Feedback / Hello' }
  ];

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const randomId = `SB-QA-${Math.floor(Math.random() * 8999 + 1000)}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter,
          email,
          severity,
          type,
          summary,
          description,
          ticketId: randomId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketId(randomId);
        setIsSubmitted(true);
      } else {
        alert('Failed to send message: ' + (data.message || 'Unknown error. Please ensure SMTP is configured.'));
      }
    } catch (err) {
      alert('Network error. Could not send the message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReporter('');
    setEmail('');
    setSeverity('Low');
    setType('Consultation');
    setSummary('');
    setDescription('');
    setTicketId('');
    setIsSubmitted(false);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <h2 className="section-title">Submit a Ticket (Contact Me)</h2>
        <p className="section-desc">Have a project that needs a QA expert, or want to collaborate? Create a "Ticket" below to initiate a diagnostic trace.</p>
        
        <div className="contact-card glass-card">
          <div className="form-header">
            <span>Ticket: NEW_COLLABORATION_REQ</span>
            <span className="form-status">STATUS: {isSubmitted ? 'SUBMITTED' : 'DRAFT'}</span>
          </div>

          <form onSubmit={handleSubmit} className="ticket-form" style={{ display: isSubmitted ? 'none' : 'flex' }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ticket-reporter">Reporter Name *</label>
                <input 
                  type="text" 
                  id="ticket-reporter" 
                  placeholder="Your Name" 
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-email">Reporter Email *</label>
                <input 
                  type="email" 
                  id="ticket-email" 
                  placeholder="email@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ticket-severity">Severity Level</label>
                <CustomSelect 
                  options={severityOptions} 
                  value={severity} 
                  onChange={setSeverity} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-type">Issue Type</label>
                <CustomSelect 
                  options={typeOptions} 
                  value={type} 
                  onChange={setType} 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ticket-summary">Issue Summary *</label>
              <input 
                type="text" 
                id="ticket-summary" 
                placeholder="Brief summary of your inquiry" 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="ticket-description">Steps to Reproduce (Inquiry details) *</label>
              <textarea 
                id="ticket-description" 
                rows="5" 
                placeholder="Detailed description of what you'd like to collaborate on..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
              {isLoading ? 'Transmitting Ticket...' : 'Submit Ticket'}
            </button>
          </form>

          {/* Success Overlay Card */}
          <div className={`form-success-overlay ${isSubmitted ? 'active' : ''}`}>
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h3>Ticket Successfully Logged!</h3>
              <p>Ticket ID: <span id="success-ticket-id">{ticketId}</span></p>
              <p>I have received your inquiry trace. I'll get back to you shortly.</p>
              <button className="btn btn-secondary-small" onClick={handleReset}>Log Another Ticket</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
