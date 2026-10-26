import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/** Minimal Razorpay Orders API client. Docs: https://razorpay.com/docs/api/orders/ */

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  if (!id) throw new Error("RAZORPAY_KEY_ID is not set.");
  return id;
}

function keySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set.");
  return secret;
}

export async function createOrder(amountPaise: number, receipt: string): Promise<{ id: string }> {
  const auth = Buffer.from(`${razorpayKeyId()}:${keySecret()}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay order failed with status ${res.status}`);
  const data = (await res.json()) as { id?: unknown };
  if (typeof data.id !== "string") throw new Error("Razorpay returned no order id");
  return { id: data.id };
}

/** Checkout signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", keySecret()).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Webhook signature = HMAC_SHA256(raw request body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
