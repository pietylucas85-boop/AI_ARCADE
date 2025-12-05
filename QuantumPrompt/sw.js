const CACHE_NAME = 'quantum-prompt-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/vite.svg',
    '/src/comic-engine/Engine.js',
    '/src/comic-engine/Renderer.js',
    '/src/comic-engine/StateManager.js',
    '/src/comic-engine/StoryGenerator.js',
    '/src/comic-engine/Character.js',
    '/src/taskconductor/api.js',
    '/src/taskconductor/core.js',
    '/src/taskconductor/memory.js',
    '/src/taskconductor/router.js',
    '/src/taskconductor/utils.js',
    '/src/taskconductor/workers.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
