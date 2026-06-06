import { SectionHeader } from "@/components/trading/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, GraduationCap, PlayCircle } from "lucide-react";

const lessons = [
  { title: "Smart Money Concepts 101", level: "Beginner", duration: "24m", category: "Price Action", img: "from-primary to-secondary" },
  { title: "Order Blocks & Fair Value Gaps", level: "Intermediate", duration: "38m", category: "SMC", img: "from-secondary to-accent" },
  { title: "Risk Management for Pros", level: "Advanced", duration: "1h 12m", category: "Risk", img: "from-warning to-destructive" },
  { title: "Reading the Macro Calendar", level: "Intermediate", duration: "42m", category: "Macro", img: "from-success to-primary" },
  { title: "Trading Psychology Mastery", level: "All Levels", duration: "55m", category: "Mindset", img: "from-accent to-primary" },
  { title: "Volume Profile Deep Dive", level: "Advanced", duration: "1h 04m", category: "Indicators", img: "from-primary to-success" },
];

export default function Learn() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader eyebrow="Education" title="AI Learning Hub" subtitle="Adaptive lessons, AI mentor breakdowns, and replay analysis tailored to your style." />

      {/* AI mentor */}
      <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-card/40 to-card/20 backdrop-blur-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.25em] text-secondary font-semibold">AI Mentor</div>
          <h3 className="font-display text-lg font-bold mt-0.5">Today's recommendation: Order Block Confluence</h3>
          <p className="text-sm text-muted-foreground mt-1">Based on your last 14 trades, deepening your entries with order block + FVG confluence could improve win rate by ~6%.</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground gap-2"><PlayCircle className="h-4 w-4" /> Start Lesson</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {lessons.map((l) => (
          <div key={l.title} className="group rounded-2xl border border-border bg-card/40 backdrop-blur-xl overflow-hidden hover:border-primary/40 transition-all">
            <div className={`relative h-32 bg-gradient-to-br ${l.img} overflow-hidden`}>
              <div className="absolute inset-0 grid place-items-center">
                <GraduationCap className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform" />
              </div>
              <Badge className="absolute top-2 right-2 bg-background/70 backdrop-blur border-0 text-[10px]">{l.duration}</Badge>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l.category} · {l.level}</div>
              <h4 className="mt-1 font-display font-bold">{l.title}</h4>
              <Button variant="outline" size="sm" className="w-full mt-3 gap-2"><PlayCircle className="h-3.5 w-3.5" /> Start</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
