// Brunch : quelques gourmandises en 3D, une petite scène par moitié (sucré / salé)
const THREE_URL = './assets/vendor/three.module.js';

export async function mountBrunch(el, kind) {
  const THREE = await import(THREE_URL);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const cv = renderer.domElement;
  cv.style.cssText = 'display:block;width:100%;height:100%';
  el.appendChild(cv);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene(); env.background = new THREE.Color(0x8a7f78);
  const lamp = (w, h, pos, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  lamp(8, 8, [0, 6, 0], 0xffffff); lamp(5, 4, [6, 2, 3], 0xfff4ea); lamp(4, 4, [-6, 2, 2], 0xffe6ee);
  scene.environment = pmrem.fromScene(env, 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xfff7f0, 0xcdb9a6, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-2, 6, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(2, 3, -4); scene.add(rim);

  const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.6, ...o });
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(60,30,35,.42)'); gr.addColorStop(.55, 'rgba(60,30,35,.12)'); gr.addColorStop(1, 'rgba(60,30,35,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const shadow = (w, d = w) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; return m; };
  let seed = kind === 'sucré' ? 11 : 29;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* ---------- sucré ---------- */
  const croissant = () => {
    const g = new THREE.Group(), n = 7, R = 0.52;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) * 2 - 1, a = t * 1.25, s = 0.25 * (1 - 0.58 * t * t);
      const seg = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), mat(new THREE.Color('#e3a24e').lerp(new THREE.Color('#b8661f'), 1 - Math.abs(t)), { roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.4 }));
      seg.scale.set(s * 0.95, s * 0.8, s * 1.35);
      seg.position.set(Math.sin(a) * R, s * 0.72, Math.cos(a) * R - R);
      seg.rotation.y = a + Math.PI / 2;
      g.add(seg);
    }
    g.add(shadow(1.5, 0.9)); return g;
  };
  const macaron = (shell, fill) => {
    const g = new THREE.Group();
    const half = y => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat(shell, { roughness: 0.75, sheen: 0.4 })); m.scale.y = 0.42; m.position.y = y; return m; };
    const top = half(0.2); const bot = half(0.12); bot.rotation.x = Math.PI;
    const foot = y => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.03, 10, 40), mat(new THREE.Color(shell).offsetHSL(0, -0.05, -0.05), { roughness: 0.9 })); f.rotation.x = Math.PI / 2; f.position.y = y; return f; };
    const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.07, 40), mat(fill, { roughness: 0.4 }));
    filling.position.y = 0.16;
    bot.position.y = 0.12;
    g.add(top, bot, foot(0.2), foot(0.12), filling);
    return g;
  };
  const chouquette = () => {
    const g = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(0.22, 4), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); const n = v.clone().normalize();
      v.multiplyScalar(1 + 0.04 * Math.sin(n.x * 9 + 1) * Math.sin(n.y * 8) * Math.sin(n.z * 9 + 2));
      v.y = Math.max(v.y * 0.82, -0.12); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const ball = new THREE.Mesh(geo, mat('#d9963f', { roughness: 0.5, clearcoat: 0.35 })); ball.position.y = 0.12; g.add(ball);
    const sugar = mat('#fffaf2', { roughness: 0.35 });
    for (let i = 0; i < 26; i++) {
      const th = rnd() * Math.PI * 2, ph = rnd() * 1.0, r = 0.205;
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.035), sugar);
      c.position.set(Math.sin(ph) * Math.cos(th) * r, 0.12 + Math.cos(ph) * r * 0.82, Math.sin(ph) * Math.sin(th) * r);
      c.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); g.add(c);
    }
    g.add(shadow(0.7)); return g;
  };

  /* ---------- salé ---------- */
  const quiche = () => {
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.42, 0.37, 0.2, 96, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); if (r > 0.01) { const k = 1 + 0.045 * Math.cos(Math.atan2(z, x) * 22); p.setX(i, x * k); p.setZ(i, z * k); } }
    geo.computeVertexNormals();
    const shell = new THREE.Mesh(geo, mat('#d39a4f', { roughness: 0.7 })); shell.position.y = 0.1; g.add(shell);
    const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 64), mat('#f0c95a', { roughness: 0.5, clearcoat: 0.3 }));
    filling.position.y = 0.195; g.add(filling);
    const chive = mat('#4f7a2a', { roughness: 0.5 });
    for (let i = 0; i < 14; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.3; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), chive); c.rotation.set(Math.PI / 2, 0, rnd() * 3); c.position.set(Math.cos(a) * r, 0.218, Math.sin(a) * r); g.add(c); }
    const lardon = mat('#c86b5a', { roughness: 0.6 });
    for (let i = 0; i < 6; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.26; const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), lardon); c.position.set(Math.cos(a) * r, 0.22, Math.sin(a) * r); c.rotation.y = rnd() * 3; g.add(c); }
    g.add(shadow(1.1)); return g;
  };
  const avocadoToast = () => {
    const g = new THREE.Group();
    const s = new THREE.Shape(); s.moveTo(-0.42, -0.36); s.lineTo(0.42, -0.36); s.lineTo(0.42, 0.12);
    s.absarc(0.2, 0.18, 0.23, 0, Math.PI * 0.95, false); s.absarc(-0.2, 0.18, 0.23, Math.PI * 0.05, Math.PI, false); s.lineTo(-0.42, -0.36);
    const bread = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24 }), [mat('#efd29a', { roughness: 0.9 }), mat('#a9662d', { roughness: 0.8 })]);
    bread.rotation.x = -Math.PI / 2; bread.position.y = 0.0; g.add(bread);
    const sliceShape = new THREE.Shape(); sliceShape.absarc(0, 0, 0.3, -0.75, 0.75, false); sliceShape.absarc(0.07, 0, 0.21, 0.85, -0.85, true);
    const sliceGeo = new THREE.ExtrudeGeometry(sliceShape, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 24 }); sliceGeo.translate(-0.25, 0, 0);
    const avo = [mat('#b5cf5c', { roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }), mat('#5f8226', { roughness: 0.5 })];
    for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(sliceGeo, avo); m.rotation.set(-Math.PI / 2, 0, Math.PI / 2 + (i - 2) * 0.08); m.position.set(-0.24 + i * 0.12, 0.165 + i * 0.012, 0.02); g.add(m); }
    const flake = mat('#b3261e', { roughness: 0.6 }), seedM = mat('#2a2220', { roughness: 0.5 });
    for (let i = 0; i < 22; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.012), i % 3 ? seedM : flake); c.position.set(-0.3 + rnd() * 0.6, 0.24, -0.12 + rnd() * 0.36); c.rotation.y = rnd() * 3; g.add(c); }
    g.add(shadow(1.2, 1.1)); return g;
  };
  const cheese = () => {
    const g = new THREE.Group(), a = 0.55, r = 0.62;
    const s = new THREE.Shape(); s.moveTo(0, 0); s.absarc(0, 0, r, -a / 2, a / 2, false); s.lineTo(0, 0);
    [[0.32, 0.03, 0.045], [0.47, -0.08, 0.035], [0.22, -0.03, 0.03], [0.5, 0.1, 0.03]].forEach(([x, y, rr]) => { const h = new THREE.Path(); h.absarc(x, y, rr, 0, Math.PI * 2, true); s.holes.push(h); });
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 32 });
    const m = new THREE.Mesh(geo, [mat('#f5d67a', { roughness: 0.55 }), mat('#eec65f', { roughness: 0.65 })]);
    m.rotation.x = -Math.PI / 2; m.position.set(-0.3, 0, 0); g.add(m);
    g.add(shadow(0.9, 0.7)); return g;
  };

  const items = [];
  const place = (obj, x, z, ry = 0, s = 1) => { obj.position.set(x, 0, z); obj.rotation.y = ry; obj.scale.setScalar(s); scene.add(obj); items.push(obj); };
  if (kind === 'sucré') {
    place(croissant(), -0.55, 0.15, 0.5, 1.1);
    const stack = new THREE.Group(); const m1 = macaron('#f3a9c3', '#fbf1ea'); const m2 = macaron('#c7d48a', '#f6efe2'); m2.position.y = 0.33; m2.rotation.z = 0.06; stack.add(m1, m2, shadow(0.95)); place(stack, 0.5, -0.25, 0, 1);
    const ch = new THREE.Group(); const c1 = chouquette(); const c2 = chouquette(); c2.position.set(0.36, 0, 0.12); c2.rotation.y = 2; ch.add(c1, c2); place(ch, 0.35, 0.55, 0, 0.95);
  } else {
    place(avocadoToast(), -0.45, 0.1, -0.35, 1.05);
    place(quiche(), 0.6, -0.3, 0, 1);
    place(cheese(), 0.55, 0.6, 2.3, 1);
  }

  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const fit = () => {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const vh = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), hh = vh * cam.aspect;
    const d = Math.max(1.5 / hh, 0.95 / vh);
    cam.position.set(0, d * 0.62, d * 0.8); cam.lookAt(0, 0.12, 0.05);
  };
  const ro = new ResizeObserver(fit); ro.observe(el); fit();

  let raf, visible = false;
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.05 }); io.observe(el);
  const t0 = performance.now();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden || !el.clientWidth) return;
    const t = (performance.now() - t0) / 1000;
    if (!reduced) items.forEach((o, i) => { o.position.y = 0.025 + Math.sin(t * 1.3 + i * 2.1) * 0.025; o.rotation.y += 0.0015 * (i % 2 ? -1 : 1); });
    scene.rotation.y = reduced ? 0 : Math.sin(t * 0.25) * 0.12;
    renderer.render(scene, cam);
  };
  loop();
  return { dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); cv.remove(); } };
}
