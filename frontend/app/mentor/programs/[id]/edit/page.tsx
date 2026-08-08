"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { InternChipPicker } from "@/components/interns/InternChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getProgram, getUser, internProfiles } from "@/mock/data";

export default function EditProgramPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useMockAuth();
  const program = getProgram(params.id);
  const [message, setMessage] = useState("");
  const initialSelected = useMemo(
    () =>
      internProfiles
        .filter((ip) => ip.programId === params.id)
        .map((ip) => ip.id),
    [params.id],
  );
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>(initialSelected);

  const internOptions = useMemo(
    () =>
      internProfiles
        .filter((ip) => ip.mentorId === user?.id || ip.programId === params.id)
        .map((ip) => {
          const u = getUser(ip.userId);
          return { id: ip.id, name: u ? fullName(u) : ip.userId };
        }),
    [params.id, user?.id],
  );

  if (!program) return <p>Program not found.</p>;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(
      `Mock save complete with ${selectedInternIds.length} assigned intern(s). Status updates are manual and local only.`,
    );
    setTimeout(() => router.push(`/mentor/programs/${params.id}`), 1000);
  }

  return (
    <div>
      <PageHeader
        title="Edit program"
        description="Update every program field you entered at creation. Mentor assignment remains automatic."
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
            <label className="label" htmlFor="role">Role</label>
            <input id="role" className="input" defaultValue={program.role} required />
          </div>
          <div>
            <label className="label" htmlFor="department">Department</label>
            <input id="department" className="input" defaultValue={program.department} required />
          </div>
          <div>
            <label className="label" htmlFor="startDate">Start date</label>
            <input id="startDate" type="date" className="input" defaultValue={program.startDate} required />
          </div>
          <div>
            <label className="label" htmlFor="endDate">End date</label>
            <input id="endDate" type="date" className="input" defaultValue={program.endDate} required />
          </div>
          <div>
            <label className="label" htmlFor="durationWeeks">Duration in weeks</label>
            <input id="durationWeeks" type="number" min={1} className="input" defaultValue={program.durationWeeks} required />
          </div>
          <div>
            <label className="label" htmlFor="weeklyHours">Weekly hours</label>
            <input id="weeklyHours" type="number" min={1} className="input" defaultValue={program.weeklyHours} required />
          </div>
          <div>
            <label className="label" htmlFor="maxInterns">Maximum number of interns</label>
            <input id="maxInterns" type="number" min={1} className="input" defaultValue={program.maxInterns} required />
          </div>
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
        </div>
        <div>
          <label className="label" htmlFor="skillsToDevelop">Skills to develop</label>
          <input id="skillsToDevelop" className="input" defaultValue={program.skillsToDevelop.join(", ")} />
        </div>
        <div>
          <label className="label" htmlFor="skillsNeeded">Skills needed</label>
          <input id="skillsNeeded" className="input" defaultValue={program.skillsNeeded.join(", ")} />
        </div>
        <div>
          <label className="label" htmlFor="goals">Goals</label>
          <textarea id="goals" className="input" rows={2} defaultValue={program.goals} />
        </div>
        <div>
          <label className="label" htmlFor="expectedOutcome">Expected outcome</label>
          <textarea id="expectedOutcome" className="input" rows={2} defaultValue={program.expectedOutcome} />
        </div>
        <div>
          <label className="label" htmlFor="finalProject">Final project</label>
          <input id="finalProject" className="input" defaultValue={program.finalProject ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="additionalInstructions">Additional instructions</label>
          <textarea
            id="additionalInstructions"
            className="input"
            rows={2}
            defaultValue={program.additionalInstructions ?? ""}
          />
        </div>

        <div className="border-t border-line pt-4">
          <InternChipPicker
            options={internOptions}
            selectedIds={selectedInternIds}
            onChange={setSelectedInternIds}
            label="Assigned interns"
          />
        </div>

        <p className="text-sm text-ink-muted">
          Reference materials are managed on the dedicated materials page for this program.
        </p>
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
