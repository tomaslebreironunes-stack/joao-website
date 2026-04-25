/**
 * spline-init.js — ES module
 * Uses dynamic import() so a CDN resolution failure is caught gracefully.
 * The loader animation is already running (started by inline <script> in HTML).
 */

const SPLINE_URL = 'https://prod.spline.design/DwseBGB7loN5TGK3/scene.splinecode';

// Ordered list of CDN URLs to try for @splinetool/runtime
const CDN_CANDIDATES = [
  'https://unpkg.com/@splinetool/runtime/build/runtime.module.js',
  'https://cdn.jsdelivr.net/npm/@splinetool/runtime/build/runtime.module.js',
];

const canvas    = document.getElementById('canvas3d');
const loader    = document.getElementById('spline-loader');
const loaderBar = document.getElementById('loader-bar');
const loaderLbl = document.getElementById('loader-label');
const heroEl    = document.getElementById('hero-content');

/** Complete the loader bar and fade out the loading screen */
function revealPage() {
  clearInterval(window._loaderInterval);
  clearTimeout(window._loaderTimeout);

  if (loaderBar) loaderBar.style.width = '100%';
  if (loaderLbl) loaderLbl.textContent  = 'Ready.';

  setTimeout(() => {
    if (loader) {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
    }
    if (heroEl) heroEl.classList.add('visible');
  }, 420);
}

/** Try each CDN in order; resolve with the Application class or reject */
async function loadRuntime() {
  for (const url of CDN_CANDIDATES) {
    try {
      const mod = await import(url);
      if (mod && mod.Application) return mod.Application;
    } catch (e) {
      console.warn('[Spline] CDN failed:', url, e);
    }
  }
  throw new Error('All Spline CDN candidates failed.');
}

(async function main() {
  try {
    const Application = await loadRuntime();
    const app = new Application(canvas);
    await app.load(SPLINE_URL);
    revealPage();
  } catch (err) {
    console.error('[Spline] Could not load scene:', err);
    revealPage(); // still reveal the page — content > blank screen
  }
})();
