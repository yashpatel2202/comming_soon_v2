import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(1.8, 0, 2); // Closer zoom (reduced from 3, 2, 4)
camera.lookAt(0, 0, 0);

// Renderer setup
// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Limit pixel ratio for performance
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; // Important for realistic colors
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic lighting
renderer.toneMappingExposure = 0.5; // Darker, moodier exposure (Reduced from 0.8)
renderer.domElement.style.opacity = '0'; // Start hidden for fade-in
renderer.domElement.style.transition = 'opacity 1s ease-in-out';
container.appendChild(renderer.domElement);

// Environment setup (Crucial for realistic PBR materials)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// -------------------------------------------------------------------------
// Lighting Setup (Dark & Royal Mode) - REDUCED INTENSITY
// -------------------------------------------------------------------------

// 1. Ambient Light (Barely visible)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.02);
scene.add(ambientLight);

// 2. Sun 1 (Key Light) - Dramatic side lighting, Brighter White
const sun1 = new THREE.DirectionalLight(0xffffff, 2.0); // Increased from 0.6
sun1.position.set(-5, 3, 5); 
sun1.castShadow = true;
sun1.shadow.mapSize.width = 2048; 
sun1.shadow.mapSize.height = 2048;
sun1.shadow.bias = -0.0001;
sun1.shadow.radius = 4; 
scene.add(sun1);

// 3. Sun 2 (Fill/Warm Light) - Strong Gold rim/fill (Brighter Yellow)
const sun2 = new THREE.DirectionalLight(0xffd700, 4.0); // Increased from 2.5
sun2.position.set(5, 0, 2); // Lower angle for dramatic up-lighting
sun2.castShadow = true; 
scene.add(sun2);

// 4. Sun 3 (Rim Light) - Blue separation (Increased Blueness)
const sun3 = new THREE.DirectionalLight(0x4040ff, 0.8); // Increased from 0.3
sun3.position.set(0, 5, -5); // Backlight
scene.add(sun3);

// 5. Yellow Glow Light (Warm & Premium)
const yellowGlow = new THREE.PointLight(0xd4af37, 5.0, 10);
yellowGlow.position.set(2, 2, 2); // Positioned to hit the side/front
scene.add(yellowGlow);

// -------------------------------------------------------------------------
// Premium Royal Base (Procedural Podium) - PRE-LOADED
// -------------------------------------------------------------------------
// Using estimated dimensions to match the sculpture so it appears INSTANTLY
const podiumY = -0.6; // Raised back up to be visible
const baseRadius = 0.45; // Keeping the tighter radius 
const baseHeight = 0.15;

// 1. Polished Black Marble Cylinder
const geometryBase = new THREE.CylinderGeometry( baseRadius, baseRadius * 1.05, baseHeight, 64 ); 
const materialBase = new THREE.MeshStandardMaterial( { 
    color: 0x050505, 
    roughness: 0.1, 
    metalness: 0.9,
    envMapIntensity: 1.0
} );
const cylinderBase = new THREE.Mesh( geometryBase, materialBase );
cylinderBase.position.y = podiumY - (baseHeight / 2);
cylinderBase.receiveShadow = true;
scene.add( cylinderBase );

// 2. Gold Accent Ring
const geometryRing = new THREE.TorusGeometry( baseRadius * 1.02, 0.01, 16, 100 ); 
const materialRing = new THREE.MeshStandardMaterial( { 
    color: 0xffd700, 
    roughness: 0.1, 
    metalness: 1.0,
    emissive: 0x332200
} ); 
const torusRing = new THREE.Mesh( geometryRing, materialRing );
torusRing.rotation.x = Math.PI / 2;
torusRing.position.y = podiumY - (baseHeight * 0.2); 
scene.add( torusRing );

// 3. Subtle Floor Glow Ring
const glowRingGeo = new THREE.RingGeometry(baseRadius * 1.4, baseRadius * 1.42, 64);
const glowRingMat = new THREE.MeshBasicMaterial( { 
    color: 0xffd700, 
    transparent: true, 
    opacity: 0.15, 
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending 
} );
const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
glowRing.rotation.x = -Math.PI / 2;
glowRing.position.y = podiumY - baseHeight + 0.01;
scene.add(glowRing);

// Load 3D Model
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );

