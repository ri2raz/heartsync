import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { razorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";
import { isSameOrigin } from "@/lib/request";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!razorpayConfigured()) return NextResponse.json({ error: "Payments are off." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment || payment.userId !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // Credit exactly once, even if the browser calls verify twice.
  const credited = await db.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: "CREATED" },
      data: { status: "PAID", razorpayPaymentId: paymentId, paidAt: new Date() },
    });
    if (count === 0) return false;
    await tx.user.update({ where: { id: user.id }, data: { minutesBalance: { increment: payment.minutes } } });
    return true;
  });

  return NextResponse.json({ ok: true, credited, minutes: payment.minutes });
}
