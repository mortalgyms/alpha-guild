import { SectionHeader } from "@/components/trading/SectionHeader";
import { notifications } from "@/lib/mockData";
import { Bell, Brain, MessageSquare, Newspaper, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  signal: { Icon: Brain, color: "text-secondary bg-secondary/15" },
  alert: { Icon: TrendingUp, color: "text-primary bg-primary/15" },
  guild: { Icon: Bell, color: "text-warning bg-warning/15" },
  dm: { Icon: MessageSquare, color: "text-primary bg-primary/15" },
  news: { Icon: Newspaper, color: "text-accent bg-accent/15" },
  risk: { Icon: ShieldAlert, color: "text-destructive bg-destructive/15" },
} as const;

export default function Notifications() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <SectionHeader eyebrow="Inbox" title="Notifications" subtitle="All your alerts in one place — sorted by priority." />
      <div className="space-y-2">
        {notifications.map((n) => {
          const { Icon, color } = iconMap[n.type];
          return (
            <div key={n.id} className={cn("rounded-xl border p-4 flex items-start gap-3 backdrop-blur-xl", n.unread ? "border-primary/30 bg-primary/5" : "border-border bg-card/40")}>
              <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{n.time} ago</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              {n.unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 animate-glow-pulse" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
