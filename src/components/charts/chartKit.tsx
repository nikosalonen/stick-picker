import { useEffect, useRef, useState, type ReactNode } from "react";

/** Tracks an element's width so charts can draw at real pixel size (text stays readable). */
export function useWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

export type TooltipRow = { key: string; value: string; label: string; color?: string };

/** A tooltip that leads with values; rows are keyed with a short line in the series color. */
export function Tooltip({ x, y, title, rows, containerWidth }: { x: number; y: number; title: string; rows: TooltipRow[]; containerWidth: number }) {
  const flip = x > containerWidth - 200;
  return (
    <div
      className="chart-tooltip"
      style={{ left: x, top: y, transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, -50%)` }}
      role="presentation"
    >
      <div className="chart-tooltip-title">{title}</div>
      {rows.map((row) => (
        <div key={row.key} className="chart-tooltip-row">
          {row.color && <span className="chart-tooltip-key" style={{ background: row.color }} />}
          <strong>{row.value}</strong>
          <span>{row.label}</span>
        </div>
      ))}
    </div>
  );
}

export function TableView({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="table-view">
      <summary>{summary}</summary>
      <div className="brand-table-wrap">{children}</div>
    </details>
  );
}
