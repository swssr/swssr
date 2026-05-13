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
    address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
    sameAs: ['https://github.com/swssr', 'https://www.behance.net/swssr', 'https://www.linkedin.com/in/swssr'],
    knowsAbout: ['UX Design', 'UI Design', 'Web Development', 'JavaScript', 'TypeScript', 'Product Design'],
    workExample: defaults.projects.map(p => ({ '@type': 'CreativeWork', name: p.title, url: p.href }))
  });

  let t = { ...defaults, projects: defaults.projects.map(p => ({ ...p })) };
  let defaultProjectIndex = 0;
  let hover = defaultProjectIndex % t.projects.length;
  let editing = false;
  let versionYear = Number(defaults.versions[defaults.versions.length - 1].year);

  const paper    = '#FFFFFF';
  const ink      = '#0B1733';
  const inkMid   = '#5C6A8A';
  const inkSoft  = '#AEB6C8';
  const line     = 'rgba(11,23,51,0.06)';
  const lineBold = 'rgba(11,23,51,0.14)';
  const splash   = '#FF5722';

  const CX = 720, CY = 470, R = 230;
  const inactiveMessages = [
    'Long coffee arc',
    'Extended side quest',
    'Year-long yak shave',
    'Deep tab hibernation',
    'Still updating dependencies'
  ];

  $: footerLinks = (t.footerLinks || '').split(';').map(s => s.trim()).filter(Boolean).map(pair => {
    const [label, href] = pair.split('|');
    return { label: (label || '').trim(), href: (href || '#').trim() };
  });

  $: hoverProject = t.projects[hover];
  $: versions = t.versions || defaults.versions;
  $: timelineStartYear = t.timelineStartYear || defaults.timelineStartYear;
  $: timelineEndYear = Math.max(...versions.map(version => Number(version.year)));
  $: timelineYears = Array.from(
    { length: timelineEndYear - timelineStartYear + 1 },
    (_, i) => timelineStartYear + i
  );
  $: versionsByYear = new Map(versions.map(version => [String(version.year), version]));
  $: selectedYear = Math.max(timelineStartYear, Math.min(timelineEndYear, Number(versionYear)));
  $: selectedVersionIndex = versions.reduce(
    (latest, version, i) => Number(version.year) <= selectedYear ? i : latest,
    0
  );
  $: selectedVersion = versions[selectedVersionIndex] || versions[0];
  $: activeTimelineEntry = versionsByYear.get(String(selectedYear)) || inactiveTimelineEntry(selectedYear);

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

  function handleTimelineMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const progress = 1 - ((e.clientY - rect.top) / rect.height);
    const year = Math.round(timelineStartYear + progress * (timelineEndYear - timelineStartYear));
    versionYear = Math.max(timelineStartYear, Math.min(timelineEndYear, year));
  }

  function yearFade(year) {
    return Math.max(0.14, 1 - Math.abs(Number(year) - selectedYear) * 0.22);
  }

  function versionTop(year) {
    return 100 - ((Number(year) - timelineStartYear) / (timelineEndYear - timelineStartYear)) * 100;
  }

  function inactiveTimelineEntry(year) {
    return {
      year: String(year),
      title: inactiveMessages[Number(year) % inactiveMessages.length],
      company: 'No logged activity',
      period: String(year),
      note: 'Nothing official on the timeline.',
      skills: '',
      theme: 'quiet',
      inactive: true
    };
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

  <div class="orbit-ticks" aria-hidden="true"></div>

  <svg class="orbit-svg" aria-hidden="true">
    <circle cx={CX} cy={CY} r={R} fill="none" stroke={lineBold} stroke-width="0.75" />
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
      on:mouseleave={() => { /** hover = null **/} }
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

<aside class="version-timeline" aria-label="Work experience timeline">
  <input
    class="version-range"
    type="range"
    min={timelineStartYear}
    max={timelineEndYear}
    step="1"
    bind:value={versionYear}
    aria-label="Work experience"
    aria-valuetext={`${activeTimelineEntry.period} ${activeTimelineEntry.title} at ${activeTimelineEntry.company}`}
    on:pointermove={handleTimelineMove}
  />
  <div class="version-year-ticks" aria-hidden="true">
    {#each timelineYears as year}
      <span
        class="version-year-tick"
        data-active={year === selectedYear}
        style={`--year-opacity:${yearFade(year)}`}
      >
        {year}
      </span>
    {/each}
  </div>
  <div class="version-card-track">
    {#each timelineYears as year}
      {@const version = versionsByYear.get(String(year)) || inactiveTimelineEntry(year)}
      <span class="version-card-slot" style={`--card-top:${versionTop(version.year)}%`}>
        <div
          class="version-card"
          data-active={Number(version.year) === selectedYear}
          data-inactive={version.inactive}
          data-theme={version.theme}
        >
          <span class="version-company">{version.company}</span>
          <span class="version-title">{version.title}</span>
          <span class="version-period">{version.period}</span>
          <span class="version-note">{version.note}</span>
          {#if version.skills}
            <span class="version-skills">{version.skills}</span>
          {/if}
        </div>
      </span>
    {/each}
  </div>
</aside>

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
