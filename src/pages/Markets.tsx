import { SectionHeader } from "@/components/trading/SectionHeader";
import { TickerCard } from "@/components/trading/TickerCard";
import { CandleChart } from "@/components/trading/CandleChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Layers, LineChart, Maximize2, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { Skeleton } from "@/components/ui/skeleton";

type MarketType = "Stocks" | "Crypto" | "Forex";
type MarketFilter = "all" | MarketType;

const UNIVERSE = [
  { symbol: "AAPL", name: "Apple", market: "Stocks" as MarketType },
  { symbol: "NVDA", name: "NVIDIA", market: "Stocks" as MarketType },
  { symbol: "MSFT", name: "Microsoft", market: "Stocks" as MarketType },
  { symbol: "TSLA", name: "Tesla", market: "Stocks" as MarketType },
  { symbol: "AMZN", name: "Amazon", market: "Stocks" as MarketType },
  { symbol: "GOOGL", name: "Alphabet", market: "Stocks" as MarketType },
  { symbol: "META", name: "Meta", market: "Stocks" as MarketType },
  { symbol: "SPY", name: "S&P 500 ETF", market: "Stocks" as MarketType },
  { symbol: "BTCUSD", name: "Bitcoin / USD", market: "Crypto" as MarketType },
  { symbol: "ETHUSD", name: "Ethereum / USD", market: "Crypto" as MarketType },
  { symbol: "SOLUSD", name: "Solana / USD", market: "Crypto" as MarketType },
  { symbol: "XRPUSD", name: "XRP / USD", market: "Crypto" as MarketType },
  { symbol: "EURUSD", name: "Euro / US Dollar", market: "Forex" as MarketType },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", market: "Forex" as MarketType },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", market: "Forex" as MarketType },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", market: "Forex" as MarketType },
];

const TF_TO_RES: Record<string, { resolution: string; days: number }> = {
  "5m":  { resolution: "5",  days: 2 },
  "15m": { resolution: "15", days: 5 },
  "1H":  { resolution: "60", days: 14 },
  "4H":  { resolution: "240", days: 60 },
  "1D":  { resolution: "D",  days: 365 },
};

export default function Markets() {
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const filteredUniverse = useMemo(
    () => marketFilter === "all" ? UNIVERSE : UNIVERSE.filter((u) => u.market === marketFilter),
    [marketFilter]
  );
  const symbols = useMemo(() => filteredUniverse.map((u) => u.symbol), [filteredUniverse]);
  const { quotes, loading } = useLiveQuotes(symbols, 15000);
  const [activeSymbol, setActiveSymbol] = useState(UNIVERSE[0].symbol);
  const active = UNIVERSE.find((u) => u.symbol === activeSymbol)!;
  const q = quotes[activeSymbol];
  const [tf, setTf] = useState("1H");
  const tfCfg = TF_TO_RES[tf];

  useEffect(() => {
    if (!filteredUniverse.some((u) => u.symbol === activeSymbol)) {
      setActiveSymbol(filteredUniverse[0].symbol);
    }
  }, [activeSymbol, filteredUniverse]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="Markets"
        title="Charts & Markets"
        subtitle="Stocks, crypto, and forex with resilient quotes and candles."
        right={
          <Tabs value={marketFilter} onValueChange={(value) => setMarketFilter(value as MarketFilter)}>
            <TabsList className="bg-muted/40">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Stocks">Stocks</TabsTrigger>
              <TabsTrigger value="Crypto">Crypto</TabsTrigger>
              <TabsTrigger value="Forex">Forex</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Top tickers (live) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {filteredUniverse.map((t) => {
          const lq = quotes[t.symbol];
          if (loading && !lq) return <Skeleton key={t.symbol} className="h-[72px] rounded-xl" />;
          return (
            <button key={t.symbol} onClick={() => setActiveSymbol(t.symbol)} className="text-left">
              <TickerCard
                symbol={t.symbol}
                name={t.name}
                price={lq?.price ?? 0}
                changePct={lq?.changePct ?? 0}
                compact
                className={activeSymbol === t.symbol ? "border-primary/50 shadow-glow" : ""}
              />
            </button>
          );
        })}
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
              {q && (
                <Badge className={cn("border", (q.changePct ?? 0) >= 0 ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30")}>
                  {(q.changePct ?? 0) >= 0 ? "+" : ""}{(q.changePct ?? 0).toFixed(2)}%
                </Badge>
              )}
              <span className="font-mono text-2xl font-bold tabular-nums">
                {q?.price ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Object.keys(TF_TO_RES).map((t) => (
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

          <div className="mt-4 relative">
            <CandleChart symbol={activeSymbol} resolution={tfCfg.resolution} days={tfCfg.days} height={460} />
            <div className="absolute top-3 left-24 rounded-lg border border-secondary/40 bg-secondary/10 backdrop-blur px-2.5 py-1.5 text-[10px] pointer-events-none">
              <div className="flex items-center gap-1.5 text-secondary font-semibold uppercase tracking-widest">
                <LineChart className="h-3 w-3" /> AI Annotation
              </div>
              <div className="text-foreground/90 mt-0.5">Live candles · resilient feed</div>
            </div>
          </div>

          {/* Quote strip */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { l: "Open", v: q?.open },
              { l: "High", v: q?.high },
              { l: "Low", v: q?.low },
              { l: "Prev Close", v: q?.prevClose },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-border bg-background/40 px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {s.v ? s.v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                </span>
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
              <span className="text-bear">{q?.price ? (q.price * 0.999).toFixed(2) : "—"}</span>
              <span className="text-bull">{q?.price ? (q.price * 1.001).toFixed(2) : "—"}</span>
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
