/**
 * Flat-style player figures, drawn in a local space 100 units tall with the feet at y = 0
 * (so the head top is at y = -100). Wrap them in a `transform` to place and scale.
 */

export type Build = {
  child: boolean;
  headH: number;
  top: number;
  chin: number;
  nose: number;
  eyes: number;
  headCy: number;
  headRx: number;
  shoulderY: number;
  hipY: number;
  shoulderHalf: number;
};

export function build(child: boolean): Build {
  // Children have bigger heads relative to their height.
  const headH = child ? 17.6 : 15.4;
  const top = -100;
  const chin = top + headH;
  const shoulderY = chin + 4.2;
  const hipY = shoulderY + (child ? 27 : 31);
  return {
    child,
    headH,
    top,
    chin,
    nose: chin - headH * 0.3,
    eyes: chin - headH * 0.5,
    headCy: top + headH * 0.52,
    headRx: headH * 0.4,
    shoulderY,
    hipY,
    shoulderHalf: child ? 10 : 11.5,
  };
}

function Legs({ b, spread = 0 }: { b: Build; spread?: number }) {
  const hip = b.hipY + 2;
  const s = spread;
  return (
    <g>
      <path d={`M${-b.shoulderHalf + 2} ${hip} L-0.6 ${hip} L${-1.4 - s} -4 L${-8.4 - s} -4 Z`} fill="var(--pants)" />
      <path d={`M${b.shoulderHalf - 2} ${hip} L0.6 ${hip} L${1.4 + s} -4 L${8.4 + s} -4 Z`} fill="var(--pants)" />
      <rect x={-11 - s} y="-4.8" width="10.4" height="4.8" rx="2.4" fill="var(--shoe)" stroke="var(--shoe-edge)" strokeWidth="0.6" />
      <rect x={0.6 + s} y="-4.8" width="10.4" height="4.8" rx="2.4" fill="var(--shoe)" stroke="var(--shoe-edge)" strokeWidth="0.6" />
    </g>
  );
}

function Jersey({ b, number }: { b: Build; number?: string }) {
  const sh = b.shoulderHalf;
  const hem = b.hipY + 3;
  return (
    <g>
      <path
        d={`M-3.4 ${b.chin + 1.4} Q${-sh + 1} ${b.shoulderY - 0.6} ${-sh} ${b.shoulderY + 2.4} L${-sh + 1.2} ${hem} L${sh - 1.2} ${hem} L${sh} ${b.shoulderY + 2.4} Q${sh - 1} ${b.shoulderY - 0.6} 3.4 ${b.chin + 1.4} Z`}
        fill="var(--jersey)"
      />
      {/* Hem stripes */}
      <rect x={-sh + 1.1} y={hem - 5.2} width={sh * 2 - 2.2} height="1.8" fill="var(--tape-light)" />
      <rect x={-sh + 1.1} y={hem - 3.4} width={sh * 2 - 2.2} height="1.8" fill="var(--stick-red)" />
      {number && (
        <text x="0" y={b.shoulderY + 14} textAnchor="middle" className="player-number">
          {number}
        </text>
      )}
    </g>
  );
}

