import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Mail,
  BookOpen,
  LifeBuoy,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { loadHistory, type AnalysisRecord } from "@/lib/history";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  useEffect(() => {
    const sync = () => setHistory(loadHistory());
    sync();
    window.addEventListener("scamguard:history-update", sync);
    return () => window.removeEventListener("scamguard:history-update", sync);
  }, []);

  const total = history.length;
  const high = history.filter((h) => h.riskLevel === "High").length;
  const medium = history.filter((h) => h.riskLevel === "Medium").length;
  const low = history.filter((h) => h.riskLevel === "Low").length;

  const distribution = [
    { name: "High", value: high, color: "var(--color-destructive)" },
    { name: "Medium", value: medium, color: "var(--color-warning)" },
    { name: "Low / Safe", value: low, color: "var(--color-success)" },
  ];

  const categoryMap = new Map<string, number>();
  history.forEach((h) => categoryMap.set(h.scamType, (categoryMap.get(h.scamType) ?? 0) + 1));
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your fraud protection activity and risk insights.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/analyzer"><ShieldAlert className="mr-2 h-4 w-4" />Analyze a message</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/chat"><MessageSquare className="mr-2 h-4 w-4" />Ask the advisor</Link>
          </Button>
        </div>
      </div>

      <Disclaimer />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Analyzed" value={total} icon={<Activity className="h-4 w-4" />} tone="primary" />
        <StatCard label="High Risk" value={high} icon={<ShieldAlert className="h-4 w-4" />} tone="destructive" />
        <StatCard label="Medium Risk" value={medium} icon={<ShieldQuestion className="h-4 w-4" />} tone="warning" />
        <StatCard label="Safe Messages" value={low} icon={<ShieldCheck className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Breakdown of your analyzed messages</CardDescription>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={distribution} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {distribution.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Scam Categories</CardTitle>
            <CardDescription>Most detected scam types in your activity</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={categories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Your last analyzed messages</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No analyses yet. <Link className="text-primary underline" to="/analyzer">Analyze your first message</Link>.
              </div>
            ) : (
              <ul className="divide-y">
                {history.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    <RiskBadge level={r.riskLevel} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{r.message.slice(0, 120)}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.scamType}</span>
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{r.riskScore}%</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into a protection tool</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickLink to="/analyzer" icon={<ShieldAlert className="h-4 w-4" />} label="Analyze a message" />
            <QuickLink to="/email" icon={<Mail className="h-4 w-4" />} label="Generate safe email" />
            <QuickLink to="/research" icon={<BookOpen className="h-4 w-4" />} label="Research scam types" />
            <QuickLink to="/recovery" icon={<LifeBuoy className="h-4 w-4" />} label="Build recovery plan" />
            <QuickLink to="/chat" icon={<MessageSquare className="h-4 w-4" />} label="Chat with advisor" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Recent Scam Trends</CardTitle>
          <CardDescription>Stay aware of widespread current scam tactics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDS.map((t) => (
            <div key={t.title} className="rounded-lg border p-4">
              <Badge variant="secondary" className="mb-2">{t.tag}</Badge>
              <div className="font-medium">{t.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const TRENDS = [
  { tag: "Phishing", title: "Bank impersonation SMS", desc: "Fake 'unusual activity' texts asking you to verify via a link." },
  { tag: "Job scam", title: "Remote job offers via WhatsApp", desc: "Recruiters offering high pay for simple 'tasks' that require deposits." },
  { tag: "Crypto", title: "Pig-butchering investment", desc: "Long-term grooming pushing victims to fake crypto platforms." },
  { tag: "Delivery", title: "Missed parcel fee", desc: "Texts claiming a tiny redelivery fee that harvest card details." },
  { tag: "Romance", title: "Fake military / oil-rig profiles", desc: "Emotional rapport leading to emergency money requests." },
  { tag: "Tech support", title: "Pop-up 'virus' calls", desc: "Fake alerts urging you to call a number and grant remote access." },
];

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "primary" | "destructive" | "warning" | "success";
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneCls}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const cls =
    level === "High"
      ? "bg-destructive/15 text-destructive"
      : level === "Medium"
      ? "bg-warning/20 text-warning"
      : "bg-success/15 text-success";
  return <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>{level}</span>;
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Button asChild variant="outline" className="justify-start">
      <Link to={to}>
        {icon}
        <span className="ml-2">{label}</span>
      </Link>
    </Button>
  );
}

function EmptyChart() {
  return <div className="grid h-56 place-items-center text-sm text-muted-foreground">No data yet</div>;
}
