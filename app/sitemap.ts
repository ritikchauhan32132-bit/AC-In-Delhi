import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://acindelhi.com';
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/review`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
