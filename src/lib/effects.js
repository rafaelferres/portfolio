/* Rafael Ferrés — motion layer.
   Plain DOM code shared by the Next.js site and the artifact preview.
   Every effect is idempotent (safe to call initEffects() again after a re-render)
   and is skipped when the visitor prefers reduced motion. */

const LOGO_PATHS = [
  "M40 115 V45 H70 C82 45 89 53 89 63 C89 73 82 81 70 81 H40",
  "M68 81 L90 115",
  "M106 115 V45 H130",
  "M106 79 H125",
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ── 1. Split headings into words that rise in ── */
function splitWords(root) {
  root.querySelectorAll("[data-split]:not([data-split-done])").forEach((el) => {
    el.setAttribute("data-split-done", "");
    const parts = el.childNodes.length === 1 && el.firstChild.nodeType === 3 ? [el.firstChild] : Array.from(el.childNodes);
    let i = 0;
    parts.forEach((node) => {
      if (node.nodeType !== 3) {
        node.classList && node.classList.add("w-block");
        node.style && node.style.setProperty("--wi", String(i++));
        return;
      }
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
        const outer = document.createElement("span");
        outer.className = "w";
        const inner = document.createElement("span");
        inner.textContent = w;
        inner.style.setProperty("--wi", String(i++));
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.replaceWith(frag);
    });
    // last word gets the accent treatment
    const all = el.querySelectorAll(".w");
    if (el.hasAttribute("data-accent") && all.length) all[all.length - 1].classList.add("w--accent");
  });
}

/* ── 2. Count numbers up when visible ── */
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = "1";
  const raw = el.textContent.trim();
  const m = raw.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return;
  const [, pre, num, suf] = m;
  const target = parseInt(num, 10);
  const from = target > 1900 ? target - 12 : 0;
  const dur = 1400;
  const t0 = performance.now();
  const step = (t) => {
    const k = clamp((t - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = pre + Math.round(from + (target - from) * e) + suf;
    if (k < 1) requestAnimationFrame(step);
  };
  el.textContent = pre + from + suf;
  requestAnimationFrame(step);
}

/* ── 3. Machine "decode" effect on mono codes ── */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#§·+";
function scramble(el) {
  if (el.dataset.scrambled) return;
  el.dataset.scrambled = "1";
  const final = el.textContent;
  let frame = 0;
  const total = 18;
  const tick = () => {
    frame++;
    el.textContent = final
      .split("")
      .map((c, i) => (c === " " || i < (frame / total) * final.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join("");
    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = final;
  };
  requestAnimationFrame(tick);
}

/* ── 4. Visibility watcher: reveal, count, scramble ── */
let watcher;
function watch(root) {
  if (!watcher) {
    watcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.classList.add("in");
          if (el.matches("[data-count]")) countUp(el);
          if (el.matches("[data-scramble]")) scramble(el);
          watcher.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );
  }
  root.querySelectorAll("[data-split],[data-count],[data-scramble],.tl,.timeline").forEach((el) => {
    if (!el.dataset.watched) { el.dataset.watched = "1"; watcher.observe(el); }
  });
}

/* ── 5. Tilt cards + magnetic buttons ── */
function interactive(root) {
  if (!finePointer()) return;
  root.querySelectorAll(".pj,.reason,.prov,.lc,.degree,.now").forEach((card) => {
    if (card.dataset.tilt) return;
    card.dataset.tilt = "1";
    card.classList.add("tilt");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
  root.querySelectorAll(".btn--primary").forEach((b) => {
    if (b.dataset.mag) return;
    b.dataset.mag = "1";
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

/* ── 6. Ambient background: drifting dust + cursor glow ── */
function ambient() {
  if (document.querySelector(".ambient")) return;
  const c = document.createElement("canvas");
  c.className = "ambient";
  c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const glow = document.createElement("div");
  glow.className = "glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.prepend(glow);

  const g = c.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const N = 90;
  const pts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, t: Math.random() * 6 }));
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener("resize", size);
  let gx = W * 0.7, gy = H * 0.3, tx = gx, ty = gy;
  window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  let last = performance.now();
  const loop = (t) => {
    const dt = Math.min(50, t - last); last = t;
    if (!document.hidden) {
      g.clearRect(0, 0, W, H);
      const sy = window.scrollY * 0.00004;
      for (const p of pts) {
        p.y -= 0.000012 * dt * p.z; p.t += dt * 0.001;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const x = p.x * W + Math.sin(p.t + p.x * 9) * 6;
        const y = (((p.y - sy * p.z) % 1) + 1) % 1 * H;
        g.globalAlpha = 0.12 + 0.35 * p.z * (0.6 + 0.4 * Math.sin(p.t * 1.7));
        g.fillStyle = p.z > 0.85 ? "#c8f560" : "#f2f0ea";
        g.fillRect(x, y, p.z * 1.6, p.z * 1.6);
      }
      gx += (tx - gx) * 0.06; gy += (ty - gy) * 0.06;
      glow.style.transform = `translate3d(${gx - 300}px, ${gy - 300}px, 0)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ── 7. Scroll-linked bits: timeline line ── */
function scrollBits() {
  if (window.__rfScroll) return;
  window.__rfScroll = true;
  const update = () => {
    const vh = window.innerHeight;
    document.querySelectorAll(".timeline").forEach((tl) => {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty("--draw", clamp((vh * 0.75 - r.top) / r.height, 0, 1).toFixed(3));
    });
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ── 8. Signature piece: a neural net that organizes into the RF logo ── */
function neural(root) {
  root.querySelectorAll(".neural:not([data-net])").forEach((box) => {
    box.dataset.net = "1";
    const canvas = box.querySelector("canvas");
    const counter = box.querySelector("[data-net-count]");
    const g = canvas.getContext("2d");

    // sample target points from the logo strokes
    const S = 230, off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d");
    o.scale(S / 160, S / 160);
    o.translate(-5, 0);
    o.lineWidth = 15; o.lineCap = "round"; o.lineJoin = "round"; o.strokeStyle = "#fff";
    LOGO_PATHS.forEach((d) => o.stroke(new Path2D(d)));
    const data = o.getImageData(0, 0, S, S).data;
    const targets = [];
    for (let y = 0; y < S; y += 5) for (let x = 0; x < S; x += 5) {
      const jx = x + (Math.random() - 0.5) * 3.2, jy = y + (Math.random() - 0.5) * 3.2;
      if (data[(y * S + x) * 4 + 3] > 128) targets.push([jx / S, jy / S]);
    }
    // outline ring of the rounded square
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const r = 0.47, sq = 4;
      const cx = Math.cos(a), cy = Math.sin(a);
      const k = Math.pow(Math.pow(Math.abs(cx), sq) + Math.pow(Math.abs(cy), sq), -1 / sq);
      targets.push([0.5 + cx * k * r, 0.5 + cy * k * r]);
    }
    const n = targets.length;
    const pts = targets.map(([tx, ty], i) => {
      const a = Math.random() * Math.PI * 2, rr = 0.25 + Math.random() * 0.55;
      return { tx, ty, sx: 0.5 + Math.cos(a) * rr * 1.6, sy: 0.5 + Math.sin(a) * rr, d: Math.random() * 0.35, ph: Math.random() * 6, ring: i >= n - 90 };
    });
    // neighbors in target space
    const nb = pts.map((p, i) => {
      const ds = [];
      for (let j = 0; j < n; j++) if (j !== i) ds.push([j, (pts[j].tx - p.tx) ** 2 + (pts[j].ty - p.ty) ** 2]);
      ds.sort((a, b) => a[1] - b[1]);
      return [ds[0][0], ds[1][0]];
    });

    let W = 0, H = 0, dpr = 1, p = 0, sp = 0, vis = false;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = box.clientWidth; H = box.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    new ResizeObserver(size).observe(box);
    size();
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(box);
    const total = Number(counter?.dataset.netCount || n);

    const loop = (t) => {
      if (vis) {
        const r = box.getBoundingClientRect(), vh = window.innerHeight;
        p = reduced() ? 1 : clamp((vh - r.top) / (vh * 0.55 + r.height * 0.6), 0, 1);
        sp += (p - sp) * 0.08;
        g.clearRect(0, 0, W, H);
        const side = Math.min(W, H) * 0.8, ox = (W - side) / 2, oy = (H - side) / 2;
        const time = t * 0.001;
        const pos = pts.map((q) => {
          const k = clamp((sp - q.d) / (1 - q.d * 0.9), 0, 1);
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          const wob = (1 - e) * 0.015;
          const x = q.sx + (q.tx - q.sx) * e + Math.sin(time + q.ph) * wob;
          const y = q.sy + (q.ty - q.sy) * e + Math.cos(time * 1.3 + q.ph) * wob;
          return [ox + x * side, oy + y * side, e];
        });
        g.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const [x, y, e] = pos[i];
          for (const j of nb[i]) {
            const [x2, y2] = pos[j];
            g.strokeStyle = `rgba(94,230,200,${0.06 + e * 0.22})`;
            g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
          }
        }
        for (let i = 0; i < n; i++) {
          const [x, y, e] = pos[i];
          const pulse = 0.5 + 0.5 * Math.sin(time * 2 + pts[i].ph);
          g.fillStyle = pts[i].ring ? `rgba(94,230,200,${0.35 + e * 0.5})` : `rgba(200,245,96,${0.45 + e * 0.55})`;
          const s = (pts[i].ring ? 1.6 : 2.1) + e * 0.6 + pulse * 0.5;
          g.fillRect(x - s / 2, y - s / 2, s, s);
        }
        if (counter) counter.textContent = String(Math.round(sp * total)).padStart(3, "0");
        box.classList.toggle("is-formed", sp > 0.96);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

export function initEffects(root) {
  if (typeof window === "undefined") return;
  const r = root || document;
  splitWords(r);
  if (reduced()) {
    r.querySelectorAll("[data-split],[data-count],[data-scramble],.tl,.timeline").forEach((el) => el.classList.add("in"));
    r.querySelectorAll(".timeline").forEach((el) => el.style.setProperty("--draw", "1"));
    neural(r);
    return;
  }
  document.documentElement.classList.add("fx");
  watch(r);
  interactive(r);
  ambient();
  scrollBits();
  neural(r);
}
