"use client";

import Link from "next/link";
import { ChartPlaceholder, BarRow } from "@/components/ui/ChartPlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";
import { formatDate } from "@/lib/labels";
import { fullName } from "@/mock/data";

export default function InternDashboardPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;

  if (!ctx || !ctx.program || !ctx.mentor) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-semibold">No program assigned</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Your intern profile is not linked to an active program in the mock data.
        </p>
      </div>
    );
  }

  const { program, mentor, myTasks, assignments, approvedReports } = ctx;
  const completed = assignments.filter((ta) => ta.status === "COMPLETED").length;
  const upcoming = assignments
    .filter((ta) => ta.status !== "COMPLETED")
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const attention = assignments.filter((ta) =>
    ["TO_DO", "IN_PROGRESS", "NEEDS_REVISION", "SUBMITTED"].includes(ta.status),
  );
  const recentFeedback = assignments.filter((ta) => ta.mentorFeedback).slice(0, 3);
  const scored = assignments.filter((ta) => typeof ta.score === "number");

  return (
    <div>
      <PageHeader
        title="Intern Dashboard"
        description={`Welcome back. You are enrolled in ${program.title} with mentor ${fullName(mentor)}.`}
        actions={
          <Link href="/intern/tasks" className="btn-primary">
            Open my tasks
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Current assigned tasks" value={assignments.length} accent />
        <MetricCard label="Upcoming deadlines" value={upcoming.length} />
        <MetricCard label="Completed tasks" value={completed} />
        <MetricCard label="Recent mentor feedback" value={recentFeedback.length} />
        <MetricCard label="Approved weekly reports" value={approvedReports.length} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartPlaceholder
          title="Personal task completion progress"
          metric="Completed vs total assignments"
          chartType="Progress bar"
          summary={`${completed} of ${assignments.length} tasks completed`}
        >
          <BarRow label="Completed" value={completed} max={assignments.length || 1} color="bg-success" />
          <BarRow
            label="Remaining"
            value={assignments.length - completed}
            max={assignments.length || 1}
          />
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Completed versus remaining tasks"
          metric="Assignment completion split"
          chartType="Comparison bars"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-4 text-center">
              <p className="text-3xl font-bold text-success">{completed}</p>
              <p className="text-xs text-ink-muted">Completed</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center">
              <p className="text-3xl font-bold text-brand">{assignments.length - completed}</p>
              <p className="text-xs text-ink-muted">Remaining</p>
            </div>
          </div>
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Score history"
          metric="Mentor scores (0–100 integers)"
          chartType="Line / bar placeholder"
        >
          <div className="flex h-28 items-end gap-2">
            {scored.length ? (
              scored.map((ta) => (
                <div
                  key={ta.id}
                  className="flex-1 rounded-t bg-brand"
                  style={{ height: `${ta.score}%` }}
                  aria-label={`Score ${ta.score}`}
                />
              ))
            ) : (
              <p className="text-sm text-ink-muted">No scores yet.</p>
            )}
          </div>
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Weekly learning activity"
          metric="Tasks by week number"
          chartType="Bar chart"
        >
          {[1, 2, 3].map((week) => (
            <BarRow
              key={week}
              label={`Week ${week}`}
              value={myTasks.filter((row) => row.task.weekNumber === week).length}
              max={3}
            />
          ))}
        </ChartPlaceholder>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <h2 className="section-title">Current program</h2>
          <p className="mt-3 font-semibold text-ink">{program.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{program.role}</p>
          <p className="mt-3 text-sm text-ink-muted">Mentor: {fullName(mentor)}</p>
          <StatusBadge kind="program" value={program.status} />
          <Link href="/intern/program" className="mt-4 inline-flex text-sm font-semibold text-brand">
            View program details
          </Link>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="section-title">Tasks requiring attention</h2>
          <ul className="mt-4 space-y-3">
            {attention.slice(0, 5).map((ta) => {
              const task = myTasks.find((row) => row.assignment.id === ta.id)?.task;
              return (
                <li key={ta.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                  <div>
                    <p className="font-medium text-ink">{task?.title}</p>
                    <p className="text-xs text-ink-muted">Due {formatDate(ta.deadline)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge kind="task" value={ta.status} />
                    <Link href={`/intern/tasks/${ta.id}`} className="text-sm font-semibold text-brand">
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="section-title">Recent approved feedback & reports</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recentFeedback.map((ta) => (
            <div key={ta.id} className="rounded-xl bg-surface-muted p-3 text-sm">
              <p className="font-medium text-ink">Task feedback</p>
              <p className="mt-1 text-ink-muted">{ta.mentorFeedback}</p>
              {typeof ta.score === "number" ? (
                <p className="mt-2 text-xs font-semibold text-brand">Score {ta.score}/100</p>
              ) : null}
            </div>
          ))}
          {approvedReports.map((report) => (
            <Link
              key={report.id}
              href={`/intern/reports/${report.id}`}
              className="rounded-xl border border-line p-3 text-sm transition hover:border-brand/40"
            >
              <p className="font-medium text-ink">Approved week {report.weekNumber} report</p>
              <p className="mt-1 text-ink-muted">{report.content.performanceSummary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
