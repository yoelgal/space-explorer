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
    { name: 'Earth', distance: 40, speed: 0.02, scale: [0.01, 0.01, 0.01] },
    { name: 'Jupiter', distance: 80, speed: 0.018, scale: [0.05, 0.05, 0.05] },
    { name: 'Neptune', distance: 120, speed: 0.015, scale: [1, 1, 1] },
    { name: 'Planet4', distance: 400, speed: 0.012, scale: [0.1, 0.1, 0.1] },
    { name: 'Planet5', distance: 500, speed: 0.01, scale: [0.1, 0.1, 0.1] },
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

var ship;
var cameraFollow = false;

// Load the Ship
loader.load('Flying saucer.glb', (gltf) => {
    ship = gltf.scene;
    ship.scale.set(1, 1, 1); // Adjust scale for visibility
    ship.position.set(9999, 9999, 9999);
    scene.add(ship);
});

// Controls
// Create a variable to store the movement speed
var movementSpeed = 1;

// Create a variable to store the keyboard state
var keyboard = {};

// Event listener to track key presses
document.addEventListener('keydown', function (event) {
    keyboard[event.key] = true;
});

document.addEventListener('keyup', function (event) {
    keyboard[event.key] = false;
});

// Load planets
planetInfo.forEach(info => {
    loader.load(`${info.name}.glb`, (gltf) => {
        const planet = gltf.scene;
        planet.scale.set(...info.scale); // Scale down for appropriate size
        planet.position.x = info.distance;
        scene.add(planet);
        planets.push({ mesh: planet, speed: info.speed / 2, distance: info.distance, angle: 0 });
    });
});

// OrbitControls to pivot around the Sun
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
camera.position.set(0, 150, 300);
controls.update();

// Assuming you have a loaded ship object and a camera already created
var cameraOffset = new THREE.Vector3(0, 2, -5); // Adjust the offset as needed
var cameraRotationSpeed = 0.04; // Adjust the rotation speed as needed
var cameraYaw = 0;
var cameraDirection = new THREE.Vector3();

// Function to update camera position based on the ship's position and orientation
function updateCamera() {
    if (ship) { // Assuming 'ship' is your loaded ship ship
        // Apply ship's rotation to the offset
        var offset = cameraOffset.clone().applyQuaternion(ship.quaternion);
        // Set camera's position relative to the ship's position
        camera.position.copy(ship.position).add(offset);
        // Rotate the camera around the ship
        camera.position.sub(ship.position);
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        camera.position.add(ship.position);
        // Make the camera look at the ship's position
        camera.lookAt(ship.position);

        camera.getWorldDirection(cameraDirection);
    }
}

// Function to update object position based on key presses
function update() {
    // Move forward when 'W' key is pressed
    if (keyboard['w']) {
        // Calculate the direction of movement based on the object's rotation
        var velocity = new THREE.Vector3(movementSpeed * cameraDirection.x, 0, movementSpeed * cameraDirection.z);
        // Update the ship's position
        ship.position.add(velocity);
    }

    if (keyboard['a']) {
        // Calculate the direction of movement based on the object's rotation
        cameraYaw += cameraRotationSpeed
        console.log(camera.quaternion);
    }

    if (keyboard['s']) {
        // Calculate the direction of movement based on the object's rotation
        var velocity = new THREE.Vector3(movementSpeed * -cameraDirection.x, 0, movementSpeed * -cameraDirection.z);
        // Update the ship's position
        ship.position.add(velocity);
    }

    if (keyboard['d']) {
        // Calculate the direction of movement based on the object's rotation
        cameraYaw -= cameraRotationSpeed
    }

    if (keyboard[' ']) {
        // Update the ship's position
        ship.position.set(0, 0, 0);
        cameraFollow = true;
    }

    // You can add similar checks for other keys like 'A', 'S', 'D' for movement in other directions

    // Call this function in your render loop
    requestAnimationFrame(update);
}

// Call the update function to start listening for key presses
update();

// Update planets in their orbits
function animate() {
    requestAnimationFrame(animate);
    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    });
    if (cameraFollow) {
        updateCamera();
    }
    renderer.render(scene, camera);
}

animate();