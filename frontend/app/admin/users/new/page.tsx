"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { users } from "@/mock/data";

function CreateUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "MENTOR" ? "MENTOR" : "INTERN";
  const mentors = users.filter((u) => u.role === "MENTOR" && u.isActive);
  const [role, setRole] = useState<"MENTOR" | "INTERN">(initialRole);
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input id="username" name="username" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" required className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="phoneNumber">
            Phone number
          </label>
          <input id="phoneNumber" name="phoneNumber" type="tel" required className="input" />
        </div>

        {role === "MENTOR" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="department">
                Department
              </label>
              <input id="department" name="department" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="jobTitle">
                Job title
              </label>
              <input id="jobTitle" name="jobTitle" required className="input" />
            </div>
          </div>
        ) : (
          <>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="major">
                  Major
                </label>
                <input id="major" name="major" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="university">
                  University
                </label>
                <input id="university" name="university" required className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="skills">
                Skills
              </label>
              <input
                id="skills"
                name="skills"
                className="input"
                placeholder="Comma-separated, e.g. React, TypeScript, CSS"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="learningGoals">
                Learning goals
              </label>
              <textarea id="learningGoals" name="learningGoals" rows={3} className="input" required />
            </div>
          </>
        )}

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

export default function CreateUserPage() {
  return (
    <Suspense fallback={<div className="p-6 text-ink-muted">Loading form…</div>}>
      <CreateUserForm />
    </Suspense>
  );
}
