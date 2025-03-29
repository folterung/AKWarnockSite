import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { books } from '../src/data/books.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Book {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  amazonLink: string;
  synopsis: string;
}

// Base URL of your website
const BASE_URL = 'https://akwarnock.com';

// Static pages
const staticPages: string[] = [
  '',
  '/about',
  '/books',
  '/contact',
  '/unsubscribe',
];

// Generate sitemap for books
const bookPages: string[] = books.map((book: Book) => `/books/${book.id}`);

// Combine all pages
const allPages: string[] = [...staticPages, ...bookPages];

// Generate sitemap XML
const sitemap: string = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

// Generate individual sitemap XML
const sitemapXml: string = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

// Ensure the public directory exists
const publicDir: string = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap files
fs.writeFileSync(path.join(publicDir, 'sitemap-index.html'), sitemap);
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);

console.log('Sitemap files generated successfully!'); 