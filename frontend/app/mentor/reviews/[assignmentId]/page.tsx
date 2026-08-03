"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  fullName,
  getUser,
  internProfiles,
  submissions,
  taskAssignments,
  tasks,
} from "@/mock/data";
import type { TaskStatus } from "@/types";

export default function ReviewSubmissionPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignment = taskAssignments.find((ta) => ta.id === params.assignmentId);
  const [score, setScore] = useState(assignment?.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(assignment?.mentorFeedback ?? "");
  const [status, setStatus] = useState<TaskStatus>(assignment?.status ?? "SUBMITTED");
  const [message, setMessage] = useState("");

  if (!assignment) return <p>Assignment not found.</p>;

  const task = tasks.find((t) => t.id === assignment.taskId);
  const intern = getUser(
    internProfiles.find((ip) => ip.id === assignment.internProfileId)?.userId ?? "",
  );
  const latest = submissions
    .filter((s) => s.taskAssignmentId === assignment.id)
    .sort((a, b) => b.submissionVersion - a.submissionVersion)[0];

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(score);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setMessage("Score must be an integer between 0 and 100.");
      return;
    }
    setMessage(`Mock review saved. Status set to ${status}. Score ${parsed}/100.`);
  }

  return (
    <div>
      <PageHeader
        title="Review submission"
        description={`${task?.title ?? "Task"} · ${intern ? fullName(intern) : "Intern"}`}
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
            <p className="mt-1 text-sm text-ink-muted">
              {latest?.files.join(", ") || "None"}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">External link</h2>
            <p className="mt-1 text-sm text-ink-muted">{latest?.externalLink || "None"}</p>
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
          <button type="submit" className="btn-primary">Save review</button>
        </form>
      </div>
    </div>
  );
}
