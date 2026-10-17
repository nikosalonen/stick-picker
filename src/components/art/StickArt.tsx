import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

export type LabelPart = "size" | "flex" | "curve" | "hand" | "length";

export const LABEL_PARTS: LabelPart[] = ["size", "flex", "curve", "hand", "length"];

type Props = {
  values: Record<LabelPart, string>;
  active?: LabelPart | null;
  onSelect?: (part: LabelPart) => void;
  title: string;
  /** Slide the stick in once when it first appears. */
  animateIn?: boolean;
};

// Where each printed value sits along the shaft, in viewBox units.
const SLOTS: Record<LabelPart, { x: number; w: number }> = {
  size: { x: 136, w: 98 },
  flex: { x: 244, w: 106 },
  curve: { x: 360, w: 126 },
  hand: { x: 496, w: 74 },
  length: { x: 580, w: 102 },
};

const SHAFT = { x: 96, y: 57, w: 716, h: 46 };
const SEPARATORS = [239, 355, 491, 575];
// Rounded at the butt end, square where it runs into the blade.
const SHAFT_PATH = `M${SHAFT.x + 8} ${SHAFT.y} H${SHAFT.x + SHAFT.w} V${SHAFT.y + SHAFT.h} H${SHAFT.x + 8} a8 8 0 0 1 -8 -8 V${SHAFT.y + 8} a8 8 0 0 1 8 -8 Z`;

// The blade in its own frame: x runs from the hosel to the toe, negative y is the ice edge.
// Its root edge sits under the end of the shaft, so the hosel joint has no seam.
const BLADE =
  "M-24 -9 C-14 -18 -4 -30 10 -38 C24 -45 40 -46 56 -46 C110 -48 160 -50 186 -45 C208 -41 214 -18 208 2 C203 19 190 25 170 25 L6 25 Z";

/**
 * A composite hockey stick drawn side-on, with the spec printed along the shaft
 * like a real label. Each printed value is a button when `onSelect` is given.
 */
