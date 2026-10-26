import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawUrl = process.env.DATABASE_URL;
  let dbOk = false;
  let userCount = 0;
  let errorMsg = null;

  try {
    userCount = await db.user.count();
    dbOk = true;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  const dbEnvKeys = Object.keys(process.env).filter(k =>
    /DATABASE|POSTGRES|DB|NEON|PRISMA|URL/i.test(k)
  );

  return NextResponse.json({
    status: dbOk ? "ok" : "error",
    hasDatabaseUrl: Boolean(rawUrl),
    foundDbKeys: dbEnvKeys,
    urlLength: rawUrl?.length ?? 0,
    dbConnected: dbOk,
    userCount,
    error: errorMsg,
  });
}
