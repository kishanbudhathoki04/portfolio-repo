export default function About({ profileData }) {
  const philosophies = profileData?.core_philosophies || [
    'Break it in development so customers love it in production.',
    'Automation saves time; manual exploration saves products.'
  ];

  const specializations = profileData?.specialization || [
    'Manual QA Audits', 'REST API Testing', 'Regressions', 'Usability Auditing'
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 1 — Profile Introduction
          ═══════════════════════════════════════════ */}
      <section className="profile-intro-section" id="about">
        <div className="section-container">
          <h2 className="section-title">About Me</h2><br></br>
          <div className="profile-intro-card glass-card">

            {/* Left: Photo + identity */}
            <div className="profile-intro-identity">
              <div className="profile-avatar-wrapper">
                <img
                  src={profileData?.photo || '/avatar.jpg'}
                  alt={profileData?.name || 'Kishan Budhathoki'}
                  className="profile-avatar-img"
                />
                <span
                  className="profile-avatar-online"
                  title={profileData?.meta?.available !== false ? "Available for work" : "Currently Unavailable"}
                  style={{ background: profileData?.meta?.available !== false ? 'var(--accent-green)' : '#f44336' }}
                />
              </div>
              <h2 className="profile-name">{profileData?.name || 'Kishan Budhathoki'}</h2>
              <p className="profile-title">{profileData?.title || 'Quality Assurance Engineer'}</p>

              <div className="profile-meta-pills">
                <span className="meta-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {profileData?.years_experience || '4.5'}y experience
                </span>
                <span className="meta-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {profileData?.location || 'On Site'}
                </span>
                <span className={`meta-pill ${profileData?.meta?.available !== false ? 'meta-pill-green' : 'meta-pill-red'}`}>
                  {profileData?.meta?.available !== false && <span className="pill-dot" />}
                  {profileData?.meta?.available !== false ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="profile-intro-divider" />

            {/* Right: Bio + specializations */}
            <div className="profile-intro-bio">
              <div className="profile-intro-bio-header">

                <div className="badge">
                  <span className="badge-icon">⚡</span> Currently at {profileData?.current_employer || 'Synthbit Technology'}
                </div>

              </div>

              <p className="profile-bio-text">
                {profileData?.bio_summary ||
                  'I am a Quality Assurance Engineer specializing in manual testing, user experience integrity, and API automation. My goal is to ensure stable and bug-free software deliveries.'}
              </p>

              <div className="profile-specializations">
                <span className="spec-label">Specializations</span>
                <div className="spec-tags">
                  {specializations.map((spec, idx) => (
                    <span key={idx} className="spec-tag">{spec}</span>
                  ))}
                </div>
              </div>

              <div className="profile-contact-row">
                <span className="contact-pref-label">Preferred Contact:</span>
                <span className="contact-pref-val">
                  {profileData?.meta?.preferred_communication || 'Logged via issue ticket'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — QA Philosophy
          ═══════════════════════════════════════════ */}
      <section className="philosophy-section" id="philosophy">
        <div className="section-container">
          <h2 className="section-title">The QA Philosophy</h2>

          <div className="philosophy-layout">

            {/* Left: Narrative + Company badge */}
            <div className="philosophy-narrative">
              <h3>Why Quality Assurance?</h3>
              <p>
                Developers build the dreams; QA testing ensures they don't turn into nightmares.
                Software doesn't work by accident - it works because it has been tested under
                boundary conditions, subjected to stress, and pushed past its limits.
              </p>
              <p>
                As a QA professional, my mission is to guard the user experience. By finding
                errors early in the lifecycle, I help optimize performance, prevent regressions,
                and secure API integrity across every release.
              </p>

              <div className="company-badge">
                <div className="company-logo">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="company-info">
                  <h4>Currently at {profileData?.current_employer || 'Synthbit Technology'}</h4>
                  <p>Conducting end-to-end testing cycles and managing API verification tests.</p>
                </div>
              </div>
            </div>

            {/* Right: Philosophy cards */}
            <div className="philosophy-cards">
              <div className="glass-card phil-card">    
                <h1>Manual Auditing</h1>
                <p>{philosophies[0] || 'Critical human-centric checks. Exploratory, boundary, usability, and visual regression testing to capture nuances.'}</p>
              </div>
              <div className="glass-card phil-card">
                <h1>API Auditing</h1>
                <p>{philosophies[1] || 'Testing microservices for reliability. Validating schemas, payloads, and response headers.'}</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
