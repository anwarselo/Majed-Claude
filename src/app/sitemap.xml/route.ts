import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all published pages
    const { data: pages } = await supabase
      .from('pages')
      .select('url, published_at')
      .order('published_at', { ascending: false })
      .limit(5000);

    if (!pages || pages.length === 0) {
      // Return empty sitemap if no pages
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
      return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Build sitemap XML
    const urls = pages
      .map(
        (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date(page.published_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.BASE_URL || 'http://localhost:3000'}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

