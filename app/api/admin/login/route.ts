import {
  ADMIN_COOKIE,
  adminTokenConfigured,
  clearLoginFailures,
  clientKey,
  createSessionToken,
  loginBlocked,
  recordLoginFailure,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminTokenConfigured()) {
    return Response.json({ error: "服务端未配置 ADMIN_TOKEN 环境变量" }, { status: 503 });
  }

  const key = clientKey(request);
  if (loginBlocked(key)) {
    return Response.json({ error: "失败次数过多，请 10 分钟后再试" }, { status: 429 });
  }

  let password: unknown;
  try {
    ({ password } = (await request.json()) as { password?: unknown });
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    recordLoginFailure(key);
    return Response.json({ error: "密码错误" }, { status: 401 });
  }

  clearLoginFailures(key);
  const cookie = [`${ADMIN_COOKIE}=${createSessionToken()}`, ...sessionCookieOptions().slice(1)].join("; ");

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
