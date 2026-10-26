"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PACKS, type PackId } from "@/lib/constants";
import { formatRupees } from "@/lib/session-rules";
import { cn } from "@/lib/utils";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: () => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<RazorpayCtor> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Checkout failed to load")));
    script.onerror = () => reject(new Error("Checkout failed to load"));
    document.body.appendChild(script);
  });
}

export function TopUp() {
  const router = useRouter();
  const [busy, setBusy] = useState<PackId | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function buy(packId: PackId) {
    setBusy(packId);
    setMessage(null);
    try {
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const order = (await res.json()) as Record<string, unknown> & { error?: string };
      if (!res.ok) {
        setMessage({ tone: "error", text: order.error ?? "Couldn't start the payment." });
        setBusy(null);
        return;
      }

      const Razorpay = await loadCheckout();
      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#e2405f" },
        modal: { ondismiss: () => setBusy(null) },
        handler: async (response: RazorpayResponse) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const data = (await verify.json().catch(() => ({}))) as { ok?: boolean; minutes?: number; error?: string };
          setBusy(null);
          if (data.ok) {
            setMessage({ tone: "ok", text: `Payment received — ${data.minutes} minutes added to your balance.` });
            router.refresh();
          } else {
            setMessage({
              tone: "error",
              text: data.error ?? "We couldn't confirm the payment. If money was deducted, it will be credited automatically.",
            });
          }
        },
      });
      rzp.on("payment.failed", () => {
        setBusy(null);
        setMessage({ tone: "error", text: "The payment didn't go through. No money was taken." });
      });
      rzp.open();
    } catch {
      setBusy(null);
      setMessage({ tone: "error", text: "Couldn't load the payment window. Check your connection and try again." });
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {PACKS.map((pack) => {
          const featured = "featured" in pack && pack.featured;
          return (
            <div key={pack.id} className={cn("flex flex-col rounded-3xl border p-5", featured ? "border-rose bg-rose-soft" : "border-line bg-bg")}>
              <p className="text-sm font-medium text-muted">{pack.name}</p>
              <p className="mt-1 font-serif text-4xl">{formatRupees(pack.pricePaise)}</p>
              <p className="text-sm text-muted">{pack.minutes} minutes</p>
              <Button
                variant={featured ? "rose" : "primary"}
                className="mt-4 w-full"
                disabled={busy !== null}
                onClick={() => buy(pack.id)}
              >
                {busy === pack.id ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                Buy {pack.minutes} min
              </Button>
            </div>
          );
        })}
      </div>
      {message ? (
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm",
            message.tone === "ok" ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-danger-soft text-danger",
          )}
        >
          {message.tone === "ok" ? <Check className="size-4" aria-hidden /> : null}
          {message.text}
        </p>
      ) : null}
      <p className="text-xs text-muted">Secure payments by Razorpay — UPI, cards, netbanking and wallets. Prices include GST where applicable.</p>
    </div>
  );
}
