"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { roadmaps } from "@/mock/data";

export default function EditRoadmapPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roadmap = roadmaps.find((r) => r.id === params.id);
  const [message, setMessage] = useState("");

  if (!roadmap) return <p>Roadmap not found.</p>;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Mock roadmap edits saved as Draft.");
    setTimeout(() => router.push(`/mentor/roadmaps/${params.id}`), 900);
  }

  return (
    <div>
      <PageHeader
        title="Edit roadmap"
        description="Mentors can freely edit draft roadmap content before publishing."
        actions={
          <Link href={`/mentor/roadmaps/${roadmap.id}`} className="btn-secondary">
            Cancel
          </Link>
        }
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="title">Roadmap title</label>
          <input id="title" className="input" defaultValue={roadmap.title} />
        </div>
        <div>
          <label className="label" htmlFor="summary">Roadmap summary</label>
          <textarea id="summary" className="input" rows={3} defaultValue={roadmap.summary} />
        </div>
        <div>
          <label className="label" htmlFor="scope">Assignment scope</label>
          <select id="scope" className="input" defaultValue={roadmap.scope}>
            <option value="PROGRAM">Entire Program</option>
            <option value="GROUP">Selected Interns</option>
            <option value="INDIVIDUAL">Individual Intern</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="weeks">Number of weeks</label>
          <input id="weeks" type="number" className="input" defaultValue={roadmap.numberOfWeeks} />
        </div>
        <p className="text-sm text-ink-muted">
          Week and task-level editing UI is represented here at summary level for the mock MVP screens.
          Full nested editors can be expanded later without changing requirements.
        </p>
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">Save draft</button>
          <button type="button" className="btn-secondary">Regenerate roadmap</button>
        </div>
      </form>
    </div>
  );
}
