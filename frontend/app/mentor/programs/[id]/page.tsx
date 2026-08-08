"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InternChips } from "@/components/interns/InternChips";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { ResourceList } from "@/components/resources/ResourceList";
import { PageHeader } from "@/components/ui/PageHeader";
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
        description="Full program overview for mentor management."
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
        <section className="card p-5 lg:col-span-2">
          <ProgramSummary program={program} />
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title">Assigned interns</h2>
            <div className="mt-3">
              <InternChips
                items={interns.map((ip) => {
                  const u = getUser(ip.userId);
                  return { id: ip.id, name: u ? fullName(u) : ip.userId };
                })}
                emptyLabel="No interns assigned to this program."
              />
            </div>
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
            <div className="mt-3">
              <ResourceList
                resources={materials}
                emptyLabel="No reference materials yet."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
