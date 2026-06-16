// ═══════════════════════════════════════════════════════════════════════════════
// AKO DIGITAL - KUANTUM SEVİYESİ JAVASCRIPT (INP + AI PREFETCH + PASSIVE)
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    
    // ═══════════════════════════════════════════════════════════════════
    // 1. MOBİL MENÜ (HAMBURGER) - PASSIVE EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════════
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        }, {passive: true}); // PASSIVE: INP için kritik

        // Menü linklerine tıklayınca menüyü kapat
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }, {passive: true});
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. FADE-IN ANIMASYONU (INTERSECTION OBSERVER)
    // ═══════════════════════════════════════════════════════════════════
    const fadeInElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // 100px önce tetikleme
        threshold: 0.1
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target); // Bir kez çalışsın
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => fadeInObserver.observe(el));

    // ═══════════════════════════════════════════════════════════════════
    // 3. YUKARI ÇIK BUTONU - PASSIVE SCROLL LISTENER
    // ═══════════════════════════════════════════════════════════════════
    const scrollTopBtn = document.querySelector('.scroll-top-btn');

    if (scrollTopBtn) {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            // Debounce: Her scroll'da tetiklenmemesi için
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
            }, 100);
        }, {passive: true, capture: false}); // PASSIVE + CAPTURE: Performans için hayati

        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 4. HERO BACKGROUND LAZY LOAD (LCP OPTİMİZASYONU)
    // ═══════════════════════════════════════════════════════════════════
    const heroSection = document.getElementById('hero');
    
    if (heroSection) {
        const heroImage = new Image();
        heroImage.src = 'images/hero-background.webp';
        heroImage.decoding = 'async';
        heroImage.fetchPriority = 'high';
        
        heroImage.onload = () => {
            heroSection.classList.add('loaded');
        };
        
        // Fallback: 3 saniye sonra yine de yükle
        setTimeout(() => {
            heroSection.classList.add('loaded');
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. AI-DRIVEN PREFETCH (HOVER-BASED INTELLIGENT LOADING)
    // ═══════════════════════════════════════════════════════════════════
    // Kullanıcı bir linke hover yaptığında arka planda o sayfayı yükle
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="hizmetlerimiz"], a[href^="iletisim"], a[href^="blog"], a[href^="hakkimizda"]');
    
    const prefetchedUrls = new Set(); // Aynı URL'yi tekrar yüklememek için
    
    internalLinks.forEach(link => {
        // HOVER EVENT - Mouse üzerine geldiğinde prefetch yap
        link.addEventListener('mouseenter', function() {
            const url = this.getAttribute('href');
            
            // Eğer daha önce prefetch yapılmamışsa
            if (!prefetchedUrls.has(url) && url && !url.startsWith('#')) {
                prefetchedUrls.add(url);
                
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = url;
                prefetchLink.as = 'document';
                
                document.head.appendChild(prefetchLink);
                
                // Console'da görmek isterseniz (production'da silin):
                // console.log('✅ Prefetched:', url);
            }
        }, {once: true, passive: true}); // once: Her link için sadece 1 kez çalış
        
        // TOUCHSTART EVENT - Mobil cihazlar için
        link.addEventListener('touchstart', function() {
            const url = this.getAttribute('href');
            
            if (!prefetchedUrls.has(url) && url && !url.startsWith('#')) {
                prefetchedUrls.add(url);
                
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = url;
                prefetchLink.as = 'document';
                
                document.head.appendChild(prefetchLink);
            }
        }, {once: true, passive: true});
    });

    // ═══════════════════════════════════════════════════════════════════
    // 6. VIEWPORT VISIBILITY API - SAYFA ARKA PLANDA MIYSA DURDURULUYOR
    // ═══════════════════════════════════════════════════════════════════
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Sayfa arka plandayken ağır işlemleri durdur
            fadeInObserver.disconnect();
        } else {
            // Sayfa tekrar aktif olduğunda gözlemleyiciyi yeniden başlat
            fadeInElements.forEach(el => {
                if (!el.classList.contains('visible')) {
                    fadeInObserver.observe(el);
                }
            });
        }
    }, {passive: true});

    // ═══════════════════════════════════════════════════════════════════
    // 7. PERFORMANCE MONITORING (OPSİYONEL - PRODUCTION'DA SİLEBİLİRSİNİZ)
    // ═══════════════════════════════════════════════════════════════════
    if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint) Ölçümü
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            // console.log('🚀 LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        
        try {
            lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
        } catch(e) {
            // Tarayıcı desteklemiyorsa sessizce geç
        }
        
        // INP (Interaction to Next Paint) - Chrome 96+
        const inpObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                // console.log('⚡ INP:', entry.duration);
            }
        });
        
        try {
            inpObserver.observe({type: 'event', buffered: true});
        } catch(e) {
            // Tarayıcı desteklemiyorsa sessizce geç
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 8. CRITICAL RESOURCE LOADING STATUS
    // ═══════════════════════════════════════════════════════════════════
    if ('loading' in HTMLImageElement.prototype) {
        // Lazy loading destekleniyor
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.complete) {
                // Görsel zaten yüklü
            } else {
                img.addEventListener('load', () => {
                    // Görsel yüklendi
                }, {once: true, passive: true});
            }
        });
    }

}); // DOMContentLoaded sonu

// ═══════════════════════════════════════════════════════════════════════════════
// 9. WINDOW LOAD EVENT - TÜM KAYNAKLAR YÜKLENDİKTEN SONRA
// ═══════════════════════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
    // Sayfa tamamen yüklendiğinde yapılacak işlemler
    document.body.classList.add('page-loaded');
    
    // Font-face kontrolü
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            // Fontlar yüklendi
            document.body.classList.add('fonts-loaded');
        });
    }
}, {once: true, passive: true});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. ERROR HANDLING - CONSOLE HATALARINI YAKALAMA (OPSİYONEL)
// ═══════════════════════════════════════════════════════════════════════════════
window.addEventListener('error', (event) => {
    // Production'da hataları loglamak için
    // console.error('❌ Global Error:', event.message);
}, {passive: true});

// ═══════════════════════════════════════════════════════════════════════════════
// NOT: Bu dosya DEFER ile yüklendiği için DOMContentLoaded'den önce çalışmayacak
// HTML'de <script defer src="script.js"></script> şeklinde çağrılmalı
// ═══════════════════════════════════════════════════════════════════════════════