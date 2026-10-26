import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { APP_NAME, PACKS } from "@/lib/constants";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { isSameOrigin } from "@/lib/request";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to buy minutes." }, { status: 401 });
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Payments aren't switched on yet. Your free first chat still works." }, { status: 503 });
  }
  if (!rateLimit(`order:${user.id}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as { packId?: unknown } | null;
  const pack = PACKS.find((p) => p.id === payload?.packId);
  if (!pack) return NextResponse.json({ error: "Unknown pack." }, { status: 400 });

  const order = await createOrder(pack.pricePaise, `hs_${user.id.slice(-8)}_${Date.now()}`);
  await db.payment.create({
    data: {
      userId: user.id,
      packId: pack.id,
      amountPaise: pack.pricePaise,
      minutes: pack.minutes,
      razorpayOrderId: order.id,
    },
  });

  return NextResponse.json({
    keyId: razorpayKeyId(),
    orderId: order.id,
    amount: pack.pricePaise,
    currency: "INR",
    name: APP_NAME,
    description: `${pack.name} — ${pack.minutes} minutes`,
    prefill: { email: user.email },
  });
}
