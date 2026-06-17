"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ClientProjectsPage({ profileData, projectsData }) {
  const [systemStatus, setSystemStatus] = useState("System Normal");
  const statusClass = systemStatus === "System Normal" ? "status-ok" : "status-error";

  return (
    <>
      <Navbar 
        systemStatus={systemStatus} 
        statusClass={statusClass} 
        profileData={profileData} 
      />

      <main style={{ minHeight: '100vh', paddingTop: '100px', background: 'var(--bg-primary)' }}>
        <section className="section-container">
          <div style={{ marginBottom: '40px' }}>
            <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>←</span> Back to Portfolio
            </Link>
            <h1 style={{ fontSize: '2.5rem', marginTop: '20px' }}>All Projects</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>A complete showcase of my QA auditing, test automation, and exploratory bugs.</p>
          </div>

          {projectsData.length === 0 ? (
            <div className="empty-projects-state">
              <p>No projects have been added to the database yet.</p>
            </div>
          ) : (
            <div className="projects-carousel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
              {projectsData.map((project) => (
                <div key={project.id} className="project-card glass-card">
                  {project.hasPhoto && (
                    <div className="project-img-wrapper" style={{ height: '220px' }}>
                      <Image src={`/api/project-photo?id=${project.id}`} alt={project.name || "Project photo"} width={500} height={300} className="project-img" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                  )}
                  <div className="project-content">
                    <h3 className="project-title">{project.name}</h3>
                    <p className="project-desc project-desc-truncated">{project.description}</p>
                    <Link href={`/projects/${project.id}`} className="btn-learn-more">
                      Learn More <span>→</span>
                    </Link>
                    {project.featured && (
                      <span className="meta-pill meta-pill-green" style={{ display: 'inline-block', marginTop: '16px' }}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
