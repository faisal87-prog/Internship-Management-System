"use client";

import { FormEvent, useState } from "react";
import { ResourceList } from "@/components/resources/ResourceList";
import { inferResourceKind, MOCK_PDF_HREF } from "@/lib/resources";
import type { LearningResource } from "@/types";

export function ResourceManager({
  resources,
  onChange,
  title = "Task resources",
}: {
  resources: LearningResource[];
  onChange: (next: LearningResource[]) => void;
  title?: string;
}) {
  const [message, setMessage] = useState("");

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const resourceTitle = String(form.get("title") || "").trim();
    const externalLink = String(form.get("externalLink") || "").trim();
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && Boolean(f.name));

    if (!resourceTitle && files.length === 0 && !externalLink) {
      setMessage("Add a title with a file and/or an external link.");
      return;
    }

    const next: LearningResource[] = [...resources];

    if (files.length) {
      files.forEach((file, index) => {
        next.push({
          id: `res-local-${Date.now()}-${index}`,
          title: resourceTitle || file.name,
          fileName: file.name,
          kind: inferResourceKind(file.name),
          href: MOCK_PDF_HREF,
        });
      });
    } else if (externalLink) {
      next.push({
        id: `res-local-${Date.now()}`,
        title: resourceTitle || externalLink,
        kind: "LINK",
        href: externalLink,
      });
    } else {
      next.push({
        id: `res-local-${Date.now()}`,
        title: resourceTitle,
        kind: "OTHER",
        href: MOCK_PDF_HREF,
        fileName: "placeholder.pdf",
      });
    }

    onChange(next);
    setMessage("Mock resources updated (not uploaded to a server).");
    e.currentTarget.reset();
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Upload PDFs, Word, PowerPoint, images, ZIP, or add external links. Max 20 MB per
          file (mock).
        </p>
      </div>

      <ResourceList
        resources={resources}
        emptyLabel="No resources yet. Add files or links below."
        onRemove={(id) => onChange(resources.filter((r) => r.id !== id))}
      />

      <form onSubmit={onAdd} className="grid gap-3 rounded-xl border border-dashed border-line p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="resource-title">
            Resource title
          </label>
          <input id="resource-title" name="title" className="input" placeholder="e.g. UI Guidelines" />
        </div>
        <div>
          <label className="label" htmlFor="resource-files">
            Upload files (multiple)
          </label>
          <input
            id="resource-files"
            name="files"
            type="file"
            multiple
            className="input"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.txt,.csv"
          />
        </div>
        <div>
          <label className="label" htmlFor="resource-link">
            External link
          </label>
          <input
            id="resource-link"
            name="externalLink"
            type="url"
            className="input"
            placeholder="https://"
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-secondary">
            Add resources
          </button>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
