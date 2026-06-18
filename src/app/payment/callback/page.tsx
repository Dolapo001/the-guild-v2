"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { walletService } from "@/services/wallet.service";
import { toast } from "sonner";

/**
 * Paystack returns the user here after the hosted checkout completes.
 * Paystack passes `?reference=...` (and on some integrations
 * `?trxref=...`). We forward that to `POST /wallet/verify/` so the
 * backend can mark the transaction SUCCESS, lock booking escrow,
 * confirm orders, and credit wallet balances.
 *
 * Without this route Paystack's redirect 404'd; users were left in
 * limbo and never had their balances updated.
 */
import { Suspense } from "react";

function PaymentCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");

  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("Confirming your payment with Paystack…");

  useEffect(() => {
    if (!reference) {
      setState("error");
      setMessage("Missing payment reference. If you were charged, contact support with your receipt.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await walletService.verifyPayment(reference);
        if (cancelled) return;
        setState("success");
        setMessage(res?.message || "Payment verified. Your wallet and bookings are up to date.");
        toast.success("Payment confirmed.");
      } catch (err: any) {
        if (cancelled) return;
        setState("error");
        const detail = err?.data?.message || err?.data?.detail || err?.message || "Verification failed.";
        setMessage(detail);
        toast.error("Payment verification failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-glass-border p-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {state === "verifying" && "Verifying payment"}
          {state === "success" && "Payment confirmed"}
          {state === "error" && "We couldn't verify the payment"}
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>

        {state !== "verifying" && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/wallet")}
              className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90"
            >
              View wallet
            </button>
            <button
              onClick={() => router.push("/bookings")}
              className="px-4 py-2 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/5"
            >
              View bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallbackContent />
    </Suspense>
  );
}
