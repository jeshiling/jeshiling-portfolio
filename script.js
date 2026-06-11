document.addEventListener('DOMContentLoaded', () => {

  // ===== THREE.JS HERO =====
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambient = new THREE.AmbientLight(0x1a1a2e, 0.3);
  scene.add(ambient);

  const light1 = new THREE.PointLight(0x5b8def, 2, 20);
  light1.position.set(-3, 2, 4);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x8bbefa, 2, 20);
  light2.position.set(3, -2, 4);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 0.5);
  light3.position.set(0, 5, 5);
  scene.add(light3);

  // Main torus knot
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x5b8def,
    metalness: 0.4,
    roughness: 0.1,
    emissive: 0x1e3a6a,
    emissiveIntensity: 0.15,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });
  const torusKnot = new THREE.Mesh(geometry, material);
  torusKnot.position.y = -0.2;
  scene.add(torusKnot);

  // Inner glow ring
  const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 32, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8bbefa,
    transparent: true,
    opacity: 0.3,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  ring.position.y = -0.2;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.015, 32, 100),
    new THREE.MeshBasicMaterial({ color: 0x4a80d4, transparent: true, opacity: 0.2 })
  );
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.z = Math.PI / 6;
  ring2.position.y = -0.2;
  scene.add(ring2);

  // Particles
  const particlesCount = 2000;
  const particlesGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3);

  const palette = [
    new THREE.Color(0x5b8def),
    new THREE.Color(0x8bbefa),
    new THREE.Color(0x4a80d4),
    new THREE.Color(0xa8c8fa),
  ];

  for (let i = 0; i < particlesCount * 3; i += 3) {
    const radius = 3 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
    posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    posArray[i + 2] = radius * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colorArray[i] = c.r;
    colorArray[i + 1] = c.g;
    colorArray[i + 2] = c.b;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const particlesMat = new THREE.PointsMaterial({
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Small floating particles nearby
  const nearParticlesGeo = new THREE.BufferGeometry();
  const nearPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500 * 3; i += 3) {
    nearPos[i] = (Math.random() - 0.5) * 5;
    nearPos[i + 1] = (Math.random() - 0.5) * 5;
    nearPos[i + 2] = (Math.random() - 0.5) * 5;
  }
  nearParticlesGeo.setAttribute('position', new THREE.BufferAttribute(nearPos, 3));
  const nearParticlesMat = new THREE.PointsMaterial({
    size: 0.015,
    color: 0xa8c8fa,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  const nearParticles = new THREE.Points(nearParticlesGeo, nearParticlesMat);
  scene.add(nearParticles);

  // Mouse tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Resize
  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;

    torusKnot.rotation.x += 0.005;
    torusKnot.rotation.y += 0.01;
    ring.rotation.z += 0.003;
    ring.rotation.y += 0.005;
    ring2.rotation.x += 0.004;
    ring2.rotation.z += 0.006;
    particles.rotation.y += 0.0005;
    nearParticles.rotation.y += 0.001;

    camera.position.x += (targetX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (targetY * 0.3 - 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, -0.2, 0);

    renderer.render(scene, camera);
  }
  animate();

  // ===== NAVBAR =====
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ===== MOBILE NAV =====
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ===== SCROLL REVEAL =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.about-card, .timeline-item, .project-card, .skill-category, .service-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // ===== CONTACT FORM =====
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - offset,
          behavior: 'smooth'
        });
      }
    });
  });

});
