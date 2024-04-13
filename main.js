import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const planets = [];
const planetInfo = [
    { name: 'Earth', distance: 100, speed: 0.02, scale: [1,1,1] },
];

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);

// Load the Sun
loader.load('Sun.glb', (gltf) => {
    const sun = gltf.scene;
    sun.scale.set(50, 50, 50); // Adjust scale for visibility
    sun.position.set(0, 0, 0);
    scene.add(sun);
});

// Load planets
planetInfo.forEach(planet => {
    loader.load(`${planet.name}.glb`, (gltf) => {
        const planet = gltf.scene;
        planet.scale.set(...planet.scale); // Scale down for appropriate size
        planet.position.x = planet.distance;
        scene.add(planet);
        planets.push({ mesh: planet, speed: planet.speed/2, distance: planet.distance, angle: 0 });
    });
});


camera.position.set(0.08343285914438951, 335.3059565045275, 8.361134584523754);
camera.lookAt(new THREE.Vector3(0, 0, 0));
/*
x:0.08343285914438951
y:335.3059565045275
z:8.361134584523754
*/

// Update planets in their orbits
function animate() {
    requestAnimationFrame(animate);
    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    });
    renderer.render(scene, camera);
}

animate();
