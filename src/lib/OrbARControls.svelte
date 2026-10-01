<script>
  import { onDestroy, onMount } from 'svelte';
  import * as THREE from 'three';
  import { createProjectOrbGroup, disposeOrbGroup } from './orbMesh.js';

  export let project;
  export let ink = '#0B1733';
  export let usdzHref = '';

  let mount;
  let xrSupported = false;
  let quickLookSupported = false;
  let running = false;
  let status = '';
  let renderer;
  let session;
  let cleanupScene = () => {};

  $: accent = project?.color || '#FF5722';
  $: arHref = usdzHref || `/ar/project-${project?.n || 'orb'}.usdz`;
  $: arLabel = `View ${project?.title || 'object'} in AR`;

  onMount(async () => {
    quickLookSupported = document.createElement('a').relList.supports?.('ar') ?? false;
    try {
      xrSupported = !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar'));
    } catch {
      xrSupported = false;
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

{#if xrSupported || quickLookSupported}
  <div class="ar-controls" style:--color-accent={accent} bind:this={mount}>
    {#if quickLookSupported}
      <a class="ar-trigger" rel="ar" href={arHref} aria-label={arLabel}>
        <img
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          alt=""
          aria-hidden="true"
        />
      </a>
    {:else if xrSupported}
      <button
        type="button"
        class="ar-trigger"
        aria-label={arLabel}
        disabled={running}
        on:click={startWebXR}
      ></button>
    {/if}
    {#if status}
      <span class="ar-status" role="status">{status}</span>
    {/if}
  </div>
{/if}

<style>
  .ar-controls {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
  }

  .ar-trigger {
    appearance: none;
    position: absolute;
    inset: 24px;
    border: 0;
    border-radius: 50%;
    padding: 0;
    background: transparent;
    cursor: pointer;
    pointer-events: auto;
  }

  .ar-trigger:hover {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 32%, transparent);
  }

  .ar-trigger:focus-visible {
    outline: 1px solid var(--color-accent);
    outline-offset: 4px;
  }

  .ar-trigger:disabled {
    cursor: not-allowed;
  }

  .ar-trigger img {
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
