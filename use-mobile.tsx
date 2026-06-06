import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/trading/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCandles, type Candles } from "@/lib/marketApi";
import { buildSignals, type ValidatedSignal } from "@/lib/signalEngine";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";

const SIGNAL_SYMBOLS = ["NVDA", "SPY", "BTCUSD", "ETHUSD", "EURUSD", "GBPUSD"];
const SIGNAL_TIMEFRAME = "1H";

export default function Signals() {
  const { quotes, loading: quotesLoading, streamStatus } = useLiveQuotes(SIGNAL_SYMBOLS, 15000);
  const [candles, setCandles] = useState<Record<string, Candles>>({});
  const [loadingCandles, setLoadingCandles] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingCandles(true);

    Promise.all(
      SIGNAL_SYMBOLS.map(async (symbol) => {
        const data = await fetchCandles(symbol, "60", 14);
        return [symbol, data] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setCandles(Object.fromEntries(entries));
      })
      .finally(() => !cancelled && setLoadingCandles(false));

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const signals = useMemo(
    () => buildSignals(SIGNAL_SYMBOLS, quotes, candles, SIGNAL_TIMEFRAME),
    [quotes, candles]
  );
  const accepted = signals.filter((signal) => signal.status === "accepted");
  const rejected = signals.filter((signal) => signal.status === "rejected");
  const loading = quotesLoading || loadingCandles;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="AI Engine"
        title="AI Trade Signals"
        subtitle={`Signals are generated only after data freshness validation. Stream: ${streamStatus}.`}
        right={
          <Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCw className="h-3.5 w-3.5" /> Revalidate
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <HealthCard label="Accepted" value={accepted.length} tone="success" />
        <HealthCard label="Rejected" value={rejected.length} tone="destructive" />
        <HealthCard label="Stream" value={streamStatus} tone={streamStatus === "live" ? "success" : "warning"} />
        <HealthCard label="Symbols" value={SIGNAL_SYMBOLS.length} tone="neutral" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SIGNAL_SYMBOLS.map((symbol) => <Skeleton key={symbol} className="h-56 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <SignalGrid title="Accepted Setups" empty="No accepted live setups. The engine is correctly refusing weak or stale candidates." signals={accepted} />
          <SignalGrid title="Rejected Candidates" empty="No rejected candidates." signals={rejected} rejected />
        </>
      )}
    </div>
  );
}

function HealthCard({ label, value, tone }: { label: string; value: string | number; tone: "success" | "warning" | "destructive" | "neutral" }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-bold capitalize", toneClass(tone))}>{value}</div>
    </div>
  );
}

function SignalGrid({ title, empty, signals, rejected }: { title: string; empty: string; signals: ValidatedSignal[]; rejected?: boolean }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {rejected ? <ShieldAlert className="h-4 w-4 text-warning" /> : <Sparkles className="h-4 w-4 text-primary" />}
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>

      {!signals.length ? (
        <div className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {signals.map((signal) => <SignalCard key={signal.id} signal={signal} rejected={rejected} />)}
        </div>
      )}
    </section>
  );
}

function SignalCard({ signal, rejected }: { signal: ValidatedSignal; rejected?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-lg font-bold">{signal.symbol}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {signal.timeframe} | {signal.dataStatus} | {signal.sourceProvider}
          </div>
        </div>
        <Badge className={cn("border text-xs", signal.direction === "LONG" ? "bg-bull/15 text-bull border-bull/30" : "bg-bear/15 text-bear border-bear/30")}>
          {signal.direction === "LONG" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {signal.direction}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{rejected ? signal.reason : signal.setup}</p>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>{rejected ? "Validation" : "Confidence"}</span>
          <span className="text-foreground font-mono">{signal.confidence}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn("h-full", signal.confidence >= 80 ? "bg-success" : signal.confidence >= 65 ? "bg-warning" : "bg-muted-foreground")} style={{ width: `${Math.max(8, signal.confidence)}%` }} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
        <Metric label="Entry" value={signal.entry} />
        <Metric label="Target" value={signal.target} tone="bull" />
        <Metric label="Stop" value={signal.stop} tone="bear" />
      </div>
      <div className="mt-3 rounded-md border border-border bg-background/40 p-2 text-[10px] text-muted-foreground">
        RR {signal.riskReward.toFixed(2)} | Source {formatSignalTime(signal.sourceTimestamp)}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "bull" | "bear" }) {
  return (
    <div className={cn("rounded-md bg-background/40 border border-border p-2", tone === "bull" && "bg-bull/10 border-bull/30", tone === "bear" && "bg-bear/10 border-bear/30")}>
      <div className={cn("text-[10px] text-muted-foreground", tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>{label}</div>
      <div className={cn("font-semibold", tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>{formatSignalPrice(value)}</div>
    </div>
  );
}

function toneClass(tone: "success" | "warning" | "destructive" | "neutral") {
  if (tone === "success") return "text-success";
  if (tone === "warning") return "text-warning";
  if (tone === "destructive") return "text-destructive";
  return "text-foreground";
}

function formatSignalPrice(value: number) {
  if (!value) return "-";
  if (Math.abs(value) < 10) return value.toFixed(4);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatSignalTime(value: number | null) {
  if (!value) return "unknown";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
