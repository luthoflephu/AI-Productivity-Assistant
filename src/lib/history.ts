export type AnalysisRecord = {
  id: string;
  createdAt: number;
  message: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  scamType: string;
};

const KEY = "scamguard:history";

export function loadHistory(): AnalysisRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveAnalysis(r: AnalysisRecord) {
  if (typeof window === "undefined") return;
  const all = [r, ...loadHistory()].slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("scamguard:history-update"));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("scamguard:history-update"));
}
