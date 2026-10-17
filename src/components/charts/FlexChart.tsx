import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { useCallback, useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { copy } from "../../copy";
import { useLang } from "../../i18n";
import { SIZES, toLbs, type Recommendation, type SizeCategory } from "../../logic/recommend";
import { TableView, Tooltip, useDismissOnOutsideTap, useWidth } from "./chartKit";

const LBS_PER_KG = 2.2046;
const SHARES = { new: 0.4, team: 0.45, competitive: 0.5 };
const WEIGHT_DOMAIN: [number, number] = [10, 130];
const FLEX_DOMAIN: [number, number] = [0, 110];
const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];

const flexAt = (kg: number, share: number) => kg * LBS_PER_KG * share;

type Props = { rec?: Recommendation; weightKg?: number };

/**
 * Recommended flex by body weight: a band from beginner to competitive, the team-player
 * line in the middle, and (on the result page) where this player's stick lands.
 */
export function FlexChart({ rec, weightKg }: Props) {
  const { t } = useLang();
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hoverKg, setHoverKg] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const clearHover = useCallback(() => setHoverKg(null), []);
  useDismissOnOutsideTap(ref, hoverKg !== null, clearHover);

  const narrow = width < 480;
  const height = narrow ? 280 : 320;
  const margin = { top: 20, right: narrow ? 58 : 76, bottom: 46, left: 44 };
  const innerW = Math.max(120, width - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  const x = scaleLinear().domain(WEIGHT_DOMAIN).range([0, innerW]);
  const y = scaleLinear().domain(FLEX_DOMAIN).range([innerH, 0]);
  const weights = Array.from({ length: WEIGHT_DOMAIN[1] - WEIGHT_DOMAIN[0] + 1 }, (_, i) => WEIGHT_DOMAIN[0] + i);
  const bandPath =
    area<number>()
      .x((kg) => x(kg))
      .y0((kg) => y(flexAt(kg, SHARES.new)))
      .y1((kg) => y(flexAt(kg, SHARES.competitive)))(weights) ?? "";
  const midPath =
    line<number>()
      .x((kg) => x(kg))
      .y((kg) => y(flexAt(kg, SHARES.team)))(weights) ?? "";

  // Band edge labels follow the slope of the band.
  // Put them away from the player's dot so the callout never covers them.
  const labelKg = weightKg && weightKg > 55 ? 30 : 74;
  const slopeAngle = (share: number) => {
    const dx = x(labelKg + 10) - x(labelKg);
    const dy = y(flexAt(labelKg + 10, share)) - y(flexAt(labelKg, share));
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const xTicks = [20, 40, 60, 80, 100, 120];
  const yTicks = [0, 20, 40, 60, 80, 100];

  const levels = (kg: number) =>
    `${kg} kg: ${t(copy.charts.beginner)} ${fmt(flexAt(kg, SHARES.new))}, ${t(copy.charts.team)} ${fmt(flexAt(kg, SHARES.team))}, ${t(copy.charts.competitive)} ${fmt(flexAt(kg, SHARES.competitive))}`;
  const keyboardKg = hoverKg ?? weightKg ?? 50;

  const onPointer = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const kg = Math.round(x.invert(event.clientX - box.left));
    setHoverKg(Math.max(WEIGHT_DOMAIN[0], Math.min(WEIGHT_DOMAIN[1], kg)));
  };
  const onKey = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const current = hoverKg ?? weightKg ?? 50;
    if (event.key === "ArrowRight") setHoverKg(Math.min(WEIGHT_DOMAIN[1], current + step));
    else if (event.key === "ArrowLeft") setHoverKg(Math.max(WEIGHT_DOMAIN[0], current - step));
    else if (event.key === "Escape") setHoverKg(null);
    else return;
    event.preventDefault();
  };

  const playerKg = rec && weightKg ? Math.min(WEIGHT_DOMAIN[1], weightKg) : null;
  const showCut = rec && rec.flexAfterCut - rec.flex >= 2;
  // The arrow from label flex to felt flex only fits when the two dots are apart.
  const showArrow = rec && y(rec.flex) - y(rec.flexAfterCut) >= 22;

  return (
    <figure className="chart">
      <figcaption className="chart-title">
        <strong>{t(copy.charts.flexTitle)}</strong>
        <span>{t(copy.charts.flexSubtitle)}</span>
      </figcaption>
      {narrow && (
        <div className="chart-legend" aria-hidden="true">
          <span>
            <span className="chart-legend-band" />
            {t(copy.charts.beginner)} – {t(copy.charts.competitive).toLowerCase()}
          </span>
          <span>
            <span className="chart-legend-line" />
            {t(copy.charts.team)}
          </span>
        </div>
      )}
      <div
        ref={ref}
        className="chart-frame"
        tabIndex={0}
        role="slider"
        aria-label={t(copy.charts.flexAria)}
        aria-valuemin={WEIGHT_DOMAIN[0]}
        aria-valuemax={WEIGHT_DOMAIN[1]}
        aria-valuenow={keyboardKg}
        aria-valuetext={levels(keyboardKg)}
        onKeyDown={onKey}
        onBlur={clearHover}
      >
        <svg width={width} height={height} aria-hidden="true">
          <g transform={`translate(${margin.left} ${margin.top})`}>
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0 ${y(tick)})`}>
                <line x2={innerW} className="chart-grid" />
                <text x={-10} dy="0.32em" textAnchor="end" className="chart-tick">
                  {tick}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <text key={tick} x={x(tick)} y={innerH + 20} textAnchor="middle" className="chart-tick">
                {tick}
              </text>
            ))}
            <text x={innerW} y={innerH + 40} textAnchor="end" className="chart-axis-label">
              {t(copy.charts.weightAxis)}
            </text>
            <text x={-margin.left} y={-8} className="chart-axis-label">
              {t(copy.charts.flexAxis)}
            </text>

            <clipPath id={`${uid}-plot`}>
              <rect width={innerW} height={innerH} />
            </clipPath>
            <g clipPath={`url(#${uid}-plot)`}>
              <path d={bandPath} className="chart-band" />
              <path d={midPath} className="chart-line" />
            </g>
            {/* On narrow screens the band is too steep for labels along it; a legend shows instead. */}
            {!narrow && (
              <>
                <text
                  transform={`translate(${x(labelKg)} ${y(flexAt(labelKg, SHARES.competitive)) - 8}) rotate(${slopeAngle(SHARES.competitive)})`}
                  className="chart-direct-label"
                >
                  {t(copy.charts.competitive)}
                </text>
                <text
                  transform={`translate(${x(labelKg + 4)} ${y(flexAt(labelKg + 4, SHARES.new)) + 16}) rotate(${slopeAngle(SHARES.new)})`}
                  className="chart-direct-label"
                >
                  {t(copy.charts.beginner)}
                </text>
              </>
            )}

            {/* What each size is sold in, as brackets beside the plot */}
            {SIZE_ORDER.map((size, i) => {
              const flexes = SIZES[size].flexes;
              const bx = innerW + 14 + (i % 2) * (narrow ? 24 : 32);
              const isPlayer = rec?.size === size;
              return (
                <g key={size}>
                  <rect
                    x={bx}
                    y={y(flexes[flexes.length - 1])}
                    width="6"
                    height={Math.max(6, y(flexes[0]) - y(flexes[flexes.length - 1]))}
                    rx="3"
                    className={isPlayer ? "chart-bracket chart-bracket-accent" : rec ? "chart-bracket" : "chart-bracket chart-bracket-series"}
                  />
                  <text x={bx + 10} y={y((flexes[0] + flexes[flexes.length - 1]) / 2)} dy="0.32em" className="chart-bracket-label" data-strong={isPlayer || undefined}>
                    {copy.sizeShort[size]}
                  </text>
                </g>
              );
            })}

            {playerKg !== null && rec && (
              <g>
                <line x1={x(playerKg)} x2={x(playerKg)} y1={y(rec.flexAfterCut)} y2={innerH} className="chart-drop" />
                <line x1={0} x2={x(playerKg)} y1={y(rec.flexAfterCut)} y2={y(rec.flexAfterCut)} className="chart-drop" />
                {showArrow && (
                  <>
                    <circle cx={x(playerKg)} cy={y(rec.flex)} r="5" className="chart-dot-hollow" />
                    <line
                      x1={x(playerKg)}
                      x2={x(playerKg)}
                      y1={y(rec.flex) - 8}
                      y2={y(rec.flexAfterCut) + 10}
                      className="chart-arrow"
                      markerEnd={`url(#${uid}-arrow)`}
                    />
                  </>
                )}
                <circle cx={x(playerKg)} cy={y(rec.flexAfterCut)} r="8" className="chart-dot-ring" />
                <circle cx={x(playerKg)} cy={y(rec.flexAfterCut)} r="6" className="chart-dot" />
                {!narrow && (
                <PlayerCallout
                  x={x(playerKg)}
                  y={y(rec.flexAfterCut)}
                  innerW={innerW}
                  title={t(copy.charts.yourStick)}
                  lines={[
                    showCut ? t(copy.charts.onLabel(rec.flex)) : `Flex ${rec.flex}`,
                    showCut ? t(copy.charts.afterCut(rec.flexAfterCut)) : "",
                  ].filter(Boolean)}
                />
                )}
              </g>
            )}

            {hoverKg !== null && (
              <g pointerEvents="none">
                <line x1={x(hoverKg)} x2={x(hoverKg)} y1={0} y2={innerH} className="chart-crosshair" />
                {(["new", "team", "competitive"] as const).map((level) => {
                  const v = flexAt(hoverKg, SHARES[level]);
                  return v <= FLEX_DOMAIN[1] ? (
                    <circle key={level} cx={x(hoverKg)} cy={y(v)} r={level === "team" ? 4.5 : 3.5} className={level === "team" ? "chart-hover-dot" : "chart-hover-dot chart-hover-dot-soft"} />
                  ) : null;
                })}
              </g>
            )}

            <defs>
              <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" className="chart-arrow-head" />
              </marker>
            </defs>
            <rect
              width={innerW}
              height={innerH}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              // Touch keeps the value after the finger lifts; a tap outside clears it.
              onPointerLeave={(event) => event.pointerType === "mouse" && setHoverKg(null)}
            />
          </g>
        </svg>
        {hoverKg !== null && (
          <Tooltip
            containerWidth={width}
            x={margin.left + x(hoverKg)}
            y={margin.top + y(Math.min(100, flexAt(hoverKg, SHARES.team)))}
            title={`${hoverKg} kg (${toLbs(hoverKg)} lbs)`}
            rows={[
              { key: "c", value: fmt(flexAt(hoverKg, SHARES.competitive)), label: t(copy.charts.competitive), color: "var(--chart-band-key)" },
              { key: "t", value: fmt(flexAt(hoverKg, SHARES.team)), label: t(copy.charts.team), color: "var(--chart-blue)" },
              { key: "n", value: fmt(flexAt(hoverKg, SHARES.new)), label: t(copy.charts.beginner), color: "var(--chart-band-key)" },
            ]}
          />
        )}
      </div>
      {narrow && rec && (
        <p className="chart-readout">
          <span className="chart-readout-dot" aria-hidden="true" />
          <strong>{t(copy.charts.yourStick)}:</strong>{" "}
          {rec.flexAfterCut - rec.flex >= 2 ? `${t(copy.charts.onLabel(rec.flex))}. ${t(copy.charts.afterCut(rec.flexAfterCut))}.` : `Flex ${rec.flex}.`}
        </p>
      )}
      <p className="chart-hint">{t(copy.charts.hoverHint)}</p>
      <TableView summary={t(copy.charts.showTable)} label={t(copy.charts.flexTitle)}>
        <table className="size-table">
          <thead>
            <tr>
              <th scope="col">{t(copy.charts.weightAxis)}</th>
              <th scope="col">{t(copy.charts.beginner)}</th>
              <th scope="col">{t(copy.charts.team)}</th>
              <th scope="col">{t(copy.charts.competitive)}</th>
            </tr>
          </thead>
          <tbody>
            {[20, 30, 40, 50, 60, 70, 80, 90, 100, 110].map((kg) => (
              <tr key={kg}>
                <th scope="row">
                  {kg} kg ({toLbs(kg)} lbs)
                </th>
                <td>{fmt(flexAt(kg, SHARES.new))}</td>
                <td>{fmt(flexAt(kg, SHARES.team))}</td>
                <td>{fmt(flexAt(kg, SHARES.competitive))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableView>
    </figure>
  );
}

const fmt = (v: number) => (v > 110 ? "110+" : String(Math.round(v)));

/** A small label card beside the player's dot, flipped to stay inside the plot. */
function PlayerCallout({ x, y, innerW, title, lines }: { x: number; y: number; innerW: number; title: string; lines: string[] }) {
  // Roughly 6.6 px per character at 12 px; wide enough for the longest line.
  const boxW = Math.max(130, Math.max(title.length, ...lines.map((l) => l.length)) * 7 + 24);
  const boxH = 22 + lines.length * 17;
  const preferred = x + 16 + boxW > innerW ? x - 16 - boxW : x + 16;
  const left = Math.max(0, Math.min(innerW - boxW, preferred));
  const top = Math.max(0, y - boxH - 6);
  return (
    <g className="chart-callout" transform={`translate(${left} ${top})`}>
      <rect width={boxW} height={boxH} rx="8" />
      <text x="10" y="18" className="chart-callout-title">
        {title}
      </text>
      {lines.map((text, i) => (
        <text key={text} x="10" y={36 + i * 17} className="chart-callout-text">
          {text}
        </text>
      ))}
    </g>
  );
}
