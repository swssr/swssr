import { writable } from 'svelte/store';

// ── Stores ─────────────────────────────────────────────────────────
export const headLook               = writable({ x: 0, y: 0 });
export const headLookStatus         = writable('off');
export const debugLandmarks         = writable(null);
export const debugMode              = writable(false);
export const debugStream            = writable(null);
export const orbitSpinDeg           = writable(0);
export const orbitGestureScale      = writable(1);
export const handPointProjectIndex  = writable(null);
export const handDrivingHover       = writable(false);
export const orbitEmbedDismissPulse = writable(0);

// ── Configuration ──────────────────────────────────────────────────
let projectAnglesDeg  = [];
let orbitGeo          = null;
let pinchCommitHandler = () => {};

export function setOrbitProjectAngles(a)          { projectAnglesDeg = [...a]; }
export function setOrbitGeometry(cx, cy, r, w, h) { orbitGeo = { cx, cy, r, viewW: w, viewH: h }; }
export function setOrbitPinchCommitHandler(fn)    { pinchCommitHandler = typeof fn === 'function' ? fn : () => {}; }

// ── MediaPipe ──────────────────────────────────────────────────────
const MP_PKG     = '0.10.35';
const WASM       = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_PKG}/wasm`;
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const WRIST = 0, THUMB_TIP = 4, INDEX_PIP = 6, INDEX_TIP = 8;
const MIDDLE_PIP = 10, MIDDLE_TIP = 12, RING_PIP = 14, RING_TIP = 16, PINKY_PIP = 18, PINKY_TIP = 20;

// ── Tuning ─────────────────────────────────────────────────────────
const PINCH_SPIN_MAX_GAP   = 0.052;
const PINCH_DRAG_PATH_OPEN = 0.088;
// slow baseline so zoom deviation stays readable (was 0.05 — chased gesture and killed contrast)
const ORBIT_ZOOM_BASELINE_LAG   = 0.014;
const ORBIT_ZOOM_DEVIATION_GAIN = 1.22;
const ORBIT_ZOOM_RATIO_MIN      = 0.42;
const ORBIT_ZOOM_RATIO_MAX      = 2.15;
const ORBIT_ZOOM_FOLLOW         = 0.29;
const ORBIT_ZOOM_FOLLOW_CAP     = 0.52;
const ORBIT_ZOOM_RELEASE        = 0.34;
const ORBIT_ZOOM_RELEASE_CAP    = 0.5;
const STOP_PALM_SPIN_DECAY      = 0.835;
const STOP_PALM_TANGENT_DECAY   = 0.58;

// ── Runtime state ──────────────────────────────────────────────────
let faceLm = null, handLm = null, filesetRef = null;
let stream = null, videoEl = null, raf = null, active = false;
let prevLoopTs = null, smoothed = { x: 0, y: 0 };

let spinSmoothedDeg = 0, spinOmega = 0, spinPrevRad = null;
let spreadRef = null, zoomSmooth = 1;

let pinchOrbPrevMid = null, pinchOrbPathSum = 0;
let tangentThrowEMA = 0, pinchSpinGripPrev = false, suppressNextLinkTap = false;

let pinchHeld = false, pinchCooldownUntil = 0;
let hoverStableIdx = null, hoverStreak = 0;
let stopPalmWasActive = false;

let debugEnabled = false;
debugMode.subscribe(v => { debugEnabled = v; if (!v) debugLandmarks.set(null); });

// ── Gesture primitives ─────────────────────────────────────────────
const hypo = (a, b) => Math.hypot(a, b);

function faceCenter(lm) {
  let sx = 0, sy = 0;
  for (const p of lm) { sx += p.x; sy += p.y; }
  const n = lm.length || 1;
  return { x: sx / n, y: sy / n };
}

function mirrorX(lmArr) {
  if (!lmArr?.length) return [];
  return lmArr.map(lm => lm.map(p => ({ ...p, x: 1 - p.x })));
}

function digitExtended(lm, tipIdx, pipIdx, factor = 1.035) {
  const w = lm[WRIST];
  return hypo(lm[tipIdx].x - w.x, lm[tipIdx].y - w.y) >
         hypo(lm[pipIdx].x - w.x, lm[pipIdx].y - w.y) * factor;
}

function isPointing(lm) {
  const distTip = hypo(lm[INDEX_TIP].x - lm[WRIST].x, lm[INDEX_TIP].y - lm[WRIST].y);
  const distPip = hypo(lm[INDEX_PIP].x - lm[WRIST].x, lm[INDEX_PIP].y - lm[WRIST].y);
  return distTip > distPip * 1.05 &&
    hypo(lm[INDEX_TIP].x - lm[THUMB_TIP].x, lm[INDEX_TIP].y - lm[THUMB_TIP].y) > 0.068;
}

function isStopPalm(lm) {
  return digitExtended(lm, INDEX_TIP,  INDEX_PIP)  &&
         digitExtended(lm, MIDDLE_TIP, MIDDLE_PIP) &&
         digitExtended(lm, RING_TIP,   RING_PIP)   &&
         digitExtended(lm, PINKY_TIP,  PINKY_PIP)  &&
    hypo(lm[INDEX_TIP].x - lm[THUMB_TIP].x, lm[INDEX_TIP].y - lm[THUMB_TIP].y) >= 0.078;
}

function pickLeftRight(lmArr, handedNested) {
  const items = lmArr.map((lm, i) => ({ lm, tag: handedNested?.[i]?.[0]?.categoryName || '' }));
  let leftLm  = items.find(it => /^left$/i.test(it.tag))?.lm;
  let rightLm = items.find(it => /^right$/i.test(it.tag))?.lm;
  const byX   = [...items].sort((a, b) => a.lm[WRIST].x - b.lm[WRIST].x);
  if (!leftLm)  leftLm  = byX[0]?.lm;
  if (!rightLm) rightLm = byX[byX.length - 1]?.lm;
  return leftLm && rightLm && leftLm !== rightLm
    ? { leftLm, rightLm } : { leftLm: null, rightLm: null };
}

function bestPinch(lmArr, maxGap) {
  let bestLm = null, bestD = Infinity;
  for (const lm of lmArr) {
    const d = hypo(lm[INDEX_TIP].x - lm[THUMB_TIP].x, lm[INDEX_TIP].y - lm[THUMB_TIP].y);
    if (d < bestD) { bestD = d; bestLm = lm; }
  }
  return bestLm && bestD <= maxGap ? { lm: bestLm } : null;
}

function nearestProject(tipX, tipY) {
  if (!projectAnglesDeg.length) return null;
  if (orbitGeo) {
    const { cx, cy, r, viewW, viewH } = orbitGeo;
    const scale = Math.max(viewW / 640, viewH / 480);
    const offX  = (viewW - 640 * scale) / 2;
    const offY  = (viewH - 480 * scale) / 2;
    const vpx   = tipX * 640 * scale + offX;
    const vpy   = tipY * 480 * scale + offY;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < projectAnglesDeg.length; i++) {
      const rad = projectAnglesDeg[i] * Math.PI / 180;
      const d   = hypo(cx + r * Math.cos(rad) - vpx, cy - r * Math.sin(rad) - vpy);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }
  // orbit geometry not yet set — fall back to angle from screen centre
  const angDeg = -(Math.atan2((tipY - 0.5) * 2, (tipX - 0.5) * 2) * (180 / Math.PI));
  let best = 0, bestDiff = Infinity;
  for (let i = 0; i < projectAnglesDeg.length; i++) {
    let d = projectAnglesDeg[i] - angDeg;
    while (d > 180)  d -= 360;
    while (d < -180) d += 360;
    if (Math.abs(d) < bestDiff) { bestDiff = Math.abs(d); best = i; }
  }
  return best;
}

// ── Tick functions ─────────────────────────────────────────────────
function tickFace(flm) {
  if (!flm?.length) return;
  const { x: ax, y: ay } = faceCenter(flm);
  smoothed.x += ((0.5 - ax) * 2 - smoothed.x) * 0.18;
  smoothed.y += ((0.5 - ay) * 2 - smoothed.y) * 0.18;
  headLook.set({ x: smoothed.x, y: -smoothed.y });
}

function tickOrbit(lmArr, handed, frameNorm, stopActive) {
  let orbitMode = false;

  if (lmArr.length >= 2) {
    const { leftLm, rightLm } = pickLeftRight(lmArr, handed);
    if (leftLm && rightLm) {
      const lw = leftLm[WRIST], rw = rightLm[WRIST];
      const span = hypo(rw.x - lw.x, rw.y - lw.y);
      orbitMode = span > 0.12;
      if (orbitMode) {
        pinchOrbPrevMid = null; pinchOrbPathSum = 0;
        pinchSpinGripPrev = false; tangentThrowEMA *= 0.88;

        if (!spreadRef || spreadRef < 1e-4) spreadRef = span;
        const ratio = Math.min(ORBIT_ZOOM_RATIO_MAX, Math.max(ORBIT_ZOOM_RATIO_MIN,
          1 + (span / spreadRef - 1) * ORBIT_ZOOM_DEVIATION_GAIN));
        spreadRef += (span - spreadRef) * ORBIT_ZOOM_BASELINE_LAG * frameNorm;
        zoomSmooth += (ratio - zoomSmooth) * Math.min(ORBIT_ZOOM_FOLLOW_CAP, ORBIT_ZOOM_FOLLOW * frameNorm);

        const curRad = Math.atan2(rw.y - lw.y, rw.x - lw.x);
        if (spinPrevRad != null && !stopActive) {
          let delta = curRad - spinPrevRad;
          while (delta > Math.PI)  delta -= 2 * Math.PI;
          while (delta < -Math.PI) delta += 2 * Math.PI;
          spinOmega += delta * (180 / Math.PI) * 1.12 * Math.min(1.4, frameNorm);
          spinOmega = Math.max(-38, Math.min(38, spinOmega));
        }
        spinPrevRad = curRad;
      }
    }
  }

  if (!orbitMode) {
    spinPrevRad = null; spreadRef = null;
    zoomSmooth += (1 - zoomSmooth) * Math.min(ORBIT_ZOOM_RELEASE_CAP, ORBIT_ZOOM_RELEASE * frameNorm);
    if (Math.abs(zoomSmooth - 1) < 0.0055) zoomSmooth = 1;
  }

  let gripActive = orbitMode;
  if (!orbitMode) {
    if (!lmArr.length) {
      pinchSpinGripPrev = false; pinchOrbPrevMid = null; pinchOrbPathSum = 0;
    } else {
      const pin = bestPinch(lmArr, PINCH_SPIN_MAX_GAP);
      const wasPinch = pinchSpinGripPrev;
      if (pin) {
        gripActive = true;
        const { lm } = pin;
        const mx = (lm[INDEX_TIP].x + lm[THUMB_TIP].x) * 0.5;
        const my = (lm[INDEX_TIP].y + lm[THUMB_TIP].y) * 0.5;
        const rx = mx - 0.5, ry = my - 0.5, rLen = hypo(rx, ry);
        if (!wasPinch) {
          pinchOrbPathSum = 0; tangentThrowEMA *= 0.55;
          pinchOrbPrevMid = { x: mx, y: my };
        } else if (pinchOrbPrevMid && rLen > 0.024) {
          const vx = mx - pinchOrbPrevMid.x, vy = my - pinchOrbPrevMid.y;
          pinchOrbPathSum += hypo(vx, vy);
          if (!stopActive) {
            const tanInst = (rx * vy - ry * vx) * 620 / rLen;
            spinOmega += tanInst * 0.155 * Math.min(1.3, frameNorm);
            spinOmega = Math.max(-42, Math.min(42, spinOmega));
            tangentThrowEMA += (tanInst - tangentThrowEMA) * 0.42;
          }
          pinchOrbPrevMid = { x: mx, y: my };
        } else if (pinchOrbPrevMid) {
          pinchOrbPrevMid = { x: mx, y: my };
        }
      } else if (wasPinch) {
        if (pinchOrbPathSum >= PINCH_DRAG_PATH_OPEN) suppressNextLinkTap = true;
        if (!stopActive) {
          spinOmega += Math.max(-26, Math.min(26, tangentThrowEMA * 0.7));
          tangentThrowEMA *= 0.22;
          spinOmega = Math.max(-44, Math.min(44, spinOmega));
        }
        pinchOrbPrevMid = null; pinchOrbPathSum = 0;
      }
      pinchSpinGripPrev = !!pin;
    }
  }

  const friction = (gripActive ? Math.pow(0.987, frameNorm) : Math.pow(0.942, frameNorm))
    * (stopActive ? Math.pow(STOP_PALM_SPIN_DECAY, frameNorm) : 1);
  if (stopActive) tangentThrowEMA *= Math.pow(STOP_PALM_TANGENT_DECAY, frameNorm);
  spinOmega *= friction;
  if (Math.abs(spinOmega) < 0.04) spinOmega = 0;
  spinSmoothedDeg += spinOmega * Math.min(1.15, frameNorm);

  orbitSpinDeg.set(spinSmoothedDeg);
  orbitGestureScale.set(zoomSmooth);
  return orbitMode;
}

function tickHover(lmArr, orbitMode, nowTap) {
  if (orbitMode || !lmArr.length) {
    pinchHeld = false; hoverStreak = 0; hoverStableIdx = null;
    handDrivingHover.set(false); handPointProjectIndex.set(null);
    return;
  }

  const pointingHand = lmArr.find(isPointing);
  const aimIdx = pointingHand
    ? nearestProject(pointingHand[INDEX_TIP].x, pointingHand[INDEX_TIP].y)
    : null;

  if (aimIdx != null) {
    if (aimIdx === hoverStableIdx) hoverStreak++;
    else { hoverStableIdx = aimIdx; hoverStreak = 0; }
  } else {
    hoverStreak = Math.max(0, hoverStreak - 2);
  }

  if (hoverStreak >= 3 && hoverStableIdx != null) {
    handPointProjectIndex.set(hoverStableIdx);
    handDrivingHover.set(true);
  } else {
    handDrivingHover.set(aimIdx != null && hoverStableIdx !== null && hoverStreak >= 2);
  }

  const hand = pointingHand ?? lmArr[0];
  const pinchDist = hypo(hand[INDEX_TIP].x - hand[THUMB_TIP].x, hand[INDEX_TIP].y - hand[THUMB_TIP].y);

  if (pinchDist < 0.032 && hoverStableIdx != null && hoverStreak >= 3) {
    pinchHeld = true;
  } else if (pinchHeld && pinchDist > 0.055 && hoverStableIdx != null) {
    pinchHeld = false;
    if (suppressNextLinkTap) {
      suppressNextLinkTap = false;
    } else if (nowTap > pinchCooldownUntil && typeof hoverStableIdx === 'number') {
      pinchCommitHandler(hoverStableIdx);
      pinchCooldownUntil = nowTap + 850;
    }
  }
}

// ── MediaPipe init ─────────────────────────────────────────────────
async function makeMarkers() {
  const { FaceLandmarker, HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  filesetRef = await FilesetResolver.forVisionTasks(WASM);

  const buildFace = delegate => FaceLandmarker.createFromOptions(filesetRef, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate },
    runningMode: 'VIDEO', numFaces: 1,
  });
  const buildHand = delegate => HandLandmarker.createFromOptions(filesetRef, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate },
    runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.45,
  });

  let delegate = 'GPU', face;
  try { face = await buildFace(delegate); }
  catch { delegate = 'CPU'; face = await buildFace(delegate); }
  return { face, hand: await buildHand(delegate) };
}

// ── Lifecycle ──────────────────────────────────────────────────────
function resetState() {
  spinSmoothedDeg = 0; spinOmega = 0; spinPrevRad = null;
  spreadRef = null; zoomSmooth = 1; prevLoopTs = null;
  pinchHeld = false; hoverStableIdx = null; hoverStreak = 0;
  pinchOrbPrevMid = null; pinchOrbPathSum = 0;
  tangentThrowEMA = 0; pinchSpinGripPrev = false;
  suppressNextLinkTap = false; stopPalmWasActive = false;
  orbitSpinDeg.set(0); orbitGestureScale.set(1);
  handPointProjectIndex.set(null); handDrivingHover.set(false);
}

export async function startHeadLook() {
  if (typeof window === 'undefined' || active) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  headLookStatus.set('loading');
  try {
    const { face, hand } = await makeMarkers();
    faceLm = face; handLm = hand;
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    videoEl = document.createElement('video');
    videoEl.srcObject = stream; videoEl.playsInline = true; videoEl.muted = true;
    await videoEl.play();
    debugStream.set(stream);
    active = true; resetState(); headLookStatus.set('on');

    const loop = ts => {
      if (!active) return;
      raf = requestAnimationFrame(loop);
      if (videoEl.readyState < 2) return;

      const frameNorm = prevLoopTs == null ? 1 : Math.min(2.4, (ts - prevLoopTs) / (1000 / 60));
      prevLoopTs = ts;

      const f       = faceLm.detectForVideo(videoEl, ts);
      const h       = handLm.detectForVideo(videoEl, ts);
      const handsRaw = h.landmarks || [];
      const handed   = h.handedness ?? h.handednesses ?? [];
      const lmArr    = mirrorX(handsRaw);
      const stopActive = lmArr.some(isStopPalm);

      tickFace(f.faceLandmarks?.[0]);
      const orbitMode = tickOrbit(lmArr, handed, frameNorm, stopActive);
      tickHover(lmArr, orbitMode, ts);

      if (stopActive && !stopPalmWasActive) orbitEmbedDismissPulse.update(n => n + 1);
      stopPalmWasActive = stopActive;

      if (debugEnabled) debugLandmarks.set({
        face: f.faceLandmarks?.[0] ?? null,
        hands: handsRaw, handedness: handed,
        videoW: videoEl.videoWidth || 640, videoH: videoEl.videoHeight || 480,
      });
    };

    raf = requestAnimationFrame(loop);
  } catch {
    stopInternal();
    headLookStatus.set('error');
  }
}

function stopInternal() {
  active = false;
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; debugStream.set(null); }
  if (videoEl) { videoEl.srcObject = null; videoEl = null; }
  faceLm?.close?.(); handLm?.close?.();
  faceLm = null; handLm = null; filesetRef = null;
  smoothed = { x: 0, y: 0 };
  headLook.set({ x: 0, y: 0 });
  resetState();
}

export function stopHeadLook() {
  stopInternal();
  headLookStatus.set('off');
}
