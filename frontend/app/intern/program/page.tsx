"use client";

import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { getInternContext } from "@/lib/intern";

export default function InternProgramPage() {
  const { user } = useMockAuth();
  const ctx = user ? getInternContext(user.id) : null;
  if (!ctx?.program || !ctx.mentor) return <p>No program assigned.</p>;

  return (
    <div>
      <PageHeader
        title="My program"
        description="You belong to one internship program and one mentor during the MVP."
      />
      <section className="card p-5">
        <ProgramSummary program={ctx.program} />
      </section>
    </div>
  );
}
