<script>
  import { onMount, onDestroy } from 'svelte';
  import { debugLandmarks, debugStream } from './headParallax.js';

  let videoEl;
  let canvas;
  let ctx;
  let raf;
  let latestData = null;

  $: if (videoEl && $debugStream) { videoEl.srcObject = $debugStream; videoEl.play(); }
  $: if (videoEl && !$debugStream) videoEl.srcObject = null;

  const KEY_HAND = [0, 4, 8, 12, 16, 20];
  const CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],
    [5,9],[9,13],[13,17],
  ];

  // Landmarks are in raw (un-mirrored) video space [0,1].
  // We flip the canvas context so both video frame and dots are mirrored together.
  function px(x, W) { return (1 - x) * W; }
  function py(y, H) { return y * H; }

  function loop() {
    if (!ctx || !canvas) return;
    raf = requestAnimationFrame(loop);

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // draw mirrored video frame
    if (videoEl?.readyState >= 2) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, -W, 0, W, H);
      ctx.restore();
    }

    const data = latestData;
    if (!data) return;

    if (data.face?.length) {
      ctx.fillStyle = 'rgba(0,255,220,0.7)';
      for (const p of data.face) {
        ctx.beginPath();
        ctx.arc(px(p.x, W), py(p.y, H), 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let hi = 0; hi < data.hands.length; hi++) {
      const lm = data.hands[hi];
      const label = data.handedness?.[hi]?.[0]?.categoryName ?? '';
      const isLeft = /^left$/i.test(label);
      const color = isLeft ? '#FF5722' : '#00E5FF';

      ctx.strokeStyle = color + '99';
      ctx.lineWidth = 1.2;
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(px(lm[a].x, W), py(lm[a].y, H));
        ctx.lineTo(px(lm[b].x, W), py(lm[b].y, H));
        ctx.stroke();
      }

      ctx.fillStyle = color + 'bb';
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(px(p.x, W), py(p.y, H), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (const idx of KEY_HAND) {
        const p = lm[idx];
        ctx.beginPath();
        ctx.arc(px(p.x, W), py(p.y, H), 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(label || `hand${hi}`, px(lm[0].x, W) + 6, py(lm[0].y, H) - 4);
    }
  }

  let unsub;

  onMount(() => {
    ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    unsub = debugLandmarks.subscribe(data => { latestData = data; });

    loop();

    return () => window.removeEventListener('resize', resize);
  });

  onDestroy(() => {
    unsub?.();
    cancelAnimationFrame(raf);
  });
</script>

<!-- hidden video used only as canvas image source -->
<video bind:this={videoEl} autoplay muted playsinline class="debug-video-src" />
<canvas bind:this={canvas} class="debug-canvas" />

<style>
  .debug-video-src {
    display: none;
  }

  .debug-canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
  }
</style>
