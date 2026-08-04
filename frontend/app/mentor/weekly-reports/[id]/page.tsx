"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DownloadPdfButton } from "@/components/resources/DownloadPdfButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fullName, getUser, internProfiles, weeklyReports } from "@/mock/data";
import type { AiContentStatus } from "@/types";

export default function WeeklyReportDetailPage() {
  const params = useParams<{ id: string }>();
  const report = weeklyReports.find((r) => r.id === params.id);
  const [status, setStatus] = useState<AiContentStatus | undefined>(report?.status);
  const [summary, setSummary] = useState(report?.content.performanceSummary ?? "");
  const [message, setMessage] = useState("");

  if (!report || !status) return <p>Report not found.</p>;
  const intern = getUser(
    internProfiles.find((ip) => ip.id === report.internProfileId)?.userId ?? "",
  );
  const internName = intern ? fullName(intern) : "Intern";

  return (
    <div>
      <PageHeader
        title={`Week ${report.weekNumber} report`}
        description={internName}
        actions={
          <>
            {status === "APPROVED" ? (
              <DownloadPdfButton
                fileName={`week-${report.weekNumber}-report.pdf`}
                label="Download PDF"
              />
            ) : null}
            <Link href="/mentor/weekly-reports" className="btn-secondary">Back</Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge kind="ai" value={status} />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMessage("Mock regenerate requested. Draft content would be replaced after validation.")}
        >
          Regenerate
        </button>
        {status === "DRAFT" ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setStatus("APPROVED");
              setMessage("Report approved. It is now visible to the intern.");
            }}
          >
            Approve report
          </button>
        ) : null}
      </div>
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <label className="label" htmlFor="summary">Performance summary</label>
          <textarea
            id="summary"
            className="input"
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={status !== "DRAFT"}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={status !== "DRAFT"}
            onClick={() => setMessage("Mock edits saved to draft.")}
          >
            Save edits
          </button>
        </section>
        <section className="card space-y-3 p-5 text-sm">
          <div>
            <h2 className="font-semibold">Achievements</h2>
            <ul className="mt-1 list-disc pl-5 text-ink-muted">
              {report.content.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Learning progress</h2>
            <p className="text-ink-muted">{report.content.learningProgress}</p>
          </div>
          <div>
            <h2 className="font-semibold">Productivity analysis</h2>
            <p className="text-ink-muted">{report.content.productivityAnalysis}</p>
          </div>
          <div>
            <h2 className="font-semibold">Recommended focus next week</h2>
            <p className="text-ink-muted">{report.content.recommendedFocusNextWeek}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
