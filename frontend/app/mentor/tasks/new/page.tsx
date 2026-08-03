"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getUser, internProfiles, programs } from "@/mock/data";

export default function CreateTaskPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const myPrograms = programs.filter((p) => p.mentorId === user?.id);
  const myInterns = internProfiles.filter((ip) => ip.mentorId === user?.id);
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Mock manual task created and assigned. Each selected intern gets a separate TaskAssignment.");
    setTimeout(() => router.push("/mentor/tasks"), 1100);
  }

  return (
    <div>
      <PageHeader
        title="Create task manually"
        description="Mentors can create tasks and assign one task to multiple interns."
        actions={<Link href="/mentor/tasks" className="btn-secondary">Cancel</Link>}
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="programId">Program</label>
          <select id="programId" className="input" required>
            {myPrograms.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input" rows={3} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="difficulty">Difficulty</label>
            <input id="difficulty" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="estimatedTime">Estimated time</label>
            <input id="estimatedTime" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="deadline">Deadline</label>
            <input id="deadline" type="date" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="requirementType">Requirement</label>
            <select id="requirementType" className="input" defaultValue="REQUIRED">
              <option value="REQUIRED">Required</option>
              <option value="OPTIONAL">Optional</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="deliverable">Deliverable</label>
          <input id="deliverable" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="successCriteria">Success criteria</label>
          <textarea id="successCriteria" className="input" rows={2} />
        </div>
        <div>
          <label className="label" htmlFor="interns">Assign interns</label>
          <select id="interns" className="input" multiple required>
            {myInterns.map((ip) => {
              const u = getUser(ip.userId);
              return (
                <option key={ip.id} value={ip.id}>
                  {u ? fullName(u) : ip.id}
                </option>
              );
            })}
          </select>
        </div>
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
        ) : null}
        <button type="submit" className="btn-primary">Create and assign</button>
      </form>
    </div>
  );
}
