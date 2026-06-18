import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2, AlertTriangle, Eye, ShieldCheck, ListChecks, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { researchScam } from "@/lib/scam.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({ component: ResearchPage });

const SUGGESTIONS = ["Phishing", "Investment scams", "Romance scams", "Job scams", "Cryptocurrency scams", "Tech support scams"];

type Result = Awaited<ReturnType<typeof researchScam>>;

function ResearchPage() {
  const run = useServerFn(researchScam);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (t?: string) => {
    const query = (t ?? topic).trim();
    if (!query) return;
    if (t) setTopic(t);
    setLoading(true);
    try {
      const r = await run({ data: { topic: query } });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Scam Research Assistant</h1>
        <p className="text-sm text-muted-foreground">Learn how specific scam types work and how to protect yourself.</p>
      </header>
      <Disclaimer />

      <Card>
        <CardHeader><CardTitle>Topic</CardTitle><CardDescription>Search or pick a common scam type.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. romance scams on dating apps" onKeyDown={(e) => e.key === "Enter" && submit()} />
            <Button onClick={() => submit()} disabled={loading || !topic.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}Research
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-accent" onClick={() => submit(s)}>{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{result.summary}</p></CardContent>
          </Card>
          <InfoCard title="Warning signs" icon={<AlertTriangle className="h-4 w-4 text-warning" />} items={result.warningSigns} />
          <InfoCard title="How scammers operate" icon={<Eye className="h-4 w-4 text-primary" />} items={result.howScammersOperate} />
          <InfoCard title="Prevention tips" icon={<ShieldCheck className="h-4 w-4 text-success" />} items={result.preventionTips} />
          <InfoCard title="Recommended actions" icon={<ListChecks className="h-4 w-4 text-primary" />} items={result.recommendedActions} />
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" />Key insights</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {result.keyInsights.map((k, i) => (
                  <li key={i} className="rounded-md border bg-muted/30 p-3 text-sm">{k}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2"><span className="text-primary">•</span>{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
