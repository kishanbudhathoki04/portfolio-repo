export default function SystemTicker() {
  const metrics = [
    { label: "SYS_STATUS", value: "HEALTHY" },
    { label: "TEST_COVERAGE", value: "95.8%" },
    { label: "SYNTHBIT_UPTIME", value: "99.99%" },
    { label: "AVG_API_LATENCY", value: "42ms" },
    { label: "JIRA_TICKETS_CLOSED", value: "340+" },
    { label: "AUTOMATION_SUITES", value: "PASSED" },
    { label: "BUILD_HEALTH", value: "STABLE" }
  ];

  const tickerItems = [...metrics, ...metrics];

  return (
    <div className="ticker-container">
      <div className="ticker-scroll">
        {tickerItems.map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span className="ticker-dot"></span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: '700' }}>{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
