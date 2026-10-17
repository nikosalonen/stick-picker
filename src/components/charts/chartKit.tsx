import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** Tracks an element's width so charts can draw at real pixel size (text stays readable). */
export function useWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  // Measure before paint so the first frame already has the right size.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(Math.round(element.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/**
 * On touch screens a tap shows a value and the finger leaves at once, so the value
 * stays until the next tap outside the chart.
 */
export function useDismissOnOutsideTap(ref: RefObject<HTMLElement | null>, active: boolean, dismiss: () => void) {
  useEffect(() => {
    if (!active) return;
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) dismiss();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [ref, active, dismiss]);
}

export type TooltipRow = { key: string; value: string; label: string; color?: string };

/**
 * A tooltip that leads with values; rows are keyed with a short line in the series color.
 * It sits beside the point and is kept inside the chart, even on narrow screens.
 */
export function Tooltip({ x, y, title, rows, containerWidth }: { x: number; y: number; title: string; rows: TooltipRow[]; containerWidth: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    const width = ref.current?.offsetWidth ?? 0;
    const gap = 14;
    const right = x + gap;
    const preferred = right + width <= containerWidth ? right : x - gap - width;
    setLeft(Math.max(0, Math.min(containerWidth - width, preferred)));
  }, [x, containerWidth, title, rows.length]);

  return (
    <div
      ref={ref}
      className="chart-tooltip"
      style={{ left: left ?? x, top: y, visibility: left === null ? "hidden" : "visible" }}
      aria-hidden="true"
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

export function TableView({ summary, label, children }: { summary: string; label: string; children: ReactNode }) {
  return (
    <details className="table-view">
      <summary>{summary}</summary>
      <div className="brand-table-wrap" tabIndex={0} role="region" aria-label={label}>
        {children}
      </div>
    </details>
  );
}
