import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// MUSIC PLAYER
// Function to toggle play/pause of the audio
function toggleAudio(audio, button) {
    if (audio.paused) {
        audio.play() // If paused, play the audio
        button.innerHTML = '<i class="ph ph-speaker-high"></i>' // Change button text to 'Pause'
    } else {
        audio.pause() // If playing, pause the audio
        button.innerHTML = '<i class="ph ph-speaker-simple-x"></i>' // Change button text to 'Play'
    }
}

// Get the audio element
const audio = new Audio('iPhone_By_the_Sea_Alarm_Ringtone_(Apple Sound)_-_Sound_Effect_for_Editing.mp3') // Replace 'path_to_your_audio_file.mp3' with the actual path to your audio file
audio.loop = true // Set the audio to loop

// Get the music button element
const musicButton = document.getElementById('musicButton')

// Add event listener to the music button
musicButton.addEventListener('click', function () {
    toggleAudio(audio, musicButton)
})

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const planets = [];

const speedScale = 5

const planetInfo = [
    { name: 'Mercury', distance: 75, speed: 0.02 * speedScale, scale: [10, 10, 10] },
    { name: 'Venus', distance: 110, speed: 0.015 * speedScale, scale: [0.1, 0.1, 0.1] },
    { name: 'Earth', distance: 150, speed: 0.01 * speedScale, scale: [0.03, 0.03, 0.03] },
    { name: 'Mars', distance: 200, speed: 0.007 * speedScale, scale: [60, 60, 60] },
    { name: 'Jupiter', distance: 250, speed: 0.004 * speedScale, scale: [0.1, 0.1, 0.1] },
    { name: 'Saturn', distance: 350, speed: 0.003 * speedScale, scale: [50, 50, 50] },
    { name: 'Uranus', distance: 450, speed: 0.002 * speedScale, scale: [50, 50, 50] },
    { name: 'Neptune', distance: 550, speed: 0.0015 * speedScale, scale: [25, 25, 25] },
]

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);

// Load the Sun
loader.load('Sun.glb', (gltf) => {
    const sun = gltf.scene;
    sun.scale.set(50, 50, 50); // Adjust scale for visibility
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Add a point light to simulate the sun's light
    const sunLight = new THREE.PointLight(0xffffff, 5, 0) // Adjust the intensity and distance as needed
    sunLight.position.copy(sun.position)
    scene.add(sunLight)
});

let ship;
let cameraFollow = false;

// Load the Ship
loader.load('Flying saucer.glb', (gltf) => {
    ship = gltf.scene;
    ship.scale.set(1, 1, 1); // Adjust scale for visibility
    ship.position.set(9999, 9999, 9999);
    scene.add(ship);
});

document.addEventListener("DOMContentLoaded", function () {
    var startButton = document.getElementById("startButton");

    startButton.addEventListener("click", function () {
        start();
    });
});

// const startButton = document.getElementById("startButton");
// startButton.addEventListener("click", start());

// Controls

// Create a variable to store the movement speed
let movementSpeed = 1;

// Create a letiable to store the keyboard state
let keyboard = {};

// Event listener to track key presses
document.addEventListener('keydown', function (event) {
    keyboard[event.key] = true;
});

document.addEventListener('keyup', function (event) {
    keyboard[event.key] = false;
});

planetInfo.forEach(planet => {
    loadPlanet(`${planet.name}.glb`, planet.scale, planet.distance, planet.speed)
})

function loadPlanet(modelPath, scale, distance, speed) {
    loader.load(modelPath, (gltf) => {
        const planetMesh = gltf.scene
        if (!planetMesh) {
            console.error('Error loading planet:', modelPath)
            return
        }
        planetMesh.scale.set(...scale)
        planetMesh.position.x = distance

        // Add planet mesh to the scene
        scene.add(planetMesh)
        console.log('Planet added')
        // planets.push({ mesh: planetMesh, wireframe: wireframe, speed: speed / 2, distance: distance, angle: 0 })
        planets.push({ mesh: planetMesh, speed: speed / 2, distance: distance, angle: 0 })
    }, undefined, function (error) {
        console.error('An error happened with planet loading:', error)
    })
}

createStars(100, 2000)

function createStars(amount, universeSize) {
    const geometry = new THREE.SphereGeometry(3, 6, 6) // Small sphere for stars
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

    for (let i = 0; i < amount; i++) {
        // Position stars randomly within a cube, you can tweak as needed for different distributions
        const x = (Math.random() - 0.5) * universeSize
        const y = (Math.random() - 0.5) * universeSize
        const z = (Math.random() - 0.5) * universeSize

        // Create a mesh for the star
        const star = new THREE.Mesh(geometry, material)
        star.position.set(x, y, z)

        // Add a point light for star glow
        const light = new THREE.PointLight(0xffffff, 1, 100)
        light.position.set(x, y, z)

        // Add star mesh and light to the scene
        scene.add(star)
        scene.add(light)
    }
}

camera.position.set(0.08343285914438951, 335.3059565045275, 8.361134584523754)
camera.lookAt(new THREE.Vector3(0, 0, 0))

// Assuming you have a loaded ship object and a camera already created
let cameraOffset = new THREE.Vector3(0, 2, -5); // Adjust the offset as needed
let cameraRotationSpeed = 0.04; // Adjust the rotation speed as needed
let cameraYaw = 0;
let cameraDirection = new THREE.Vector3();

// Function to update camera position based on the ship's position and orientation
function updateCamera() {
    if (ship) { // Assuming 'ship' is your loaded ship ship
        // Apply ship's rotation to the offset
        let offset = cameraOffset.clone().applyQuaternion(ship.quaternion);
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

function start() {
    // Update the ship's position
    const overlay = document.getElementById("overlay");
    overlay.remove();
    ship.position.set(0, 0, 0);
    cameraFollow = true;
}

// Function to update object position based on key presses
function update() {
    // Move forward when 'W' key is pressed
    if (keyboard['w']) {
        // Calculate the direction of movement based on the object's rotation
        let velocity = new THREE.Vector3(movementSpeed * cameraDirection.x, 0, movementSpeed * cameraDirection.z);
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
        let velocity = new THREE.Vector3(movementSpeed * -cameraDirection.x, 0, movementSpeed * -cameraDirection.z);
        // Update the ship's position
        ship.position.add(velocity);
    }

    if (keyboard['d']) {
        // Calculate the direction of movement based on the object's rotation
        cameraYaw -= cameraRotationSpeed
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
        planet.angle += planet.speed
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance
        planet.mesh.rotation.y += 0.01

        // // Update wireframe position and rotation to match the planet
        // planet.wireframe.position.copy(planet.mesh.position)
        // planet.wireframe.rotation.copy(planet.mesh.rotation)
    })
    if (cameraFollow) {
        updateCamera();
    }
    renderer.render(scene, camera);
}

animate();