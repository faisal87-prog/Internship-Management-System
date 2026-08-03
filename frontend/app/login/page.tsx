"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMockAuth } from "@/context/MockAuthContext";
import { dashboardPath } from "@/lib/navigation";
import { roleLabel } from "@/lib/labels";
import { fullName, users } from "@/mock/data";

export default function LoginPage() {
  const { user, isReady, loginAs } = useMockAuth();
  const router = useRouter();
  const demoUsers = users.filter((u) => u.isActive);

  useEffect(() => {
    if (isReady && user) router.replace(dashboardPath(user.role));
  }, [isReady, user, router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffedd5,_#fff7ed_45%,_#ffffff)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            AI Internship Management
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Choose a demo user to explore the workspace
          </h1>
          <p className="mt-4 text-base text-ink-muted">
            Mock authentication only. No JWT, backend, or AI calls are used in this
            frontend phase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {demoUsers.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => {
                loginAs(demo.id);
                router.push(dashboardPath(demo.role));
              }}
              className="card group p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
            >
              <span className="inline-flex rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {roleLabel[demo.role]}
              </span>
              <p className="mt-4 text-lg font-semibold text-ink">{fullName(demo)}</p>
              <p className="mt-1 text-sm text-ink-muted">{demo.email}</p>
              <p className="mt-6 text-sm font-semibold text-brand group-hover:text-brand-dark">
                Enter workspace →
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
