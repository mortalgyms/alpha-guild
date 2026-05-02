import { SectionHeader } from "@/components/trading/SectionHeader";
import { aiSignals } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Signals() {
  const signals = [...aiSignals, ...aiSignals.map((s) => ({ ...s, id: s.id + "b" }))];
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="AI Engine"
        title="AI Trade Signals"
        subtitle="High-confidence setups generated from smart money concepts, institutional flow, and probability scoring."
        right={
          <Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Generate Setup
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {signals.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-lg font-bold">{s.symbol}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.timeframe} · {s.age} ago</div>
              </div>
              <Badge className={cn("border text-xs", s.direction === "LONG" ? "bg-bull/15 text-bull border-bull/30" : "bg-bear/15 text-bear border-bear/30")}>
                {s.direction === "LONG" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {s.direction}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{s.setup}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>AI Confidence</span>
                <span className="text-foreground font-mono">{s.confidence}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full", s.confidence >= 80 ? "bg-success" : s.confidence >= 65 ? "bg-warning" : "bg-muted-foreground")} style={{ width: `${s.confidence}%` }} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="rounded-md bg-background/40 border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Entry</div>
                <div className="font-semibold">{s.entry}</div>
              </div>
              <div className="rounded-md bg-bull/10 border border-bull/30 p-2">
                <div className="text-[10px] text-bull">Target</div>
                <div className="font-semibold text-bull">{s.target}</div>
              </div>
              <div className="rounded-md bg-bear/10 border border-bear/30 p-2">
                <div className="text-[10px] text-bear">Stop</div>
                <div className="font-semibold text-bear">{s.stop}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Details</Button>
              <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground">Take Trade</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
