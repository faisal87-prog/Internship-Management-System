import { adaptFinalSummary, adaptWeeklyReport } from "@/lib/api/adapters";
import { apiDownload, apiRequest, unwrapList } from "@/lib/api/client";
import type { FinalSummary, WeeklyReport } from "@/types";

export async function listWeeklyReports(): Promise<WeeklyReport[]> {
  const data = await apiRequest("/api/reports/weekly/");
  return unwrapList(data).map(adaptWeeklyReport);
}

export async function getWeeklyReport(id: string): Promise<WeeklyReport & { overallWeeklyScore?: number | null; pdfUrl?: string | null }> {
  const raw = await apiRequest<any>(`/api/reports/weekly/${id}/`);
  return {
    ...adaptWeeklyReport(raw),
    overallWeeklyScore: raw.overall_weekly_score,
    pdfUrl: raw.pdf_url,
  };
}

export async function updateWeeklyReport(id: string, payload: Record<string, unknown>) {
  const raw = await apiRequest<any>(`/api/reports/weekly/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  return {
    ...adaptWeeklyReport(raw),
    overallWeeklyScore: raw.overall_weekly_score,
    pdfUrl: raw.pdf_url,
  };
}

export async function approveWeeklyReport(id: string) {
  const raw = await apiRequest<any>(`/api/reports/weekly/${id}/approve/`, {
    method: "POST",
  });
  return adaptWeeklyReport(raw);
}

export async function downloadWeeklyReportPdf(id: string) {
  await apiDownload(`/api/reports/weekly/${id}/download_pdf/`, `weekly-report-${id}.pdf`);
}

export async function listFinalSummaries(): Promise<FinalSummary[]> {
  const data = await apiRequest("/api/reports/final-summaries/");
  return unwrapList(data).map(adaptFinalSummary);
}

export async function getFinalSummary(id: string): Promise<FinalSummary & { pdfUrl?: string | null }> {
  const raw = await apiRequest<any>(`/api/reports/final-summaries/${id}/`);
  return { ...adaptFinalSummary(raw), pdfUrl: raw.pdf_url };
}

export async function updateFinalSummary(id: string, payload: Record<string, unknown>) {
  const raw = await apiRequest<any>(`/api/reports/final-summaries/${id}/`, {
    method: "PATCH",
    body: payload,
  });
  return adaptFinalSummary(raw);
}

export async function approveFinalSummary(id: string) {
  const raw = await apiRequest<any>(`/api/reports/final-summaries/${id}/approve/`, {
    method: "POST",
  });
  return adaptFinalSummary(raw);
}

export async function downloadFinalSummaryPdf(id: string) {
  await apiDownload(
    `/api/reports/final-summaries/${id}/download_pdf/`,
    `final-summary-${id}.pdf`,
  );
}
