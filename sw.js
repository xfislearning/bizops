/* Qentro BizOps — offline service worker for the upload build (index.html + config.js on GitHub Pages).
 * Same-origin files only. Google traffic (accounts.google.com, googleapis.com, …) is never intercepted or cached.
 * index.html and config.js: network first (deploys and client-ID edits show up at once), cached copy when offline. */
const CACHE = 'qentro-upload-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.json', './apple-touch-icon.png', './favicon.ico', './icons/favicon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('qentro-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch Google or any third party
  if (url.pathname.endsWith('/sw.js')) return;
  const nav = req.mode === 'navigate';
  const key = nav ? './index.html' : req;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true }).then(hit => hit || (nav ? caches.match('./') : undefined)).then(hit => hit || Response.error())),
  );
});
