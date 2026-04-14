document.addEventListener('DOMContentLoaded', () => {

    // --- 0. INTRO LOGIC ---
    const introScreen = document.getElementById('intro-screen');
    const body = document.body;

    setTimeout(() => {
        if (introScreen) introScreen.classList.add('intro-finished');
        body.classList.remove('loading');
    }, 2500);

    // --- 4. THEME & LANGUAGE LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.icon') : null;
    const langText = langToggle ? langToggle.querySelector('.lang-text') : null;

    // State
    let currentTheme = localStorage.getItem('theme') || 'dark';
    let currentLang = localStorage.getItem('lang') || 'es';

    // Initialize
    function init() {
        // Theme
        if (currentTheme === 'light') {
            body.classList.add('light-mode');
            if (themeIcon) themeIcon.textContent = '☾';
        } else {
            if (themeIcon) themeIcon.textContent = '☀';
        }

        // Language
        updateLanguage(currentLang);
    }

    // Theme Switcher
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            if (body.classList.contains('light-mode')) {
                currentTheme = 'light';
                if (themeIcon) themeIcon.textContent = '☾';
            } else {
                currentTheme = 'dark';
                if (themeIcon) themeIcon.textContent = '☀';
            }
            localStorage.setItem('theme', currentTheme);
        });
    }

    // Language Switcher
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('lang', currentLang);
            updateLanguage(currentLang);
        });
    }

    function updateLanguage(lang) {
        if (langText) langText.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;

        if (typeof translations !== 'undefined') {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });
        }
    }

    init();

    // --- 1. FONDO DINÁMICO (REFINED) ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particlesArray = [];

        // Particle settings - Refined for "Sober & Modern" look
        const particleCount = 100; // Increased by ~20%
        const connectionDistance = 180;
        const mouseDistance = 280; // Slightly larger range

        let mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Slower, smoother movement
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 2.5 + 1; // Slightly larger particles
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction - Smoother ease-out
                if (mouse.x != undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseDistance) {
                        // Draw connection to mouse
                        ctx.beginPath();
                        let opacity = 1 - (distance / mouseDistance);
                        if (currentTheme === 'light') {
                            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.6})`;
                        } else {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`; // White connection
                        }
                        ctx.lineWidth = 1.5; // Thicker line for mouse interaction
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        // Gentle push
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouseDistance - distance) / mouseDistance;
                        const directionX = forceDirectionX * force * 0.4;
                        const directionY = forceDirectionY * force * 0.4;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                // Dynamic colors based on theme
                if (currentTheme === 'light') {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
                } else {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.75)'; // More visible particles
                }
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < particleCount; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                for (let j = i; j < particlesArray.length; j++) {
                    let dx = particlesArray[i].x - particlesArray[j].x;
                    let dy = particlesArray[i].y - particlesArray[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        // Refined line opacity
                        let opacity = 1 - (distance / connectionDistance);
                        if (currentTheme === 'light') {
                            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.15})`;
                        } else {
                            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.1})`; // Slate-400
                        }
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });

        resize();
        initParticles();
        animate();
    }

    // --- 2. SCROLL REVEAL ---
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // --- 3. PARALLAX EFFECT ---
    const heroSection = document.querySelector('.hero');
    const mockup = document.querySelector('.app-screenshot');

    if (heroSection && mockup) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 70;
            const y = (window.innerHeight - e.pageY * 2) / 70;
            mockup.style.transform = `rotateX(${5 + y}deg) rotateY(${x}deg)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            mockup.style.transform = `rotateX(5deg) rotateY(0deg)`;
        });
    }
});