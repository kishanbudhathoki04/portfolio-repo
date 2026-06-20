"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ClientProjectDetailPage({ profileData, project }) {
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
            <Link href="/projects" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>←</span> Back to All Projects
            </Link>
          </div>

          {!project ? (
            <div className="empty-projects-state">
              <p>Project not found.</p>
            </div>
          ) : (
            <div className="project-detail glass-card" style={{ padding: '40px', borderRadius: '16px' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--text-main)', letterSpacing: '-0.02em', fontWeight: '800' }}>{project.name}</h1>
              
              {project.photo && (
                <div style={{ width: '100%', marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Image 
                    src={project.photo} 
                    alt={project.name || "Project photo"} 
                    width={1200}
                    height={800}
                    priority
                    style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }} 
                  />
                </div>
              )}
              
              <div className="project-full-desc" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', maxWidth: '800px', margin: '0 auto' }}>
                <p>{project.description}</p>
              </div>

              {project.featured && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                  <span className="meta-pill meta-pill-green" style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '0.9rem' }}>
                    ⭐ Featured Project
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
