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
let currentScene = scene
const earthScene = new THREE.Scene()
const sunScene = new THREE.Scene()
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
            camera.position.set(0, 300, 0)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            cameraFollow = false
            currentScene = earthScene
            document.getElementById('EarthCard').style.display = 'none'
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
            document.getElementById('MarsCard').style.display = 'none'
            // document.getElementById('blob').style.display = 'none'
            document.getElementById('Booking').style.display = 'block'

            const exitButton = document.getElementById('exit-button')
            exitButton.addEventListener('click', function() {
                document.getElementById('Booking').style.display = 'none'
                document.getElementById('MarsCard').style.display = 'block'
            })

            document.getElementById('booking-form').addEventListener('submit', function(event) {
                event.preventDefault()

                const name = document.getElementById('name').value
                const date = document.getElementById('date').value
                const cabin = document.getElementById('cabin').value
                const tickets = document.getElementById('tickets').value
                const confirmation = document.getElementById('confirmation')

                if (!name || !date || !tickets) {
                    confirmation.innerHTML = `<p>Please fill all fields correctly.</p>`
                    return
                }

                confirmation.innerHTML = `<p>Thank you, ${name}. You have booked ${tickets} ${cabin} class tickets to Mars on ${date}.</p>`
            })
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
            camera.position.set(0, 300, 0)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            cameraFollow = false
            currentScene = sunScene
            document.getElementById('JupiterCard').style.display = 'none'
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7) // Soft white light
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
    ship.velocity = new THREE.Vector3(0, 0, 0) // Initialize velocity
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


// SCENE TWO //
// Scene 2 sun test

let earthShip
let earthShipSpeed = 5

loader.load('Spaceship.glb', (gltf) => {
    earthShip = gltf.scene
    earthShip.scale.set(0.1, 0.1, 0.1) // Adjust scale for visibility
    earthShip.position.set(0, 0, 180)
    earthShip.rotation.set(0, 3.14, 0)
    earthScene.add(earthShip)
})

const earthAmbientLight = new THREE.AmbientLight(0xffffff, 1) // Soft white light
earthScene.add(earthAmbientLight)

let canFire = true
let canEnemy = true

let bulletArray = []

function createBullet(position) {
    let bullet
    loader.load('Spaceship.glb', (gltf) => {
        bullet = gltf.scene
        bullet.scale.set(0.1, 0.1, 0.1) // Adjust scale for visibility
        position.z -= 10
        bullet.position.set(position.x, position.y, position.z)
        bullet.rotation.set(0, 3.14, 0)

        earthScene.add(bullet)
        bulletArray.push(bullet)
    })
}

let enemyArray = []

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function createEnemy() {
    let enemy
    loader.load('Spaceship.glb', (gltf) => {
        enemy = gltf.scene
        enemy.scale.set(0.1, 0.1, 0.1) // Adjust scale for visibility
        enemy.position.set(getRandomInt(-300, 300), 0, -300)

        earthScene.add(enemy)
        enemyArray.push(enemy)
    })
}

// Scene 3 start

const sunAmbientLight = new THREE.AmbientLight(0xffffff, 1) // Soft white light
sunScene.add(sunAmbientLight)

let orderedPlanets = []
let shuffledPlanets = []

let planetsShuffled = false

let planetsPointer = 0

loader.load('Sun.glb', (gltf) => {
    let tempSun = gltf.scene
    tempSun.scale.set(20, 20, 20) // Adjust scale for visibility
    tempSun.position.set(0, 0, 0)
    orderedPlanets.push([tempSun, 0])
    sunScene.add(tempSun)
})

loader.load('Mercury.glb', (gltf) => {
    let mercury = gltf.scene
    mercury.scale.set(40, 40, 40) // Adjust scale for visibility
    mercury.position.set(0, 0, 0)
    orderedPlanets.push([mercury, 1])
    sunScene.add(mercury)
})

loader.load('Venus.glb', (gltf) => {
    let venus = gltf.scene
    venus.scale.set(35, 35, 35) // Adjust scale for visibility
    venus.position.set(0, 0, 0)
    orderedPlanets.push([venus, 2])
    sunScene.add(venus)
})

loader.load('Earth.glb', (gltf) => {
    let earth = gltf.scene
    earth.scale.set(0.06, 0.06, 0.06) // Adjust scale for visibility
    earth.position.set(0, 0, 0)
    orderedPlanets.push([earth, 3])
    sunScene.add(earth)
})

loader.load('Mars.glb', (gltf) => {
    let mars = gltf.scene
    mars.scale.set(175, 175, 175) // Adjust scale for visibility
    mars.position.set(0, 0, 0)
    orderedPlanets.push([mars, 4])
    sunScene.add(mars)
})

loader.load('Jupiter.glb', (gltf) => {
    let jupiter = gltf.scene
    jupiter.scale.set(0.2, 0.2, 0.2) // Adjust scale for visibility
    jupiter.position.set(0, 0, 0)
    orderedPlanets.push([jupiter, 5])
    sunScene.add(jupiter)
})

loader.load('Saturn.glb', (gltf) => {
    let saturn = gltf.scene
    saturn.scale.set(35, 35, 35) // Adjust scale for visibility
    saturn.position.set(0, 0, 0)
    orderedPlanets.push([saturn, 6])
    sunScene.add(saturn)
})

