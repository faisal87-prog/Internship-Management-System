"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/labels";
import {
  fullName,
  getProgram,
  getUser,
  internProfiles,
  referenceMaterials,
  roadmaps,
} from "@/mock/data";

export default function MentorProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const program = getProgram(params.id);
  if (!program) {
    return <p className="text-ink-muted">Program not found.</p>;
  }
  const materials = referenceMaterials.filter((m) => m.programId === program.id);
  const programRoadmaps = roadmaps.filter((r) => r.programId === program.id);
  const interns = internProfiles.filter((ip) => ip.programId === program.id);

  return (
    <div>
      <PageHeader
        title={program.title}
        description={program.description}
        actions={
          <>
            <Link href={`/mentor/programs/${program.id}/edit`} className="btn-primary">
              Edit program
            </Link>
            <Link href={`/mentor/programs/${program.id}/materials`} className="btn-secondary">
              Reference materials
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-4 p-5 lg:col-span-2">
          <StatusBadge kind="program" value={program.status} />
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-semibold text-ink-muted">Role</dt>
              <dd>{program.role}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Department</dt>
              <dd>{program.department}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Dates</dt>
              <dd>
                {formatDate(program.startDate)} – {formatDate(program.endDate)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Weekly hours</dt>
              <dd>{program.weeklyHours}</dd>
            </div>
          </dl>
          <div>
            <h2 className="font-semibold">Goals</h2>
            <p className="text-sm text-ink-muted">{program.goals}</p>
          </div>
          <div>
            <h2 className="font-semibold">Skills to develop</h2>
            <p className="text-sm text-ink-muted">{program.skillsToDevelop.join(", ")}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title">Assigned interns</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {interns.map((ip) => {
                const u = getUser(ip.userId);
                return <li key={ip.id}>{u ? fullName(u) : ip.userId}</li>;
              })}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="section-title">Roadmaps</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {programRoadmaps.map((r) => (
                <li key={r.id}>
                  <Link href={`/mentor/roadmaps/${r.id}`} className="font-medium text-brand hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="section-title">Reference materials</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {materials.map((m) => (
                <li key={m.id}>{m.title}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
