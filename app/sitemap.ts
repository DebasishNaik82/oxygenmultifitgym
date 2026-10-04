import { MetadataRoute } from 'next';

const BASE_URL = 'https://ais-dev-ricl65brwkoiyqo4ba343r-836609652283.asia-southeast1.run.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', changeFreq: 'daily' as const, priority: 1.0 },
    { path: 'about', changeFreq: 'hourly' as const, priority: 0.8 },
    { path: 'services', changeFreq: 'hourly' as const, priority: 0.8 },
    { path: 'facilities', changeFreq: 'hourly' as const, priority: 0.8 },
    { path: 'membership', changeFreq: 'hourly' as const, priority: 0.8 },
    { path: 'contact', changeFreq: 'hourly' as const, priority: 0.8 },
  ];

  return routes.map((route) => ({
    url: route.path ? `${BASE_URL}/${route.path}` : BASE_URL,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
