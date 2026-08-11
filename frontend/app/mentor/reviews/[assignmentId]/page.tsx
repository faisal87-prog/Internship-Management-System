"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listSubmissions } from "@/lib/api/submissions";
import { getAssignment, updateAssignment } from "@/lib/api/tasks";
import { fullName } from "@/lib/names";
import type { Submission, Task, TaskAssignment, TaskStatus } from "@/types";

export default function ReviewSubmissionPage() {
  const params = useParams<{ assignmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [internName, setInternName] = useState("Intern");
  const [latest, setLatest] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<TaskStatus>("COMPLETED");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ assignment: assign, task: nestedTask, raw }, submissions, interns] =
        await Promise.all([
          getAssignment(params.assignmentId),
          listSubmissions(params.assignmentId),
          listInternProfiles(),
        ]);
      setAssignment(assign);
      setTask(nestedTask);
      setScore(assign.score?.toString() ?? "");
      setFeedback(assign.mentorFeedback ?? "");
      setStatus(
        assign.status === "NEEDS_REVISION" || assign.status === "COMPLETED"
          ? assign.status
          : "COMPLETED",
      );
      const intern = interns.find((ip) => ip.id === assign.internProfileId);
      setInternName(intern ? fullName(intern.user) : raw.intern_name || "Intern");
      const sorted = submissions
        .slice()
        .sort((a, b) => b.submissionVersion - a.submissionVersion);
      setLatest(sorted[0] ?? null);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load submission."));
    } finally {
      setLoading(false);
    }
  }, [params.assignmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!assignment) return;
    const parsed = Number(score);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setMessage("Score must be an integer between 0 and 100.");
      return;
    }
    if (status !== "COMPLETED" && status !== "NEEDS_REVISION") {
      setMessage("Outcome must be Completed or Needs revision.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateAssignment(assignment.id, {
        score: parsed,
        mentor_feedback: feedback,
        status,
      });
      setAssignment(updated);
      setMessage(`Review saved. Status set to ${status}. Score ${parsed}/100.`);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not save review."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading review…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!assignment) return <p>Assignment not found.</p>;

  return (
    <div>
      <PageHeader
        title="Review submission"
        description={`${task?.title ?? "Task"} · ${internName}`}
        actions={<Link href="/mentor/reviews" className="btn-secondary">Back</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <div className="flex items-center gap-2">
            <StatusBadge kind="task" value={assignment.status} />
            <span className="text-sm text-ink-muted">
              Latest version {latest?.submissionVersion ?? "—"}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Written response</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {latest?.writtenResponse || "No written response"}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Files</h2>
            {latest?.files.length ? (
              <ul className="mt-1 space-y-1">
                {latest.files.map((f) => (
                  <li key={f.url || f.name}>
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={f.name}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {f.name}
                      </a>
                    ) : (
                      <span className="text-sm text-ink-muted">{f.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-ink-muted">None</p>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-ink">External link</h2>
            {latest?.externalLink ? (
              <a
                href={
                  latest.externalLink.startsWith("http")
                    ? latest.externalLink
                    : `https://${latest.externalLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {latest.externalLink}
              </a>
            ) : (
              <p className="mt-1 text-sm text-ink-muted">None</p>
            )}
          </div>
          {latest?.internNotes ? (
            <div>
              <h2 className="font-semibold text-ink">Intern notes</h2>
              <p className="mt-1 text-sm text-ink-muted">{latest.internNotes}</p>
            </div>
          ) : null}
        </section>

        <form onSubmit={onSubmit} className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="feedback">Mentor feedback</label>
            <textarea
              id="feedback"
              className="input"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="score">Score (0–100, integer)</label>
            <input
              id="score"
              type="number"
              min={0}
              max={100}
              step={1}
              className="input"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="status">Outcome status</label>
            <select
              id="status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="COMPLETED">Completed</option>
              <option value="NEEDS_REVISION">Needs revision</option>
            </select>
          </div>
          {message ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              {message}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save review"}
          </button>
        </form>
      </div>
    </div>
  );
}
