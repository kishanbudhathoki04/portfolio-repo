import Link from 'next/link';

export default function Projects({ projectsData }) {
  const featuredProjects = (projectsData || []).filter(p => p.featured).slice(0, 4);

  return (
    <section className="projects-section" id="projects">
      <div className="section-container">
        <div className="projects-header">
          <h2 className="section-title">Project Showcase</h2>
          <Link href="/projects" className="btn-view-all">
            View All Projects <span>→</span>
          </Link>
        </div>
        
        {featuredProjects.length === 0 ? (
          <div className="empty-projects-state">
            <p>No featured projects currently available.</p>
          </div>
        ) : (
          <div className="projects-carousel">
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card">
                {project.photo && (
                  <div className="project-img-wrapper">
                    <img src={project.photo} alt={project.name} className="project-img" />
                  </div>
                )}
                <div className="project-content">
                  <h3 className="project-title">{project.name}</h3>
                  <p className="project-desc project-desc-truncated">{project.description}</p>
                  <Link href={`/projects/${project.id}`} className="btn-learn-more">
                    Learn More <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
