import type { ReactNode } from "react";

type Zone = { from: number; to: number; label: string };

type ScaleProps = {
  min: number;
  max: number;
  /** The recommended value, drawn as the marker. */
  value: number;
  /** The acceptable range around the value, drawn as a band. */
  range?: [number, number];
  zones?: Zone[];
  leftLabel: string;
  rightLabel: string;
  valueLabel: ReactNode;
  ariaLabel: string;
};

/** A horizontal scale with a marker for the recommended value. */
export function Scale({ min, max, value, range, zones = [], leftLabel, rightLabel, valueLabel, ariaLabel }: ScaleProps) {
  const pct = (v: number) => `${((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100}%`;

  return (
    <figure className="scale" role="img" aria-label={ariaLabel}>
      <div className="scale-track">
        {zones.map((zone) => (
          <div
            key={zone.label}
            className="scale-zone"
            style={{ left: pct(zone.from), width: `calc(${pct(zone.to)} - ${pct(zone.from)})` }}
          >
            <span>{zone.label}</span>
          </div>
        ))}
        {range && (
          <div className="scale-range" style={{ left: pct(range[0]), width: `calc(${pct(range[1])} - ${pct(range[0])})` }} />
        )}
        <div className="scale-marker" style={{ left: pct(value) }}>
          <span className="scale-marker-label">{valueLabel}</span>
        </div>
      </div>
      <figcaption className="scale-ends">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </figcaption>
    </figure>
  );
}
