"use client";

import { MOCK_PDF_HREF } from "@/lib/resources";

export function DownloadPdfButton({
  label = "Download PDF",
  fileName = "document.pdf",
  className = "btn-primary",
}: {
  label?: string;
  fileName?: string;
  className?: string;
}) {
  return (
    <a
      href={MOCK_PDF_HREF}
      download={fileName}
      className={`${className} inline-flex items-center gap-2`}
    >
      <span aria-hidden>📄</span>
      <span>{label}</span>
    </a>
  );
}
