// ═══════════════════════════════════════════════════════════════════════════════
// AKO DIGITAL - SERVICE WORKER (BOT/USER BIFURCATION)
// Google Bot'a ultra-hafif HTML, kullanıcılara zengin deneyim
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'ako-digital-v1';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Önbelleğe alınacak statik dosyalar
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/images/favicon.png'
];

// Bot User-Agent Pattern'leri
const BOT_PATTERNS = [
    /googlebot/i,
    /bingbot/i,
    /yandex/i,
    /baiduspider/i,
    /slurp/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i
];

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SERVICE WORKER KURULUMU (INSTALL)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            return self.skipWaiting(); // Hemen aktif ol
        })
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SERVICE WORKER AKTİVASYONU (ACTIVATE)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eski cache'leri temizle
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Tüm istemcileri kontrol et
        })
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BOT DETECTION FONKSİYONU
// ═══════════════════════════════════════════════════════════════════════════════
function isBot(userAgent) {
    if (!userAgent) return false;
    return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FETCH EVENT - BOT/USER BIFURCATION (ÇATALLANMA)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Sadece kendi domain'inizden gelen istekleri işle
    if (url.origin !== location.origin) {
        return;
    }

    // User-Agent'ı al
    const userAgent = request.headers.get('user-agent') || '';
    const botDetected = isBot(userAgent);

    // ═══════════════════════════════════════════════════════════════════
    // BOT KULLANICISI - ULTRA HAFİF, PRE-RENDERED RESPONSE
    // ═══════════════════════════════════════════════════════════════════
    if (botDetected) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(request).then((response) => {
                    // HTML ise cache'e al (bot için)
                    if (response.ok && request.method === 'GET' && 
                        response.headers.get('content-type')?.includes('text/html')) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                });
            }).catch(() => {
                // Offline fallback
                return new Response('Offline - Bot Mode', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
        );
        return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // GERÇEK KULLANICI - NETWORK-FIRST STRATEGY (ZENGİN DENEYİM)
    // ═══════════════════════════════════════════════════════════════════
    event.respondWith(
        fetch(request).then((response) => {
            // Başarılı response'ları runtime cache'e al
            if (response.ok && request.method === 'GET') {
                const clonedResponse = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, clonedResponse);
                });
            }
            return response;
        }).catch(() => {
            // Network başarısızsa cache'den dön
            return caches.match(request).then((cachedResponse) => {
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
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. MESSAGE EVENT - CACHE CONTROL (OPSİYONEL)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({success: true});
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PUSH NOTIFICATION SUPPORT (GELECEK İÇİN)
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
// NOT: Bu dosya sitenizin ROOT dizininde (/sw.js) olmalıdır
// index.html içindeki kayıt kodu otomatik olarak bu dosyayı çalıştıracaktır
// ═══════════════════════════════════════════════════════════════════════════════
