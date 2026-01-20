import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(1.8, 0, 2); // Closer zoom (reduced from 3, 2, 4)
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.style.opacity = '0'; // Start hidden for fade-in
renderer.domElement.style.transition = 'opacity 1s ease-in-out';
container.appendChild(renderer.domElement);

// -------------------------------------------------------------------------
// Lighting Setup (Matching Blender "Sun" Settings)
// -------------------------------------------------------------------------

// 1. Ambient Light (Base level) - Darker for drama
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Reduced from 0.2
scene.add(ambientLight);

// 2. Sun 1 (Key Light) - Sharp, Cool highlight
const sun1 = new THREE.DirectionalLight(0xffffff, 2.5); 
sun1.position.set(-3, 5, 5); 
sun1.castShadow = true;
sun1.shadow.mapSize.width = 2048; 
sun1.shadow.mapSize.height = 2048;
sun1.shadow.bias = -0.0001;
sun1.shadow.radius = 4; 
scene.add(sun1);

// 3. Sun 2 (Fill/Warm Light) - Gold tint for the "Royal" feel
const sun2 = new THREE.DirectionalLight(0xffd700, 1.5); // Gold
sun2.position.set(5, 2, 2); 
sun2.castShadow = true; 
scene.add(sun2);

// 4. Sun 3 (Rim Light) - Blue/Cool for separation
const sun3 = new THREE.DirectionalLight(0x4040ff, 1.8);
sun3.position.set(0, 5, -5); // Backlight
scene.add(sun3);

// -------------------------------------------------------------------------
// Shadow Catcher
// -------------------------------------------------------------------------
// Invisible plane that only receives shadows
const planeGeom = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.ShadowMaterial({
    opacity: 0.5, // Stronger shadows needed on dark ground
    color: 0x000000
});
const shadowPlane = new THREE.Mesh(planeGeom, planeMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -1; // Default low, will be adjusted by model
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// Load 3D Model
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );

let mixer;
let loadedModel; // Variable to store model for rotation

// Variables for drag interaction
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

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
        
        // Snap shadow plane to bottom of model (accounting for offset)
        shadowPlane.position.y = (-boxSize.y / 2) - verticalOffset;

        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
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
            }, 500); // Wait for transition to finish
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
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);

// Mouse Interaction Event Listeners to Rotate Model Only
renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDragging && loadedModel) {
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x
        };

        const rotationSpeed = 0.005;
        loadedModel.rotation.y += deltaMove.x * rotationSpeed;
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});

renderer.domElement.addEventListener('mouseup', (e) => {
    isDragging = false;
});

// For touch devices (optional, largely same logic)
renderer.domElement.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
renderer.domElement.addEventListener('touchmove', (e) => {
   if (isDragging && loadedModel) {
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x
        };
        const rotationSpeed = 0.005;
        loadedModel.rotation.y += deltaMove.x * rotationSpeed;
        
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
   } 
});
renderer.domElement.addEventListener('touchend', (e) => {
    isDragging = false;
});


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
    
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    // Auto-rotate slowly when not dragging (optional, user asked for slow rotation in previous steps)
    if (loadedModel && !isDragging) {
        loadedModel.rotation.y += 0.0015; 
    }
    
    renderer.render(scene, camera);
}

animate();
