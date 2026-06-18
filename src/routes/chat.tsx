import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, ShieldCheck, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/Disclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({ component: ChatPage });

const STORAGE_KEY = "scamguard:chat";
const SUGGESTIONS = [
  "Is this email from my bank legit?",
  "How do I spot a job offer scam on WhatsApp?",
  "What should I do if I shared my password with a scammer?",
  "Explain pig-butchering crypto scams.",
];

function loadInitial(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function ChatPage() {
  const [initial] = useState<UIMessage[]>(loadInitial);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  };

  const clear = () => {
    setMessages([]);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col p-4 sm:p-6">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">AI Scam Advisor</h1>
          <p className="text-xs text-muted-foreground">Ask anything about scams, suspicious messages, and safety.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} disabled={messages.length === 0}>
          <Trash2 className="mr-1.5 h-4 w-4" />Clear
        </Button>
      </header>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="font-semibold">How can I help keep you safe today?</div>
                <p className="mt-1 text-sm text-muted-foreground">Try one of these prompts:</p>
              </div>
              <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => submit(s)} className="rounded-lg border bg-background p-3 text-left text-sm hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />Thinking…
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t bg-muted/30 p-3 sm:p-4">
          <Disclaimer className="mb-3" />
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              placeholder="Ask about a suspicious message, scam type, or safety practice..."
              className="min-h-[52px] resize-none"
            />
            <Button size="icon" onClick={() => submit()} disabled={busy || !input.trim()} aria-label="Send">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
        {isUser ? <User className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
