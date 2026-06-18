import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { summarizeMeeting } from "@/lib/productivity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({ component: MeetingsPage });

type Result = Awaited<ReturnType<typeof summarizeMeeting>>;

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (transcript.trim().length < 20) {
      toast.error("Paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    try {
      const r = await run({ data: { transcript: transcript.trim() } });
      setResult(r);
    } catch (e) { toast.error((e as Error).message || "Failed"); }
    finally { setLoading(false); }
  };

  const exportText = () => {
    if (!result) return;
    const txt = `# ${result.title}\n\n${result.summary}\n\nKey decisions:\n${result.keyDecisions.map((d) => `- ${d}`).join("\n")}\n\nAction items:\n${result.actionItems.map((a) => `- [${a.owner}] ${a.task} (due ${a.dueDate})`).join("\n")}\n\nOpen questions:\n${result.openQuestions.map((q) => `- ${q}`).join("\n")}\n\nFollow-ups:\n${result.followUps.map((f) => `- ${f}`).join("\n")}`;
    navigator.clipboard.writeText(txt);
    toast.success("Summary copied");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Meeting Notes Summarizer</h1>
        <p className="text-sm text-muted-foreground">Turn raw notes or transcripts into structured summaries and action items.</p>
      </header>
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Notes / transcript</CardTitle><CardDescription>Paste raw notes, transcript, or chat log.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Label className="sr-only">Transcript</Label>
            <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-[340px]" placeholder="Paste meeting notes here..." />
            <Button onClick={submit} disabled={loading || transcript.trim().length < 20}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Summarize
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Structured output you can share.</CardDescription>
            </div>
            {result && (
              <Button size="sm" variant="outline" onClick={exportText}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />Copy
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="grid place-items-center py-20 text-sm text-muted-foreground">Your summary will appear here.</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-lg font-semibold">{result.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>
                </div>
                <Section title="Key decisions" items={result.keyDecisions} />
                <div>
                  <div className="mb-2 text-sm font-semibold">Action items</div>
                  {result.actionItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None identified.</p>
                  ) : (
                    <ul className="divide-y rounded-md border">
                      {result.actionItems.map((a, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2 p-3 text-sm">
                          <Badge variant="secondary">{a.owner}</Badge>
                          <span className="flex-1">{a.task}</span>
                          <span className="text-xs text-muted-foreground">due {a.dueDate}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Section title="Open questions" items={result.openQuestions} />
                <Section title="Follow-ups" items={result.followUps} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      )}
    </div>
  );
}
