import { ADMIN_COOKIE, clearedSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const cookie = [`${ADMIN_COOKIE}=`, ...clearedSessionCookie().slice(1)].join("; ");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
