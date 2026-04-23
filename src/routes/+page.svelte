<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { defaults } from '$lib/data.js';
  import TweaksPanel from '$lib/TweaksPanel.svelte';
  import HoverScene from '$lib/HoverScene.svelte';
  import './page.css';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Simo Ngquseka',
    url: 'https://www.swssr.co',
    email: 'simo@swssr.co',
    jobTitle: 'UX/UI Designer & Developer',
    description: 'UX/UI designer and developer from Durban, South Africa. Design the product, build the tools.',
    address: { '@type': 'PostalAddress', addressLocality: 'Durban', addressCountry: 'ZA' },
    sameAs: ['https://github.com/swssr', 'https://www.behance.net/swssr', 'https://www.linkedin.com/in/swssr'],
    knowsAbout: ['UX Design', 'UI Design', 'Web Development', 'JavaScript', 'TypeScript', 'Product Design'],
    workExample: defaults.projects.map(p => ({ '@type': 'CreativeWork', name: p.title, url: p.href }))
  });

  let t = { ...defaults, projects: defaults.projects.map(p => ({ ...p })) };
  let hover = null;
  let editing = false;

  const paper    = '#FFFFFF';
  const ink      = '#0B1733';
  const inkMid   = '#5C6A8A';
  const inkSoft  = '#AEB6C8';
  const line     = 'rgba(11,23,51,0.06)';
  const lineBold = 'rgba(11,23,51,0.14)';
  const splash   = '#FF5722';

  const CX = 720, CY = 470, R = 230;

  $: footerLinks = (t.footerLinks || '').split(';').map(s => s.trim()).filter(Boolean).map(pair => {
    const [label, href] = pair.split('|');
    return { label: (label || '').trim(), href: (href || '#').trim() };
  });

  $: hoverProject = hover !== null ? t.projects[hover] : null;

  function projectPos(angle, extra = 0) {
    const a = angle * Math.PI / 180;
    return { x: CX + Math.cos(a) * (R + extra), y: CY + Math.sin(a) * (R + extra) };
  }

  function labelAlign(angle) {
    const cos = Math.cos(angle * Math.PI / 180);
    if (cos < -0.3) return 'right';
    if (cos > 0.3)  return 'left';
    return 'center';
  }

  onMount(() => {
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'T') editing = !editing;
    });
  });

  function handleUpdate(e) {
    t = { ...t, ...e.detail };
  }
</script>

<svelte:head>
  <title>Simo Ngquseka — SWSSR</title>
  <meta name="description" content="UX/UI designer & developer from Durban, South Africa. Design the product, build the tools." />
  <meta property="og:title" content="Simo Ngquseka — SWSSR" />
  <meta property="og:description" content="UX/UI designer & developer from Durban. Design the product, build the tools." />
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<!-- 1440×900 scaled stage -->
<div
  id="stage"
  data-paper={paper}
  data-ink={ink}
  data-ink-mid={inkMid}
  data-ink-soft={inkSoft}
  data-line={line}
  data-line-bold={lineBold}
  data-splash={splash}
