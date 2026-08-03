"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { useState } from "react";

export default function InternFinalSummaryPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const summary = ctx?.finalSummary;
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHeader
        title="Final internship summary"
        description="Only an approved final summary is visible. Draft summaries remain hidden."
      />
      {!summary ? (
        <EmptyState
          title="No approved final summary"
          description="When your mentor approves your final internship summary, you can view and download it here."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setMessage("Mock PDF download. Backend ReportLab generation is not connected.")
              }
            >
              Download PDF
            </button>
          </div>
          {message ? (
            <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">{message}</p>
          ) : null}
          <section className="card space-y-4 p-6 text-sm">
            <div>
              <h2 className="font-semibold">Overall performance</h2>
              <p className="text-ink-muted">{summary.content.overallPerformanceSummary}</p>
            </div>
            <div>
              <h2 className="font-semibold">Learning journey</h2>
              <p className="text-ink-muted">{summary.content.learningJourney}</p>
            </div>
            <div>
              <h2 className="font-semibold">Main achievements</h2>
              <ul className="list-disc pl-5 text-ink-muted">
                {summary.content.mainAchievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Skills developed</h2>
              <p className="text-ink-muted">{summary.content.skillsDeveloped.join(", ")}</p>
            </div>
            {typeof summary.mentorFinalScore === "number" ? (
              <div>
                <h2 className="font-semibold">Mentor final score</h2>
                <p className="text-ink-muted">{summary.mentorFinalScore}/100</p>
              </div>
            ) : null}
            {summary.mentorFinalComments ? (
              <div>
                <h2 className="font-semibold">Mentor comments</h2>
                <p className="text-ink-muted">{summary.mentorFinalComments}</p>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
