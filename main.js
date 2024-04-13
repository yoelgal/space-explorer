import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.setClearColor(0xffffff) // Set background color to white
document.body.appendChild(renderer.domElement)

const loader = new GLTFLoader()
const planets = []

const planetInfo = [
    { name: 'Mercury', distance: 75, speed: 0.02, scale: [10, 10, 10] },
    { name: 'Venus', distance: 110, speed: 0.015, scale: [0.1, 0.1, 0.1] },
    { name: 'Earth', distance: 150, speed: 0.01, scale: [0.03, 0.03, 0.03] },
    { name: 'Mars', distance: 200, speed: 0.007, scale: [60, 60, 60] },
    { name: 'Jupiter', distance: 250, speed: 0.004, scale: [0.1, 0.1, 0.1] },
    { name: 'Saturn', distance: 350, speed: 0.003, scale: [50, 50, 50] },
    { name: 'Uranus', distance: 450, speed: 0.002, scale: [50, 50, 50] },
    { name: 'Neptune', distance: 550, speed: 0.0015, scale: [25, 25, 25] },
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

    // Add a point light to simulate the sun's light
    const sunLight = new THREE.PointLight(0xffffff, 5, 0) // Adjust the intensity and distance as needed
    sunLight.position.copy(sun.position)
    scene.add(sunLight)
})


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
    }, undefined, function(error) {
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
// Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.target.set(0, 0, 0)
// controls.update()
/*
x:0.08343285914438951
y:335.3059565045275
z:8.361134584523754
*/

// Update planets in their orbits
function animate() {
    requestAnimationFrame(animate)
    planets.forEach(planet => {
        planet.angle += planet.speed
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance
        planet.mesh.rotation.y += 0.01

        // // Update wireframe position and rotation to match the planet
        // planet.wireframe.position.copy(planet.mesh.position)
        // planet.wireframe.rotation.copy(planet.mesh.rotation)
    })
    renderer.render(scene, camera)
}

animate()
