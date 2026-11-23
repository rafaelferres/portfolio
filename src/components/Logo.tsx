// The RF mark — same drawing as the favicon (src/app/icon.svg) and the loading screen.
export default function Logo({ className = "nav__logo" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <rect width="160" height="160" rx="36" fill="#c8f560" />
      <g transform="translate(-5 0)" fill="none" stroke="#0b0b0a" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 115 V45 H70 C82 45 89 53 89 63 C89 73 82 81 70 81 H40" />
        <path d="M68 81 L90 115" />
        <path d="M106 115 V45 H130" />
        <path d="M106 79 H125" />
      </g>
    </svg>
  );
}
