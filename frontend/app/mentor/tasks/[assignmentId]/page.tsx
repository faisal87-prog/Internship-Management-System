"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  PendingLearningResource,
  ResourceManager,
} from "@/components/resources/ResourceManager";
import { TaskDetailsPanel } from "@/components/tasks/TaskDetailsPanel";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listInternProfiles } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/api/errors";
import { listSubmissions } from "@/lib/api/submissions";
import {
  createTaskResource,
  deleteTaskResource,
  getAssignment,
  listAssignments,
  listTaskResources,
  updateAssignment,
} from "@/lib/api/tasks";
import { formatDate } from "@/lib/labels";
import { fullName } from "@/lib/names";
import type { LearningResource, Submission, Task, TaskAssignment } from "@/types";

export default function MentorTaskAssignmentPage() {
  const params = useParams<{ assignmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [internName, setInternName] = useState("Intern");
  const [assignedInternNames, setAssignedInternNames] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [resources, setResources] = useState<PendingLearningResource[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [message, setMessage] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ assignment: assign, task: nestedTask, raw }, allAssigns, interns, submissions] =
        await Promise.all([
          getAssignment(params.assignmentId),
          listAssignments(),
          listInternProfiles(),
          listSubmissions(params.assignmentId),
        ]);
      setAssignment(assign);
      const resolvedTask = nestedTask;
      setTask(resolvedTask);
      setDeadline(assign.deadline?.slice(0, 10) || "");
      const intern = interns.find((ip) => ip.id === assign.internProfileId);
      setInternName(intern ? fullName(intern.user) : assign.internName || raw.intern_name || "Intern");

      if (resolvedTask) {
        const taskResources = await listTaskResources(resolvedTask.id);
        setResources(taskResources.length ? taskResources : resolvedTask.resources || []);
        const names = allAssigns
          .filter((ta) => ta.taskId === resolvedTask.id)
          .map((ta) => {
            const ip = interns.find((row) => row.id === ta.internProfileId);
            return ip ? fullName(ip.user) : ta.internProfileId;
          });
        setAssignedInternNames(names);
      } else {
        setResources([]);
        setAssignedInternNames([]);
      }
      setSubs(submissions);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load assignment."));
    } finally {
      setLoading(false);
    }
  }, [params.assignmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canReview = useMemo(
    () =>
      assignment?.status === "SUBMITTED" || assignment?.status === "NEEDS_REVISION",
    [assignment?.status],
  );

  async function saveDeadline(e: FormEvent) {
    e.preventDefault();
    if (!assignment) return;
    setSavingDeadline(true);
    setMessage("");
    try {
      const updated = await updateAssignment(assignment.id, {
        due_date_override: deadline || null,
      });
      setAssignment(updated);
      setMessage("Deadline updated.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not update deadline."));
    } finally {
      setSavingDeadline(false);
    }
  }

  async function onAddResource(input: {
    title: string;
    externalLink: string;
    files: File[];
  }): Promise<LearningResource[]> {
    if (!task) return [];
    if (!input.files.length && !input.externalLink) {
      throw new Error("Provide a file or an external link (or both).");
    }
    const created: LearningResource[] = [];
    if (input.files.length) {
      for (const file of input.files) {
        created.push(
          await createTaskResource({
            task: Number(task.id),
            // title falls back to filename inside createTaskResource if empty
            title: input.title || file.name,
            file,
            external_url: input.externalLink || undefined,
          }),
        );
      }
    } else {
      created.push(
        await createTaskResource({
          task: Number(task.id),
          title: input.title || input.externalLink,
          external_url: input.externalLink,
        }),
      );
    }
    setMessage("Task resources updated.");
    return created;
  }

  async function onRemoveResource(id: string) {
    await deleteTaskResource(id);
    setMessage("Resource removed.");
  }

  if (loading) return <LoadingState label="Loading assignment…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!assignment || !task) return <p>Assignment not found.</p>;

  return (
    <div>
      <PageHeader
        title={task.title}
        description="Task details, learning resources, and per-intern assignment tracking."
        actions={
          <>
            <Link href="/mentor/tasks" className="btn-secondary">Back to board</Link>
            {canReview ? (
              <Link href={`/mentor/reviews/${assignment.id}`} className="btn-primary">
                Review submission
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-4 p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge kind="task" value={assignment.status} />
            <span className="text-sm text-ink-muted">
              Viewing assignment for {internName} · Week {task.weekNumber}
            </span>
          </div>

          <TaskDetailsPanel
            task={task}
            dueDate={deadline || assignment.deadline}
            assignedInternNames={assignedInternNames}
            resources={resources}
            resourcesSlot={
              <ResourceManager
                title="Task Resources"
                resources={resources}
                onChange={setResources}
                onAddRequest={onAddResource}
                onRemoveRequest={onRemoveResource}
              />
            }
          />

          <dl className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-semibold text-ink-muted">Score</dt>
              <dd>
                {typeof assignment.score === "number" ? `${assignment.score}/100` : "Not scored"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Feedback</dt>
              <dd>{assignment.mentorFeedback || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="section-title">Deadline</h2>
          <form onSubmit={saveDeadline} className="mt-3 space-y-3">
            <input
              type="date"
              className="input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <button type="submit" className="btn-secondary w-full" disabled={savingDeadline}>
              {savingDeadline ? "Updating…" : "Update deadline"}
            </button>
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            <p className="text-xs text-ink-muted">Current: {formatDate(assignment.deadline)}</p>
          </form>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="section-title">Submission history</h2>
        <ul className="mt-4 space-y-3">
          {subs.map((sub) => (
            <li key={sub.id} className="rounded-xl border border-line p-4 text-sm space-y-3">

              {/* Version + date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">Version {sub.submissionVersion}</p>
                <p className="text-xs text-ink-muted">{formatDate(sub.submittedAt)}</p>
              </div>

              {/* Written response */}
              {sub.writtenResponse ? (
                <p className="text-ink-muted whitespace-pre-wrap">{sub.writtenResponse}</p>
              ) : null}

              {/* Intern notes */}
              {sub.internNotes ? (
                <p className="text-xs text-ink-muted italic">
                  Intern notes: {sub.internNotes}
                </p>
              ) : null}

              {/* Uploaded files — each is a clickable download link */}
              {sub.files.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-ink-muted mb-1">
                    Attached files
                  </p>
                  <ul className="space-y-1">
                    {sub.files.map((f) => (
                      <li key={f.url || f.name}>
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={f.name}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline break-all"
                          >
                            {/* Paper-clip icon */}
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {f.name}
                          </a>
                        ) : (
                          <span className="text-ink-muted">{f.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* External link */}
              {sub.externalLink ? (
                <div>
                  <p className="text-xs font-semibold text-ink-muted mb-1">
                    External link
                  </p>
                  <a
                    href={
                      sub.externalLink.startsWith("http")
                        ? sub.externalLink
                        : `https://${sub.externalLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {/* External link icon */}
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {sub.externalLink}
                  </a>
                </div>
              ) : null}

            </li>
          ))}
          {subs.length === 0 ? (
            <li className="text-ink-muted">No submissions yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
