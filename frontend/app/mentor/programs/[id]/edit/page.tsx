"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getProgram } from "@/mock/data";

export default function EditProgramPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const program = getProgram(params.id);
  const [message, setMessage] = useState("");

  if (!program) return <p>Program not found.</p>;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Mock save complete. Status updates are manual and local only.");
    setTimeout(() => router.push(`/mentor/programs/${params.id}`), 1000);
  }

  return (
    <div>
      <PageHeader
        title="Edit program"
        description="Update program details and manually manage program status."
        actions={
          <Link href={`/mentor/programs/${program.id}`} className="btn-secondary">
            Cancel
          </Link>
        }
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="title">Program title</label>
          <input id="title" className="input" defaultValue={program.title} required />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input" rows={3} defaultValue={program.description} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" defaultValue={program.status}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="weeklyHours">Weekly hours</label>
            <input id="weeklyHours" type="number" className="input" defaultValue={program.weeklyHours} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="goals">Goals</label>
          <textarea id="goals" className="input" rows={2} defaultValue={program.goals} />
        </div>
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
