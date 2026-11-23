"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Card = { title: string; period: string; text: string; tags: string[] };
type AssemblyDict = {
  label: string;
  title: string;
  parts: string[];
  intro: { title: string; text: string };
  cards: Card[];
};

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

export default function Assembly({ dict }: { dict: AssemblyDict }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [noWebgl, setNoWebgl] = useState(false);
  const n = dict.parts.length;

  /* ── scroll → progress ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = document.getElementById("top");
    const onScroll = () => {
      let p = 1;
      if (!reduced && section && stageRef.current) {
        const vh = window.innerHeight;
        if (window.innerWidth > 920) {
          const r = section.getBoundingClientRect();
          p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
        } else {
          const r = stageRef.current.getBoundingClientRect();
          p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 1.5)));
        }
      }
      progressRef.current = p;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ── three.js chip ── */
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three")
      .then((THREE) => {
        if (disposed || !canvasRef.current || !stageRef.current) return;
        cleanup = buildChip(THREE, canvasRef.current, stageRef.current, progressRef);
      })
      .catch(() => setNoWebgl(true));
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const active = Math.min(n, Math.floor((progress / 0.9) * n + 0.001));
  const card = active === 0 ? null : dict.cards[active - 1];

  const jumpTo = useCallback(
    (i: number) => {
      const target = ((i + 1) / n) * 0.9 + 0.005;
      const section = document.getElementById("top");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (section && window.innerWidth > 920 && !reduced) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + target * (section.offsetHeight - window.innerHeight), behavior: "smooth" });
      } else {
        progressRef.current = Math.max(progressRef.current, target);
        setProgress(progressRef.current);
      }
    },
    [n]
  );

  return (
    <div className="hero-right">
      <div className={`stage ${noWebgl ? "no-webgl" : ""}`} ref={stageRef}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="stage__head mono">
          <span>
            {dict.label} · P/{pad(Math.max(1, Math.min(n, active || 1)))}
          </span>
          <span className="stage__pct">{pad(Math.round(progress * 100), 3)}%</span>
        </div>
        <ol className="parts mono">
          {dict.parts.map((p, i) => (
            <li key={p} className={`${i < active ? "is-on" : ""} ${i === active - 1 ? "is-cur" : ""}`}>
              <button type="button" className="pbtn" aria-label={`P/${pad(i + 1)} ${p}`} title={p} onClick={() => jumpTo(i)}>
                {pad(i + 1)}
              </button>
            </li>
          ))}
        </ol>
        <div className="stage__fallback">{dict.title}</div>
      </div>
      <article className="pcard pop" key={active} aria-live="polite">
        {card ? (
          <>
            <div className="pcard__top mono">
              <span className="pcard__code">
                P/{pad(active)} · {dict.parts[active - 1]}
              </span>
              <span>{card.period}</span>
            </div>
            <h3 className="pcard__title">{card.title}</h3>
            <p className="pcard__text">{card.text}</p>
            <ul className="pcard__tags">
              {card.tags.map((t) => (
                <li key={t} className="chip mono">
                  {t}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="pcard__top mono">
              <span className="pcard__code">P/00</span>
              <span>000%</span>
            </div>
            <h3 className="pcard__title">{dict.intro.title}</h3>
            <p className="pcard__text">{dict.intro.text}</p>
          </>
        )}
      </article>
    </div>
  );
}

/* ───────── procedural 3D chip ───────── */
type ThreeNS = typeof import("three");

function buildChip(
  THREE: ThreeNS,
  canvas: HTMLCanvasElement,
  stage: HTMLDivElement,
  progressRef: React.MutableRefObject<number>
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 7.2, 10.5);
  camera.lookAt(0, 0.9, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5, 9, 6);
  scene.add(key);
  const lime = new THREE.PointLight(0xc8f560, 1.4, 18);
  lime.position.set(-4, 3, -2);
  scene.add(lime);
  const teal = new THREE.PointLight(0x5ee6c8, 1.2, 18);
  teal.position.set(4, 2, -3);
  scene.add(teal);

  const tex = (draw: (g: CanvasRenderingContext2D, s: number) => void, size = 512) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d")!, size);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };
  const pcb = tex((g, s) => {
    g.fillStyle = "#11160f";
    g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(200,245,96,.55)";
    g.lineWidth = 3;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const side = i % 4,
        o = 30 + rnd() * (s - 60);
      const x = side === 0 ? 0 : side === 1 ? s : o,
        y = side === 2 ? 0 : side === 3 ? s : o;
      g.beginPath();
      g.moveTo(x, y);
      const tx = s / 2 + (rnd() - 0.5) * s * 0.42,
        ty = s / 2 + (rnd() - 0.5) * s * 0.42;
      if (side < 2) {
        g.lineTo((x + tx) / 2, y);
        g.lineTo(tx, ty);
      } else {
        g.lineTo(x, (y + ty) / 2);
        g.lineTo(tx, ty);
      }
      g.stroke();
      g.fillStyle = "#c8f560";
      g.beginPath();
      g.arc(tx, ty, 4, 0, 7);
      g.fill();
    }
  });
  const dieTex = tex((g, s) => {
    g.fillStyle = "#0d1715";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 24; i++)
      for (let j = 0; j < 24; j++) {
        const a = ((i * 7 + j * 13) % 11) / 11;
        g.fillStyle = `rgba(94,230,200,${0.08 + a * 0.28})`;
        g.fillRect(8 + i * 20.8, 8 + j * 20.8, 17, 17);
      }
    g.strokeStyle = "rgba(94,230,200,.6)";
    g.lineWidth = 4;
    g.strokeRect(4, 4, s - 8, s - 8);
  });
  const lidTex = tex((g, s) => {
    const grd = g.createLinearGradient(0, 0, s, s);
    grd.addColorStop(0, "#3a3d39");
    grd.addColorStop(1, "#1f211f");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#c8f560";
    g.font = "800 150px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("RF", s / 2, s / 2 - 30);
    g.fillStyle = "rgba(242,240,234,.75)";
    g.font = "500 34px monospace";
    g.fillText("AI · CORE · 2026", s / 2, s / 2 + 80);
  });

  const std = (o: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0]) => new THREE.MeshStandardMaterial(o);
  const side = std({ color: 0x1a1e18, roughness: 0.7, metalness: 0.2 });
  type V3 = [number, number, number];
  type Pose = { p: V3; r: V3; s: number };
  const parts: { obj: import("three").Object3D; from: Pose; to: Pose }[] = [];
  const chip = new THREE.Group();
  scene.add(chip);
  const add = (obj: import("three").Object3D, from: Partial<Pose>, to: Partial<Pose> = {}) => {
    const T: Pose = { p: to.p || [0, 0, 0], r: to.r || [0, 0, 0], s: to.s ?? 1 };
    parts.push({ obj, from: { p: from.p || T.p, r: from.r || T.r, s: from.s ?? T.s }, to: T });
    chip.add(obj);
    return obj;
  };

  add(
    new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 4.2), [
      side, side,
      std({ map: pcb, roughness: 0.55, metalness: 0.25, emissive: 0xc8f560, emissiveMap: pcb, emissiveIntensity: 0.35 }),
      side, side, side,
    ]),
    { p: [0, -1.4, 0], r: [0, -0.6, 0], s: 0.82 }
  );

  const pins = new THREE.Group();
  const gold = std({ color: 0xd8b24a, metalness: 1, roughness: 0.28 });
  const pinGeo = new THREE.BoxGeometry(0.1, 0.05, 0.42);
  for (let sd = 0; sd < 4; sd++)
    for (let i = 0; i < 15; i++) {
      const m = new THREE.Mesh(pinGeo, gold),
        o = -1.75 + i * 0.25;
      if (sd === 0) m.position.set(o, 0, 2.26);
      if (sd === 1) m.position.set(o, 0, -2.26);
      if (sd === 2) { m.position.set(2.26, 0, o); m.rotation.y = Math.PI / 2; }
      if (sd === 3) { m.position.set(-2.26, 0, o); m.rotation.y = Math.PI / 2; }
      pins.add(m);
    }
  add(pins, { p: [0, -0.5, 0], r: [0, 0.5, 0], s: 1.22 });

  add(
    new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.4), [
      side, side,
      std({ map: dieTex, emissive: 0x5ee6c8, emissiveMap: dieTex, emissiveIntensity: 0.7, roughness: 0.35, metalness: 0.4 }),
      side, side, side,
    ]),
    { p: [0, 1.2, 0], r: [0, 0.8, 0] },
    { p: [0, 0.15, 0] }
  );

  const cores = new THREE.Group();
  const coreMats: import("three").MeshStandardMaterial[] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const mat = std({ color: 0x1b2412, emissive: 0xc8f560, emissiveIntensity: 0.7, roughness: 0.4 });
      coreMats.push(mat);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.34), mat);
      c.position.set(-0.75 + i * 0.5, 0, -0.75 + j * 0.5);
      cores.add(c);
    }
  add(cores, { p: [0, 2.05, 0], r: [0, -0.9, 0], s: 1.35 }, { p: [0, 0.29, 0] });

  const lidMat = std({ map: lidTex, metalness: 0.85, roughness: 0.38, transparent: true, opacity: 0.9 });
  const lidSide = std({ color: 0x2c2f2b, metalness: 0.9, roughness: 0.35, transparent: true, opacity: 0.9 });
  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.14, 2.9), [lidSide, lidSide, lidMat, lidSide, lidSide, lidSide]);
  add(lid, { p: [0, 3.0, 0], r: [0.35, 0.6, -0.2] }, { p: [0, 0.48, 0] });

  const rings = new THREE.Group();
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.022, 8, 180), std({ color: 0x5ee6c8, emissive: 0x5ee6c8, emissiveIntensity: 1.2 }));
  const r2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.85, 0.012, 8, 180),
    std({ color: 0xc8f560, emissive: 0xc8f560, emissiveIntensity: 1, transparent: true, opacity: 0.55 })
  );
  r1.rotation.x = r2.rotation.x = Math.PI / 2;
  rings.add(r1, r2);
  add(rings, { p: [0, -1.6, 0], s: 0.2 });

  const N = 700,
    pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2,
      rr = 2.6 + Math.random() * 2.6;
    pos[i * 3] = Math.cos(a) * rr;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
    pos[i * 3 + 2] = Math.sin(a) * rr;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: 0xc8f560, size: 0.045, transparent: true, opacity: 0, depthWrite: false });
  const dots = new THREE.Points(pg, pm);
  add(dots, { s: 0.3 }, { s: 1 });

  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  let mx = 0, my = 0, tmx = 0, tmy = 0, visible = true, raf = 0, smoothP = progressRef.current;

  const onMove = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width - 0.5;
    tmy = (e.clientY - r.top) / r.height - 0.5;
  };
  const onLeave = () => { tmx = tmy = 0; };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 13.5 : 10.5;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const clock = new THREE.Clock();
  const frame = () => {
    raf = 0;
    if (!visible) return;
    const t = clock.getElapsedTime();
    const target = progressRef.current;
    smoothP = lerp(smoothP, target, reduced ? 1 : 0.12);
    const n = parts.length;
    parts.forEach((pt, i) => {
      const s0 = (i / n) * 0.9;
      const k = ease(Math.min(1, Math.max(0, (smoothP - s0) / (0.9 / n))));
      const o = pt.obj;
      o.position.set(lerp(pt.from.p[0], pt.to.p[0], k), lerp(pt.from.p[1], pt.to.p[1], k), lerp(pt.from.p[2], pt.to.p[2], k));
      o.rotation.set(lerp(pt.from.r[0], pt.to.r[0], k), lerp(pt.from.r[1], pt.to.r[1], k), lerp(pt.from.r[2], pt.to.r[2], k));
      o.scale.setScalar(lerp(pt.from.s, pt.to.s, k));
      if (o === dots) pm.opacity = 0.15 + k * 0.7;
      if (o === lid) lidMat.opacity = lidSide.opacity = 0.35 + k * 0.55;
    });
    coreMats.forEach((m, i) => { m.emissiveIntensity = 0.5 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.6 + i * 0.7)); });
    rings.rotation.y = t * 0.25;
    dots.rotation.y = -t * 0.08;
    mx = lerp(mx, tmx, 0.06);
    my = lerp(my, tmy, 0.06);
    chip.rotation.y = (reduced ? 0.5 : t * 0.18) + mx * 0.7;
    chip.rotation.x = my * 0.25;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  vis.observe(stage);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    vis.disconnect();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    renderer.dispose();
  };
}
