import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";

const SUPPORT_L = 34;
const SUPPORT_R = 306;
const SPAN = SUPPORT_R - SUPPORT_L;
const BEAM_Y = 40;
const OVERHANG = 18;
// Drawing scale: pixels per centimetre of bend. Real bends are small, so they are exaggerated.
const PX_PER_CM = 9;
const MAX_SAG = 52;

/**
 * Shape of a beam on two supports, pushed down in the middle: 0 at the supports, 1 in the middle.
 * Outside the supports the shaft tips up a little, as a real stick does.
 */
function sagShape(x: number): number {
  const u = (x - SUPPORT_L) / SPAN;
  if (u < 0) return 3 * u;
  if (u > 1) return 3 * (1 - u);
  const v = u <= 0.5 ? u : 1 - u;
  return v * (3 - 4 * v * v);
}

function beamPath(sag: number): string {
  const points: string[] = [];
  for (let x = SUPPORT_L - OVERHANG; x <= SUPPORT_R + OVERHANG; x += 4) {
    points.push(`${x === SUPPORT_L - OVERHANG ? "M" : "L"}${x} ${(BEAM_Y + sag * sagShape(x)).toFixed(2)}`);
  }
  return points.join(" ");
}

function useSag(targetPx: number): MotionValue<number> {
  const reduceMotion = useReducedMotion();
  const raw = useMotionValue(targetPx);
  const spring = useSpring(raw, reduceMotion ? { duration: 0 } : { stiffness: 140, damping: 13, mass: 0.8 });
  useEffect(() => raw.set(targetPx), [raw, targetPx]);
  return spring;
}

function Bench({ flex, pushLbs, accent, label }: { flex: number; pushLbs: number; accent: boolean; label: string }) {
  const bendCm = (pushLbs / flex) * 2.54;
  const sag = useSag(Math.min(MAX_SAG, bendCm * PX_PER_CM));
  const d = useTransform(sag, beamPath);
  const pressY = useTransform(sag, (s) => BEAM_Y + s - 4);
  const dimY = useTransform(sag, (s) => BEAM_Y + s + 5);
  const mid = (SUPPORT_L + SUPPORT_R) / 2;
  const arrowLen = 8 + Math.min(30, pushLbs * 0.3);

  return (
    <figure className="bench" data-accent={accent || undefined}>
      <svg viewBox="0 0 340 100" aria-hidden="true">
        {/* Straight shaft before the push, for comparison */}
        <path d={beamPath(0)} className="bench-ghost" />
        {/* Supports */}
        {[SUPPORT_L, SUPPORT_R].map((x) => (
          <path key={x} d={`M${x} ${BEAM_Y + 6} L${x + 9} ${BEAM_Y + 22} L${x - 9} ${BEAM_Y + 22} Z`} className="bench-support" />
        ))}
        <line x1="10" x2="330" y1={BEAM_Y + 22.5} y2={BEAM_Y + 22.5} className="bench-base" />
        {/* Shaft */}
        <motion.path d={d} className="bench-shaft" />
        <motion.path d={d} className="bench-shaft-gloss" />
        {/* Press with force arrow */}
        <motion.g style={{ y: pressY }}>
          <rect x={mid - 14} y={-12} width="28" height="9" rx="2.5" className="bench-press" />
          <line x1={mid} x2={mid} y1={-14 - arrowLen} y2={-16} className="bench-force" markerEnd="url(#bench-arrow)" />
        </motion.g>
        {/* Bend measurement */}
        <motion.line x1={mid + 24} x2={mid + 24} y1={BEAM_Y + 5} y2={dimY} className="bench-dim" />
        <defs>
          <marker id="bench-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" className="bench-force-head" />
          </marker>
        </defs>
      </svg>
      <figcaption>
        <strong>{label}</strong>
        <span className="bench-reading">{bendCm < 0.05 ? "0" : bendCm.toFixed(1).replace(".0", "")} cm</span>
      </figcaption>
    </figure>
  );
}

/**
 * A flex test bench, like the one stick makers use: the shaft lies on two supports and is
 * pushed down in the middle. Flex = pounds of push needed to bend it one inch.
 */
export function FlexBench({
  flexes,
  pushLabel,
  stickLabel,
}: {
  flexes: { flex: number; accent: boolean }[];
  pushLabel: string;
  stickLabel: (flex: number) => string;
}) {
  const [pushLbs, setPushLbs] = useState(40);
  const pushKg = Math.round(pushLbs / 2.2046);
  return (
    <div className="flex-bench">
      <label className="flex-bench-control">
        <span>
          {pushLabel}: <strong>{pushKg} kg</strong> <span className="muted">({pushLbs} lbs)</span>
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
      {flexes.map(({ flex, accent }) => (
        <Bench key={flex} flex={flex} pushLbs={pushLbs} accent={accent} label={stickLabel(flex)} />
      ))}
    </div>
  );
}
