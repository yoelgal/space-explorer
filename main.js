import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Global variables
let ship, cameraFollow = false, sun
let sunLoaded = false
let shipLoaded = false
let planetsLoaded = 0  // This counts loaded planets
const totalPlanets = 8 // Total number of planets to be loaded
let currentScene = scene;

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
const audio = new Audio('interstellar.mp3') // Replace 'path_to_your_audio_file.mp3' with the actual path to your audio file
audio.loop = true // Set the audio to loop

// Get the music button element
const musicButton = document.getElementById('musicButton')

// Add event listener to the music button
musicButton.addEventListener('click', function() {
    toggleAudio(audio, musicButton)
})

const scene = new THREE.Scene();
const earthScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader()
const planets = []

const speedScale = 1.5

const planetInfo = [
    {
        name: 'Mercury',
        distance: 105,
        positionY: 0,
        speed: 0.02 * speedScale,
        scale: [10, 10, 10],
        proximityRadius: 20,
    },
    {
        name: 'Venus',
        distance: 200,
        positionY: -10,
        speed: 0.015 * speedScale,
        scale: [0.1, 0.1, 0.1],
        proximityRadius: 30,
    },
    {
        name: 'Earth',
        distance: 270,
        positionY: -10,
        speed: 0.01 * speedScale,
        scale: [0.03, 0.03, 0.03],
        proximityRadius: 30,
    },
    { name: 'Mars', distance: 350, positionY: 0, speed: 0.007 * speedScale, scale: [60, 60, 60], proximityRadius: 30 },
    {
        name: 'Jupiter',
        distance: 430,
        positionY: -10,
        speed: 0.004 * speedScale,
        scale: [0.1, 0.1, 0.1],
        proximityRadius: 30,
    },
    {
        name: 'Saturn',
        distance: 560,
        positionY: 0,
        speed: 0.003 * speedScale,
        scale: [50, 50, 50],
        proximityRadius: 80,
    },
    {
        name: 'Uranus',
        distance: 690,
        positionY: 0,
        speed: 0.002 * speedScale,
        scale: [50, 50, 50],
        proximityRadius: 50,
    },
    {
        name: 'Neptune',
        distance: 820,
        positionY: 0,
        speed: 0.0015 * speedScale,
        scale: [25, 25, 25],
        proximityRadius: 50,
    },
]

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1) // Soft white light
scene.add(ambientLight)

// Load the Sun
loader.load('Sun.glb', (gltf) => {
    const sun = gltf.scene
    sun.scale.set(50, 50, 50) // Adjust scale for visibility
    sun.position.set(0, 0, 0)
    scene.add(sun)
    sunLoaded = true
    checkAllAssetsLoaded()

    // Add a point light to simulate the sun's light
    const sunLight = new THREE.PointLight(0xffffff, 5, 0) // Adjust the intensity and distance as needed
    sunLight.position.copy(sun.position)
    scene.add(sunLight)
});






// Load the Ship
loader.load('Flying saucer.glb', (gltf) => {
    ship = gltf.scene
    ship.scale.set(0.5, 0.5, 0.5) // Adjust scale for visibility
    ship.position.set(9999, 9999, 9999)
    scene.add(ship)
    shipLoaded = true
    checkAllAssetsLoaded()

})

document.addEventListener('DOMContentLoaded', function() {
    var startButton = document.getElementById('startButton')

    startButton.addEventListener('click', function() {
        start()
    })
})


// Create a variable to store the movement speed
let movementSpeed = 1

// Create a variable to store the keyboard state
let keyboard = {}

// Event listener to track key presses
document.addEventListener('keydown', function(event) {
    keyboard[event.key] = true
})

document.addEventListener('keyup', function(event) {
    keyboard[event.key] = false
})

planetInfo.forEach(planet => {
    loadPlanet(`${planet.name}.glb`, planet.positionY, planet.scale, planet.distance, planet.speed, planet.proximityRadius, planet.name)
})

function loadPlanet(modelPath, positionY, scale, distance, speed, proximityRadius, name) {
    loader.load(modelPath, (gltf) => {
        const planetMesh = gltf.scene
        planetMesh.scale.set(...scale)
        planetMesh.position.set(distance, positionY, 0)
        scene.add(planetMesh)


        planets.push({
            name: name,
            mesh: planetMesh,
            speed: speed,
            distance: distance,
            angle: 0,
            proximityRadius: proximityRadius,
        })

        planetsLoaded++
        checkAllAssetsLoaded()
    }, undefined, function(error) {
        console.error('Error loading planet:', modelPath, error)
    })
}

