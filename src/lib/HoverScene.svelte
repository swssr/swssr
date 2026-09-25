<script>
  import { onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { createProjectOrbGroup, disposeOrbGroup } from './orbMesh.js';

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

    const group = createProjectOrbGroup(p, ink);
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
      disposeOrbGroup(group);
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
