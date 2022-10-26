import './style.css';
import * as THREE from 'three';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import {
  ACESFilmicToneMapping,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping,
} from 'three';

// Loading Manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = () => {};
loadingManager.onLoad = () => {
  const t1 = gsap.timeline();
  t1.to('.loader', {
    opacity: 0,
    duration: 0.8,
    ease: 'power4.inOut',
    delay: 1,
    onComplete: () => {
      document.getElementsByTagName('html')[0].style.overflow = 'scroll';
    },
  });
};

// Loader
var watch = null;
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
/**
 * Debug
 */
// const gui = new dat.GUI();
// const debugObject = {};
// gui.close();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Update all material
 */
const updateAllMaterial = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap;
      child.material.envMapIntensity = 1.15;
      // child.material.envMapIntensity = debugObject.envMapIntensity;
    }
  });
};

/**
 * Environment Map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/3/px.jpg',
  '/textures/environmentMaps/3/nx.jpg',
  '/textures/environmentMaps/3/py.jpg',
  '/textures/environmentMaps/3/ny.jpg',
  '/textures/environmentMaps/3/pz.jpg',
  '/textures/environmentMaps/3/nz.jpg',
]);
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;

// debugObject.envMapIntensity = 1.15;
// gui
//   .add(debugObject, 'envMapIntensity')
//   .min(0)
//   .max(10)
//   .step(0.001)
//   .onChange(updateAllMaterial);

//  Model
gltfLoader.load('/rolex2.glb', (gltf) => {
  watch = gltf.scene;
  gltf.scene.position.y = -0.2;
  gltf.scene.position.x = -0.1;
  scene.add(watch);
  updateAllMaterial();
  scene.background = cubeTextureLoader.renderTarget;
});

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 5;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.setClearColor(0xffffff, 0);

// gui.add(renderer, 'toneMapping', {
//   No: NoToneMapping,
//   Linear: LinearToneMapping,
//   Reinhard: ReinhardToneMapping,
//   Cineon: CineonToneMapping,
//   ACESFilmic: ACESFilmicToneMapping,
// });

// gui.add(renderer, 'toneMappingExposure').min(0).max(5).step(0.001);

// Scroll
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate Camera
  window.addEventListener('scroll', () => {
    camera.position.z = 5 - (scrollY / sizes.height) * 0.7;
    camera.position.x = -(scrollY / sizes.height) * 0.2;
    if (watch) {
      watch.rotation.y = Math.sin(scrollY / sizes.height) / 2.5;
    }
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
