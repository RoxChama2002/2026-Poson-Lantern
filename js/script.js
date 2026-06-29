// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a); // Match dark theme
scene.fog = new THREE.FogExp2(0x0f172a, 0.02); // Add some atmospheric fog

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 45); // Position camera to look down slightly

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Soft shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controls (OrbitControls so user can drag to rotate)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false; // Disabled so the mechanical counter-rotation is obvious
controls.autoRotateSpeed = 1.0;
controls.maxDistance = 80;
controls.minDistance = 20;

// 2. Lighting Setup
// Ambient light for base visibility
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

// Purple/Blue accent light to match the reference image atmosphere
const dirLight = new THREE.DirectionalLight(0x3b0764, 2);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// The main glowing yellow light coming from inside the lantern
const innerGlow = new THREE.PointLight(0xeab308, 3, 50);
innerGlow.position.set(0, 5, 0);
scene.add(innerGlow);


// 3. Procedural Texture Generation for Panels
function createLanternTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Higher resolution for more detail
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fill background with white (translucent base)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1024);

    // Dark purple/blue color for the cutouts
    const patternColor = '#1e1b4b';
    ctx.fillStyle = patternColor;
    ctx.strokeStyle = patternColor;

    // Complex Borders
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 964, 964);
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, 934, 934);

    // Corner Ornaments
    const corners = [[80, 80], [944, 80], [80, 944], [944, 944]];
    corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = patternColor;
    });

    // Central Ornate Mandala
    ctx.save();
    ctx.translate(512, 512);
    
    // Outer scalloped border
    ctx.beginPath();
    for(let i=0; i<24; i++) {
        ctx.rotate(Math.PI / 12);
        ctx.arc(0, 360, 40, 0, Math.PI);
    }
    ctx.stroke();
    
    // Multiple concentric circles with varying thicknesses
    ctx.lineWidth = 15;
    ctx.beginPath(); ctx.arc(0, 0, 340, 0, Math.PI * 2); ctx.stroke();
    
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, 310, 0, Math.PI * 2); ctx.stroke();
    
    // 16-point geometric star pattern
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
        ctx.rotate(Math.PI / 8);
        ctx.moveTo(0, 100);
        ctx.lineTo(40, 280);
        ctx.lineTo(-40, 280);
        ctx.lineTo(0, 100);
    }
    ctx.fill();

    // Inner detailed Lotus
    for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(120, 100, 120, 200, 0, 260);
        ctx.bezierCurveTo(-120, 200, -120, 100, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
        
        // Inner petal detail
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.bezierCurveTo(50, 100, 50, 150, 0, 200);
        ctx.bezierCurveTo(-50, 150, -50, 100, 0, 40);
        ctx.fillStyle = patternColor;
        ctx.fill();
    }
    
    // Absolute center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = patternColor;
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();

    // Top and Bottom trim patterns
    for(let x=100; x<924; x+=80) {
        // Top trim
        ctx.beginPath(); ctx.arc(x + 40, 60, 20, 0, Math.PI*2); ctx.stroke();
        // Bottom trim
        ctx.beginPath(); ctx.arc(x + 40, 964, 20, 0, Math.PI*2); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

const lanternTexture = createLanternTexture();

// Load the custom mandala texture using base64 string to bypass local CORS
const textureLoader = new THREE.TextureLoader();
// mandalaBase64 is defined in textureData.js which is loaded in index.html
const mandalaTexture = textureLoader.load(mandalaBase64);
// Ensure the texture maps nicely onto the 8 faces
mandalaTexture.wrapS = THREE.RepeatWrapping;
mandalaTexture.wrapT = THREE.RepeatWrapping;

// Load the Buddha texture
const buddhaTexture = textureLoader.load(buddhaBase64);
buddhaTexture.wrapS = THREE.RepeatWrapping;
buddhaTexture.wrapT = THREE.RepeatWrapping;

// Load the Dhammachakra texture
const chakraTexture = textureLoader.load(chakraBase64);
chakraTexture.wrapS = THREE.RepeatWrapping;
chakraTexture.wrapT = THREE.RepeatWrapping;

// Load the Clay Lantern texture
const clayTexture = textureLoader.load(clayBase64);
clayTexture.wrapS = THREE.RepeatWrapping;
clayTexture.wrapT = THREE.RepeatWrapping;

// 4. Materials
// Base configuration for our glowing panels
const baseMatConfig = {
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    roughness: 0.3,
    metalness: 0.1,
    map: lanternTexture,
    side: THREE.DoubleSide
};

// Create separate materials so they can change colors independently
// Apply clay texture to the base
const matBase = new THREE.MeshStandardMaterial({ ...baseMatConfig, map: clayTexture, emissiveMap: clayTexture, emissiveIntensity: 0.8 });
// Apply alternating Buddha and Dhammachakra textures to the middle column
const matMidBuddha = new THREE.MeshStandardMaterial({ ...baseMatConfig, map: buddhaTexture, emissiveMap: buddhaTexture, emissiveIntensity: 0.8 });
const matMidChakra = new THREE.MeshStandardMaterial({ ...baseMatConfig, map: chakraTexture, emissiveMap: chakraTexture, emissiveIntensity: 0.8 });
const matMid = [matMidBuddha, matMidChakra]; // Array for alternating sides
// Use the mandala texture specifically for the top section faces
const matTop = new THREE.MeshStandardMaterial({ ...baseMatConfig, map: mandalaTexture, emissiveMap: mandalaTexture, emissiveIntensity: 0.8 });
const matMini = new THREE.MeshStandardMaterial({ ...baseMatConfig, emissiveIntensity: 0.8 });

// Create a dark framework material for the edges/structure
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // Deep dark purple
    roughness: 0.8,
    metalness: 0.2,
});

