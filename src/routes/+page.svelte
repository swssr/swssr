<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import { browser } from "$app/environment";
  import { defaults } from "$lib/data.js";
  import TweaksPanel from "$lib/TweaksPanel.svelte";
  import HoverScene from "$lib/HoverScene.svelte";
  import OrbARControls from "$lib/OrbARControls.svelte";
  import ProjectDetails from "$lib/ProjectDetails.svelte";
  import LandmarkDebug from "$lib/LandmarkDebug.svelte";
  import {
    headLook,
    headLookStatus,
    startHeadLook,
    stopHeadLook,
    setOrbitProjectAngles,
    setOrbitPinchCommitHandler,
    setOrbitGeometry,
    orbitSpinDeg,
    orbitGestureScale,
    handDrivingHover,
    handPointProjectIndex,
    orbitEmbedDismissPulse,
    debugMode,
  } from "$lib/headParallax.js";
  import "./page.css";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Simo Ngquseka",
    url: "https://www.swssr.co",
    email: "simo@swssr.co",
    jobTitle: "UX/UI Designer & Developer",
    description:
      "UX/UI designer and developer from Durban, South Africa. Design the product, build the tools.",
    address: { "@type": "PostalAddress", addressCountry: "ZA" },
    sameAs: [
      "https://github.com/swssr",
      "https://www.behance.net/swssr",
      "https://www.linkedin.com/in/swssr",
    ],
    knowsAbout: [
      "UX Design",
      "UI Design",
      "Web Development",
      "JavaScript",
      "TypeScript",
      "Product Design",
    ],
    workExample: defaults.projects.map((p) => ({
      "@type": "CreativeWork",
      name: p.title,
      url: p.href,
    })),
  });

  let t = { ...defaults, projects: defaults.projects.map((p) => ({ ...p })) };
  let defaultProjectIndex = 0;
  let centerCommittedIndex = null;
  let hover = defaultProjectIndex % t.projects.length;
  let editing = false;
  let mounted = false;
  let stageScale = null;
  let navToast = "";
  let navToastT = null;
  let brandHintT = null;
  let versionYear = Number(
    defaults.versions[defaults.versions.length - 1].year,
  );

  const paper = "#FFFFFF";
  const ink = "#0B1733";
  const inkMid = "#5C6A8A";
  const inkSoft = "#AEB6C8";
  const line = "rgba(11,23,51,0.06)";
  const lineBold = "rgba(11,23,51,0.14)";
  const splash = "#FF5722";

  const CX = 720,
    CY = 470,
    R = 200;
  const inactiveMessages = [
    "Long coffee arc",
    "Extended side quest",
    "Year-long yak shave",
    "Deep tab hibernation",
    "Still updating dependencies",
  ];

  $: footerLinks = (t.footerLinks || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [label, href] = pair.split("|");
      return { label: (label || "").trim(), href: (href || "#").trim() };
    });

  $: if (t.projects.length > 0 && centerCommittedIndex != null) {
    if (centerCommittedIndex >= t.projects.length)
      centerCommittedIndex = t.projects.length - 1;
    else if (centerCommittedIndex < 0) centerCommittedIndex = 0;
  }

  $: committedProject =
    centerCommittedIndex != null &&
    t.projects.length > 0 &&
    centerCommittedIndex >= 0 &&
    centerCommittedIndex < t.projects.length
      ? t.projects[centerCommittedIndex]
      : null;

  $: hoverProject =
    hover != null && t.projects[hover] ? t.projects[hover] : null;
  $: setOrbitProjectAngles(t.projects.map((p) => Number(p.angle)));
  $: setOrbitPinchCommitHandler(commitOrToggleOrbitCenter);
  function commitOrToggleOrbitCenter(i) {
    if (typeof i !== "number" || !t.projects[i]) return;
    centerCommittedIndex = i;
    hover = i;
  }

  function handleProjectLabelActivate(i) {
    commitOrToggleOrbitCenter(i);
  }

  $: footerProject =
    committedProject ??
    (hover !== null && t.projects[hover] ? t.projects[hover] : null);
  $: if (
    browser &&
    $headLookStatus === "on" &&
    $handDrivingHover &&
    typeof $handPointProjectIndex === "number" &&
    t.projects[$handPointProjectIndex]
  ) {
    hover = $handPointProjectIndex;
  }

  $: versions = t.versions || defaults.versions;
  $: timelineStartYear = t.timelineStartYear || defaults.timelineStartYear;
  $: timelineEndYear = Math.max(
    ...versions.map((version) => Number(version.year)),
  );
  $: timelineYears = Array.from(
    { length: timelineEndYear - timelineStartYear + 1 },
    (_, i) => timelineStartYear + i,
  );
  $: versionsByYear = new Map(
    versions.map((version) => [String(version.year), version]),
  );
  $: selectedYear = Math.max(
    timelineStartYear,
    Math.min(timelineEndYear, Number(versionYear)),
  );
  $: selectedVersionIndex = versions.reduce(
    (latest, version, i) => (Number(version.year) <= selectedYear ? i : latest),
    0,
  );
  $: selectedVersion = versions[selectedVersionIndex] || versions[0];
  $: activeTimelineEntry =
    versionsByYear.get(String(selectedYear)) ||
    inactiveTimelineEntry(selectedYear);

  $: orbitMotionHeavy = $headLookStatus === "on";

  function projectPos(angle, extra = 0) {
    const a = (angle * Math.PI) / 180;
    return {
      x: CX + Math.cos(a) * (R + extra),
      y: CY + Math.sin(a) * (R + extra),
    };
  }

  function labelAlign(angle) {
    const cos = Math.cos((angle * Math.PI) / 180);
    if (cos < -0.3) return "right";
    if (cos > 0.3) return "left";
    return "center";
  }

  function handleTimelineMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const progress = 1 - (e.clientY - rect.top) / rect.height;
    const year = Math.round(
      timelineStartYear + progress * (timelineEndYear - timelineStartYear),
    );
    versionYear = Math.max(timelineStartYear, Math.min(timelineEndYear, year));
  }

  function yearFade(year) {
    return Math.max(0.14, 1 - Math.abs(Number(year) - selectedYear) * 0.22);
  }

  function versionTop(year) {
    return (
      100 -
      ((Number(year) - timelineStartYear) /
        (timelineEndYear - timelineStartYear)) *
        100
    );
  }

  function inactiveTimelineEntry(year) {
    return {
      year: String(year),
      title: inactiveMessages[Number(year) % inactiveMessages.length],
      company: "No logged activity",
      period: String(year),
      note: "Nothing official on the timeline.",
      skills: "",
      theme: "quiet",
      inactive: true,
    };
  }

  function clearOrbitEmbedFocus() {
    centerCommittedIndex = null;
  }

  let unsubOrbitDismiss = () => {};

  async function toggleHeadLook() {
    if (get(headLookStatus) === "on") stopHeadLook();
    else await startHeadLook();
  }

  function flashNavToast(msg) {
    navToast = msg;
    if (navToastT) clearTimeout(navToastT);
    navToastT = setTimeout(() => {
      navToast = "";
      navToastT = null;
    }, 2200);
  }

  onMount(() => {
    mounted = true;
    function updateOrbitGeo() {
      setOrbitGeometry(CX, CY, R, window.innerWidth, window.innerHeight);
      stageScale = Math.min(
        (window.innerWidth * 0.9) / 1440,
        (window.innerHeight * 0.9) / 900,
      );
    }
    updateOrbitGeo();
    window.addEventListener("resize", updateOrbitGeo);

    function handleKeyDown(e) {
      if (e.shiftKey && e.key === "T") editing = !editing;
      if (e.shiftKey && e.key === "D") debugMode.update((v) => !v);
    }
    window.addEventListener("keydown", handleKeyDown);

    let lastDismissPulse = 0;
    unsubOrbitDismiss = orbitEmbedDismissPulse.subscribe((n) => {
      if (n > 0 && n !== lastDismissPulse) {
        lastDismissPulse = n;
        clearOrbitEmbedFocus();
      }
    });
    return () => {
      window.removeEventListener("resize", updateOrbitGeo);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  onDestroy(() => {
    unsubOrbitDismiss();
    if (navToastT) clearTimeout(navToastT);
    if (brandHintT) clearTimeout(brandHintT);
    stopHeadLook();
  });

  function handleUpdate(e) {
    t = { ...t, ...e.detail };
  }
</script>

<svelte:head>
  <title>Simo Ngquseka — SWSSR</title>
  <meta
    name="description"
    content="UX/UI designer & developer from Durban, South Africa. Design the product, build the tools."
  />
  <meta property="og:title" content="Simo Ngquseka — SWSSR" />
  <meta
    property="og:description"
    content="UX/UI designer & developer from Durban. Design the product, build the tools."
  />
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<div
  id="stage"
  data-paper={paper}
  data-ink={ink}
  data-ink-mid={inkMid}
  data-ink-soft={inkSoft}
  data-line={line}
  data-line-bold={lineBold}
  data-splash={splash}
  data-motion-active={mounted && $headLookStatus === "on"}
  data-orbit-embed-active={!!committedProject}
  style:--scale-stage={stageScale}
  style="--look-x: {$headLook.x}; --look-y: {$headLook.y}; --orbit-spin-deg: {$orbitSpinDeg}deg; --orbit-scale-gesture: {$orbitGestureScale};"
>
  <div class="soft-grid" aria-hidden="true"></div>

  <nav class="top-nav">
    <span class="brand-mark">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke={ink}
          stroke-width="1.3"
        />
        <circle cx="8" cy="8" r="2.5" fill={splash} />
      </svg>
      <button
        type="button"
        class="brand-name"
        aria-label={t.brand}
        on:click={() => {
          if (brandHintT) clearTimeout(brandHintT);
          brandHintT = setTimeout(() => {
            brandHintT = null;
            flashNavToast("Double-click name");
          }, 340);
        }}
        on:dblclick|preventDefault={async () => {
          if (brandHintT) {
            clearTimeout(brandHintT);
            brandHintT = null;
          }
          if (!mounted || get(headLookStatus) === "loading") return;
          await toggleHeadLook();
        }}
      >
        {t.brand}
      </button>
    </span>
    <span class="nav-links">
      <a class="nav-link nav-link-active" href="/">{t.navIndex}</a>
      <a class="nav-link" href="/">{t.navWork}</a>
      <a class="nav-link" href="/">{t.navWriting}</a>
      <a class="nav-link" href="/">{t.navContact}</a>
    </span>
    <span class="nav-trail">
      {#if navToast}
        <span class="nav-toast" role="status">{navToast}</span>
      {/if}
      <span class="revision">{t.rev}</span>
    </span>
  </nav>
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

  <div class="orbit-gesture-shell">
    <div class="orbit-ticks" aria-hidden="true"></div>

    <svg class="orbit-svg" aria-hidden="true">
      <circle
        class="orbit-ring"
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={lineBold}
        stroke-width={orbitMotionHeavy ? 1.2 : 0.75}
      />
      {#if hover !== null}
        {@const p = t.projects[hover]}
        {@const pos = projectPos(p.angle)}
        <line
          class="orbit-spoke"
          x1={CX}
          y1={CY}
          x2={pos.x}
          y2={pos.y}
          stroke={p.color}
          stroke-width={orbitMotionHeavy ? 1.35 : 0.75}
          stroke-dasharray="3 3"
          opacity="0.7"
        />
      {/if}
      {#each t.projects as p, i}
        {@const pos = projectPos(p.angle)}
        {@const isHover = hover === i}
        <circle
          class="orbit-project-dot"
          cx={pos.x}
          cy={pos.y}
          r={orbitMotionHeavy ? (isHover ? 7 : 5) : isHover ? 6 : 3.5}
          fill={isHover ? p.color : ink}
        />
        {#if isHover}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={orbitMotionHeavy ? 14 : 12}
            fill="none"
            stroke={p.color}
            stroke-width={orbitMotionHeavy ? 1.05 : 0.75}
            opacity="0.5"
          />
        {/if}
      {/each}
    </svg>

    <div class="orbit-center" data-x={CX} data-y={CY}>
      {#if browser}
        {#if hoverProject && !committedProject}
          <div class="center-pane center-hover">
            <HoverScene
              project={hoverProject}
              {ink}
              lookX={$headLook.x}
              lookY={$headLook.y}
              headLookOn={$headLookStatus === "on"}
            />
            <OrbARControls project={hoverProject} {ink} />
          </div>
        {/if}
      {/if}
    </div>

    {#each t.projects as p, i}
      {@const isHover = hover === i}
      <button
        type="button"
        aria-haspopup="dialog"
        on:mouseenter={() => (hover = i)}
        on:mouseleave={() => {}}
        on:click={() => handleProjectLabelActivate(i)}
        class="project-label"
        class:is-link={true}
        data-index={i}
        data-angle={`${p.angle}deg`}
        data-align={labelAlign(p.angle)}
        data-hover={isHover}
        data-color={isHover ? p.color : inkSoft}
      >
        <span class="project-meta">
          {p.n} · {p.tag} <span>{p.year}</span>
        </span>
        <span class="project-title">
          {p.title}
        </span>
      </button>
    {/each}
  </div>

  <footer class="site-footer">
    <span>{t.footerCopyright}</span>
    <span class="footer-status" data-active={footerProject !== null}>
      {footerProject
        ? `${footerProject.n} · ${footerProject.title}`
        : t.footerIdle}
    </span>
    <span class="footer-links">
      {#each footerLinks as l}
        <a href={l.href} target="_blank" rel="noopener noreferrer"
          >{l.label} ↗</a
        >
      {/each}
    </span>
  </footer>
</div>

{#if browser && committedProject}
  <ProjectDetails
    projects={t.projects}
    selectedIndex={centerCommittedIndex}
    on:select={(e) => commitOrToggleOrbitCenter(e.detail)}
    on:close={clearOrbitEmbedFocus}
  />
{/if}

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
      {@const version =
        versionsByYear.get(String(year)) || inactiveTimelineEntry(year)}
      <span
        class="version-card-slot"
        style={`--card-top:${versionTop(version.year)}%`}
      >
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

<noscript>
  <div class="noscript-fallback">
    <h1>Simo Ngquseka — SWSSR</h1>
    <p>
      UX/UI designer &amp; developer from Durban, South Africa. 2026 · <a
        href="mailto:simo@swssr.co">simo@swssr.co</a
      >
    </p>
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
      <li>
        <a href="https://www.linkedin.com/in/swssr">linkedin.com/in/swssr</a>
      </li>
    </ul>
  </div>
</noscript>

{#if editing}
  <TweaksPanel
    {t}
    on:update={handleUpdate}
    on:close={() => (editing = false)}
  />
{/if}

{#if $debugMode && $headLookStatus === "on"}
  <LandmarkDebug />
{/if}
