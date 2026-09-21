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
            navMenu.classList.toggle('open');
            hamburger.querySelectorAll('.bar').forEach((b, i) => {
                if (isActive) {
                    if (i === 0) b.style.cssText = 'transform:translateY(7.5px) rotate(45deg)';
                    if (i === 1) b.style.opacity = '0';
                    if (i === 2) b.style.cssText = 'transform:translateY(-7.5px) rotate(-45deg)';
                } else { b.style.cssText = ''; b.style.opacity = ''; }
            });
            hamburger.setAttribute('aria-expanded', isActive);
        }, {passive: true}); // PASSIVE: INP için kritik

        // Menü linklerine tıklayınca menüyü kapat
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                navMenu.classList.remove('open');
                hamburger.querySelectorAll('.bar').forEach(b => { b.style.cssText=''; b.style.opacity=''; });
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
    // 4. AI-DRIVEN PREFETCH (HOVER-BASED INTELLIGENT LOADING)
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
// NOT: Bu dosya DEFER ile yüklendiği için DOMContentLoaded'den önce çalışmayacak
// HTML'de <script defer src="script.js"></script> şeklinde çağrılmalı
// ═══════════════════════════════════════════════════════════════════════════════