import { isAdminRequest } from "@/lib/admin-auth";
import { githubConfigured, isAllowedImage, publishToGitHub, safeImageName, type PublishImage } from "@/lib/github-publish";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function toPublishImage(file: File, path: string): Promise<PublishImage> {
  return { path, base64: Buffer.from(await file.arrayBuffer()).toString("base64") };
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "请求格式错误，需要 multipart/form-data" }, { status: 400 });
  }

  const title = text(form, "title");
  const slug = text(form, "slug");
  const summary = text(form, "summary");
  const tagsRaw = text(form, "tags");
  const body = text(form, "body");
  const draft = text(form, "draft") === "true";

  if (!title) return Response.json({ error: "标题不能为空" }, { status: 400 });
  if (!SLUG_PATTERN.test(slug)) {
    return Response.json({ error: "slug 必须是 lowercase kebab-case（例如 my-first-post）" }, { status: 400 });
  }
  if (title.length > 80) return Response.json({ error: "标题过长（最多 80 字符）" }, { status: 400 });
  if (!summary) return Response.json({ error: "摘要不能为空" }, { status: 400 });
  if (summary.length > 180) return Response.json({ error: "摘要超过 180 字符" }, { status: 400 });
  if (!body) return Response.json({ error: "正文不能为空" }, { status: 400 });

  const tags = [...new Set(tagsRaw.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))];
  if (tags.length < 1 || tags.length > 6) {
    return Response.json({ error: "标签数量需在 1–6 个之间" }, { status: 400 });
  }

  if (!githubConfigured()) {
    return Response.json({ error: "服务端未配置 GITHUB_TOKEN 环境变量" }, { status: 503 });
  }

  const cover = form.get("cover");
  const extraImages = form.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (cover instanceof File && cover.size > 0 && !isAllowedImage(cover.name)) {
    return Response.json({ error: `封面格式不支持：${cover.name}（允许 webp / avif / svg / png / jpg）` }, { status: 400 });
  }

  const images: PublishImage[] = [];
  let coverPublicPath: string | undefined;

  try {
    if (cover instanceof File && cover.size > 0) {
      if (cover.size > MAX_IMAGE_BYTES) {
        return Response.json({ error: "封面图超过 5MB" }, { status: 400 });
      }
      const extension = cover.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "webp";
      const path = `public/images/posts/${slug}/cover.${extension}`;
      images.push(await toPublishImage(cover, path));
      coverPublicPath = `/images/posts/${slug}/cover.${extension}`;
    }

    for (const image of extraImages) {
      if (!isAllowedImage(image.name)) {
        return Response.json({ error: `图片格式不支持：${image.name}` }, { status: 400 });
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return Response.json({ error: `图片超过 5MB：${image.name}` }, { status: 400 });
      }
      images.push(await toPublishImage(image, `public/images/posts/${slug}/${safeImageName(image.name)}`));
    }
  } catch {
    return Response.json({ error: "读取上传文件失败" }, { status: 400 });
  }

  try {
    const result = await publishToGitHub({ title, slug, summary, tags, body, draft, cover: coverPublicPath, images });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "发布失败";
    return Response.json({ error: message }, { status: 502 });
  }
}
