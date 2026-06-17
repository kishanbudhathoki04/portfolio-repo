import ClientProjectDetailPage from './ClientProjectDetailPage';

export const revalidate = 60;

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

  let profileData = null;
  let project = null;

  try {
    const [profileRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`),
      fetch(`${backendUrl}/api/projects`)
    ]);

    profileData = profileRes.ok ? await profileRes.json() : null;
    
    if (projRes.ok) {
      const projectsData = await projRes.json();
      project = projectsData.find((p) => String(p.id) === String(id));
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
