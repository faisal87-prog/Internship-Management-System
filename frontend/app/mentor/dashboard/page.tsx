"use client";

import Link from "next/link";
import { ChartPlaceholder, BarRow } from "@/components/ui/ChartPlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMockAuth } from "@/context/MockAuthContext";
import { formatDate } from "@/lib/labels";
import {
  fullName,
  getUser,
  internProfiles,
  programs,
  submissions,
  taskAssignments,
  tasks,
  weeklyReports,
} from "@/mock/data";

export default function MentorDashboardPage() {
  const { user } = useMockAuth();
  const mentorId = user?.id ?? "u-mentor-1";

  const myPrograms = programs.filter((p) => p.mentorId === mentorId);
  const myInterns = internProfiles.filter((ip) => ip.mentorId === mentorId);
  const myAssignments = taskAssignments.filter((ta) =>
    myInterns.some((ip) => ip.id === ta.internProfileId),
  );
  const waitingReview = myAssignments.filter((ta) => ta.status === "SUBMITTED");
  const waitingReports = weeklyReports.filter(
    (r) =>
      r.status === "DRAFT" &&
      myInterns.some((ip) => ip.id === r.internProfileId),
  );
  const scored = myAssignments.filter((ta) => typeof ta.score === "number");
  const avgScore =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((sum, ta) => sum + (ta.score ?? 0), 0) / scored.length);

  const recentSubs = submissions
    .filter((s) => myAssignments.some((ta) => ta.id === s.taskAssignmentId))
    .slice()
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 4);

  const upcoming = myAssignments
    .filter((ta) => ta.status !== "COMPLETED")
    .slice()
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Mentor Dashboard"
        description="Manage programs, review submissions, and approve AI-generated reports for your assigned interns."
        actions={
          <>
            <Link href="/mentor/programs/new" className="btn-primary">
              Create program
            </Link>
            <Link href="/mentor/reviews" className="btn-secondary">
              Review queue
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned interns" value={myInterns.length} accent />
        <MetricCard label="Programs managed" value={myPrograms.length} />
        <MetricCard label="Tasks waiting for review" value={waitingReview.length} />
        <MetricCard
          label="Weekly reports waiting for approval"
          value={waitingReports.length}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartPlaceholder
          title="Task completion progress"
          metric="Assignments by status"
          chartType="Bar chart"
        >
          {(["TO_DO", "IN_PROGRESS", "SUBMITTED", "NEEDS_REVISION", "COMPLETED"] as const).map(
            (status) => (
              <BarRow
                key={status}
                label={status}
                value={myAssignments.filter((ta) => ta.status === status).length}
                max={myAssignments.length || 1}
              />
            ),
          )}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Submission status"
          metric="Review pipeline snapshot"
          chartType="Status bars"
          summary={`${recentSubs.length} recent submissions in queue view.`}
        >
          <BarRow label="Awaiting review" value={waitingReview.length} max={5} />
          <BarRow
            label="Needs revision"
            value={myAssignments.filter((ta) => ta.status === "NEEDS_REVISION").length}
            max={5}
            color="bg-warning"
          />
          <BarRow
            label="Completed"
            value={myAssignments.filter((ta) => ta.status === "COMPLETED").length}
            max={5}
            color="bg-success"
          />
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Average intern scores"
          metric="Mean score across scored assignments"
          chartType="KPI + distribution"
          summary={`Average score: ${avgScore}/100`}
        >
          <div className="flex h-24 items-end gap-2">
            {scored.map((ta) => (
              <div key={ta.id} className="flex-1 rounded-t bg-brand" style={{ height: `${ta.score}%` }} />
            ))}
          </div>
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Intern performance overview"
          metric="Completed vs open assignments per intern"
          chartType="Grouped bar"
        >
          {myInterns.map((ip) => {
            const intern = getUser(ip.userId);
            const assigned = myAssignments.filter((ta) => ta.internProfileId === ip.id);
            const done = assigned.filter((ta) => ta.status === "COMPLETED").length;
            return (
              <BarRow
                key={ip.id}
                label={intern ? fullName(intern) : ip.id}
                value={done}
                max={assigned.length || 1}
              />
            );
          })}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Weekly workload distribution"
          metric="Tasks by roadmap week"
          chartType="Bar chart"
        >
          {[1, 2, 3].map((week) => (
            <BarRow
              key={week}
              label={`Week ${week}`}
              value={tasks.filter((t) => t.weekNumber === week && myPrograms.some((p) => p.id === t.programId)).length}
              max={3}
            />
          ))}
        </ChartPlaceholder>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Recent submissions</h2>
            <Link href="/mentor/reviews" className="text-sm font-semibold text-brand">
              Open reviews
            </Link>
          </div>
          <ul className="space-y-3">
            {recentSubs.map((sub) => {
              const assignment = myAssignments.find((ta) => ta.id === sub.taskAssignmentId);
              const task = tasks.find((t) => t.id === assignment?.taskId);
              const intern = getUser(
                myInterns.find((ip) => ip.id === assignment?.internProfileId)?.userId ?? "",
              );
              return (
                <li key={sub.id} className="rounded-xl border border-line p-3">
                  <p className="font-medium text-ink">{task?.title}</p>
                  <p className="text-sm text-ink-muted">
                    {intern ? fullName(intern) : "Intern"} · v{sub.submissionVersion}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="section-title">Upcoming task deadlines</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.map((ta) => {
              const task = tasks.find((t) => t.id === ta.taskId);
              return (
                <li key={ta.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{task?.title}</p>
                    <p className="text-ink-muted">Due {formatDate(ta.deadline)}</p>
                  </div>
                  <StatusBadge kind="task" value={ta.status} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Programs managed</h2>
          <Link href="/mentor/programs" className="text-sm font-semibold text-brand">
            View programs
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {myPrograms.map((program) => (
            <Link
              key={program.id}
              href={`/mentor/programs/${program.id}`}
              className="rounded-xl border border-line p-4 transition hover:border-brand/40 hover:bg-brand-soft/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink">{program.title}</p>
                <StatusBadge kind="program" value={program.status} />
              </div>
              <p className="mt-2 text-sm text-ink-muted">{program.role}</p>
            </Link>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/mentor/roadmaps" className="btn-secondary">
            Manage roadmaps
          </Link>
          <Link href="/mentor/weekly-reports" className="btn-secondary">
            Weekly reports
          </Link>
          <Link href="/mentor/final-summaries" className="btn-secondary">
            Final summaries
          </Link>
        </div>
      </section>
    </div>
  );
}
