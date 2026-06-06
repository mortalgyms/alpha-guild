import { SectionHeader } from "@/components/trading/SectionHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <SectionHeader eyebrow="Account" title="Settings" subtitle="Profile, preferences, security, and API." />

      <section className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 space-y-4">
        <h3 className="font-display font-semibold">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label>Display name</Label><Input defaultValue="Alex Chen" className="mt-1" /></div>
          <div><Label>Email</Label><Input defaultValue="alex@apex.dev" className="mt-1" /></div>
          <div><Label>Country</Label><Input defaultValue="🌍 Global" className="mt-1" /></div>
          <div><Label>Guild</Label><Input defaultValue="Apex Alpha" className="mt-1" /></div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 space-y-4">
        <h3 className="font-display font-semibold">Preferences</h3>
        {[
          { l: "AI trade signals", d: "Receive high-confidence setups" },
          { l: "Voice channel notifications", d: "Ping when guild voice opens" },
          { l: "Sound alerts", d: "Audio cue on price hits" },
          { l: "Real-time presence", d: "Show online status to guild" },
        ].map((p) => (
          <div key={p.l} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{p.l}</div>
              <div className="text-xs text-muted-foreground">{p.d}</div>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5">
        <h3 className="font-display font-semibold">Security</h3>
        <div className="mt-3 space-y-3">
          <Button variant="outline" className="w-full justify-start">Enable Multi-Factor Authentication</Button>
          <Button variant="outline" className="w-full justify-start">Manage Devices</Button>
          <Button variant="destructive" className="w-full justify-start">Sign out of all sessions</Button>
        </div>
      </section>
    </div>
  );
}
