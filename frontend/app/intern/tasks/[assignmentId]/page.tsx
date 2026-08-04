"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { TaskDetailsPanel } from "@/components/tasks/TaskDetailsPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { formatDateTime } from "@/lib/labels";
import type { Submission, TaskStatus } from "@/types";

const ALLOWED = "PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, JPEG, TXT, CSV, ZIP · max 20 MB each";

const transitions: Record<TaskStatus, TaskStatus[]> = {
  TO_DO: ["IN_PROGRESS"],
  IN_PROGRESS: ["SUBMITTED"],
  SUBMITTED: [],
  NEEDS_REVISION: ["IN_PROGRESS", "SUBMITTED"],
  COMPLETED: [],
};

export default function InternTaskDetailPage() {
  const params = useParams<{ assignmentId: string }>();
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const row = ctx?.myTasks.find((item) => item.assignment.id === params.assignmentId);
  const initialSubs = useMemo(
    () => ctx?.mySubmissions.filter((s) => s.taskAssignmentId === params.assignmentId) ?? [],
    [ctx, params.assignmentId],
  );

  const [status, setStatus] = useState<TaskStatus | undefined>(row?.assignment.status);
  const [subs, setSubs] = useState<Submission[]>(initialSubs);
  const [message, setMessage] = useState("");

  if (!row || !status) {
    return <p>Task assignment not found for this intern.</p>;
  }

  const { assignment, task } = row;
  const nextStatuses = transitions[status];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const writtenResponse = String(form.get("writtenResponse") || "");
    const externalLink = String(form.get("externalLink") || "");
    const internNotes = String(form.get("internNotes") || "");
    const fileList = form.getAll("files").filter((f) => f instanceof File && f.name) as File[];
    if (!writtenResponse && fileList.length === 0 && !externalLink) {
      setMessage("Add a written response, at least one file, or an external link.");
      return;
    }
    const version = (subs[subs.length - 1]?.submissionVersion ?? 0) + 1;
    setSubs((prev) => [
      ...prev,
      {
        id: `local-sub-${version}`,
        taskAssignmentId: assignment.id,
        writtenResponse: writtenResponse || undefined,
        files: fileList.map((f) => f.name),
        externalLink: externalLink || undefined,
        internNotes: internNotes || undefined,
        submissionVersion: version,
        submittedAt: new Date().toISOString(),
      },
    ]);
    setStatus("SUBMITTED");
    setMessage(`Submission version ${version} saved locally (mock).`);
    e.currentTarget.reset();
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        description={`Week ${task.weekNumber} · ${task.requirementType === "REQUIRED" ? "Required" : "Optional"} task`}
        actions={<Link href="/intern/tasks" className="btn-secondary">Back to board</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-4 p-5 lg:col-span-2">
          <StatusBadge kind="task" value={status} />
          <TaskDetailsPanel
            task={task}
            dueDate={assignment.deadline}
            resources={task.resources}
          />
          {typeof assignment.score === "number" || assignment.mentorFeedback ? (
            <div className="rounded-xl bg-brand-soft p-3 text-sm">
              <p className="font-semibold text-ink">Mentor review</p>
              {typeof assignment.score === "number" ? (
                <p className="mt-1 text-ink-muted">Score: {assignment.score}/100</p>
              ) : null}
              {assignment.mentorFeedback ? (
                <p className="mt-1 text-ink-muted">{assignment.mentorFeedback}</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <h2 className="font-semibold text-ink">Update status</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {nextStatuses.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  No intern status changes available from {status}.
                </p>
              ) : (
                nextStatuses.map((next) => (
                  <button
                    key={next}
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setStatus(next);
                      setMessage(`Status updated to ${next} (mock).`);
                    }}
                  >
                    Mark as {next.split("_").join(" ")}
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="section-title">Submit work</h2>
          <p className="mt-2 text-xs text-ink-muted">{ALLOWED}</p>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="writtenResponse">Written response</label>
              <textarea id="writtenResponse" name="writtenResponse" className="input" rows={4} />
            </div>
            <div>
              <label className="label" htmlFor="files">Upload files (multiple)</label>
              <input id="files" name="files" type="file" multiple className="input" />
            </div>
            <div>
              <label className="label" htmlFor="externalLink">External link (optional)</label>
              <input id="externalLink" name="externalLink" type="url" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="internNotes">Intern notes</label>
              <textarea id="internNotes" name="internNotes" className="input" rows={2} />
            </div>
            <button type="submit" className="btn-primary w-full">
              Submit version
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        </section>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="section-title">My submission versions</h2>
        <ul className="mt-4 space-y-3">
          {subs
            .slice()
            .sort((a, b) => b.submissionVersion - a.submissionVersion)
            .map((sub) => (
              <li key={sub.id} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-semibold">Version {sub.submissionVersion}</p>
                <p className="mt-1 text-ink-muted">{sub.writtenResponse || "No written response"}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {formatDateTime(sub.submittedAt)} · Files: {sub.files.join(", ") || "None"}
                  {sub.externalLink ? ` · ${sub.externalLink}` : ""}
                </p>
              </li>
            ))}
          {subs.length === 0 ? <li className="text-ink-muted">No submissions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
