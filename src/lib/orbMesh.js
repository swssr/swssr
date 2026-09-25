import * as THREE from 'three';

export function createProjectGeometry(shape = 'torus') {
  switch (shape) {
    case 'box':
      return new THREE.BoxGeometry(1.5, 1.5, 1.5);
    case 'ico':
      return new THREE.IcosahedronGeometry(1.1, 0);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.9, 0.9, 1.6, 32);
    case 'octa':
      return new THREE.OctahedronGeometry(1.2, 0);
    case 'knot':
      return new THREE.TorusKnotGeometry(0.8, 0.26, 80, 12);
    default:
      return new THREE.TorusGeometry(1, 0.32, 16, 64);
  }
}

export function createProjectOrbGroup(project, ink = '#0B1733', options = {}) {
  const color = project?.color || '#FF5722';
  const material = options.material || 'basic-wire';
  const group = new THREE.Group();

  const ringGeom = createProjectGeometry(project?.shape);
  const ringMat = material === 'standard'
    ? new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.18,
        roughness: 0.42,
      })
    : new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
  const ring = new THREE.Mesh(ringGeom, ringMat);

  const coreGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const coreMat = material === 'standard'
    ? new THREE.MeshStandardMaterial({
        color: new THREE.Color(ink),
        metalness: 0.08,
        roughness: 0.35,
      })
    : new THREE.MeshBasicMaterial({ color: new THREE.Color(ink) });
  const core = new THREE.Mesh(coreGeom, coreMat);

  group.add(ring);
  group.add(core);
  return group;
}

export function disposeOrbGroup(group) {
  group.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material?.dispose?.();
  });
}
