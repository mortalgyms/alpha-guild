import { SectionHeader } from "@/components/trading/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Target, TrendingUp, Zap } from "lucide-react";

const badges = [
  { icon: "🎯", name: "Sniper", desc: "10 winning trades in a row" },
  { icon: "🛡️", name: "Iron Risk", desc: "30 days under 1% risk" },
  { icon: "🧠", name: "Mind Master", desc: "Completed psychology track" },
  { icon: "⚔️", name: "FOMC Slayer", desc: "Beat 3 FOMC boss battles" },
  { icon: "🐺", name: "Pack Leader", desc: "Top 3 in your guild" },
  { icon: "🔥", name: "Hot Streak", desc: "5-day profitable streak" },
];

export default function Profile() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-primary shadow-glow text-3xl font-black text-primary-foreground">AC</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">Alex Chen</h1>
              <Badge className="bg-warning/15 text-warning border-warning/30">Strategist · Lvl 24</Badge>
              <Badge variant="outline">🌍 Global</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Guild · <span className="text-foreground">Apex Alpha</span> · Joined 2024</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
              {[
                { l: "Total PnL", v: "+$198K", c: "text-success", I: TrendingUp },
                { l: "Win Rate", v: "68.4%", c: "text-primary", I: Target },
                { l: "XP", v: "98,421", c: "text-warning", I: Zap },
                { l: "Badges", v: "12", c: "text-secondary", I: Award },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-background/40 p-3">
                  <s.I className={`h-3.5 w-3.5 ${s.c}`} />
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                  <div className={`font-mono text-lg font-bold ${s.c}`}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <SectionHeader title="Achievements" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {badges.map((b) => (
          <div key={b.name} className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-4 text-center hover:border-primary/40 transition-all hover:-translate-y-0.5">
            <div className="text-4xl">{b.icon}</div>
            <div className="mt-2 font-semibold text-sm">{b.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
