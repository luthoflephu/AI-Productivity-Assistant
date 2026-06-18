import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { planTasks } from "@/lib/productivity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

type Result = Awaited<ReturnType<typeof planTasks>>;
type Priority = "Low" | "Medium" | "High";

function TasksPage() {
  const run = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { goal: goal.trim(), deadline, constraints } });
      setResult(r);
    } catch (e) { toast.error((e as Error).message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Task Planner</h1>
        <p className="text-sm text-muted-foreground">Break any goal into milestones and prioritized tasks.</p>
      </header>
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Goal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>What do you want to accomplish?</Label>
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 min-h-[120px]" placeholder="e.g. Launch v1 of our customer portal." />
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" placeholder="e.g. 4 weeks, by Aug 30" />
            </div>
            <div>
              <Label>Constraints / resources (optional)</Label>
              <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} className="mt-1 min-h-[80px]" placeholder="Team size, budget, dependencies..." />
            </div>
            <Button onClick={submit} disabled={loading || !goal.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
              Generate plan
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Plan</CardTitle><CardDescription>Milestones, tasks, risks, and quick wins.</CardDescription></CardHeader>
          <CardContent>
            {!result ? (
              <div className="grid place-items-center py-20 text-sm text-muted-foreground">Your plan will appear here.</div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <span className="font-medium">Objective:</span> {result.objective}
                </div>
                <div className="space-y-4">
                  {result.milestones.map((m, i) => (
                    <div key={i} className="rounded-lg border">
                      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2">
                        <div className="font-semibold">{i + 1}. {m.name}</div>
                        <span className="text-xs text-muted-foreground">{m.target}</span>
                      </div>
                      <ul className="divide-y">
                        {m.tasks.map((t, j) => (
                          <li key={j} className="flex flex-wrap items-start gap-3 p-3 text-sm">
                            <PriorityBadge p={t.priority} />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">{t.title}</div>
                              {t.notes && <div className="mt-0.5 text-xs text-muted-foreground">{t.notes}</div>}
                            </div>
                            <span className="text-xs text-muted-foreground">{t.estimate}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ListBlock title="Risks" items={result.risks} />
                  <ListBlock title="Quick wins" items={result.quickWins} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const cls = p === "High" ? "bg-destructive/15 text-destructive" : p === "Medium" ? "bg-warning/20 text-warning" : "bg-success/15 text-success";
  return <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>{p}</span>;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      )}
      <Badge variant="secondary" className="mt-3 hidden">.</Badge>
    </div>
  );
}
