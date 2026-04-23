import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { sources } from "./projects";

console.log(THREE, OrbitControls);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new THREE.TextureLoader();
const projects = sources;

const cardGroup = new THREE.Group();
scene.add(cardGroup);

projects.forEach((project, i) => {
  loader.load(project.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;

    const aspect = tex.image.width / tex.image.height;

    const height = 2;
    const width = height * aspect;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = i * 3.5;
    cardGroup.add(mesh);
  });
});
// center the group
cardGroup.position.x = -((projects.length - 1) * 3.5) / 2;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