function checkAllAssetsLoaded() {
    if (shipLoaded && sunLoaded && planetsLoaded === totalPlanets) {
        startSimulation()  // Start simulation when all assets are loaded
    }
}

function startSimulation() {
    update()  // Start the update function loop
    animate() // Start the animation loop
}

function bounceBack(celestialBodyPosition) {
    let approachVector = new THREE.Vector3().subVectors(ship.position, celestialBodyPosition)
    approachVector.y = 0  // Ignore the y component for the bounce calculation
    let normal = approachVector.normalize()
    let incoming = new THREE.Vector3(movementSpeed * cameraDirection.x, 0, movementSpeed * cameraDirection.z)
    let dotProduct = incoming.dot(normal)
    let reflection = new THREE.Vector3().subVectors(incoming, normal.multiplyScalar(2 * dotProduct))

    // Apply the reflection vector to the ship's position to simulate a bounce
    // Only modify the x and z components of the ship's position
    ship.position.add(new THREE.Vector3(reflection.x, 0, reflection.z).multiplyScalar(2))  // Adjust the multiplier based on desired bounce effect
}


function checkProximity() {
    const shipPosition = ship.position
    const sunPosition = new THREE.Vector3(0, 0, 0)

    // Check proximity to the sun
    const distanceToSun = shipPosition.distanceTo(sunPosition)
    const proximityThresholdSun = 100 // Example proximity radius for the sun
    if (distanceToSun < proximityThresholdSun) {
        console.log('Warning: Close proximity to the Sun!')
        bounceBack(sunPosition)
    }


    // Check proximity to each planet
    planets.forEach(planet => {
        const distance = shipPosition.distanceTo(planet.mesh.position)
        if (distance < planet.proximityRadius) {
            console.log(`Warning: Close proximity to ${planet.name}!`)
            bounceBack(planet.mesh.position)
        }
    })
}


createStars(150, 1000)

function createStars(amount, universeSize) {
    const geometry = new THREE.SphereGeometry(3, 6, 6)  // Small sphere for stars
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const innerRadius = 800  // Inner radius of the star field

    for (let i = 0; i < amount; i++) {
        // Randomize star position within a spherical shell defined by innerRadius and outerRadius
        const radius = Math.random() * (universeSize - innerRadius) + innerRadius
        const theta = Math.random() * Math.PI * 2  // Azimuthal angle, from 0 to 2π
        const phi = Math.acos(2 * Math.random() - 1)  // Polar angle, from 0 to π

        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        // Create a mesh for the star
        const star = new THREE.Mesh(geometry, material)
        star.position.set(x, y, z)

        // Add the star mesh to the scene
        scene.add(star)
    }
}


camera.position.set(0.08343285914438951, 335.3059565045275, 8.361134584523754)
camera.lookAt(new THREE.Vector3(0, 0, 0))

// Assuming you have a loaded ship object and a camera already created
let cameraOffset = new THREE.Vector3(0, 2, -5) // Adjust the offset as needed
let cameraRotationSpeed = 0.02 // Adjust the rotation speed as needed
let cameraYaw = 0
let cameraDirection = new THREE.Vector3()



// SCENE TWO //
// Scene 2 sun test

let earthShip;
let earthShipSpeed = 5;

loader.load('Spaceship.glb', (gltf) => {
    earthShip = gltf.scene;
    earthShip.scale.set(0.1, 0.1, 0.1); // Adjust scale for visibility
    earthShip.position.set(0, 0, 180);
    earthShip.rotation.set(0, 3.14, 0)
    earthScene.add(earthShip);
});

const earthAmbientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
earthScene.add(earthAmbientLight);

let canFire = true;
let canEnemy = true;

var bulletArray = [];

function createBullet(position) {
    let bullet;
    loader.load('Spaceship.glb', (gltf) => {
        bullet = gltf.scene;
        bullet.scale.set(0.1, 0.1, 0.1); // Adjust scale for visibility
        position.z -= 10;
        bullet.position.set(position.x, position.y, position.z);
        bullet.rotation.set(0, 3.14, 0);

        earthScene.add(bullet);
        bulletArray.push(bullet)
    });
}

var enemyArray = [];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createEnemy() {
    let enemy;
    loader.load('Spaceship.glb', (gltf) => {
        enemy = gltf.scene;
        enemy.scale.set(0.1, 0.1, 0.1); // Adjust scale for visibility
        enemy.position.set(getRandomInt(-300, 300), 0, -300);

        earthScene.add(enemy);
        enemyArray.push(enemy)
    });
}

