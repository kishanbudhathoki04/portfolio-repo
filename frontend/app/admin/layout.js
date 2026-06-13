import { redirect } from 'next/navigation';

export default function AdminLayout({ children }) {
  // If deployed strictly as the public portfolio, block the CMS portal entirely
  if (process.env.APP_MODE === 'website') {
    redirect('/');
  }

  return <>{children}</>;
}
