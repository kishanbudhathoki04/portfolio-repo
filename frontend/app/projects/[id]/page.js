import ClientProjectDetailPage from './ClientProjectDetailPage';

export async function generateStaticParams() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${backendUrl}/api/projects`);
    if (!res.ok) return [];
    
    const projects = await res.json();
    return projects.map((p) => ({
      id: String(p.id)
    }));
  } catch (err) {
    return [];
  }
}

export default async function ProjectDetailPage({ params }) {
  const { id } = params;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  let profileData = null;
  let project = null;

  try {
    const [profileRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`, { next: { revalidate: 3600 } }),
      fetch(`${backendUrl}/api/projects`, { next: { revalidate: 3600 } })
    ]);

    profileData = profileRes.ok ? await profileRes.json() : null;
    
    if (projRes.ok) {
      const projectsData = await projRes.json();
      const found = projectsData.find((p) => String(p.id) === String(id));
      if (found) {
        project = {
          ...found,
          hasPhoto: found.hasPhoto || !!found.photo, // Just in case cache is outdated
          photo: undefined
        };
      }
    }
  } catch (err) {
    console.warn('[CMS] Could not reach backend API from server for project details.', err.message);
  }

  return (
    <ClientProjectDetailPage 
      profileData={profileData} 
      project={project} 
    />
  );
}
