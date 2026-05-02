import { useMemo } from "react";
import { generateSeries } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type Props = {
  data?: { i: number; v: number }[];
  positive?: boolean;
  height?: number;
  width?: number;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
};

export function Sparkline({ data, positive = true, height = 40, width = 120, className, filled = true, strokeWidth = 1.5 }: Props) {
  const series = useMemo(() => data ?? generateSeries(48, 100, 1.5), [data]);
  const min = Math.min(...series.map((s) => s.v));
  const max = Math.max(...series.map((s) => s.v));
  const range = Math.max(1e-6, max - min);
  const stepX = width / Math.max(1, series.length - 1);
  const points = series
    .map((s, i) => {
      const x = i * stepX;
      const y = height - ((s.v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const stroke = positive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={cn("block w-full", className)} style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${id})`}
        />
      )}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
