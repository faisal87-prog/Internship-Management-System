"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getUser, internProfiles, programs } from "@/mock/data";

export default function GenerateFinalSummaryPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const myProgramIds = programs.filter((p) => p.mentorId === user?.id).map((p) => p.id);
  const myInterns = internProfiles.filter((ip) => myProgramIds.includes(ip.programId));
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(
      "Mock final summary generation staged. AI never makes hiring decisions. No OpenAI call was made.",
    );
    setTimeout(() => router.push("/mentor/final-summaries"), 1200);
  }

  return (
    <div>
      <PageHeader
        title="Generate final summary"
        description="Use after internship completion. Output is stored as Draft until mentor approval."
        actions={<Link href="/mentor/final-summaries" className="btn-secondary">Cancel</Link>}
      />
      <form onSubmit={onSubmit} className="card mx-auto max-w-xl space-y-4 p-6">
        <div>
          <label className="label" htmlFor="intern">Intern</label>
          <select id="intern" className="input" required>
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
          <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">{message}</p>
        ) : null}
        <button type="submit" className="btn-primary">Generate draft summary</button>
      </form>
    </div>
  );
}
