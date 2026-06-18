import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Disclaimer } from "@/components/Disclaimer";
import { generateSafeEmail } from "@/lib/scam.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({ component: EmailGenPage });

type Tone = "Formal" | "Friendly" | "Professional" | "Assertive";
type Result = Awaited<ReturnType<typeof generateSafeEmail>>;

function EmailGenPage() {
  const run = useServerFn(generateSafeEmail);
  const [original, setOriginal] = useState("");
  const [goal, setGoal] = useState("Politely decline and request verification through official channels.");
  const [tone, setTone] = useState<Tone>("Professional");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alts, setAlts] = useState<Result["alternatives"]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const submit = async () => {
    if (!original.trim() || !goal.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { originalMessage: original.trim(), goal: goal.trim(), tone } });
      setSubject(r.subject); setBody(r.body); setAlts(r.alternatives); setNotes(r.safetyNotes);
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Safe Email Generator</h1>
        <p className="text-sm text-muted-foreground">Generate safe, professional responses to suspicious messages.</p>
      </header>
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Original suspicious message</Label>
              <Textarea value={original} onChange={(e) => setOriginal(e.target.value)} className="mt-1 min-h-[160px]" placeholder="Paste the message you received..." />
            </div>
            <div>
              <Label>Response goal</Label>
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 min-h-[80px]" />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Formal", "Friendly", "Professional", "Assertive"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} disabled={loading || !original.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Generate response
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Generated response</CardTitle><CardDescription>Edit before copying.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {!subject && !body ? (
              <div className="grid place-items-center py-16 text-sm text-muted-foreground">Your response will appear here.</div>
            ) : (
              <>
                <div>
                  <Label>Subject</Label>
                  <div className="mt-1 flex gap-2">
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                    <Button variant="outline" size="icon" onClick={() => copy(subject)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 min-h-[200px]" />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => copy(body)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />Copy body
                  </Button>
                </div>
                {notes.length > 0 && (
                  <div className="rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="mb-1 font-medium">Safety notes</div>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {alts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Alternative versions</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {alts.map((a, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Alternative {i + 1}</div>
                <div className="mt-1 font-medium">{a.subject}</div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{a.body}</p>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(`Subject: ${a.subject}\n\n${a.body}`)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />Copy
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
