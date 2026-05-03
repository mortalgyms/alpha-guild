import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { TickerCard } from "@/components/trading/TickerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

const DEFAULT_SYMBOLS = ["AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "GOOGL", "META", "SPY"];

type Props = { symbols?: string[]; compact?: boolean };

export function LiveTickerStrip({ symbols = DEFAULT_SYMBOLS, compact }: Props) {
  const { quotes, loading, error } = useLiveQuotes(symbols, 15000);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Activity className="h-3 w-3 text-success animate-pulse" />
          Live Quotes · Finnhub
        </div>
        {error && <span className="text-[10px] text-destructive">{error}</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {symbols.map((s) => {
          const q = quotes[s];
          if (loading && !q) return <Skeleton key={s} className="h-[72px] rounded-xl" />;
          if (!q || q.error || !q.price) {
            return (
              <div key={s} className="rounded-xl border border-border bg-card/40 p-3 text-xs text-muted-foreground">
                <div className="font-mono font-semibold text-sm text-foreground">{s}</div>
                <div className="mt-1 text-[10px]">No data</div>
              </div>
            );
          }
          return (
            <TickerCard
              key={s}
              symbol={s}
              name={s}
              price={q.price}
              changePct={q.changePct ?? 0}
              compact={compact}
            />
          );
        })}
      </div>
    </div>
  );
}
