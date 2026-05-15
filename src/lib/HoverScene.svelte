<script>
  import { onDestroy } from 'svelte';
  import * as THREE from 'three';

  export let project;
  export let ink = '#0B1733';
  export let lookX = 0;
  export let lookY = 0;
  export let headLookOn = false;

  let mount;
  let cleanup;
  let lx = 0;
  let ly = 0;
  let headOn = false;

  $: lx = lookX;
  $: ly = lookY;
  $: headOn = headLookOn;

  $: if (mount && project) init(project);

  function init(p) {
    if (cleanup) cleanup();

    const w = 360, h = 360;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.z = 4;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    let geom;
    switch (p.shape) {
      case 'box':      geom = new THREE.BoxGeometry(1.5, 1.5, 1.5); break;
      case 'ico':      geom = new THREE.IcosahedronGeometry(1.1, 0); break;
      case 'cylinder': geom = new THREE.CylinderGeometry(0.9, 0.9, 1.6, 32); break;
      case 'octa':     geom = new THREE.OctahedronGeometry(1.2, 0); break;
      case 'knot':     geom = new THREE.TorusKnotGeometry(0.8, 0.26, 80, 12); break;
      default:         geom = new THREE.TorusGeometry(1, 0.32, 16, 64); break;
    }
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color), wireframe: true, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geom, mat);

    const coreGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ink) });
    const core = new THREE.Mesh(coreGeom, coreMat);

    const group = new THREE.Group();
    group.add(mesh);
    group.add(core);
    scene.add(group);

    const headTilt = 0.58;

    let raf;
    const t0 = performance.now();
    function tick(now) {
      const t = (now - t0) / 1000;
      group.scale.setScalar(Math.min(1, t * 3));
      if (headOn) {
        group.rotation.x = ly * headTilt;
        group.rotation.y = lx * headTilt;
        group.rotation.z = 0;
      } else {
        group.rotation.x = t * 0.5;
        group.rotation.y = t * 0.7;
        group.rotation.z = 0;
      }
      cam.position.x = headOn ? 0 : lx * 0.24;
      cam.position.y = headOn ? 0 : ly * 0.24;
      cam.position.z = 4;
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    cleanup = () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      cleanup = null;
    };
  }

  onDestroy(() => { if (cleanup) cleanup(); });
</script>

{#if project?.video}
  <video
    src={project.video}
    autoplay muted loop playsinline
    style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:1px solid {project.color}"
  ></video>
{:else}
  <div bind:this={mount} style="width:100%;height:100%"></div>
{/if}
