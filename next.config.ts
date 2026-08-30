import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: {
    serverActions: {
      // /admin 发布接口走 multipart 上传，默认 1MB 会被 vinext 误判为
      // server action 请求并返回 413；上限需覆盖 base64 后的图片体积。
      bodySizeLimit: "10mb",
    },
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
