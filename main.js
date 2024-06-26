import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Global variables
let ship, cameraFollow = false, sun
let showingSunInfo = false
let sunLoaded = false
let shipLoaded = false
let planetsLoaded = 0  // This counts loaded planets
const totalPlanets = 8 // Total number of planets to be loaded
let planetsMoving = true


// BLOB
document.addEventListener('mousemove', function(event) {
    let blob = document.getElementById('blob')
    // Update the blob's position to the mouse coordinates
    blob.style.left = event.pageX + 'px'
    blob.style.top = event.pageY + 'px'
})

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

// SCENE
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


const loader = new GLTFLoader()
const planets = []

const speedScale = 0.6

const planetInfo = [
    {
        name: 'Mercury',
        distance: 150,
        positionY: 5,
        speed: 0.02 * speedScale,
        scale: [10, 10, 10],
        proximityRadius: 20,
        showingInfo: false,
        action: function() {
        },
    },
    {
        name: 'Venus',
        distance: 230,
        positionY: 0,
        speed: 0.015 * speedScale,
        scale: [15, 15, 15],
        proximityRadius: 30,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },

    },
    {
        name: 'Earth',
        distance: 300,
        positionY: -10,
        speed: 0.01 * speedScale,
        scale: [0.03, 0.03, 0.03],
        proximityRadius: 30,
        showingInfo: false,
        action: function() {
            // Calculate the direction of movement based on the object's rotation
            console.log('Nothing yet')
        },
    },
    {
        name: 'Mars',
        distance: 380,
        positionY: 0,
        speed: 0.007 * speedScale,
        scale: [60, 60, 60],
        proximityRadius: 30,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },
    },
    {
        name: 'Jupiter',
        distance: 460,
        positionY: -10,
        speed: 0.004 * speedScale,
        scale: [0.1, 0.1, 0.1],
        proximityRadius: 30,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },
    },
    {
        name: 'Saturn',
        distance: 590,
        positionY: 0,
        speed: 0.003 * speedScale,
        scale: [50, 50, 50],
        proximityRadius: 80,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },
    },
    {
        name: 'Uranus',
        distance: 720,
        positionY: 0,
        speed: 0.002 * speedScale,
        scale: [50, 50, 50],
        proximityRadius: 50,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },
    },
    {
        name: 'Neptune',
        distance: 850,
        positionY: 0,
        speed: 0.0015 * speedScale,
        scale: [25, 25, 25],
        proximityRadius: 50,
        showingInfo: false,
        action: function() {
            console.log('Nothing yet')
        },
    },
]

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1) // Soft white light
scene.add(ambientLight)

// Load the Sun
loader.load('Sun.glb', (gltf) => {
    sun = gltf.scene
    sun.scale.set(40, 40, 40) // Adjust scale for visibility
    sun.position.set(0, 0, 0)
    scene.add(sun)
    sunLoaded = true
    checkAllAssetsLoaded()
})


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
    let startButton = document.getElementById('startButton')

    startButton.addEventListener('click', function() {
        start()
    })

})


// Create a variable to store the movement speed
let movementSpeed = 0.7

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
    loadPlanet(`${planet.name}.glb`, planet.positionY, planet.scale, planet.distance, planet.speed, planet.proximityRadius, planet.name, planet.action)
})

