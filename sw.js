// Guarda os arquivos do app para abrir sem internet. Nenhum dado de paciente passa por aqui.
const CACHE = 'prontuario-v1.4.0';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method === 'GET' && /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { // fontes: guarda para funcionar sem internet
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { const k = r.clone(); caches.open(CACHE).then(x => x.put(e.request, k)); return r; })));
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Google e outros: direto pela internet
  // Rede primeiro (pega atualizações), cache se estiver sem internet
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
