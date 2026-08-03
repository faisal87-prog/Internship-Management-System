"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { formatDate, taskStatusLabel } from "@/lib/labels";
import type { TaskStatus } from "@/types";

const columns: TaskStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "SUBMITTED",
  "NEEDS_REVISION",
  "COMPLETED",
];

export default function InternTasksPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  const assignments = ctx?.assignments ?? [];
  const myTasks = ctx?.myTasks ?? [];

  return (
    <div>
      <PageHeader
        title="My tasks"
        description="Update your individual task status and open a task to submit work."
      />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((status) => {
          const items = assignments.filter((ta) => ta.status === status);
          return (
            <section
              key={status}
              className="min-w-[240px] flex-1 rounded-2xl border border-line bg-white/80 p-3"
              aria-label={taskStatusLabel[status]}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{taskStatusLabel[status]}</h2>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  {items.length}
                </span>
              </header>
              <ul className="space-y-3">
                {items.map((ta) => {
                  const task = myTasks.find((row) => row.assignment.id === ta.id)?.task;
                  return (
                    <li key={ta.id}>
                      <Link
                        href={`/intern/tasks/${ta.id}`}
                        className="block rounded-xl border border-line bg-white p-3 shadow-soft hover:border-brand/40"
                      >
                        <p className="font-semibold text-ink">{task?.title}</p>
                        <p className="mt-1 text-xs text-ink-muted">Due {formatDate(ta.deadline)}</p>
                        {typeof ta.score === "number" ? (
                          <p className="mt-2 text-xs font-semibold text-brand">{ta.score}/100</p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
