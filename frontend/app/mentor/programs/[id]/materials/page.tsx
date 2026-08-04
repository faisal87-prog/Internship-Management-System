"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ResourceList } from "@/components/resources/ResourceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { inferResourceKind, MOCK_PDF_HREF } from "@/lib/resources";
import { getProgram, referenceMaterials as initial } from "@/mock/data";
import type { ReferenceMaterial } from "@/types";

const ALLOWED = "PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, JPEG, TXT, CSV, ZIP · max 20 MB";

export default function ProgramMaterialsPage() {
  const params = useParams<{ id: string }>();
  const program = getProgram(params.id);
  const [items, setItems] = useState<ReferenceMaterial[]>(
    initial.filter((m) => m.programId === params.id),
  );
  const [message, setMessage] = useState("");

  if (!program) return <p>Program not found.</p>;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "");
    const externalLink = String(form.get("externalLink") || "").trim();
    const file = form.get("file");
    const fileName = file instanceof File && file.name ? file.name : undefined;
    const href = externalLink || MOCK_PDF_HREF;
    setItems((prev) => [
      ...prev,
      {
        id: `rm-local-${prev.length + 1}`,
        programId: params.id,
        title,
        fileName,
        kind: inferResourceKind(fileName, href),
        href,
      },
    ]);
    setMessage("Mock reference material added (not uploaded to a server).");
    e.currentTarget.reset();
  }

  return (
    <div>
      <PageHeader
        title="Reference materials"
        description={`Optional materials for AI roadmap context. Allowed types: ${ALLOWED}.`}
        actions={
          <Link href={`/mentor/programs/${program.id}`} className="btn-secondary">
            Back to program
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="card mb-6 grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="file">File upload</label>
          <input id="file" name="file" type="file" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="externalLink">External link (optional)</label>
          <input id="externalLink" name="externalLink" type="url" className="input" placeholder="https://" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary">Add material</button>
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No reference materials"
          description="Add PDFs, documents, presentations, or links to support roadmap generation."
        />
      ) : (
        <div className="card p-5">
          <ResourceList
            resources={items}
            onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
          />
        </div>
      )}
    </div>
  );
}
