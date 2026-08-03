import Link from "next/link";
import { ChartPlaceholder, BarRow } from "@/components/ui/ChartPlaceholder";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/labels";
import {
  activityFeed,
  finalSummaries,
  fullName,
  getUser,
  internProfiles,
  programs,
  submissions,
  taskAssignments,
  users,
  weeklyReports,
} from "@/mock/data";
import type { ProgramStatus } from "@/types";

export default function AdminDashboardPage() {
  const mentors = users.filter((u) => u.role === "MENTOR");
  const interns = users.filter((u) => u.role === "INTERN");
  const activePrograms = programs.filter((p) => p.status === "ACTIVE").length;

  const programByStatus = (["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED", "CANCELLED"] as ProgramStatus[]).map(
    (status) => ({
      status,
      count: programs.filter((p) => p.status === status).length,
    }),
  );

  const internByMentor = mentors.map((m) => ({
    mentor: fullName(m),
    count: internProfiles.filter((ip) => ip.mentorId === m.id).length,
  }));

  const taskStatusCounts = {
    TO_DO: taskAssignments.filter((t) => t.status === "TO_DO").length,
    IN_PROGRESS: taskAssignments.filter((t) => t.status === "IN_PROGRESS").length,
    SUBMITTED: taskAssignments.filter((t) => t.status === "SUBMITTED").length,
    NEEDS_REVISION: taskAssignments.filter((t) => t.status === "NEEDS_REVISION").length,
    COMPLETED: taskAssignments.filter((t) => t.status === "COMPLETED").length,
  };

  const reportStatus = {
    DRAFT: weeklyReports.filter((r) => r.status === "DRAFT").length,
    APPROVED: weeklyReports.filter((r) => r.status === "APPROVED").length,
    REJECTED: weeklyReports.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="System oversight across mentors, interns, programs, tasks, submissions, reports, and final summaries. Admin cannot edit program content or approve mentor workflows."
        actions={
          <Link href="/admin/users" className="btn-primary">
            Manage users
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total mentors" value={mentors.length} accent />
        <MetricCard label="Total interns" value={interns.length} />
        <MetricCard label="Active programs" value={activePrograms} />
        <MetricCard label="Overall task activity" value={taskAssignments.length} hint="Task assignments tracked" />
        <MetricCard label="Overall submission activity" value={submissions.length} />
        <MetricCard label="Weekly report activity" value={weeklyReports.length} />
        <MetricCard label="Final summary activity" value={finalSummaries.length} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartPlaceholder
          title="Programs by status"
          metric="Count of programs per status"
          chartType="Bar chart"
          summary={`${activePrograms} programs currently active.`}
        >
          {programByStatus.map((row) => (
            <BarRow key={row.status} label={row.status} value={row.count} max={4} />
          ))}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Intern distribution across mentors"
          metric="Interns assigned per mentor"
          chartType="Bar chart"
        >
          {internByMentor.map((row) => (
            <BarRow key={row.mentor} label={row.mentor} value={row.count} max={3} />
          ))}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Task completion overview"
          metric="Assignments by Kanban status"
          chartType="Stacked bar / status breakdown"
        >
          {Object.entries(taskStatusCounts).map(([status, count]) => (
            <BarRow
              key={status}
              label={status}
              value={count}
              max={taskAssignments.length}
              color={status === "COMPLETED" ? "bg-success" : "bg-brand"}
            />
          ))}
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Submission trends"
          metric="Submission volume (mock snapshot)"
          chartType="Line chart placeholder"
          summary={`${submissions.length} submissions recorded in the demo dataset.`}
        >
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 1, 4].map((v, i) => (
              <div key={i} className="flex h-28 items-end rounded-lg bg-white p-2">
                <div
                  className="w-full rounded-md bg-brand"
                  style={{ height: `${v * 20}%` }}
                  aria-hidden
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted">Weeks 1–4 relative volume (mock)</p>
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Weekly report approval status"
          metric="Reports by AI content status"
          chartType="Donut / status bars"
        >
          {Object.entries(reportStatus).map(([status, count]) => (
            <BarRow key={status} label={status} value={count} max={weeklyReports.length || 1} />
          ))}
        </ChartPlaceholder>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Mentors overview</h2>
            <Link href="/admin/mentors" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {mentors.map((mentor) => (
              <li key={mentor.id} className="rounded-xl border border-line p-3">
                <p className="font-semibold text-ink">{fullName(mentor)}</p>
                <p className="text-sm text-ink-muted">
                  {programs.filter((p) => p.mentorId === mentor.id).length} programs ·{" "}
                  {internProfiles.filter((ip) => ip.mentorId === mentor.id).length} interns
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Interns by mentor</h2>
            <Link href="/admin/interns" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {mentors.map((mentor) => {
              const assigned = internProfiles.filter((ip) => ip.mentorId === mentor.id);
              return (
                <li key={mentor.id}>
                  <p className="mb-2 text-sm font-semibold text-ink">{fullName(mentor)}</p>
                  <div className="space-y-2">
                    {assigned.map((ip) => {
                      const intern = getUser(ip.userId);
                      const program = programs.find((p) => p.id === ip.programId);
                      return (
                        <div
                          key={ip.id}
                          className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm"
                        >
                          <span>{intern ? fullName(intern) : ip.userId}</span>
                          {program ? <StatusBadge kind="program" value={program.status} /> : null}
                        </div>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Recent system activity</h2>
          <Link href="/admin/activity" className="text-sm font-semibold text-brand">
            Full activity
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {activityFeed.slice(0, 5).map((item) => (
            <li key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{item.description}</p>
                <p className="text-xs text-ink-muted">
                  {item.type} · {item.actorName}
                </p>
              </div>
              <time className="text-xs text-ink-muted" dateTime={item.timestamp}>
                {formatDateTime(item.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
