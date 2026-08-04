"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewProgramPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Mock program created as Draft. Backend persistence is not connected yet.");
    setTimeout(() => router.push("/mentor/programs"), 1200);
  }

  return (
    <div>
      <PageHeader
        title="Create internship program"
        description="Mentor is assigned automatically from the logged-in mentor account."
        actions={<Link href="/mentor/programs" className="btn-secondary">Cancel</Link>}
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="title">Program title</label>
          <input id="title" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" required rows={3} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="role">Role</label>
            <input id="role" required className="input" placeholder="e.g. Frontend Engineering Intern" />
          </div>
          <div>
            <label className="label" htmlFor="department">Department</label>
            <input id="department" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="startDate">Start date</label>
            <input id="startDate" type="date" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="endDate">End date</label>
            <input id="endDate" type="date" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="durationWeeks">Duration in weeks</label>
            <input id="durationWeeks" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="weeklyHours">Weekly hours</label>
            <input id="weeklyHours" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="maxInterns">Maximum number of interns</label>
            <input id="maxInterns" type="number" min={1} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="skillsToDevelop">Skills to develop</label>
          <input id="skillsToDevelop" className="input" placeholder="Comma-separated" />
        </div>
        <div>
          <label className="label" htmlFor="skillsNeeded">Skills needed</label>
          <input id="skillsNeeded" className="input" placeholder="Comma-separated" />
        </div>
        <div>
          <label className="label" htmlFor="goals">Goals</label>
          <textarea id="goals" rows={2} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="expectedOutcome">Expected outcome</label>
          <textarea id="expectedOutcome" rows={2} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="finalProject">Final project (optional)</label>
          <input id="finalProject" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="additionalInstructions">Additional instructions (optional)</label>
          <textarea id="additionalInstructions" rows={2} className="input" />
        </div>
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        <button type="submit" className="btn-primary">Save program</button>
      </form>
    </div>
  );
}
