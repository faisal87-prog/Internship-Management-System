"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ResourceManager } from "@/components/resources/ResourceManager";
import { TaskDetailsPanel } from "@/components/tasks/TaskDetailsPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/labels";
import {
  fullName,
  getUser,
  internProfiles,
  submissions,
  taskAssignments,
  tasks,
} from "@/mock/data";
import type { LearningResource } from "@/types";

export default function MentorTaskAssignmentPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignment = taskAssignments.find((ta) => ta.id === params.assignmentId);
  const task = tasks.find((t) => t.id === assignment?.taskId);
  const [deadline, setDeadline] = useState(assignment?.deadline ?? "");
  const [resources, setResources] = useState<LearningResource[]>(task?.resources ?? []);
  const [message, setMessage] = useState("");

  const assignedInternNames = useMemo(() => {
    if (!task) return [];
    return taskAssignments
      .filter((ta) => ta.taskId === task.id)
      .map((ta) => {
        const intern = getUser(
          internProfiles.find((ip) => ip.id === ta.internProfileId)?.userId ?? "",
        );
        return intern ? fullName(intern) : ta.internProfileId;
      });
  }, [task]);

  if (!assignment || !task) return <p>Assignment not found.</p>;

  const intern = getUser(
    internProfiles.find((ip) => ip.id === assignment.internProfileId)?.userId ?? "",
  );
  const subs = submissions.filter((s) => s.taskAssignmentId === assignment.id);

  function saveDeadline(e: FormEvent) {
    e.preventDefault();
    setMessage("Mock deadline updated after assignment.");
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        description="Task details, learning resources, and per-intern assignment tracking."
        actions={
          <>
            <Link href="/mentor/tasks" className="btn-secondary">Back to board</Link>
            {assignment.status === "SUBMITTED" || assignment.status === "NEEDS_REVISION" ? (
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
              Viewing assignment for {intern ? fullName(intern) : "intern"} · Week {task.weekNumber}
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
                onChange={(next) => {
                  setResources(next);
                  setMessage("Mock task resources updated.");
                }}
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
            <button type="submit" className="btn-secondary w-full">Update deadline</button>
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            <p className="text-xs text-ink-muted">Current: {formatDate(assignment.deadline)}</p>
          </form>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="section-title">Submission history</h2>
        <ul className="mt-4 space-y-3">
          {subs.map((sub) => (
            <li key={sub.id} className="rounded-xl border border-line p-3 text-sm">
              <p className="font-semibold">Version {sub.submissionVersion}</p>
              <p className="mt-1 text-ink-muted">{sub.writtenResponse}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Files: {sub.files.join(", ") || "None"}
                {sub.externalLink ? ` · Link: ${sub.externalLink}` : ""}
              </p>
            </li>
          ))}
          {subs.length === 0 ? <li className="text-ink-muted">No submissions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
