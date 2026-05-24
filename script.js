// ============ 3D-ГРАФИКА (ЦИФРОВАЯ ПАУТИНА + ЧАСТИЦЫ) ============
(function() {
    const container = document.getElementById('threejs-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / Math.max(container.clientHeight, 400), 0.1, 100);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Освещение не нужно, только линии и точки
    // Сетчатая сфера (паутина)
    const sphereGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(sphereGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })
    );
    scene.add(wireframe);

    // Вторая, более крупная и прозрачная сфера
    const sphereGeo2 = new THREE.SphereGeometry(4.2, 24, 18);
    const wireframe2 = new THREE.LineSegments(
        new THREE.EdgesGeometry(sphereGeo2),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 })
    );
    scene.add(wireframe2);

    // Орбитальные кольца
    const ringGeo = new THREE.TorusGeometry(3.5, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.8, 0.02, 16, 80),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 })
    );
    ring2.rotation.z = Math.PI / 4;
    ring2.rotation.x = Math.PI / 2.5;
    scene.add(ring2);

    // Летающие частицы (сотни точек)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 600;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        // Расположение в пределах сферы радиусом 5
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 4 + Math.random() * 3;
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        positions[i * 3 + 2] = Math.cos(phi) * r;
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Линии соединений между ближайшими частицами (создадим несколько случайных)
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 });
    const linesGroup = new THREE.Group();
    for (let i = 0; i < 200; i++) {
        const idx1 = Math.floor(Math.random() * particlesCount);
        const idx2 = Math.floor(Math.random() * particlesCount);
        if (idx1 === idx2) continue;
        const p1 = new THREE.Vector3(positions[idx1*3], positions[idx1*3+1], positions[idx1*3+2]);
        const p2 = new THREE.Vector3(positions[idx2*3], positions[idx2*3+1], positions[idx2*3+2]);
        const dist = p1.distanceTo(p2);
        if (dist < 2.8) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const line = new THREE.Line(lineGeo, linesMaterial);
            linesGroup.add(line);
        }
    }
    scene.add(linesGroup);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        wireframe.rotation.y += 0.001;
        wireframe.rotation.x = Math.sin(t * 0.2) * 0.05;
        wireframe2.rotation.y -= 0.0006;
        wireframe2.rotation.z += 0.0003;
        ring.rotation.z += 0.0005;
        ring.rotation.y += 0.0004;
        ring2.rotation.x += 0.0007;
        ring2.rotation.y -= 0.0003;
        particles.rotation.y += 0.0002;
        particles.rotation.x = Math.sin(t * 0.15) * 0.03;
        linesGroup.rotation.y += 0.00015;
        linesGroup.rotation.x += 0.0001;

        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

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
