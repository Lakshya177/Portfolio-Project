// ══════════════════════════════════════════════════
        //  CURSOR
        // ══════════════════════════════════════════════════
        const cur = document.getElementById('cur');
        const curDot = document.getElementById('cur-dot');
        let mx = 0, my = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function moveCursor() {
            cx += (mx - cx) * .14; cy += (my - cy) * .14;
            cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
            curDot.style.left = mx + 'px'; curDot.style.top = my + 'px';
            requestAnimationFrame(moveCursor);
        })();

        // ══════════════════════════════════════════════════
        //  MOBILE NAV TOGGLE
        // ══════════════════════════════════════════════════
        const navToggle = document.getElementById('navToggle');
        const navLinksEl = document.getElementById('navLinks');
        if (navToggle && navLinksEl) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navLinksEl.classList.toggle('active');
            });

            // Close menu on link click
            navLinksEl.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navLinksEl.classList.remove('active');
                });
            });
        }

        // ══════════════════════════════════════════════════
        //  SCROLL PROGRESS
        // ══════════════════════════════════════════════════
        const prog = document.getElementById('progress');
        window.addEventListener('scroll', () => {
            prog.style.width = (window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
        }, { passive: true });

        // ══════════════════════════════════════════════════
        //  PARTICLES
        // ══════════════════════════════════════════════════
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        const PCOLS = ['#FF5800', '#0051A2', '#FFD500', '#009B48', '#C41E3A'];
        function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() { this.init(true); }
            init(rand) {
                this.x = Math.random() * canvas.width;
                this.y = rand ? Math.random() * canvas.height : canvas.height + 10;
                this.sz = Math.random() * 7 + 2;
                this.col = PCOLS[Math.floor(Math.random() * PCOLS.length)];
                this.vx = (Math.random() - .5) * .5;
                this.vy = -(Math.random() * .45 + .1);
                this.rot = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - .5) * .045;
                this.a = Math.random() * .12 + .02; // Reduced opacity for atmospheric feel
            }
            tick() {
                this.x += this.vx; this.y += this.vy; this.rot += this.spin;
                if (this.y < -12 || this.x < -12 || this.x > canvas.width + 12) this.init(false);
            }
            draw() {
                ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
                ctx.globalAlpha = this.a; ctx.fillStyle = this.col;
                ctx.fillRect(-this.sz / 2, -this.sz / 2, this.sz, this.sz);
                ctx.restore();
            }
        }
        const parts = Array.from({ length: 72 }, () => new Particle());
        (function tickP() { ctx.clearRect(0, 0, canvas.width, canvas.height); parts.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(tickP); })();

        // ══════════════════════════════════════════════════
        //  3D RUBIK'S CUBE — FULL 27-CUBIE SYSTEM
        // ══════════════════════════════════════════════════
        const CUBIE_PX = 66;
        const GAP_PX = 0;
        const HALF_PX = 33;
        const STEP_PX = 66;

        const FC = {
            front: { bg: '#009B48', cls: 'fc-green' },
            back: { bg: '#0051A2', cls: 'fc-blue' },
            right: { bg: '#C41E3A', cls: 'fc-red' },
            left: { bg: '#FF5800', cls: 'fc-orange' },
            top: { bg: '#FFFFFF', cls: 'fc-white' },
            bottom: { bg: '#FFD500', cls: 'fc-yellow' },
            inner: { bg: '#1a1a1a', cls: 'fc-inner' },
        };

        const FACE_DEFS = [
            { key: 'front', t: `translateZ(${HALF_PX}px)` },
            { key: 'back', t: `rotateY(180deg) translateZ(${HALF_PX}px)` },
            { key: 'right', t: `rotateY(90deg) translateZ(${HALF_PX}px)` },
            { key: 'left', t: `rotateY(-90deg) translateZ(${HALF_PX}px)` },
            { key: 'top', t: `rotateX(90deg) translateZ(${HALF_PX}px)` },
            { key: 'bottom', t: `rotateX(-90deg) translateZ(${HALF_PX}px)` },
        ];

        const cubeScene = document.getElementById('cubeScene');
        const cubies = [];

        function makeCubie(lx, ly, lz) {
            const el = document.createElement('div');
            el.className = 'cubie';
            FACE_DEFS.forEach(fd => {
                let fc = FC.inner;
                if (fd.key === 'front' && lz === 1) fc = FC.front;
                if (fd.key === 'back' && lz === -1) fc = FC.back;
                if (fd.key === 'right' && lx === 1) fc = FC.right;
                if (fd.key === 'left' && lx === -1) fc = FC.left;
                if (fd.key === 'top' && ly === 1) fc = FC.top;
                if (fd.key === 'bottom' && ly === -1) fc = FC.bottom;

                const face = document.createElement('div');
                face.className = 'cubie-face ' + fc.cls;
                face.style.transform = fd.t + (fc === FC.inner ? ' scale(0.98)' : '');
                if (fc !== FC.inner) {
                    face.style.backgroundColor = fc.bg;
                    face.innerHTML = '<div class="gloss"></div><div class="shine"></div>';
                } else {
                    face.style.backgroundColor = '#111';
                }
                el.appendChild(face);
            });
            const m = new DOMMatrix().translate(lx * STEP_PX, -ly * STEP_PX, lz * STEP_PX);
            el.style.transform = m.toString();
            return { el, m };
        }

        function buildCube() {
            cubeScene.innerHTML = '';
            cubies.length = 0;
            for (let y = 1; y >= -1; y--) {
                for (let x = -1; x <= 1; x++) {
                    for (let z = 1; z >= -1; z--) {
                        const c = makeCubie(x, y, z);
                        cubeScene.appendChild(c.el);
                        cubies.push(c);
                    }
                }
            }
        }

        function snap(m) {
            // Round translation components to nearest STEP_PX
            m.m41 = Math.round(m.m41 / STEP_PX) * STEP_PX;
            m.m42 = Math.round(m.m42 / STEP_PX) * STEP_PX;
            m.m43 = Math.round(m.m43 / STEP_PX) * STEP_PX;

            // Round rotation components (top-left 3x3) to nearest integer (-1, 0, or 1)
            // This ensures orthogonality and prevents skewing/distortion
            ['m11', 'm12', 'm13', 'm21', 'm22', 'm23', 'm31', 'm32', 'm33'].forEach(f => {
                if (Math.abs(m[f]) < 0.1) m[f] = 0;
                else m[f] = Math.sign(m[f]);
            });
        }

        function rotateLayer(axis, slice, angle, ms) {
            return new Promise(resolve => {
                // Select cubies based on their current world-space snap-points
                const layer = cubies.filter(c => {
                    const x = Math.round(c.m.m41 / STEP_PX);
                    const y = Math.round(-c.m.m42 / STEP_PX);
                    const z = Math.round(c.m.m43 / STEP_PX);
                    const val = (axis === 'x') ? x : (axis === 'y' ? y : z);
                    return val === slice;
                });

                if (layer.length === 0) { resolve(); return; }

                // Create a temporary pivot at scene origin
                const pivot = document.createElement('div');
                pivot.style.cssText = 'position:absolute;width:0;height:0;transform-style:preserve-3d;';
                cubeScene.appendChild(pivot);
                layer.forEach(c => pivot.appendChild(c.el));

                pivot.getBoundingClientRect(); // force layout

                // Animation setup
                if (ms > 0) {
                    pivot.style.transition = `transform ${ms}ms cubic-bezier(0.34, 1.25, 0.64, 1)`;
                }
                pivot.style.transform = axis === 'y' ? `rotateY(${angle}deg)` :
                    axis === 'x' ? `rotateX(${angle}deg)` :
                        `rotateZ(${angle}deg)`;

                setTimeout(() => {
                    const rotStr = axis === 'y' ? `rotateY(${angle}deg)` :
                        axis === 'x' ? `rotateX(${angle}deg)` :
                            `rotateZ(${angle}deg)`;
                    const rotM = new DOMMatrix(rotStr);

                    layer.forEach(c => {
                        // Math: New World Matrix = Rotation * Old World Matrix
                        c.m = rotM.multiply(c.m);

                        // CRITICAL: Snap the matrix to clean integers to prevent drift/skew
                        snap(c.m);

                        // Re-parent back to the main scene
                        cubeScene.appendChild(c.el);

                        // Set the new transformation instantly
                        c.el.style.transition = 'none';
                        c.el.style.transform = c.m.toString();
                        void c.el.offsetHeight; // force reflow
                    });

                    pivot.remove();
                    resolve();
                }, ms + 40); // extra padding to ensure animation is 100% done
            });
        }

        // ── Move definitions ─────────────────────────────
        const MOVES = [
            { axis: 'y', slice: 1, angle: 90 }, { axis: 'y', slice: 1, angle: -90 },
            { axis: 'y', slice: 0, angle: 90 }, { axis: 'y', slice: 0, angle: -90 },
            { axis: 'y', slice: -1, angle: 90 }, { axis: 'y', slice: -1, angle: -90 },
            { axis: 'x', slice: 1, angle: 90 }, { axis: 'x', slice: 1, angle: -90 },
            { axis: 'x', slice: 0, angle: 90 }, { axis: 'x', slice: 0, angle: -90 },
            { axis: 'x', slice: -1, angle: 90 }, { axis: 'x', slice: -1, angle: -90 },
            { axis: 'z', slice: 1, angle: 90 }, { axis: 'z', slice: 1, angle: -90 },
            { axis: 'z', slice: -1, angle: 90 }, { axis: 'z', slice: -1, angle: -90 },
        ];

        let history = [];
        let busy = false;
        let manualMode = false;
        let manualTimer;

        function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

        function setStatus(txt) {
            const el = document.getElementById('cubeStatus');
            if (el) el.textContent = txt;
        }

        function setBtnsDisabled(v) {
            const b1 = document.getElementById('btnScramble');
            const b2 = document.getElementById('btnSolve');
            if (b1) b1.disabled = v;
            if (b2) b2.disabled = v;
        }

        // ── Scramble ─────────────────────────────────────
        async function scramble(n = 14, ms = 185) {
            if (busy) return;
            busy = true; setBtnsDisabled(true);
            setStatus('Scrambling...');
            history = [];

            for (let i = 0; i < n; i++) {
                let m;
                do { m = MOVES[Math.floor(Math.random() * MOVES.length)]; }
                while (history.length && history[history.length - 1].axis === m.axis && history[history.length - 1].slice === m.slice);
                history.push(m);
                await rotateLayer(m.axis, m.slice, m.angle, ms);
                await sleep(18);
            }
            busy = false; setBtnsDisabled(false);
            setStatus('Scrambled — ready to solve');
        }

        // ── Solve (reverse the history) ──────────────────
        async function solve(ms = 340) {
            if (busy || !history.length) return;
            busy = true; setBtnsDisabled(true);
            setStatus('Solving...');

            const moves = [...history].reverse().map(m => ({ ...m, angle: -m.angle }));
            for (const m of moves) {
                await rotateLayer(m.axis, m.slice, m.angle, ms);
                await sleep(28);
            }
            history = [];
            busy = false; setBtnsDisabled(false);
            setStatus('Solved! ✓');
        }

        async function startScrambleSolve(n = 10, ms = 360) {
            const cubeWrapper = document.getElementById("cubeWrapper");
            if (!cubeWrapper) return;

            cubeWrapper.style.opacity = 0;
            await scramble(n, 0);
            cubeWrapper.style.opacity = 1;
            await sleep(400);
            await solve(ms);
        }

        // Build and start
        buildCube();
        startScrambleSolve(10, 380);

        // Buttons
        document.getElementById('btnScramble').addEventListener('click', () => {
            if (history.length > 0) return; // Only scramble if currently solved or at start
            manualMode = true; clearTimeout(manualTimer);
            manualTimer = setTimeout(() => { manualMode = false; }, 15000);
            scramble(14, 200);
        });
        document.getElementById('btnSolve').addEventListener('click', () => {
            manualMode = true; clearTimeout(manualTimer);
            manualTimer = setTimeout(() => { manualMode = false; }, 15000);
            solve(380);
        });

        // ══════════════════════════════════════════════════
        //  WHOLE-CUBE DRAG WITH INERTIA
        // ══════════════════════════════════════════════════
        let rotX = -22, rotY = 45;
        let velX = 0, velY = 0;
        let dragging = false, lx2 = 0, ly2 = 0;
        let lastDx = 0, lastDy = 0;

        function applyRot() {
            cubeScene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        (function animRot() {
            if (!dragging) {
                // Inertia decay
                velY *= 0.92; velX *= 0.92;
                // Drift toward gentle auto-rotate when not in manual mode
                if (!manualMode && !busy) {
                    velY += (0.25 - velY) * 0.025;
                    velX += (0 - velX) * 0.025;
                }
                rotY += velY;
                rotX += velX;
                // Clamp pitch
                rotX = Math.max(-65, Math.min(65, rotX));
            }
            applyRot();
            requestAnimationFrame(animRot);
        })();

        // Mouse drag
        const cubeVP = document.querySelector('.cube-viewport');
        cubeVP.addEventListener('mousedown', e => {
            dragging = true; lx2 = e.clientX; ly2 = e.clientY;
            velX = 0; velY = 0; lastDx = 0; lastDy = 0;
            manualMode = true; clearTimeout(manualTimer);
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            lastDx = (e.clientX - lx2) * 0.45;
            lastDy = (e.clientY - ly2) * 0.45;
            rotY += lastDx; rotX -= lastDy;
            rotX = Math.max(-65, Math.min(65, rotX));
            lx2 = e.clientX; ly2 = e.clientY;
        });
        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            // Pass final delta as launch velocity for inertia
            velY = lastDx * 0.85;
            velX = -lastDy * 0.85;
            manualTimer = setTimeout(() => { manualMode = false; }, 8000);
        });

        // Touch drag
        cubeVP.addEventListener('touchstart', e => {
            dragging = true; lx2 = e.touches[0].clientX; ly2 = e.touches[0].clientY;
            velX = 0; velY = 0; lastDx = 0; lastDy = 0;
            manualMode = true; clearTimeout(manualTimer);
        }, { passive: true });
        document.addEventListener('touchmove', e => {
            if (!dragging) return;
            lastDx = (e.touches[0].clientX - lx2) * 0.45;
            lastDy = (e.touches[0].clientY - ly2) * 0.45;
            rotY += lastDx; rotX -= lastDy;
            rotX = Math.max(-65, Math.min(65, rotX));
            lx2 = e.touches[0].clientX; ly2 = e.touches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchend', () => {
            dragging = false;
            velY = lastDx * 0.85; velX = -lastDy * 0.85;
            manualTimer = setTimeout(() => { manualMode = false; }, 8000);
        });

        // ══════════════════════════════════════════════════
        //  TYPEWRITER
        // ══════════════════════════════════════════════════
        const typedEl = document.getElementById('typed');
        const words = ['Java Developer', 'Spring Boot Developer', 'Frontend Developer', 'Backend Developer', 'Hibernate & JPA Developer', 'REST API Developer','Microservices Developer'];
        let wi = 0, ci = 0, isDeleting = false;
        (function type() {
            const w = words[wi];
            typedEl.textContent = isDeleting ? w.slice(0, --ci) : w.slice(0, ++ci);
            let spd = isDeleting ? 52 : 92;
            if (!isDeleting && ci === w.length) { spd = 1900; isDeleting = true; }
            else if (isDeleting && ci === 0) { isDeleting = false; wi = (wi + 1) % words.length; spd = 290; }
            setTimeout(type, spd);
        })();

        // ══════════════════════════════════════════════════
        //  SCROLL ANIMATIONS
        // ══════════════════════════════════════════════════
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                e.target.classList.add('vis');

                // Count up animation for stats
                if (e.target.classList.contains('stat')) {
                    const numEl = e.target.querySelector('.stat-n');
                    if (numEl) {
                        const target = parseFloat(numEl.dataset.target);
                        const decimals = parseInt(numEl.dataset.decimals) || 0;
                        let current = 0;
                        const duration = 2000;
                        const start = performance.now();

                        function update(now) {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease out expo
                            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                            current = ease * target;
                            numEl.textContent = current.toFixed(decimals) + (decimals === 0 ? '+' : '');
                            if (progress < 1) requestAnimationFrame(update);
                        }
                        requestAnimationFrame(update);
                    }
                }

                const bar = e.target.querySelector('.bar');
                if (bar) setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 350);
            });
        }, { threshold: .18 });
        document.querySelectorAll('.up, .stat').forEach(el => io.observe(el));

        // ══════════════════════════════════════════════════
        //  MAGNETIC BUTTONS
        // ══════════════════════════════════════════════════
        document.addEventListener('mousemove', e => {
            const btns = document.querySelectorAll('.btn-m');
            btns.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const relX = e.clientX - centerX;
                const relY = e.clientY - centerY;

                // Closest point calculation for rectangular boundaries
                const closestX = Math.max(rect.left, Math.min(e.clientX, rect.right));
                const closestY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
                const dx = e.clientX - closestX;
                const dy = e.clientY - closestY;
                const distToBoundary = Math.sqrt(dx * dx + dy * dy);

                if (distToBoundary < 100) {
                    const factor = 0.15;
                    btn.style.transform = `translate(${relX * factor}px, ${relY * factor}px)`;
                } else {
                    btn.style.transform = `translate(0, 0)`;
                }
            });
        });

        const barIO = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const bar = e.target.querySelector('.bar');
                if (bar) setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 420);
            });
        }, { threshold: .4 });
        document.querySelectorAll('.skill-card').forEach(c => barIO.observe(c));

        // ══════════════════════════════════════════════════
        //  NAV ACTIVE STATE
        // ══════════════════════════════════════════════════
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        window.addEventListener('scroll', () => {
            let cur2 = '';
            sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur2 = s.id; });
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur2));
        }, { passive: true });

        // ══════════════════════════════════════════════════
        //  EMAILJS FORM SUBMISSION
        // ══════════════════════════════════════════════════
        const contactForm = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');

        if (contactForm && submitBtn) {
            contactForm.addEventListener('submit', function (event) {
                event.preventDefault();

                // Initial button state
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending... <span class="spinner"></span>';
                    emailjs.send("service_b3j66cr","template_3g46y6d",
                    {
                        name: event.target.elements.name.value,
                        from_name: event.target.elements.name.value,
                        email: event.target.elements.email.value,
                        reply_to: event.target.elements.email.value,
                        subject: event.target.elements.subject.value,
                        message: event.target.elements.message.value
                    },
                    'RGHZabu1IgOd5Fnb5'
                )
                    .then(() => {
                        submitBtn.innerHTML = 'Sent Successfully! ✅';
                        submitBtn.style.background = 'var(--green)';
                        contactForm.reset();
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.style.background = '';
                        }, 5000);
                    }, (error) => {
                        console.error('EmailJS FAILED...', error);
                        submitBtn.innerHTML = 'Error! ❌';
                        submitBtn.style.background = 'var(--red)';
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                            submitBtn.style.background = '';
                        }, 5000);
                    });
            });
        }
    
const boxes = document.querySelectorAll('.resume-box');

window.addEventListener('scroll', () => {
    const triggerBottom = window.innerHeight * 0.85;

    boxes.forEach(box => {
        const boxTop = box.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
            box.classList.add('show');
        }
    });
});

document.querySelectorAll('.up, .stat').forEach(el => io.observe(el));