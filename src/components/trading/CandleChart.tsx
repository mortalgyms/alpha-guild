import { useEffect, useMemo, useState } from "react";
import { fetchCandles, type Candles } from "@/lib/marketApi";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  symbol: string;
  resolution?: string;
  days?: number;
  height?: number;
};

export function CandleChart({ symbol, resolution = "60", days = 30, height = 460 }: Props) {
  const [data, setData] = useState<Candles | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCandles(symbol, resolution, days)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setErr(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [symbol, resolution, days]);

  const view = useMemo(() => {
    if (!data || data.s !== "ok" || !data.c?.length) return null;
    const W = 1200, H = height - 40;
    const min = Math.min(...data.l);
    const max = Math.max(...data.h);
    const range = Math.max(1e-6, max - min);
    const n = data.c.length;
    const cw = Math.max(2, (W / n) * 0.7);
    const step = W / n;
    const y = (v: number) => H - ((v - min) / range) * H;
    return { W, H, min, max, range, n, cw, step, y };
  }, [data, height]);

  if (loading) return <Skeleton style={{ height }} className="rounded-xl" />;

  if (err || !view) {
    return (
      <div
        className="rounded-xl border border-border bg-background/40 grid place-items-center text-xs text-muted-foreground"
        style={{ height }}
      >
        {err
          ? `Chart unavailable: ${err}`
          : `No candle data for ${symbol} (Finnhub free plan limits some symbols).`}
      </div>
    );
  }

  const { W, H, n, cw, step, y, min, max } = view;
  const gridLines = 5;

  return (
    <div className="relative rounded-xl border border-border bg-background/40 overflow-hidden" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H + 40}`} preserveAspectRatio="none" className="w-full h-full">
        {/* grid */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const yy = ((i + 1) / (gridLines + 1)) * H;
          const v = max - ((i + 1) / (gridLines + 1)) * (max - min);
          return (
            <g key={i}>
              <line x1={0} x2={W} y1={yy} y2={yy} stroke="hsl(var(--border))" strokeDasharray="3 6" opacity={0.4} />
              <text x={W - 4} y={yy - 2} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="monospace">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        {/* candles */}
        {data!.c.map((c, i) => {
          const o = data!.o[i];
          const h = data!.h[i];
          const l = data!.l[i];
          const up = c >= o;
          const x = i * step + (step - cw) / 2;
          const xMid = i * step + step / 2;
          const color = up ? "hsl(var(--bull))" : "hsl(var(--bear))";
          const yOpen = y(o);
          const yClose = y(c);
          const top = Math.min(yOpen, yClose);
          const bodyH = Math.max(1, Math.abs(yClose - yOpen));
          return (
            <g key={i}>
              <line x1={xMid} x2={xMid} y1={y(h)} y2={y(l)} stroke={color} strokeWidth={1} />
              <rect x={x} y={top} width={cw} height={bodyH} fill={color} opacity={0.9} />
            </g>
          );
        })}
      </svg>
      <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {n} candles · {resolution === "D" ? "1D" : `${resolution}m`}
      </div>
    </div>
  );
}
