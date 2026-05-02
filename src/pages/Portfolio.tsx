import { SectionHeader } from "@/components/trading/SectionHeader";
import { Sparkline } from "@/components/trading/Sparkline";
import { generateSeries, watchlist } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export default function Portfolio() {
  const series = useMemo(() => generateSeries(120, 248, 1.4), []);
  const positions = watchlist.slice(0, 6).map((t, i) => ({
    ...t,
    qty: [0.45, 2.1, 50000, 100, 5, 200][i],
    avg: t.price * (1 - 0.04 + Math.random() * 0.08),
    pnl: ((Math.random() - 0.4) * 5000),
  }));

  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader eyebrow="Portfolio" title="Holdings & Performance" subtitle="Real-time PnL, exposure, and risk analytics across all positions." />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Equity Curve · 30D</div>
              <div className="mt-1 font-display text-3xl font-bold">$248,392.18</div>
            </div>
            <Badge className="bg-success/15 text-success border-success/30">+18.4% MTD</Badge>
          </div>
          <Sparkline data={series} positive height={200} width={800} strokeWidth={2} />
        </div>
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 space-y-3">
          {[
            { l: "Total PnL", v: "+$48,213", c: "text-success" },
            { l: "Realized PnL", v: "+$31,420", c: "text-success" },
            { l: "Unrealized PnL", v: "+$16,793", c: "text-success" },
            { l: "Gross Exposure", v: "$612,400", c: "text-foreground" },
            { l: "Net Exposure", v: "+$248,392", c: "text-primary" },
            { l: "Leverage", v: "2.46x", c: "text-warning" },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
              <span className="text-xs text-muted-foreground">{s.l}</span>
              <span className={cn("font-mono text-sm font-semibold", s.c)}>{s.v}</span>
            </div>
          ))}
        </div>

        <div className="col-span-12 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <h3 className="font-display font-semibold mb-3">Open Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="text-left py-2 font-medium">Symbol</th>
                  <th className="text-right font-medium">Qty</th>
                  <th className="text-right font-medium">Avg</th>
                  <th className="text-right font-medium">Mark</th>
                  <th className="text-right font-medium">PnL</th>
                  <th className="text-right font-medium">Chg</th>
                  <th className="text-right font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.symbol} className="border-t border-border hover:bg-muted/30">
                    <td className="py-2.5 font-mono font-semibold">{p.symbol}</td>
                    <td className="text-right font-mono">{p.qty}</td>
                    <td className="text-right font-mono">{p.avg.toFixed(2)}</td>
                    <td className="text-right font-mono">{p.price.toFixed(2)}</td>
                    <td className={cn("text-right font-mono font-semibold", p.pnl >= 0 ? "text-success" : "text-destructive")}>
                      {p.pnl >= 0 ? "+" : ""}${Math.abs(p.pnl).toFixed(0)}
                    </td>
                    <td className={cn("text-right font-mono", p.changePct >= 0 ? "text-success" : "text-destructive")}>
                      {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(2)}%
                    </td>
                    <td className="py-2.5"><div className="ml-auto w-24"><Sparkline positive={p.changePct >= 0} height={24} width={96} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
