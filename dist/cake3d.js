const THREE_URL = './assets/vendor/three.module.js';
const PAL = window.cakePalette || {
  biscuit: ['#e3b978', '#4a2c1f', '#a9b26a', '#b98a5e'],
  insert: ['#b51d45', '#efa21f', '#a8652c', '#d6304a'],
  creme: ['#f7efe2', '#6b4330', '#c9a07a', '#c8cf98']
};
const FRUIT = window.cakePalette?.fruit || [['#b81f45', '#9e1638'], ['#f2b02a', '#e39a17'], ['#8a5220', '#c58a4a'], ['#7a1428', '#b81f45', '#3b1030']];
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
  const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `rgb(${c.map(f).join(',')})`;
}
const drawSponge = hex => (x, s) => {
  x.fillStyle = hex; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    const r = 0.6 + rnd() * 2.4;
    x.fillStyle = rnd() < 0.75 ? shade(hex, -0.3) : shade(hex, 0.25);
    x.globalAlpha = 0.3 + rnd() * 0.45;
    x.beginPath(); x.ellipse(rnd() * s, rnd() * s, r, r * (0.6 + rnd() * 0.6), rnd() * 3, 0, 7); x.fill();
  }
  x.globalAlpha = 1;
};
const drawCream = hex => (x, s) => {
  x.fillStyle = hex; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 600; i++) { x.fillStyle = shade(hex, rnd() < 0.5 ? -0.05 : 0.07); x.globalAlpha = 0.5; x.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 4, 1); }
  x.globalAlpha = 1;
};
const drawInsert = (hex, seeds) => (x, s) => {
  x.fillStyle = hex; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 320; i++) { x.fillStyle = shade(hex, rnd() < 0.5 ? -0.2 : 0.15); x.globalAlpha = 0.4; x.beginPath(); x.arc(rnd() * s, rnd() * s, 1 + rnd() * 4, 0, 7); x.fill(); }
  if (seeds) for (let i = 0; i < 110; i++) { x.fillStyle = shade(hex, -0.6); x.globalAlpha = 0.8; x.beginPath(); x.ellipse(rnd() * s, rnd() * s, 1.3, 0.8, rnd() * 3, 0, 7); x.fill(); }
  x.globalAlpha = 1;
};

