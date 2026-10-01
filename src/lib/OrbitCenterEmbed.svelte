<script>
  export let project;
  export let accent = "#0B1733";

  $: href = (project?.href || "").trim();
  $: previewImage = (project?.previewImage || "").trim();
</script>

<div class="project-embed" style:--embed-accent={accent}>
  {#if previewImage}
    <img src={previewImage} alt={project.title} decoding="async" />
  {:else if href}
    <iframe
      src={href}
      title={project.title || "Project preview"}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  {:else}
    <span>No preview available</span>
  {/if}
</div>

<style>
  .project-embed {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border: 1px solid var(--embed-accent);
    color: #5c6a8a;
    font: 11px var(--mono);
  }

  img,
  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: contain;
    background: #fff;
  }
</style>