export function StickArt({ values, active, onSelect, title, animateIn = false }: Props) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg className="stick-art" viewBox="0 0 1000 244" role="group" aria-label={title}>
      <defs>
        <linearGradient id={id("shaft")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shaft-hi)" />
          <stop offset="0.38" stopColor="var(--shaft)" />
          <stop offset="1" stopColor="var(--shaft-lo)" />
        </linearGradient>
        {/* Light from above: a bright lip, then shade toward the bottom edge. */}
        <linearGradient id={id("volume")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.22" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={id("weave")} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4.5" height="9" fill="#fff" opacity="0.045" />
        </pattern>
        <linearGradient id={id("tape")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--tape-light)" />
          <stop offset="1" stopColor="var(--tape-shade)" />
        </linearGradient>
        <filter id={id("blur")} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={id("blade-clip")}>
          <path d={BLADE} />
        </clipPath>
        <clipPath id={id("shaft-clip")}>
          <path d={SHAFT_PATH} />
        </clipPath>
        <clipPath id={id("knob-clip")}>
          <rect x="8" y="49" width="30" height="62" rx="13" />
          <rect x="18" y="53" width="110" height="54" rx="10" />
        </clipPath>
      </defs>

      <motion.g
        initial={animateIn && !reduceMotion ? { opacity: 0, x: -70 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 0.84, 0.24, 1] }}
      >
        {/* Soft shadow on the ice */}
        <rect x="50" y="116" width="790" height="10" rx="5" fill="var(--stick-shadow)" filter={url("blur")} />
        <ellipse cx="930" cy="232" rx="66" ry="5" fill="var(--stick-shadow)" filter={url("blur")} />

        {/* Blade, leaving the shaft at the lie angle */}
        <g transform="translate(812 80) rotate(42)">
          <path d={BLADE} fill={url("shaft")} />
          <g clipPath={url("blade-clip")}>
            <rect x="44" y="-60" width="190" height="100" fill={url("tape")} />
            {/* Each wrap of tape overlaps the last: a soft shadow line, then a bright edge. */}
            {Array.from({ length: 11 }, (_, i) => 58 + i * 15).map((x) => (
              <g key={x}>
                <path d={`M${x} -60 L${x - 12} 40`} stroke="var(--tape-wrap)" strokeWidth="3" strokeOpacity="0.55" />
                <path d={`M${x + 1.5} -60 L${x - 10.5} 40`} stroke="#fff" strokeWidth="1.2" />
              </g>
            ))}
            {/* Puck marks */}
            <ellipse cx="122" cy="-24" rx="20" ry="6" fill="#000" opacity="0.07" transform="rotate(-6 122 -24)" />
            <ellipse cx="160" cy="-8" rx="12" ry="4" fill="#000" opacity="0.05" />
            <path d="M44 -60 L44 40" stroke="var(--tape-edge)" strokeWidth="2.5" />
            <rect x="-60" y="-60" width="300" height="100" fill={url("volume")} opacity="0.5" />
          </g>
          <path d="M14 19 L44 19" stroke="var(--stick-red)" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Shaft */}
        <path d={SHAFT_PATH} fill={url("shaft")} />
        <g clipPath={url("shaft-clip")}>
          <rect x={SHAFT.x} y={SHAFT.y} width={SHAFT.w} height={SHAFT.h} fill={url("weave")} />
          {/* Graphics near the hosel, like a real stick's paint job */}
          <path d="M704 57 L744 57 L724 103 L684 103 Z" fill="var(--stick-red)" />
          <path d="M750 57 L757 57 L737 103 L730 103 Z" fill="var(--tape-light)" opacity="0.9" />
          <path d="M763 57 L820 57 L820 103 L743 103 Z" fill="var(--stick-blue)" />
          <path d="M150 57 L158 57 L140 103 L132 103 Z" fill="var(--stick-red)" />
          <rect x={SHAFT.x} y={SHAFT.y} width={SHAFT.w} height={SHAFT.h} fill={url("volume")} />
        </g>
        <rect x="112" y="61.5" width="690" height="3.5" rx="1.75" fill={url("gloss")} opacity="0.7" />

        {/* Knob of black tape at the butt end */}
        <g clipPath={url("knob-clip")}>
          <rect x="0" y="40" width="140" height="80" fill="var(--tape-dark)" />
          {Array.from({ length: 11 }, (_, i) => i * 12).map((x, i) => (
            <path key={x} d={`M${x} 40 L${x + 12} 40 L${x + 28} 120 L${x + 16} 120 Z`} fill={i % 2 ? "var(--tape-dark-2)" : "var(--tape-dark)"} />
          ))}
          {Array.from({ length: 11 }, (_, i) => i * 12).map((x) => (
            <path key={x} d={`M${x} 40 L${x + 16} 120`} stroke="#fff" strokeOpacity="0.09" strokeWidth="1.2" />
          ))}
          <rect x="0" y="40" width="140" height="80" fill={url("volume")} />
        </g>

        {/* Printed spec */}
        {SEPARATORS.map((x) => (
          <path key={x} d={`M${x + 4} 68 L${x - 2} 92`} stroke="var(--shaft-text)" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
        ))}
        {active && (
          <motion.rect
            className="stick-art-pill"
            y="62"
            height="36"
            rx="7"
            initial={false}
            animate={{ x: SLOTS[active].x, width: SLOTS[active].w }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        {LABEL_PARTS.map((part) => {
          const slot = SLOTS[part];
          const isActive = active === part;
          const content = (
            <>
              <rect className="stick-art-hit" x={slot.x} y="58" width={slot.w} height="44" rx="7" />
              <text x={slot.x + slot.w / 2} y="91" textAnchor="middle" className="stick-art-text" data-active={isActive || undefined}>
                {values[part]}
              </text>
            </>
          );
          if (!onSelect) return <g key={part}>{content}</g>;
          return (
            <g
              key={part}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={`${part}: ${values[part]}`}
              className="stick-art-part"
              onClick={() => onSelect(part)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(part);
                }
              }}
            >
              {content}
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}