// A group to hold all lantern parts
const lanternGroup = new THREE.Group();

// Internal Point Lights for the 3 zones
const lightBase = new THREE.PointLight(0xffffff, 2, 20); lightBase.position.y = 0; lanternGroup.add(lightBase);
const lightMid = new THREE.PointLight(0xffffff, 2, 20);  lightMid.position.y = 8; lanternGroup.add(lightMid);
const lightTop = new THREE.PointLight(0xffffff, 2, 20);  lightTop.position.y = 16.5; lanternGroup.add(lightTop);

// Function to create an octagonal cylinder segment with borders
function createOctagonSegment(radiusTop, radiusBottom, height, yPosition, material) {
    const group = new THREE.Group();
    
    // The main panels (8 radial segments creates an octagon)
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
    
    // Adjust UV mapping so texture tiles nicely on all 8 faces
    const uvAttribute = geometry.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
        const u = uvAttribute.getX(i);
        uvAttribute.setX(i, u * 8); // Repeat 8 times across the cylinder
    }
    
    // If an array of materials is provided, assign them to alternating faces
    if (Array.isArray(material)) {
        geometry.clearGroups();
        // A cylinder with 8 radial segments has 2 triangles (6 indices) per face side
        // We only map the 8 side faces, ignoring the hidden top/bottom caps
        for(let i = 0; i < 8; i++) {
            geometry.addGroup(i * 6, 6, i % material.length);
        }
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yPosition;
    mesh.castShadow = true;
    
    // Create the wireframe (edges) for the traditional look
    const edgesGeom = new THREE.EdgesGeometry(geometry);
    const edges = new THREE.LineSegments(edgesGeom, new THREE.LineBasicMaterial({ color: 0x1e1b4b, linewidth: 2 }));
    mesh.add(edges);
    
    group.add(mesh);
    return group;
}

// Build the 3-Tiered Structure
// Groups for rotating sections independently
const baseGroup = new THREE.Group();
const midGroup = new THREE.Group();
const topGroup = new THREE.Group();
lanternGroup.add(baseGroup);
lanternGroup.add(midGroup);
lanternGroup.add(topGroup);

// Tier 1: The wide slanted base (bottom radius stays 12, top radius increases to 7.5)
const base = createOctagonSegment(7.5, 12, 4, 0, matBase);
baseGroup.add(base);

// Tier 2: The tall central column (wider: 7.5)
const middleColumn = createOctagonSegment(7.5, 7.5, 12, 8, matMid);
midGroup.add(middleColumn);

// Tier 3: The tapered top section (wider: goes from 7.5 up to 10)
const topSection = createOctagonSegment(10, 7.5, 5, 16.5, matTop);
topGroup.add(topSection);

// Add a flat cover to the top and bottom to seal it off
const topCoverGeom = new THREE.CylinderGeometry(10, 10, 0.2, 8);
const topCover = new THREE.Mesh(topCoverGeom, frameMaterial);
topCover.position.y = 19.1;
topGroup.add(topCover);

