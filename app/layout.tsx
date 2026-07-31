import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { SiteHeader } from '@/components/site/header';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: "AC In Delhi | Best AC Repair, Installation & Service in Dwarka Mor Delhi",

  description:
    "AC In Delhi provides fast doorstep AC repair, AC installation, AC gas refill, AC cleaning and maintenance service in Dwarka Mor, Uttam Nagar, Nawada and nearby Delhi areas. Book trusted AC technicians today.",

  keywords: [
    "AC service Dwarka Mor Delhi",
    "AC repair Dwarka Mor Delhi",
    "AC installation Dwarka Mor",
    "AC gas refill Dwarka Mor",
    "AC cleaning Dwarka Mor",
    "AC maintenance Dwarka Mor",
    "AC technician near me",
    "AC service near me",
    "split AC repair Delhi",
    "window AC repair Delhi",
    "AC repair Uttam Nagar",
    "AC service Nawada Delhi",
    "AC service Janakpuri",
    "AC service Dwarka Delhi",
    "best AC repair service Delhi"
  ],

  authors: [
    {
      name: "AC In Delhi"
    }
  ],

  creator: "AC In Delhi",
  publisher: "AC In Delhi",

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title:
      "AC In Delhi - Trusted AC Repair & Service in Dwarka Mor",

    description:
      "Professional doorstep AC repair, installation, gas refill and maintenance service in Dwarka Mor Delhi.",

    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "AC In Delhi | AC Repair Service Dwarka Mor",

    description:
      "Book reliable AC repair and installation service at your doorstep in Delhi.",
  },

  robots: {
    index: true,
    follow: true,
  },

  category: "AC Repair Service",
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AC In Delhi',
  description: 'Professional AC Installation, Repair & Maintenance at Your Doorstep in Delhi.',
  telephone: '+91-7814410991',
  email: 'acwallah95@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Dwarka Mor', addressRegion: 'Delhi', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: 28.6199, longitude: 77.0318 },
  areaServed: '10 KM radius of Dwarka Mor, Delhi',
  priceRange: '₹499 - ₹3400',
  openingHours: 'Mo-Su 08:00-20:00',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <AuthProvider>

          <main>{children}</main>
          <FloatingButtons />
        </AuthProvider>
      </body>
    </html>
  );
}
