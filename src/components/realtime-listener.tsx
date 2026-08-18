"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Radio, CheckCircle, Wallet, FolderKanban, Receipt, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LiveToast {
  id: string;
  type: "lead" | "payment" | "project" | "expense" | "client";
  title: string;
  subtitle: string;
}

export function RealtimeListener() {
  const router = useRouter();
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [connected, setConnected] = useState(false);

  const addToast = (toast: Omit<LiveToast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const supabase = createClient();

    // Global Realtime WebSocket channel listening to all database tables
    const channel = supabase
      .channel("crm-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const lead = payload.new as any;
            addToast({
              type: "lead",
              title: "New Lead Ingested",
              subtitle: `${lead.business_name || "Unknown business"} ${
                lead.category ? `(${lead.category})` : ""
              }`,
            });
          }
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const payment = payload.new as any;
            addToast({
              type: "payment",
              title: "Payment Received",
              subtitle: `Amount: ₹${Number(payment.amount || 0).toLocaleString("en-IN")}`,
            });
          }
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const expense = payload.new as any;
            addToast({
              type: "expense",
              title: "Expense Logged",
              subtitle: `${expense.title} — ₹${Number(expense.amount || 0).toLocaleString("en-IN")}`,
            });
          }
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const project = payload.new as any;
            addToast({
              type: "project",
              title: payload.eventType === "INSERT" ? "New Project" : "Project Updated",
              subtitle: project.title || "Project details updated",
            });
          }
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <>
      {/* Floating Live Activity Notifications */}
      <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon =
              toast.type === "lead"
                ? Sparkles
                : toast.type === "payment"
                ? Wallet
                : toast.type === "expense"
                ? Receipt
                : FolderKanban;

            const iconColor =
              toast.type === "lead"
                ? "text-accent bg-accent-soft"
                : toast.type === "payment"
                ? "text-positive bg-positive-soft"
                : toast.type === "expense"
                ? "text-warning bg-warning-soft"
                : "text-info bg-info-soft";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-auto border-line bg-surface/95 text-ink flex w-80 items-start gap-3 rounded-[12px] border p-3 shadow-lg backdrop-blur-md"
              >
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink text-[12.5px] font-semibold tracking-tight">
                    {toast.title}
                  </p>
                  <p className="text-ink-muted truncate text-[11.5px]">
                    {toast.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-ink-subtle hover:text-ink -mr-1 -mt-1 p-1"
                >
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
