<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  onMount(() => {
    // Load Three.js globally so HoverScene can use it
    if (browser && !window.THREE) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      document.head.appendChild(s);
    }
  });
</script>

<svelte:head>
  <meta name="p:domain_verify" content="7db4679199f9ff5da00d2e2b5d2bb268" />
  <meta name="yandex-verification" content="15c6a35a530189e4" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <meta name="HandheldFriendly" content="true" />

  <meta property="og:site_name" content="Simo Ngquseka" />
  <meta property="og:url" content="https://www.swssr.co" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://res.cloudinary.com/swssr/image/upload/v1567047311/swssr/rsp5o05tyyzaw1glfqfl.png" />

  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <meta name="apple-mobile-web-app-title" content="Simo Ngquseka" />
  <meta name="msapplication-TileColor" content="#ffffff" />
  <meta name="theme-color" content="#ffffff" />

  <link rel="apple-touch-icon" sizes="180x180" href="/Assets/images/icons/favicons/apple-icon-180x180.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/Assets/images/icons/favicons/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/Assets/images/icons/favicons/favicon-16x16.png" />
  <link rel="manifest" href="/manifest.json" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-121799045-2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-121799045-2');
  </script>

  <!-- Hotjar -->
  <script>
    (function(c,s,q,u,a,r,e){
      c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
      c._hjSettings={hjid:a};r=s.getElementsByTagName('head')[0];
      e=s.createElement('script');e.async=true;
      e.src=q+c._hjSettings.hjid+u;r.appendChild(e);
    })(window,document,'https://static.hj.contentsquare.net/c/csq-','.js',5321467);
  </script>
</svelte:head>

<slot />

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(:root) {
    --mono: 'JetBrains Mono', ui-monospace, monospace;
    --display: 'JetBrains Mono', ui-monospace, monospace;
    --sans: 'Jost', system-ui, sans-serif;
  }
  :global(html, body) {
    background: #fff;
    color: #0B1733;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    text-size-adjust: 100%;
    font-kerning: normal;
    font-optical-sizing: auto;
    overflow: hidden;
    height: 100vh; width: 100vw;
  }
  :global(body) { display: flex; align-items: center; justify-content: center; }
  :global(button, input, textarea, select) { font-family: inherit; }
  :global(a) { color: inherit; text-decoration: none; }

  @media (max-width: 860px), (max-height: 640px) {
    :global(html, body) {
      width: 100%;
      min-height: 100svh;
      height: auto;
      overflow-x: hidden;
      overflow-y: auto;
    }

    :global(body) {
      display: block;
    }
  }
</style>
