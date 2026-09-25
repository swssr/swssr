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
  let checked = false;
  let running = false;
  let status = '';
  let renderer;
  let session;
  let cleanupScene = () => {};

  $: accent = project?.color || '#FF5722';
  $: arHref = usdzHref || `/ar/project-${project?.n || 'orb'}.usdz`;

  onMount(async () => {
    quickLookSupported = document.createElement('a').relList.supports?.('ar') ?? false;
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

{#if checked && (xrSupported || quickLookSupported)}
  <div class="ar-controls" style:--color-accent={accent} bind:this={mount}>
    {#if xrSupported}
      <button
        type="button"
        class="ar-button"
        disabled={running}
        on:click={startWebXR}
      >
        WebXR
      </button>
    {/if}
    {#if quickLookSupported}
      <a class="ar-button" rel="ar" href={arHref}>
        <img
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          alt=""
          aria-hidden="true"
        />
        Quick Look
      </a>
    {/if}
    {#if status}
      <span class="ar-status" role="status">{status}</span>
    {/if}
  </div>
{/if}

<style>
  .ar-controls {
    position: absolute;
    left: 50%;
    bottom: 16px;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 8px 10px 0;
    border-top: 1px solid var(--color-accent);
    transform: translateX(-50%);
    pointer-events: auto;
  }

  .ar-controls::before,
  .ar-controls::after {
    content: '';
    position: absolute;
    top: -3px;
    width: 5px;
    height: 5px;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    background: var(--color-paper, #fff);
  }

  .ar-controls::before {
    left: 0;
  }

  .ar-controls::after {
    right: 0;
  }

  .ar-button {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: transparent;
    color: var(--color-ink-mid, #5c6a8a);
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 9px;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.18s ease, opacity 0.18s ease;
  }

  .ar-button::before {
    content: '';
    width: 3px;
    height: 3px;
    flex: 0 0 3px;
    border-radius: 50%;
    background: currentColor;
  }

  .ar-button:hover,
  .ar-button:focus-visible {
    color: var(--color-accent);
  }

  .ar-button:focus-visible {
    outline: 1px solid var(--color-accent);
    outline-offset: 4px;
  }

  .ar-button:disabled {
    cursor: not-allowed;
    opacity: 0.34;
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
