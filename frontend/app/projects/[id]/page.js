import ClientProjectDetailPage from './ClientProjectDetailPage';

// Always fetch fresh data — never pre-bake static project pages
export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

  let profileData = null;
  let project = null;

  try {
    const [profileRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/projects`, { cache: 'no-store' })
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
