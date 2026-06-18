import { Info } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground/90 ${className}`}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
      <span>
        AI-generated scam assessments are advisory only and may not be fully accurate. Independently
        verify information and consult official sources before making financial or security decisions.
      </span>
    </div>
  );
}
