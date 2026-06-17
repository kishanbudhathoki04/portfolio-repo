import ClientHome from './ClientHome';
import { redirect } from 'next/navigation';

// ISR: Vercel caches the rendered page for 60s, then regenerates in background.
// CMS updates are visible within ~60 seconds. Public visitors always get fast cached HTML.
export const revalidate = 60;

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
      fetch(`${backendUrl}/api/profile?include_details=true`),
      fetch(`${backendUrl}/api/skills?include_details=true`),
      fetch(`${backendUrl}/api/experience`),
      fetch(`${backendUrl}/api/projects`),
    ]);

    profileData = profileRes.ok ? await profileRes.json() : null;
    skillsData = skillsRes.ok ? await skillsRes.json() : null;
    expData = expRes.ok ? await expRes.json() : null;
    projectsData = projRes.ok ? await projRes.json() : [];

    // (Legacy photo base64 stripping removed because photos are now fast Cloudinary URLs)

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
