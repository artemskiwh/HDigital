// ============ MOUSE GLOW ============
(function() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
})();

// ============ HEADER SCROLL ============
(function() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }, { passive: true });
})();

// ============ БОКОВАЯ ШТОРКА-МЕНЮ ============
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!menu) return;
    const isOpen = menu.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

// ============ SCROLL TO SECTION ============
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // если секции нет на этой странице - уходим на главную к якорю
        window.location.href = 'index.html#' + id;
    }
}

// ============ FAQ ============
function toggleFaq(btn) {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-answer').style.maxHeight = '0px';
        }
    });

    if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0px';
    } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// ============ SCROLL REVEAL ============
(function() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
})();

// ============ PARALLAX & FLOATING ============
(function() {
    const heroGrid = document.querySelector('.hero-grid-bg');
    const floatingDecors = document.querySelectorAll('.floating-decor');
    if (!heroGrid && !floatingDecors.length) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (heroGrid) heroGrid.style.transform = `translateY(${scrolled * 0.08}px)`;
                floatingDecors.forEach((el, i) => {
                    el.style.transform = `translateY(${scrolled * (0.04 + i * 0.03)}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

console.log('%c HDigital %c Многостраничная версия ',
    'background:#fff;color:#000;padding:6px 14px;border-radius:999px;font-weight:700;font-size:14px;',
    'color:#888;font-size:12px;');
