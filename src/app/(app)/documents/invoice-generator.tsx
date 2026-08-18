"use client";

import { useState, useTransition, useRef } from "react";
import { FileSpreadsheet, Printer, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField } from "@/components/ui";
import type { ProjectWithClient } from "@/lib/records-data";
import { recordGeneratedDocument } from "./actions";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InvoiceGeneratorModal({
  projects,
}: {
  projects: ProjectWithClient[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [docType, setDocType] = useState<"invoice" | "sow">("invoice");
  const [docNumber, setDocNumber] = useState(
    () => `ARYXLY-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: selectedProject ? `${selectedProject.title} — Advance Milestone` : "Website Design & Development",
      quantity: 1,
      rate: Number(selectedProject?.advance_amount || selectedProject?.total_value || 50000),
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "Milestone / Deliverable",
        quantity: 1,
        rate: 25000,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToCRM = () => {
    if (!selectedProjectId) return;
    startTransition(async () => {
      try {
        const title = `${docType === "invoice" ? "Invoice" : "SOW"} — ${docNumber} (${selectedProject?.client_name || "Client"})`;
        await recordGeneratedDocument(selectedProjectId, docType, title);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          setOpen(false);
        }, 1200);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to save invoice record.");
      }
    });
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.client_name} — ${p.title}`,
  }));

  return (
    <>
      <Button
        variant="primary"
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
        disabled={projects.length === 0}
      >
        <FileSpreadsheet size={14} strokeWidth={2} />
        Generate Invoice / SOW
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={docType === "invoice" ? "Generate Branded Invoice" : "Generate Scope of Work (SOW)"}
        description="Create print-ready PDF invoices and agreements for your clients in Indian Rupees (₹)."
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Document Type"
              name="doc_type"
              options={[
                { value: "invoice", label: "Client Invoice" },
                { value: "sow", label: "Scope of Work (SOW)" },
              ]}
              value={docType}
              onChange={(e) => setDocType(e.target.value as "invoice" | "sow")}
            />
            <SelectField
              label="Select Project"
              name="project_id"
              options={projectOptions}
              value={selectedProjectId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedProjectId(id);
                const proj = projects.find((p) => p.id === id);
                if (proj) {
                  setLineItems([
                    {
                      id: "1",
                      description: `${proj.title} — Milestone Deliverable`,
                      quantity: 1,
                      rate: Number(proj.advance_amount || proj.total_value || 50000),
                    },
                  ]);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Invoice Number"
              name="doc_number"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
            />
            <Field
              label="Issue Date"
              name="issue_date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <Field
              label="Due Date"
              name="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Line Items Table */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-ink text-[12.5px] font-medium">Line Items</label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-accent hover:underline flex items-center gap-1 text-[11.5px] font-medium"
              >
                <Plus size={12} strokeWidth={2} /> Add Item
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    placeholder="Description"
                    className="border-line bg-surface text-ink focus:border-accent flex-1 rounded-lg border px-3 py-1.5 text-[12.5px] outline-none"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
                    placeholder="Qty"
                    className="border-line bg-surface text-ink focus:border-accent w-16 rounded-lg border px-2 py-1.5 text-center text-[12.5px] outline-none tabular"
                  />
                  <div className="relative w-28">
                    <span className="text-ink-subtle absolute top-1.5 left-2.5 text-[12px]">₹</span>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))}
                      placeholder="Rate"
                      className="border-line bg-surface text-ink focus:border-accent w-full rounded-lg border py-1.5 pr-2 pl-6 text-right text-[12.5px] outline-none tabular"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="text-ink-subtle hover:text-danger p-1"
                    disabled={lineItems.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-line mt-3 flex justify-between border-t pt-2 text-[13px] font-bold">
              <span>Total Amount</span>
              <span className="text-accent tabular">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Printable Invoice Preview Frame */}
          <div className="border-line bg-surface-muted max-h-48 overflow-y-auto rounded-[12px] border p-4 text-[11.5px]">
            <div ref={printRef} className="bg-surface border-line rounded-lg border p-4 text-ink">
              <div className="flex justify-between border-b border-line pb-3">
                <div>
                  <h3 className="font-bold text-[14px] text-ink">Aryxly Crafts</h3>
                  <p className="text-ink-muted">Web Design &amp; Digital Solutions</p>
                  <p className="text-ink-subtle">India</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-[14px] text-accent uppercase">{docType}</h4>
                  <p className="text-ink font-mono font-medium">{docNumber}</p>
                  <p className="text-ink-muted">Date: {issueDate}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-ink-subtle uppercase text-[10px] font-bold tracking-wider">Bill To:</p>
                <p className="font-semibold text-ink">{selectedProject?.client_name || "Client Name"}</p>
                <p className="text-ink-muted">{selectedProject?.title}</p>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 rounded-lg bg-positive-soft p-2.5 text-[12.5px] font-medium text-positive">
              <CheckCircle2 size={16} />
              Invoice registered in CRM Documents Library!
            </div>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5"
            >
              <Printer size={14} strokeWidth={1.75} />
              Print / Save PDF
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSaveToCRM}
              disabled={pending || savedSuccess}
            >
              {pending && <Loader2 size={13} className="animate-spin" />}
              Save to Documents
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
