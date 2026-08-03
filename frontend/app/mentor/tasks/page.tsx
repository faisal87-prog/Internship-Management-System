"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { formatDate, taskStatusLabel } from "@/lib/labels";
import {
  fullName,
  getUser,
  internProfiles,
  programs,
  taskAssignments,
  tasks,
} from "@/mock/data";
import type { TaskStatus } from "@/types";

const columns: TaskStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "SUBMITTED",
  "NEEDS_REVISION",
  "COMPLETED",
];

export default function MentorTasksPage() {
  const { user } = useMockAuth();
  const myProgramIds = programs.filter((p) => p.mentorId === user?.id).map((p) => p.id);
  const myInterns = internProfiles.filter((ip) => ip.mentorId === user?.id);
  const myAssignments = taskAssignments.filter((ta) =>
    myInterns.some((ip) => ip.id === ta.internProfileId),
  );
  const myTasks = tasks.filter((t) => myProgramIds.includes(t.programId));

  return (
    <div>
      <PageHeader
        title="Task board"
        description="Kanban pipeline for intern task assignments. Mentors can create tasks manually and manage deadlines."
        actions={
          <Link href="/mentor/tasks/new" className="btn-primary">
            Create task
          </Link>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((status) => {
          const items = myAssignments.filter((ta) => ta.status === status);
          return (
            <section
              key={status}
              className="min-w-[260px] flex-1 rounded-2xl border border-line bg-white/80 p-3"
              aria-label={taskStatusLabel[status]}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-ink">{taskStatusLabel[status]}</h2>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  {items.length}
                </span>
              </header>
              <ul className="space-y-3">
                {items.map((ta) => {
                  const task = myTasks.find((t) => t.id === ta.taskId);
                  const intern = getUser(
                    myInterns.find((ip) => ip.id === ta.internProfileId)?.userId ?? "",
                  );
                  return (
                    <li key={ta.id}>
                      <Link
                        href={`/mentor/tasks/${ta.id}`}
                        className="block rounded-xl border border-line bg-white p-3 shadow-soft transition hover:border-brand/40"
                      >
                        <p className="font-semibold text-ink">{task?.title}</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {intern ? fullName(intern) : "Intern"} · Week {task?.weekNumber}
                        </p>
                        <p className="mt-2 text-xs text-ink-muted">Due {formatDate(ta.deadline)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="card mt-6 p-5">
        <h2 className="section-title">All program tasks</h2>
        <ul className="mt-4 divide-y divide-line">
          {myTasks.map((task) => (
            <li key={task.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink">{task.title}</p>
                <p className="text-sm text-ink-muted">
                  Week {task.weekNumber} · {task.source} · {task.requirementType}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {task.difficulty}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
