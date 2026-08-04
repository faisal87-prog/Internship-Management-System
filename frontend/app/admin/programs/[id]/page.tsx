import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramSummary } from "@/components/programs/ProgramSummary";
import { ResourceList } from "@/components/resources/ResourceList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProgram, referenceMaterials } from "@/mock/data";

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  const materials = referenceMaterials.filter((m) => m.programId === program.id);

  return (
    <div>
      <PageHeader
        title={program.title}
        description="Read-only program content. Admin cannot edit internship program details."
        actions={
          <Link href="/admin/programs" className="btn-secondary">
            Back
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <ProgramSummary program={program} />
        </section>

        <section className="card p-5">
          <h2 className="section-title">Reference materials</h2>
          <div className="mt-4">
            <ResourceList
              resources={materials}
              emptyLabel="No reference materials."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
