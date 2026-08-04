"use client";

import Link from "next/link";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { programs } from "@/mock/data";

export default function MentorProgramsPage() {
  const { user } = useMockAuth();
  const mine = programs.filter((p) => p.mentorId === user?.id);

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Create and manage internship programs you own. Program status changes are manual."
        actions={
          <Link href="/mentor/programs/new" className="btn-primary">
            Create program
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {mine.map((program) => (
          <article key={program.id} className="card p-5">
            <ProgramSummary program={program} compact />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/mentor/programs/${program.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                View
              </Link>
              <Link href={`/mentor/programs/${program.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                Edit
              </Link>
              <Link href={`/mentor/programs/${program.id}/materials`} className="btn-secondary px-3 py-1.5 text-xs">
                Materials
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
