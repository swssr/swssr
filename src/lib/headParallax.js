import { writable } from 'svelte/store';

export const headLook = writable({ x: 0, y: 0 });
export const headLookStatus = writable('off');

export const orbitSpinDeg = writable(0);
/** Smoothed ~0.78–1.32 from two‑wrist separation */
export const orbitGestureScale = writable(1);
export const handPointProjectIndex = writable(null);
export const handDrivingHover = writable(false);

/** @returns {string|null} */
let projectOpenResolver = () => null;

export function setOrbitProjectOpenResolver(fn) {
  projectOpenResolver = typeof fn === 'function' ? fn : () => null;
}

const MP_PKG = '0.10.35';
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_PKG}/wasm`;
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_PIP = 6;
const INDEX_TIP = 8;

/** @type {number[]} */
let projectAnglesDeg = [];

export function setOrbitProjectAngles(anglesDeg) {
  projectAnglesDeg = [...anglesDeg];
}

let faceLm = null;
let handLm = null;
let filesetRef = null;
let stream = null;
let videoEl = null;
let raf = null;
let smoothed = { x: 0, y: 0 };
let active = false;

let spinSmoothedDeg = 0;
let spinPrevRad = null;
let spreadRef = null;
let zoomSmooth = 1;

let pinchHeld = false;
let pinchCooldownUntil = 0;
let hoverStableIdx = null;
let hoverStreak = 0;

async function makeMarkers() {
  const { FaceLandmarker, HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  filesetRef = await FilesetResolver.forVisionTasks(WASM);

  async function buildFace(delegate) {
    return FaceLandmarker.createFromOptions(filesetRef, {
      baseOptions: { modelAssetPath: FACE_MODEL, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  }

  async function buildHand(delegate) {
    return HandLandmarker.createFromOptions(filesetRef, {
      baseOptions: { modelAssetPath: HAND_MODEL, delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.45,
    });
  }

  let delegate = 'GPU';
  let face;
  try {
    face = await buildFace(delegate);
  } catch {
    delegate = 'CPU';
    face = await buildFace(delegate);
  }
  const hand = await buildHand(delegate);
  return { face, hand };
}

function faceCenter(lm) {
  let sx = 0;
  let sy = 0;
  for (const p of lm) sx += p.x;
  for (const p of lm) sy += p.y;
  const n = lm.length || 1;
  return { x: sx / n, y: sy / n };
}

function hypo(a, b) {
  return Math.hypot(a, b);
}

function nearestProjectIndex(angleDeg) {
  const angles = projectAnglesDeg;
  if (!angles.length) return null;
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < angles.length; i++) {
    let d = angles[i] - angleDeg;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    const ad = Math.abs(d);
    if (ad < bestDiff) {
      bestDiff = ad;
      best = i;
    }
  }
  if (bestDiff > 52) return null;
  return best;
}

function isPointing(lm) {
  const wrist = lm[WRIST];
  const tip = lm[INDEX_TIP];
  const pip = lm[INDEX_PIP];
  const distTip = hypo(tip.x - wrist.x, tip.y - wrist.y);
  const distPip = hypo(pip.x - wrist.x, pip.y - wrist.y);
  const pinchDist = hypo(tip.x - lm[THUMB_TIP].x, tip.y - lm[THUMB_TIP].y);
  const extended = distTip > distPip * 1.05;
  const notPinching = pinchDist > 0.068;
  return extended && notPinching;
}

function pickLeftRightHands(lmArr, handedNested) {
  const items = lmArr.map((lm, i) => ({
    lm,
    tag: handedNested?.[i]?.[0]?.categoryName || '',
  }));
  let leftLm = items.find(it => /^left$/i.test(it.tag))?.lm;
  let rightLm = items.find(it => /^right$/i.test(it.tag))?.lm;
  const byX = [...items].sort((a, b) => a.lm[WRIST].x - b.lm[WRIST].x);
  if (!leftLm) leftLm = byX[0]?.lm;
  if (!rightLm) rightLm = byX[byX.length - 1]?.lm;
  if (leftLm && rightLm && leftLm !== rightLm) return { leftLm, rightLm };
  return { leftLm: null, rightLm: null };
}

function resetGestureState() {
  spinSmoothedDeg = 0;
  spinPrevRad = null;
  spreadRef = null;
  zoomSmooth = 1;
  pinchHeld = false;
  hoverStableIdx = null;
  hoverStreak = 0;
  orbitSpinDeg.set(0);
  orbitGestureScale.set(1);
  handPointProjectIndex.set(null);
  handDrivingHover.set(false);
}

export async function startHeadLook() {
  if (typeof window === 'undefined' || active) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  headLookStatus.set('loading');
  try {
    const { face, hand } = await makeMarkers();
    faceLm = face;
    handLm = hand;
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    videoEl = document.createElement('video');
    videoEl.srcObject = stream;
    videoEl.playsInline = true;
    videoEl.muted = true;
    await videoEl.play();

    active = true;
    resetGestureState();
    headLookStatus.set('on');

    const loop = ts => {
      if (!active || !faceLm || !handLm || !videoEl) return;
      if (videoEl.readyState >= 2) {
        const f = faceLm.detectForVideo(videoEl, ts);
        const h = handLm.detectForVideo(videoEl, ts);
        const flm = f.faceLandmarks?.[0];
        if (flm?.length) {
          const { x: ax, y: ay } = faceCenter(flm);
          const rawX = (0.5 - ax) * 2;
          const rawY = (0.5 - ay) * 2;
          const kv = 0.18;
          smoothed.x += (rawX - smoothed.x) * kv;
          smoothed.y += (rawY - smoothed.y) * kv;
          headLook.set({ x: -smoothed.x, y: -smoothed.y });
        }

        const lmArr = h.landmarks || [];
        const handed = h.handedness ?? h.handednesses ?? [];

        let orbitMode = false;
        if (lmArr.length >= 2) {
          const { leftLm, rightLm } = pickLeftRightHands(lmArr, handed);
          if (leftLm && rightLm && leftLm !== rightLm) {
            const lw = leftLm[WRIST];
            const rw = rightLm[WRIST];
            const wristSpan = hypo(rw.x - lw.x, rw.y - lw.y);
            orbitMode = wristSpan > 0.12;
            if (orbitMode) {
              if (spreadRef == null || spreadRef < 1e-4) spreadRef = wristSpan;
              const ratioRaw = wristSpan / spreadRef;
              const ratio = Math.min(1.38, Math.max(0.74, ratioRaw));
              zoomSmooth += (ratio - zoomSmooth) * 0.13;
              spreadRef += (wristSpan - spreadRef) * 0.05;

              const curRad = Math.atan2(rw.y - lw.y, rw.x - lw.x);
              if (spinPrevRad != null) {
                let delta = curRad - spinPrevRad;
                while (delta > Math.PI) delta -= 2 * Math.PI;
                while (delta < -Math.PI) delta += 2 * Math.PI;
                spinSmoothedDeg -= delta * (180 / Math.PI) * 1.08;
              }
              spinPrevRad = curRad;
            }
          }
        }

        if (!orbitMode) {
          spinPrevRad = null;
          spreadRef = null;
          zoomSmooth += (1 - zoomSmooth) * 0.11;
          if (Math.abs(zoomSmooth - 1) < 0.004) zoomSmooth = 1;
        }

        orbitSpinDeg.set(spinSmoothedDeg);
        orbitGestureScale.set(zoomSmooth);

        const nowTap = typeof performance !== 'undefined' ? performance.now() : ts;

        if (orbitMode) {
          pinchHeld = false;
          hoverStreak = 0;
          hoverStableIdx = null;
          handDrivingHover.set(false);
          handPointProjectIndex.set(null);
        } else if (lmArr.length >= 1) {
          let aimIdx = null;
          let aiming = false;
          for (let hi = 0; hi < lmArr.length && !aiming; hi++) {
            const cand = lmArr[hi];
            if (!isPointing(cand)) continue;
            const tip = cand[INDEX_TIP];
            const angDeg =
              -(Math.atan2((tip.y - 0.5) * 2, (tip.x - 0.5) * 2) * (180 / Math.PI));
            const ni = nearestProjectIndex(angDeg);
            if (ni != null) {
              aiming = true;
              aimIdx = ni;
              break;
            }
          }

          if (aiming && aimIdx != null) {
            if (aimIdx === hoverStableIdx) hoverStreak++;
            else {
              hoverStableIdx = aimIdx;
              hoverStreak = 0;
            }
          } else {
            hoverStreak = Math.max(0, hoverStreak - 2);
          }

          if (hoverStreak >= 3 && hoverStableIdx != null) {
            handPointProjectIndex.set(hoverStableIdx);
            handDrivingHover.set(true);
          } else {
            handDrivingHover.set(aiming && hoverStableIdx !== null && hoverStreak >= 2);
          }

          let pinchHand = lmArr[0];
          for (let hi = 0; hi < lmArr.length; hi++) {
            if (isPointing(lmArr[hi])) {
              pinchHand = lmArr[hi];
              break;
            }
          }
          const pinchDist = hypo(
            pinchHand[INDEX_TIP].x - pinchHand[THUMB_TIP].x,
            pinchHand[INDEX_TIP].y - pinchHand[THUMB_TIP].y,
          );

          if (pinchDist < 0.032 && hoverStableIdx != null && hoverStreak >= 3) pinchHeld = true;
          else if (pinchHeld && pinchDist > 0.055 && hoverStableIdx != null && hoverStreak >= 3) {
            pinchHeld = false;
            if (nowTap > pinchCooldownUntil && typeof hoverStableIdx === 'number') {
              const url = projectOpenResolver(hoverStableIdx);
              if (url && typeof window !== 'undefined')
                window.open(url, '_blank', 'noopener');
              pinchCooldownUntil = nowTap + 850;
            }
          }
        } else {
          pinchHeld = false;
          hoverStreak = 0;
          hoverStableIdx = null;
          handDrivingHover.set(false);
          handPointProjectIndex.set(null);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
  } catch {
    stopHeadLookInternal();
    headLookStatus.set('error');
  }
}

function stopHeadLookInternal() {
  active = false;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
    videoEl = null;
  }
  faceLm?.close?.();
  handLm?.close?.();
  faceLm = null;
  handLm = null;
  filesetRef = null;
  smoothed = { x: 0, y: 0 };
  headLook.set({ x: 0, y: 0 });
  resetGestureState();
}

export function stopHeadLook() {
  stopHeadLookInternal();
  headLookStatus.set('off');
}
