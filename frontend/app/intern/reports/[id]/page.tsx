"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { WeeklyScoreCard } from "@/components/reports/WeeklyScoreCard";
import { DownloadPdfButton } from "@/components/resources/DownloadPdfButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { getWeeklyTaskScores } from "@/lib/weeklyScore";

export default function InternReportDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const report = ctx?.approvedReports.find((r) => r.id === params.id);

  const scores = useMemo(
    () =>
      report
        ? getWeeklyTaskScores(report.internProfileId, report.weekNumber)
        : [],
    [report],
  );

  if (!report) {
    return (
      <div className="card p-6">
        <p className="font-semibold">Report unavailable</p>
        <p className="mt-2 text-sm text-ink-muted">
          Draft or other interns’ reports are not visible.
        </p>
        <Link href="/intern/reports" className="btn-secondary mt-4 inline-flex">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Week ${report.weekNumber} performance report`}
        description="Approved by your mentor"
        actions={
          <>
            <DownloadPdfButton
              fileName={`week-${report.weekNumber}-report.pdf`}
              label="Download PDF"
            />
            <Link href="/intern/reports" className="btn-secondary">Back</Link>
          </>
        }
      />

      <div className="mb-4">
        <WeeklyScoreCard scores={scores} />
      </div>

      <div className="card space-y-4 p-6 text-sm">
        <div>
          <h2 className="font-semibold">Performance summary</h2>
          <p className="text-ink-muted">{report.content.performanceSummary}</p>
        </div>
        <div>
          <h2 className="font-semibold">Achievements</h2>
          <ul className="list-disc pl-5 text-ink-muted">
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
          <h2 className="font-semibold">Recommended focus next week</h2>
          <p className="text-ink-muted">{report.content.recommendedFocusNextWeek}</p>
        </div>
        {report.additionalMentorNotes ? (
          <div>
            <h2 className="font-semibold">Additional Mentor Notes</h2>
            <p className="text-ink-muted">{report.additionalMentorNotes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
