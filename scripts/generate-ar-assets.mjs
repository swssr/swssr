import { mkdir, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import { defaults } from '../src/lib/data.js';
import { createProjectOrbGroup } from '../src/lib/orbMesh.js';

const outDir = new URL('../static/ar/', import.meta.url);
const ink = '#0B1733';
const exporter = new USDZExporter();

await mkdir(outDir, { recursive: true });

for (const project of defaults.projects) {
  const scene = new THREE.Scene();
  const light = new THREE.HemisphereLight(0xffffff, 0x223355, 2.2);
  const orb = createProjectOrbGroup(project, ink, { material: 'standard' });

  scene.add(light);
  scene.add(orb);

  const data = await exporter.parse(scene, {
    quickLookCompatible: true,
    ar: {
      anchoring: { type: 'plane' },
      planeAnchoring: { alignment: 'horizontal' },
    },
  });

  await writeFile(new URL(`project-${project.n}.usdz`, outDir), Buffer.from(data));
}
