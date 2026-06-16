import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://kishanbudhathoki.com.np'),
  title: 'Kishan Budhathoki | Software Quality Assurance',
  description: 'QA Engineer specializing in manual testing, API testing, Automation testing and software quality assurance to ensure reliable and bug-free applications.',
  keywords: ['QA', 'Quality Assurance', 'Manual Testing', 'API Automation', 'Kishan Budhathoki', 'Software Testing', 'Nepal'],
  openGraph: {
    title: 'Kishan Budhathoki | Software Quality Assurance',
    description: 'Expert in manual auditing, API testing, and ensuring stable software deliveries.',
    url: 'https://kishanbudhathoki.com.np',
    siteName: 'Kishan Budhathoki Portfolio',
    images: [
      {
        url: '/uploads/1781340323600-Kishan_Png.png',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kishan Budhathoki | QA Engineer',
    description: 'Expert in manual auditing, API testing, and ensuring stable software deliveries.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="glow-bg">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}