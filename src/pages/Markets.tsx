import { SectionHeader } from "@/components/trading/SectionHeader";
import { TickerCard } from "@/components/trading/TickerCard";
import { Sparkline } from "@/components/trading/Sparkline";
import { generateSeries, watchlist } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Layers, LineChart, Maximize2, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export default function Markets() {
  const [active, setActive] = useState(watchlist[0]);
  const series = useMemo(() => generateSeries(140, active.price, active.price * 0.012), [active]);
  const tfs = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
  const [tf, setTf] = useState("4H");

  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="Markets"
        title="Charts & Markets"
        subtitle="Multi-timeframe institutional charting with smart money overlays."
        right={
          <Tabs defaultValue="all">
            <TabsList className="bg-muted/40">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fx">Forex</TabsTrigger>
              <TabsTrigger value="cr">Crypto</TabsTrigger>
              <TabsTrigger value="eq">Stocks</TabsTrigger>
              <TabsTrigger value="cm">Commodities</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Top tickers */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {watchlist.map((t) => (
          <button key={t.symbol} onClick={() => setActive(t)} className="text-left">
            <TickerCard symbol={t.symbol} name={t.name} price={t.price} changePct={t.changePct} compact className={active.symbol === t.symbol ? "border-primary/50 shadow-glow" : ""} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Chart */}
        <div className="col-span-12 lg:col-span-9 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-display text-xl font-bold">{active.symbol}</div>
                <div className="text-xs text-muted-foreground">{active.name} · {active.market}</div>
              </div>
              <Badge className={cn("border", active.changePct >= 0 ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30")}>
                {active.changePct >= 0 ? "+" : ""}{active.changePct.toFixed(2)}%
              </Badge>
              <span className="font-mono text-2xl font-bold tabular-nums">
                {active.price < 10 ? active.price.toFixed(4) : active.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {tfs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors",
                    tf === t ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8"><Crosshair className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Layers className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Settings2 className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          <div className="mt-4 relative rounded-xl border border-border bg-background/40 overflow-hidden" style={{ height: 460 }}>
            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`h${i}`} x1="0" x2="100%" y1={`${(i + 1) * 14}%`} y2={`${(i + 1) * 14}%`} stroke="hsl(var(--border))" strokeDasharray="3 6" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`v${i}`} y1="0" y2="100%" x1={`${(i + 1) * 11}%`} x2={`${(i + 1) * 11}%`} stroke="hsl(var(--border))" strokeDasharray="3 6" />
              ))}
            </svg>
            <div className="absolute inset-0 p-2">
              <Sparkline data={series} positive={active.changePct >= 0} height={440} width={1200} strokeWidth={2} />
            </div>
            {/* AI annotation */}
            <div className="absolute top-3 left-3 rounded-lg border border-secondary/40 bg-secondary/10 backdrop-blur px-2.5 py-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 text-secondary font-semibold uppercase tracking-widest">
                <LineChart className="h-3 w-3" /> AI Annotation
              </div>
              <div className="text-foreground/90 mt-0.5">Bullish FVG fill + order block reaction</div>
            </div>
            {/* Order block overlay */}
            <div className="absolute left-[60%] right-[20%] top-[55%] h-12 rounded border border-bull/40 bg-bull/10" />
            <div className="absolute left-[40%] right-[55%] top-[35%] h-8 rounded border border-bear/40 bg-bear/10" />
          </div>

          {/* Indicator strip */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { l: "RSI(14)", v: "62.4", c: "text-success" },
              { l: "MACD", v: "Bullish", c: "text-success" },
              { l: "VWAP", v: "Above", c: "text-primary" },
              { l: "ATR(14)", v: "0.0042", c: "text-warning" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-border bg-background/40 px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</span>
                <span className={cn("font-mono text-sm font-semibold", s.c)}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order panel */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4">
          <div className="font-display font-semibold mb-3">Quick Trade</div>
          <Tabs defaultValue="market">
            <TabsList className="grid grid-cols-3 bg-muted/40">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="limit">Limit</TabsTrigger>
              <TabsTrigger value="stop">Stop</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Bid</span><span>Ask</span></div>
            <div className="flex justify-between font-mono">
              <span className="text-bear">{(active.price * 0.999).toFixed(2)}</span>
              <span className="text-bull">{(active.price * 1.001).toFixed(2)}</span>
            </div>
            <div className="space-y-1.5 mt-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</label>
              <input className="w-full bg-background border border-border rounded-md px-2 py-1.5 font-mono text-sm" defaultValue="1.0" />
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Stop / Target</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input className="bg-background border border-border rounded-md px-2 py-1.5 font-mono text-xs" placeholder="SL" />
                <input className="bg-background border border-border rounded-md px-2 py-1.5 font-mono text-xs" placeholder="TP" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button className="bg-bull hover:bg-bull/90 text-background font-semibold">BUY</Button>
              <Button className="bg-bear hover:bg-bear/90 text-foreground font-semibold">SELL</Button>
            </div>
            <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-2.5 mt-3">
              <div className="text-[10px] uppercase tracking-widest text-secondary font-semibold">AI Risk Score</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success via-warning to-destructive" style={{ width: "38%" }} />
                </div>
                <span className="text-xs font-mono">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
