/**
 * The Gupta Age - Main Interactive Logic & Orchestrator
 * Integrates GSAP ScrollTrigger, 3D tilt cards, unrolling manuscript scroll,
 * interactive ancient India map nodes, science simulators, and stone rubbing tablet.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    initNavigation();
    initHeroButton();
    initScrollTriggers();
    initRoyal3DTiltCards();
    initManuscriptScroll();
    initMapInteraction();
    initScienceSimulators();
    initEconomyInteraction();
    initStoneRubbingTablet();
    initModalSystem();
    initAudioUI();
});

/* -------------------------------------------------------------
   NAVIGATION & PROGRESS
   ------------------------------------------------------------- */
function initNavigation() {
    const nav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const progressBar = document.getElementById('scroll-progress-bar');

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
            if (window.soundEngine) window.soundEngine.playTempleBell(440);
        });
    });

    // Mobile menu toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
    }

    // Scroll progress & active link updates
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;

        // Nav background elevation on scroll
        if (nav) {
            if (scrollTop > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    }, { passive: true });
}

/* -------------------------------------------------------------
   HERO "ENTER THE ARCHIVE"
   ------------------------------------------------------------- */
function initHeroButton() {
    const enterBtn = document.getElementById('btn-enter-archive');
    if (!enterBtn) return;

    enterBtn.addEventListener('click', () => {
        // Trigger sound if active
        if (window.soundEngine) {
            if (window.soundEngine.isMuted) {
                window.soundEngine.toggle();
                const soundBtn = document.getElementById('sound-toggle-btn');
                if (soundBtn) soundBtn.classList.add('sound-active');
            }
            window.soundEngine.playTempleBell(587.33);
        }

        // Camera dive in Three.js
        if (window.masterScene && window.masterScene.camera) {
            gsap.to(window.masterScene.camera.position, {
                z: 11,
                y: 3.5,
                duration: 1.6,
                ease: "power2.inOut"
            });
        }

        // Smooth scroll to Section 1
        const section1 = document.getElementById('empire');
        if (section1) {
            setTimeout(() => {
                section1.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    });
}

/* -------------------------------------------------------------
   GSAP SCROLL TRIGGER ORCHESTRATION
   ------------------------------------------------------------- */
function initScrollTriggers() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const sections = [
        { id: 'hero', index: 0 },
        { id: 'empire', index: 1 },
        { id: 'rulers', index: 2 },
        { id: 'science', index: 3 },
        { id: 'literature', index: 4 },
        { id: 'art', index: 5 },
        { id: 'economy', index: 6 },
        { id: 'culture', index: 7 },
        { id: 'decline', index: 8 },
        { id: 'legacy', index: 9 },
        { id: 'inscription', index: 10 }
    ];

    sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (!el) return;

        ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => {
                if (window.masterScene) window.masterScene.updateSectionChoreography(sec.index, 0);
                updateActiveNavLink(sec.id);
            },
            onEnterBack: () => {
                if (window.masterScene) window.masterScene.updateSectionChoreography(sec.index, 1);
                updateActiveNavLink(sec.id);
            }
        });

        // Elegant fade-up reveal for cards and text
        const revealElements = el.querySelectorAll('.fade-up-element');
        if (revealElements.length > 0) {
            gsap.fromTo(revealElements,
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 75%"
                    }
                }
            );
        }
    });
}

function updateActiveNavLink(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', href === sectionId);
    });
}

/* -------------------------------------------------------------
   SECTION 2: 3D ROYAL TILT CARDS
   ------------------------------------------------------------- */
