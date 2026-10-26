import { jwtVerify, SignJWT } from "jose";

/** Edge-safe token helpers, shared by middleware and server code. */

export const SESSION_COOKIE = "hs_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const DEV_SECRET = "heartsync-local-development-secret-do-not-use-in-production";

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[HeartSync] AUTH_SECRET is not set in production. Using fallback development secret.");
    }
    return new TextEncoder().encode(DEV_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
