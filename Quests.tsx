import { SectionHeader } from "@/components/trading/SectionHeader";
import { leaderboard } from "@/lib/mockData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="Rankings"
        title="Global Leaderboard"
        subtitle="Top performers across all guilds, regions, and timeframes."
        right={
          <Tabs defaultValue="weekly">
            <TabsList className="bg-muted/40">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all">All-time</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((t, idx) => {
          const place = [2, 1, 3][idx];
          const heights = ["h-32", "h-40", "h-28"];
          const colors = [
            "bg-gradient-to-b from-zinc-300 to-zinc-500",
            "bg-gradient-rank",
            "bg-gradient-to-b from-orange-400 to-orange-700",
          ];
          return (
            <div key={t.username} className="flex flex-col items-center justify-end">
              <div className="text-3xl mb-2">{t.country}</div>
              <div className="font-display font-bold">{t.username}</div>
              <div className="text-[10px] text-muted-foreground">{t.guild}</div>
              <div className="text-success font-mono text-xs mt-1">+${(t.pnl / 1000).toFixed(0)}K</div>
              <div className={cn("mt-2 w-full rounded-t-lg grid place-items-center text-3xl font-black text-white", heights[idx], colors[idx])}>
                #{place}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left p-3 font-medium">Rank</th>
                <th className="text-left font-medium">Trader</th>
                <th className="text-left font-medium">Guild</th>
                <th className="text-right font-medium">PnL</th>
                <th className="text-right font-medium">Win%</th>
                <th className="text-right font-medium">Sharpe</th>
                <th className="text-right font-medium">ROI</th>
                <th className="text-right font-medium">XP</th>
                <th className="text-right p-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((t) => (
                <tr key={t.rank} className={cn("border-t border-border hover:bg-muted/30", t.username === "You" && "bg-primary/5")}>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {t.rank <= 3 && <Trophy className={cn("h-3.5 w-3.5", t.rank === 1 ? "text-warning" : t.rank === 2 ? "text-zinc-300" : "text-orange-400")} />}
                      <span className="font-mono font-bold">#{t.rank}</span>
                    </div>
                  </td>
                  <td><span className="mr-2">{t.country}</span><span className={cn("font-semibold", t.username === "You" && "text-primary")}>{t.username}</span></td>
                  <td className="text-muted-foreground text-xs">{t.guild}</td>
                  <td className="text-right font-mono text-success font-semibold">+${(t.pnl / 1000).toFixed(1)}K</td>
                  <td className="text-right font-mono">{t.winRate}%</td>
                  <td className="text-right font-mono">{t.sharpe}</td>
                  <td className="text-right font-mono text-success">+{t.roi}%</td>
                  <td className="text-right font-mono text-primary">{t.xp.toLocaleString()}</td>
                  <td className="text-right p-3">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border",
                      t.risk === "Low" ? "border-success/30 text-success bg-success/10" :
                      t.risk === "Med" ? "border-warning/30 text-warning bg-warning/10" :
                      "border-destructive/30 text-destructive bg-destructive/10"
                    )}>{t.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
