import { SectionHeader } from "@/components/trading/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

const entries = [
  { date: "Today", symbol: "EUR/USD", side: "Long", pnl: 421, r: 1.8, note: "Demand zone bounce, clean execution.", emotion: "🧘 Calm" },
  { date: "Today", symbol: "NVDA", side: "Long", pnl: 982, r: 2.4, note: "Followed AI signal, scaled out at FVG.", emotion: "💪 Confident" },
  { date: "Yesterday", symbol: "GBP/JPY", side: "Short", pnl: -180, r: -1, note: "Stopped at session high, valid risk.", emotion: "😐 Neutral" },
  { date: "Yesterday", symbol: "Gold", side: "Short", pnl: 312, r: 1.5, note: "Sold liquidity sweep at NY open.", emotion: "🎯 Focused" },
];

export default function Journal() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="Journal"
        title="Trade Journal"
        subtitle="Log every trade with emotion, reasoning, and outcome. AI reviews patterns weekly."
        right={<Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground"><Plus className="h-3.5 w-3.5" /> New Entry</Button>}
      />
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="md:w-24">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{e.date}</div>
              <div className="font-mono font-bold">{e.symbol}</div>
            </div>
            <Badge className={e.side === "Long" ? "bg-bull/15 text-bull border-bull/30" : "bg-bear/15 text-bear border-bear/30"}>{e.side}</Badge>
            <div className="md:flex-1 text-sm text-muted-foreground"><BookOpen className="inline h-3.5 w-3.5 mr-1.5 text-primary" />{e.note}</div>
            <div className="text-xs">{e.emotion}</div>
            <div className="md:w-24 text-right">
              <div className={`font-mono font-bold ${e.pnl >= 0 ? "text-success" : "text-destructive"}`}>{e.pnl >= 0 ? "+" : ""}${e.pnl}</div>
              <div className="text-[10px] text-muted-foreground">{e.r >= 0 ? "+" : ""}{e.r}R</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
