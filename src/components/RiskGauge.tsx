export function RiskGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = (clamped / 100) * 180;
  const color =
    clamped >= 70 ? "var(--color-destructive)" : clamped >= 40 ? "var(--color-warning)" : "var(--color-success)";
  return (
    <div className="relative mx-auto w-48">
      <svg viewBox="0 0 200 110" className="w-full">
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="var(--color-muted)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 283} 283`}
          style={{ transition: "stroke-dasharray 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-3xl font-bold tabular-nums" style={{ color }}>
          {clamped}%
        </div>
        <div className="text-xs text-muted-foreground">Risk Score</div>
      </div>
    </div>
  );
}
