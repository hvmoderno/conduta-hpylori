/* Service worker do Conduta H. pylori.
   REGRA: a cada publicação, SUBA VERSAO. Sem isso o iPhone fica preso na versão velha.
   Página: rede primeiro, cache como reserva (offline). Fontes e ícones: cache primeiro. */
var VERSAO = 'v1';
var CACHE = 'conduta-hp-' + VERSAO;
var ESSENCIAIS = ['./', './index.html', './manifest.json', './icons/icone-192.png', './icons/icone-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ESSENCIAIS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var fonte = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !fonte) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); return r;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('./index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); return r;
    });
  }));
});
