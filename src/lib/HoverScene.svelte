<script>
  import { onMount, onDestroy } from 'svelte';

  export let project;
  export let ink = '#0B1733';

  let mount;
  let cleanup;

  $: if (mount && project) init(project);

  function init(p) {
    if (cleanup) cleanup();

    const THREE = window.THREE;
    if (!THREE) return;

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
    scene.add(mesh);

    const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ink) });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), coreMat));

    let raf;
    const t0 = performance.now();
    function tick(now) {
      const t = (now - t0) / 1000;
      mesh.rotation.x = t * 0.5;
      mesh.rotation.y = t * 0.7;
      mesh.scale.setScalar(Math.min(1, t * 3));
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    cleanup = () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
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
    style="width:360px;height:360px;object-fit:cover;border-radius:50%;border:1px solid {project.color}"
  />
{:else}
  <div bind:this={mount} style="width:360px;height:360px" />
{/if}
