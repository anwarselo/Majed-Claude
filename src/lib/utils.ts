import slugifyLib from 'slugify';

/**
 * Generate a unique slug from business name
 * Format: business-name-x7k2
 */
export function generateSlug(name: string): string {
  const base = slugifyLib(name, { lower: true, strict: true });
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

