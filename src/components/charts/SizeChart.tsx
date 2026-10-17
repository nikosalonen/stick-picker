import { scaleBand, scaleLinear } from "d3-scale";
import { useCallback, useState, type ReactNode } from "react";
import { copy } from "../../copy";
import { useLang } from "../../i18n";
import { SIZES, type SizeCategory } from "../../logic/recommend";
import { Tooltip, useDismissOnOutsideTap, useWidth } from "./chartKit";

const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];
const HEIGHT_DOMAIN: [number, number] = [90, 210];

/**
 * Which stick size fits which player height. Bars are the typical height range of each size;
 * on the result page the player's height is a line and their size is highlighted.
 */
export function SizeChart({ heightCm, size, table }: { heightCm?: number; size?: SizeCategory; table?: ReactNode }) {
  const { t } = useLang();
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<SizeCategory | null>(null);
  const clearHover = useCallback(() => setHover(null), []);
  useDismissOnOutsideTap(ref, hover !== null, clearHover);

  const narrow = width < 480;
  const margin = { top: heightCm ? 34 : 10, right: 16, bottom: 44, left: narrow ? 46 : 112 };
  const rowH = 46;
  const innerW = Math.max(120, width - margin.left - margin.right);
  const innerH = rowH * SIZE_ORDER.length;
  const height = innerH + margin.top + margin.bottom;

  const x = scaleLinear().domain(HEIGHT_DOMAIN).range([0, innerW]);
  const rows = scaleBand<SizeCategory>().domain(SIZE_ORDER).range([0, innerH]).padding(0.38);
  const ticks = [100, 120, 140, 160, 180, 200];
  const highlight = hover ?? null;

  return (
    <figure className="chart">
      <figcaption className="chart-title">
        <strong>{t(copy.charts.sizeTitle)}</strong>
        <span>{t(copy.charts.sizeSubtitle)}</span>
      </figcaption>
      <div ref={ref} className="chart-frame">
        <svg width={width} height={height} role="img" aria-label={t(copy.charts.sizeTitle)}>
          <g transform={`translate(${margin.left} ${margin.top})`}>
            {ticks.map((tick) => (
              <g key={tick} transform={`translate(${x(tick)} 0)`}>
                <line y2={innerH} className="chart-grid" />
                <text y={innerH + 20} textAnchor="middle" className="chart-tick">
                  {tick}
                </text>
              </g>
            ))}
            <text x={innerW} y={innerH + 40} textAnchor="end" className="chart-axis-label">
              {t(copy.charts.heightAxis)}
            </text>

            {SIZE_ORDER.map((s) => {
              const [from, to] = SIZES[s].heightCm;
              const by = rows(s) ?? 0;
              const isPlayer = size === s;
              const className = isPlayer
                ? "chart-bar chart-bar-accent"
                : size
                  ? "chart-bar chart-bar-neutral"
                  : "chart-bar chart-bar-series";
              return (
                <g
                  key={s}
                  tabIndex={0}
                  role="img"
                  aria-label={`${t(copy.sizes[s])}: ${t(copy.explain.colHeight)} ${from}–${to} cm, ${t(copy.explain.colAge)} ${t(copy.explain.sizeAges[s])}, ${t(copy.explain.colLength)} ${SIZES[s].stockLengthsIn[0]}–${SIZES[s].stockLengthsIn[SIZES[s].stockLengthsIn.length - 1]}", flex ${SIZES[s].flexes[0]}–${SIZES[s].flexes[SIZES[s].flexes.length - 1]}`}
                  className="chart-bar-group"
                  data-hover={highlight === s || undefined}
                  onPointerEnter={() => setHover(s)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && setHover(null)}
                  onPointerDown={() => setHover(s)}
                  onFocus={() => setHover(s)}
                  onBlur={() => setHover(null)}
                >
                  {/* Hit area spans the whole row so the bar is easy to hover. */}
                  <rect x={-margin.left} y={by - 10} width={innerW + margin.left} height={rows.bandwidth() + 20} fill="transparent" />
                  <text x={-12} y={by + rows.bandwidth() / 2} dy="0.32em" textAnchor="end" className="chart-row-label" data-strong={isPlayer || undefined}>
                    {narrow ? copy.sizeShort[s] : t(copy.sizes[s])}
                  </text>
                  <rect x={x(from)} y={by} width={x(to) - x(from)} height={rows.bandwidth()} rx="4" className={className} />
                </g>
              );
            })}

            {/* The player's height line crosses the bars; value labels sit on top with a halo. */}
            {heightCm && (
              <g pointerEvents="none">
                <line x1={x(heightCm)} x2={x(heightCm)} y1={-8} y2={innerH} className="chart-marker-line" />
                <text x={x(heightCm)} y={-16} textAnchor={x(heightCm) > innerW - 80 ? "end" : x(heightCm) < 80 ? "start" : "middle"} className="chart-marker-label">
                  {t(copy.charts.yourPlayer(heightCm))}
                </text>
              </g>
            )}
            {!narrow &&
              SIZE_ORDER.map((s) => {
                const [from, to] = SIZES[s].heightCm;
                const by = rows(s) ?? 0;
                // Labels sit after the bar, or before it when the bar reaches the right edge.
                const before = x(to) + 84 > innerW;
                return (
                  <text
                    key={s}
                    x={before ? x(from) - 8 : x(to) + 8}
                    y={by + rows.bandwidth() / 2}
                    dy="0.32em"
                    textAnchor={before ? "end" : "start"}
                    className="chart-bar-value"
                    pointerEvents="none"
                  >
                    {from}–{to} cm
                  </text>
                );
              })}
          </g>
        </svg>
        {highlight && (
          <Tooltip
            containerWidth={width}
            x={margin.left + x(SIZES[highlight].heightCm[1])}
            y={margin.top + (rows(highlight) ?? 0) + rows.bandwidth() / 2}
            title={`${t(copy.sizes[highlight])} (${copy.sizeShort[highlight]})`}
            rows={[
              { key: "h", value: `${SIZES[highlight].heightCm[0]}–${SIZES[highlight].heightCm[1]} cm`, label: t(copy.explain.colHeight) },
              { key: "a", value: t(copy.explain.sizeAges[highlight]), label: t(copy.explain.colAge) },
              {
                key: "l",
                value: `${SIZES[highlight].stockLengthsIn[0]}–${SIZES[highlight].stockLengthsIn[SIZES[highlight].stockLengthsIn.length - 1]}"`,
                label: t(copy.explain.colLength),
              },
              {
                key: "f",
                value: `${SIZES[highlight].flexes[0]}–${SIZES[highlight].flexes[SIZES[highlight].flexes.length - 1]}`,
                label: "Flex",
              },
            ]}
          />
        )}
      </div>
      {table}
    </figure>
  );
}
