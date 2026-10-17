import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId } from "react";
import type { KickPoint } from "../../logic/recommend";

type Point = { x: number; y: number };

const HEEL: Point = { x: 104, y: 164 };
const TOP: Point = { x: 40, y: 18 };
const MAX_BOW = 30;
const REST_BEND = 0.7;

// Where the bend sits along the shaft (0 = heel, 1 = top) and how strongly each part bows.
const PROFILES: Record<KickPoint, { z1: number; z2: number; k1: number; k2: number; zone: [number, number]; load: number; snap: number }> = {
  low: { z1: 0.08, z2: 0.3, k1: 1.05, k2: 0.75, zone: [6, 40], load: 0.26, snap: 0.09 },
  hybrid: { z1: 0.2, z2: 0.52, k1: 0.95, k2: 0.9, zone: [14, 62], load: 0.36, snap: 0.12 },
  mid: { z1: 0.38, z2: 0.66, k1: 1, k2: 1, zone: [34, 70], load: 0.48, snap: 0.16 },
};

const chord = { x: TOP.x - HEEL.x, y: TOP.y - HEEL.y };
const chordLength = Math.hypot(chord.x, chord.y);
// The shaft bows forward, toward the target on the right.
const normal = { x: -chord.y / chordLength, y: chord.x / chordLength };

function controls(kick: KickPoint, bend: number): [Point, Point, Point, Point] {
  const p = PROFILES[kick];
  const bow = bend * MAX_BOW;
  const at = (z: number, k: number) => ({
    x: HEEL.x + chord.x * z + normal.x * bow * k,
    y: HEEL.y + chord.y * z + normal.y * bow * k,
  });
  return [HEEL, at(p.z1, p.k1), at(p.z2, p.k2), TOP];
}

export function shaftPath(kick: KickPoint, bend: number): string {
  const [a, b, c, d] = controls(kick, bend);
  const f = (n: number) => n.toFixed(2);
  return `M${f(a.x)} ${f(a.y)} C${f(b.x)} ${f(b.y)} ${f(c.x)} ${f(c.y)} ${f(d.x)} ${f(d.y)}`;
}

function pointAt(kick: KickPoint, bend: number, t: number): Point {
  const [a, b, c, d] = controls(kick, bend);
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

const BLADE = `M${HEEL.x - 4} ${HEEL.y - 5} Q${HEEL.x - 2} ${HEEL.y + 5} ${HEEL.x + 8} ${HEEL.y + 5} L${HEEL.x + 50} ${HEEL.y + 5} Q${HEEL.x + 58} ${HEEL.y + 5} ${HEEL.x + 57} ${HEEL.y - 1} Q${HEEL.x + 56} ${HEEL.y - 5} ${HEEL.x + 48} ${HEEL.y - 4} L${HEEL.x + 6} ${HEEL.y - 3} Z`;

/**
 * A stick in the middle of a shot, bending at its kick point. Changing `shotToken` plays a
 * shot: the shaft loads, snaps back and the puck flies off. Low kick sticks release fastest.
 */
export function KickShot({ kick, shotToken, accent }: { kick: KickPoint; shotToken: number; accent: boolean }) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const bend = useMotionValue(REST_BEND);
  const puckX = useMotionValue(0);
  const puckOpacity = useMotionValue(1);
  const d = useTransform(bend, (b) => shaftPath(kick, b));
  const topHand = useTransform(bend, (b) => pointAt(kick, b, 0.95));
  const lowHand = useTransform(bend, (b) => pointAt(kick, b, 0.56));
  const topX = useTransform(topHand, (p) => p.x);
  const topY = useTransform(topHand, (p) => p.y);
  const lowX = useTransform(lowHand, (p) => p.x);
  const lowY = useTransform(lowHand, (p) => p.y);
  const profile = PROFILES[kick];

  useEffect(() => {
    if (shotToken === 0 || reduceMotion) return;
    const total = profile.load + profile.snap + 0.5;
    const controlsBend = animate(bend, [REST_BEND, 1.15, -0.28, 0.08, 0, REST_BEND], {
      duration: total + 0.6,
      times: [
        0,
        profile.load / (total + 0.6),
        (profile.load + profile.snap) / (total + 0.6),
        (profile.load + profile.snap + 0.12) / (total + 0.6),
        (profile.load + profile.snap + 0.3) / (total + 0.6),
        1,
      ],
      ease: ["easeIn", "easeOut", "easeInOut", "easeOut", "easeInOut"],
    });
    const releaseAt = profile.load + profile.snap * 0.6;
    const controlsPuck = animate(puckX, [0, 0, 150, 150, 0], {
      duration: total + 0.9,
      times: [0, releaseAt / (total + 0.9), (releaseAt + 0.3) / (total + 0.9), 0.97, 1],
      ease: ["linear", "easeOut", "linear", "linear"],
    });
    const controlsFade = animate(puckOpacity, [1, 1, 0, 0, 1], {
      duration: total + 0.9,
      times: [0, (releaseAt + 0.12) / (total + 0.9), (releaseAt + 0.3) / (total + 0.9), 0.97, 1],
    });
    return () => {
      controlsBend.stop();
      controlsPuck.stop();
      controlsFade.stop();
    };
  }, [shotToken, reduceMotion, bend, puckX, puckOpacity, profile]);

  const [from, to] = profile.zone;
  return (
    <svg className="kick-shot" viewBox="0 0 220 186" aria-hidden="true" data-accent={accent || undefined}>
      <defs>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id={`${uid}-ice`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ice-floor)" />
          <stop offset="1" stopColor="var(--ice-floor)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={HEEL.y + 5} width="220" height="18" fill={`url(#${uid}-ice)`} />
      <line x1="0" x2="220" y1={HEEL.y + 5} y2={HEEL.y + 5} className="figure-floor" />
      {/* Where it bends: a soft glow, then a crisp band */}
      <motion.path d={d} pathLength={100} strokeDasharray={`${to - from} 200`} strokeDashoffset={-from} className="kick-glow" filter={`url(#${uid}-glow)`} />
      <motion.path d={d} className="kick-shaft" />
      <motion.path d={d} pathLength={100} strokeDasharray={`${to - from} 200`} strokeDashoffset={-from} className="kick-zone" />
      <path d={BLADE} className="kick-blade" />
      <motion.ellipse cx={HEEL.x + 66} cy={HEEL.y + 1.5} rx="10" ry="4" className="kick-puck" style={{ x: puckX, opacity: puckOpacity }} />
      <motion.circle cx={topX} cy={topY} r="7" className="kick-glove" />
      <motion.circle cx={lowX} cy={lowY} r="7" className="kick-glove" />
    </svg>
  );
}

/** A tiny bent shaft with its kick zone, for table headers and lists. */
export function KickGlyph({ kick }: { kick: KickPoint }) {
  const [from, to] = PROFILES[kick].zone;
  const d = shaftPath(kick, 1);
  return (
    <svg className="kick-glyph" viewBox="20 8 120 170" aria-hidden="true">
      <path d={d} className="kick-glyph-shaft" />
      <path d={d} pathLength={100} strokeDasharray={`${to - from} 200`} strokeDashoffset={-from} className="kick-glyph-zone" />
      <path d={`M${HEEL.x} ${HEEL.y} L${HEEL.x + 34} ${HEEL.y + 2}`} className="kick-glyph-shaft" />
    </svg>
  );
}
