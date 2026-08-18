"use client";

import { useState, useTransition, useEffect } from "react";
import { Coins, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField } from "@/components/ui";
import type { ProjectWithClient } from "@/lib/records-data";
import { getProjectFinancials, distributeProjectPayout } from "./payout-actions";

export function FounderPayoutModal({
  projects,
}: {
  projects: ProjectWithClient[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [financials, setFinancials] = useState<any>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  const [akshithShare, setAkshithShare] = useState<number>(0);
  const [yashashwiniShare, setYashashwiniShare] = useState<number>(0);
  const [splitRatio, setSplitRatio] = useState<"50_50" | "custom">("50_50");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  // Load project financials when project changes
  useEffect(() => {
    if (!selectedProjectId || !open) return;
    setLoadingFinancials(true);
    setError(null);
    getProjectFinancials(selectedProjectId)
      .then((data) => {
        setFinancials(data);
        const margin = data.remainingDistributable || data.netMargin || 0;
        const half = Math.floor(margin / 2);
        setAkshithShare(half);
        setYashashwiniShare(margin - half);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingFinancials(false));
  }, [selectedProjectId, open]);

  const handleRatioChange = (ratio: "50_50" | "custom") => {
    setSplitRatio(ratio);
    if (ratio === "50_50" && financials) {
      const margin = financials.remainingDistributable || 0;
      const half = Math.floor(margin / 2);
      setAkshithShare(half);
      setYashashwiniShare(margin - half);
    }
  };

  const handleAkshithChange = (val: number) => {
    setAkshithShare(val);
    if (splitRatio === "50_50" && financials) {
      const margin = financials.remainingDistributable || 0;
      setYashashwiniShare(Math.max(margin - val, 0));
    }
  };

  const handleSubmit = () => {
    setError(null);
    if (akshithShare + yashashwiniShare <= 0) {
      setError("Please specify a payout amount greater than zero.");
      return;
    }

    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const formData = new FormData();
    formData.append("project_id", selectedProjectId);
    formData.append("project_title", currentProject?.title || "Project");
    formData.append("akshith_amount", String(akshithShare));
    formData.append("yashashwini_amount", String(yashashwiniShare));
    formData.append("notes", notes);

    startTransition(async () => {
      try {
        await distributeProjectPayout(formData);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Failed to distribute payout");
      }
    });
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.client_name} — ${p.title}`,
  }));

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <>
      <Button
        variant="primary"
        type="button"
        onClick={() => setOpen(true)}
        className="bg-positive hover:bg-[#059669] flex items-center gap-1.5 text-white"
        disabled={projects.length === 0}
      >
        <Coins size={14} strokeWidth={2} />
        Founder Payout Transfer
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="1-Click Founder Payout Transfer"
        description="Calculate net project profit and distribute shares directly to founder personal ledgers."
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Select Project"
            name="project_id"
            options={projectOptions}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          {/* Financial Breakdown Card */}
          <div className="bg-surface-muted border-line rounded-[12px] border p-3.5 text-[12.5px]">
            {loadingFinancials ? (
              <div className="flex items-center justify-center py-4 text-ink-subtle">
                <Loader2 size={16} className="mr-2 animate-spin text-accent" /> Calculating project margin…
              </div>
            ) : financials ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Revenue Collected</span>
                  <span className="tabular font-semibold text-positive">
                    ₹{financials.totalPayments.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Direct Project Costs</span>
                  <span className="tabular font-semibold text-danger">
                    −₹{financials.directExpenses.toLocaleString("en-IN")}
                  </span>
                </div>
                {financials.previousPayouts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Previous Payouts</span>
                    <span className="tabular font-semibold text-ink-subtle">
                      −₹{financials.previousPayouts.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="border-line mt-1 flex justify-between border-t pt-2 text-[13px] font-bold">
                  <span className="text-ink">Net Distributable Margin</span>
                  <span className="tabular text-accent">
                    ₹{financials.remainingDistributable.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Founder Split Controls */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-ink text-[12.5px] font-medium">Founder Split</label>
              <div className="flex rounded-md border border-line bg-surface p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleRatioChange("50_50")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    splitRatio === "50_50" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  50 / 50 Equal
                </button>
                <button
                  type="button"
                  onClick={() => handleRatioChange("custom")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    splitRatio === "custom" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-ink-subtle mb-1 block text-[11.5px] font-medium">
                  Akshith&apos;s Share (₹)
                </label>
                <input
                  type="number"
                  value={akshithShare}
                  onChange={(e) => handleAkshithChange(Number(e.target.value))}
                  className="border-line bg-surface text-ink focus:border-accent w-full rounded-lg border px-3 py-2 text-body-md transition-colors focus:outline-none tabular"
                />
              </div>

              <div>
                <label className="text-ink-subtle mb-1 block text-[11.5px] font-medium">
                  Yashashwini&apos;s Share (₹)
                </label>
                <input
                  type="number"
                  value={yashashwiniShare}
                  onChange={(e) => setYashashwiniShare(Number(e.target.value))}
                  className="border-line bg-surface text-ink focus:border-accent w-full rounded-lg border px-3 py-2 text-body-md transition-colors focus:outline-none tabular"
                />
              </div>
            </div>
          </div>

          <Field
            label="Payout Note (Optional)"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Milestone 1 completed & approved by client"
          />

          {error && (
            <p role="alert" className="text-[12px] font-medium text-danger">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-1.5 rounded-lg bg-positive-soft p-2.5 text-[12.5px] font-medium text-positive">
              <CheckCircle2 size={16} />
              Payout distributed & transferred to Personal Inflow ledgers!
            </div>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleSubmit}
              disabled={pending || loadingFinancials || success}
              className="bg-positive hover:bg-[#059669] text-white"
            >
              {pending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} strokeWidth={2} />
              )}
              Confirm & Transfer Payout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
