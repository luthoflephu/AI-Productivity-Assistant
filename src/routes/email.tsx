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
import { generateEmail } from "@/lib/productivity.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({ component: EmailPage });

type Tone = "Formal" | "Friendly" | "Professional" | "Concise" | "Persuasive";
type Length = "Short" | "Medium" | "Long";
type Result = Awaited<ReturnType<typeof generateEmail>>;

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [length, setLength] = useState<Length>("Medium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alts, setAlts] = useState<Result["alternatives"]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const submit = async () => {
    if (!purpose.trim()) return;
    setLoading(true);
    try {
      const r = await run({ data: { purpose: purpose.trim(), recipient, context, tone, length } });
      setSubject(r.subject); setBody(r.body); setAlts(r.alternatives); setTips(r.tips);
    } catch (e) { toast.error((e as Error).message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Smart Email Generator</h1>
        <p className="text-sm text-muted-foreground">Draft polished workplace emails in seconds.</p>
      </header>
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Purpose / what you want to say</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-1 min-h-[120px]" placeholder="e.g. Follow up with a client after our product demo and propose next steps." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Recipient</Label>
                <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1" placeholder="Jane, Head of Marketing" />
              </div>
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Formal", "Friendly", "Professional", "Concise", "Persuasive"] as const).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Short", "Medium", "Long"] as const).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Background / context (optional)</Label>
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} className="mt-1 min-h-[80px]" placeholder="Any relevant background, previous messages, etc." />
            </div>
            <Button onClick={submit} disabled={loading || !purpose.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Generate email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Generated email</CardTitle><CardDescription>Edit freely before sending.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {!subject && !body ? (
              <div className="grid place-items-center py-16 text-sm text-muted-foreground">Your email will appear here.</div>
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
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 min-h-[260px]" />
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => copy(`Subject: ${subject}\n\n${body}`)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />Copy full email
                  </Button>
                </div>
                {tips.length > 0 && (
                  <div className="rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="mb-1 font-medium">Writing tips</div>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {tips.map((n, i) => <li key={i}>{n}</li>)}
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
