import { dms, guildChannels, sampleConversation } from "@/lib/mockData";
import { Hash, Phone, Search, Send, Smile, Paperclip, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [activeDM, setActiveDM] = useState(dms[0]);
  return (
    <div className="h-[calc(100vh-3.5rem)] grid grid-cols-12">
      {/* Sidebar list */}
      <aside className="col-span-12 md:col-span-3 border-r border-border bg-card/30 flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="font-display font-semibold mb-2">Messages</div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search…" className="h-8 pl-8 bg-muted/40 text-xs" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Guild · Apex Alpha</div>
            <div className="space-y-0.5">
              {guildChannels.map((c) => (
                <button key={c.id} className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />{c.name}</span>
                  {c.unread && <span className="h-4 min-w-4 px-1 grid place-items-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">{c.unread}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Direct Messages</div>
            <div className="space-y-1">
              {dms.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDM(d)}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 text-left",
                    activeDM.id === d.id && "bg-muted/60"
                  )}
                >
                  <div className="relative">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">{d.avatar}</div>
                    {d.online && <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{d.user}</span>
                      <span className="text-[10px] text-muted-foreground">{d.time}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{d.last}</div>
                  </div>
                  {d.unread && <span className="h-4 min-w-4 px-1 grid place-items-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">{d.unread}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Conversation */}
      <section className="col-span-12 md:col-span-9 flex flex-col">
        <header className="h-14 px-4 border-b border-border flex items-center justify-between bg-card/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{activeDM.avatar}</div>
              {activeDM.online && <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-background" />}
            </div>
            <div>
              <div className="text-sm font-semibold">{activeDM.user}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {activeDM.online ? <><span className="h-1.5 w-1.5 rounded-full bg-success" /> Online</> : "Last seen 2h ago"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-glow">
          {sampleConversation.map((m) => (
            <div key={m.id} className={cn("flex items-end gap-2", m.me && "flex-row-reverse")}>
              {!m.me && <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{m.avatar}</div>}
              <div className={cn(
                "max-w-md rounded-2xl px-3.5 py-2 text-sm",
                m.me ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
              )}>
                {m.text}
                <div className={cn("mt-0.5 flex items-center gap-1 text-[10px] opacity-70", m.me ? "justify-end text-primary-foreground" : "text-muted-foreground")}>
                  <span>{m.time}</span>
                  {m.me && (m.readReceipt === "read" ? <CheckCheck className="h-3 w-3 text-blue-300" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
            <div className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
            </div>
            {activeDM.user} is typing…
          </div>
        </div>

        <div className="p-3 border-t border-border bg-card/30">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Paperclip className="h-4 w-4" /></Button>
            <input placeholder="Send a message…" className="flex-1 bg-transparent outline-none text-sm" />
            <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="h-4 w-4" /></Button>
            <Button size="icon" className="h-7 w-7 bg-gradient-primary text-primary-foreground"><Send className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
