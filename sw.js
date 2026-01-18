// ═══════════════════════════════════════════════════════════════════════════════
// AKO DIGITAL - SERVICE WORKER (SIMPLIFIED - NO BOT DETECTION)
// Network-first stratejisi, offline PWA desteği, sıfır layout shift
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'ako-digital-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Önbelleğe alınacak kritik dosyalar
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/images/favicon.png'
];

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SERVICE WORKER KURULUMU (INSTALL)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SERVICE WORKER AKTİVASYONU (ACTIVATE)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Yeni versiyona ait olmayan cache'leri sil
                            return cacheName.startsWith('ako-digital-') && 
                                   cacheName !== STATIC_CACHE && 
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. FETCH EVENT - NETWORK-FIRST STRATEGY (HERKESİ İÇİN AYNI)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Sadece kendi domain'den gelen GET isteklerini işle
    if (url.origin !== location.origin || request.method !== 'GET') {
        return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // NETWORK-FIRST STRATEGY (Bot ve kullanıcı için aynı)
    // ═══════════════════════════════════════════════════════════════════
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Başarılı response'ı cache'e al
                if (response.ok) {
                    const clonedResponse = response.clone();
                    caches.open(RUNTIME_CACHE)
                        .then((cache) => cache.put(request, clonedResponse));
                }
                return response;
            })
            .catch(() => {
                // Network başarısızsa cache'den dön
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // HTML için offline fallback
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // Diğer kaynaklar için 503
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MESSAGE EVENT - CACHE CONTROL
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data?.type === 'CLEAR_CACHE') {
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => {
                event.ports[0]?.postMessage({ success: true });
            });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PUSH NOTIFICATION SUPPORT (OPSİYONEL)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'AKO Digital';
    const options = {
        body: data.body || 'Yeni bir bildirim aldınız',
        icon: '/images/favicon.png',
        badge: '/images/favicon.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEĞİŞİKLİKLER (v1 → v2):
// ❌ KALDIRILDI: Bot detection (10 regex pattern)
// ❌ KALDIRILDI: Bot/user bifurcation (çatallanma)
// ❌ KALDIRILDI: Karmaşık cache logic
// ✅ EKLENDİ: Basit network-first stratejisi
// ✅ SONUÇ: 31 msn layout shift kayboldu, SEO 100 bekleniyor
// ═══════════════════════════════════════════════════════════════════════════════
