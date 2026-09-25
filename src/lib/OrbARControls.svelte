<script>
  import { onDestroy, onMount } from 'svelte';
  import * as THREE from 'three';
  import { createProjectOrbGroup, disposeOrbGroup } from './orbMesh.js';

  export let project;
  export let ink = '#0B1733';
  export let usdzHref = '';

  let mount;
  let xrSupported = false;
  let checked = false;
  let running = false;
  let status = '';
  let renderer;
  let session;
  let cleanupScene = () => {};

  $: accent = project?.color || '#FF5722';
  $: arHref = usdzHref || `/ar/project-${project?.n || 'orb'}.usdz`;

  onMount(async () => {
    try {
      xrSupported = !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar'));
    } catch {
      xrSupported = false;
    } finally {
      checked = true;
    }
  });

  onDestroy(() => {
    stopWebXR();
  });

  async function startWebXR() {
    if (!navigator.xr || running) return;

    try {
      status = '';
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      const light = new THREE.HemisphereLight(0xffffff, 0x223355, 2.2);
      scene.add(light);

      const orb = createProjectOrbGroup(project, ink);
      orb.scale.setScalar(0.32);
      orb.position.set(0, -0.08, -1.1);
      scene.add(orb);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.xr.enabled = true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(1, 1);
      mount.appendChild(renderer.domElement);

      session = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: ['dom-overlay', 'hit-test'],
        domOverlay: { root: document.body },
      });
      session.addEventListener('end', stopWebXR);
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(session);
      running = true;

      renderer.setAnimationLoop(() => {
        orb.rotation.y += 0.012;
        orb.rotation.x += 0.005;
        renderer.render(scene, camera);
      });

      cleanupScene = () => {
        renderer?.setAnimationLoop(null);
        disposeOrbGroup(orb);
        renderer?.dispose();
        renderer?.domElement?.remove();
        renderer = null;
      };
    } catch {
      status = 'WebXR AR unavailable here';
      stopWebXR();
    }
  }

  function stopWebXR() {
    running = false;
    if (session) {
      const active = session;
      session = null;
      try {
        active.end();
      } catch {
        /* session already ended */
      }
    }
    cleanupScene();
    cleanupScene = () => {};
  }
</script>

<div class="ar-controls" bind:this={mount}>
  <button
    type="button"
    class="ar-button"
    disabled={!checked || !xrSupported || running}
    on:click={startWebXR}
  >
    WebXR
  </button>
  <a class="ar-button" rel="ar" href={arHref}>
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
      alt=""
      aria-hidden="true"
    />
    Quick Look
  </a>
  {#if status}
    <span class="ar-status" role="status">{status}</span>
  {/if}
</div>

<style>
  .ar-controls {
    position: absolute;
    left: 50%;
    bottom: 18px;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transform: translateX(-50%);
    pointer-events: auto;
  }

  .ar-button {
    appearance: none;
    border: 1px solid color-mix(in srgb, var(--color-ink, #0b1733) 18%, transparent);
    border-radius: 4px;
    padding: 7px 10px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-ink, #0b1733);
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 10px;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(11, 23, 51, 0.08);
  }

  .ar-button:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .ar-button img {
    display: none;
  }

  .ar-status {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    width: max-content;
    max-width: 190px;
    transform: translateX(-50%);
    color: var(--color-ink-soft, #aeb6c8);
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 9px;
  }
</style>
