import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch business and page data
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*, pages(*)')
    .eq('slug', slug)
    .single();

  if (error || !business) {
    notFound();
  }

  const page = business.pages?.[0];

  if (!page) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>Business Not Published</h1>
        <p>This business page is being processed. Please check back shortly.</p>
      </div>
    );
  }

  return (
    <>
      {/* Inject JSON-LD for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(page.jsonld) }}
      />

      {/* Render business content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.6',
        }}
      >
        <article dangerouslySetInnerHTML={{ __html: page.html }} />
        <hr style={{ margin: '40px 0', border: '1px solid #eee' }} />
        <footer style={{ fontSize: '14px', color: '#666' }}>
          <p>
            This business page was published on{' '}
            {new Date(page.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p>
            <a href="/" style={{ color: '#0066cc' }}>
              ← Back to homepage
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from('businesses')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!business) {
    return {
      title: 'Business Not Found',
    };
  }

  return {
    title: business.name,
    description: business.description || `Business profile for ${business.name}`,
  };
}

