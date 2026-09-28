/**
 * The Gupta Age - Three.js Master Scene
 * Cinematic 3D ancient Indian temple environment, dynamic volumetric lighting,
 * atmospheric dust motes, falling gold coins, astronomical stars, incense smoke,
 * and glowing legacy monolith pillars with GSAP camera choreography.
 */

class GuptaMasterScene {
    constructor() {
        this.container = document.getElementById('three-bg-canvas-container');
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.clock = new THREE.Clock();

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.scrollProgress = 0;
        this.activeSection = 0;

        // Visual environment groups
        this.templeGroup = new THREE.Group();
        this.starsGroup = new THREE.Group();
        this.coinRainGroup = new THREE.Group();
        this.incenseGroup = new THREE.Group();
        this.monolithGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();

        this.fallingCoins = [];
        this.incenseParticles = [];
        this.floatingSymbols = [];
        this.monolithPillars = [];

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0705); // Deep royal dark bronze/black
        this.scene.fog = new THREE.FogExp2(0x120c08, 0.015);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 3, 16);
        this.cameraTarget = new THREE.Vector3(0, 3, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Procedural Textures
        this.createTextures();

        // Lighting
        this.setupLighting();

        // Build 3D environments
        this.buildTempleHall();
        this.buildDustParticles();
        this.buildStarfieldAndMathSymbols();
        this.buildCoinRain();
        this.buildIncenseSmoke();
        this.buildLegacyMonoliths();

        // Event listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

        // Animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    createTextures() {
        // 1. Procedural Sandstone Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base sandstone color
        ctx.fillStyle = '#b89467';
        ctx.fillRect(0, 0, 512, 512);

        // Organic stone grain noise
        for (let i = 0; i < 45000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const lum = Math.floor(Math.random() * 40 - 20);
            ctx.fillStyle = `rgba(${160 + lum}, ${120 + lum}, ${80 + lum}, 0.25)`;
            ctx.fillRect(x, y, 2, 2);
        }

        // Horizontal sandstone strata layers
        for (let y = 0; y < 512; y += 8 + Math.random() * 12) {
            ctx.fillStyle = `rgba(80, 50, 30, ${0.05 + Math.random() * 0.08})`;
            ctx.fillRect(0, y, 512, 3);
        }

        this.sandstoneTexture = new THREE.CanvasTexture(canvas);
        this.sandstoneTexture.wrapS = THREE.RepeatWrapping;
        this.sandstoneTexture.wrapT = THREE.RepeatWrapping;
        this.sandstoneTexture.repeat.set(2, 4);

        // 2. Bump map for carved stone relief & Brahmi glyphs
        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = 512;
        bumpCanvas.height = 512;
        const bCtx = bumpCanvas.getContext('2d');
        bCtx.fillStyle = '#808080';
        bCtx.fillRect(0, 0, 512, 512);

        // Ancient Brahmi script-inspired relief bands
        bCtx.strokeStyle = '#ffffff';
        bCtx.lineWidth = 3;
        for (let y = 50; y < 480; y += 60) {
            bCtx.beginPath();
            bCtx.moveTo(40, y);
            for (let x = 40; x < 480; x += 30) {
                bCtx.lineTo(x + 10, y + (Math.sin(x * 0.1) * 6));
                bCtx.arc(x + 15, y, 4, 0, Math.PI * 2);
            }
            bCtx.stroke();
        }

        // Subtle floral lotus rosettes
        for (let i = 0; i < 6; i++) {
            bCtx.beginPath();
            bCtx.arc(100 + i * 60, 256, 12, 0, Math.PI * 2);
            bCtx.stroke();
        }

        this.stoneBumpTexture = new THREE.CanvasTexture(bumpCanvas);
        this.stoneBumpTexture.wrapS = THREE.RepeatWrapping;
        this.stoneBumpTexture.wrapT = THREE.RepeatWrapping;

        // 3. Antique Gold Coin Bump Map
        const coinCanvas = document.createElement('canvas');
        coinCanvas.width = 512;
        coinCanvas.height = 512;
        const cCtx = coinCanvas.getContext('2d');
        cCtx.fillStyle = '#100c08';
        cCtx.fillRect(0, 0, 512, 512);

        // Beaded rim
        cCtx.strokeStyle = '#ffd700';
        cCtx.lineWidth = 6;
        cCtx.beginPath();
        cCtx.arc(256, 256, 230, 0, Math.PI * 2);
        cCtx.stroke();

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
            const bx = 256 + Math.cos(a) * 230;
            const by = 256 + Math.sin(a) * 230;
            cCtx.fillStyle = '#ffdf60';
            cCtx.beginPath();
            cCtx.arc(bx, by, 5, 0, Math.PI * 2);
            cCtx.fill();
        }

        // King Archer motif outline
        cCtx.strokeStyle = '#fff';
        cCtx.fillStyle = '#ffdf60';
        cCtx.lineWidth = 4;
        // Torso & head with royal crown
        cCtx.beginPath();
        cCtx.arc(256, 170, 28, 0, Math.PI * 2); // Crown & face
        cCtx.fill();
        cCtx.stroke();

        // Royal Bow held in left hand
        cCtx.beginPath();
        cCtx.arc(190, 270, 75, -Math.PI * 0.45, Math.PI * 0.45);
        cCtx.stroke();

        // Garuda Standard (Garudadhvaja) on right
        cCtx.beginPath();
        cCtx.moveTo(330, 160);
        cCtx.lineTo(330, 360);
        cCtx.stroke();
        cCtx.strokeRect(315, 140, 30, 20);

        // Brahmi characters around rim
        cCtx.font = 'bold 24px serif';
        cCtx.fillStyle = '#ffffff';
        cCtx.textAlign = 'center';
        cCtx.fillText('𑀲 𑀫𑀼 𑀤𑁆𑀭 𑀕𑀼 𑀧𑁆𑀢', 256, 420); // Brahmi script for Samudragupta

        this.coinBumpTexture = new THREE.CanvasTexture(coinCanvas);
    }

    setupLighting() {
        // Ambient fill
        this.ambientLight = new THREE.AmbientLight(0x281a10, 1.2);
        this.scene.add(this.ambientLight);

        // Sunlight / Sanctum Torch Light (Antique Gold Warmth)
        this.sunLight = new THREE.DirectionalLight(0xffbe6b, 2.8);
        this.sunLight.position.set(12, 20, 15);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 60;
        this.sunLight.shadow.camera.left = -20;
        this.sunLight.shadow.camera.right = 20;
        this.sunLight.shadow.camera.top = 20;
        this.sunLight.shadow.camera.bottom = -20;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);

        // Secondary soft rim light (cool sky contrast)
        this.rimLight = new THREE.DirectionalLight(0x5a7ca8, 0.7);
        this.rimLight.position.set(-15, 10, -10);
        this.scene.add(this.rimLight);

        // Golden point light at entrance
        this.entranceGlow = new THREE.PointLight(0xffaa33, 2.5, 25);
        this.entranceGlow.position.set(0, 4, 2);
        this.scene.add(this.entranceGlow);

        // Color shifting spotlight for science & legacy sections
        this.spotLight = new THREE.SpotLight(0xd4af37, 3, 50, Math.PI / 4, 0.4, 1);
        this.spotLight.position.set(0, 18, 5);
        this.spotLight.target.position.set(0, 0, 0);
        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);
    }

    buildTempleHall() {
        // Sandstone Material
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0xc89e68,
            roughness: 0.85,
            metalness: 0.1,
            map: this.sandstoneTexture,
            bumpMap: this.stoneBumpTexture,
            bumpScale: 0.05
        });

        const darkStoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4632,
            roughness: 0.9,
            metalness: 0.05,
            map: this.sandstoneTexture
        });

        const goldAccentMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.35,
            metalness: 0.85
        });

        // 1. Massive Temple Pillars (Classical Gupta Architecture - fluted shaft + inverted lotus capital + square abacus)
        const pillarPositions = [
            [-5.5, 0, 3], [5.5, 0, 3],
            [-8, 0, -3], [8, 0, -3],
            [-11, 0, -10], [11, 0, -10],
            [-14, 0, -18], [14, 0, -18]
        ];

        pillarPositions.forEach(([x, y, z]) => {
            const pillarGroup = new THREE.Group();
            pillarGroup.position.set(x, y, z);

            // Stepped Square Base (Upapitha & Adhisthana)
            const base1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 2.6), darkStoneMaterial);
            base1.position.y = 0.35;
            base1.castShadow = true;
            base1.receiveShadow = true;
            pillarGroup.add(base1);

            const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 2.1), stoneMaterial);
            base2.position.y = 0.95;
            base2.castShadow = true;
            pillarGroup.add(base2);

            // Lower square pillar shaft (Kumbha section)
            const lowerShaft = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 1.5), stoneMaterial);
            lowerShaft.position.y = 2.3;
            lowerShaft.castShadow = true;
            pillarGroup.add(lowerShaft);

            // Gold decorative frieze band
            const goldBand = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.6), goldAccentMaterial);
            goldBand.position.y = 3.5;
            pillarGroup.add(goldBand);

            // Fluted Octagonal Column Shaft (typical Gupta style)
            const octShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 4.2, 16), stoneMaterial);
            octShaft.position.y = 5.7;
            octShaft.castShadow = true;
            pillarGroup.add(octShaft);

            // Inverted Bell/Lotus Capital (Kalasam / Ghatapallava)
            const bellCapital = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.6, 0.9, 16), stoneMaterial);
            bellCapital.position.y = 8.2;
            bellCapital.castShadow = true;
            pillarGroup.add(bellCapital);

            // Gold Lotus Ring
            const lotusRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 12, 24), goldAccentMaterial);
            lotusRing.position.y = 8.65;
            lotusRing.rotation.x = Math.PI / 2;
            pillarGroup.add(lotusRing);

            // Square Carved Abacus (Phalaka)
            const abacus = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), darkStoneMaterial);
            abacus.position.y = 9.1;
            abacus.castShadow = true;
            pillarGroup.add(abacus);

            // Bracket Capital with Lion/Garuda motif simulation
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 1.3), stoneMaterial);
            bracket.position.y = 9.55;
            pillarGroup.add(bracket);

            this.templeGroup.add(pillarGroup);
        });

        // 2. Temple Architrave & Ceiling Beams (Uttara & Potika)
        const beamGeo = new THREE.BoxGeometry(36, 1.2, 2.5);
        const frontBeam = new THREE.Mesh(beamGeo, stoneMaterial);
        frontBeam.position.set(0, 10.3, 3);
        frontBeam.castShadow = true;
        this.templeGroup.add(frontBeam);

        const midBeam = new THREE.Mesh(beamGeo, stoneMaterial);
        midBeam.position.set(0, 10.3, -3);
        midBeam.castShadow = true;
        this.templeGroup.add(midBeam);

        // Longitudinal Cross Beams
        const crossBeamGeo = new THREE.BoxGeometry(2, 1.0, 30);
        [-6, 6].forEach(x => {
            const crossBeam = new THREE.Mesh(crossBeamGeo, darkStoneMaterial);
            crossBeam.position.set(x, 10.9, -6);
            this.templeGroup.add(crossBeam);
        });

        // 3. Ancient Sandstone Flagstone Floor
        const floorGeo = new THREE.PlaneGeometry(80, 80, 20, 20);
        const floor = new THREE.Mesh(floorGeo, stoneMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.templeGroup.add(floor);

        // Center Temple Sanctum Entrance Frame
        const doorFrame = new THREE.Group();
        doorFrame.position.set(0, 0, -8);

        const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), stoneMaterial);
        leftJamb.position.set(-3.2, 4, 0);
        const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), stoneMaterial);
        rightJamb.position.set(3.2, 4, 0);
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.4, 1.4), darkStoneMaterial);
        lintel.position.set(0, 8.5, 0);

        // Sanctum inner glow portal
        const portalGeo = new THREE.PlaneGeometry(5.2, 7.6);
        const portalMat = new THREE.MeshBasicMaterial({
            color: 0x1b1109,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeo, portalMat);
        portal.position.set(0, 3.8, -0.1);

        doorFrame.add(leftJamb, rightJamb, lintel, portal);
        this.templeGroup.add(doorFrame);

        this.scene.add(this.templeGroup);
    }

    buildDustParticles() {
        const particleCount = 1800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 16;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
            scales[i] = Math.random() * 0.12 + 0.04;

            velocities.push({
                x: (Math.random() - 0.5) * 0.005,
                y: Math.random() * 0.008 + 0.003,
                z: (Math.random() - 0.5) * 0.005,
                seed: Math.random() * 100
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        // Procedural particle sprite (soft round sunbeam dust)
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 64;
        pCanvas.height = 64;
        const pCtx = pCanvas.getContext('2d');
        const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 230, 160, 1)');
        grad.addColorStop(0.3, 'rgba(218, 165, 32, 0.6)');
        grad.addColorStop(0.8, 'rgba(160, 100, 40, 0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, 64, 64);

        const particleTexture = new THREE.CanvasTexture(pCanvas);

        const material = new THREE.PointsMaterial({
            size: 0.35,
            map: particleTexture,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.dustParticles = new THREE.Points(geometry, material);
        this.dustVelocities = velocities;
        this.scene.add(this.dustParticles);
    }

    buildStarfieldAndMathSymbols() {
        // Deep astronomical starfield for Science & Aryabhata Section
        const starCount = 1400;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            // Spherical shell distribution in sky
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 55 + Math.random() * 25;

            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 5; // Up in the sky
            starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

        const starMat = new THREE.PointsMaterial({
            color: 0x99ddff,
            size: 0.5,
            transparent: true,
            opacity: 0.05, // Subtle initially, brightens in science section
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(starGeo, starMat);
        this.starsGroup.add(this.starfield);

        // Planetary Orbital Rings
        const ringMat = new THREE.LineBasicMaterial({
            color: 0xd4af37,
            transparent: true,
            opacity: 0.25
        });

        [8, 13, 19, 26].forEach((radius, idx) => {
            const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.75, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(64);
            const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
            const ring = new THREE.Line(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.3 + (idx * 0.15);
            ring.rotation.y = idx * 0.4;
            ring.position.set(0, 10, -5);
            this.starsGroup.add(ring);
        });

        // Floating Astronomical & Mathematical Glyphs (Zero, Pi, Aryabhata Brahmi Numerals)
        const symbols = ['०', 'π', 'jya', '१', '५', '९', '∞', '☉', '☽', '☿', '♀', '♂', '♃', '♄'];
        this.symbolObjects = [];

        symbols.forEach((sym, idx) => {
            const symCanvas = document.createElement('canvas');
            symCanvas.width = 128;
            symCanvas.height = 128;
            const sCtx = symCanvas.getContext('2d');
            sCtx.font = 'bold 64px serif';
            sCtx.fillStyle = '#ffd700';
            sCtx.textAlign = 'center';
            sCtx.textBaseline = 'middle';
            sCtx.fillText(sym, 64, 64);

            const tex = new THREE.CanvasTexture(symCanvas);
            const mat = new THREE.SpriteMaterial({
                map: tex,
                color: 0xffe680,
                transparent: true,
                opacity: 0.0,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(1.4, 1.4, 1);
            sprite.position.set(
                (Math.random() - 0.5) * 22,
                4 + Math.random() * 9,
                -5 + (Math.random() - 0.5) * 16
            );
            sprite.userData = {
                baseY: sprite.position.y,
                speed: 0.015 + Math.random() * 0.02,
                offset: Math.random() * Math.PI * 2
            };
            this.symbolObjects.push(sprite);
            this.starsGroup.add(sprite);
        });

        this.scene.add(this.starsGroup);
    }

    buildCoinRain() {
        // Falling Gupta Gold Coins for Economy & Trade Section
        const coinCount = 120;
        const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 24);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xefb82a,
            metalness: 0.92,
            roughness: 0.28,
            bumpMap: this.coinBumpTexture,
            bumpScale: 0.06
        });

        for (let i = 0; i < coinCount; i++) {
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.position.set(
                (Math.random() - 0.5) * 26,
                20 + Math.random() * 25,
                (Math.random() - 0.5) * 20
            );
            coin.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            coin.userData = {
                fallSpeed: 0.07 + Math.random() * 0.09,
                rotX: (Math.random() - 0.5) * 0.08,
                rotY: (Math.random() - 0.5) * 0.08,
                rotZ: (Math.random() - 0.5) * 0.08,
                resetY: 22 + Math.random() * 15
            };
            coin.castShadow = true;
            this.fallingCoins.push(coin);
            this.coinRainGroup.add(coin);
        }

        this.coinRainGroup.visible = false;
        this.scene.add(this.coinRainGroup);
    }

    buildIncenseSmoke() {
        // Realistic billowing temple incense smoke particles for Religion & Culture Section
        const smokeCount = 160;
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 128;
        sCanvas.height = 128;
        const sCtx = sCanvas.getContext('2d');
        const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
        sGrad.addColorStop(0, 'rgba(235, 215, 180, 0.45)');
        sGrad.addColorStop(0.4, 'rgba(190, 160, 130, 0.2)');
        sGrad.addColorStop(1, 'rgba(0,0,0,0)');
        sCtx.fillStyle = sGrad;
        sCtx.fillRect(0, 0, 128, 128);

        const smokeTex = new THREE.CanvasTexture(sCanvas);
        const smokeMat = new THREE.SpriteMaterial({
            map: smokeTex,
            transparent: true,
            opacity: 0.0,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        for (let i = 0; i < smokeCount; i++) {
            const sprite = new THREE.Sprite(smokeMat.clone());
            sprite.scale.set(1.5, 1.5, 1);
            sprite.position.set(
                (Math.random() - 0.5) * 3,
                0.2 + Math.random() * 10,
                -2 + (Math.random() - 0.5) * 4
            );
            sprite.userData = {
                speedY: 0.015 + Math.random() * 0.02,
                driftX: (Math.random() - 0.5) * 0.008,
                baseScale: 1.5 + Math.random() * 2.5,
                life: Math.random()
            };
            this.incenseParticles.push(sprite);
            this.incenseGroup.add(sprite);
        }

        this.scene.add(this.incenseGroup);
    }

    buildLegacyMonoliths() {
        // Five Towering Glowing Monolith Pillars (Science, Mathematics, Literature, Art, Culture)
        const pillarLabels = ['SCIENCE', 'MATHEMATICS', 'LITERATURE', 'ART', 'CULTURE'];
        const pillarColors = [0x50c878, 0x4aa3df, 0xe6a817, 0xdf5a3f, 0xb872e6];
        const pillarGeo = new THREE.BoxGeometry(1.6, 12, 1.6);

        pillarLabels.forEach((label, idx) => {
            const pGroup = new THREE.Group();
            const posX = (idx - 2) * 5.2;
            pGroup.position.set(posX, 6, -12);

            // Monolith Stone Shaft
            const monolithMat = new THREE.MeshStandardMaterial({
                color: 0x3d2f24,
                roughness: 0.6,
                metalness: 0.25,
                map: this.sandstoneTexture,
                bumpMap: this.stoneBumpTexture,
                bumpScale: 0.08
            });
            const monolith = new THREE.Mesh(pillarGeo, monolithMat);
            monolith.castShadow = true;
            monolith.receiveShadow = true;
            pGroup.add(monolith);

            // Glowing Inscription Runes Strip
            const stripeGeo = new THREE.PlaneGeometry(0.3, 10);
            const stripeMat = new THREE.MeshBasicMaterial({
                color: pillarColors[idx],
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });
            const stripeFront = new THREE.Mesh(stripeGeo, stripeMat);
            stripeFront.position.set(0, 0, 0.82);
            pGroup.add(stripeFront);

            // Ascending Celestial Light Beam
            const beamGeo = new THREE.CylinderGeometry(0.8, 1.4, 28, 16, 1, true);
            const beamMat = new THREE.MeshBasicMaterial({
                color: pillarColors[idx],
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(0, 14, 0);
            pGroup.add(beam);

            // Point Light for pillar aura
            const pLight = new THREE.PointLight(pillarColors[idx], 2.2, 12);
            pLight.position.set(0, 5, 2);
            pGroup.add(pLight);

            pGroup.userData = {
                color: pillarColors[idx],
                label: label,
                beam: beam,
                stripe: stripeMat,
                light: pLight,
                originalY: 6
            };

            this.monolithPillars.push(pGroup);
            this.monolithGroup.add(pGroup);
        });

        this.monolithGroup.position.y = -25; // Initially hidden beneath floor
        this.scene.add(this.monolithGroup);
    }

    onMouseMove(e) {
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = -(e.clientY / this.height - 0.5) * 2;
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.mouse.targetX = (e.touches[0].clientX / this.width - 0.5) * 2;
            this.mouse.targetY = -(e.touches[0].clientY / this.height - 0.5) * 2;
        }
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    updateSectionChoreography(sectionIndex, sectionProgress) {
        this.activeSection = sectionIndex;
        this.scrollProgress = sectionProgress;

        // Camera and Lighting Choreography across the 10 virtual museum wings
        if (sectionIndex < 9) {
            gsap.to(this.monolithGroup.position, { y: -25, duration: 1.5, ease: "power2.in" });
        }

        switch(sectionIndex) {
            case 0: // Hero: Grand Temple Entrance
                this.cameraTarget.set(0, 3.2, 0);
                gsap.to(this.camera.position, { x: 0, y: 3.2, z: 15.5, duration: 1.8, ease: "power2.out" });
                this.scene.fog.color.setHex(0x120c08);
                this.scene.fog.density = 0.015;
                this.sunLight.color.setHex(0xffbe6b);
                this.sunLight.intensity = 2.8;
                this.coinRainGroup.visible = false;
                break;

            case 1: // Section 1: The Gupta Empire (Interactive Map)
                this.cameraTarget.set(0, 2.5, -4);
                gsap.to(this.camera.position, { x: -2.5, y: 4.5, z: 12, duration: 1.8, ease: "power2.out" });
                this.sunLight.color.setHex(0xefb82a);
                this.sunLight.intensity = 2.4;
                this.coinRainGroup.visible = false;
                break;

            case 2: // Section 2: Great Rulers (Imperial Palace)
                this.cameraTarget.set(0, 3.5, -3);
                gsap.to(this.camera.position, { x: 2.2, y: 3.8, z: 11, duration: 1.8, ease: "power2.out" });
                this.sunLight.color.setHex(0xffaa44);
                this.sunLight.intensity = 2.6;
                this.coinRainGroup.visible = false;
                break;

            case 3: // Section 3: Science & Mathematics (Astronomical Observatory)
                this.cameraTarget.set(0, 6, -8);
                gsap.to(this.camera.position, { x: 0, y: 4.8, z: 9, duration: 2, ease: "power2.out" });
                this.scene.fog.color.setHex(0x04050d); // Deep celestial midnight
                this.scene.fog.density = 0.02;
                this.sunLight.color.setHex(0x5a7ca8); // Cool moonlight
                this.sunLight.intensity = 1.0;
                gsap.to(this.starfield.material, { opacity: 0.85, duration: 1.5 });
                this.symbolObjects.forEach(s => gsap.to(s.material, { opacity: 0.9, duration: 1 }));
                this.coinRainGroup.visible = false;
                break;

            case 4: // Section 4: Literature & Education (Ancient Archive)
                this.cameraTarget.set(0, 3, -6);
                gsap.to(this.camera.position, { x: -3, y: 3.5, z: 10, duration: 1.8, ease: "power2.out" });
                this.scene.fog.color.setHex(0x160f09);
                this.scene.fog.density = 0.018;
                this.sunLight.color.setHex(0xf39c12); // Amber candlelight
                this.sunLight.intensity = 2.2;
                gsap.to(this.starfield.material, { opacity: 0.1, duration: 1 });
                this.symbolObjects.forEach(s => gsap.to(s.material, { opacity: 0, duration: 1 }));
                this.coinRainGroup.visible = false;
                break;

            case 5: // Section 5: Art & Architecture (Museum Gallery)
                this.cameraTarget.set(0, 3.2, -5);
                gsap.to(this.camera.position, { x: 3.5, y: 3.6, z: 10.5, duration: 1.8, ease: "power2.out" });
                this.scene.fog.color.setHex(0x120c08);
                this.sunLight.color.setHex(0xffe0a0);
                this.sunLight.intensity = 2.5;
                this.coinRainGroup.visible = false;
                break;

            case 6: // Section 6: Economy & Trade (Falling Gold Coins)
                this.cameraTarget.set(0, 3.8, 0);
                gsap.to(this.camera.position, { x: 0, y: 4.2, z: 13, duration: 1.8, ease: "power2.out" });
                this.sunLight.color.setHex(0xffd700); // Shimmering Gold
                this.sunLight.intensity = 3.2;
                this.coinRainGroup.visible = true;
                // Play subtle coin chime
                if (window.soundEngine && !window.soundEngine.isMuted) {
                    window.soundEngine.playCoinChime();
                }
                break;

            case 7: // Section 7: Religion & Culture (Sanctuary of Incense)
                this.cameraTarget.set(0, 2.8, -4);
                gsap.to(this.camera.position, { x: -1.8, y: 3.2, z: 11, duration: 1.8, ease: "power2.out" });
                this.scene.fog.color.setHex(0x1a120b);
                this.sunLight.color.setHex(0xff9933); // Sacred saffron / oil lamp warm fire
                this.sunLight.intensity = 2.4;
                this.coinRainGroup.visible = false;
                this.incenseParticles.forEach(p => gsap.to(p.material, { opacity: 0.45, duration: 1 }));
                break;

            case 8: // Section 8: Decline of the Empire (Dark Bronze / Weathered Stone)
                this.cameraTarget.set(0, 3, -2);
                gsap.to(this.camera.position, { x: 1.5, y: 3.5, z: 13, duration: 2, ease: "power2.out" });
                this.scene.fog.color.setHex(0x0e0c0b); // Ashen bronze
                this.scene.fog.density = 0.025;
                this.sunLight.color.setHex(0x7c6248); // Dim twilight
                this.sunLight.intensity = 1.1;
                this.coinRainGroup.visible = false;
                break;

            case 9: // Section 9: Legacy (The Grand Monolith Hall)
            case 10: // Final Inscription
                this.cameraTarget.set(0, 6, -10);
                gsap.to(this.camera.position, { x: 0, y: 5.5, z: 15, duration: 2.2, ease: "power2.out" });
                this.scene.fog.color.setHex(0x0f0b08);
                this.scene.fog.density = 0.012;
                this.sunLight.color.setHex(0xffdf80);
                this.sunLight.intensity = 3.5;
                gsap.to(this.monolithGroup.position, { y: 0, duration: 2, ease: "back.out(1.2)" });
                this.coinRainGroup.visible = false;
                break;
        }
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Smooth mouse parallax lerp
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

        // Apply gentle mouse parallax to camera position and target
        const parallaxX = this.mouse.x * 0.8;
        const parallaxY = this.mouse.y * 0.4;
        this.camera.lookAt(
            this.cameraTarget.x + parallaxX * 0.5,
            this.cameraTarget.y + parallaxY * 0.5,
            this.cameraTarget.z
        );

        // Animate Floating Temple Dust Motes
        if (this.dustParticles) {
            const pos = this.dustParticles.geometry.attributes.position.array;
            for (let i = 0; i < this.dustVelocities.length; i++) {
                const vel = this.dustVelocities[i];
                pos[i * 3 + 1] += vel.y;
                pos[i * 3] += Math.sin(time * 0.5 + vel.seed) * 0.006;
                pos[i * 3 + 2] += Math.cos(time * 0.4 + vel.seed) * 0.006;

                // Reset height
                if (pos[i * 3 + 1] > 16) {
                    pos[i * 3 + 1] = 0.2;
                }
            }
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate Science & Math Floating Symbols
        if (this.symbolObjects && this.symbolObjects.length > 0) {
            this.symbolObjects.forEach(s => {
                s.position.y = s.userData.baseY + Math.sin(time * 1.5 + s.userData.offset) * 0.4;
                s.position.x += Math.cos(time * 0.8 + s.userData.offset) * 0.005;
            });
        }

        // Animate Falling Gold Coins (Section 6)
        if (this.coinRainGroup.visible && this.fallingCoins.length > 0) {
            this.fallingCoins.forEach(coin => {
                coin.position.y -= coin.userData.fallSpeed;
                coin.rotation.x += coin.userData.rotX;
                coin.rotation.y += coin.userData.rotY;
                coin.rotation.z += coin.userData.rotZ;

                if (coin.position.y < 0.2) {
                    coin.position.y = coin.userData.resetY;
                    coin.position.x = (Math.random() - 0.5) * 26;
                }
            });
        }

        // Animate Incense Smoke Wisps (Section 7)
        if (this.incenseParticles && this.incenseParticles.length > 0) {
            this.incenseParticles.forEach(p => {
                p.position.y += p.userData.speedY;
                p.position.x += p.userData.driftX + Math.sin(time * 2 + p.position.y) * 0.006;
                p.userData.life += 0.004;

                const currentScale = p.userData.baseScale * (1 + (p.position.y / 10));
                p.scale.set(currentScale, currentScale, 1);

                if (p.position.y > 10 || p.userData.life > 1) {
                    p.position.y = 0.3;
                    p.position.x = (Math.random() - 0.5) * 2.5;
                    p.userData.life = 0;
                }
            });
        }

        // Animate Legacy Monolith Beams (Section 9)
        if (this.monolithPillars && this.monolithPillars.length > 0) {
            this.monolithPillars.forEach((pGroup, idx) => {
                const beam = pGroup.userData.beam;
                if (beam) {
                    beam.rotation.y += 0.008;
                    const pulse = 0.12 + Math.sin(time * 2.5 + idx) * 0.06;
                    beam.material.opacity = pulse;
                }
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate master scene once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.masterScene = new GuptaMasterScene();
});
