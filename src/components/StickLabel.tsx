import { useId } from "react";

export type LabelPart = "size" | "flex" | "curve" | "hand" | "length";

export const LABEL_PARTS: LabelPart[] = ["size", "flex", "curve", "hand", "length"];

type Props = {
  values: Record<LabelPart, string>;
  active?: LabelPart | null;
  onSelect?: (part: LabelPart) => void;
  title: string;
};

// Where each printed value sits along the shaft, in viewBox units.
const SLOTS: Record<LabelPart, { x: number; w: number }> = {
  size: { x: 150, w: 120 },
  flex: { x: 290, w: 120 },
  curve: { x: 430, w: 150 },
  hand: { x: 600, w: 90 },
  length: { x: 710, w: 130 },
};

/**
 * A hockey stick drawn side-on with its spec printed along the shaft, like a real label.
 * Each value is a button when `onSelect` is given.
 */
export function StickLabel({ values, active, onSelect, title }: Props) {
  const gradientId = useId();
  return (
    <svg className="stick-label" viewBox="0 0 1000 200" role="group" aria-label={title}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shaft-hi)" />
          <stop offset="0.5" stopColor="var(--shaft)" />
          <stop offset="1" stopColor="var(--shaft-lo)" />
        </linearGradient>
      </defs>
      {/* Knob of tape at the butt end */}
      <rect x="14" y="44" width="80" height="62" rx="12" fill="var(--tape-dark)" />
      {[28, 44, 60, 76].map((x) => (
        <line key={x} x1={x} y1="46" x2={x + 8} y2="104" stroke="var(--tape-line)" strokeWidth="2" />
      ))}
      {/* Shaft */}
      <rect x="90" y="50" width="770" height="50" rx="6" fill={`url(#${gradientId})`} />
      {/* Blade: leaves the shaft at the lie angle, toe rounded, wrapped in white tape */}
      <g transform="translate(846 75) rotate(42)">
        <path d="M-6 -25 L118 -25 Q150 -25 150 4 Q150 31 118 31 L-6 31 Z" fill={`url(#${gradientId})`} />
        <path
          d="M38 -25 L118 -25 Q150 -25 150 4 Q150 31 118 31 L38 31 Z"
          fill="var(--tape-light)"
          stroke="var(--tape-edge)"
          strokeWidth="2"
        />
        {[56, 74, 92, 110, 128].map((x) => (
          <line key={x} x1={x} y1="-25" x2={x - 6} y2="31" stroke="var(--tape-wrap)" strokeWidth="2" />
        ))}
      </g>
      {LABEL_PARTS.map((part) => {
        const slot = SLOTS[part];
        const isActive = active === part;
        const content = (
          <>
            <rect
              className="stick-label-slot"
              x={slot.x}
              y="54"
              width={slot.w}
              height="42"
              rx="4"
              data-active={isActive || undefined}
            />
            <text x={slot.x + slot.w / 2} y="87" textAnchor="middle" className="stick-label-text">
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
            className="stick-label-part"
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
    </svg>
  );
}
