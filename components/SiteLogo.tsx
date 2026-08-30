function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="logo-mark"
      focusable="false"
      viewBox="0 0 48 48"
    >
      <path
        className="logo-part logo-signature"
        d="M10 13c5 6 9 10 14 14 5-4 9-9 13-14M24 27c-2 5-5 9-10 12"
      />
      <circle className="logo-dot" cx="20" cy="40" r="2.5" />
    </svg>
  );
}

export function SiteLogo() {
  return (
    <span className="site-logo">
      <span className="site-logo-tile">
        <LogoMark />
      </span>
    </span>
  );
}
