"use client";

import { Pencil } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Payment } from "@/lib/records";
import type { ProjectWithClient } from "@/lib/records-data";
import { PaymentForm } from "./payment-form";
import { deletePayment } from "./actions";

// Overflow menu for a payment row: edit or delete.
export function PaymentRowMenu({
  payment,
  projects,
}: {
  payment: Payment;
  projects: ProjectWithClient[];
}) {
  return (
    <RowMenu
      label="Payment actions"
      onDelete={() => deletePayment(payment.id)}
      deleteLabel="Delete payment"
      items={[
        {
          label: "Edit payment",
          icon: <Pencil size={13} strokeWidth={1.75} />,
          render: () => (
            <PaymentForm
              projects={projects}
              payment={payment}
              trigger={
                <button
                  type="button"
                  className="text-ink-muted hover:text-ink hover:bg-surface-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                  Edit payment
                </button>
              }
            />
          ),
        },
      ]}
    />
  );
}
