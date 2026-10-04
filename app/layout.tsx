import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Template from './template';
import { ToastProvider } from '@/components/ui/toast-provider';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oxygen Multifit Gym | Premium Fitness Bhawanipatna',
  description: 'Experience the elite fitness destination in Bhawanipatna, Odisha. State-of-the-art facilities, expert training, and premium gym experience.',
  keywords: ['Gym in Bhawanipatna', 'Oxygen Gym', 'Multifit Gym', 'Fitness center Odisha', 'Bodybuilding Bhawanipatna'],
  openGraph: {
    title: 'Oxygen Multifit Gym | Build Strength & Discipline',
    description: 'The premier fitness facility in Bhawanipatna. Join us to build strength and discipline.',
    type: 'website',
    images: [{ url: 'https://picsum.photos/seed/oxygen-gym/1200/630' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oxygen Multifit Gym',
    description: 'Bhawanipatna\'s elite fitness destination.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jakarta.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="antialiased font-jakarta bg-brand-charcoal text-white">
        <ToastProvider>
          <Template>
            {children}
          </Template>
        </ToastProvider>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Gym",
              "name": "Oxygen Multifit Gym",
              "image": "https://picsum.photos/seed/oxygen-gym/800/600",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Dandapani Complex, Balaji Mandir Road, Naktiguda",
                "addressLocality": "Bhawanipatna",
                "addressRegion": "Odisha",
                "postalCode": "766001",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 19.9074,
                "longitude": 83.1644
              },
              "url": "https://oxygenmultifit.com",
              "telephone": "+91 83277 99535",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "05:00",
                  "closes": "22:00"
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
