import ClientHome from './ClientHome';
import { redirect } from 'next/navigation';

export default async function Home() {
  if (process.env.APP_MODE === 'cms') {
    redirect('/admin');
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  let profileData = null;
  let skillsData = null;
  let expData = null;
  let projectsData = [];

  try {
    const [profileRes, skillsRes, expRes, projRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile?include_details=true`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/skills?include_details=true`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/experience`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/projects`, { cache: 'no-store' }),
    ]);

    profileData = profileRes.ok ? await profileRes.json() : null;
    skillsData = skillsRes.ok ? await skillsRes.json() : null;
    expData = expRes.ok ? await expRes.json() : null;
    projectsData = projRes.ok ? await projRes.json() : [];

    // Strip photo base64 strings to reduce Next.js HTML serialization payload size
    if (profileData && profileData.photo) {
      profileData.hasPhoto = true;
      delete profileData.photo;
    }

    if (projectsData && projectsData.length > 0) {
      projectsData = projectsData.map(p => {
        if (p.photo) {
          return { ...p, hasPhoto: true, photo: undefined };
        }
        return p;
      });
    }

    if (expData && expData.length === 0) {
      expData = null; // matching original logic
    }
  } catch (err) {
    console.warn('[CMS] Could not reach backend API from server.', err.message);
  }

  return (
    <ClientHome
      profileData={profileData}
      skillsData={skillsData}
      expData={expData}
      projectsData={projectsData}
    />
  );
}
