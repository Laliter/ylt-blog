const DEFAULT_REPO = "Laliter/ylt-blog";
const DEFAULT_BRANCH = "main";
const ALLOWED_IMAGE_EXTENSIONS = new Set(["webp", "avif", "svg", "png", "jpg", "jpeg"]);

export type PublishImage = {
  path: string;
  base64: string;
};

export type PublishPayload = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  body: string;
  draft: boolean;
  cover?: string;
  images: PublishImage[];
};

export type PublishResult = {
  slug: string;
  postPath: string;
  commitUrl: string;
};

function githubConfig() {
  const token = process.env.GITHUB_TOKEN ?? "";
  const [owner, repo] = (process.env.GITHUB_REPO || DEFAULT_REPO).split("/");
  return { token, owner, repo, branch: DEFAULT_BRANCH };
}

export function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN);
}

function fileExtension(name: string) {
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

export function isAllowedImage(name: string) {
  return ALLOWED_IMAGE_EXTENSIONS.has(fileExtension(name));
}

export function safeImageName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/\.[^.]+$/, (ext) => ext.toLowerCase())
    .replace(/[^a-z0-9-.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `image.${fileExtension(name) || "webp"}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function buildFrontmatter(payload: PublishPayload) {
  const date = today();

  const lines = [
    "---",
    `title: ${payload.title}`,
    `date: ${date}`,
    `lastmod: ${date}`,
    `summary: ${payload.summary}`,
    "tags:",
    ...payload.tags.map((tag) => `  - ${tag}`),
    "featured: false",
    `draft: ${payload.draft}`,
  ];

  if (payload.cover) lines.push(`cover: ${payload.cover}`);
  lines.push("---", "", payload.body.trim());
  return lines.join("\n");
}

async function putFile(path: string, base64: string, message: string) {
  const { token, owner, repo, branch } = githubConfig();
  if (!token || !owner || !repo) {
    throw new Error("服务端未配置 GITHUB_TOKEN / GITHUB_REPO");
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(path)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: base64, branch }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(`文件已存在：${path}（换一个 slug 或文件名）`);
    }
    if (response.status === 401) {
      throw new Error("GitHub Token 无效或已过期");
    }
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub API ${response.status}：${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as { commit?: { html_url?: string } };
  return data.commit?.html_url ?? `https://github.com/${owner}/${repo}/commits`;
}

export async function publishToGitHub(payload: PublishPayload): Promise<PublishResult> {
  const postPath = `content/posts/${payload.slug}.mdx`;
  const message = payload.draft ? `Add draft post: ${payload.slug}` : `Publish post: ${payload.slug}`;

  for (const image of payload.images) {
    await putFile(image.path, image.base64, `${message} (image)`);
  }

  const commitUrl = await putFile(postPath, Buffer.from(buildFrontmatter(payload), "utf8").toString("base64"), message);

  return { slug: payload.slug, postPath, commitUrl };
}
