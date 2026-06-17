// Service worker do Vitrine — cache do app pra abrir offline/rápido
const CACHE = 'vitrine-v1';
const ASSETS = ['./', './index.html', './icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Só intercepta GET do próprio site. Supabase, proxy de imagem e tudo cross-origin passam direto pela rede.
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Network-first: sempre tenta a versão mais nova; usa o cache só quando offline.
  e.respondWith(
    fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
