import type {
  AnalysisResult,
  AnalyzeRequest,
  HistoryItem,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = "We couldn't complete that request. Please try again.";

    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse failure, use default message
    }

    throw new Error(message);
  }

  return res.json();
}

export async function analyzeJob(
  payload: AnalyzeRequest
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handle<AnalysisResult>(res);
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/history`);

  return handle<HistoryItem[]>(res);
}

export async function fetchAnalysis(
  id: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analysis/${id}`);

  return handle<AnalysisResult>(res);
}