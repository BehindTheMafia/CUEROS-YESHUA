/**
 * Supabase Image URL transformer
 * Generates optimized image URLs using Supabase Storage Image Transformations
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * Auto-detects if transforms are available (Pro plan required).
 * Falls back to original URL on free plan.
 */

const STORAGE_MARKER = '/storage/v1/object/public/';
const RENDER_PREFIX  = '/storage/v1/render/image/public/';

/** Cache: null = not tested, true = available, false = not available */
let _transformsAvailable = null;
/** Promise that resolves once we've tested */
let _probePromise = null;

/**
 * One-time probe: try a tiny transform request to see if the plan supports it.
 * Caches the result so subsequent calls are instant.
 */
async function probeTransforms(sampleUrl) {
  if (_transformsAvailable !== null) return _transformsAvailable;
  if (_probePromise) return _probePromise;

  _probePromise = (async () => {
    try {
      const testUrl = sampleUrl.replace(STORAGE_MARKER, RENDER_PREFIX) + '?width=1&quality=1';
      const res = await fetch(testUrl, { method: 'HEAD', mode: 'cors' });
      _transformsAvailable = res.ok;
    } catch {
      _transformsAvailable = false;
    }
    if (!_transformsAvailable) {
      console.info('[supabase-image] Image transforms not available (free plan). Using original URLs.');
    }
    return _transformsAvailable;
  })();

  return _probePromise;
}

/**
 * @param {string} url  – Supabase Storage public URL
 * @param {object} opts
 * @param {number} [opts.width]   – target width in px
 * @param {number} [opts.height]  – target height in px
 * @param {number} [opts.quality] – 1-100  (default 75)
 * @param {'cover'|'contain'|'fill'} [opts.resize] – resize mode
 * @returns {string} transformed URL (or original if transforms unavailable)
 */
export function supabaseImageUrl(url, { width, height, quality = 75, resize = 'cover' } = {}) {
  if (!url || !url.includes(STORAGE_MARKER)) return url;

  // If we already know transforms are NOT available, skip
  if (_transformsAvailable === false) return url;

  // Convert /object/public/ → /render/image/public/
  const transformed = url.replace(STORAGE_MARKER, RENDER_PREFIX);

  const params = new URLSearchParams();
  if (width)  params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('resize', resize);

  return `${transformed}?${params.toString()}`;
}

/**
 * Preset sizes for common contexts
 */
export const IMG_PRESETS = {
  /** Catalog grid card — ~400px wide */
  thumbnail:   { width: 400,  quality: 70 },
  /** Product detail main image */
  detail:      { width: 800,  quality: 80 },
  /** Lightbox / full screen */
  full:        { width: 1200, quality: 85 },
  /** Small related product cards */
  related:     { width: 350,  quality: 70 },
  /** Admin list thumbnails */
  adminThumb:  { width: 300,  quality: 65 },
  /** Tiny thumb for gallery strip */
  micro:       { width: 120,  quality: 60 },
};

/**
 * Convenience: get URL at a preset size
 * @param {string} url
 * @param {keyof IMG_PRESETS} preset
 * @returns {string}
 */
export function imgAt(url, preset) {
  const opts = IMG_PRESETS[preset];
  if (!opts) return url;
  return supabaseImageUrl(url, opts);
}

/**
 * Generate a srcset string for responsive images
 * @param {string} url – original Supabase public URL
 * @param {number[]} widths – array of widths e.g. [300, 600, 900]
 * @param {number} [quality=75]
 * @returns {string} srcset attribute value
 */
export function srcSet(url, widths = [300, 600, 900, 1200], quality = 75) {
  if (!url || !url.includes(STORAGE_MARKER)) return '';
  if (_transformsAvailable === false) return '';
  return widths
    .map(w => `${supabaseImageUrl(url, { width: w, quality })} ${w}w`)
    .join(', ');
}

/**
 * Initialize: probe if transforms are available using any Supabase Storage URL.
 * Call this once on page load with any product image URL.
 * @param {string} sampleUrl – any Supabase Storage public URL
 */
export async function initImageTransforms(sampleUrl) {
  if (!sampleUrl || !sampleUrl.includes(STORAGE_MARKER)) {
    _transformsAvailable = false;
    return;
  }
  await probeTransforms(sampleUrl);
}

/**
 * Force-set whether transforms are available (useful for testing / override)
 */
export function setTransformsAvailable(val) {
  _transformsAvailable = val;
}
