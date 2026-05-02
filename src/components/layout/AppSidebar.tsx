import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CandlestickChart,
  Sparkles,
  Briefcase,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  Swords,
  GraduationCap,
  Bell,
  Settings,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const trading = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Markets", url: "/markets", icon: CandlestickChart },
  { title: "AI Signals", url: "/signals", icon: Sparkles },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Journal", url: "/journal", icon: BookOpen },
];

const social = [
  { title: "Guilds", url: "/guilds", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
];

const progression = [
  { title: "Quests", url: "/quests", icon: Swords },
  { title: "Learn", url: "/learn", icon: GraduationCap },
];

const system = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const renderItem = (item: { title: string; url: string; icon: any }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive(item.url)}>
        <NavLink
          to={item.url}
          className={({ isActive: a }) =>
            `flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all ${
              a
                ? "bg-sidebar-accent text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-tight">APEX</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Terminal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Trading</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{trading.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Social</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{social.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Progression</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{progression.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{system.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed ? (
          <div className="rounded-lg bg-gradient-primary/10 border border-primary/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-primary">Pro AI</span>
              <span className="text-[10px] text-muted-foreground">Lvl 24</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-primary" />
            </div>
            <div className="mt-1.5 text-[10px] text-muted-foreground">7,420 / 10,000 XP</div>
          </div>
        ) : (
          <div className="mx-auto h-7 w-7 rounded-md bg-gradient-primary/20 grid place-items-center text-[10px] font-bold text-primary">24</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
