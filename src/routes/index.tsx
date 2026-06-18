import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/")({ component: Dashboard });

const FEATURES = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft professional emails with the right tone in seconds.", tag: "Writing" },
  { to: "/meetings", icon: FileText, title: "Meeting Summarizer", desc: "Turn raw notes into summaries, decisions, and action items.", tag: "Meetings" },
  { to: "/tasks", icon: ListChecks, title: "AI Task Planner", desc: "Break goals into milestones and prioritized tasks.", tag: "Planning" },
  { to: "/research", icon: BookOpen, title: "Research Assistant", desc: "Get structured briefings on any workplace topic.", tag: "Research" },
  { to: "/chat", icon: MessageSquare, title: "AI Chatbot", desc: "Your conversational co-pilot for anything work-related.", tag: "Chat" },
] as const;

const STATS = [
  { label: "AI tools", value: "5", icon: Sparkles, tone: "primary" as const },
  { label: "Avg. draft time", value: "<10s", icon: Zap, tone: "warning" as const },
  { label: "Editable outputs", value: "100%", icon: ShieldCheck, tone: "success" as const },
  { label: "Always-on", value: "24/7", icon: Clock, tone: "primary" as const },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-accent/30 p-6 sm:p-10">
        <Badge variant="secondary" className="mb-3">Workplace AI</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Get more done with your AI productivity co-pilot.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Draft emails, summarize meetings, plan projects, and research topics — all from one
          modern workspace. Built for professionals who value their time.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/chat"><MessageSquare className="mr-2 h-4 w-4" />Open AI Chatbot</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/email"><Mail className="mr-2 h-4 w-4" />Draft an email</Link>
          </Button>
        </div>
      </section>

      <Disclaimer />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{s.value}</div>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${
                s.tone === "primary" ? "bg-primary/10 text-primary"
                : s.tone === "warning" ? "bg-warning/15 text-warning"
                : "bg-success/10 text-success"
              }`}>
                <s.icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your tools</h2>
            <p className="text-sm text-muted-foreground">Jump straight into the assistant you need.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.to} className="group transition hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary">{f.tag}</Badge>
                </div>
                <CardTitle className="mt-3">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="-ml-3 text-primary">
                  <Link to={f.to}>
                    Open <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>Three steps from idea to polished output.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Pick a tool", d: "Choose the assistant that matches your task." },
              { n: "2", t: "Add context", d: "Describe your goal, tone, and any background." },
              { n: "3", t: "Review & ship", d: "Edit the AI draft, copy it, and you're done." },
            ].map((s) => (
              <div key={s.n} className="rounded-lg border p-4">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-sm font-bold text-primary">{s.n}</div>
                <div className="mt-3 font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
