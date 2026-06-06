import { SectionHeader } from "@/components/trading/SectionHeader";
import { TickerCard } from "@/components/trading/TickerCard";
import { Sparkline } from "@/components/trading/Sparkline";
import { LiveTickerStrip } from "@/components/trading/LiveTickerStrip";
import { aiSignals, economicEvents, generateSeries, heatmapSectors, indices, watchlist } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Brain, Calendar, Flame, Sparkles, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export default function Dashboard() {
  const portfolioSeries = useMemo(() => generateSeries(96, 240, 1.6), []);
  const aiSentiment = 72; // bullish

  return (
    <div className="p-4 md:p-6 space-y-6">
      <SectionHeader
        eyebrow="Live Terminal"
        title="Good morning, Alex"
        subtitle="Markets are leaning bullish. AI confidence is HIGH across tech and FX majors. Watch FOMC at 14:00 EST."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="h-3.5 w-3.5" /> AI Briefing
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Sparkles className="h-3.5 w-3.5" /> New Trade
            </Button>
          </div>
        }
      />

      {/* Live quotes strip (Finnhub) */}
      <LiveTickerStrip />

      {/* Indices strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {indices.map((t) => (
          <TickerCard key={t.symbol} symbol={t.symbol} name={t.name} price={t.price} changePct={t.changePct} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Portfolio big card */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Portfolio Value</div>
                <div className="mt-1 font-display text-4xl font-bold tabular-nums">$248,392.18</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/20">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> +$3,241.18 (1.32%)
                  </Badge>
                  <span className="text-xs text-muted-foreground">today</span>
                </div>
              </div>
              <div className="flex gap-2">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((tf, i) => (
                  <button
                    key={tf}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors",
                      i === 1 ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={portfolioSeries} positive height={180} width={800} strokeWidth={2} />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Win Rate", v: "68.4%", c: "text-success" },
                { l: "Sharpe", v: "2.04", c: "text-primary" },
                { l: "Max DD", v: "-7.2%", c: "text-destructive" },
                { l: "Open Risk", v: "1.8%", c: "text-warning" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                  <div className={cn("mt-1 font-mono text-lg font-bold", s.c)}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Sentiment */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <Brain className="h-3.5 w-3.5" /> AI Market Sentiment
          </div>
          <div className="mt-4 relative h-40 grid place-items-center">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--bear))" />
                  <stop offset="50%" stopColor="hsl(var(--warning))" />
                  <stop offset="100%" stopColor="hsl(var(--bull))" />
                </linearGradient>
              </defs>
              <path d="M20,100 A80,80 0 0 1 180,100" stroke="hsl(var(--muted))" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path
                d="M20,100 A80,80 0 0 1 180,100"
                stroke="url(#gauge)"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * aiSentiment) / 100}
              />
              <circle cx={100 + 80 * Math.cos(Math.PI * (1 - aiSentiment / 100))} cy={100 - 80 * Math.sin(Math.PI * (1 - aiSentiment / 100))} r="6" fill="hsl(var(--primary))" className="drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </svg>
            <div className="absolute inset-x-0 bottom-2 text-center">
              <div className="font-display text-3xl font-bold gradient-text">{aiSentiment}</div>
              <div className="text-[10px] uppercase tracking-widest text-success font-semibold">Bullish</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="rounded-md bg-bull/10 border border-bull/30 py-1.5">
              <div className="text-bull font-bold">42%</div>
              <div className="text-muted-foreground">Long</div>
            </div>
            <div className="rounded-md bg-muted/40 border border-border py-1.5">
              <div className="font-bold">35%</div>
              <div className="text-muted-foreground">Neutral</div>
            </div>
            <div className="rounded-md bg-bear/10 border border-bear/30 py-1.5">
              <div className="text-bear font-bold">23%</div>
              <div className="text-muted-foreground">Short</div>
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Watchlist</h3>
            </div>
            <Link to="/markets" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-1">
            {watchlist.map((t) => (
              <Link
                key={t.symbol}
                to="/markets"
                className="grid grid-cols-12 gap-3 items-center rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="col-span-4 min-w-0">
                  <div className="font-mono text-sm font-semibold truncate">{t.symbol}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{t.name}</div>
                </div>
                <div className="col-span-4">
                  <Sparkline positive={t.changePct >= 0} height={28} width={140} />
                </div>
                <div className="col-span-2 text-right font-mono text-sm tabular-nums">
                  {t.price < 10 ? t.price.toFixed(4) : t.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className={cn("col-span-2 text-right text-xs font-semibold tabular-nums", t.changePct >= 0 ? "text-success" : "text-destructive")}>
                  {t.changePct >= 0 ? "+" : ""}{t.changePct.toFixed(2)}%
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Signals */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <h3 className="font-display font-semibold">AI Trade Signals</h3>
            </div>
            <Link to="/signals" className="text-xs text-primary hover:underline">All signals →</Link>
          </div>
          <div className="space-y-2">
            {aiSignals.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{s.symbol}</span>
                    <Badge
                      className={cn(
                        "text-[10px] border",
                        s.direction === "LONG"
                          ? "bg-bull/10 text-bull border-bull/30"
                          : "bg-bear/10 text-bear border-bear/30"
                      )}
                    >
                      {s.direction === "LONG" ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {s.direction}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{s.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full", s.confidence >= 80 ? "bg-success" : s.confidence >= 65 ? "bg-warning" : "bg-muted-foreground")} style={{ width: `${s.confidence}%` }} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold">{s.confidence}%</span>
                  </div>
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">{s.setup}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <h3 className="font-display font-semibold">Sector Heatmap</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">S&P 500 · today</span>
          </div>
          <div className="grid grid-cols-5 gap-2 auto-rows-[80px]">
            {heatmapSectors.map((s) => {
              const intensity = Math.min(1, Math.abs(s.change) / 2);
              const bg = s.change >= 0
                ? `hsl(var(--bull) / ${0.15 + intensity * 0.5})`
                : `hsl(var(--bear) / ${0.15 + intensity * 0.5})`;
              const span = s.weight > 12 ? "col-span-2" : "col-span-1";
              return (
                <div
                  key={s.name}
                  className={cn("rounded-lg p-3 flex flex-col justify-between border border-white/5", span)}
                  style={{ background: bg }}
                >
                  <div className="text-xs font-semibold">{s.name}</div>
                  <div className="text-right font-mono text-sm font-bold">
                    {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Economic calendar */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Economic Calendar</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">Today · USD</span>
          </div>
          <div className="space-y-1.5">
            {economicEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40">
                <span className="font-mono text-xs text-muted-foreground w-12">{e.time}</span>
                <span className="text-base">{e.flag}</span>
                <span className="flex-1 text-xs truncate">{e.event}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] border",
                    e.impact === "High" ? "border-destructive/40 text-destructive" : e.impact === "Med" ? "border-warning/40 text-warning" : "border-border text-muted-foreground"
                  )}
                >
                  {e.impact === "High" && <Flame className="h-3 w-3 mr-0.5" />} {e.impact}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
