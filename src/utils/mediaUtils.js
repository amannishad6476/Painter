/**
 * Normalizes media URLs returned from upload endpoints or user input.
 * Handles:
 * - Truncated domain prefixes (e.g. "ainter-backend-one.vercel.app" -> "https://painter-backend-one.vercel.app")
 * - Missing protocol schemes (e.g. "painter-backend-one.vercel.app/api/cms/media/..." -> "https://painter-backend-one.vercel.app/api/cms/media/...")
 * - Protocol-relative URLs (e.g. "//res.cloudinary.com/..." -> "https://res.cloudinary.com/...")
 * - Relative paths (e.g. "/api/cms/media/..." or "api/cms/media/...")
 * - Cloudinary, Unsplash, and external image URLs
 */
export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blobs, and inline formats
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Protocol-relative URLs: //example.com/img.jpg -> https://example.com/img.jpg
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Fix truncated production domain prefix (e.g. "ainter-backend-one.vercel.app")
  if (trimmed.startsWith('ainter-backend-one.vercel.app')) {
    trimmed = 'painter-backend-one.vercel.app' + trimmed.substring('ainter-backend-one.vercel.app'.length);
  }

  // Already a complete HTTP/HTTPS URL
  if (/^https?:\/\//i.test(trimmed)) {
    // If the URL has a truncated domain inside: e.g. "https://ainter-backend-one.vercel.app"
    if (trimmed.includes('://ainter-backend-one.vercel.app')) {
      return trimmed.replace('://ainter-backend-one.vercel.app', '://painter-backend-one.vercel.app');
    }
    return trimmed;
  }

  // Relative URL starting with /api/ or /uploads
  if (trimmed.startsWith('/')) {
    const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
    const apiBase = rawApiUrl.replace(/\/+$/, '');
    if (apiBase) {
      return `${apiBase}${trimmed}`;
    }
    return trimmed;
  }

  // Relative URL starting with api/ or uploads/ (missing leading slash)
  if (trimmed.startsWith('api/') || trimmed.startsWith('uploads/')) {
    const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
    const apiBase = rawApiUrl.replace(/\/+$/, '');
    if (apiBase) {
      return `${apiBase}/${trimmed}`;
    }
    return `/${trimmed}`;
  }

  // Domain-like string without protocol: e.g. "painter-backend-one.vercel.app/api/cms/..." or "res.cloudinary.com/..."
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};
