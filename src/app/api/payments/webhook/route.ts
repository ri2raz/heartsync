import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay webhook (subscribe to "payment.captured").
 * Backs up /api/payments/verify for people who close the tab right after paying.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) return NextResponse.json({ error: "Bad signature." }, { status: 400 });

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }
  if (event.event !== "payment.captured") return NextResponse.json({ ignored: true });

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id || !entity.id) return NextResponse.json({ error: "Missing payment." }, { status: 400 });

  const payment = await db.payment.findUnique({ where: { razorpayOrderId: entity.order_id } });
  if (!payment) return NextResponse.json({ ignored: true });
  if (entity.amount !== payment.amountPaise) return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });

  await db.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: payment.id, status: "CREATED" },
      data: { status: "PAID", razorpayPaymentId: entity.id, paidAt: new Date() },
    });
    if (count === 1) {
      await tx.user.update({ where: { id: payment.userId }, data: { minutesBalance: { increment: payment.minutes } } });
    }
  });
  return NextResponse.json({ ok: true });
}
