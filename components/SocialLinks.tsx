const SOCIAL_LINKS = [
  {
    ariaLabel: "GitHub（@Laliter）",
    href: "https://github.com/Laliter",
    path: "M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.28 10.28 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z",
  },
  {
    ariaLabel: "X / Twitter（@litingyuXx）",
    href: "https://x.com/litingyuXx",
    path: "M17.53 3H21l-7.19 8.21L22.25 21h-6.63l-5.19-6.79L4.74 21H1.27l7.69-8.79L1.75 3h6.8l4.69 6.2L17.53 3Zm-1.16 16h1.84L7.62 4.9H5.65l10.72 14.1Z",
  },
  {
    ariaLabel: "邮箱（395662401@qq.com）",
    href: "mailto:395662401@qq.com",
    path: "M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-13Zm1.5.5 7.5 6.25L19.5 6H4.5v13h15V6l-7.5 6.25L4.5 6Zm0 12.5h15V7.6l-7.5 6.25-7.5-6.25v11.4Z",
  },
] as const;

export function SocialLinks() {
  return (
    <div className="header-social" aria-label="社交媒体链接">
      {SOCIAL_LINKS.map(({ ariaLabel, href, path }) => (
        <a
          aria-label={ariaLabel}
          className="header-social-link"
          href={href}
          key={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg aria-hidden="true" className="header-social-icon" viewBox="0 0 24 24">
            <path d={path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