function initRoyal3DTiltCards() {
    const cards = document.querySelectorAll('.royal-3d-card');

    cards.forEach(card => {
        const cardInner = card.querySelector('.royal-card-inner');
        const glare = card.querySelector('.card-glare');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            if (cardInner) {
                cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
            }

            if (glare) {
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 235, 170, 0.35) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 80%)`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (cardInner) {
                cardInner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
                cardInner.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            }
            if (glare) {
                glare.style.opacity = '0';
            }
        });

        card.addEventListener('mouseenter', () => {
            if (cardInner) {
                cardInner.style.transition = 'none';
            }
        });
    });
}

/* -------------------------------------------------------------
   SECTION 4: UNROLLING MANUSCRIPT SCROLL ANIMATION
   ------------------------------------------------------------- */
function initManuscriptScroll() {
    const exploreBtn = document.getElementById('btn-explore-scroll');
    const scrollContainer = document.getElementById('manuscript-scroll-modal');
    const closeScrollBtn = document.getElementById('btn-close-scroll');
    const parchmentBody = document.getElementById('parchment-scroll-body');

    if (!exploreBtn || !scrollContainer) return;

    exploreBtn.addEventListener('click', () => {
        scrollContainer.classList.add('open');
        document.body.style.overflow = 'hidden';

        if (window.soundEngine) {
            window.soundEngine.playTempleBell(523.25);
        }

        // Animate unrolling of ancient parchment
        if (parchmentBody) {
            gsap.fromTo(parchmentBody,
                { scaleY: 0.05, opacity: 0.3 },
                { scaleY: 1, opacity: 1, duration: 1.1, ease: "power3.out" }
            );
        }
    });

    const closeScroll = () => {
        if (parchmentBody) {
            gsap.to(parchmentBody, {
                scaleY: 0.05,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    scrollContainer.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        } else {
            scrollContainer.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    if (closeScrollBtn) closeScrollBtn.addEventListener('click', closeScroll);
    scrollContainer.addEventListener('click', (e) => {
        if (e.target === scrollContainer) closeScroll();
    });
}

/* -------------------------------------------------------------
   SECTION 1: INTERACTIVE ANCIENT INDIA EMPIRE MAP
   ------------------------------------------------------------- */
function initMapInteraction() {
    const mapNodes = document.querySelectorAll('.map-city-node');
    const infoTitle = document.getElementById('map-info-title');
    const infoRole = document.getElementById('map-info-role');
    const infoDesc = document.getElementById('map-info-desc');
    const infoSignificance = document.getElementById('map-info-significance');

    const cityData = {
        pataliputra: {
            title: "Pāṭaliputra (Patna)",
            role: "Imperial Capital of the Gupta Dynasty",
            desc: "The seat of imperial power overlooking the confluence of sacred rivers. Faxian described it as a magnificent city with stone palaces built like works of spirits, vast hospitals offering free medical care, and thriving charitable rest-houses.",
            significance: "Administrative centre, royal treasury, and imperial mint producing the finest gold dinaras."
        },
        ujjain: {
            title: "Ujjayinī (Ujjain)",
            role: "Commercial Capital & Cultural Meridian",
            desc: "The glorious second capital under Chandragupta II Vikramaditya. Home to the illustrious Navaratnas (Nine Gems) including poet Kalidasa and astronomer Varahamihira. Served as the Prime Meridian of ancient Indian astronomy.",
            significance: "Focal hub connecting interior Northern India with Arabian Sea ports like Bharuch."
        },
        nalanda: {
            title: "Nālandā Mahāvihāra",
            role: "Global Center of Higher Learning",
            desc: "Founded by Kumaragupta I (c. 427 CE), Nalanda housed over 10,000 scholars and 2,000 teachers from across Asia. Its 9-storey library, Dharmaganja, was the greatest archive of manuscripts in the ancient world.",
            significance: "Birthplace of Mahayana Buddhist philosophy, logic (Nyaya), linguistics, and medicine."
        },
        mathura: {
            title: "Mathurā",
            role: "Pinnacle Center of Gupta Art & Sculptural School",
            desc: "World-renowned for red sandstone sculptures characterized by delicate drapery, spiritual introspection, and exquisite anatomical grace. Synthesized Hindu, Buddhist, and Jain iconographies.",
            significance: "Major trade crossroads connecting Northern routes (Uttarapatha) with the Yamuna river valley."
        },
        prayaga: {
            title: "Prayāga (Allahabad)",
            role: "Site of the Great Allahabad Pillar (Prayag Prashasti)",
            desc: "The confluence of Ganga, Yamuna, and Saraswati where Samudragupta carved his monumental victory inscription (Prashasti) composed in classical Sanskrit verse by court poet Harishena.",
            significance: "Sacred ritual center and imperial assembly grounds."
        },
        bharuch: {
            title: "Bhrigukachha (Bharuch / Barygaza)",
            role: "Chief Western Maritime Port to Rome & Egypt",
            desc: "The vital Arabian Sea port through which Gupta cotton, fine silk, spices, lapis lazuli, and Wootz steel flowed to Alexandria, Rome, and Persia in exchange for Roman gold dinarii and wine.",
            significance: "Fueled the immense commercial wealth of the western empire."
        },
        tamralipti: {
            title: "Tāmralipti (Tamluk, Bengal)",
            role: "Chief Eastern Maritime Port to Southeast Asia",
            desc: "The bustling Bay of Bengal harbor where merchant ships set sail for Suvarnabhumi (Southeast Asia), Sri Lanka, and China. Chinese pilgrims Faxian and later Xuanzang embarked here.",
            significance: "Maritime gateway for Indian cultural, literary, and architectural diffusion across Asia."
        }
    };

    mapNodes.forEach(node => {
        node.addEventListener('click', () => {
            const cityKey = node.getAttribute('data-city');
            const data = cityData[cityKey];
            if (!data) return;

            mapNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            if (infoTitle) infoTitle.textContent = data.title;
            if (infoRole) infoRole.textContent = data.role;
            if (infoDesc) infoDesc.textContent = data.desc;
            if (infoSignificance) infoSignificance.textContent = data.significance;

            if (window.soundEngine) window.soundEngine.playTempleBell(493.88);
        });
    });
}

/* -------------------------------------------------------------
   SECTION 3: SCIENCE & ARYABHATA SIMULATORS
   ------------------------------------------------------------- */
function initScienceSimulators() {
    // 1. Aryabhata's Pi calculation interactive slider
    const piDiameterInput = document.getElementById('pi-diameter-input');
    const piCircumferenceDisplay = document.getElementById('pi-circ-display');
    const piRatioDisplay = document.getElementById('pi-ratio-display');

    if (piDiameterInput && piCircumferenceDisplay && piRatioDisplay) {
        const updatePi = () => {
            const d = parseFloat(piDiameterInput.value);
            // Aryabhata's formula: "Add 4 to 100, multiply by 8, add 62,000. For a diameter of 20,000, circumference is 62,832"
            // Ratio = 62832 / 20000 = 3.1416
            const aryaPi = 62832 / 20000;
            const circ = (d * aryaPi).toFixed(4);
            piCircumferenceDisplay.textContent = circ;
            piRatioDisplay.textContent = `${circ} / ${d} = ${aryaPi}`;
        };
        piDiameterInput.addEventListener('input', updatePi);
        updatePi();
    }

    // 2. Interactive Sine (Jya) & Earth rotation toggle
    const earthRotateBtn = document.getElementById('btn-toggle-earth-rotation');
    const earthStatusEl = document.getElementById('earth-rotation-status');

    if (earthRotateBtn && earthStatusEl) {
        let isRotating = true;
        earthRotateBtn.addEventListener('click', () => {
            isRotating = !isRotating;
            earthStatusEl.textContent = isRotating
                ? "Aryabhata's Principle: Earth rotates on its own axis daily (365.25868 days/year)"
                : "Geocentric illusion: Stars appearing to move around a stationary Earth";
            earthRotateBtn.classList.toggle('active', isRotating);
        });
    }
}

/* -------------------------------------------------------------
   SECTION 6: ECONOMY & FALLING COIN INTERACTION
   ------------------------------------------------------------- */
function initEconomyInteraction() {
    const mintCoinBtn = document.getElementById('btn-mint-coin');
    const coinCounter = document.getElementById('minted-coins-counter');
    let count = 108;

    if (mintCoinBtn) {
        mintCoinBtn.addEventListener('click', () => {
            count += 12;
            if (coinCounter) coinCounter.textContent = count.toLocaleString();

            if (window.soundEngine) {
                window.soundEngine.playCoinChime();
                setTimeout(() => window.soundEngine.playCoinChime(), 120);
                setTimeout(() => window.soundEngine.playCoinChime(), 240);
            }

            // Spawn extra falling coins in Three.js
            if (window.masterScene && window.masterScene.coinRainGroup) {
                window.masterScene.coinRainGroup.visible = true;
                window.masterScene.fallingCoins.forEach(coin => {
                    coin.position.y = 20 + Math.random() * 15;
                    coin.userData.fallSpeed = 0.12 + Math.random() * 0.1;
                });
            }
        });
    }
}

/* -------------------------------------------------------------
   SECTION 10: INTERACTIVE ANCIENT STONE RUBBING TABLET
   ------------------------------------------------------------- */
function initStoneRubbingTablet() {
    const canvas = document.getElementById('stone-rubbing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 240;

    // Draw Ancient Sandstone Inscription Slab
    const drawStoneBase = () => {
        // Sandstone background
        ctx.fillStyle = '#261b12';
        ctx.fillRect(0, 0, width, height);

        // Stone texture grain
        for (let i = 0; i < 15000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillStyle = `rgba(180, 140, 90, ${0.05 + Math.random() * 0.1})`;
            ctx.fillRect(x, y, 2, 2);
        }

        // Faint Brahmi carved inscription text
        ctx.font = '28px serif';
        ctx.fillStyle = '#443224';
        ctx.textAlign = 'center';
        ctx.fillText('𑀚𑀬𑀢𑀺 𑀤𑀺𑀯𑀁 𑀚𑀬𑀢𑀺 𑀧𑀾𑀣𑀺𑀯𑀻𑀁 𑀕𑀼𑀧𑁆𑀢 𑀓𑀼𑀮 𑀢𑀺𑀮𑀓𑀂', width / 2, 70);
        ctx.fillText('𑀅𑀦𑀦𑁆𑀢 𑀓𑀻𑀭𑁆𑀢𑀺 𑀧𑁆𑀭𑀢𑀸𑀧 𑀯𑀺𑀓𑁆𑀭𑀫𑀸𑀤𑀺𑀢𑁆𑀬𑀂', width / 2, 130);
        ctx.fillText('“A Legacy Written in Stone • Preserved Through the Ages”', width / 2, 190);
    };

    drawStoneBase();

    // Charcoal Rubbing interaction: mouse dragging rubs gold onto carved characters
    let isRubbing = false;

    const rubAt = (x, y) => {
        const rad = 24;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, 'rgba(255, 220, 120, 0.45)');
        grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();

        // Reveal glowing Brahmi letter at contact point
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = 'bold 28px serif';
        ctx.fillStyle = '#fff4bd';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 12;
        ctx.fillText('𑀚𑀬𑀢𑀺 𑀤𑀺𑀯𑀁 𑀚𑀬𑀢𑀺 𑀧𑀾𑀣𑀺𑀯𑀻𑀁 𑀕𑀼𑀧𑁆𑀢 𑀓𑀼𑀮 𑀢𑀺𑀮𑀓𑀂', width / 2, 70);
        ctx.fillText('𑀅𑀦𑀦𑁆𑀢 𑀓𑀻𑀭𑁆𑀢𑀺 𑀧𑁆𑀭𑀢𑀸𑀧 𑀯𑀺𑀓𑁆𑀭𑀫𑀸𑀤𑀺𑀢𑁆𑀬𑀂', width / 2, 130);
        ctx.fillText('“A Legacy Written in Stone • Preserved Through the Ages”', width / 2, 190);
        ctx.restore();
    };

    canvas.addEventListener('mousedown', (e) => {
        isRubbing = true;
        const r = canvas.getBoundingClientRect();
        rubAt(e.clientX - r.left, e.clientY - r.top);
    });

    window.addEventListener('mouseup', () => { isRubbing = false; });

    canvas.addEventListener('mousemove', (e) => {
        if (!isRubbing) return;
        const r = canvas.getBoundingClientRect();
        rubAt(e.clientX - r.left, e.clientY - r.top);
    });

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isRubbing = true;
            const r = canvas.getBoundingClientRect();
            rubAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (!isRubbing || e.touches.length !== 1) return;
        const r = canvas.getBoundingClientRect();
        rubAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
    }, { passive: true });

    window.addEventListener('touchend', () => { isRubbing = false; });

    const clearRubBtn = document.getElementById('btn-reset-rubbing');
    if (clearRubBtn) {
        clearRubBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, width, height);
            drawStoneBase();
        });
    }
}

/* -------------------------------------------------------------
   MODAL SYSTEM FOR ROYAL CARDS & ARTIFACTS
   ------------------------------------------------------------- */
function initModalSystem() {
    const modal = document.getElementById('details-modal');
    const modalClose = document.getElementById('btn-close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalBody = document.getElementById('modal-body-content');

    const royalDetails = {
        'chandragupta-1': {
            title: 'Chandragupta I (c. 320 – 335 CE)',
            subtitle: 'Mahārājādhirāja • Founder of Imperial Glory',
            content: `
                <div class="modal-section-grid">
                    <div>
                        <h4>The Matrimonial Alliance</h4>
                        <p>Chandragupta I transformed the local chieftainship of Magadha into an imperial sovereign realm through a strategic marriage with Princess Kumāradevī of the ancient and powerful Licchavi clan of Vaishali.</p>
                        <p>This alliance was so celebrated that the imperial mint struck special commemorative gold coins featuring the dual portraits of Chandragupta and Kumaradevi on the obverse, and the goddess Lakshmi seated on a lion on the reverse with the legend <em>Licchavayah</em>.</p>
                    </div>
                    <div>
                        <h4>Establishment of the Gupta Era (319–320 CE)</h4>
                        <p>To commemorate his imperial coronation as <strong>Mahārājādhirāja</strong> (King of Kings), Chandragupta instituted the Gupta Sanvat calendar era, which served as the official astronomical and administrative reckoning across the subcontinent for over three centuries.</p>
                        <div class="modal-stat-box">
                            <div><strong>Reign:</strong> c. 320 – 335 CE</div>
                            <div><strong>Capital:</strong> Pāṭaliputra</div>
                            <div><strong>Title:</strong> Mahārājādhirāja</div>
                        </div>
                    </div>
                </div>
            `
        },
        'samudragupta': {
            title: 'Samudragupta (c. 335 – 375 CE)',
            subtitle: 'The Indian Napoleon • Kavirāja & Conqueror',
            content: `
                <div class="modal-section-grid">
                    <div>
                        <h4>The Digvijaya & Allahabad Inscription</h4>
                        <p>Celebrated in history as one of India's greatest military strategists. The <strong>Prayāga Prashasti</strong> (Allahabad Pillar Inscription), composed in 33 lines of magnificent classical Sanskrit poetry by court poet Hariṣeṇa, chronicles his unbroken campaigns across Aryavarta and Dakshinapatha (the Deccan).</p>
                        <p>Rather than annexing the Southern kings, he adopted the visionary policy of <em>Dharma-vijaya</em> (conquest of righteousness): capturing the rulers, restoring them to their thrones upon submission, and exacting annual tributes.</p>
                    </div>
                    <div>
                        <h4>The Musician King & Ashvamedha</h4>
                        <p>Samudragupta was equally celebrated as <strong>Kavirāja</strong> (King of Poets) and a master musician. Rare gold coins depict him seated gracefully on a cushioned couch, playing the seven-stringed Indian lyre (Veena).</p>
                        <p>He revived the ancient Vedic <em>Aśvamedha</em> (Horse Sacrifice) to proclaim his supreme sovereignty, minting pure gold coins with the sacrificial stallion standing before the ritual post (yūpa).</p>
                        <div class="modal-stat-box">
                            <div><strong>Reign:</strong> c. 335 – 375 CE</div>
                            <div><strong>Battles:</strong> Undefeated in over 100 engagements</div>
                            <div><strong>Virtues:</strong> Music, Poetry, Statecraft</div>
                        </div>
                    </div>
                </div>
            `
        },
        'chandragupta-2': {
            title: 'Chandragupta II Vikramāditya (c. 375 – 415 CE)',
            subtitle: 'Sun of Valour • The Golden Age at Its Zenith',
            content: `
                <div class="modal-section-grid">
                    <div>
                        <h4>Annihilation of the Western Kshatrapas</h4>
                        <p>Chandragupta II achieved the definitive geopolitical triumph of the dynasty by exterminating the Shaka Kshatrapa rulers who had held Malwa, Gujarat, and the Kathiawar peninsula for four centuries.</p>
                        <p>This conquest gave the Gupta Empire direct mastery over the lucrative western maritime trade ports (Barygaza/Bharuch, Sopara, Cambay), connecting India to the markets of the Roman Empire and the Mediterranean basin.</p>
                    </div>
                    <div>
                        <h4>The Navaratnas (Nine Gems) & Faxian's Visit</h4>
                        <p>His court at Ujjayini assembled the Nine Gems of Sanskrit genius: Kālidāsa (Poetry/Drama), Varāhamihira (Astronomy), Amarasiṃha (Lexicography), Dhanvantari (Medicine), Vararuchi, Ghatakarpara, Kshapanaka, Shanku, and Vetala Bhatta.</p>
                        <p>Chinese Buddhist pilgrim Faxian (Fa-Hien) traveled across his realm for six years and recorded that people were happy, vegetarian hospitals provided free medicine, travelers were safe without passports, and punishments were unusually mild and humane.</p>
                        <div class="modal-stat-box">
                            <div><strong>Reign:</strong> c. 375 – 415 CE</div>
                            <div><strong>Capitals:</strong> Pāṭaliputra & Ujjayinī</div>
                            <div><strong>Monuments:</strong> Iron Pillar of Delhi, Udayagiri Caves</div>
                        </div>
                    </div>
                </div>
            `
        }
    };

    // Card click handlers
    const rulerButtons = document.querySelectorAll('.btn-ruler-details');
    rulerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rulerKey = btn.getAttribute('data-ruler');
            const data = royalDetails[rulerKey];
            if (!data) return;

            if (modalTitle) modalTitle.textContent = data.title;
            if (modalSubtitle) modalSubtitle.textContent = data.subtitle;
            if (modalBody) modalBody.innerHTML = data.content;

            if (modal) {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
            if (window.soundEngine) window.soundEngine.playTempleBell(587.33);
        });
    });

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

/* -------------------------------------------------------------
   AUDIO TOGGLE UI
   ------------------------------------------------------------- */
function initAudioUI() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', () => {
        if (window.soundEngine) {
            const isPlaying = window.soundEngine.toggle();
            soundBtn.classList.toggle('sound-active', isPlaying);
            const statusText = soundBtn.querySelector('.sound-status-text');
            if (statusText) {
                statusText.textContent = isPlaying ? 'Temple Sound: ON' : 'Temple Sound: OFF';
            }
        }
    });
}