const bottomCoverGeom = new THREE.CylinderGeometry(12, 12, 0.2, 8);
const bottomCover = new THREE.Mesh(bottomCoverGeom, frameMaterial);
bottomCover.position.y = -2.1;
baseGroup.add(bottomCover);


// 5. Add the glowing Lotus on top
function createLotus() {
    const group = new THREE.Group();
    
    // The Floating Magical Orb (above the lotus)
    const orbGeom = new THREE.SphereGeometry(0.8, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffd700, // Gold
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.95
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    orb.position.y = 4.5; // Float above the smaller lotus
    group.add(orb);
    
    // A point light inside the orb to cast golden light downwards
    const orbLight = new THREE.PointLight(0xffd700, 3, 30);
    orbLight.position.y = 4.5;
    group.add(orbLight);

    // The glowing yellow center (stamen)
    const centerGeom = new THREE.CylinderGeometry(1.8, 1.2, 0.8, 32);
    const centerMat = new THREE.MeshStandardMaterial({
        color: 0xffe600,
        emissive: 0xffa500,
        emissiveIntensity: 1.2,
        roughness: 0.4
    });
    const center = new THREE.Mesh(centerGeom, centerMat);
    center.position.y = 0.5;
    group.add(center);
    
    // Lotus petals using flattened spheres for elegant, curved, pointed shapes
    const petalGeom = new THREE.SphereGeometry(1, 16, 16);
    // Translate so the bottom "pole" (which is pointed) is exactly at the origin for pivoting
    petalGeom.translate(0, 1, 0);
    
    // Create 5 dense rings of lush petals
    for(let ring = 0; ring < 5; ring++) {
        // Outer rings have more petals
        const numPetals = 8 + ring * 4; 
        const angleStep = (Math.PI * 2) / numPetals;
        
        // Inner rings are almost upright, outer rings lay almost flat
        const tilt = Math.PI/10 + (ring * Math.PI/10); 
        
        // Gradient colors: Inner rings are lighter pink, outer are darker/magenta
        const ringColor = new THREE.Color().setHSL(0.9, 0.85, 0.75 - ring*0.08);
        const petalMat = new THREE.MeshStandardMaterial({
            color: ringColor,
            emissive: ringColor,
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });

        for(let i = 0; i < numPetals; i++) {
            const petal = new THREE.Mesh(petalGeom, petalMat);
            
            // Shape the sphere into a perfect petal: wider as we go out, tall, very thin
            petal.scale.set(1.0 + ring*0.3, 2.8 + ring*0.15, 0.1);
            
            // Staggered overlap layout
            const angle = i * angleStep + (ring * 0.25);
            // We MUST use 'YXZ' order: rotate to face outwards (Y) first, THEN tilt back (X)
            petal.rotation.set(tilt, angle, 0, 'YXZ');
            
            // Push petals outwards horizontally so they wrap around the center
            const radius = 0.5 + ring * 0.4;
            petal.position.x = Math.sin(angle) * radius;
            petal.position.z = Math.cos(angle) * radius;
            petal.position.y = 0.2 - (ring * 0.15); // Outer rings sit slightly lower
            
            group.add(petal);
        }
    }
    
    // Magical glowing dust particles floating up from the lotus
    const dustGeom = new THREE.BufferGeometry();
    const dustCount = 80;
    const dustPos = new Float32Array(dustCount * 3);
    for(let i=0; i<dustCount*3; i+=3) {
        dustPos[i] = (Math.random() - 0.5) * 8; // x
        dustPos[i+1] = Math.random() * 12;      // y
        dustPos[i+2] = (Math.random() - 0.5) * 8; // z
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        color: 0xffe600,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(dustGeom, dustMat);
    group.add(dust);
    
    // Save references to animate later
    group.userData.dust = dust;
    group.userData.orb = orb;
    group.userData.orbLight = orbLight;
    
    // Scale the entire lotus down so it fits perfectly on top
    group.scale.set(1.0, 1.0, 1.0);
    
    return group;
}

const lotus = createLotus();
lotus.position.y = 19.5; // Sit directly on the top cover
topGroup.add(lotus);


// 6. Add the hanging side mini-lanterns
const sideLanterns = [];
function addMiniLantern(angle, radius, poleY) {
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    
    // Create the horizontal stick sticking out from the main body
    // The main body radius is approx 9 at this height (since it tapers from 7.5 to 10)
    const stickLength = radius - 9; 
    const stickCenter = 9 + stickLength / 2;
    const stickGeom = new THREE.CylinderGeometry(0.06, 0.06, stickLength);
    const stick = new THREE.Mesh(stickGeom, frameMaterial);
    
    stick.position.set(x * stickCenter, poleY, z * stickCenter);
    stick.lookAt(x * radius, poleY, z * radius);
    stick.rotateX(Math.PI / 2);
    topGroup.add(stick);
    
    // Create a Pivot Group at the exact end of the pole.
    // This ensures the string and lantern swing together naturally!
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(x * radius, poleY, z * radius);
    
    // The vertical string hanging down from the pivot
    const stringLen = 1.5;
    const stringGeom = new THREE.CylinderGeometry(0.015, 0.015, stringLen);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const string = new THREE.Mesh(stringGeom, stringMat);
    string.position.y = -stringLen / 2; // Go down from pivot
    pivotGroup.add(string);
    
    // Mini lantern body, placed exactly below the string
    const geom = new THREE.CylinderGeometry(1.5, 1, 3, 8);
    // Fix UVs for mini lantern
    const uvs = geom.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
        uvs.setX(i, uvs.getX(i) * 8);
    }
    
    const mesh = new THREE.Mesh(geom, matMini); // Use shared mini material
    
    // Edges
    const edgesGeom = new THREE.EdgesGeometry(geom);
    const edges = new THREE.LineSegments(edgesGeom, new THREE.LineBasicMaterial({ color: 0x1e1b4b }));
    mesh.add(edges);
    
    // Top of lantern touches bottom of string
    const lanternY = -stringLen - 1.5;
    mesh.position.y = lanternY;
    pivotGroup.add(mesh);
    
    // Add a tiny point light inside (color will be updated in loop)
    const miniLight = new THREE.PointLight(0xffffff, 1, 10);
    miniLight.position.y = lanternY;
    pivotGroup.add(miniLight);
    
    // Store reference to light to update its color later
    pivotGroup.userData = { light: miniLight };
    
    topGroup.add(pivotGroup);
    sideLanterns.push(pivotGroup);
}

// Add 8 mini lanterns around the top section (pushed out to radius 15)
for(let i=0; i<8; i++) {
    addMiniLantern((Math.PI / 4) * i, 15, 16);
}

// Center the whole group vertically
lanternGroup.position.y = -10;
scene.add(lanternGroup);


// 7. Setup lil-gui Control Panel
const defaultParams = {
    topSpeed: 0.5,
    midSpeed: 0.5,
    baseSpeed: 0.5,
    topWidth: 1.0,
    midWidth: 1.0,
    baseWidth: 1.0,
    innerGlowIntensity: 3.0,
    ambientLightIntensity: 1.5,
};

// Load saved settings if they exist
let savedSettings = {};
try {
    const saved = localStorage.getItem('lanternSettings');
    if (saved) savedSettings = JSON.parse(saved);
} catch (e) {
    console.error("Could not load settings", e);
}

const params = {
    ...defaultParams,
    ...savedSettings,
    
    // Image Upload Handlers
    uploadTop: () => document.getElementById('uploadTop').click(),
    uploadMid1: () => document.getElementById('uploadMid1').click(),
    uploadMid2: () => document.getElementById('uploadMid2').click(),
    uploadBase: () => document.getElementById('uploadBase').click(),
    
    // Save / Restore
    saveSettings: () => {
        const toSave = {
            topSpeed: params.topSpeed,
            midSpeed: params.midSpeed,
            baseSpeed: params.baseSpeed,
            topWidth: params.topWidth,
            midWidth: params.midWidth,
            baseWidth: params.baseWidth,
            innerGlowIntensity: params.innerGlowIntensity,
            ambientLightIntensity: params.ambientLightIntensity
        };
        localStorage.setItem('lanternSettings', JSON.stringify(toSave));
        alert('Settings Saved!');
    },
    
    restoreDefaults: () => {
        Object.assign(params, defaultParams);
        // Force GUI to update visually
        gui.controllersRecursive().forEach(c => c.updateDisplay());
        
        // Apply structural resets
        topSection.scale.set(params.topWidth, 1, params.topWidth);
        topCover.scale.set(params.topWidth, 1, params.topWidth);
        middleColumn.scale.set(params.midWidth, 1, params.midWidth);
        base.scale.set(params.baseWidth, 1, params.baseWidth);
        bottomCover.scale.set(params.baseWidth, 1, params.baseWidth);
        innerGlow.intensity = params.innerGlowIntensity;
        ambientLight.intensity = params.ambientLightIntensity;
        
        localStorage.removeItem('lanternSettings');
        alert('Restored to Defaults!');
    }
};

// Apply loaded sizes/lights immediately
topSection.scale.set(params.topWidth, 1, params.topWidth);
topCover.scale.set(params.topWidth, 1, params.topWidth);
middleColumn.scale.set(params.midWidth, 1, params.midWidth);
base.scale.set(params.baseWidth, 1, params.baseWidth);
bottomCover.scale.set(params.baseWidth, 1, params.baseWidth);
innerGlow.intensity = params.innerGlowIntensity;
ambientLight.intensity = params.ambientLightIntensity;

const gui = new lil.GUI({ title: 'Lantern Customization' });

// Hide GUI by default
gui.hide();

// Add close button to the GUI
gui.add({ close: () => {
    gui.hide();
    document.getElementById('customize-btn').style.display = 'block';
}}, 'close').name('✖ Close Panel');

// Handle Customize button click
document.getElementById('customize-btn').addEventListener('click', (e) => {
    gui.show();
    e.target.style.display = 'none';
});

// Structural Parameters
const structureFolder = gui.addFolder('Size & Structure');
structureFolder.add(params, 'topWidth', 0.5, 2.0).name('Top Width').onChange(v => {
    topSection.scale.set(v, 1, v);
    topCover.scale.set(v, 1, v);
});
structureFolder.add(params, 'midWidth', 0.5, 2.0).name('Middle Width').onChange(v => {
    middleColumn.scale.set(v, 1, v);
});
structureFolder.add(params, 'baseWidth', 0.5, 2.0).name('Base Width').onChange(v => {
    base.scale.set(v, 1, v);
    bottomCover.scale.set(v, 1, v);
});

// Animation Parameters
const animFolder = gui.addFolder('Animation Speeds');
animFolder.add(params, 'topSpeed', -2.0, 2.0).name('Top Speed');
animFolder.add(params, 'midSpeed', -2.0, 2.0).name('Middle Speed');
animFolder.add(params, 'baseSpeed', -2.0, 2.0).name('Base Speed');

// Lighting Parameters
const lightFolder = gui.addFolder('Lighting');
lightFolder.add(params, 'innerGlowIntensity', 0, 10).name('Inner Glow').onChange(v => innerGlow.intensity = v);
lightFolder.add(params, 'ambientLightIntensity', 0, 5).name('Ambient Light').onChange(v => ambientLight.intensity = v);

// Image Uploads
const imageFolder = gui.addFolder('Custom Textures');
imageFolder.add(params, 'uploadTop').name('Upload Top Mandala');
imageFolder.add(params, 'uploadMid1').name('Upload Middle Image 1');
imageFolder.add(params, 'uploadMid2').name('Upload Middle Image 2');
imageFolder.add(params, 'uploadBase').name('Upload Base Texture');

// Image Upload Event Handlers
function handleImageUpload(event, material, isArray = false, arrayIndex = 0) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const newTexture = new THREE.Texture(img);
                newTexture.wrapS = THREE.RepeatWrapping;
                newTexture.wrapT = THREE.RepeatWrapping;
                newTexture.needsUpdate = true;
                
                if (isArray) {
                    material[arrayIndex].map = newTexture;
                    material[arrayIndex].emissiveMap = newTexture;
                    material[arrayIndex].needsUpdate = true;
                } else {
                    material.map = newTexture;
                    material.emissiveMap = newTexture;
                    material.needsUpdate = true;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('uploadTop').addEventListener('change', (e) => handleImageUpload(e, matTop));
document.getElementById('uploadMid1').addEventListener('change', (e) => handleImageUpload(e, matMid, true, 0));
document.getElementById('uploadMid2').addEventListener('change', (e) => handleImageUpload(e, matMid, true, 1));
document.getElementById('uploadBase').addEventListener('change', (e) => handleImageUpload(e, matBase));

// Save and Restore
const settingsFolder = gui.addFolder('Save & Restore');
settingsFolder.add(params, 'saveSettings').name('Save Settings');
settingsFolder.add(params, 'restoreDefaults').name('Restore Defaults');

// 8. Animation Loop
const clock = new THREE.Clock();
let shareGlowStartTime = -1;

document.getElementById('share-btn').addEventListener('click', () => {
    shareGlowStartTime = clock.getElapsedTime();
});

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    controls.update(); // Required for damping and autoRotate
    
    // Rotate the 3 main tiers slowly in opposite directions
    topGroup.rotation.y = time * params.topSpeed; // Left
    midGroup.rotation.y = -time * params.midSpeed; // Right
    baseGroup.rotation.y = time * params.baseSpeed; // Left
    
    // Swing the side lanterns slightly
    sideLanterns.forEach((lantern, index) => {
        // Simple pendulum-like swing
        lantern.rotation.x = Math.sin(time * 2 + index) * 0.1;
        lantern.rotation.z = Math.cos(time * 2 + index) * 0.1;
    });
    
    // Animate Lotus magical effects (Orb bobbing & dust floating)
    if (lotus.userData.orb) {
        // Smooth bobbing motion
        lotus.userData.orb.position.y = 4.5 + Math.sin(time * 2) * 0.5;
        lotus.userData.orbLight.position.y = lotus.userData.orb.position.y;
        
        // Share Blessing Glow Effect
        if (shareGlowStartTime > 0) {
            const t = time - shareGlowStartTime;
            if (t < 4) {
                // Creates a burst that peaks quickly and fades smoothly
                const burst = t * Math.exp(-t * 2) * 50; 
                lotus.userData.orb.material.emissiveIntensity = 2.5 + burst;
                lotus.userData.orbLight.intensity = 3 + burst * 1.5;
                if (lotus.userData.dust) {
                    lotus.userData.dust.material.size = 0.2 + (burst * 0.02);
                }
            } else {
                shareGlowStartTime = -1;
                lotus.userData.orb.material.emissiveIntensity = 2.5;
                lotus.userData.orbLight.intensity = 3;
                if (lotus.userData.dust) {
                    lotus.userData.dust.material.size = 0.2;
                }
            }
        }
    }
    
    if (lotus.userData.dust) {
        const positions = lotus.userData.dust.geometry.attributes.position.array;
        for(let i=1; i<positions.length; i+=3) {
            positions[i] += 0.03; // move up continuously
            if (positions[i] > 12) {
                positions[i] = 0; // reset to bottom once they float too high
            }
        }
        lotus.userData.dust.geometry.attributes.position.needsUpdate = true;
    }
    
    // RGB Color Cycling for the 3 main zones
    // We use HSL for smooth rainbow transitions.
    // Base zone
    const hueBase = (time * 0.1) % 1;
    matBase.emissive.setHSL(hueBase, 1, 0.5);
    lightBase.color.setHSL(hueBase, 1, 0.5);
    
    // Mid zone (offset by 33%)
    const hueMid = (time * 0.1 + 0.33) % 1;
    if (Array.isArray(matMid)) {
        matMid[0].emissive.setHSL(hueMid, 1, 0.5);
        matMid[1].emissive.setHSL(hueMid, 1, 0.5);
    } else {
        matMid.emissive.setHSL(hueMid, 1, 0.5);
    }
    lightMid.color.setHSL(hueMid, 1, 0.5);
    
    // Top zone (offset by 66%)
    const hueTop = (time * 0.1 + 0.66) % 1;
    matTop.emissive.setHSL(hueTop, 1, 0.5);
    lightTop.color.setHSL(hueTop, 1, 0.5);
    
    // Mini lanterns all share the same color to stay perfectly synced
    // They pulse in intensity to create a flicker, and cycle hue twice as fast
    const hueMini = (time * 0.2) % 1;
    const miniIntensity = 0.6 + Math.sin(time * 8) * 0.3; // Flicker
    matMini.emissive.setHSL(hueMini, 1, miniIntensity);
    
    // Update all mini internal point lights to match
    sideLanterns.forEach(lantern => {
        lantern.userData.light.color.setHSL(hueMini, 1, 0.5);
        lantern.userData.light.intensity = miniIntensity * 2;
    });

    renderer.render(scene, camera);
}

// 7. Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();
