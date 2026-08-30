import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/base.css";
import "./styles/home.css";
import "./styles/content.css";
import "./styles/admin.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeInitializer = `
  (() => {
    const syncThemeControl = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      document.querySelectorAll(".theme-toggle").forEach((button) => {
        button.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到暗色模式");
        button.setAttribute("aria-pressed", String(dark));
        button.setAttribute("title", dark ? "切换到浅色模式" : "切换到暗色模式");
      });
    };

    try {
      const savedTheme = localStorage.getItem("ylt-theme");
      document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
    } catch {
      document.documentElement.dataset.theme = "light";
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", syncThemeControl, { once: true });
    } else {
      syncThemeControl();
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".theme-toggle")) return;

      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      try {
        localStorage.setItem("ylt-theme", nextTheme);
      } catch {}
      syncThemeControl();
    });
  })();
`;

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  title: { default: "YLT｜Java 后端工程实践", template: "%s｜YLT" },
  description: "ylt 的个人博客：Java 后端、分布式系统与 AI 工程化的实践与思考。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "YLT",
    title: "YLT｜Java 后端工程实践",
    description: "ylt 的个人博客：Java 后端、分布式系统与 AI 工程化的实践与思考。",
  },
  twitter: {
    card: "summary",
    title: "YLT｜Java 后端工程实践",
    description: "ylt 的个人博客：Java 后端、分布式系统与 AI 工程化的实践与思考。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
