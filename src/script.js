import './css/style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import mainVertexShader from './shaders/vertex.glsl'
import portalGreenShader from './shaders/Portal-Green/fragment.glsl'
import artShader from './shaders/Art/fragment.glsl'
import matrixShader from './shaders/Matrix/fragment.glsl'
import windowTerminalShader from './shaders/Window-Terminal/fragment.glsl'


/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Portal material
 */
const portalMainMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        iTime: { value: 0 },
        iResolution:  { value: new THREE.Vector3(window.innerWidth, window.innerHeight , 1) },
        // iChannel0: { value: texture },
    },
    vertexShader: mainVertexShader,
    fragmentShader: matrixShader
}) 

const portalTopMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        iTime: { value: 0 },
        iResolution:  { value: new THREE.Vector3(window.innerWidth, window.innerHeight , 1) },
        // iChannel0: { value: texture },
    },
    vertexShader: mainVertexShader,
    fragmentShader: artShader
}) 


/**
 * Model
 */
let mixer = null
gltfLoader.load(
    'models/Japan-Shrine/untitled1.glb',
    (gltf) =>{
        scene.add(gltf.scene)
        mixer = new THREE.AnimationMixer(gltf.scene)

        const action = mixer.clipAction(gltf.animations[0])
        const portalMainMesh = gltf.scene.children.find((child) => child.name === 'Portal')
        const portalTopMainMesh = gltf.scene.children.find((child) => child.name === 'Portal-Top')

        portalMainMesh.material = portalMainMaterial
        portalTopMainMesh.material = portalTopMaterial

        action.play()
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -2.7
camera.position.y = 2.2
camera.position.z = 2.4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.maxDistance =5

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //Update time
    portalTopMaterial.uniforms.iTime.value = elapsedTime
    portalMainMaterial.uniforms.iTime.value = elapsedTime
    // portalTopMaterial.uniforms.iResolution.value.set(sizes.width, sizes.height, 1)

    // Update Mixer
    if(mixer !== null){
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()