loader.load('Uranus.glb', (gltf) => {
    let uranus = gltf.scene
    uranus.scale.set(90, 90, 90) // Adjust scale for visibility
    uranus.position.set(0, 0, 0)
    orderedPlanets.push([uranus, 7])
    sunScene.add(uranus)
})

loader.load('Neptune.glb', (gltf) => {
    let neptune = gltf.scene
    neptune.scale.set(35, 35, 35) // Adjust scale for visibility
    neptune.position.set(0, 0, 0)
    orderedPlanets.push([neptune, 8])
    sunScene.add(neptune)
})

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

let zPressed = false
let xPressed = false

function listsSame() {
    // Iterate over each element in the lists
    for (let i = 0; i < shuffledPlanets.length; i++) {
        if (shuffledPlanets[i][1] !== i)
            return false
    }
    return true
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
        if (keyboard['m']) {
            // Calculate the direction of movement based on the object's rotation
            camera.position.set(0, 300, 0)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            cameraFollow = false
            currentScene = sunScene
        }
    } else if (currentScene === earthScene) {

        if (canEnemy) {
            createEnemy()
            canEnemy = false
            setTimeout(function() {
                canEnemy = true // Reset flag after cooldown period
            }, getRandomInt(3000, 5000))
        }

        if (keyboard['a']) {
            // Calculate the direction of movement based on the object's rotation
            let earthVelocity = new THREE.Vector3(-earthShipSpeed, 0, 0)
            // Update the earthShip's position
            earthShip.position.add(earthVelocity)
        }

        if (keyboard['d']) {
            // Calculate the direction of movement based on the object's rotation
            let earthVelocity = new THREE.Vector3(earthShipSpeed, 0, 0)
            // Update the earthShip's position
            earthShip.position.add(earthVelocity)
        }

        if (keyboard[' '] && canFire) {
            // Calculate the direction of movement based on the object's rotation
            createBullet(earthShip.position.clone())
            canFire = false
            setTimeout(function() {
                canFire = true // Reset flag after cooldown period
            }, 1000)
        }


        if (keyboard['n']) {
            // Calculate the direction of movement based on the object's rotation
            cameraFollow = true
            currentScene = scene
        }

    } else if (currentScene === sunScene) {
        if (keyboard['n']) {
            // Calculate the direction of movement based on the object's rotation
            cameraFollow = true
            currentScene = scene
        }

        if (keyboard['b']) {
            // Calculate the direction of movement based on the object's rotation
            shuffledPlanets.sort(function(a, b) {
                // Compare the values at index 1 of each element
                return a[1] - b[1] // Ascending order
            })
        }

        if (keyboard['z'] && !zPressed) {
            zPressed = true
            let temp = shuffledPlanets[planetsPointer]
            shuffledPlanets[planetsPointer] = shuffledPlanets[planetsPointer + 1]
            shuffledPlanets[planetsPointer + 1] = temp
            planetsPointer += 1
            if (planetsPointer > 7)
                planetsPointer = 0
        } else if (!keyboard['z']) {
            zPressed = false
        }
        if (keyboard['x'] && !xPressed) {
            xPressed = true
            planetsPointer += 1
            if (planetsPointer > 7) {
                planetsPointer = 0
                if (listsSame())
                    console.log('yeaaaah')
            }

        } else if (!keyboard['x']) {
            xPressed = false
        }
    }


    // You can add similar checks for other keys like 'A', 'S', 'D' for movement in other directions

    requestAnimationFrame(update)
}


// Call the update function to start listening for key presses
update()

let bobbingAngle = 0  // Initial angle for the sine function
const bobbingSpeed = 0.02  // Speed of the bobbing motion
const bobbingAmount = 2  // Amount of vertical movement

function handleEarthSceneInteractions() {
    if (currentScene === earthScene) {
        bulletArray.forEach(function(bullet, index, bulletArray) {
            bullet.position.z -= 5
            if (bullet.position.z <= -500) {
                earthScene.remove(bullet)
                bulletArray.splice(index, 1)
            }
        })

        enemyArray.forEach(function(enemy, index, enemyArray) {
            enemy.position.z += 5
            if (enemy.position.z >= 300) {
                earthScene.remove(enemy)
                enemyArray.splice(index, 1)
                cameraFollow = true
                currentScene = scene
            }
            bulletArray.forEach(function(bullet, index2, bulletArray) {
                let bulletBox = new THREE.Box3().setFromObject(bullet)
                let enemyBox = new THREE.Box3().setFromObject(enemy)

                if (bulletBox.intersectsBox(enemyBox)) {
                    earthScene.remove(bullet)
                    bulletArray.splice(index2, 1)
                    earthScene.remove(enemy)
                    enemyArray.splice(index, 1)
                }
            })
        })
    }
}

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

    handleEarthSceneInteractions()
    if (currentScene === sunScene) {
        if (!planetsShuffled) {
            orderedPlanets.sort(function(a, b) {
                // Compare the values at index 1 of each element
                return a[1] - b[1] // Ascending order
            })
            let tempLength = orderedPlanets.length
            for (let i = 0; i < tempLength; i++) {
                let j = getRandomInt(0, orderedPlanets.length - 1)
                shuffledPlanets.push(orderedPlanets[j])
                orderedPlanets.splice(j, 1)
            }
            planetsShuffled = true
        }
        shuffledPlanets.forEach(function(planet, index, shuffledPlanets) {
            planet[0].position.set(((index - 4) * 85), 0, 0)
        })
    }


    renderer.render(currentScene, camera)
}


animate()