export default function Experience({ experienceData }) {
  const experiences = experienceData && experienceData.length > 0 ? experienceData : [
    {
      id: 'default-1',
      date: '2024 - Present',
      role: 'QA Engineer',
      company: 'Synthbit Technology',
      description: 'Responsible for establishing QA verification processes, leading sanity checks, defining edge-cases, and managing core regressions. Built manual test suites comprising hundreds of cases and deployed local API validation suites.',
      bullets: [
        'Designed automated test configurations in Postman for regular endpoint checks, saving hours of manual sanity loops.',
        'Created boundary test strategies for critical API parameter payloads, catching dozens of silent schema mismatches.',
        'Collaborated with developers to streamline bug triage meetings and reduce cycle time for critical defects.'
      ]
    },
    {
      id: 'default-2',
      date: '2022 - 2024',
      role: 'Junior QA Analyst',
      company: 'TechSolutions Corp',
      description: 'Conducted rigorous manual black-box, smoke, regression, and cross-browser visual audits across enterprise software suites. Documented clear, actionable JIRA bug tickets and verified bug fixes.',
      bullets: [
        'Drafted and executed 400+ detailed functional test scenarios.',
        'Conducted visual regression testing, ensuring consistency across iOS, Android, and web displays.',
        'Performed REST API testing manually, confirming status codes, responses, headers, and performance rates.'
      ]
    }
  ];

  return (
    <section className="experience-section" id="experience">
      <div className="section-container">
        <h2 className="section-title">Professional Pipeline</h2>
        <div className="timeline">
          {experiences.map((exp) => (
            <div key={exp.id || exp.company} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-card">
                <span className="timeline-date">{exp.date}</span>
                <h3>{exp.role}</h3>
                <h4 className="company-text">{exp.company}</h4>
                <p>{exp.description}</p>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="timeline-bullets">
                    {exp.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
