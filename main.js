import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const planets = [];
const planetInfo = [
    { name: 'Earth', distance: 40, speed: 0.02, scale: [0.01,0.01,0.01] },
    { name: 'Jupiter', distance: 80, speed: 0.018, scale: [0.05,0.05,0.05] },
    { name: 'Neptune', distance: 120, speed: 0.015, scale: [1,1,1] },
    { name: 'Planet4', distance: 400, speed: 0.012, scale: [0.1,0.1,0.1] },
    { name: 'Planet5', distance: 500, speed: 0.01, scale: [0.1,0.1,0.1] },
];

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);

// Load the Sun
loader.load('Sun.glb', (gltf) => {
    const sun = gltf.scene;
    sun.scale.set(10, 10, 10); // Adjust scale for visibility
    sun.position.set(0, 0, 0);
    scene.add(sun);
});

// Load planets
planetInfo.forEach(info => {
    loader.load(`${info.name}.glb`, (gltf) => {
        const planet = gltf.scene;
        planet.scale.set(...info.scale); // Scale down for appropriate size
        planet.position.x = info.distance;
        scene.add(planet);
        planets.push({ mesh: planet, speed: info.speed/2, distance: info.distance, angle: 0 });
    });
});

// OrbitControls to pivot around the Sun
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
camera.position.set(0, 150, 300);
controls.update();

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
