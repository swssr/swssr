<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let project;
  export let accent = '#0B1733';
  /** When true, embed uses a flat large rect (parent adds layout). */
  export let viewportMax = false;

  const dispatch = createEventDispatcher();

  $: href = (project?.href || '').trim();
  $: previewImage = (project?.previewImage || '').trim();

  let iframe;
  let iframeFocusCheck = 0;

  function requestMaxIfNeeded() {
    if (!viewportMax) dispatch('requestviewportmax');
  }

  function onIframeFocus() {
    requestMaxIfNeeded();
  }

  function onImgClick() {
    requestMaxIfNeeded();
  }

  onMount(() => {
    const onWinBlur = () => {
      iframeFocusCheck++;
      const t = iframeFocusCheck;
      requestAnimationFrame(() => {
        if (t !== iframeFocusCheck) return;
        try {
          if (iframe && document.activeElement === iframe) {
            dispatch('requestviewportmax');
          }
        } catch {
          /* ignore */
        }
      });
    };
    window.addEventListener('blur', onWinBlur);
    return () => window.removeEventListener('blur', onWinBlur);
  });
</script>

<div
  class="orbit-embed-ring"
  class:orbit-embed-ring--viewport-max={viewportMax}
  style:--embed-accent={accent || '#0B1733'}
>
  {#if previewImage}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
    <img
      class="orbit-embed-media"
      class:orbit-embed-media--max-fit={viewportMax}
      src={previewImage}
      alt=""
      loading="lazy"
      decoding="async"
      on:click={onImgClick}
    />
  {:else if href}
    <iframe
      bind:this={iframe}
      class="orbit-embed-media orbit-embed-iframe"
      class:orbit-embed-media--max-fit={viewportMax}
      src={href}
      title={project?.title || 'Project preview'}
      tabindex="-1"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      on:focus={onIframeFocus}
    ></iframe>
  {:else}
    <div class="orbit-embed-fallback">
      <span>No preview URL</span>
    </div>
  {/if}
  {#if href}
    <a
      class="orbit-embed-open"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >Open in tab ↗</a>
  {/if}
</div>

<style>
  .orbit-embed-ring {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: #fff;
    border: 2px solid var(--embed-accent, #0b1733);
    box-shadow: 0 10px 44px rgba(11, 23, 51, 0.14);
  }

  .orbit-embed-ring--viewport-max {
    border-radius: 12px;
  }

  .orbit-embed-media {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    object-fit: cover;
  }

  iframe.orbit-embed-iframe {
    object-fit: unset;
  }

  .orbit-embed-media.orbit-embed-media--max-fit {
    object-fit: contain;
    background: #fff;
  }

  .orbit-embed-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 11px;
    color: var(--color-ink-mid, #5c6a8a);
    background: rgba(11, 23, 51, 0.04);
  }

  .orbit-embed-open {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 2;
    padding: 5px 8px;
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 9px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-ink, #0b1733);
    background: rgba(255, 255, 255, 0.92);
    border-radius: 4px;
    text-decoration: none;
    pointer-events: auto;
    box-shadow: 0 2px 10px rgba(11, 23, 51, 0.08);
  }

  .orbit-embed-open:hover {
    color: var(--embed-accent, #0b1733);
  }
</style>
