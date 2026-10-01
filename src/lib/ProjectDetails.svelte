<script>
  import { onDestroy, onMount } from "svelte";
  import OrbitCenterEmbed from "./OrbitCenterEmbed.svelte";

  export let projects;
  export let selectedIndex;
  export let changeProject;
  let dialog;
  let rail;
  let path;
  let origin;
  let frame;
  let duration = 650;
  let closing = false;
  let destroyed = false;
  let unwrapped = false;

  let lastIndex = 0;
  let loadedProjects = [];

  $: if (selectedIndex != null) lastIndex = selectedIndex;
  $: if (selectedIndex != null) preload(selectedIndex);
  $: project = projects[lastIndex];

  async function select(index) {
    if (closing || selectedIndex == null) return;
    await changeProject((index + projects.length) % projects.length);
  }

  export function preload(index) {
    if (!loadedProjects.includes(index))
      loadedProjects = [...loadedProjects, index];
  }

  onMount(() => {
    const timer = setTimeout(() => {
      projects.forEach((_, index) => preload(index));
    }, 0);
    return () => clearTimeout(timer);
  });

  export function scrollSelection() {
    if (selectedIndex == null) return;
    rail
      .querySelector("[aria-current]")
      .scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function handleKeyDown(event) {
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      select(selectedIndex - 1);
    } else if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      select(selectedIndex + 1);
    }
  }

  function unwrap(reverse = false) {
    duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 650;
    const markers = [...rail.querySelectorAll(".project-marker")].map((node) =>
      node.getBoundingClientRect(),
    );
    const first = markers[0];
    const last = markers[markers.length - 1];
    const x1 = first.left + first.width / 2;
    const x2 = last.left + last.width / 2;
    const y1 = first.top + first.height / 2;
    const y2 = last.top + last.height / 2;
    const start = performance.now();

    return new Promise((resolve) => {
      function draw(now) {
        const elapsed = duration ? Math.min(1, (now - start) / duration) : 1;
        let progress = 1 - (1 - elapsed) ** 3;
        if (reverse) progress = 1 - progress;
        const points = Array.from({ length: 65 }, (_, i) => {
          const fraction = i / 64;
          const angle = ((projects[0].angle + fraction * 360) * Math.PI) / 180;
          const circleX =
            origin.left +
            origin.width / 2 +
            (Math.cos(angle) * origin.width) / 2;
          const circleY =
            origin.top +
            origin.height / 2 +
            (Math.sin(angle) * origin.height) / 2;
          return `${i ? "L" : "M"}${circleX + (x1 + (x2 - x1) * fraction - circleX) * progress},${circleY + (y1 + (y2 - y1) * fraction - circleY) * progress}`;
        });
        path.setAttribute("d", points.join(" "));
        if (elapsed < 1) frame = requestAnimationFrame(draw);
        else resolve();
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
  }

  export async function close() {
    if (closing || selectedIndex == null) return;
    closing = true;
    unwrapped = false;
    origin = document.querySelector(".orbit-ring").getBoundingClientRect();
    if (!origin.width)
      origin = document.querySelector(".orbit-center").getBoundingClientRect();
    await Promise.all([unwrap(true), changeProject(null)]);
    if (destroyed) return;
    dialog.close();
    closing = false;
  }

  export function open() {
    if (dialog.open) return;
    unwrapped = false;
    origin = document.querySelector(".orbit-ring").getBoundingClientRect();
    if (!origin.width)
      origin = document.querySelector(".orbit-center").getBoundingClientRect();
    dialog.showModal();
    scrollSelection();
    unwrap().then(() => {
      if (!closing) unwrapped = true;
    });
  }

  onDestroy(() => {
    destroyed = true;
    cancelAnimationFrame(frame);
  });
</script>

<dialog
  bind:this={dialog}
  class="project-details"
  data-open={selectedIndex != null}
  inert={selectedIndex == null}
  aria-labelledby="project-details-title"
  style:--project-accent={project.color}
  on:cancel|preventDefault={close}
  on:keydown={handleKeyDown}
  on:click={(event) => {
    if (event.target === dialog) close();
  }}
>
  {#if loadedProjects.length}
    <svg class="unwrap-line" class:unwrapped aria-hidden="true"
      ><path
        bind:this={path}
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      /></svg
    >
    <header class="details-header">
      <span>SWSSR <span class="header-divider">/</span> Selected work</span>
      <button
        type="button"
        class="close-project"
        aria-label="Close project"
        on:click={close}>Close <span aria-hidden="true">×</span></button
      >
    </header>
    <div class="details-layout">
      <nav
        bind:this={rail}
        class="project-timeline"
        class:unwrapped
        aria-label="Projects"
      >
        {#each projects as item, i}
          <button
            type="button"
            class="project-entry"
            aria-current={selectedIndex === i ? "true" : undefined}
            style:--entry-accent={item.color}
            style:view-transition-name={selectedIndex != null
              ? `project-label-${i}`
              : "none"}
            on:mouseenter={() => preload(i)}
            on:focus={() => preload(i)}
            on:click={() => select(i)}
          >
            <span class="project-marker" aria-hidden="true"></span>
            <span class="entry-meta"
              >{item.n} · {item.tag} <span>{item.year}</span></span
            >
            <span class="entry-title">{item.title}</span>
          </button>
        {/each}
      </nav>
      <section class="project-view" aria-label="Project preview">
        <div class="preview-heading">
          <div
            aria-live="polite"
            aria-atomic="true"
            style:view-transition-name={selectedIndex != null
              ? "project-heading"
              : "none"}
          >
            <p class="entry-meta">{project.tag} · {project.year}</p>
            <h2 id="project-details-title">{project.title}</h2>
          </div>
          {#if project.href}<a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer">Open project ↗</a
            >{/if}
        </div>
        <div
          class="project-square"
          style:view-transition-name={selectedIndex != null
            ? "project-preview"
            : "none"}
        >
          {#each loadedProjects as index (index)}
            <div
              class="project-media"
              class:active={selectedIndex === index}
              inert={selectedIndex !== index}
              aria-hidden={selectedIndex !== index}
            >
              <OrbitCenterEmbed
                project={projects[index]}
                accent={projects[index].color}
              />
            </div>
          {/each}
        </div>
        <footer class="preview-controls">
          <span>{project.n} / {String(projects.length).padStart(2, "0")}</span>
          <div>
            <button
              type="button"
              aria-label="Previous project"
              on:click={() => select(selectedIndex - 1)}>←</button
            >
            <button
              type="button"
              aria-label="Next project"
              on:click={() => select(selectedIndex + 1)}>→</button
            >
          </div>
        </footer>
      </section>
    </div>
  {/if}
</dialog>

<style>
  .project-details {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: clamp(16px, 2vw, 24px);
    border: 0;
    overflow-y: auto;
    background: transparent;
    color: #0b1733;
  }

  .project-details[data-open="false"] .details-header,
  .project-details[data-open="false"] .details-layout {
    visibility: hidden;
  }

  .project-details:not([open]) {
    display: block;
    visibility: hidden;
    pointer-events: none;
  }

  .project-details::backdrop {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(2px);
  }

  .unwrap-line {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    color: #dce0e8;
    pointer-events: none;
  }

  .unwrap-line.unwrapped {
    visibility: hidden;
  }

  .details-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font: 11px var(--mono);
  }

  .header-divider {
    margin: 0 16px;
    color: #aeb6c8;
  }

  button {
    appearance: none;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }

  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--project-accent);
    outline-offset: 4px;
  }

  .close-project {
    display: flex;
    gap: 20px;
    align-items: center;
    min-height: 44px;
    padding: 0 4px;
    font: inherit;
  }

  .close-project span {
    font: 24px var(--sans);
  }

  .details-layout {
    position: relative;
    display: grid;
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    align-items: center;
    gap: clamp(24px, 4vw, 64px);
    width: min(100%, 1440px);
    min-height: calc(100% - 44px);
    margin: auto;
    padding: 12px 0;
  }

  .project-timeline {
    --timeline-gap: clamp(12px, 3vh, 32px);
    display: grid;
    gap: var(--timeline-gap);
  }

  .project-entry {
    position: relative;
    display: grid;
    gap: 8px;
    min-height: 64px;
    padding: 10px 0 10px 28px;
    text-align: left;
  }

  .project-timeline.unwrapped .project-entry:not(:last-child)::after {
    content: "";
    position: absolute;
    left: 3px;
    top: 50%;
    width: 1px;
    height: calc(100% + var(--timeline-gap));
    background: #dce0e8;
    pointer-events: none;
  }

  .project-marker {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 50%;
    width: 7px;
    height: 7px;
    margin-top: -3.5px;
    border-radius: 50%;
    background: #aeb6c8;
    box-shadow: 0 0 0 5px #fff;
    transition:
      background 0.2s,
      box-shadow 0.2s;
  }

  .entry-meta {
    display: block;
    color: #8a94a8;
    font: 10px var(--mono);
  }

  .entry-meta span {
    margin-left: 10px;
  }

  .entry-title {
    font: 300 clamp(18px, 2vw, 25px) var(--sans);
    color: #8a94a8;
    transition: color 0.2s;
  }

  .project-entry:is(:hover, [aria-current]) .entry-title {
    color: #0b1733;
  }

  .project-entry[aria-current] .entry-meta {
    color: var(--entry-accent);
  }

  .project-entry[aria-current] .project-marker {
    background: var(--entry-accent);
    box-shadow:
      0 0 0 5px #fff,
      0 0 0 6px var(--entry-accent);
  }

  .project-view {
    min-width: 0;
    width: min(100%, calc((100svh - 260px) * 4 / 3));
  }

  .preview-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  h2 {
    margin-top: 8px;
    font: 400 clamp(20px, 2.5vw, 30px) var(--sans);
  }

  .preview-heading a {
    flex-shrink: 0;
    padding: 12px 0;
    font: 10px var(--mono);
  }

  .project-square {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #f7f8fa;
    box-shadow: 0 20px 70px rgba(11, 23, 51, 0.07);
  }

  .project-media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    visibility: hidden;
    pointer-events: none;
  }

  .project-media.active {
    visibility: visible;
    pointer-events: auto;
  }

  .preview-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    color: #8a94a8;
    font: 10px var(--mono);
  }

  .preview-controls div {
    display: flex;
    gap: 8px;
  }

  .preview-controls button {
    min-width: 44px;
    min-height: 44px;
    font-size: 22px;
    color: #0b1733;
  }

  @media (max-width: 720px) {
    .details-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
      padding-top: 20px;
      align-items: start;
    }

    .project-timeline {
      --timeline-gap: 20px;
      grid-auto-flow: column;
      grid-auto-columns: 190px;
      overflow-x: auto;
      padding: 8px;
      scrollbar-width: thin;
    }

    .project-entry {
      min-height: 60px;
      gap: 4px;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    .project-timeline.unwrapped .project-entry:not(:last-child)::after {
      width: calc(100% + var(--timeline-gap));
      height: 1px;
    }

    .entry-title {
      font-size: 18px;
    }

    .project-view {
      width: 100%;
    }

    .preview-heading {
      gap: 8px;
    }

    .preview-heading a {
      font-size: 9px;
    }

    h2 {
      font-size: 22px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-marker,
    .entry-title {
      transition: none;
    }
  }
</style>
