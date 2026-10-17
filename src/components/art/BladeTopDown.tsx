import { useId } from "react";
import type { Curve } from "../../data/curves";

const HEEL = { x: 42, y: 86 };
const LENGTH = 168;
const STEPS = 48;

type Sample = { x: number; y: number; angle: number };

/** Points along a blade seen from above: straight from the heel, turning around `bendAt`. */
function blade(bendAt: number, depth: number): Sample[] {
  const samples: Sample[] = [];
  const segment = LENGTH / STEPS;
  let { x, y } = HEEL;
  for (let i = 0; i <= STEPS; i++) {
    const s = i / STEPS;
    // The blade turns smoothly around the bend; deeper curves turn further.
    const angle = depth * 1.05 * (1 / (1 + Math.exp(-(s - bendAt) * 9)));
    samples.push({ x, y, angle });
    x += Math.cos(angle) * segment;
    y -= Math.sin(angle) * segment;
  }
  return samples;
}

const toPath = (samples: Sample[]) => samples.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/**
 * A blade seen from above, lying on the ice, with a puck sitting in its pocket.
 * The dashed line is a straight blade, for comparison.
 */
export function BladeTopDown({ curve, heel, toe, accent }: { curve: Curve; heel: string; toe: string; accent: boolean }) {
  const uid = useId().replace(/:/g, "");
  const samples = blade(curve.bendAt, curve.depth);
  const path = toPath(samples);
  // The puck sits in front of the blade where it curves most.
  const pocket = samples[Math.round(Math.min(0.85, curve.bendAt) * STEPS)];
  const puck = {
    x: pocket.x - Math.sin(pocket.angle) * 16,
    y: pocket.y - Math.cos(pocket.angle) * 16,
  };
  const toePoint = samples[STEPS];

  return (
    <svg className="blade-top" viewBox="0 0 230 116" aria-hidden="true" data-accent={accent || undefined}>
      <defs>
        <linearGradient id={`${uid}-shaft`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--shaft-hi)" />
          <stop offset="1" stopColor="var(--shaft-lo)" />
        </linearGradient>
        <radialGradient id={`${uid}-puck`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#3a3f48" />
          <stop offset="1" stopColor="#0d0f13" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect x="2" y="2" width="226" height="112" rx="12" className="blade-ice" />
      {/* Skate scratches */}
      <path d="M20 30 C70 22 120 34 200 18 M30 102 C90 96 150 108 214 96 M14 64 C40 58 60 66 90 60" className="blade-scratch" />

      <path d={`M${HEEL.x} ${HEEL.y} L${HEEL.x + LENGTH} ${HEEL.y}`} className="blade-ghost" />

      {/* Shadows */}
      <path d={path} className="blade-shadow" filter={`url(#${uid}-shadow)`} transform="translate(2 4)" />
      <circle cx={puck.x + 2} cy={puck.y + 3} r="10" className="blade-shadow-fill" filter={`url(#${uid}-shadow)`} />

      {/* The shaft rises toward the player, so from above it is a short, foreshortened bar. */}
      <path d={`M${HEEL.x - 5} ${HEEL.y + 4} L${HEEL.x + 5} ${HEEL.y - 2} L${HEEL.x - 16} ${HEEL.y - 46} L${HEEL.x - 30} ${HEEL.y - 38} Z`} fill={`url(#${uid}-shaft)`} />

      <path d={path} className="blade-edge" />
      <path d={path} className="blade-tape" />
      <path d={path} className="blade-tape-wrap" />

      <circle cx={puck.x} cy={puck.y} r="10" fill={`url(#${uid}-puck)`} />
      <circle cx={puck.x} cy={puck.y} r="7" className="blade-puck-ring" />

      <text x={HEEL.x} y="108" textAnchor="middle" className="blade-caption">
        {heel}
      </text>
      <text x={Math.min(214, toePoint.x + 4)} y={toePoint.y - 12} textAnchor="middle" className="blade-caption">
        {toe}
      </text>
    </svg>
  );
}

/** The blade seen from the toe end: tilted back is open (lifts the puck), forward is closed. */
export function FaceIcon({ face }: { face: "open" | "slightlyOpen" | "closed" }) {
  const tilt = { open: -24, slightlyOpen: -11, closed: 14 }[face];
  return (
    <svg className="face-icon" viewBox="0 0 34 30" aria-hidden="true">
      <line x1="2" x2="32" y1="26" y2="26" className="face-icon-ice" />
      <g transform={`rotate(${tilt} 14 26)`}>
        <rect x="12" y="6" width="4.5" height="20" rx="2.2" className="face-icon-blade" />
      </g>
      <ellipse cx="23.5" cy="24.2" rx="4" ry="1.8" className="face-icon-puck" />
    </svg>
  );
}
