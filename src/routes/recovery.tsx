import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LifeBuoy, Loader2, AlertCircle, Lock, Landmark, UserCog, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { planRecovery } from "@/lib/scam.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/recovery")({ component: RecoveryPage });

type Result = Awaited<ReturnType<typeof planRecovery>>;

function RecoveryPage() {
  const run = useServerFn(planRecovery);
  const [incident, setIncident] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async () => {
    if (!incident.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { incident: incident.trim() } });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Recovery Planner</h1>
        <p className="text-sm text-muted-foreground">Describe what happened and get a prioritized response plan.</p>
      </header>
      <Disclaimer />

      <Card>
        <CardHeader><CardTitle>What happened?</CardTitle><CardDescription>Share as much detail as you're comfortable with. Avoid full account numbers or passwords.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={incident} onChange={(e) => setIncident(e.target.value)} className="min-h-[180px]" placeholder="e.g. I clicked a link in a text from 'my bank' and entered my login..." />
          <Button onClick={submit} disabled={loading || !incident.trim()}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LifeBuoy className="mr-2 h-4 w-4" />}Build recovery plan
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Priority</CardTitle>
                <CardDescription>Suggested urgency level for your situation</CardDescription>
              </div>
              <PriorityBadge level={result.priority} />
            </CardHeader>
          </Card>

          <TimelineCard title="Immediate actions" icon={<AlertCircle className="h-4 w-4 text-destructive" />} items={result.immediateActions} />
          <TimelineCard title="Banking actions" icon={<Landmark className="h-4 w-4 text-primary" />} items={result.bankingActions} />
          <TimelineCard title="Account protection" icon={<Lock className="h-4 w-4 text-primary" />} items={result.accountProtection} />
          <TimelineCard title="Security recommendations" icon={<UserCog className="h-4 w-4 text-primary" />} items={result.securityRecommendations} />
          <ChecklistCard title="Follow-up checklist" icon={<ListChecks className="h-4 w-4 text-success" />} items={result.followUpChecklist} />
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" }) {
  const cls = {
    Critical: "bg-destructive text-destructive-foreground",
    High: "bg-destructive/80 text-destructive-foreground",
    Medium: "bg-warning text-warning-foreground",
    Low: "bg-success text-success-foreground",
  }[level];
  return <Badge className={cls}>{level}</Badge>;
}

function TimelineCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle></CardHeader>
      <CardContent>
        <ol className="relative space-y-3 border-l border-border pl-5">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
              <p className="text-sm">{it}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ChecklistCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
