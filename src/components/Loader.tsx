// Intro screen: only the "RF" logo, drawn stroke by stroke (pure CSS, shown once per session).
export default function Loader() {
  return (
    <div className="loader" aria-hidden="true"><div className="loader__inner"><svg className="loader__rf" viewBox="0 0 160 160"><rect className="loader__box" x="6" y="6" width="148" height="148" rx="36" pathLength="1"/><g transform="translate(-5 0)"><path className="loader__l loader__l--1" pathLength="1" d="M40 115 V45 H70 C82 45 89 53 89 63 C89 73 82 81 70 81 H40"/><path className="loader__l loader__l--2" pathLength="1" d="M68 81 L90 115"/><path className="loader__l loader__l--3" pathLength="1" d="M106 115 V45 H130"/><path className="loader__l loader__l--4" pathLength="1" d="M106 79 H125"/></g></svg></div></div>
  );
}
