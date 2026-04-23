<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { defaults } from '$lib/data.js';
  import TweaksPanel from '$lib/TweaksPanel.svelte';
  import HoverScene from '$lib/HoverScene.svelte';

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
  let stage;

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
    if (cos < -0.3) return { align: 'right', tx: '-100%' };
    if (cos > 0.3)  return { align: 'left',  tx: '0' };
    return { align: 'center', tx: '-50%' };
  }

  function fitStage() {
    if (!stage) return;
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
    stage.style.transform = `scale(${scale})`;
  }

  onMount(() => {
    fitStage();
    window.addEventListener('resize', fitStage);
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'T') editing = !editing;
    });
    return () => window.removeEventListener('resize', fitStage);
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
<div id="stage" bind:this={stage} style="width:1440px;height:900px;flex-shrink:0;transform-origin:center center;position:relative;overflow:hidden;background:{paper};font-family:var(--sans);color:{ink}">

  <!-- soft grid -->
  <div style="position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(to right,{line} 0.5px,transparent 0.5px),linear-gradient(to bottom,{line} 0.5px,transparent 0.5px);background-size:48px 48px" aria-hidden="true"></div>

  <!-- top nav -->
  <nav style="display:flex;justify-content:space-between;align-items:center;padding:22px 40px;font-family:var(--mono);font-size:11px;letter-spacing:0.14em;color:{inkMid};position:relative;z-index:2">
    <span style="display:flex;align-items:center;gap:10px">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="none" stroke={ink} stroke-width="1.3" />
        <circle cx="8" cy="8" r="2.5" fill={splash} />
      </svg>
      <span style="color:{ink};font-weight:600;letter-spacing:0.2em">{t.brand}</span>
    </span>
    <span style="display:flex;gap:28px">
      <a href="/" style="color:{ink}">{t.navIndex}</a>
      <a href="/" style="color:{inkMid}">{t.navWork}</a>
      <a href="/" style="color:{inkMid}">{t.navWriting}</a>
      <a href="/" style="color:{inkMid}">{t.navContact}</a>
    </span>
    <span style="color:{inkSoft}">{t.rev}</span>
  </nav>

  <!-- left column — about -->
  <aside style="position:absolute;left:40px;top:140px;width:260px;z-index:2">
    <p style="font-family:var(--mono);font-size:10px;color:{inkSoft};letter-spacing:0.2em;margin-bottom:14px">{t.aboutLabel}</p>
    <h1 style="font-family:var(--display);font-size:22px;line-height:1.25;color:{ink};margin-bottom:14px;font-weight:400;letter-spacing:-0.01em">{t.aboutTitle}</h1>
    <p style="font-family:var(--sans);font-size:13.5px;line-height:1.6;color:{inkMid}">{t.aboutBody}</p>
  </aside>

  <!-- right column — availability -->
  <aside style="position:absolute;right:40px;top:140px;width:260px;z-index:2;text-align:right">
    <p style="font-family:var(--mono);font-size:10px;color:{splash};letter-spacing:0.2em;margin-bottom:14px">{t.availLabel}</p>
    <p style="font-family:var(--sans);font-size:13.5px;line-height:1.6;color:{inkMid};margin-bottom:18px">{t.availBody}</p>
    <a href={t.ctaHref} style="display:inline-block;padding:10px 16px;background:{ink};color:{paper};font-family:var(--mono);font-size:11px;letter-spacing:0.18em">{t.ctaLabel}</a>
  </aside>

  <!-- orbit SVG -->
  <svg style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1" aria-hidden="true">
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
      <circle cx={pos.x} cy={pos.y} r={isHover ? 6 : 3.5} fill={isHover ? p.color : ink} style="transition:r 0.18s" />
      {#if isHover}
        <circle cx={pos.x} cy={pos.y} r="12" fill="none" stroke={p.color} stroke-width="0.75" opacity="0.5" />
      {/if}
    {/each}
  </svg>

  <!-- orbit center -->
  <div style="position:absolute;left:{CX}px;top:{CY}px;transform:translate(-50%,-50%);text-align:center;z-index:2;width:360px;height:360px;pointer-events:none;display:flex;align-items:center;justify-content:center">
    <!-- idle statement -->
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:{hover===null?1:0};transition:opacity 0.25s ease">
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:0.22em;color:{inkSoft};margin-bottom:14px">{t.centerEyebrow}</p>
      <p style="font-family:var(--display);font-size:34px;line-height:1.1;color:{ink};letter-spacing:-0.015em;font-weight:400;text-transform:uppercase;width:320px">
        {t.centerLine1}<br /><span style="font-weight:600">{t.centerLine2}</span>
      </p>
    </div>
    <!-- hover scene — client only -->
    {#if browser}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:{hover!==null?1:0};transition:opacity 0.25s ease">
        {#if hover !== null}
          <HoverScene project={hoverProject} {ink} />
        {/if}
      </div>
      {#if hover !== null}
        <div style="position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:10px;letter-spacing:0.22em;color:{hoverProject.color};white-space:nowrap">
          ◆ NOW VIEWING · {hoverProject.n}
        </div>
      {/if}
    {/if}
  </div>

  <!-- project labels -->
  {#each t.projects as p, i}
    {@const pos = projectPos(p.angle, 40)}
    {@const la = labelAlign(p.angle)}
    {@const isHover = hover === i}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      on:mouseenter={() => hover = i}
      on:mouseleave={() => hover = null}
      on:click={() => p.href && window.open(p.href, '_blank', 'noopener')}
      style="position:absolute;left:{pos.x}px;top:{pos.y}px;transform:translate({la.tx},-50%);z-index:3;cursor:{p.href?'pointer':'default'};text-align:{la.align};padding:8px 12px;min-width:170px"
    >
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:0.16em;color:{isHover?p.color:inkSoft};margin-bottom:3px;transition:color 0.18s">
        {p.n} · {p.tag} <span style="color:{inkSoft}">{p.year}</span>
      </p>
      <p style="font-family:var(--sans);font-size:18px;line-height:1.2;color:{ink};font-weight:{isHover?500:400};letter-spacing:-0.005em;transition:font-weight 0.18s">
        {p.title}
      </p>
    </div>
  {/each}

  <!-- footer -->
  <footer style="position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:22px 40px;font-family:var(--mono);font-size:10px;letter-spacing:0.18em;color:{inkSoft};z-index:2">
    <span>{t.footerCopyright}</span>
    <span style="color:{hover!==null?ink:inkSoft};transition:color 0.15s">
      {hover !== null ? `${t.projects[hover].n} · ${t.projects[hover].title}` : t.footerIdle}
    </span>
    <span style="display:flex;gap:18px">
      {#each footerLinks as l}
        <a href={l.href} target="_blank" rel="noopener noreferrer" style="color:{ink}">{l.label} ↗</a>
      {/each}
    </span>
  </footer>

</div>

<!-- noscript fallback for crawlers -->
<noscript>
  <style>
    .noscript-fallback { font-family: sans-serif; max-width: 760px; margin: 60px auto; padding: 0 24px; color: #0B1733; line-height: 1.6; }
    .noscript-fallback h1 { font-size: 2rem; margin-bottom: 8px; }
    .noscript-fallback h2 { font-size: 1.1rem; margin: 32px 0 8px; border-top: 1px solid #e0e0e0; padding-top: 24px; }
    .noscript-fallback ul { padding-left: 20px; }
    .noscript-fallback a { color: #1E40FF; }
  </style>
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
