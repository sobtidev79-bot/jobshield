export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
export type Severity = "high" | "medium" | "low" | "info";

export interface RiskSignal {
  id: string;
  title: string;
  severity: Severity;
  scoreContribution: number;
  category: string;
  explanation: string;
  evidence: string;
  informational?: boolean;
}

export interface PositiveSignal {
  id: string;
  title: string;
  detail: string;
}

export interface AnalysisResult {
  id: string;
  job_title?: string;
  jobTitle?: string;
  company_name?: string;
  companyName?: string;
  jobUrl?: string;
  score: number;
  riskLevel: RiskLevel;
  riskLevelLabel: string;
  summary: string;
  riskSignals: RiskSignal[];
  infoSignals: RiskSignal[];
  positiveSignals: PositiveSignal[];
  verificationSteps: string[];
  checksPerformed: string[];
  createdAt?: string;
}

export interface HistoryItem {
  id: string;
  jobTitle: string;
  companyName: string | null;
  jobUrl: string | null;
  score: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface AnalyzeRequest {
  job_description?: string;
  job_url?: string;
  company_name?: string;
  recruiter_email?: string;
}
