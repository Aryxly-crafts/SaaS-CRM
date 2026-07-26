import { Wallet } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getPayments, getProjects } from "@/lib/records-data";
import { PAYMENT_TYPE_LABELS, money, shortDate } from "@/lib/records";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { PaymentForm } from "./payment-form";
import { PaymentRowMenu } from "./payment-row-menu";

// Payment ledger with per-row edit and delete.
export default async function PaymentsPage() {
  const [payments, projects] = await Promise.all([getPayments(), getProjects()]);

  const total = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <>
      <SetPageTitle title="Payments" />
      <PageHeader
        title="Payments"
        description={`${money(total)} collected across ${payments.length} payment${payments.length === 1 ? "" : "s"}`}
        action={<PaymentForm projects={projects} />}
      />

      <Card className="overflow-hidden">
        {payments.length === 0 ? (
          <EmptyState
            icon={<Wallet size={17} strokeWidth={1.75} />}
            title={projects.length === 0 ? "No projects yet" : "No payments yet"}
            description={
              projects.length === 0
                ? "Create a project first, then record payments against it."
                : "Record a payment and it will feed the revenue figures on your dashboard."
            }
            action={
              projects.length > 0 ? <PaymentForm projects={projects} /> : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted border-b text-left">
                  {["Paid", "Project", "Type", "Amount"].map((column) => (
                    <th
                      key={column}
                      className="text-ink-subtle px-3 py-2 text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase first:pl-4"
                    >
                      {column}
                    </th>
                  ))}
                  <th className="w-10 pr-3" />
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-line hover:bg-surface-muted border-b text-[12.5px] transition-colors last:border-b-0"
                  >
                    <td className="text-ink-muted tabular py-2.5 pr-3 pl-4 whitespace-nowrap">
                      {shortDate(payment.paid_date)}
                    </td>
                    <td className="text-ink px-3 py-2.5 font-medium">
                      {payment.project_title}
                    </td>
                    <td className="text-ink-muted px-3 py-2.5">
                      {PAYMENT_TYPE_LABELS[payment.type]}
                    </td>
                    <td className="text-ink tabular px-3 py-2.5 font-medium whitespace-nowrap">
                      {money(Number(payment.amount))}
                    </td>
                    <td className="py-2.5 pr-3">
                      <PaymentRowMenu payment={payment} projects={projects} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-line bg-surface-muted border-t text-[12.5px]">
                  <td colSpan={3} className="text-ink-muted py-2.5 pr-3 pl-4">
                    Total collected
                  </td>
                  <td className="text-ink tabular px-3 py-2.5 font-semibold">
                    {money(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