function loadPlanet(modelPath, positionY, scale, distance, speed, proximityRadius, name, action) {
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
            action: action,
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

function showInfoCard(entity) {
    if (!entity) {
        document.getElementById('SunCard').style.display = 'block'
        showingSunInfo = true
        console.log('Info being shown for Sun')
    } else {
        const card = document.getElementById(`${entity.name}Card`)
        if (card) {
            card.style.display = 'block'
        }
        console.log(entity)  // Debugging output
        console.log(entity.action)  // Check if action is a function
        if (typeof entity.action === 'function') {
            const enterKeyListener = function(event) {
                if (event.key === 'Enter') {
                    entity.action()
                }
            }
            document.addEventListener('keydown', enterKeyListener)
            entity.showingInfo = true
            entity.enterKeyListener = enterKeyListener // Store the listener function in the entity object
            console.log(`Info being shown for ${entity.name}`)
        } else {
            console.log(`No action defined for ${entity.name}`)  // This will clarify the missing action
        }
    }
}

function hideInfoCard(entity) {
    if (!entity) {
        const card = document.getElementById('SunCard')
        if (card) {
            card.style.display = 'none'
        }
        showingSunInfo = false
        console.log('Info being hidden for Sun')
    } else {
        const card = document.getElementById(`${entity.name}Card`)
        if (card) {
            card.style.display = 'none'
        }
        if (entity.showingInfo && typeof entity.enterKeyListener === 'function') {
            document.removeEventListener('keydown', entity.enterKeyListener)
            entity.showingInfo = false
        }
        console.log(`Info being hidden for ${entity.name}`)
    }
}


function checkProximity() {
    const shipPosition = ship.position
    const sunPosition = new THREE.Vector3(0, 0, 0)
    const distanceToSun = shipPosition.distanceTo(sunPosition)
    const proximityThresholdSun = 80

    // Toggle visibility based on proximity for the sun
    if (distanceToSun < proximityThresholdSun + 15) {
        if (!showingSunInfo) { // Check if info is not already being shown
            showInfoCard(null)
            showingSunInfo = true
        }
    } else {
        if (showingSunInfo) { // Check if info is currently shown
            hideInfoCard(null)
            showingSunInfo = false
        }
    }
    if (distanceToSun < proximityThresholdSun) {
        console.log('Warning: Close proximity to the Sun!')
        bounceBack(sunPosition)
    }

    // Toggle visibility based on proximity for each planet
    planets.forEach(planet => {
        const distance = shipPosition.distanceTo(planet.mesh.position)
        if (distance < planet.proximityRadius + 15) {
            if (!planet.showingInfo) { // Check if info is not already being shown
                showInfoCard(planet)
                planetsMoving = false
                planet.showingInfo = true
            }
        } else {
            if (planet.showingInfo) { // Check if info is currently shown
                hideInfoCard(planet)
                planetsMoving = true
                planet.showingInfo = false
            }
        }
        if (distance < planet.proximityRadius) {
            console.log(`Warning: Close proximity to ${planet.name}!`)
            bounceBack(planet.mesh.position)
        }
    })
}


createStars(200, 1400)

function createStars(amount, universeSize) {
    const geometry = new THREE.SphereGeometry(3, 6, 6)  // Small sphere for stars
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const innerRadius = 1200  // Inner radius of the star field

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
let cameraRotationSpeed = 0.015 // Adjust the rotation speed as needed
let cameraYaw = 0
let cameraDirection = new THREE.Vector3()


// Function to update camera position based on the ship's position and orientation
function updateCamera() {

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

function start() {
    const overlay = document.getElementById('overlay')
    if (overlay) {
        overlay.remove()
    }

    ship.position.set(0, 10, -600)
    cameraFollow = true
}

let titleChangeable = true

function updateTitle() {
    let title = document.title
    if (titleChangeable) {
        let lastChars = title.substring(title.length - 2, title.length)

        document.title = lastChars + title.slice(0, -2)

        titleChangeable = false
        setTimeout(() => titleChangeable = true, 750)
    }

}


// Function to update object position based on key presses
function update() {
    if (!shipLoaded || !sunLoaded || planetsLoaded !== totalPlanets) {
        requestAnimationFrame(update)
        return  // Stop here and wait until all assets are loaded
    }

    // Move forward when 'W' key is pressed

    if (keyboard['w']) {
        updateTitle()
        // Calculate the direction of movement based on the object's rotation
        let velocity = new THREE.Vector3(movementSpeed * cameraDirection.x, 0, movementSpeed * cameraDirection.z)
        // Update the ship's position
        ship.position.add(velocity)
    }

    if (keyboard['a']) {
        // Calculate the direction of movement based on the object's rotation
        cameraYaw += cameraRotationSpeed
    }

    if (keyboard['s']) {
        // Calculate the direction of movement based on the object's rotation
        let velocity = new THREE.Vector3(movementSpeed * -cameraDirection.x, 0, movementSpeed * -cameraDirection.z)
        // Update the ship's position
        ship.position.add(velocity)
    }

    if (keyboard['d']) {
        // Calculate the direction of movement based on the object's rotation
        cameraYaw -= cameraRotationSpeed
    }


    checkProximity()


    // You can add similar checks for other keys like 'A', 'S', 'D' for movement in other directions

    requestAnimationFrame(update)
}


// Call the update function to start listening for key presses
update()

let bobbingAngle = 0  // Initial angle for the sine function
const bobbingSpeed = 0.02  // Speed of the bobbing motion
const bobbingAmount = 2  // Amount of vertical movement


// Update planets in their orbits
function animate() {
    requestAnimationFrame(animate)
    planets.forEach(planet => {

        planet.mesh.rotation.y += 0.005


        if (planetsMoving) {
            // Increment the angle if the camera follows the ship, change the increment rate
            if (cameraFollow) {
                planet.angle += planet.speed / 4 // slower or different rate when following the camera
            } else {
                planet.angle += planet.speed // normal rate when not following
            }

            // Update position based on the new angle
            planet.mesh.position.x = Math.cos(planet.angle) * planet.distance
            planet.mesh.position.z = Math.sin(planet.angle) * planet.distance
        }


    })
    sun.rotation.y -= 0.002
    if (cameraFollow) {
        updateCamera()
        bobbingAngle += bobbingSpeed
        ship.position.y = 10 + Math.sin(bobbingAngle) * bobbingAmount
    }


    renderer.render(scene, camera)
}


animate()