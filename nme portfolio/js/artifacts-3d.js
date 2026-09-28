/**
 * The Gupta Age - Interactive 3D Artifacts Engine
 * Specialized interactive 3D viewports:
 * 1. 3D Rotating Imperial Gupta Gold Coin (Section 1)
 * 2. 3D Ancient Astronomical Golayantra / Armillary Sphere (Section 3)
 * 3. 3D Museum Art Gallery Viewport with mouse/touch orbital controls & multiple artifacts (Section 5)
 */

class GuptaArtifactsManager {
    constructor() {
        this.initCoinViewer();
        this.initAstronomicalViewer();
        this.initGalleryViewer();
    }

    /* -------------------------------------------------------------
       1. INTERACTIVE 3D GUPTA GOLD COIN (SECTION 1)
       ------------------------------------------------------------- */
    initCoinViewer() {
        const container = document.getElementById('coin-3d-canvas-container');
        if (!container) return;

        const width = container.clientWidth || 320;
        const height = container.clientHeight || 320;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambLight = new THREE.AmbientLight(0x553e20, 1.8);
        scene.add(ambLight);

        const keyLight = new THREE.DirectionalLight(0xffdf80, 3.2);
        keyLight.position.set(5, 6, 4);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xffa500, 1.8);
        rimLight.position.set(-5, -4, -3);
        scene.add(rimLight);

        // Generate Procedural High-Res Gupta Coin Textures
        const { obverseTex, reverseTex, bumpTex } = this.createCoinTextures();

