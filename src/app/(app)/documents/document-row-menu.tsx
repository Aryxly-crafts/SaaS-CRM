"use client";

import { useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { DocumentRecord } from "@/lib/records";
import { deleteDocument, getDocumentUrl } from "./actions";

// Overflow menu for a document row: open a signed link, or delete.
export function DocumentRowMenu({ document }: { document: DocumentRecord }) {
  const [, startTransition] = useTransition();

  // Fetches a signed URL and opens the file in a new tab.
  const open = () =>
    startTransition(async () => {
      const url = await getDocumentUrl(document.file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    });

  return (
    <RowMenu
      label="Document actions"
      onDelete={() => deleteDocument(document.id, document.file_url)}
      deleteLabel="Delete document"
      deletePrompt="Removes the stored file too."
      items={[
        {
          label: "Open file",
          icon: <ExternalLink size={13} strokeWidth={1.75} />,
          onSelect: open,
        },
      ]}
    />
  );
}
