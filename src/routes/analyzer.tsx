import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { RiskGauge } from "@/components/RiskGauge";
import { analyzeScam } from "@/lib/scam.functions";
import { saveAnalysis } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/analyzer")({ component: AnalyzerPage });

type Result = Awaited<ReturnType<typeof analyzeScam>>;

function AnalyzerPage() {
  const run = useServerFn(analyzeScam);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { message: message.trim() } });
      setResult(r);
      saveAnalysis({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        message: message.trim(),
        riskScore: r.riskScore,
        riskLevel: r.riskLevel,
        scamType: r.scamType,
      });
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Failed to analyze message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Scam Message Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Paste a suspicious email, SMS, WhatsApp message, or job offer to get an AI risk assessment.
        </p>
      </header>

      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message to analyze</CardTitle>
            <CardDescription>Paste the full suspicious message below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the suspicious message here..."
              className="min-h-[260px] resize-y"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit} disabled={loading || !message.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                Analyze message
              </Button>
              <Button variant="ghost" onClick={() => { setMessage(""); setResult(null); }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>AI-generated scoring and explanation</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="grid place-items-center py-16 text-sm text-muted-foreground">
                Results will appear here after analysis.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <RiskGauge score={result.riskScore} />
                  <div className="space-y-2 text-center sm:text-right">
                    <RiskBadge level={result.riskLevel} />
                    <div className="text-sm">
                      <div className="font-medium">{result.scamType}</div>
                      <div className="text-xs text-muted-foreground">Confidence: {result.confidence}%</div>
                    </div>
                  </div>
                </div>
                <Section title="Red Flags" icon={<AlertTriangle className="h-4 w-4 text-warning" />}>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </Section>
                <Section title="Explanation">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.explanation}</p>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(result.explanation)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />Copy
                  </Button>
                </Section>
                <Section title="Recommended Actions" icon={<CheckCircle2 className="h-4 w-4 text-success" />}>
                  <ul className="space-y-1 text-sm">
                    {result.recommendedActions.map((a, i) => (
                      <li key={i} className="flex gap-2"><span className="text-primary">•</span>{a}</li>
                    ))}
                  </ul>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(result.recommendedActions.map(a => `• ${a}`).join("\n"))}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />Copy actions
                  </Button>
                </Section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const variant = level === "High" ? "destructive" : level === "Medium" ? "secondary" : "default";
  const cls =
    level === "High"
      ? "bg-destructive text-destructive-foreground"
      : level === "Medium"
      ? "bg-warning text-warning-foreground"
      : "bg-success text-success-foreground";
  return <Badge variant={variant} className={cls}>{level} Risk</Badge>;
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}
