/**
 * Client-side Razorpay Checkout helpers — shared by the subscribe and donation
 * flows. The Checkout script is injected lazily on first use.
 */
export interface RazorpayCheckout {
  open: () => void;
  on: (event: string, handler: (resp: unknown) => void) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

/** Dims the page behind the modal instead of a solid white overlay. */
export const RAZORPAY_BACKDROP = "rgba(2, 6, 23, 0.7)";
export const RAZORPAY_THEME_COLOR = "#0d9488";

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
