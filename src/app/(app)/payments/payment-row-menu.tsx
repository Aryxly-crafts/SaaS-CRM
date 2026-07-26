"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Payment } from "@/lib/records";
import type { ProjectWithClient } from "@/lib/records-data";
import { PaymentForm } from "./payment-form";
import { deletePayment } from "./actions";

// Row actions for a payment: edit or delete.
export function PaymentRowMenu({
  payment,
  projects,
}: {
  payment: Payment;
  projects: ProjectWithClient[];
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <RowMenu
        label="Payment actions"
        onDelete={() => deletePayment(payment.id)}
        deleteLabel="Delete payment"
        items={[
          {
            label: "Edit payment",
            icon: <Pencil size={13} strokeWidth={1.75} />,
            onSelect: () => setEditing(true),
          },
        ]}
      />

      <PaymentForm
        projects={projects}
        payment={payment}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}
