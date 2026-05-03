import { Bell, Search, Command, LogOut, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "@/lib/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function TopBar() {
  const unread = notifications.filter((n) => n.unread).length;
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const initials = (user?.user_metadata?.display_name || user?.email || "U").slice(0, 2).toUpperCase();
  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Trader";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        {/* Live status */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-success font-semibold">Live · NYSE</span>
        </div>

        {/* Search */}
        <div className="relative ml-auto md:ml-4 md:flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search symbols, traders, signals…"
            className="h-9 pl-9 pr-16 bg-muted/40 border-border focus-visible:ring-primary/40 text-sm"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Quick stats */}
          <div className="hidden lg:flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-1.5 font-mono text-xs">
            <span className="text-muted-foreground">PnL</span>
            <span className="text-success font-semibold">+$3,241.18</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-success">+1.32%</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-strong">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="text-[10px]">{unread} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{n.body}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="text-center text-xs justify-center">View all notifications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile chip */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-full border border-border bg-card/60 pl-1 pr-3 py-1 hover:border-primary/40 transition-colors"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
              AC
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-semibold">Alex Chen</span>
              <span className="text-[9px] uppercase tracking-widest text-primary">Strategist</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
