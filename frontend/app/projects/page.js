import ClientProjectsPage from './ClientProjectsPage';

// Always fetch fresh data — never serve a stale cached build from Vercel
export const dynamic = 'force-dynamic';

export default async function ProjectsServerPage() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  let profileData = null;
  let projectsData = [];

  try {
    const [profileRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/projects`, { cache: 'no-store' })
    ]);

    profileData = profileRes.ok ? await profileRes.json() : null;
    if (projRes.ok) {
      projectsData = await projRes.json();
    }
  } catch (err) {
    console.warn('[CMS] Could not reach backend API from server for projects page.', err.message);
  }

  return (
    <ClientProjectsPage 
      profileData={profileData} 
      projectsData={projectsData} 
    />
  );
}
