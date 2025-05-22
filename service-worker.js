const CACHE_NAME = 'pwa-api-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

self.addEventListener('install', event => {
    console.log('[SW] Installing');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activated');
});

self.addEventListener('fetch', event => {
    const req = event.request;

    if (req.url === API_URL) {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(req, resClone);
                    });
                    return res;
                })
                .catch(() => caches.match(req))
        );
    } else {
        event.respondWith(
            fetch(req).catch(() => caches.match(req))
        );
    }
});
