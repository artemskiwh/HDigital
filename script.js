// ============ ЗВЁЗДНОЕ ПОЛЕ (только звёзды) ============
(function() {
    const container = document.getElementById('threejs-container');
    if (!container || typeof THREE === 'undefined') return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / Math.max(container.clientHeight, 400),
        0.1,
        100
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Мягкая круглая текстура звезды
    const starCanvas = document.createElement('canvas');
    starCanvas.width = starCanvas.height = 64;
    const ctx = starCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const starTex = new THREE.CanvasTexture(starCanvas);

    // Ближний слой звёзд
    const starCount = isMobile ? 450 : 950;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 42;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        size: isMobile ? 0.18 : 0.22,
        map: starTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);

    // Дальний слой мелких звёзд (глубина)
    const farCount = isMobile ? 220 : 520;
    const farGeo = new THREE.BufferGeometry();
    const farPos = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount; i++) {
        farPos[i * 3] = (Math.random() - 0.5) * 80;
        farPos[i * 3 + 1] = (Math.random() - 0.5) * 56;
        farPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 15;
    }
    farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3));
    const farMat = new THREE.PointsMaterial({
        size: 0.09,
        map: starTex,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const farStars = new THREE.Points(farGeo, farMat);
    scene.add(farStars);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;

        stars.rotation.y = t * 0.01 + mouseX * 0.15;
        stars.rotation.x = mouseY * 0.1;
        farStars.rotation.y = t * 0.005 + mouseX * 0.08;

        // Лёгкое мерцание
        mat.opacity = 0.7 + Math.sin(t * 1.5) * 0.15;
        farMat.opacity = 0.4 + Math.sin(t * 1.1 + 1) * 0.1;

        renderer.render(scene, camera);
    }
    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(frameId);
        } else {
            clock.start();
            animate();
        }
    });

    window.addEventListener('resize', () => {
        if (container.clientWidth > 0) {
            camera.aspect = container.clientWidth / Math.max(container.clientHeight, 400);
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
})();

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
