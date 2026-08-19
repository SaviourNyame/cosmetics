"use client";

import { useEffect, useState } from "react";
import type { ProductRequestStatus } from "@/types/firestore";

const CIRCUMFERENCE = 2 * Math.PI * 45;

type Ping = { id: number; top: number; left: number };

interface StatusView {
  label: string;
  title: string;
  copy: string;
  progress: number;
  icon: string;
  tone: "waiting" | "success" | "stalled";
}

function resolveStatusView(status: ProductRequestStatus, eligibleSupplierCount: number): StatusView {
  if (status === "accepted" || status === "converted_to_order") {
    return {
      label: "SUPPLIER CONFIRMED",
      title: "A Supplier Has Accepted!",
      copy: "Your order is being prepared. We'll update you as it moves toward delivery.",
      progress: 100,
      icon: "check_circle",
      tone: "success",
    };
  }
  if (status === "rejected_by_all" || status === "expired" || status === "cancelled") {
    return {
      label: "NO MATCH FOUND",
      title: "No Supplier Was Available",
      copy: "None of our current suppliers could fulfil this order in time. You can try again or browse similar products.",
      progress: 100,
      icon: "error_outline",
      tone: "stalled",
    };
  }
  if (eligibleSupplierCount === 0) {
    return {
      label: "AWAITING SUPPLIERS",
      title: "Onboarding a Supplier for This Product",
      copy: "We don't yet have a verified supplier carrying this exact product. Your order is saved — we'll notify you the moment one comes online.",
      progress: 40,
      icon: "hourglass_top",
      tone: "waiting",
    };
  }
  if (status === "sent_to_suppliers" || status === "awaiting_response") {
    return {
      label: "SUPPLIERS NOTIFIED",
      title: `Waiting on ${eligibleSupplierCount} Supplier${eligibleSupplierCount === 1 ? "" : "s"}`,
      copy: "The fastest supplier to confirm availability wins your order. This is usually quick.",
      progress: 70,
      icon: "sync",
      tone: "waiting",
    };
  }
  return {
    label: "ORDER RECEIVED",
    title: "Validating Your Order",
    copy: "One moment while we prepare to notify eligible suppliers.",
    progress: 20,
    icon: "sync",
    tone: "waiting",
  };
}

export default function RequestProgress({
  status,
  eligibleSupplierCount,
}: {
  status: ProductRequestStatus;
  eligibleSupplierCount: number;
}) {
  const [pings, setPings] = useState<Ping[]>([]);
  const view = resolveStatusView(status, eligibleSupplierCount);

  useEffect(() => {
    if (view.tone !== "waiting") return;
    const spawn = setInterval(() => {
      const id = Date.now() + Math.random();
      setPings((prev) => [...prev, { id, top: Math.random() * 100, left: Math.random() * 100 }]);
      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== id));
      }, 2000);
    }, 800);
    return () => clearInterval(spawn);
  }, [view.tone]);

  const offset = CIRCUMFERENCE - (view.progress / 100) * CIRCUMFERENCE;

  return (
    <>
      <div className="absolute inset-0 z-0 pointer-events-none">
        {pings.map((ping) => (
          <div key={ping.id} className="ping-dot" style={{ top: `${ping.top}%`, left: `${ping.left}%` }} />
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute w-[450px] h-[450px] bg-primary/5 rounded-full pulse-layer" />
        <div
          className="absolute w-[600px] h-[600px] bg-primary/[0.02] rounded-full pulse-layer"
          style={{ animationDelay: "2s" }}
        />
        <div className="glass-panel w-80 h-80 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100">
            <circle className="stroke-surface-container-highest" cx="50" cy="50" fill="transparent" r="45" strokeWidth="2" />
            <circle
              className="progress-ring__circle stroke-primary"
              cx="50"
              cy="50"
              fill="transparent"
              r="45"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <div className="text-center z-10 px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary mb-2">{view.label}</p>
            <h1 className="font-display text-[28px] leading-tight mb-4">{view.title}</h1>
            <div className="flex justify-center">
              <span
                className={`material-symbols-outlined text-secondary text-4xl ${
                  view.tone === "waiting" ? "animate-pulse" : ""
                }`}
              >
                {view.icon}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-12 max-w-lg text-center text-on-surface-variant px-4">{view.copy}</p>
    </>
  );
}
