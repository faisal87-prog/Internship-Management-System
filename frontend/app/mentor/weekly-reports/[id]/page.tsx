"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { WeeklyScoreCard } from "@/components/reports/WeeklyScoreCard";
import { DownloadPdfButton } from "@/components/resources/DownloadPdfButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getWeeklyTaskScores } from "@/lib/weeklyScore";
import { fullName, getUser, internProfiles, weeklyReports } from "@/mock/data";
import type { AiContentStatus } from "@/types";

export default function WeeklyReportDetailPage() {
  const params = useParams<{ id: string }>();
  const report = weeklyReports.find((r) => r.id === params.id);
  const [status, setStatus] = useState<AiContentStatus | undefined>(report?.status);
  const [summary, setSummary] = useState(report?.content.performanceSummary ?? "");
  const [achievements, setAchievements] = useState(
    report?.content.achievements.join("\n") ?? "",
  );
  const [learningProgress, setLearningProgress] = useState(
    report?.content.learningProgress ?? "",
  );
  const [productivityAnalysis, setProductivityAnalysis] = useState(
    report?.content.productivityAnalysis ?? "",
  );
  const [recommendedFocusNextWeek, setRecommendedFocusNextWeek] = useState(
    report?.content.recommendedFocusNextWeek ?? "",
  );
  const [mentorNotes, setMentorNotes] = useState(report?.additionalMentorNotes ?? "");
  const [message, setMessage] = useState("");

  const scores = useMemo(
    () =>
      report
        ? getWeeklyTaskScores(report.internProfileId, report.weekNumber)
        : [],
    [report],
  );

  if (!report || !status) return <p>Report not found.</p>;
  const intern = getUser(
    internProfiles.find((ip) => ip.id === report.internProfileId)?.userId ?? "",
  );
  const internName = intern ? fullName(intern) : "Intern";
  const editable = status === "DRAFT";

  function saveEdits() {
    setMessage("Mock edits saved to draft (frontend only).");
  }

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
        {editable ? (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
            Edit mode
          </span>
        ) : null}
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            setMessage(
              "Mock regenerate requested. Draft content would be replaced after validation.",
            )
          }
        >
          Regenerate
        </button>
        {editable ? (
          <>
            <button type="button" className="btn-secondary" onClick={saveEdits}>
              Save edits
            </button>
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
          </>
        ) : null}
      </div>
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}

      <div className="mb-4">
        <WeeklyScoreCard scores={scores} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <div>
            <label className="label" htmlFor="summary">Performance summary</label>
            <textarea
              id="summary"
              className="input"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!editable}
            />
          </div>
          <div>
            <label className="label" htmlFor="achievements">
              Achievements (one per line)
            </label>
            <textarea
              id="achievements"
              className="input"
              rows={3}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              disabled={!editable}
            />
          </div>
          <div>
            <label className="label" htmlFor="learning">Learning progress</label>
            <textarea
              id="learning"
              className="input"
              rows={3}
              value={learningProgress}
              onChange={(e) => setLearningProgress(e.target.value)}
              disabled={!editable}
            />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <div>
            <label className="label" htmlFor="productivity">Productivity analysis</label>
            <textarea
              id="productivity"
              className="input"
              rows={3}
              value={productivityAnalysis}
              onChange={(e) => setProductivityAnalysis(e.target.value)}
              disabled={!editable}
            />
          </div>
          <div>
            <label className="label" htmlFor="nextWeek">Recommended focus next week</label>
            <textarea
              id="nextWeek"
              className="input"
              rows={3}
              value={recommendedFocusNextWeek}
              onChange={(e) => setRecommendedFocusNextWeek(e.target.value)}
              disabled={!editable}
            />
          </div>
          <div>
            <label className="label" htmlFor="mentorNotes">Additional Mentor Notes</label>
            <textarea
              id="mentorNotes"
              className="input"
              rows={4}
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              disabled={!editable}
              placeholder="Add any extra comments or context for this week."
            />
          </div>
          {editable ? (
            <button type="button" className="btn-secondary" onClick={saveEdits}>
              Save edits
            </button>
          ) : null}
        </section>
      </div>
    </div>
  );
}
