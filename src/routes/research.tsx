import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Copy, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { researchTopic } from "@/lib/productivity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({ component: ResearchPage });

type Depth = "Brief" | "Standard" | "Deep";
type Result = Awaited<ReturnType<typeof researchTopic>>;

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<Depth>("Standard");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { topic: topic.trim(), depth } });
      setResult(r);
    } catch (e) { toast.error((e as Error).message || "Failed"); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    if (!result) return;
    const txt = `# ${topic}\n\n${result.summary}\n\nKey points:\n${result.keyPoints.map((p) => `- ${p}`).join("\n")}\n\n${result.sections.map((s) => `## ${s.heading}\n${s.content}`).join("\n\n")}`;
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Research Assistant</h1>
        <p className="text-sm text-muted-foreground">Quickly get a structured briefing on any workplace topic.</p>
      </header>
      <Disclaimer />

      <Card>
        <CardHeader><CardTitle>Research a topic</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px_auto]">
          <div>
            <Label className="sr-only">Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. OKRs vs KPIs for engineering teams" onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div>
            <Select value={depth} onValueChange={(v) => setDepth(v as Depth)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Brief", "Standard", "Deep"] as const).map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
            Research
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Summary and detailed sections.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={copyAll}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />Copy
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed">{result.summary}</p>
              <div>
                <div className="mb-2 text-sm font-semibold">Key points</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div className="space-y-4">
                {result.sections.map((s, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="font-semibold">{s.heading}</div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Pros &amp; cons</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-success">Pros</div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {result.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-destructive">Cons</div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {result.cons.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Related</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {result.relatedTopics.map((r, i) => <Badge key={i} variant="secondary">{r}</Badge>)}
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold">Suggested questions</div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {result.suggestedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
