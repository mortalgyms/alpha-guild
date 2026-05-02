import { SectionHeader } from "@/components/trading/SectionHeader";
import { quests } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Quests() {
  const grouped = {
    daily: quests.filter((q) => q.type === "daily"),
    weekly: quests.filter((q) => q.type === "weekly"),
    boss: quests.filter((q) => q.type === "boss"),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <SectionHeader eyebrow="Progression" title="Quests & Boss Battles" subtitle="Complete challenges to earn XP, badges, and rank boosts." />

      {/* XP banner */}
      <div className="rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/15 via-warning/5 to-transparent p-5 flex items-center gap-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-rank text-3xl font-black text-background shadow-glow">24</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">Strategist</span>
            <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">Tier IV</Badge>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-rank" style={{ width: "74%" }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">7,420 / 10,000 XP to <span className="text-foreground font-semibold">Hedge Fund Elite</span></div>
        </div>
      </div>

      {(["daily", "weekly", "boss"] as const).map((kind) => (
        <section key={kind}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-lg font-bold capitalize">{kind === "boss" ? "Boss Battles" : `${kind} Quests`}</h3>
            <Badge variant="secondary" className="text-[10px]">{grouped[kind].length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {grouped[kind].map((q) => (
              <div
                key={q.id}
                className={cn(
                  "rounded-2xl p-4 border backdrop-blur-xl transition-all hover:-translate-y-0.5",
                  kind === "boss"
                    ? "border-destructive/40 bg-gradient-to-br from-destructive/15 to-card/40 shadow-card"
                    : "border-border bg-card/40"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{q.icon}</div>
                  <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">+{q.reward} XP</Badge>
                </div>
                <h4 className="mt-2 font-display font-bold">{q.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full", kind === "boss" ? "bg-gradient-bear" : "bg-gradient-primary")}
                      style={{ width: `${(q.progress / q.total) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{q.progress} / {q.total}</div>
                </div>
                <Button size="sm" variant={kind === "boss" ? "destructive" : "outline"} className="w-full mt-3">
                  {kind === "boss" ? "Enter Battle" : "Start"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
