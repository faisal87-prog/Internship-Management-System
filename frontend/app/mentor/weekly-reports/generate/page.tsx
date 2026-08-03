"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMockAuth } from "@/context/MockAuthContext";
import { fullName, getUser, internProfiles } from "@/mock/data";

export default function GenerateWeeklyReportPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const myInterns = internProfiles.filter((ip) => ip.mentorId === user?.id);
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(
      "Mock weekly report generation staged (Prompt Builder → LLM → Validation → Draft). No automatic scheduling.",
    );
    setTimeout(() => router.push("/mentor/weekly-reports"), 1200);
  }

  return (
    <div>
      <PageHeader
        title="Generate weekly report"
        description="Trigger after reviewing submissions, assigning scores, and providing feedback."
        actions={<Link href="/mentor/weekly-reports" className="btn-secondary">Cancel</Link>}
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
        <div>
          <label className="label" htmlFor="week">Week number</label>
          <input id="week" type="number" min={1} className="input" defaultValue={2} required />
        </div>
        {message ? (
          <p className="rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-dark">{message}</p>
        ) : null}
        <button type="submit" className="btn-primary">Generate draft report</button>
      </form>
    </div>
  );
}
