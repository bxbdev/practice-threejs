import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import nebula from '../images/nebula.jpg'
import stars from '../images/stars.jpg'

const renderer = new THREE.WebGLRenderer();
// allow the object to show the shadow effect, default is false
renderer.shadowMap.enabled = true

renderer.setSize( window.innerWidth, window.innerHeight)
document.body.appendChild( renderer.domElement )

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000)

// control scene with mouse click and drag, mouse wheel to zoom in and out of the scene
const orbit = new OrbitControls(camera, renderer.domElement)

// AxesHelper is a helper for showing x, y, and z axes in the scene
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// Add grid into the scene
const gridHelper = new THREE.GridHelper(30)
scene.add(gridHelper)

// camera.position.z = 5
// camera.position.y = 2
// position.set(x, y, z)
// camera.position.set(0, 2, 5)
camera.position.set(-10, 30, 30)
orbit.update()

// BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
const boxGeometry = new THREE.BoxGeometry()
/*
    MeshBasicMaterial( parameters : Object )
    https://threejs.org/docs/index.html?q=MeshBasicMaterial#api/en/materials/MeshBasicMaterial
*/
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
const box = new THREE.Mesh( boxGeometry, boxMaterial )
scene.add(box)

// PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
const plane = new THREE.Mesh( planeGeometry, planeMaterial )
scene.add( plane )
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true

// SphereGeometry(radius: Float, widthSegments: Integer, heightSegments: Integer, phiStart: Float, phiLength: Float, thetaStart: Float, thetaLength: Float)
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50)
/*
    MeshLambertMaterial( parameters : Object )
    https://threejs.org/docs/index.html?q=Lambert#api/en/materials/MeshLambertMaterial
*/
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF, wireframe: false })
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial )
scene.add( sphere )
sphere.position.set(-10, 10, 0)
sphere.castShadow = true

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add( ambientLight )

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
// scene.add( directionalLight )
// directionalLight.position.set(-30, 50, 0)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.bottom = -12

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add( dLightHelper )

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add( dLightShadowHelper )

const spotLight = new THREE.SpotLight(0xFFFFFF)
scene.add( spotLight )
spotLight.position.set(-100, 100, 0)
spotLight.castShadow = true
spotLight.angle = 0.2

const sLightHelper = new THREE.SpotLightHelper(spotLight, 0.08)
scene.add( sLightHelper )

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200)
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01)

// change the background color of the scene
// renderer.setClearColor(0x4db7ff)

const textureLoader = new THREE.TextureLoader()
// scene.background = textureLoader.load(stars)
const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars
])

const box1Geometry = new THREE.BoxGeometry(4, 4, 4)
const boxMaterial1 = new THREE.MeshStandardMaterial({
    // color: 0x00FF00,
    // map: textureLoader.load(nebula)
})
const box1MultiMaterial = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }), // back
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }), // front
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }), // top
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }), // bottom
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }), // right
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }), // left
]

const box1 = new THREE.Mesh(box1Geometry, box1MultiMaterial)
scene.add(box1)
box1.position.set(0, 15, 10)


// Show GUI options on the screen
const gui = new dat.GUI()
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
}

gui.addColor(options, 'sphereColor').onChange(e => {
    sphere.material.color.set(e)
})

gui.add(options, 'wireframe').onChange( (e) => {
    sphere.material.wireframe = e
})

gui.add(options, 'speed', 0, 0.1)
gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 0, 1)

let step = 0

const mousePosition = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = (e.clientY / window.innerHeight) * 2 + 1
})

const rayCaster = new THREE.Raycaster()
const sphereId = sphere.id
box1.name = "TheBox"

function animate(time) {
    // new version needs to add this code
    box.rotation.x = time / 1000
    box.rotation.y = time / 1000

    step += options.speed
    sphere.position.y = 10 * Math.abs(Math.sin(step))

    spotLight.angle = options.angle
    spotLight.penumbra = options.penumbra
    spotLight.intensity = options.intensity
    sLightHelper.update()

    rayCaster.setFromCamera(mousePosition, camera)
    const intersects = rayCaster.intersectObjects(scene.children)

    // console.log(intersects)

    // console.log(intersects)
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.id === sphereId) {
            intersects[i].object.material.color.set(0xFF00FF)
            console.log( intersects[i])
        }

        if (intersects[i].object.name === 'TheBox') {
            console.log(intersects[i])
            intersects[i].object.rotation.x = time / 1000
            intersects[i].object.rotation.y = time / 1000
        }
    }

    // initialize the scene and camera here, must be rendered on the screen
    renderer.render( scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