let mixer;
let loadedModel; // Variable to store model for rotation

loader.load(
    'public/sculpture_v2.glb',
    (gltf) => {
        const model = gltf.scene;
        loadedModel = model; // Store reference
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const boxSize = box.getSize(new THREE.Vector3());
        
        // Adjust position to center it nicely
        model.position.sub(center);
        const verticalOffset = boxSize.y * 0.1;
        model.position.y -= verticalOffset; // Slight vertical adjustment
        
        // Initial Rotation (90 degrees)
        model.rotation.y = - (Math.PI / 1); // 90 degrees

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                // material setup
                node.material = new THREE.MeshStandardMaterial({
                    color: 0x756c60, // Dark grey/black
                    // color: 0xe1bb8a, // Dark grey/black
                    roughness: 2,  // Polished marble is smooth
                    metalness: 0.1,  // Slight metallic hint for reflection
                    envMapIntensity: 1.0 // Enhance reflections
                });
            }
        });

        scene.add(model);

        // Fade in Canvas
        setTimeout(() => {
             renderer.domElement.style.opacity = '1';
        }, 100);
        
        // Hide Loader
        const loaderElement = document.getElementById('loader');
        if (loaderElement) {
            loaderElement.classList.add('fade-out');
            setTimeout(() => {
                loaderElement.style.display = 'none';
            }, 800); // Wait for transition to finish
        }

        // If the model has animations
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }
    },
    (xhr) => {
        if (xhr.total > 0) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        } else {
            console.log('Loading...');
        }
    },
    (error) => {
        console.error('An error happened', error);
    }
);

let mouseXOnMouseDown = 0;

let windowHalfX = window.innerWidth / 2;

// Velocity for inertia
let rotationVelocity = 0;
let isDragging = false;
let lastMouseX = 0;

function onDocumentMouseDown( event ) {
    isDragging = true;
    mouseXOnMouseDown = event.clientX - windowHalfX;
    lastMouseX = event.clientX;
    
    // Stop any existing momentum so user catches it
    rotationVelocity = 0; 
}

function onDocumentMouseMove( event ) {
    if ( isDragging ) {
        const deltaX = event.clientX - lastMouseX;
        lastMouseX = event.clientX;

        // Directly rotate for 1:1 feel while dragging
        // Adjust sensitivity as needed
        const sensitivity = 0.005;
        if (loadedModel) {
            loadedModel.rotation.y += deltaX * sensitivity;
        }

        // Calculate velocity for momentum on release
        rotationVelocity = deltaX * sensitivity;
    }
}

function onDocumentMouseUp() {
    isDragging = false;
}

// Touch support
function onDocumentTouchStart( event ) {
    if ( event.touches.length === 1 ) {
        event.preventDefault();
        isDragging = true;
        lastMouseX = event.touches[ 0 ].pageX;
        rotationVelocity = 0;
    }
}

function onDocumentTouchMove( event ) {
    if ( event.touches.length === 1 && isDragging ) {
        event.preventDefault();
        const deltaX = event.touches[ 0 ].pageX - lastMouseX;
        lastMouseX = event.touches[ 0 ].pageX;
        
        const sensitivity = 0.005;
        if (loadedModel) {
            loadedModel.rotation.y += deltaX * sensitivity;
        }
        rotationVelocity = deltaX * sensitivity;
    }
}

function onDocumentTouchEnd() {
    isDragging = false;
}

// Add listeners to the DOM Element (renderer canvas)
renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );

window.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener( 'mouseup', onDocumentMouseUp, false );
window.addEventListener( 'touchmove', onDocumentTouchMove, false );
window.addEventListener( 'touchend', onDocumentTouchEnd, false );


// Resize handler
window.addEventListener('resize', () => {
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    // Physics-based rotation in animation loop
    if (loadedModel) {
        if (!isDragging) {
            // Apply friction/damping to the velocity
            rotationVelocity *= 0.95; // 5% friction per frame
            
            // Apply the velocity to rotation
            loadedModel.rotation.y += rotationVelocity;
            
            // Add a very subtle constant auto-rotation if momentum has stopped
            if (Math.abs(rotationVelocity) < 0.0001) {
                loadedModel.rotation.y += 0.0015; // Gentle Drift
            }
        }
    }
    
    renderer.render(scene, camera);
}

animate();
