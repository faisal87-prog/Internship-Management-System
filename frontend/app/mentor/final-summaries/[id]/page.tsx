"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FinalSummaryContent } from "@/components/final-summary/FinalSummaryContent";
import { DownloadPdfButton } from "@/components/resources/DownloadPdfButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { finalSummaries, fullName, getUser, internProfiles } from "@/mock/data";
import type { AiContentStatus, FinalSummary } from "@/types";

export default function FinalSummaryDetailPage() {
  const params = useParams<{ id: string }>();
  const summary = finalSummaries.find((fs) => fs.id === params.id);
  const [status, setStatus] = useState<AiContentStatus | undefined>(summary?.status);
  const [content, setContent] = useState<FinalSummary["content"] | undefined>(
    summary?.content,
  );
  const [score, setScore] = useState(summary?.mentorFinalScore?.toString() ?? "");
  const [comments, setComments] = useState(summary?.mentorFinalComments ?? "");
  const [mentorNotes, setMentorNotes] = useState(summary?.additionalMentorNotes ?? "");
  const [message, setMessage] = useState("");

  if (!summary || !status || !content) return <p>Final summary not found.</p>;
  const intern = getUser(
    internProfiles.find((ip) => ip.id === summary.internProfileId)?.userId ?? "",
  );
  const editable = status === "DRAFT";

  function saveEdits() {
    setMessage("Mock edits saved to draft (frontend only).");
  }

  return (
    <div>
      <PageHeader
        title="Final internship summary"
        description={intern ? fullName(intern) : "Intern"}
        actions={
          <>
            <DownloadPdfButton
              fileName="final-internship-summary.pdf"
              label="Download PDF"
            />
            <Link href="/mentor/final-summaries" className="btn-secondary">Back</Link>
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
            setMessage("Mock regenerate requested. Draft content would be replaced after validation.")
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
                const parsed = Number(score);
                if (score && (!Number.isInteger(parsed) || parsed < 0 || parsed > 100)) {
                  setMessage("Final score must be an integer 0–100.");
                  return;
                }
                setStatus("APPROVED");
                setMessage("Final summary approved and stored.");
              }}
            >
              Approve summary
            </button>
          </>
        ) : null}
      </div>
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <FinalSummaryContent
            content={content}
            editable={editable}
            onChange={setContent}
          />
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="score">Mentor final score (optional)</label>
            <input
              id="score"
              type="number"
              min={0}
              max={100}
              step={1}
              className="input"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              disabled={!editable}
            />
            {score ? (
              <p className="mt-1 text-xs text-ink-muted">
                Displayed as {Number.isInteger(Number(score)) ? `${score} / 100` : "—"}
              </p>
            ) : null}
          </div>
          <div>
            <label className="label" htmlFor="comments">Mentor final comments</label>
            <textarea
              id="comments"
              className="input"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
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
              placeholder="Add any extra comments or context."
            />
          </div>
          {editable ? (
            <button type="button" className="btn-secondary" onClick={saveEdits}>
              Save edits
            </button>
          ) : null}
          <p className="text-xs text-ink-muted">
            AI does not make hiring decisions. No automatic hiring recommendation is shown.
          </p>
        </section>
      </div>
    </div>
  );
}
