"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "checking" | "login" | "ready";
type PublishResult = { slug: string; postPath: string; commitUrl: string; draft: boolean };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminConsole() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState(true);
  const [cover, setCover] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data: { authenticated: boolean }) => setPhase(data.authenticated ? "ready" : "login"))
      .catch(() => setPhase("login"));
  }, []);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "登录失败");
      }
      setPassword("");
      setPhase("ready");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setPhase("login");
    setResult(null);
  }

  async function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("slug", effectiveSlug);
      form.set("summary", summary);
      form.set("tags", tags);
      form.set("body", body);
      form.set("draft", String(draft));
      if (cover) form.set("cover", cover);
      if (images) for (const image of Array.from(images)) form.append("images", image);

      const response = await fetch("/api/admin/publish", { method: "POST", body: form });
      const data = (await response.json()) as Partial<PublishResult> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "发布失败");

      setResult({ ...data, draft } as PublishResult);
      formRef.current?.reset();
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setSummary("");
      setTags("");
      setBody("");
      setCover(null);
      setImages(null);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "发布失败");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "checking") {
    return <p className="admin-status">正在检查登录状态…</p>;
  }

  if (phase === "login") {
    return (
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h1>管理员登录</h1>
        <p className="admin-hint">输入管理密码进入发布台。</p>
        <label className="admin-field">
          <span>密码</span>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="admin-error" role="alert">{error}</p> : null}
        <button className="admin-submit" type="submit" disabled={busy}>
          {busy ? "验证中…" : "登录"}
        </button>
      </form>
    );
  }

  return (
    <div className="admin-console">
      <header className="admin-console-header">
        <h1>发布文章</h1>
        <button className="admin-ghost" type="button" onClick={handleLogout}>
          退出登录
        </button>
      </header>

      <form ref={formRef} className="admin-form-card" onSubmit={handlePublish}>
        <label className="admin-field">
          <span>标题</span>
          <input
            className="admin-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            required
          />
        </label>

        <div className="admin-field-row">
          <label className="admin-field">
            <span>slug（URL 路径，kebab-case）</span>
            <input
              className="admin-input"
              value={effectiveSlug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="my-first-post"
              required
            />
          </label>
          <label className="admin-field admin-field-wide">
            <span>标签（逗号分隔，1–6 个）</span>
            <input className="admin-input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Java, Spring Boot" required />
          </label>
        </div>

        <label className="admin-field">
          <span>摘要（{summary.length}/180）</span>
          <textarea
            className="admin-textarea admin-textarea-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            maxLength={180}
            required
          />
        </label>

        <label className="admin-field">
          <span>正文（Markdown / MDX，不要写 H1）</span>
          <textarea
            className="admin-textarea admin-textarea-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            spellCheck={false}
            required
          />
        </label>

        <div className="admin-field-row">
          <label className="admin-field">
            <span>封面图（可选，webp / avif / svg / png / jpg）</span>
            <input
              className="admin-file"
              type="file"
              accept=".webp,.avif,.svg,.png,.jpg,.jpeg"
              onChange={(event) => setCover(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="admin-field admin-field-wide">
            <span>其他图片（可选，多选）</span>
            <input
              className="admin-file"
              type="file"
              accept=".webp,.avif,.svg,.png,.jpg,.jpeg"
              multiple
              onChange={(event) => setImages(event.target.files)}
            />
          </label>
        </div>

        <label className="admin-check">
          <input type="checkbox" checked={draft} onChange={(event) => setDraft(event.target.checked)} />
          <span>存为草稿（draft: true，生产环境不公开）</span>
        </label>

        {error ? <p className="admin-error" role="alert">{error}</p> : null}

        <button className="admin-submit" type="submit" disabled={busy}>
          {busy ? "发布中…" : draft ? "保存草稿到仓库" : "发布文章"}
        </button>
      </form>

      {result ? (
        <div className="admin-result" role="status">
          <strong>{result.draft ? "草稿已提交" : "文章已发布"}</strong>
          <p>
            文件 <code>{result.postPath}</code> 已写入仓库。
          </p>
          <p>
            <a href={result.commitUrl} target="_blank" rel="noreferrer">
              查看 commit
            </a>
          </p>
          <p className="admin-hint">
            {result.draft
              ? "草稿仅本地/预览可见，正式发布时把 draft 改为 false 再提交。"
              : "Vercel 自动部署约 1 分钟后生效，线上即可访问。"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
