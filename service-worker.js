/* 健身训练计划 PWA - Service Worker：离线缓存 */
const CACHE_NAME = 'fitness-plan-v6';
const ASSETS = [
  './',
  './fitness-dashboard.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 安装：预缓存核心资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求：缓存优先，回退网络
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 不缓存跨域请求（如 Chart.js CDN）
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match('./fitness-dashboard.html'));
    })
  );
});
