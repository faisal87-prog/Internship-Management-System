"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { users } from "@/mock/data";

export default function CreateUserPage() {
  const router = useRouter();
  const mentors = users.filter((u) => u.role === "MENTOR" && u.isActive);
  const [role, setRole] = useState<"MENTOR" | "INTERN">("INTERN");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(
      "Mock create succeeded. In the real system this would call the Django accounts API.",
    );
    setTimeout(() => router.push("/admin/users"), 1200);
  }

  return (
    <div>
      <PageHeader
        title="Create account"
        description="Admin can create Mentor and Intern accounts and assign interns to mentors."
        actions={
          <Link href="/admin/users" className="btn-secondary">
            Back to users
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-5 p-6">
        <div>
          <label className="label" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as "MENTOR" | "INTERN")}
          >
            <option value="MENTOR">Mentor</option>
            <option value="INTERN">Intern</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="firstName">
              First name
            </label>
            <input id="firstName" name="firstName" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="lastName">
              Last name
            </label>
            <input id="lastName" name="lastName" required className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        {role === "INTERN" ? (
          <div>
            <label className="label" htmlFor="mentorId">
              Assign to mentor
            </label>
            <select id="mentorId" name="mentorId" required className="input">
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {message ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Create account
          </button>
          <Link href="/admin/users" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
