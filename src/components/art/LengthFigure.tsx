import { motion, useReducedMotion } from "motion/react";
import { build, StandingPlayer } from "./Player";

/** A stick standing upright on the tip of its blade, top at `topY`, on a floor at `floorY`. */
export function UprightStick({ x, topY, floorY, scale = 1 }: { x: number; topY: number; floorY: number; scale?: number }) {
  const w = 8 * scale;
  const bladeTop = floorY - 20 * scale;
  return (
    <g>
      <rect x={x - w / 2} y={topY} width={w} height={bladeTop - topY + 2 * scale} rx={2 * scale} fill="var(--figure-stick)" />
      <rect x={x - w / 2 + 1.2 * scale} y={topY + 4 * scale} width={1.4 * scale} height={Math.max(0, bladeTop - topY - 6 * scale)} rx={0.7 * scale} fill="#fff" opacity="0.18" />
      {/* Knob tape */}
      <rect x={x - w / 2 - 0.6 * scale} y={topY - 0.5 * scale} width={w + 1.2 * scale} height={11 * scale} rx={2.4 * scale} fill="var(--tape-dark)" />
      {/* Blade, toe on the floor */}
      <path
        d={`M${x - w / 2} ${bladeTop} L${x + w / 2} ${bladeTop - 1 * scale} L${x + 30 * scale} ${floorY - 3 * scale} Q${x + 32 * scale} ${floorY} ${x + 28 * scale} ${floorY} L${x + 20 * scale} ${floorY - 0.5 * scale} L${x - w / 2} ${bladeTop + 9 * scale} Z`}
        fill="var(--tape-light)"
        stroke="var(--figure-stick)"
        strokeWidth={1.6 * scale}
        strokeLinejoin="round"
      />
    </g>
  );
}

type Props = {
  /** Where the stick top lands between chin (0) and nose (1). */
  ratio: number;
  child: boolean;
  chin: string;
  nose: string;
  heightLabel?: string;
  stickLabel?: string;
};

/**
 * The length rule as a picture: the player standing in shoes, the stick upright on its toe,
 * and the chin-to-nose band where the top of the stick should land.
 */
export function LengthFigure({ ratio, child, chin, nose, heightLabel, stickLabel }: Props) {
  const reduceMotion = useReducedMotion();
  const b = build(child);
  const floorY = 318;
  const scale = 2.6;
  const figureX = 128;
  const stickX = 192;
  const chinY = floorY + b.chin * scale;
  const noseY = floorY + b.nose * scale;
  const headTop = floorY + b.top * scale;
  const stickTop = chinY - (chinY - noseY) * Math.min(1.2, Math.max(-0.2, ratio));

  return (
    <svg className="length-figure" viewBox="0 0 300 340" role="img" aria-label={`${chin} – ${nose}`}>
      <defs>
        <linearGradient id="length-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ice-floor)" />
          <stop offset="1" stopColor="var(--ice-floor)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={floorY} width="300" height="22" fill="url(#length-floor)" />
      <line x1="10" x2="290" y1={floorY} y2={floorY} className="figure-floor" />

      {/* Target band */}
      <rect x="62" y={noseY} width="186" height={chinY - noseY} className="figure-band" />
      <line x1="62" x2="248" y1={noseY} y2={noseY} className="figure-guide" />
      <line x1="62" x2="248" y1={chinY} y2={chinY} className="figure-guide" />
      <text x="58" y={noseY + 4} textAnchor="end" className="figure-caption">
        {nose}
      </text>
      <text x="58" y={chinY + 4} textAnchor="end" className="figure-caption">
        {chin}
      </text>

      <g transform={`translate(${figureX} ${floorY}) scale(${scale})`}>
        <StandingPlayer child={child} />
      </g>

      <motion.g
        initial={reduceMotion ? false : { y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <UprightStick x={stickX} topY={stickTop} floorY={floorY} />
      </motion.g>

      {heightLabel && (
        <g className="figure-dimension">
          <line x1="24" x2="24" y1={headTop} y2={floorY} />
          <line x1="18" x2="30" y1={headTop} y2={headTop} />
          <line x1="18" x2="30" y1={floorY} y2={floorY} />
          <g transform={`translate(24 ${(headTop + floorY) / 2 + 40}) rotate(-90)`}>
            <rect x="-30" y="-9" width="60" height="18" rx="9" className="figure-dimension-pill" />
            <text textAnchor="middle" dy="0.35em" className="figure-dimension-text">
              {heightLabel}
            </text>
          </g>
        </g>
      )}
      {stickLabel && (
        <g className="figure-dimension figure-dimension-accent">
          <line x1="268" x2="268" y1={stickTop} y2={floorY} />
          <line x1="262" x2="274" y1={stickTop} y2={stickTop} />
          <line x1="262" x2="274" y1={floorY} y2={floorY} />
          <g transform={`translate(268 ${(stickTop + floorY) / 2 + 30}) rotate(-90)`}>
            <rect x="-34" y="-9" width="68" height="18" rx="9" className="figure-dimension-pill" />
            <text textAnchor="middle" dy="0.35em" className="figure-dimension-text">
              {stickLabel}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

type Example = { key: string; label: string; ok: boolean; topRatio: number };

/** Three small figures: too short, just right, too long. */
export function LengthExamples({ examples }: { examples: Example[] }) {
  const b = build(false);
  const floorY = 128;
  const scale = 1.05;
  return (
    <div className="length-examples">
      {examples.map((example) => {
        // topRatio is a share of the player's height measured from the floor.
        const topY = floorY - 100 * scale * example.topRatio;
        const chinY = floorY + b.chin * scale;
        const noseY = floorY + b.nose * scale;
        return (
          <figure key={example.key} className="length-example" data-ok={example.ok || undefined}>
            <svg viewBox="0 0 120 140" aria-hidden="true">
              <rect x="20" y={noseY} width="80" height={chinY - noseY} className="figure-band" opacity={example.ok ? 1 : 0.6} />
              <line x1="6" x2="114" y1={floorY} y2={floorY} className="figure-floor" />
              <g transform={`translate(52 ${floorY}) scale(${scale})`}>
                <StandingPlayer />
              </g>
              <UprightStick x={76} topY={topY} floorY={floorY} scale={0.5} />
            </svg>
            <figcaption>
              <span className="verdict" aria-hidden="true">
                {example.ok ? (
                  <svg viewBox="0 0 16 16">
                    <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16">
                    <path d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5" />
                  </svg>
                )}
              </span>
              {example.label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
