"use client";

import { useState, useTransition } from "react";
import { Pencil, UserPlus } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Lead } from "@/lib/leads";
import { deleteLead, convertLeadToClient } from "./actions";
import { LeadForm } from "./lead-form";

// Row actions for a lead: edit, convert to client, delete.
export function LeadActions({ lead }: { lead: Lead }) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <>
      <RowMenu
        label={`Actions for ${lead.business_name}`}
        onDelete={() => deleteLead(lead.id)}
        deleteLabel="Delete lead"
        items={[
          {
            label: "Edit lead",
            icon: <Pencil size={13} strokeWidth={1.75} />,
            onSelect: () => setEditing(true),
          },
          {
            label: "Convert to client",
            icon: <UserPlus size={13} strokeWidth={1.75} />,
            onSelect: () =>
              startTransition(() => convertLeadToClient(lead.id)),
          },
        ]}
      />

      <LeadForm lead={lead} open={editing} onOpenChange={setEditing} />
    </>
  );
}
