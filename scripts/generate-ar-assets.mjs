import { mkdir, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { defaults } from '../src/lib/data.js';
import { createProjectOrbGroup } from '../src/lib/orbMesh.js';

const outDir = new URL('../static/ar/', import.meta.url);
const ink = '#0B1733';
const exporter = new USDZExporter();
const orbName = 'ProjectOrb';
const spin = new THREE.AnimationClip('spin', 6, [
  new THREE.QuaternionKeyframeTrack(`${orbName}.quaternion`, [0, 1.5, 3, 4.5, 6], [
    0, 0, 0, 1,
    0, Math.SQRT1_2, 0, Math.SQRT1_2,
    0, 1, 0, 0,
    0, Math.SQRT1_2, 0, -Math.SQRT1_2,
    0, 0, 0, -1,
  ]),
]);

function wireframeTubes(geometry) {
  const wireframe = new THREE.WireframeGeometry(geometry);
  const positions = wireframe.getAttribute('position');
  const cylinder = new THREE.CylinderGeometry(0.006, 0.006, 1, 3, 1, true);
  const up = new THREE.Vector3(0, 1, 0);
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const midpoint = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const tubes = [];

  for (let i = 0; i < positions.count; i += 2) {
    start.fromBufferAttribute(positions, i);
    end.fromBufferAttribute(positions, i + 1);
    direction.subVectors(end, start);
    const length = direction.length();
    midpoint.addVectors(start, end).multiplyScalar(0.5);
    quaternion.setFromUnitVectors(up, direction.normalize());
    scale.set(1, length, 1);
    matrix.compose(midpoint, quaternion, scale);
    const tube = cylinder.clone();
    tube.applyMatrix4(matrix);
    tubes.push(tube);
  }

  const merged = mergeGeometries(tubes, false);
  for (const tube of tubes) tube.dispose();
  cylinder.dispose();
  wireframe.dispose();
  if (!merged) throw new Error('Could not build AR wireframe');
  return merged;
}

await mkdir(outDir, { recursive: true });

for (const project of defaults.projects) {
  const scene = new THREE.Scene();
  const light = new THREE.HemisphereLight(0xffffff, 0x223355, 2.2);
  const orb = createProjectOrbGroup(project, ink, { material: 'standard' });
  orb.name = orbName;
  const ring = orb.children[0];
  const surface = ring.geometry;
  ring.geometry = wireframeTubes(surface);
  surface.dispose();
  ring.material.metalness = 0;
  ring.material.roughness = 0.8;
  ring.material.emissive.set(project.color);

  scene.add(light);
  scene.add(orb);

  const data = await exporter.parseAsync(scene, {
    quickLookCompatible: true,
    animations: [spin],
    animationFrameRate: 30,
    ar: {
      anchoring: { type: 'plane' },
      planeAnchoring: { alignment: 'horizontal' },
    },
  });

  await writeFile(new URL(`project-${project.n}.usdz`, outDir), Buffer.from(data));
}
