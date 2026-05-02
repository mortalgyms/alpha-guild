import { SectionHeader } from "@/components/trading/SectionHeader";
import { guilds } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Guilds() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader
        eyebrow="Social"
        title="Trading Guilds"
        subtitle="Join elite trading desks. Compete, share setups, and grow together."
        right={<Button size="sm" className="gap-2 bg-gradient-primary text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Create Guild</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {guilds.map((g) => (
          <div key={g.id} className="group rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 relative overflow-hidden hover:border-primary/40 transition-all">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-primary opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{g.emblem}</div>
                <Badge className="bg-warning/15 text-warning border-warning/30"><Trophy className="h-3 w-3 mr-1" />#{g.rank}</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{g.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{g.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{g.members} members</span>
                <span className="font-mono font-bold text-success">+${(g.pnl / 1000).toFixed(0)}K</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/messages">View</Link>
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground">Join</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
