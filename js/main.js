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

        // Particle settings - Aumentamos la cantidad para que se vea más poblado
        const particleCount = 180;
        const connectionDistance = 180;
        const mouseDistance = 280; // Slightly larger range

        let mouse = { x: undefined, y: undefined };

        // Variables for 3D Parallax effect
        let targetParallaxX = 0;
        let targetParallaxY = 0;
        let currentParallaxX = 0;
        let currentParallaxY = 0;

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
                // Posición real (extendemos un poco el área de spawn para que no se vean bordes cortados al hacer parallax)
                this.x = Math.random() * (width + 200) - 100;
                this.y = Math.random() * (height + 200) - 100;

                // Nuevo cálculo de Z: Math.pow crea una curva que hace que haya MUY POCAS
                // partículas cercanas (Z grande) y MUCHAS partículas lejanas (Z pequeño).
                // Valores de profundidad virtual desde 0.15 (muy al fondo) a 1.8 (muy al frente)
                this.z = Math.pow(Math.random(), 2) * 1.65 + 0.15;

                // Slower, smoother movement
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.baseSize = Math.random() * 2.5 + 1; // Base size

                // Posición aparente en pantalla
                this.screenX = this.x;
                this.screenY = this.y;
            }

            update(parallaxX, parallaxY) {
                this.x += this.vx;
                this.y += this.vy;

                // Rebotar en los límites "virtuales" extendidos
                if (this.x < -150 || this.x > width + 150) this.vx *= -1;
                if (this.y < -150 || this.y > height + 150) this.vy *= -1;

                // Aplicar el efecto de profundidad (Parallax) según el eje Z
                this.screenX = this.x - (parallaxX * this.z);
                this.screenY = this.y - (parallaxY * this.z);

                // Mouse interaction - Smooth repulsion (usando coordenadas de pantalla)
                if (mouse.x != undefined) {
                    let dx = mouse.x - this.screenX;
                    let dy = mouse.y - this.screenY;
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
                        ctx.moveTo(this.screenX, this.screenY);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        // Gentle push (Aplicado a la posición base x, y)
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouseDistance - distance) / mouseDistance;
                        const directionX = forceDirectionX * force * 0.4;
                        const directionY = forceDirectionY * force * 0.4;

                        // Modificar la magnitud del empujón según la profundidad ayuda al efecto 3D
                        this.x -= directionX * (1.5 - this.z);
                        this.y -= directionY * (1.5 - this.z);

                        // Recalcular screen X y Y luego del empujón
                        this.screenX = this.x - (parallaxX * this.z);
                        this.screenY = this.y - (parallaxY * this.z);
                    }
                }
            }

            draw() {
                ctx.beginPath();

                // Efecto de perspectiva: las partículas más cercanas (Z mayor) se ven levemente más grandes
                let displaySize = this.baseSize * (this.z * 0.8);

                ctx.arc(this.screenX, this.screenY, displaySize, 0, Math.PI * 2);

                // Dynamic colors based on theme, con opacidad influenciada por la profundidad
                let baseOpacity = 0.3 + (this.z * 0.45); // Partículas más lejanas se ven más transparentes

                if (currentTheme === 'light') {
                    ctx.fillStyle = `rgba(59, 130, 246, ${baseOpacity})`;
                } else {
                    ctx.fillStyle = `rgba(59, 130, 246, ${baseOpacity})`;
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

            // Calcular Parallax Objetivo (desplazamiento en función del centro de la pantalla)
            if (mouse.x != undefined) {
                targetParallaxX = (mouse.x - width / 2) * 0.20; // 20% max shift effect
                targetParallaxY = (mouse.y - height / 2) * 0.20;
            } else {
                // Volver lentamente a 0 si el mouse sale de la pantalla
                targetParallaxX = 0;
                targetParallaxY = 0;
            }

            // Lerp: Suavizar el movimiento del Parallax global
            currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
            currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

            // Ordenar partículas por profundidad (Z) de lejano a cercano da un mejor efecto
            // pero para performance usaremos el orden original, ya que son formas traslúcidas

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(currentParallaxX, currentParallaxY);
                particlesArray[i].draw();

                for (let j = i; j < particlesArray.length; j++) {
                    let dx = particlesArray[i].screenX - particlesArray[j].screenX;
                    let dy = particlesArray[i].screenY - particlesArray[j].screenY;

                    // La distancia también se calcula usando su posición parálaxial
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        // Refined line opacity
                        let opacity = 1 - (distance / connectionDistance);

                        // Opcional: reducir la opacidad si conectan dos puntos con mucha diferencia de profundidad
                        let zDiff = Math.abs(particlesArray[i].z - particlesArray[j].z);
                        opacity *= Math.max(0, 1 - (zDiff * 0.5)); // Atenúa la línea si cruza mucha profundidad

                        if (currentTheme === 'light') {
                            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.35})`;
                        } else {
                            // Blanco puro con mayor opacidad para que resalten frente al negro
                            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.25})`;
                        }
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].screenX, particlesArray[i].screenY);
                        ctx.lineTo(particlesArray[j].screenX, particlesArray[j].screenY);
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
