import { escapeHtml } from './utils';

export interface Business {
  id: string;
  slug: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  created_at: string;
}

/**
 * Generate schema.org JSON-LD for business
 */
export function generateJsonLd(business: Business, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: `${baseUrl}/b/${business.slug}`,
    description: business.description || `Business profile for ${business.name}`,
    ...(business.website && { sameAs: [business.website] }),
    ...(business.phone && { telephone: business.phone }),
  };
}

/**
 * Generate HTML content for business page
 */
export function generateHtml(
  business: Business,
  extractedText: string,
  sourceFileUrl?: string
): string {
  const safeName = escapeHtml(business.name);
  const safeText = escapeHtml(extractedText).replace(/\n/g, '<br/>');
  const safeWebsite = business.website ? escapeHtml(business.website) : null;
  const safePhone = business.phone ? escapeHtml(business.phone) : null;

  let html = `<h1>${safeName}</h1>`;

  if (business.description) {
    html += `<p><strong>${escapeHtml(business.description)}</strong></p>`;
  }

  if (safeWebsite || safePhone) {
    html += '<section><h2>Contact Information</h2><ul>';
    if (safeWebsite) {
      html += `<li><strong>Website:</strong> <a href="${safeWebsite}" target="_blank" rel="noopener">${safeWebsite}</a></li>`;
    }
    if (safePhone) {
      html += `<li><strong>Phone:</strong> <a href="tel:${safePhone}">${safePhone}</a></li>`;
    }
    html += '</ul></section>';
  }

  if (extractedText.trim()) {
    html += `<section><h2>About</h2><div>${safeText}</div></section>`;
  }

  if (sourceFileUrl) {
    html += `<section><p><small>Source: <a href="${escapeHtml(sourceFileUrl)}" target="_blank" rel="noopener">View original document</a></small></p></section>`;
  }

  return html;
}

