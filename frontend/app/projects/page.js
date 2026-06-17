import ClientProjectsPage from './ClientProjectsPage';

export const revalidate = 60;

export default async function ProjectsServerPage() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  let profileData = null;
  let projectsData = [];

  try {
    const [profileRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`),
      fetch(`${backendUrl}/api/projects`)
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