/** Front-facing player standing straight, arms down. */
export function StandingPlayer({ child = false }: { child?: boolean }) {
  const b = build(child);
  const sh = b.shoulderHalf;
  const armTop = b.shoulderY + 1.6;
  const wrist = b.hipY - 1;
  return (
    <g className="player">
      <Legs b={b} />
      {/* Arms (sleeves) */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M${side * (sh - 0.5)} ${armTop} Q${side * (sh + 3.6)} ${armTop + 1} ${side * (sh + 4)} ${armTop + 8} L${side * (sh + 3.8)} ${wrist} L${side * (sh + 0.4)} ${wrist} L${side * (sh - 1.2)} ${armTop + 9} Z`}
            fill="var(--jersey-shade)"
          />
          <rect x={side > 0 ? sh + 0.3 : -sh - 3.9} y={wrist - 6} width="3.6" height="1.6" fill="var(--tape-light)" />
          <rect x={side > 0 ? sh + 0.3 : -sh - 3.9} y={wrist - 4.4} width="3.6" height="1.6" fill="var(--stick-red)" />
          <circle cx={side * (sh + 2.1)} cy={wrist + 2.2} r="2.5" fill="var(--skin)" />
        </g>
      ))}
      <Jersey b={b} />
      {/* Neck and head */}
      <rect x="-2.3" y={b.chin - 1.5} width="4.6" height="5" fill="var(--skin-shade)" />
      <ellipse cx={-b.headRx} cy={b.headCy + 1} rx="1.4" ry="2" fill="var(--skin-shade)" />
      <ellipse cx={b.headRx} cy={b.headCy + 1} rx="1.4" ry="2" fill="var(--skin-shade)" />
      <ellipse cx="0" cy={b.headCy} rx={b.headRx} ry={b.headH / 2} fill="var(--skin)" />
      <path
        d={`M${-b.headRx - 0.3} ${b.headCy - 0.5} C${-b.headRx - 0.6} ${b.top - 1.5} ${b.headRx + 0.6} ${b.top - 1.5} ${b.headRx + 0.3} ${b.headCy - 0.5} Q${b.headRx * 0.5} ${b.top + b.headH * 0.24} ${-b.headRx * 0.2} ${b.top + b.headH * 0.27} Q${-b.headRx * 0.7} ${b.top + b.headH * 0.3} ${-b.headRx - 0.3} ${b.headCy - 0.5} Z`}
        fill="var(--hair)"
      />
      {/* Face: eyes, nose, smile */}
      <circle cx={-b.headRx * 0.38} cy={b.eyes} r="0.75" fill="var(--face-ink)" />
      <circle cx={b.headRx * 0.38} cy={b.eyes} r="0.75" fill="var(--face-ink)" />
      <path d={`M0.2 ${b.nose - 2.6} Q1.3 ${b.nose - 0.3} -0.1 ${b.nose + 0.2}`} fill="none" stroke="var(--skin-shade)" strokeWidth="0.8" strokeLinecap="round" />
      <path d={`M-1.7 ${b.chin - 2.8} Q0 ${b.chin - 1.5} 1.7 ${b.chin - 2.8}`} fill="none" stroke="var(--face-ink)" strokeWidth="0.7" strokeLinecap="round" />
    </g>
  );
}

/** View box that fits a HoldingPlayer: the body plus the stick out to the blade side. */
export function holdingViewBox(hand: "left" | "right"): string {
  return hand === "left" ? "-58 -104 76 108" : "-18 -104 76 108";
}

/**
 * Player seen from behind, holding a stick (or broom). Seen from behind, the player's left
 * is also the viewer's left, which makes "left stick" easy to read. The stick passes in
 * front of the player, so the body hides its top part and the top hand.
 */
export function HoldingPlayer({ hand, tool = "stick", child = false }: { hand: "left" | "right"; tool?: "stick" | "broom"; child?: boolean }) {
  const b = build(child);
  const sh = b.shoulderHalf;
  // dir = which side the blade is on (-1 = viewer's left).
  const dir = hand === "left" ? -1 : 1;
  const topEnd = { x: -dir * 4, y: b.hipY - 7 };
  const heel = { x: dir * (sh + 28), y: -2.5 };
  const along = (t: number) => ({ x: topEnd.x + (heel.x - topEnd.x) * t, y: topEnd.y + (heel.y - topEnd.y) * t });
  const topHand = along(0.04);
  const lowHand = along(0.42);
  const shoulderLow = { x: dir * (sh - 1.5), y: b.shoulderY + 2 };
  const elbow = { x: dir * (sh + 4.5), y: (shoulderLow.y + lowHand.y) / 2 };
  const shaftColor = tool === "broom" ? "var(--broom)" : "var(--figure-stick)";

  return (
    <g className="player">
      {/* In front of the player, so drawn first and partly hidden */}
      <line x1={topEnd.x} y1={topEnd.y} x2={heel.x} y2={heel.y} stroke={shaftColor} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx={topHand.x} cy={topHand.y} r="2.9" fill="var(--glove)" />
      {tool === "stick" ? (
        <path
          d={`M${heel.x} ${heel.y} Q${heel.x + dir * 2} ${heel.y + 2.2} ${heel.x + dir * 6} ${heel.y + 2.2} L${heel.x + dir * 16} ${heel.y + 2} Q${heel.x + dir * 18.5} ${heel.y + 1.8} ${heel.x + dir * 17.5} ${heel.y - 0.4} L${heel.x + dir * 4} ${heel.y - 0.6} Z`}
          fill="var(--tape-light)"
          stroke="var(--figure-stick)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      ) : (
        <g>
          <path d={`M${heel.x - 4} ${heel.y - 2.5} L${heel.x + 4} ${heel.y - 2.5} L${heel.x + 7.5} ${heel.y + 2.5} L${heel.x - 7.5} ${heel.y + 2.5} Z`} fill="var(--broom-head)" />
          {[-6, -3, 0, 3, 6].map((dx) => (
            <line key={dx} x1={heel.x + dx * 0.6} y1={heel.y - 1.5} x2={heel.x + dx * 1.15} y2={heel.y + 2.4} stroke="var(--broom)" strokeWidth="0.6" />
          ))}
        </g>
      )}
      <Legs b={b} spread={3} />
      {/* Top-hand arm reaches forward, so only the upper sleeve shows. */}
      <path
        d={`M${-dir * (sh - 1.5)} ${b.shoulderY + 2} Q${-dir * (sh + 2)} ${b.shoulderY + 8} ${-dir * (sh - 1)} ${b.shoulderY + 15}`}
        fill="none"
        stroke="var(--jersey-shade)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <Jersey b={b} number={child ? "7" : "17"} />
      {/* Back of the head: all hair */}
      <rect x="-2.3" y={b.chin - 1.5} width="4.6" height="5" fill="var(--skin-shade)" />
      <ellipse cx={-b.headRx} cy={b.headCy + 1} rx="1.4" ry="2" fill="var(--skin-shade)" />
      <ellipse cx={b.headRx} cy={b.headCy + 1} rx="1.4" ry="2" fill="var(--skin-shade)" />
      <ellipse cx="0" cy={b.headCy} rx={b.headRx} ry={b.headH / 2} fill="var(--hair)" />
      {/* Lower-hand arm reaches out and down to the side */}
      <path
        d={`M${shoulderLow.x} ${shoulderLow.y} Q${elbow.x} ${elbow.y} ${lowHand.x} ${lowHand.y}`}
        fill="none"
        stroke="var(--jersey-shade)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      {/* The lower hand tells which way the player shoots. */}
      <circle cx={lowHand.x} cy={lowHand.y} r="6.2" className="player-hand-ring" />
      <circle cx={lowHand.x} cy={lowHand.y} r="3" fill="var(--glove)" />
    </g>
  );
}
