export default function Skills({ skillsData }) {
  const manualSkills = skillsData?.raw?.manual_testing || [
    { name: 'Functional & Regression Testing', level: '95%' },
    { name: 'Boundary Value Analysis (BVA)', level: '90%' },
    { name: 'Exploratory & Sanity Audits', level: '92%' },
    { name: 'Cross-Browser & Visual Testing', level: '88%' },
    { name: 'Bug Logging & Documentation', level: '98%' }
  ];

  const apiSkills = skillsData?.raw?.api_testing || [
    { name: 'RESTful API Integration Checks', level: '95%' },
    { name: 'Postman & Newman Scripting', level: '90%' },
    { name: 'JSON Schema & Status Code Audits', level: '95%' },
    { name: 'Auth Protocols (OAuth2, JWT, API Keys)', level: '85%' },
    { name: 'Response Time & Load Benchmarks', level: '80%' }
  ];

  const techBadges = skillsData?.raw?.tools_and_ecosystem || [
    'Postman', 'Swagger / OpenAPI', 'Jira', 'Confluence', 'GitHub',
    'Chrome DevTools', 'Lighthouse', 'REST Assured', 'Charles Proxy', 'GraphQL'
  ];

  return (
    <section className="skills-section" id="skills">
      <div className="section-container">
        <h2 className="section-title">Technical Skills</h2>
        <div className="skills-grid">
          {/* Manual Testing Card */}
          <div className="glass-card skill-category-card">
            <div className="skill-category-header">
              <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <h3>Manual Testing & Strategy</h3>
            </div>
            <ul className="skills-list">
              {manualSkills.map((skill, idx) => (
                <li key={idx}>
                  <div className="skill-info">
                    <span>{skill.name}</span>
                    <span>{skill.level}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: skill.level }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* API Testing Card */}
          <div className="glass-card skill-category-card">
            <div className="skill-category-header">
              <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <h3>API Testing & Protocols</h3>
            </div>
            <ul className="skills-list">
              {apiSkills.map((skill, idx) => (
                <li key={idx}>
                  <div className="skill-info">
                    <span>{skill.name}</span>
                    <span>{skill.level}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: skill.level }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Badges */}
        <div className="tech-badge-container">
          {techBadges.map((badge, idx) => (
            <div key={idx} className="tech-badge">{badge}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
