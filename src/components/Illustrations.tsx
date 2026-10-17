import { useState, type CSSProperties } from "react";
import type { Curve } from "../data/curves";
import type { KickPoint } from "../logic/recommend";

/** Points along a blade seen from above: straight from the heel, bending around `bendAt`. */
function bladePoints(bendAt: number, depth: number): [number, number][] {
  const points: [number, number][] = [];
  const steps = 40;
  const segment = 170 / steps;
  let x = 20;
  let y = 70;
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    // The direction turns smoothly around the bend; deeper curves turn further.
    const turn = depth * 1.1 * (1 / (1 + Math.exp(-(s - bendAt) * 8)));
    points.push([x, y]);
    x += Math.cos(turn) * segment;
    y -= Math.sin(turn) * segment;
  }
  return points;
}

export function CurveDrawing({ curve, heel, toe }: { curve: Curve; heel: string; toe: string }) {
  const points = bladePoints(curve.bendAt, curve.depth);
  const straight = `M20 70 L190 70`;
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className="curve-drawing" viewBox="0 0 210 92" aria-hidden="true">
      <path d={straight} className="curve-ghost" />
      <path d={path} className="curve-blade" />
      <circle cx="20" cy="70" r="6" className="curve-heel" />
      <text x="20" y="88" className="curve-caption" textAnchor="start">
        {heel}
      </text>
      <text x="190" y="88" className="curve-caption" textAnchor="end">
        {toe}
      </text>
    </svg>
  );
}

/**
 * A player figure with the stick standing next to them. The band between chin and nose
 * is the target zone; the stick top lands at `ratio` of that band.
 */
export function LengthFigure({ ratio, chin, nose }: { ratio: number; chin: string; nose: string }) {
  // The head circle spans y 16–60: nose about two thirds down, chin at the bottom.
  const chinY = 60;
  const noseY = 44;
  const stickTop = chinY - (chinY - noseY) * ratio;
  return (
    <svg className="length-figure" viewBox="0 0 220 300" aria-hidden="true">
      <line x1="0" y1="292" x2="220" y2="292" className="figure-floor" />
      <rect x="0" y={noseY} width="220" height={chinY - noseY} className="figure-band" />
      <line x1="0" y1={noseY} x2="220" y2={noseY} className="figure-guide" />
      <line x1="0" y1={chinY} x2="220" y2={chinY} className="figure-guide" />
      <text x="216" y={noseY - 4} textAnchor="end" className="figure-caption">
        {nose}
      </text>
      <text x="216" y={chinY + 14} textAnchor="end" className="figure-caption">
        {chin}
      </text>
      {/* Player */}
      <g className="figure-body">
        <circle cx="70" cy="38" r="22" />
        <path d="M44 72 Q70 60 96 72 L104 170 L92 172 L90 290 L74 290 L70 190 L66 290 L50 290 L48 172 L36 170 Z" />
      </g>
      {/* Stick standing on the tip of its blade */}
      <g className="figure-stick">
        <rect x="146" y={stickTop} width="9" height={286 - stickTop} rx="3" />
        <path d="M146 280 L155 280 L168 290 L132 292 L134 288 Z" />
      </g>
    </svg>
  );
}

// Where the shaft bends most, as a share of the shaft from the top (0) to the blade (100).
const KICK_ZONES: Record<KickPoint, [number, number]> = {
  low: [66, 96],
  hybrid: [40, 92],
  mid: [32, 66],
};

const SHAFT_PATH = "M20 8 Q26 110 46 176";

/** A stick bending as in a shot, with the part that bends most highlighted. */
export function KickDiagram({ kick }: { kick: KickPoint }) {
  const [from, to] = KICK_ZONES[kick];
  return (
    <svg className="kick-diagram" viewBox="0 0 80 200" aria-hidden="true">
      <path d={SHAFT_PATH} className="kick-shaft" />
      <path d="M46 176 L72 188" className="kick-shaft" />
      <path
        d={SHAFT_PATH}
        pathLength={100}
        strokeDasharray={`0 ${from} ${to - from} 100`}
        className="kick-zone"
      />
    </svg>
  );
}

/**
 * Flex demo: the player picks how hard to push, and two sticks bend.
 * Flex is defined as the pounds needed to bend the shaft one inch.
 */
export function FlexDemo({
  flexes,
  label,
  result,
}: {
  flexes: number[];
  label: string;
  result: (cm: string, flex: number) => string;
}) {
  const [pushLbs, setPushLbs] = useState(40);
  const pushKg = Math.round(pushLbs / 2.2);
  return (
    <div className="flex-demo">
      <label className="flex-demo-control">
        <span>
          {label}: <strong>{pushKg} kg</strong>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pushLbs}
          onChange={(e) => setPushLbs(Number(e.target.value))}
          style={{ "--fill": `${pushLbs}%` } as CSSProperties}
        />
      </label>
      <div className="flex-demo-sticks">
        {flexes.map((flex) => {
          const bendInches = pushLbs / flex;
          const bendCm = bendInches * 2.54;
          // Exaggerate the drawing so small bends are still visible.
          const sag = Math.min(46, bendCm * 9);
          return (
            <figure key={flex} className="flex-demo-stick">
              <svg viewBox="0 0 240 52" aria-hidden="true">
                <path d={`M10 8 Q120 ${8 + sag * 1.9} 230 8`} className="flex-demo-shaft" />
                <circle cx="10" cy="8" r="5" className="flex-demo-pin" />
                <circle cx="230" cy="8" r="5" className="flex-demo-pin" />
              </svg>
              <figcaption aria-live="polite">{result(bendCm.toFixed(1).replace(".0", ""), flex)}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
