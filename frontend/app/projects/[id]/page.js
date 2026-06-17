"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [profileData, setProfileData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState("System Normal");
  const statusClass = systemStatus === "System Normal" ? "status-ok" : "status-error";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, projRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/projects')
        ]);

        if (profileRes.ok) setProfileData(await profileRes.json());
        if (projRes.ok) {
          const projectsData = await projRes.json();
          const found = projectsData.find(p => p.id === id || p.id === parseInt(id));
          setProject(found);
        }
      } catch (err) {
        console.warn('Could not reach backend API.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAll();
    }
  }, [id]);

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
          </div>

          {loading ? (
             <div className="empty-projects-state"><p>Loading project details...</p></div>
          ) : !project ? (
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
                    width={800}
                    height={600}
                    style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }} 
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