        // 3D Coin Mesh: Cylinder with coin bevel
        const coinGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.12, 64);

        const edgeMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.92,
            roughness: 0.35
        });

        const topMat = new THREE.MeshStandardMaterial({
            color: 0xefb82a,
            metalness: 0.88,
            roughness: 0.28,
            map: obverseTex,
            bumpMap: bumpTex,
            bumpScale: 0.08
        });

        const bottomMat = new THREE.MeshStandardMaterial({
            color: 0xefb82a,
            metalness: 0.88,
            roughness: 0.28,
            map: reverseTex,
            bumpMap: bumpTex,
            bumpScale: 0.08
        });

        const coinMesh = new THREE.Mesh(coinGeo, [edgeMat, topMat, bottomMat]);
        coinMesh.rotation.x = Math.PI / 2;
        scene.add(coinMesh);

        // Interaction state
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        let rotSpeedX = 0.008;
        let rotSpeedY = 0.005;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            if (window.soundEngine) window.soundEngine.playCoinChime();
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevMouseX;
            const deltaY = e.clientY - prevMouseY;
            coinMesh.rotation.y += deltaX * 0.015;
            coinMesh.rotation.x += deltaY * 0.015;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        // Touch controls
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                prevMouseX = e.touches[0].clientX;
                prevMouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - prevMouseX;
            const deltaY = e.touches[0].clientY - prevMouseY;
            coinMesh.rotation.y += deltaX * 0.02;
            coinMesh.rotation.x += deltaY * 0.02;
            prevMouseX = e.touches[0].clientX;
            prevMouseY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });

        // Coin Flip Button
        const flipBtn = document.getElementById('btn-flip-coin');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                gsap.to(coinMesh.rotation, {
                    y: coinMesh.rotation.y + Math.PI,
                    duration: 1.2,
                    ease: "back.out(1.7)"
                });
                if (window.soundEngine) window.soundEngine.playCoinChime();
            });
        }

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging) {
                coinMesh.rotation.y += 0.009;
                coinMesh.rotation.x = Math.PI / 2 + Math.sin(Date.now() * 0.0015) * 0.15;
            }
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        });
    }

    createCoinTextures() {
        // 1. Obverse Canvas (Gupta Archer King with Garudadhvaja)
        const obvCanvas = document.createElement('canvas');
        obvCanvas.width = 512;
        obvCanvas.height = 512;
        const oCtx = obvCanvas.getContext('2d');

        // Antique gold metallic gradient base
        const grad = oCtx.createRadialGradient(256, 256, 40, 256, 256, 250);
        grad.addColorStop(0, '#f9dc75');
        grad.addColorStop(0.7, '#d4af37');
        grad.addColorStop(1, '#997316');
        oCtx.fillStyle = grad;
        oCtx.fillRect(0, 0, 512, 512);

        // Circular beaded rim
        oCtx.strokeStyle = '#fff2a8';
        oCtx.lineWidth = 4;
        oCtx.beginPath();
        oCtx.arc(256, 256, 236, 0, Math.PI * 2);
        oCtx.stroke();

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
            const x = 256 + Math.cos(a) * 236;
            const y = 256 + Math.sin(a) * 236;
            oCtx.fillStyle = '#fff6cc';
            oCtx.beginPath();
            oCtx.arc(x, y, 4, 0, Math.PI * 2);
            oCtx.fill();
        }

        // Royal Archer King figure
        oCtx.fillStyle = '#7a5a12';
        oCtx.strokeStyle = '#ffe885';
        oCtx.lineWidth = 3;

        // Crown & halo
        oCtx.beginPath();
        oCtx.arc(256, 175, 34, 0, Math.PI * 2);
        oCtx.stroke();
        oCtx.fill();

        // Royal Torso
        oCtx.beginPath();
        oCtx.moveTo(230, 210);
        oCtx.lineTo(282, 210);
        oCtx.lineTo(270, 310);
        oCtx.lineTo(242, 310);
        oCtx.closePath();
        oCtx.fill();
        oCtx.stroke();

        // Royal Bow
        oCtx.beginPath();
        oCtx.arc(195, 260, 95, -Math.PI * 0.42, Math.PI * 0.42);
        oCtx.stroke();

        // Bowstring
        oCtx.beginPath();
        oCtx.moveTo(195 + Math.cos(-Math.PI * 0.42) * 95, 260 + Math.sin(-Math.PI * 0.42) * 95);
        oCtx.lineTo(195 + Math.cos(Math.PI * 0.42) * 95, 260 + Math.sin(Math.PI * 0.42) * 95);
        oCtx.stroke();

        // Garudadhvaja standard
        oCtx.beginPath();
        oCtx.moveTo(335, 140);
        oCtx.lineTo(335, 360);
        oCtx.stroke();
        oCtx.strokeRect(318, 120, 34, 25);

        // Brahmi legend circular text
        oCtx.font = 'bold 22px serif';
        oCtx.fillStyle = '#5c4008';
        oCtx.textAlign = 'center';
        oCtx.fillText('𑀤𑁂𑀯 𑀫𑀳𑀸𑀭𑀸𑀚𑀸𑀥𑀺𑀭𑀸𑀚 𑀲𑀫𑀼𑀤𑁆𑀭𑀕𑀼𑀧𑁆𑀢', 256, 425);

        // 2. Reverse Canvas (Goddess Lakshmi seated on lotus holding cornucopia)
        const revCanvas = document.createElement('canvas');
        revCanvas.width = 512;
        revCanvas.height = 512;
        const rCtx = revCanvas.getContext('2d');
        rCtx.fillStyle = grad;
        rCtx.fillRect(0, 0, 512, 512);

        // Reverse beaded border
        rCtx.strokeStyle = '#fff2a8';
        rCtx.lineWidth = 4;
        rCtx.beginPath();
        rCtx.arc(256, 256, 236, 0, Math.PI * 2);
        rCtx.stroke();

        // Lotus throne
        rCtx.fillStyle = '#7a5a12';
        rCtx.strokeStyle = '#ffe885';
        rCtx.lineWidth = 3;

        // Lotus petals
        for (let p = -3; p <= 3; p++) {
            rCtx.beginPath();
            rCtx.ellipse(256 + p * 22, 340, 18, 28, p * 0.2, 0, Math.PI * 2);
            rCtx.fill();
            rCtx.stroke();
        }

        // Seated Lakshmi figure
        rCtx.beginPath();
        rCtx.arc(256, 200, 30, 0, Math.PI * 2); // Head & halo
        rCtx.fill();
        rCtx.stroke();

        rCtx.beginPath();
        rCtx.ellipse(256, 260, 35, 45, 0, 0, Math.PI * 2); // Body
        rCtx.fill();
        rCtx.stroke();

        // Cornucopia / Lotus held in left hand
        rCtx.beginPath();
        rCtx.arc(310, 220, 18, 0, Math.PI * 2);
        rCtx.stroke();

        // Reverse legend in Brahmi: "Parakramah" (The Valiant)
        rCtx.font = 'bold 24px serif';
        rCtx.fillStyle = '#5c4008';
        rCtx.textAlign = 'center';
        rCtx.fillText('𑀧 𑀭𑀸 𑀓𑁆𑀭 𑀫 𑀂', 256, 425);

        return {
            obverseTex: new THREE.CanvasTexture(obvCanvas),
            reverseTex: new THREE.CanvasTexture(revCanvas),
            bumpTex: new THREE.CanvasTexture(obvCanvas)
        };
    }

    /* -------------------------------------------------------------
       2. ASTRONOMICAL GOLAYANTRA / ARMILLARY SPHERE (SECTION 3)
       ------------------------------------------------------------- */
    initAstronomicalViewer() {
        const container = document.getElementById('armillary-3d-canvas-container');
        if (!container) return;

        const width = container.clientWidth || 400;
        const height = container.clientHeight || 400;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 2, 7.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lighting
        const ambLight = new THREE.AmbientLight(0x223355, 2.0);
        scene.add(ambLight);

        const starLight = new THREE.PointLight(0x70b8ff, 3.5, 30);
        starLight.position.set(4, 6, 6);
        scene.add(starLight);

        const goldGlow = new THREE.PointLight(0xffd700, 2.8, 15);
        goldGlow.position.set(-3, -3, 3);
        scene.add(goldGlow);

        // Build Nested Armillary Sphere (Aryabhata's Golayantra)
        const armillaryGroup = new THREE.Group();

        // Metallic materials
        const bronzeMat = new THREE.MeshStandardMaterial({
            color: 0x8a623a,
            metalness: 0.85,
            roughness: 0.35
        });

        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xefb82a,
            metalness: 0.95,
            roughness: 0.25
        });

        const cyanRingMat = new THREE.MeshStandardMaterial({
            color: 0x33bbee,
            metalness: 0.7,
            roughness: 0.4
        });

        // 1. Stand and Base
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32), bronzeMat);
        standBase.position.y = -2.6;
        armillaryGroup.add(standBase);

        const standPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.5, 16), bronzeMat);
        standPillar.position.y = -1.8;
        armillaryGroup.add(standPillar);

        // Support Horizon Ring (Khagola / Horizon)
        const horizonRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.08, 16, 64), bronzeMat);
        horizonRing.rotation.x = Math.PI / 2;
        horizonRing.position.y = -1.0;
        armillaryGroup.add(horizonRing);

        // 2. Outer Meridian Ring (Yamottara Mandala)
        const meridianRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.07, 16, 64), goldMat);
        armillaryGroup.add(meridianRing);

        // 3. Celestial Equator Ring (Vishuvad Vritta)
        const equatorRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.06, 16, 64), cyanRingMat);
        equatorRing.rotation.x = Math.PI / 2;
        armillaryGroup.add(equatorRing);

        // 4. Ecliptic / Zodiac Band (Kranti Vritta - tilted by 23.5 degrees)
        const eclipticBand = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.35, 64, 1, true), goldMat);
        eclipticBand.rotation.z = THREE.MathUtils.degToRad(23.5);
        armillaryGroup.add(eclipticBand);

        // 5. Polar Axis Needle (Dhruva Yasti)
        const axisNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.8, 16), goldMat);
        axisNeedle.rotation.z = THREE.MathUtils.degToRad(23.5);
        armillaryGroup.add(axisNeedle);

        // 6. Central Terrestrial Globe (Bhu-Gola as described by Aryabhata: spherical Earth suspended in space!)
        const earthGeo = new THREE.SphereGeometry(0.65, 32, 32);
        const earthMat = new THREE.MeshStandardMaterial({
            color: 0x3d7054,
            roughness: 0.6,
            metalness: 0.2
        });
        const earthGlobe = new THREE.Mesh(earthGeo, earthMat);
        armillaryGroup.add(earthGlobe);

        // Luminous Orbit Rings
        const orbitLineGeo = new THREE.TorusGeometry(1.3, 0.02, 12, 48);
        const orbitLineMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
        const orbit1 = new THREE.Mesh(orbitLineGeo, orbitLineMat);
        orbit1.rotation.y = Math.PI / 3;
        armillaryGroup.add(orbit1);

        scene.add(armillaryGroup);

        // Interaction
        let isDragging = false;
        let prevX = 0, prevY = 0;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;
            armillaryGroup.rotation.y += dx * 0.012;
            armillaryGroup.rotation.x += dy * 0.012;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                prevX = e.touches[0].clientX;
                prevY = e.touches[0].clientY;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - prevX;
            const dy = e.touches[0].clientY - prevY;
            armillaryGroup.rotation.y += dx * 0.018;
            armillaryGroup.rotation.x += dy * 0.018;
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (!isDragging) {
                armillaryGroup.rotation.y += 0.007;
                eclipticBand.rotation.y -= 0.005;
                earthGlobe.rotation.y += 0.015; // Earth spinning on its axis as proved by Aryabhata!
                orbit1.rotation.z += 0.01;
            }
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        });
    }

    /* -------------------------------------------------------------
       3. INTERACTIVE 3D MUSEUM ART GALLERY (SECTION 5)
       ------------------------------------------------------------- */
    initGalleryViewer() {
        const container = document.getElementById('gallery-3d-canvas-container');
        if (!container) return;

        const width = container.clientWidth || 550;
        const height = container.clientHeight || 450;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x100a06, 0.02);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 1.8, 6.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambLight = new THREE.AmbientLight(0x3a2818, 1.8);
        scene.add(ambLight);

        const gallerySpot = new THREE.SpotLight(0xffdf88, 3.5, 30, Math.PI / 4, 0.3, 1);
        gallerySpot.position.set(0, 8, 5);
        gallerySpot.castShadow = true;
        scene.add(gallerySpot);

        const sideLight = new THREE.DirectionalLight(0x88bbff, 0.8);
        sideLight.position.set(-6, 2, -3);
        scene.add(sideLight);

        // Museum Gallery Pedestal
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x241a12,
            roughness: 0.8,
            metalness: 0.2
        });
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 32), pedestalMat);
        pedestal.position.y = -1.8;
        pedestal.receiveShadow = true;
        scene.add(pedestal);

        // Artifact Models Container
        const artifactContainer = new THREE.Group();
        scene.add(artifactContainer);

        // Build 5 Classical Gupta Artifacts:
        // 1. Sarnath Buddha (Iconic Dharmachakra mudra with halo)
        const buddhaGroup = this.buildSarnathBuddha();
        // 2. Iron Pillar of Delhi (Mehrauli)
        const ironPillarGroup = this.buildIronPillar();
        // 3. Dashavatara Temple Model
        const templeGroup = this.buildTempleModel();
        // 4. Palm-Leaf Manuscript (Tadapatra)
        const manuscriptGroup = this.buildManuscriptModel();
        // 5. Gupta Archer Gold Dinara
        const coinArtGroup = this.buildCoinArtModel();

        const artifacts = [
            { id: 'buddha', group: buddhaGroup, title: 'Sarnath Buddha (Dharmachakra Mudra)', era: 'c. 475 CE • Chunar Sandstone', desc: 'The supreme embodiment of Gupta classical sculpture. The serene face, diaphanous drapery, and intricately carved halo featuring floral arabesques and celestial beings mark the zenith of Indian plastic art.' },
            { id: 'iron-pillar', group: ironPillarGroup, title: 'The Rustless Iron Pillar of Mehrauli', era: 'c. 400 CE • Forge-Welded Iron', desc: 'A metallurgical miracle standing 7.2 meters high. Dedicated to Lord Vishnu by King Chandra (Chandragupta II), it has resisted corrosion for over 1,600 years in the open monsoon air.' },
            { id: 'temple', group: templeGroup, title: 'Dashavatara Temple, Deogarh', era: 'c. 500 CE • Carved Red Sandstone', desc: 'One of the earliest surviving classical Hindu stone temples. Built in the Panchayatana layout, it features the iconic Sheshashayi Vishnu relief and an early curvilinear Shikhara spire.' },
            { id: 'manuscript', group: manuscriptGroup, title: 'Palm-Leaf Manuscript (Tadapatra)', era: 'c. 450 CE • Cured Palm Leaves & Iron Stylus', desc: 'Preserved Sanskrit texts of Kalidasa and the Nalanda archives, bound with silk cords and protected by carved teakwood cover boards.' },
            { id: 'gold-coin', group: coinArtGroup, title: 'Imperial Archer Gold Dinara', era: 'c. 380 CE • High Purity Gold', desc: 'Minted under Samudragupta and Chandragupta II. Illustrates the emperor in royal archery stance with the Garudadhvaja standard and circular Brahmi legend.' }
        ];

        let currentArtifactIndex = 0;
        artifacts.forEach((art, idx) => {
            art.group.visible = (idx === 0);
            artifactContainer.add(art.group);
        });

        // Interactive Orbit / Drag
        let isDragging = false;
        let prevMouseX = 0, prevMouseY = 0;
        let autoRotate = true;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            autoRotate = false;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            artifactContainer.rotation.y += dx * 0.012;
            artifactContainer.rotation.x = Math.max(-0.5, Math.min(0.5, artifactContainer.rotation.x + dy * 0.012));
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        // Touch
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                autoRotate = false;
                prevMouseX = e.touches[0].clientX;
                prevMouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - prevMouseX;
            const dy = e.touches[0].clientY - prevMouseY;
            artifactContainer.rotation.y += dx * 0.015;
            artifactContainer.rotation.x = Math.max(-0.5, Math.min(0.5, artifactContainer.rotation.x + dy * 0.015));
            prevMouseX = e.touches[0].clientX;
            prevMouseY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });

        // Artifact Switcher UI buttons
        const navButtons = document.querySelectorAll('.gallery-artifact-btn');
        const titleEl = document.getElementById('gallery-artifact-title');
        const eraEl = document.getElementById('gallery-artifact-era');
        const descEl = document.getElementById('gallery-artifact-desc');

        const updateArtifactView = (index) => {
            currentArtifactIndex = index;
            artifacts.forEach((art, idx) => {
                art.group.visible = (idx === index);
            });

            // Reset rotation with smooth animation
            gsap.to(artifactContainer.rotation, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            // Update UI Details
            const current = artifacts[index];
            if (titleEl) titleEl.textContent = current.title;
            if (eraEl) eraEl.textContent = current.era;
            if (descEl) descEl.textContent = current.desc;

            navButtons.forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });

            if (window.soundEngine) window.soundEngine.playTempleBell(523.25);
        };

        navButtons.forEach((btn, idx) => {
            btn.addEventListener('click', () => updateArtifactView(idx));
        });

        // Auto-rotate toggle button
        const autoRotateBtn = document.getElementById('btn-gallery-autorotate');
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => {
                autoRotate = !autoRotate;
                autoRotateBtn.classList.toggle('active', autoRotate);
            });
        }

        // Zoom controls
        const zoomInBtn = document.getElementById('btn-gallery-zoom-in');
        const zoomOutBtn = document.getElementById('btn-gallery-zoom-out');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                gsap.to(camera.position, { z: Math.max(3.8, camera.position.z - 0.8), duration: 0.5 });
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                gsap.to(camera.position, { z: Math.min(8.5, camera.position.z + 0.8), duration: 0.5 });
            });
        }

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (autoRotate && !isDragging) {
                artifactContainer.rotation.y += 0.007;
            }
            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        });
    }

    buildSarnathBuddha() {
        const group = new THREE.Group();

        // Chunar Sandstone Material
        const sandstoneMat = new THREE.MeshStandardMaterial({
            color: 0xdfb482,
            roughness: 0.75,
            metalness: 0.1
        });

        const darkSandstoneMat = new THREE.MeshStandardMaterial({
            color: 0xaa8252,
            roughness: 0.8,
            metalness: 0.15
        });

        // Lotus Throne (Padmasana)
        const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.45, 32), darkSandstoneMat);
        lotusBase.position.y = -1.0;
        group.add(lotusBase);

        // Seated Torso (Dhyanasana / Padmasana crossed legs)
        const legsGeo = new THREE.CylinderGeometry(0.85, 1.15, 0.4, 16);
        const legs = new THREE.Mesh(legsGeo, sandstoneMat);
        legs.position.y = -0.65;
        group.add(legs);

        const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.1, 16);
        const torso = new THREE.Mesh(torsoGeo, sandstoneMat);
        torso.position.y = 0.05;
        group.add(torso);

        // Meditative Head with Ushnisha & Urna
        const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
        const head = new THREE.Mesh(headGeo, sandstoneMat);
        head.position.y = 0.85;
        group.add(head);

        const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), sandstoneMat);
        ushnisha.position.y = 1.25;
        group.add(ushnisha);

        // Arms in Dharmachakra Pravartana Mudra
        const armsGeo = new THREE.TorusGeometry(0.45, 0.12, 12, 24, Math.PI);
        const arms = new THREE.Mesh(armsGeo, sandstoneMat);
        arms.position.set(0, 0.05, 0.3);
        arms.rotation.x = Math.PI / 2;
        group.add(arms);

        // Magnificent Ornate Halo (Prabhamandala)
        const haloGroup = new THREE.Group();
        haloGroup.position.set(0, 0.9, -0.2);

        const haloDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 48), darkSandstoneMat);
        haloDisc.rotation.x = Math.PI / 2;
        haloGroup.add(haloDisc);

        // Concentric Lotus Ring on Halo
        const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 16, 48), sandstoneMat);
        haloGroup.add(haloRing);

        group.add(haloGroup);
        return group;
    }

    buildIronPillar() {
        const group = new THREE.Group();

        // Wrought Iron Material with subtle patina
        const ironMat = new THREE.MeshStandardMaterial({
            color: 0x48423b,
            metalness: 0.85,
            roughness: 0.45
        });

        const darkIronMat = new THREE.MeshStandardMaterial({
            color: 0x2e2925,
            metalness: 0.9,
            roughness: 0.5
        });

        // Octagonal Base section
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.6, 8), darkIronMat);
        base.position.y = -1.0;
        group.add(base);

        // Tapering Main Shaft with Inscription band
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 2.8, 24), ironMat);
        shaft.position.y = 0.6;
        group.add(shaft);

        // Classical Inverted Lotus Bell Capital (Kalasam)
        const bellCapital = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.38, 0.55, 24), darkIronMat);
        bellCapital.position.y = 2.25;
        group.add(bellCapital);

        // Amalaka (Fluted ribbed disc)
        const amalaka = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 16, 24), ironMat);
        amalaka.rotation.x = Math.PI / 2;
        amalaka.position.y = 2.65;
        group.add(amalaka);

        // Square Abacus & Crown Pedestal
        const crownAbacus = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.9), darkIronMat);
        crownAbacus.position.y = 2.9;
        group.add(crownAbacus);

        return group;
    }

    buildTempleModel() {
        const group = new THREE.Group();

        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0xbf9368,
            roughness: 0.8,
            metalness: 0.15
        });

        const darkStone = new THREE.MeshStandardMaterial({
            color: 0x7a5b3a,
            roughness: 0.85,
            metalness: 0.1
        });

        // Stepped Plinth (Jagati)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 2.8), darkStone);
        plinth.position.y = -1.0;
        group.add(plinth);

        // Sanctum Cube (Garbhagriha)
        const sanctum = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), stoneMat);
        sanctum.position.y = -0.1;
        group.add(sanctum);

        // Curvilinear Shikhara Spire (Early Nagara Style)
        const shikharaGeo = new THREE.ConeGeometry(1.2, 1.9, 4);
        const shikhara = new THREE.Mesh(shikharaGeo, stoneMat);
        shikhara.position.y = 1.5;
        shikhara.rotation.y = Math.PI / 4;
        group.add(shikhara);

        // Kalasha Spire Finial
        const kalasha = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), darkStone);
        kalasha.position.y = 2.55;
        group.add(kalasha);

        // Carved Entrance Porch (Mandapa)
        const porchLintel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 0.6), darkStone);
        porchLintel.position.set(0, 0.5, 1.0);
        group.add(porchLintel);

        [-0.45, 0.45].forEach(x => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), stoneMat);
            pillar.position.set(x, -0.1, 1.1);
            group.add(pillar);
        });

        return group;
    }

    buildManuscriptModel() {
        const group = new THREE.Group();

        // Teakwood board material
        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x5a3d24,
            roughness: 0.7,
            metalness: 0.1
        });

        // Palm-leaf parchment material
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0xdfc498,
            roughness: 0.9,
            metalness: 0.05
        });

        // Bottom Wooden Cover Board
        const bottomBoard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.8), woodMat);
        bottomBoard.position.y = -0.4;
        group.add(bottomBoard);

        // Palm-Leaf Folios Stack
        const folios = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.35, 0.75), leafMat);
        folios.position.y = -0.18;
        group.add(folios);

        // Top Wooden Cover Board (slightly tilted open)
        const topBoard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.8), woodMat);
        topBoard.position.set(0, 0.15, 0);
        topBoard.rotation.x = -0.2;
        group.add(topBoard);

        // Silk Binding Cord
        const cordMat = new THREE.MeshBasicMaterial({ color: 0x8b0000 }); // Crimson silk thread
        [-0.6, 0.6].forEach(x => {
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8), cordMat);
            cord.position.set(x, -0.15, 0);
            group.add(cord);
        });

        return group;
    }

    buildCoinArtModel() {
        const group = new THREE.Group();
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xefb82a,
            metalness: 0.92,
            roughness: 0.28
        });

        const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.14, 48), coinMat);
        coin.rotation.x = Math.PI / 2;
        group.add(coin);

        return group;
    }
}

// Initialize artifacts when document loads
window.addEventListener('DOMContentLoaded', () => {
    window.artifactsManager = new GuptaArtifactsManager();
});
