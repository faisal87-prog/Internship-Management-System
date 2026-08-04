"use client";

import { FinalSummaryContent } from "@/components/final-summary/FinalSummaryContent";
import { DownloadPdfButton } from "@/components/resources/DownloadPdfButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";

export default function InternFinalSummaryPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const summary = ctx?.finalSummary;

  return (
    <div>
      <PageHeader
        title="Final internship summary"
        description="Only an approved final summary is visible. Draft summaries remain hidden."
        actions={
          summary ? (
            <DownloadPdfButton
              fileName="final-internship-summary.pdf"
              label="Download PDF"
            />
          ) : undefined
        }
      />
      {!summary ? (
        <EmptyState
          title="No approved final summary"
          description="When your mentor approves your final internship summary, you can view and download it here."
        />
      ) : (
        <div className="space-y-4">
          <section className="card p-6">
            <FinalSummaryContent content={summary.content} />
            {typeof summary.mentorFinalScore === "number" ? (
              <div className="mt-4 text-sm">
                <h2 className="font-semibold text-ink">Mentor final score</h2>
                <p className="mt-1 text-ink-muted">{summary.mentorFinalScore}/100</p>
              </div>
            ) : null}
            {summary.mentorFinalComments ? (
              <div className="mt-4 text-sm">
                <h2 className="font-semibold text-ink">Mentor comments</h2>
                <p className="mt-1 text-ink-muted">{summary.mentorFinalComments}</p>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