// Function to update camera position based on the ship's position and orientation
function updateCamera() {
    if (ship) { // Assuming 'ship' is your loaded ship ship
        // Apply ship's rotation to the offset
        let offset = cameraOffset.clone().applyQuaternion(ship.quaternion)
        // Set camera's position relative to the ship's position
        camera.position.copy(ship.position).add(offset)
        // Rotate the camera around the ship
        camera.position.sub(ship.position)
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw)
        camera.position.add(ship.position)
        // Make the camera look at the ship's position
        camera.lookAt(ship.position)

        camera.getWorldDirection(cameraDirection)
    }
}

function start() {
    const overlay = document.getElementById('overlay')
    if (overlay) {
        overlay.remove()
    }
    ship.position.set(0, 0, -600)
    cameraFollow = true
}


// Function to update object position based on key presses
function update() {
    if (!shipLoaded || !sunLoaded || planetsLoaded !== totalPlanets) {
        requestAnimationFrame(update)
        return  // Stop here and wait until all assets are loaded
    }

    // Move forward when 'W' key is pressed
    if (currentScene === scene) {
        if (keyboard['w']) {
            // Calculate the direction of movement based on the object's rotation
            let velocity = new THREE.Vector3(movementSpeed * cameraDirection.x, 0, movementSpeed * cameraDirection.z);
            // Update the ship's position
            ship.position.add(velocity);
        }

        if (keyboard['a']) {
            // Calculate the direction of movement based on the object's rotation
            cameraYaw += cameraRotationSpeed
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

    checkProximity()
        if (keyboard['m']) {
            // Calculate the direction of movement based on the object's rotation
            camera.position.set(0, 300, 0)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            cameraFollow = false;
            currentScene = earthScene;
        }
    }

    else if (currentScene == earthScene) {

        if (canEnemy) {
            createEnemy();
            canEnemy = false;
            setTimeout(function () {
                canEnemy = true; // Reset flag after cooldown period
            }, getRandomInt(3000, 5000));
        }

        if (keyboard['a']) {
            // Calculate the direction of movement based on the object's rotation
            let earthVelocity = new THREE.Vector3(-earthShipSpeed, 0, 0);
            // Update the earthShip's position
            earthShip.position.add(earthVelocity);
        }

        if (keyboard['d']) {
            // Calculate the direction of movement based on the object's rotation
            let earthVelocity = new THREE.Vector3(earthShipSpeed, 0, 0);
            // Update the earthShip's position
            earthShip.position.add(earthVelocity);
        }

        if (keyboard[' '] && canFire) {
            // Calculate the direction of movement based on the object's rotation
            createBullet(earthShip.position.clone())
            canFire = false;
            setTimeout(function () {
                canFire = true; // Reset flag after cooldown period
            }, 1000);
        };

        if (keyboard['n']) {
            // Calculate the direction of movement based on the object's rotation
            cameraFollow = true;
            currentScene = scene;
        }
    }


    // You can add similar checks for other keys like 'A', 'S', 'D' for movement in other directions

    requestAnimationFrame(update)
}


// Call the update function to start listening for key presses
update()

// Update planets in their orbits
function animate() {
    requestAnimationFrame(animate)
    planets.forEach(planet => {
        planet.mesh.rotation.y += 0.01
    })


    if (cameraFollow) {
        updateCamera()
    } else {
        planets.forEach(planet => {
            planet.angle += planet.speed
            planet.mesh.position.x = Math.cos(planet.angle) * planet.distance
            planet.mesh.position.z = Math.sin(planet.angle) * planet.distance

        // // Update wireframe position and rotation to match the planet
        // planet.wireframe.position.copy(planet.mesh.position)
        // planet.wireframe.rotation.copy(planet.mesh.rotation)
    })

    bulletArray.forEach(function (bullet, index, bulletArray) {
        bullet.position.z -= 5;
        if (bullet.position.z <= -500) {
            earthScene.remove(bullet);
            bulletArray.splice(index, 1);
        }
    })

    enemyArray.forEach(function (enemy, index, enemyArray) {
        enemy.position.z += 5;
        if (enemy.position.z >= 300) {
            earthScene.remove(enemy);
            enemyArray.splice(index, 1);
            cameraFollow = true;
            currentScene = scene;
        }
        bulletArray.forEach(function (bullet, index2, bulletArray) {
            let bulletBox = new THREE.Box3().setFromObject(bullet);
            let enemyBox = new THREE.Box3().setFromObject(enemy);

            if (bulletBox.intersectsBox(enemyBox)) {
                earthScene.remove(bullet);
                bulletArray.splice(index2, 1);
                earthScene.remove(enemy);
                enemyArray.splice(index, 1);
            }
        })
    })

    if (cameraFollow) {
        updateCamera();
    }

    renderer.render(currentScene, camera);
}
}
animate()