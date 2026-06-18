import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";
import { Disclaimer } from "@/components/Disclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your WorkflowAI experience.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Toggle dark mode.</CardDescription></CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="dark">Dark mode</Label>
          <Switch id="dark" checked={theme === "dark"} onCheckedChange={toggle} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data</CardTitle><CardDescription>Your chat history is stored locally in this browser.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Clear locally stored chat data.</p>
          <Button variant="outline" onClick={() => { localStorage.removeItem("workflowai:chat"); toast.success("Chat cleared"); }}>
            Clear chat
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Responsible AI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Disclaimer />
          <p className="text-sm text-muted-foreground">
            WorkflowAI uses large language models to draft and summarize content. Output may be
            inaccurate, biased, or out of date. Always review and edit AI-generated content before
            sending, sharing, or acting on it — especially for legal, financial, or HR matters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