>

  <!-- soft grid -->
  <div class="soft-grid" aria-hidden="true"></div>

  <!-- top nav -->
  <nav class="top-nav">
    <span class="brand-mark">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="none" stroke={ink} stroke-width="1.3" />
        <circle cx="8" cy="8" r="2.5" fill={splash} />
      </svg>
      <span class="brand-name">{t.brand}</span>
    </span>
    <span class="nav-links">
      <a class="nav-link nav-link-active" href="/">{t.navIndex}</a>
      <a class="nav-link" href="/">{t.navWork}</a>
      <a class="nav-link" href="/">{t.navWriting}</a>
      <a class="nav-link" href="/">{t.navContact}</a>
    </span>
    <span class="revision">{t.rev}</span>
  </nav>

  <!-- left column — about -->
  <aside class="side-column side-column-left">
    <p class="section-label">{t.aboutLabel}</p>
    <h1 class="about-title">{t.aboutTitle}</h1>
    <p class="body-copy">{t.aboutBody}</p>
  </aside>

  <aside class="side-column side-column-right">
    <p class="section-label availability-label">{t.availLabel}</p>
    <p class="body-copy availability-copy">{t.availBody}</p>
    <a class="cta-link" href={t.ctaHref}>{t.ctaLabel}</a>
  </aside>

  <svg class="orbit-svg" aria-hidden="true">
    <circle cx={CX} cy={CY} r={R} fill="none" stroke={lineBold} stroke-width="0.75" />
    {#each Array(12) as _, i}
      {@const a = (i * 30) * Math.PI / 180}
      <line
        x1={CX + Math.cos(a) * (R - 3)} y1={CY + Math.sin(a) * (R - 3)}
        x2={CX + Math.cos(a) * (R + 3)} y2={CY + Math.sin(a) * (R + 3)}
        stroke={lineBold} stroke-width="0.75"
      />
    {/each}
    {#if hover !== null}
      {@const p = t.projects[hover]}
      {@const pos = projectPos(p.angle)}
      <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={p.color} stroke-width="0.75" stroke-dasharray="3 3" opacity="0.7" />
    {/if}
    {#each t.projects as p, i}
      {@const pos = projectPos(p.angle)}
      {@const isHover = hover === i}
      <circle class="orbit-project-dot" cx={pos.x} cy={pos.y} r={isHover ? 6 : 3.5} fill={isHover ? p.color : ink} />
      {#if isHover}
        <circle cx={pos.x} cy={pos.y} r="12" fill="none" stroke={p.color} stroke-width="0.75" opacity="0.5" />
      {/if}
    {/each}
  </svg>

  <div class="orbit-center" data-x={CX} data-y={CY}>
    <div class="center-pane center-idle" data-opacity={hover === null ? 1 : 0}>
      <p class="center-statement">
        <span class="minor">{t.centerLine1}</span><br /><span>{t.centerLine2}</span>
      </p>
    </div>
    {#if browser}
      <div class="center-pane center-hover" data-opacity={hover !== null ? 1 : 0}>
        {#if hover !== null}
          <HoverScene project={hoverProject} {ink} />
        {/if}
      </div>
    {/if}
  </div>

  <!-- project labels -->
  {#each t.projects as p, i}
    {@const isHover = hover === i}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      on:mouseenter={() => hover = i}
      on:mouseleave={() => hover = null}
      on:click={() => p.href && window.open(p.href, '_blank', 'noopener')}
      class="project-label"
      class:is-link={p.href}
      data-index={i}
      data-angle={`${p.angle}deg`}
      data-align={labelAlign(p.angle)}
      data-hover={isHover}
      data-color={isHover ? p.color : inkSoft}
    >
      <p class="project-meta">
        {p.n} · {p.tag} <span>{p.year}</span>
      </p>
      <p class="project-title">
        {p.title}
      </p>
    </div>
  {/each}

  <!-- footer -->
  <footer class="site-footer">
    <span>{t.footerCopyright}</span>
    <span class="footer-status" data-active={hover !== null}>
      {hover !== null ? `${t.projects[hover].n} · ${t.projects[hover].title}` : t.footerIdle}
    </span>
    <span class="footer-links">
      {#each footerLinks as l}
        <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
      {/each}
    </span>
  </footer>

</div>

<!-- noscript fallback for crawlers -->
<noscript>
  <div class="noscript-fallback">
    <h1>Simo Ngquseka — SWSSR</h1>
    <p>UX/UI designer &amp; developer from Durban, South Africa. Open to work · 2026 · <a href="mailto:simo@swssr.co">simo@swssr.co</a></p>
    <h2>Selected Work</h2>
    <ul>
      {#each defaults.projects as p}
        <li><a href={p.href}>{p.title}</a> — {p.tag}</li>
      {/each}
    </ul>
    <h2>Links</h2>
    <ul>
      <li><a href="https://github.com/swssr">github.com/swssr</a></li>
      <li><a href="https://www.behance.net/swssr">behance.net/swssr</a></li>
      <li><a href="https://www.linkedin.com/in/swssr">linkedin.com/in/swssr</a></li>
    </ul>
  </div>
</noscript>

<!-- tweaks panel -->
{#if editing}
  <TweaksPanel {t} on:update={handleUpdate} on:close={() => editing = false} />
{/if}
