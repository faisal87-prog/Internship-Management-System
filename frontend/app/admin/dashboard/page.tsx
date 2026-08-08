import Link from "next/link";
import { ProgramStatusChart } from "@/components/admin/ProgramStatusChart";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  finalSummaries,
  fullName,
  getUser,
  internProfiles,
  programs,
  users,
} from "@/mock/data";

export default function AdminDashboardPage() {
  const mentors = users.filter((u) => u.role === "MENTOR");
  const interns = users.filter((u) => u.role === "INTERN");
  const activePrograms = programs.filter((p) => p.status === "ACTIVE").length;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="System oversight across mentors, interns, programs, and final summaries. Admin cannot edit program content or approve mentor workflows."
        actions={
          <>
            <Link href="/admin/analytics" className="btn-secondary">
              Programs analytics
            </Link>
            <Link href="/admin/users" className="btn-primary">
              Manage users
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total mentors" value={mentors.length} accent />
        <MetricCard label="Total interns" value={interns.length} />
        <MetricCard label="Active programs" value={activePrograms} />
        <MetricCard label="Final summary activity" value={finalSummaries.length} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <ProgramStatusChart />
        </div>

        <section className="card p-5 xl:col-span-1">
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

        <section className="card p-5 xl:col-span-1">
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
                    {assigned.length === 0 ? (
                      <p className="text-xs text-ink-muted">No interns assigned</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
