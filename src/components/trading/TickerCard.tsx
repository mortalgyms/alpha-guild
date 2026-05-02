import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Props = {
  symbol: string;
  name?: string;
  price: number;
  changePct: number;
  className?: string;
  compact?: boolean;
};

export function TickerCard({ symbol, name, price, changePct, className, compact }: Props) {
  const up = changePct >= 0;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur p-3 transition-all hover:border-primary/40 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{name ?? symbol}</div>
          <div className="font-mono text-sm font-semibold truncate">{symbol}</div>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
            up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          )}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {up ? "+" : ""}
          {changePct.toFixed(2)}%
        </div>
      </div>
      {!compact && (
        <div className="mt-2 font-mono text-lg font-bold tabular-nums">
          {price < 10 ? price.toFixed(4) : price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      )}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-px",
          up ? "bg-gradient-to-r from-transparent via-success/60 to-transparent" : "bg-gradient-to-r from-transparent via-destructive/60 to-transparent"
        )}
      />
    </div>
  );
}
