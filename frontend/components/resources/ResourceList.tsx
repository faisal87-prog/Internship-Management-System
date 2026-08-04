"use client";

import {
  isExternalHref,
  resourceIcon,
  resourceKindLabel,
} from "@/lib/resources";
import type { LearningResource } from "@/types";

export function ResourceList({
  resources,
  emptyLabel = "No resources attached.",
  onRemove,
}: {
  resources: LearningResource[];
  emptyLabel?: string;
  /** When provided, shows remove controls (Mentor manage mode). */
  onRemove?: (id: string) => void;
}) {
  if (!resources.length) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2" role="list">
      {resources.map((resource) => {
        const external = isExternalHref(resource.href);
        return (
          <li key={resource.id} className="flex items-stretch gap-2">
            <a
              href={resource.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              download={!external ? resource.fileName || true : undefined}
              className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-3 py-3 text-left transition hover:border-brand/50 hover:bg-brand-soft/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="text-xl" aria-hidden>
                {resourceIcon(resource.kind)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-dark">
                  {resource.title}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {resourceKindLabel(resource.kind)}
                  {resource.fileName ? ` · ${resource.fileName}` : ""}
                  {external ? " · Opens in new tab" : " · Download / open"}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                Open
              </span>
            </a>
            {onRemove ? (
              <button
                type="button"
                className="btn-secondary px-3 text-xs"
                onClick={() => onRemove(resource.id)}
                aria-label={`Remove ${resource.title}`}
              >
                Remove
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