export async function mountCake(el, recipe) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THREE = await import(THREE_URL);
  const canvasTex = draw => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    draw(c.getContext('2d'), 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
  };
  const W = () => el.clientWidth || 400, H = () => el.clientHeight || 400;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W(), H(), false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const cv = renderer.domElement;
  cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  el.appendChild(cv);

  const scene = new THREE.Scene();
  // soft studio environment for reflections (cream gloss, gold pearls, porcelain)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene(); env.background = new THREE.Color(0x8a7f78);
  const lamp = (w, h, pos, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  lamp(8, 8, [0, 6, 0], 0xffffff); lamp(5, 4, [6, 2, 3], 0xfff4ea); lamp(4, 4, [-6, 2, 2], 0xffe6ee); lamp(6, 3, [0, 1, -6], 0xf6efe8);
  scene.environment = pmrem.fromScene(env, 0.04).texture;

  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
  const camCur = { d: 7, y: 1.2 }, camTgt = { d: 7, y: 1.2 };
  const placeCam = () => { cam.position.set(0, camCur.y + camCur.d * 0.34, camCur.d * 0.94); cam.lookAt(0, camCur.y, 0); };

  scene.add(new THREE.HemisphereLight(0xfff7f0, 0xcdb9a6, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(1.2, 9, 2.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 6, bottom: -2, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe6ee, 0.5); fill.position.set(-4, 3, 2); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-1, 5, -6); scene.add(rim);
  const blobTex = (() => { const cc = document.createElement('canvas'); cc.width = cc.height = 256; const g = cc.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(60,30,35,0.55)'); gr.addColorStop(0.35, 'rgba(60,30,35,0.28)'); gr.addColorStop(0.7, 'rgba(60,30,35,0.07)'); gr.addColorStop(1, 'rgba(60,30,35,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cc); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.002;
  const blob2 = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.9 }));
  blob2.rotation.x = -Math.PI / 2; blob2.position.y = 0.003;

  // porcelain cake stand
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf7f4ef, roughness: 0.18, metalness: 0 });
  const STAND_Y = 0.66;
  const standParts = [
    [new THREE.CylinderGeometry(0.62, 0.7, 0.06, 96), 0.03],
    [new THREE.CylinderGeometry(0.11, 0.2, 0.52, 48), 0.32],
    [new THREE.CylinderGeometry(1.42, 1.36, 0.06, 128), STAND_Y - 0.03]
  ];
  standParts.forEach(([g, y]) => { const m = new THREE.Mesh(g, porcelain); m.position.y = y; m.castShadow = m.receiveShadow = true; scene.add(m); });
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.025, 12, 160), porcelain);
  rimRing.rotation.x = Math.PI / 2; rimRing.position.y = STAND_Y - 0.01; scene.add(rimRing);

  const GAP = Math.PI / 3, TS = GAP / 2, TL = Math.PI * 2 - GAP;
  const SPEC = [['b', 0.27], ['c', 0.065], ['i', 0.085], ['c', 0.065], ['b', 0.27], ['c', 0.065], ['i', 0.085], ['c', 0.065], ['b', 0.27], ['t', 0.075]];
  const ROUGH = { b: 0.92, c: 0.42, t: 0.38, i: 0.25 }, BUMP = { b: 0.015, c: 0.002, t: 0.002, i: 0.004 };
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b46a, metalness: 1, roughness: 0.22 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x6f8a55, roughness: 0.5 });

  // un jeu de textures par étage (pièce montée : chaque étage a ses saveurs)
  const base = [], texCache = {};
  const layerOf = ti => { const ls = cur.layers || [cur]; return ls[Math.min(ti, ls.length - 1)]; };
  const tierKey = ti => JSON.stringify(layerOf(ti));
  const buildTextures = () => {
    for (let ti = 0; ti < 3; ti++) {
      const l = layerOf(ti), k = tierKey(ti);
      if (!texCache[k]) {
        seed = 7; const c = canvasTex(drawCream(PAL.creme[l.creme]));
        texCache[k] = { b: canvasTex(drawSponge(PAL.biscuit[l.biscuit])), c, t: c, i: canvasTex(drawInsert(PAL.insert[l.insert], window.cakePalette ? window.cakePalette.berry[l.insert] : (l.insert === 0 || l.insert === 3))) };
      }
      base[ti] = texCache[k];
    }
  };
  const mat = (k, rx, ry, ti) => { const t = base[ti][k].clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: BUMP[k], roughness: ROUGH[k], side: THREE.DoubleSide }); };

  let cake = null, layers = [], stackH = 0, cur;
  const disposeObj = o => o.traverse(c => { if (c.isMesh) { if (c.geometry !== sphere) c.geometry.dispose(); const m = c.material; if (m && m !== gold && m !== leafMat && m !== porcelain) { m.map && m.map.dispose(); m.dispose(); } } });

  const pearls = (r, y, count, size, ti) => {
    const im = new THREE.InstancedMesh(sphere, new THREE.MeshStandardMaterial({ color: PAL.creme[layerOf(ti).creme], roughness: 0.35 }), count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(size, size, size);
    for (let i = 0; i < count; i++) { const a = TS + (i + 0.5) / count * TL; m4.compose(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r), q, sc); im.setMatrixAt(i, m4); }
    im.castShadow = true; im.userData.pearl = true; return im;
  };

  const applyMats = L => {
    [L.side, ...L.planes].forEach(m => { const mm = m.material; if (mm && mm.dispose) { mm.map && mm.map.dispose(); mm.dispose(); } });
    const K = 2.2;
    L.side.material = mat(L.k, TL * L.r * K, L.h * K, L.tier);
    L.planes.forEach(p => { p.material = mat(L.k, L.r * K, L.h * K, L.tier); });
    L.g.children.filter(c => c.userData.pearl).forEach(c => c.material.color.set(PAL.creme[layerOf(L.tier).creme]));
    if (L.deco) {
      L.deco.children.slice().forEach(c => { if (c.material !== gold && c.material !== leafMat) c.material.dispose(); L.deco.remove(c); });
      const topIns = layerOf(L.tier).insert, cols = FRUIT[topIns]; seed = 11 + topIns;
      const R = L.r, top = L.h;
      for (let i = 0; i < 11; i++) {
        const a = Math.PI + (rnd() - 0.5) * 2.2, rr = R * (0.35 + rnd() * 0.4), s = 0.055 + rnd() * 0.035;
        const m = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: cols[i % cols.length], roughness: topIns === 2 ? 0.2 : 0.4 }));
        m.scale.setScalar(s); m.position.set(Math.sin(a) * rr, top + s * 0.75, Math.cos(a) * rr); m.castShadow = true; L.deco.add(m);
      }
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + (rnd() - 0.5) * 2.6, rr = R * (0.3 + rnd() * 0.5), s = 0.03 + rnd() * 0.025;
        const m = new THREE.Mesh(sphere, gold); m.scale.setScalar(s); m.position.set(Math.sin(a) * rr, top + s, Math.cos(a) * rr); m.castShadow = true; L.deco.add(m);
      }
      for (let i = 0; i < 4; i++) {
        const a = Math.PI + (rnd() - 0.5) * 1.6, rr = R * (0.45 + rnd() * 0.25);
        const m = new THREE.Mesh(sphere, leafMat); m.scale.set(0.09, 0.012, 0.04); m.position.set(Math.sin(a) * rr, top + 0.03, Math.cos(a) * rr);
        m.rotation.set(rnd() * 0.5, rnd() * 3, rnd() * 0.4); m.castShadow = true; L.deco.add(m);
      }
    }
    L.matKey = tierKey(L.tier);
  };

  const build = tiers => {
    if (cake) { scene.remove(cake); disposeObj(cake); }
    cake = new THREE.Group(); cake.position.y = STAND_Y; scene.add(cake);
    const radii = [[1], [1, 0.7], [1, 0.74, 0.5]][tiers - 1];
    const hf = [[1], [1, 0.88], [1, 0.88, 0.78]][tiers - 1];
    layers = []; let y = 0;
    radii.forEach((R, ti) => {
      SPEC.forEach(([k, h0], li) => {
        const h = h0 * hf[ti];
        const r = (k === 'c' || k === 't' ? 1.012 : k === 'i' ? 0.985 : 1.0) * R;
        const L = { k, h, r, base: y, off: reduced ? 0 : 6, tier: ti };
        const g = new THREE.Group();
        const side = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 128, 1, false, TS, TL));
        side.position.y = h / 2; side.castShadow = side.receiveShadow = true; g.add(side);
        L.planes = [TS, TS + TL].map(th => {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(r, h));
          p.position.set(Math.sin(th) * r / 2, h / 2, Math.cos(th) * r / 2); p.rotation.y = th - Math.PI / 2;
          p.castShadow = p.receiveShadow = true; g.add(p); return p;
        });
        if (li === 0) g.add(pearls(R * 1.0, 0.03 * R + 0.005, Math.round(46 * R), 0.034 * Math.max(0.75, R), ti));
        if (k === 't') g.add(pearls(R * 0.98, h + 0.02, Math.round(40 * R), 0.028 * Math.max(0.75, R), ti));
        if (k === 't' && ti === radii.length - 1) { L.deco = new THREE.Group(); g.add(L.deco); }
        L.g = g; L.side = side; g.position.y = y + (reduced ? 0 : 6); cake.add(g);
        layers.push(L); y += h;
      });
    });
    stackH = y;
    layers.forEach(applyMats);
    const Ht = STAND_Y + stackH + 0.25;
    const a = W() / H();
    const dV = (Ht + 0.8) / 0.4986, dH = 3.3 / (0.4986 * a);
    camTgt.d = Math.max(dV, dH); camTgt.y = Ht * 0.5;
  };

  cur = { ...recipe, tiers: recipe.tiers || 1, key: JSON.stringify(recipe) };
  buildTextures(); build(cur.tiers);
  camCur.d = camTgt.d; camCur.y = camTgt.y; cam.aspect = W() / H(); cam.updateProjectionMatrix(); placeCam();

  const now = () => performance.now() / 1000;
  const easeIn = p => p * p * p, easeOut = p => 1 - Math.pow(1 - p, 3);
  const assemble = withOut => {
    if (reduced) { layers.forEach(L => { applyMats(L); L.off = 0; L.g.position.y = L.base; }); return; }
    const moving = withOut ? layers.filter(L => L.matKey !== tierKey(L.tier)) : layers;
    const t = now(), n = moving.length, step = n > 12 ? 0.025 : 0.045, outDur = withOut ? 0.18 : 0;
    moving.forEach((L, i) => {
      L.o0 = L.off;
      L.outS = t + (withOut ? (n - 1 - i) * 0.02 : 0); L.outE = L.outS + outDur;
      L.inS = t + outDur + (withOut ? n * 0.01 : 0) + 0.04 + i * step; L.inE = L.inS + 0.42;
    });
  };
  const updateLayer = (L, t) => {
    if (L.outS == null) return;
    if (t < L.outS) L.off = L.o0;
    else if (t < L.outE) L.off = L.o0 + (6 - L.o0) * easeIn((t - L.outS) / (L.outE - L.outS));
    else if (t < L.inS) L.off = 6;
    else if (t < L.inE) { if (L.matKey !== tierKey(L.tier)) applyMats(L); L.off = 6 * (1 - easeOut((t - L.inS) / (L.inE - L.inS))); }
    else { if (L.matKey !== tierKey(L.tier)) applyMats(L); L.off = 0; }
    if (L.off >= 5.99 && L.matKey !== tierKey(L.tier)) applyMats(L);
    L.g.position.y = L.base + L.off;
    const q = (t - L.inE) / 0.22;
    const sq = q > 0 && q < 1 ? Math.sin(q * Math.PI) * 0.05 : 0;
    L.g.scale.set(1 + sq * 0.4, 1 - sq, 1 + sq * 0.4);
  };

  let started = false, visible = false, userRot = 0, dragX = null;
  cv.addEventListener('pointerdown', e => { dragX = e.clientX; cv.style.cursor = 'grabbing'; });
  window.addEventListener('pointermove', e => { if (dragX == null) return; userRot += (e.clientX - dragX) * 0.01; dragX = e.clientX; });
  window.addEventListener('pointerup', () => { dragX = null; cv.style.cursor = 'grab'; });
  const fit = () => {
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      renderer.setSize(el.clientWidth, el.clientHeight, false);
      cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix();
      const Ht = STAND_Y + stackH + 0.25;
      camTgt.d = Math.max((Ht + 0.8) / 0.4986, 3.3 / (0.4986 * cam.aspect));
    }
  };
  const setVisibility = value => {
    visible = value;
    if (visible) fit();
    if (visible && !started) { started = true; assemble(false); }
  };
  const io = new IntersectionObserver(es => setVisibility(es[0].isIntersecting), { threshold: 0.25 });
  io.observe(el);
  const ro = new ResizeObserver(fit); ro.observe(el);
  let raf, visibilityCheckAt = 0, spin = 0, lastT = now();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const t = now();
    if (t >= visibilityCheckAt) {
      const rect = el.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      if (inView !== visible || (inView && !started)) setVisibility(inView);
      visibilityCheckAt = t + .25;
    }
    if (!visible || document.hidden) return;
    if (cv.width !== Math.round(el.clientWidth * renderer.getPixelRatio())) fit();
    layers.forEach(L => updateLayer(L, t));
    camCur.d += (camTgt.d - camCur.d) * 0.06; camCur.y += (camTgt.y - camCur.y) * 0.06; placeCam();
    if (!reduced && dragX == null) spin += Math.min(t - lastT, 0.05) * 0.3;
    lastT = t;
    if (cake) cake.rotation.y = -0.42 + spin + userRot;
    renderer.render(scene, cam);
  };
  loop();

  return {
    set(rec) {
      const k = JSON.stringify(rec);
      if (k === cur.key) return;
      const tiersChanged = (rec.tiers || 1) !== cur.tiers;
      cur = { ...rec, tiers: rec.tiers || 1, key: k }; buildTextures();
      if (tiersChanged) { build(cur.tiers); fit(); if (started) assemble(false); }
      else if (started) assemble(true);
    },
    dispose() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); if (cake) disposeObj(cake); renderer.dispose(); cv.remove(); }
  };
}

