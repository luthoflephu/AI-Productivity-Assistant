import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";
import { Disclaimer } from "@/components/Disclaimer";
import { clearHistory } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your ScamGuard AI experience.</p>
      </header>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Toggle dark mode.</CardDescription></CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="dark">Dark mode</Label>
          <Switch id="dark" checked={theme === "dark"} onCheckedChange={toggle} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data</CardTitle><CardDescription>Your analysis history is stored locally in this browser.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Clear analysis history and chat data.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { clearHistory(); toast.success("Analysis history cleared"); }}>
              Clear analysis history
            </Button>
            <Button variant="outline" onClick={() => { localStorage.removeItem("scamguard:chat"); toast.success("Chat cleared"); }}>
              Clear chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Responsible AI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Disclaimer />
          <p className="text-sm text-muted-foreground">
            ScamGuard AI uses large language models to assess content. Outputs include confidence scores and may be inaccurate. Always verify with official sources (your bank, employer, government agency) before taking financial or security action.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
