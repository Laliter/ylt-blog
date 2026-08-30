import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ylt-admin-session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export function adminTokenConfigured() {
  return Boolean(process.env.ADMIN_TOKEN);
}

function adminToken() {
  return process.env.ADMIN_TOKEN ?? "";
}

export function verifyAdminPassword(password: unknown) {
  if (typeof password !== "string" || !adminTokenConfigured()) return false;
  const expected = Buffer.from(adminToken());
  const provided = Buffer.from(password);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

function sign(value: string) {
  return createHmac("sha256", adminToken()).update(value).digest("hex");
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expires}.${sign(String(expires))}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminTokenConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) <= Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export function readAdminCookie(request: Request) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_COOKIE) return rest.join("=");
  }
  return undefined;
}

export function isAdminRequest(request: Request) {
  return verifySessionToken(readAdminCookie(request));
}

export function sessionCookieOptions() {
  return [
    `${ADMIN_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ];
}

export function clearedSessionCookie() {
  return [`${ADMIN_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
}

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

export function loginBlocked(key: string) {
  const entry = loginFailures.get(key);
  if (!entry) return false;
  if (Date.now() >= entry.resetAt) {
    loginFailures.delete(key);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILURES;
}

export function recordLoginFailure(key: string) {
  const entry = loginFailures.get(key);
  if (!entry || Date.now() >= entry.resetAt) {
    loginFailures.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(key: string) {
  loginFailures.delete(key);
}
