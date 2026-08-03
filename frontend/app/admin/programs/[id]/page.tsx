import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/labels";
import { fullName, getProgram, getUser, referenceMaterials } from "@/mock/data";

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  const mentor = getUser(program.mentorId);
  const materials = referenceMaterials.filter((m) => m.programId === program.id);

  return (
    <div>
      <PageHeader
        title={program.title}
        description="Read-only program content. Admin cannot edit internship program details."
        actions={
          <>
            <Link href="/admin/programs" className="btn-secondary">
              Back
            </Link>
            <button type="button" className="btn-secondary">
              Archive program
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card space-y-3 p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge kind="program" value={program.status} />
            <span className="text-sm text-ink-muted">{program.department}</span>
          </div>
          <p className="text-ink">{program.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Role</dt>
              <dd>{program.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Mentor</dt>
              <dd>{mentor ? fullName(mentor) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Dates</dt>
              <dd>
                {formatDate(program.startDate)} – {formatDate(program.endDate)} ({program.durationWeeks} weeks)
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Weekly hours</dt>
              <dd>{program.weeklyHours}</dd>
            </div>
          </dl>
          <div>
            <h2 className="font-semibold text-ink">Goals</h2>
            <p className="mt-1 text-sm text-ink-muted">{program.goals}</p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Expected outcome</h2>
            <p className="mt-1 text-sm text-ink-muted">{program.expectedOutcome}</p>
          </div>
          {program.finalProject ? (
            <div>
              <h2 className="font-semibold text-ink">Final project</h2>
              <p className="mt-1 text-sm text-ink-muted">{program.finalProject}</p>
            </div>
          ) : null}
        </section>

        <section className="card p-5">
          <h2 className="section-title">Reference materials</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {materials.map((m) => (
              <li key={m.id} className="rounded-xl bg-surface-muted px-3 py-2">
                <p className="font-medium text-ink">{m.title}</p>
                <p className="text-ink-muted">{m.fileName || m.externalLink}</p>
              </li>
            ))}
            {materials.length === 0 ? (
              <li className="text-ink-muted">No reference materials.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
