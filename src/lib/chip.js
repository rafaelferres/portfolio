/* Procedural AI chip, assembled by scroll.
   Shared by the Next.js site (three@0.150 from npm) and the artifact preview (three r128 UMD).
   buildChip(THREE, canvas, stage, getProgress) → cleanup() */

const LOGO = [
  "M40 115 V45 H70 C82 45 89 53 89 63 C89 73 82 81 70 81 H40",
  "M68 81 L90 115",
  "M106 115 V45 H130",
  "M106 79 H125",
];

export function buildChip(THREE, canvas, stage, getProgress) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* lite mode: phones, few cores, little memory or data saver → fewer pixels, particles and frames */
  const nav = navigator;
  const lite =
    window.matchMedia("(max-width: 820px), (pointer: coarse)").matches ||
    (nav.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory || 8) <= 4 ||
    !!(nav.connection && nav.connection.saveData);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: lite ? "low-power" : "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 7.4, 10.8);
  camera.lookAt(0, 0.85, 0);

  /* ── studio environment for reflections (no external files) ── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x141513, side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, color, intensity, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    env.add(m);
  };
  panel(10, 3, 0xffffff, 3.2, [0, 5.8, 0], [Math.PI / 2, 0, 0]); // top softbox
  panel(4, 6, 0xffffff, 1.6, [-9.5, 1, 2], [0, Math.PI / 2, 0]); // left strip
  panel(3, 5, 0xff4757, 2.2, [9.5, 1, -2], [0, -Math.PI / 2, 0]); // lime kicker
  panel(5, 2, 0xff9aa2, 1.8, [0, 1.5, -9.5], [0, 0, 0]); // teal back
  const envTex = pmrem.fromScene(env, 0.035).texture;
  scene.environment = envTex;

  /* ── lights ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 9, 6);
  scene.add(key);
  const lime = new THREE.PointLight(0xff4757, 1.6, 16);
  lime.position.set(-4, 2.5, -2);
  scene.add(lime);
  const teal = new THREE.PointLight(0xff9aa2, 1.3, 16);
  teal.position.set(4, 1.8, -3);
  scene.add(teal);

  /* ── textures ── */
  const tex = (draw, size = 1024) => {
    if (lite) size = Math.min(size, 512);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d"), size);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
    return t;
  };
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // PCB: copper traces routed in 45° steps from the edges to the die; we keep the paths for the data pulses
  const traces = [];
  const pcbDraw = (g, s, emissive) => {
    g.fillStyle = emissive ? "#000" : "#140f10";
    g.fillRect(0, 0, s, s);
    if (!emissive) {
      for (let i = 0; i < (lite ? 900 : 2600); i++) {
        g.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`;
        g.fillRect(rnd() * s, rnd() * s, 2, 2);
      }
      g.strokeStyle = "rgba(255,71,87,.16)";
      g.lineWidth = 6;
      g.strokeRect(24, 24, s - 48, s - 48);
    }
    g.lineCap = "round";
    g.lineJoin = "round";
    traces.forEach((pts) => {
      g.strokeStyle = emissive ? "rgba(255,71,87,.85)" : "rgba(255,71,87,.55)";
      g.lineWidth = emissive ? 3 : 4;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)));
      g.stroke();
      const [ex, ey] = pts[pts.length - 1];
      g.fillStyle = emissive ? "#ff4757" : "#ff6b78";
      g.beginPath();
      g.arc(ex * s, ey * s, emissive ? 5 : 7, 0, 7);
      g.fill();
      const [sx, sy] = pts[0];
      g.beginPath();
      g.arc(sx * s, sy * s, emissive ? 4 : 6, 0, 7);
      g.fill();
    });
  };
  for (let i = 0; i < 56; i++) {
    const side = i % 4;
    const o = 0.08 + rnd() * 0.84;
    let x = side === 0 ? 0.04 : side === 1 ? 0.96 : o;
    let y = side === 2 ? 0.04 : side === 3 ? 0.96 : o;
    const tx = 0.5 + (rnd() - 0.5) * 0.5;
    const ty = 0.5 + (rnd() - 0.5) * 0.5;
    const pts = [[x, y]];
    const mid = 0.25 + rnd() * 0.3;
    if (side < 2) {
      const mx = x + (tx - x) * mid;
      pts.push([mx, y]);
      const d = Math.min(Math.abs(tx - mx), Math.abs(ty - y));
      pts.push([mx + Math.sign(tx - mx) * d, y + Math.sign(ty - y) * d]);
    } else {
      const my = y + (ty - y) * mid;
      pts.push([x, my]);
      const d = Math.min(Math.abs(tx - x), Math.abs(ty - my));
      pts.push([x + Math.sign(tx - x) * d, my + Math.sign(ty - my) * d]);
    }
    pts.push([tx, ty]);
    traces.push(pts);
  }
  const pcbMap = tex((g, s) => pcbDraw(g, s, false));
  const pcbGlow = tex((g, s) => pcbDraw(g, s, true));

  const dieMap = tex((g, s) => {
    g.fillStyle = "#14090b";
    g.fillRect(0, 0, s, s);
    // functional blocks
    const blocks = [[0.06, 0.06, 0.4, 0.26], [0.52, 0.06, 0.42, 0.18], [0.52, 0.28, 0.2, 0.2], [0.76, 0.28, 0.18, 0.42], [0.06, 0.36, 0.42, 0.34], [0.06, 0.74, 0.88, 0.2], [0.52, 0.52, 0.2, 0.18]];
    blocks.forEach(([x, y, w, h], bi) => {
      g.fillStyle = `rgba(255,154,162,${0.05 + (bi % 3) * 0.03})`;
      g.fillRect(x * s, y * s, w * s, h * s);
      g.strokeStyle = "rgba(255,154,162,.35)";
      g.lineWidth = 2;
      g.strokeRect(x * s, y * s, w * s, h * s);
      const step = 10 + (bi % 3) * 6;
      for (let yy = y * s + 6; yy < (y + h) * s - 4; yy += step)
        for (let xx = x * s + 6; xx < (x + w) * s - 4; xx += step) {
          const a = rnd();
          if (a > 0.35) { g.fillStyle = `rgba(255,154,162,${0.12 + a * 0.4})`; g.fillRect(xx, yy, step - 4, step - 4); }
        }
    });
    g.strokeStyle = "rgba(255,71,87,.55)";
    g.lineWidth = 6;
    g.strokeRect(6, 6, s - 12, s - 12);
  });

  const brushed = tex((g, s) => {
    const grd = g.createLinearGradient(0, 0, s, s);
    grd.addColorStop(0, "#9a9f98");
    grd.addColorStop(1, "#5a5e59");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 1) {
      g.fillStyle = `rgba(255,255,255,${rnd() * 0.06})`;
      g.fillRect(0, y, s, 1);
    }
  }, 512);

  const engraving = tex((g, s) => {
    g.clearRect(0, 0, s, s);
    g.save();
    g.translate(s * 0.2, s * 0.12);
    g.scale((s * 0.6) / 160, (s * 0.6) / 160);
    g.translate(-5, 0);
    g.strokeStyle = "#ff4757";
    g.lineWidth = 12;
    g.lineCap = "round";
    g.lineJoin = "round";
    LOGO.forEach((d) => g.stroke(new Path2D(d)));
    g.restore();
    g.fillStyle = "rgba(242,240,234,.85)";
    g.font = `500 ${s * 0.045}px monospace`;
    g.textAlign = "center";
    g.fillText("RF · AI CORE · 2026", s / 2, s * 0.84);
    g.fillStyle = "rgba(242,240,234,.45)";
    g.font = `400 ${s * 0.03}px monospace`;
    g.fillText("SP-BR  9+ YRS  GENAI-2023", s / 2, s * 0.9);
    g.beginPath();
    g.arc(s * 0.1, s * 0.1, s * 0.022, 0, 7);
    g.fillStyle = "rgba(242,240,234,.55)";
    g.fill();
  }, 1024);

  const glowTex = tex((g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.25, "rgba(255,255,255,.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
  }, 128);

  const shadowTex = tex((g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(0,0,0,.85)");
    r.addColorStop(0.55, "rgba(0,0,0,.35)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
  }, 256);

  /* ── materials ── */
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const edge = phys({ color: 0x211a1b, roughness: 0.45, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const goldEdge = phys({ color: 0xd8b24a, roughness: 0.25, metalness: 1 });

  const parts = [];
  const chip = new THREE.Group();
  scene.add(chip);
  const add = (obj, from, to = {}) => {
    const T = { p: to.p || [0, 0, 0], r: to.r || [0, 0, 0], s: to.s ?? 1 };
    parts.push({ obj, from: { p: from.p || T.p, r: from.r || T.r, s: from.s ?? T.s }, to: T, k: 0 });
    chip.add(obj);
    return obj;
  };

  /* P/01 substrate + SMD components */
  const sub = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 4.2), [
    edge, edge,
    phys({ map: pcbMap, emissive: 0xff4757, emissiveMap: pcbGlow, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
    edge, edge, edge,
  ]);
  sub.add(board);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(4.24, 0.02, 4.24), goldEdge);
  rim.position.y = -0.08;
  sub.add(rim);
  const smdBody = phys({ color: 0x24201a, roughness: 0.6 });
  const smdCap = phys({ color: 0xcfd3cf, roughness: 0.2, metalness: 1 });
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group();
    const big = i % 5 === 0;
    const w = big ? 0.26 : 0.16, d = big ? 0.14 : 0.08, h = big ? 0.08 : 0.05;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h, d), smdBody);
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 1.02, d * 1.02), smdCap);
    const c2 = c1.clone();
    c1.position.x = -w * 0.42;
    c2.position.x = w * 0.42;
    g.add(body, c1, c2);
    let x, z;
    do { x = (rnd() - 0.5) * 3.7; z = (rnd() - 0.5) * 3.7; } while (Math.abs(x) < 1.65 && Math.abs(z) < 1.65);
    g.position.set(x, 0.08 + h / 2, z);
    g.rotation.y = rnd() > 0.5 ? Math.PI / 2 : 0;
    sub.add(g);
  }
  add(sub, { p: [0, -1.4, 0], r: [0, -0.6, 0], s: 0.82 });

  /* P/02 contacts: gold pins + solder balls */
  const pins = new THREE.Group();
  const gold = phys({ color: 0xe0b955, metalness: 1, roughness: 0.18, clearcoat: 0.4 });
  const pinGeo = new THREE.BoxGeometry(0.09, 0.045, 0.42);
  for (let sd = 0; sd < 4; sd++)
    for (let i = 0; i < 17; i++) {
      const m = new THREE.Mesh(pinGeo, gold);
      const o = -1.84 + i * 0.23;
      if (sd === 0) m.position.set(o, 0, 2.26);
      if (sd === 1) m.position.set(o, 0, -2.26);
      if (sd === 2) { m.position.set(2.26, 0, o); m.rotation.y = Math.PI / 2; }
      if (sd === 3) { m.position.set(-2.26, 0, o); m.rotation.y = Math.PI / 2; }
      pins.add(m);
    }
  const ballGeo = new THREE.SphereGeometry(0.06, 12, 8);
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 12; j++) {
      const b = new THREE.Mesh(ballGeo, gold);
      b.position.set(-1.65 + i * 0.3, -0.11, -1.65 + j * 0.3);
      pins.add(b);
    }
  add(pins, { p: [0, -0.55, 0], r: [0, 0.5, 0], s: 1.22 });

  /* P/03 silicon die */
  const dieGroup = new THREE.Group();
  const die = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 2.4), [
    edge, edge,
    phys({ map: dieMap, emissive: 0xff9aa2, emissiveMap: dieMap, emissiveIntensity: 0.9, roughness: 0.18, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.08 }),
    edge, edge, edge,
  ]);
  dieGroup.add(die);
  add(dieGroup, { p: [0, 1.2, 0], r: [0, 0.8, 0] }, { p: [0, 0.13, 0] });

  /* P/04 neural cores + neon glow */
  const cores = new THREE.Group();
  const coreMats = [];
  const halos = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const mat = phys({ color: 0x1a0a0c, emissive: 0xff4757, emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.2, clearcoat: 1 });
      coreMats.push(mat);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.34), mat);
      c.position.set(-0.75 + i * 0.5, 0, -0.75 + j * 0.5);
      cores.add(c);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff4757, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(0.7, 0.7, 0.7);
      halo.position.set(c.position.x, 0.12, c.position.z);
      cores.add(halo);
      halos.push(halo);
    }
  add(cores, { p: [0, 2.05, 0], r: [0, -0.9, 0], s: 1.35 }, { p: [0, 0.27, 0] });

  /* P/05 heat spreader: brushed frame + glass + engraved logo */
  const lid = new THREE.Group();
  const frameMat = phys({ map: brushed, color: 0xffffff, metalness: 1, roughness: 0.32, clearcoat: 0.5 });
  const bar = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, d), frameMat);
    m.position.set(x, 0, z);
    lid.add(m);
  };
  bar(3.0, 0.22, 0, 1.39); bar(3.0, 0.22, 0, -1.39); bar(0.22, 2.56, 1.39, 0); bar(0.22, 2.56, -1.39, 0);
  const glassMat = phys({ color: 0xb8a3a6, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 2.6), glassMat);
  glass.position.y = 0.05;
  lid.add(glass);
  const engraveMat = new THREE.MeshBasicMaterial({ map: engraving, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending });
  const engrave = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), engraveMat);
  engrave.rotation.x = -Math.PI / 2;
  engrave.position.y = 0.075;
  lid.add(engrave);
  add(lid, { p: [0, 3.0, 0], r: [0.35, 0.6, -0.2] }, { p: [0, 0.5, 0] });

  /* P/06 signal rings */
  const rings = new THREE.Group();
  const ringMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.018, 8, 220), ringMat(0xff9aa2, 0.95));
  const r1g = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.08, 8, 220), ringMat(0xff9aa2, 0.12));
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.01, 8, 220), ringMat(0xff4757, 0.6));
  const tick = new THREE.Group();
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.BoxGeometry(i % 6 === 0 ? 0.22 : 0.1, 0.01, 0.015), ringMat(0xff4757, i % 6 === 0 ? 0.8 : 0.35));
    m.position.set(Math.cos(a) * 4.1, 0, Math.sin(a) * 4.1);
    m.rotation.y = -a;
    tick.add(m);
  }
  [r1, r1g, r2].forEach((r) => (r.rotation.x = Math.PI / 2));
  rings.add(r1, r1g, r2, tick);
  add(rings, { p: [0, -1.6, 0], s: 0.2 });

  /* P/07 data pulse: particle field + pulses running along the traces */
  const N = lite ? 320 : 900, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, rr = 2.6 + Math.random() * 2.8;
    pos[i * 3] = Math.cos(a) * rr;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
    pos[i * 3 + 2] = Math.sin(a) * rr;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: 0xff4757, size: 0.05, map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const dust = new THREE.Points(pg, pm);
  const pulses = new THREE.Group();
  const pulseList = [];
  for (let i = 0; i < 22; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i % 3 ? 0xff4757 : 0xff9aa2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.set(0.32, 0.32, 0.32);
    pulses.add(sp);
    pulseList.push({ sp, tr: traces[(i * 7) % traces.length], t: Math.random(), v: 0.18 + Math.random() * 0.25 });
  }
  const dataGroup = new THREE.Group();
  dataGroup.add(dust);
  sub.add(pulses); // pulses ride on the board's traces
  add(dataGroup, { s: 0.3 }, { s: 1 });

  /* contact shadow */
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.3;
  chip.add(shadow);

  /* ── helpers ── */
  const along = (pts, t) => {
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push(l);
      total += l;
    }
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i]) {
        const k = d / segs[i];
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
      }
      d -= segs[i];
    }
    return pts[pts.length - 1];
  };
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const lerp = (a, b, k) => a + (b - a) * k;
  let mx = 0, my = 0, tmx = 0, tmy = 0, visible = true, raf = 0, smoothP = getProgress();

  const onMove = (e) => {
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
    camera.position.z = w / h < 0.9 ? 14 : 10.8;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const clock = new THREE.Clock();
  let prev = 0;
  let lastDraw = 0;
  const frame = (now = 0) => {
    raf = 0;
    if (!visible || document.hidden) return;
    /* ~30 fps in lite mode */
    if (lite && now - lastDraw < 31) {
      raf = requestAnimationFrame(frame);
      return;
    }
    lastDraw = now;
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - prev);
    prev = t;
    smoothP = lerp(smoothP, getProgress(), reduced ? 1 : 0.12);
    const n = parts.length;
    parts.forEach((pt, i) => {
      const s0 = (i / n) * 0.9;
      const k = ease(Math.min(1, Math.max(0, (smoothP - s0) / (0.9 / n))));
      pt.k = k;
      const o = pt.obj;
      o.position.set(lerp(pt.from.p[0], pt.to.p[0], k), lerp(pt.from.p[1], pt.to.p[1], k), lerp(pt.from.p[2], pt.to.p[2], k));
      o.rotation.set(lerp(pt.from.r[0], pt.to.r[0], k), lerp(pt.from.r[1], pt.to.r[1], k), lerp(pt.from.r[2], pt.to.r[2], k));
      o.scale.setScalar(lerp(pt.from.s, pt.to.s, k));
    });
    const kData = parts[6].k, kLid = parts[4].k, kSub = parts[0].k;
    pm.opacity = 0.12 + kData * 0.6;
    glassMat.opacity = 0.08 + kLid * 0.16;
    engraveMat.opacity = 0.3 + kLid * 0.7;
    shadow.material.opacity = 0.25 + kSub * 0.55;
    coreMats.forEach((m, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 0.7);
      m.emissiveIntensity = 0.28 + pulse * 0.5;
      halos[i].material.opacity = 0.08 + pulse * 0.22;
    });
    pulseList.forEach((pl) => {
      pl.t += dt * pl.v;
      if (pl.t > 1) { pl.t = 0; pl.tr = traces[(Math.random() * traces.length) | 0]; }
      const [u, v] = along(pl.tr, pl.t);
      pl.sp.position.set((u - 0.5) * 4.2, 0.1, (v - 0.5) * 4.2);
      pl.sp.material.opacity = kData * Math.sin(pl.t * Math.PI) * 0.95;
    });
    rings.rotation.y = t * 0.2;
    tick.rotation.y = -t * 0.35;
    dust.rotation.y = -t * 0.06;
    mx = lerp(mx, tmx, 0.06);
    my = lerp(my, tmy, 0.06);
    chip.rotation.y = (reduced ? 0.5 : t * 0.16) + mx * 0.7;
    chip.rotation.x = my * 0.22;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const vis = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  vis.observe(stage);
  const onVisibility = () => {
    if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", onVisibility);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    vis.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    pmrem.dispose();
    renderer.dispose();
  };
}
