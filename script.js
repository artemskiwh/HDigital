// ============ 3D-ГРАФИКА (ИКОСАЭДРЫ + КОЛЬЦА + ЧАСТИЦЫ) ============
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
    camera.position.z = 16;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ===== Главный объект: икосаэдр с плавной геометрией =====
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const icoGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const icoWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(icoGeo),
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.18
        })
    );
    mainGroup.add(icoWire);

    // Внутренний меньший икосаэдр
    const icoInnerGeo = new THREE.IcosahedronGeometry(2.0, 0);
    const icoInner = new THREE.LineSegments(
        new THREE.WireframeGeometry(icoInnerGeo),
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.10
        })
    );
    mainGroup.add(icoInner);

    // Внешний октаэдр
    const octaGeo = new THREE.OctahedronGeometry(4.2, 0);
    const octa = new THREE.LineSegments(
        new THREE.WireframeGeometry(octaGeo),
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.06
        })
    );
    mainGroup.add(octa);

    // ===== Орбитальное кольцо =====
    const ringGeo = new THREE.TorusGeometry(5.2, 0.015, 12, 96);
    const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 })
    );
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(5.6, 0.01, 10, 80),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
    );
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.z = Math.PI / 4;
    scene.add(ring2);

    // ===== Облако частиц =====
    const particlesCount = isMobile ? 250 : 500;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];
    for (let i = 0; i < particlesCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 6 + Math.random() * 4;
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        positions[i * 3 + 2] = Math.cos(phi) * r;
        velocities.push({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002
        });
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Кастомная маленькая точка через canvas
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = dotCanvas.height = 64;
    const ctx = dotCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const dotTex = new THREE.CanvasTexture(dotCanvas);

    const particlesMat = new THREE.PointsMaterial({
        size: isMobile ? 0.08 : 0.12,
        map: dotTex,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Центральное «ядро» (точка-свет в центре)
    const coreGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // ===== Мышь =====
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ===== Анимация =====
    const clock = new THREE.Clock();
    let frameId;

    function animate() {
        frameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;

        // Плавное вращение главной группы
        mainGroup.rotation.x = Math.sin(t * 0.15) * 0.15 + mouseY * 0.2;
        mainGroup.rotation.y = t * 0.08 + mouseX * 0.3;

        // Внутренние объекты крутятся отдельно
        icoInner.rotation.x -= 0.002;
        icoInner.rotation.y += 0.003;
        octa.rotation.y -= 0.0015;
        octa.rotation.z += 0.0008;

        // Кольца
        ring.rotation.z += 0.001;
        ring.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.2) * 0.05;
        ring2.rotation.y += 0.0008;
        ring2.rotation.z -= 0.0005;

        // Частицы — лёгкий drift и общее вращение
        const pos = particlesGeo.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            pos[i * 3] += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;

            // Возвращение к началу если слишком далеко
            const dx = pos[i * 3], dy = pos[i * 3 + 1], dz = pos[i * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist > 11 || dist < 4) {
                velocities[i].x *= -1;
                velocities[i].y *= -1;
                velocities[i].z *= -1;
            }
        }
        particlesGeo.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0006;

        // Пульсация ядра
        const pulse = 1 + Math.sin(t * 2) * 0.15;
        core.scale.setScalar(pulse);

        // Лёгкое движение камеры
        camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 0.6 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    // Пауза при скрытии вкладки
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
