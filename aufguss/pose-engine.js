// Pose engine: a 2D figure defined by absolute segment angles (degrees, 0 = right, 90 = up).
// The same definition drives still drawings and (Phase 2) interpolated transitions.
(function (root) {
  const SEG = { torso: 50, neck: 9, head: 11.5, upper: 28, fore: 26, thigh: 44, shin: 42, foot: 13 };
  const FLOOR = 0; // joints rest one limb-radius above the drawn floor line (model y = -5)
  const rad = d => d * Math.PI / 180;
  const step = (p, ang, len) => ({ x: p.x + Math.cos(rad(ang)) * len, y: p.y + Math.sin(rad(ang)) * len });

  // defaults so pose definitions stay short
  const DEFAULT = { view: "side", t: 90, bend: 0, h: 90, aN: [-90, -90], aF: [-90, -90], lN: [-90, -90, 0], lF: [-90, -90, 0] };

  function full(p) { return Object.assign({}, DEFAULT, p); }

  function compute(pose, opt) {
    const p = full(pose);
    const HR = (opt && opt.head) || SEG.head;
    const width = p.view === "front" ? 1 : 0; // front view spreads shoulders and hips
    const w = p.width != null ? p.width : width;
    const hip = { x: 0, y: 0 };
    const sh = step(hip, p.t, SEG.torso);
    // perpendicular to torso, used for shoulder/hip spread in front view
    const perp = rad(p.t - 90);
    const off = (pt, d) => ({ x: pt.x + Math.cos(perp) * d, y: pt.y + Math.sin(perp) * d });
    const shN = off(sh, 12 * w), shF = off(sh, -12 * w);
    const hipN = off(hip, 7 * w), hipF = off(hip, -7 * w);
    const neck = step(sh, p.h, SEG.neck);
    const head = step(sh, p.h, SEG.neck + HR);
    const arm = (s, a) => { const e = step(s, a[0], SEG.upper); return [s, e, step(e, a[1], SEG.fore)]; };
    const leg = (h, l) => { const k = step(h, l[0], SEG.thigh); const an = step(k, l[1], SEG.shin); return [h, k, an, step(an, l[2], SEG.foot)]; };
    const J = { hip, sh, neck, head, hAng: p.h, armN: arm(shN, p.aN), armF: arm(shF, p.aF), legN: leg(hipN, p.lN), legF: leg(hipF, p.lF), bend: p.bend, t: p.t, w };
    // spine curve control point (positive bend bulges the front of the body)
    const mid = { x: (hip.x + sh.x) / 2, y: (hip.y + sh.y) / 2 };
    J.spineC = step(mid, p.t - 90, p.bend);
    // put the lowest point on the floor
    const pts = [hip, sh, ...J.armN, ...J.armF, ...J.legN, ...J.legF];
    let minY = Math.min(...pts.map(q => q.y), head.y - HR + 5); // head circle rests on the floor line
    const dy = FLOOR - minY + (pose.lift || 0);
    const all = [hip, sh, neck, head, J.spineC, ...J.armN, ...J.armF, ...J.legN, ...J.legF];
    // shoulder/hip offsets are separate objects inside the arrays; dedupe before shifting
    const seen = new Set();
    for (const q of all) { if (seen.has(q)) continue; seen.add(q); q.y += dy; }
    return J;
  }

  function bounds(J, HR) {
    HR = HR || SEG.head;
    const pts = [J.hip, J.sh, ...J.armN, ...J.armF, ...J.legN, ...J.legF];
    const xs = pts.map(p => p.x).concat([J.head.x - HR, J.head.x + HR]);
    const ys = pts.map(p => p.y).concat([J.head.y + HR]);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  }

  // shortest-path angle interpolation
  function lerpAng(a, b, t) { let d = ((b - a + 540) % 360) - 180; return a + d * t; }
  function lerp(a, b, t) {
    a = full(a); b = full(b);
    const L = (x, y) => x + (y - x) * t;
    const arr = (x, y) => x.map((v, i) => lerpAng(v, y[i], t));
    const wa = a.view === "front" ? 1 : 0, wb = b.view === "front" ? 1 : 0;
    return { view: "side", width: L(a.width != null ? a.width : wa, b.width != null ? b.width : wb), t: lerpAng(a.t, b.t, t), bend: L(a.bend, b.bend), h: lerpAng(a.h, b.h, t),
      aN: arr(a.aN, b.aN), aF: arr(a.aF, b.aF), lN: arr(a.lN, b.lN), lF: arr(a.lF, b.lF), lift: L(a.lift || 0, b.lift || 0) };
  }

  // SVG markup. Model y is up; SVG y is down. Fixed scale so all poses share one size.
  const VB = { w: 260, h: 230, floor: 210 };
  // Styles: "stick" (default line figure) and two mascot looks, "bean" and "cat".
  const STYLES = {
    stick: { head: SEG.head, arm: 8, leg: 10, torso: 15, torsoFront: 22, neck: 7,
      near: "var(--fig, #1d2b25)", far: "var(--fig-far, #8aa198)" },
    bean: { head: 15, arm: 11, leg: 13, torso: 24, torsoFront: 30, neck: 10, face: true,
      near: "var(--m-body, #5c9a82)", far: "var(--m-far, #a8ccbd)" },
    cat: { head: 18, arm: 13, leg: 15, torso: 30, torsoFront: 38, neck: 12, cat: true, line: "var(--cat-line, #24170f)", lw: 2.2,
      near: "var(--cat-body, #f2a157)", far: "var(--cat-shade, #de8a45)" },
  };
  // Animal kits: the same skeleton in different costumes. Everything not set falls back to the cat.
  const KITS = {
    cat: { ears: "point", muzzle: "cat", tail: "curl", ink: "var(--cat-ink, #5a3420)", cream: "var(--cat-cream, #fde4b8)", inner: "var(--cat-pink, #f3a3a0)",
      cheek: "var(--cat-cheek, #f2867f)", tailC: "var(--cat-tail, #d97c36)" },
    // strong but stiff
    bear: { body: "#a0704a", shade: "#875c3a", cream: "#ecd3ad", inner: "#c99b74", tailC: "#875c3a", ears: "round", muzzle: "round", tail: "stub" },
    bison: { body: "#7a5238", shade: "#64422c", cream: "#c49a72", tailC: "#5a3a26", hornC: "#efe3c8", ears: "horn", muzzle: "round", noseBig: 1.4, tail: "stub", headC: "#5e3e29" },
    gorilla: { body: "#55555e", shade: "#46464e", cream: "#a39a96", inner: "#a39a96", ears: "round", earSize: 0.24, earAng: 80, muzzle: "round", noseBig: 1.6, tail: "none" },
    // flexible, less strong
    octopus: { body: "#e9788f", shade: "#d0647b", cream: "#f8c4cf", ears: "none", muzzle: "none", tail: "none", belly: false, suckers: "#fbd5dc", headSpots: "#f39fb0" },
    seal: { body: "#97a3ae", shade: "#808c97", cream: "#d5dce2", ears: "none", muzzle: "round", noseBig: 1.5, tail: "flat", tailC: "#808c97", whiskers: true },
    // strong and flexible
    tiger: { body: "#f28d33", shade: "#da7a25", cream: "#fff2df", stripes: "#3a2414", tail: "ringed", tailC: "#f28d33", ringC: "#3a2414" },
    panther: { body: "#3d3843", shade: "#2f2b34", cream: "#5c5563", inner: "#7a6a80", ink: "#1c1a20", eyeC: "#f2cf5b", cheeks: false, tailC: "#3d3843", line: "#141216" },
    dolphin: { body: "#82acd0", shade: "#6c97bb", cream: "#e3edf5", ears: "none", muzzle: "bottle", tail: "fluke", fin: true },
    // steady balance
    heron: { body: "#9eafbf", shade: "#8798a8", cream: "#f2f4f6", headC: "#eef1f4", ears: "none", muzzle: "beak", beakC: "#e8b44a", crest: "#2c2c30", tail: "feathers", tailC: "#8798a8", legs: "#c9a04a", legsFar: "#b38c3c", cheeks: false },
    flamingo: { body: "#f59bb2", shade: "#e3839b", cream: "#fcd6e0", ears: "none", muzzle: "beak", beakC: "#f6efe6", beakTip: "#2a2226", beakLen: 1.7, tail: "feathers", tailC: "#e3839b", legs: "#e7798f", legsFar: "#d2687e" },
    crane: { body: "#ecedf0", shade: "#d5d6db", cream: "#ffffff", ears: "none", muzzle: "beak", beakC: "#a5ad74", cap: "#d63a40", tail: "feathers", tailC: "#2e2e33", legs: "#3e3e44", legsFar: "#333338", cheeks: false },
    // all-rounder
    fox: { body: "#ea762e", shade: "#d1641f", cream: "#fff5e8", ears: "point", earSize: 1.25, muzzle: "long", tail: "bush", tailC: "#ea762e", tailTip: "#fff5e8" },
    wolf: { body: "#8f959e", shade: "#7a818a", cream: "#e7e9ec", inner: "#c9b9bd", ears: "point", earSize: 1.15, muzzle: "long", tail: "bush", tailC: "#7a818a" },
    otter: { body: "#8c5c3d", shade: "#774d31", cream: "#dcbb94", inner: "#b48a68", ears: "round", earSize: 0.22, earAng: 70, muzzle: "round", noseBig: 1.3, tail: "flat", tailC: "#774d31", whiskers: true },
    // gentle start
    panda: { body: "#f7f7f3", shade: "#e4e4de", cream: "#ffffff", belly: false, limbs: "#2c2c30", earC: "#2c2c30", inner: "#46464c", eyePatch: "#2c2c30", eyeC: "#ffffff", ears: "round", muzzle: "round", tail: "stub", tailC: "#f7f7f3" },
    koala: { body: "#a6aab0", shade: "#91969c", cream: "#e8eaed", inner: "#f4e6e8", ears: "round", earSize: 0.56, earAng: 58, muzzle: "round", noseBig: 2.6, tail: "none" },
    turtle: { body: "#93c26d", shade: "#7eac5a", cream: "#ece6b4", ears: "none", muzzle: "none", tail: "stub", tailC: "#7eac5a", shell: "#73552f", shellInner: "#8e6c3f" },
  };
  function svgInner(pose, o) {
    o = o || {};
    const S = STYLES[o.style] || STYLES.stick;
    const J = compute(pose, { head: S.head });
    const b = bounds(J, S.head);
    const cx = VB.w / 2 - (b.minX + b.maxX) / 2;
    const X = p => (p.x + cx).toFixed(1), Y = p => (VB.floor - p.y).toFixed(1);
    const line = pts => pts.map((p, i) => (i ? "L" : "M") + X(p) + " " + Y(p)).join(" ");
    const front = J.w > 0.5;
    const K = Object.assign({}, KITS.cat, S.cat ? KITS[o.animal] || {} : {});
    const nearC = (S.cat && K.body) || S.near, farC = front ? nearC : (S.cat && K.shade) || S.far;
    const plain = (pts, c, sw) => `<path d="${line(pts)}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // contour: the same shape drawn a little wider in the line colour underneath, so every arm and leg reads clearly
    const limb = (pts, c, sw) => (S.line ? plain(pts, S.line, sw + 2 * S.lw) : "") + plain(pts, c, sw);
    const tw = front ? S.torsoFront : S.torso, tpath = `M${X(J.hip)} ${Y(J.hip)} Q${X(J.spineC)} ${Y(J.spineC)} ${X(J.sh)} ${Y(J.sh)}`;
    const torso = (S.line ? `<path d="${tpath}" fill="none" stroke="${S.line}" stroke-width="${tw + 2 * S.lw}" stroke-linecap="round"/>` : "") + `<path d="${tpath}" fill="none" stroke="${nearC}" stroke-width="${tw}" stroke-linecap="round"/>`;
    const neck = plain([J.sh, J.neck], nearC, S.neck);
    const r = S.head, c = J.head, hA = J.hAng;
    const at = (base, ang, d) => step(base, ang, d);
    let ears = "", face = "", tail = "";
    if (S.ears && !S.cat) {
      const ear = s => { const a = at(c, hA + 30 * s, r * 0.95), b2 = at(c, hA + 62 * s, r * 0.95), tip = at(c, hA + 40 * s, r * 1.55);
        return `<path d="M${X(a)} ${Y(a)} L${X(tip)} ${Y(tip)} L${X(b2)} ${Y(b2)} Z" fill="${nearC}" stroke="${nearC}" stroke-width="3" stroke-linejoin="round"/>`; };
      ears = ear(1) + ear(-1);
    }
    if (S.tail && !S.cat && !front) {
      const t0 = J.hip, t1 = at(J.hip, J.t + 120, 30), t2 = at(J.hip, J.t + 70, 36);
      tail = `<path d="M${X(t0)} ${Y(t0)} Q${X(t1)} ${Y(t1)} ${X(t2)} ${Y(t2)}" fill="none" stroke="${farC}" stroke-width="7" stroke-linecap="round"/>`;
    }
    if (S.face) {
      const ink = "var(--m-face, #2b211b)", blush = "var(--m-blush, #f08a8a)";
      const dot = (p, rr, col) => `<circle cx="${X(p)}" cy="${Y(p)}" r="${rr}" fill="${col}"/>`;
      if (front) {
        const fwd = hA - 90;
        [1, -1].forEach(sg => {
          face += dot(at(at(c, fwd, r * 0.38 * sg), hA, r * 0.12), 2.1, ink);
          face += `<ellipse cx="${X(at(at(c, fwd, r * 0.55 * sg), hA, -r * 0.22))}" cy="${Y(at(at(c, fwd, r * 0.55 * sg), hA, -r * 0.22))}" rx="3" ry="1.8" fill="${blush}" opacity=".8"/>`;
        });
        const m0 = at(at(c, hA, -r * 0.3), fwd, -r * 0.14), m1 = at(at(c, hA, -r * 0.3), fwd, r * 0.14), mc = at(c, hA, -r * 0.45);
        face += `<path d="M${X(m0)} ${Y(m0)} Q${X(mc)} ${Y(mc)} ${X(m1)} ${Y(m1)}" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`;
      } else {
        const fwd = hA - 90; // the way the face points in profile
        face += dot(at(at(c, fwd, r * 0.5), hA, r * 0.12), 2.2, ink);
        face += `<ellipse cx="${X(at(at(c, fwd, r * 0.36), hA, -r * 0.3))}" cy="${Y(at(at(c, fwd, r * 0.36), hA, -r * 0.3))}" rx="3.2" ry="2" fill="${blush}" opacity=".8"/>`;
      }
    }
    let belly = "", shadow = "", marks = "", front2 = "", front2b = "";
    let armNC = nearC, armFC = farC, legNC = nearC, legFC = farC, headC = nearC;
    if (S.cat) {
      const ink = K.ink, cream = K.cream, pink = K.inner, cheek = K.cheek, tailC = K.tailC;
      if (K.headC) headC = K.headC;
      if (K.limbs) { armNC = legNC = K.limbs; armFC = legFC = K.limbsFar || K.limbs; }
      if (K.legs) { legNC = K.legs; legFC = K.legsFar || K.legs; }
      const ell = (p, rx, ry, ang, fill, extra) => `<ellipse cx="${X(p)}" cy="${Y(p)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}" transform="rotate(${(-ang).toFixed(1)} ${X(p)} ${Y(p)})"${extra || ""}/>`;
      const circ = (q, rr, f, st) => `<circle cx="${X(q)}" cy="${Y(q)}" r="${rr.toFixed(1)}" fill="${f}"${st ? ` stroke="${S.line}" stroke-width="${S.lw}"` : ""}/>`;
      const tri = (A, B, C, f, sw) => `<path d="M${X(A)} ${Y(A)} L${X(B)} ${Y(B)} L${X(C)} ${Y(C)} Z" fill="${f}" stroke="${f}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      const curve = (pts, col, w) => { const d = `M${X(pts[0])} ${Y(pts[0])} ` + (pts.length === 4 ? `C${X(pts[1])} ${Y(pts[1])} ${X(pts[2])} ${Y(pts[2])} ${X(pts[3])} ${Y(pts[3])}` : `Q${X(pts[1])} ${Y(pts[1])} ${X(pts[2])} ${Y(pts[2])}`);
        return `<path d="${d}" fill="none" stroke="${S.line}" stroke-width="${w + 2 * S.lw}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
      const earC = K.earC || headC;
      // ears
      if (K.ears === "point") {
        const ear = sg => {
          const sz = K.earSize || 1;
          const a = at(c, hA + 18 * sg, r * 0.92), b2 = at(c, hA + 58 * sg, r * 0.92), tip = at(c, hA + 36 * sg, r * (0.92 + 0.58 * sz));
          const cen = { x: (a.x + b2.x + tip.x) / 3, y: (a.y + b2.y + tip.y) / 3 };
          const sh2 = q => ({ x: cen.x + (q.x - cen.x) * 0.5, y: cen.y + (q.y - cen.y) * 0.5 + 0 });
          return (S.line ? tri(a, tip, b2, S.line, 5 + 2 * S.lw) : "") + tri(a, tip, b2, earC, 5) + tri(sh2(a), sh2(tip), sh2(b2), pink, 2);
        };
        ears = ear(1) + ear(-1);
      } else if (K.ears === "round") {
        const ear = sg => { const q = at(c, hA + (K.earAng || 42) * sg, r * 0.95), rr = r * (K.earSize || 0.36);
          return circ(q, rr, earC, true) + circ(q, rr * 0.55, pink); };
        ears = ear(1) + ear(-1);
      } else if (K.ears === "horn") {
        const horn = sg => { const a = at(c, hA + 62 * sg, r * 0.85), m = at(c, hA + 78 * sg, r * 1.45), t = at(c, hA + 40 * sg, r * 1.55);
          return curve([a, m, t], K.hornC, 4.5); };
        ears = horn(1) + horn(-1) + (front ? "" : "");
      }
      // tail
      const tailPts = (len) => front ? [J.hip, at(J.hip, -40, 24 * len), at(J.hip, -5, 40 * len), at(J.hip, 25, 44 * len)]
                                     : [J.hip, at(J.hip, J.t + 150, 22 * len), at(J.hip, J.t + 118, 38 * len), at(J.hip, J.t + 82, 40 * len)];
      if (K.tail === "curl" || K.tail === "bush" || K.tail === "ringed") {
        const tp = tailPts(K.tailLen || 1);
        if (Math.min(...tp.slice(1).map(q => q.y)) > 3) {
          tail = curve(tp, tailC, K.tail === "bush" ? 13 : 9);
          if (K.tailTip) tail += circ(tp[3], (K.tail === "bush" ? 13 : 9) / 2 + 0.6, K.tailTip);
          if (K.tail === "ringed") [0.45, 0.7].forEach(f => { const q = { x: tp[1].x + (tp[2].x - tp[1].x) * f, y: tp[1].y + (tp[2].y - tp[1].y) * f }; tail += circ(q, 4.6, K.ringC || ink); });
        }
      } else if (K.tail === "stub") {
        const q = front ? at(J.hip, -60, 9) : at(J.hip, J.t + 140, 10);
        if (!front) tail = circ(q, 6, tailC, true);
      } else if (K.tail === "flat") { // otter, seal: thick and straight-ish
        const tp = front ? [] : [J.hip, at(J.hip, J.t + 165, 16), at(J.hip, J.t + 175, 32)];
        if (tp.length && Math.min(...tp.slice(1).map(q => q.y)) > 3) tail = curve(tp, tailC, 11);
      } else if (K.tail === "fluke") { // dolphin
        if (!front) { const e = at(J.hip, J.t + 168, 26), m = at(J.hip, J.t + 160, 13);
          if (e.y > 3) { tail = curve([J.hip, m, e], headC, 9); const f1 = at(e, J.t + 100, 11), f2 = at(e, J.t - 80, 11), f0 = at(e, J.t + 168, 6);
            tail += `<path d="M${X(f1)} ${Y(f1)} Q${X(f0)} ${Y(f0)} ${X(f2)} ${Y(f2)} Q${X(e)} ${Y(e)} ${X(f1)} ${Y(f1)} Z" fill="${headC}" stroke="${S.line}" stroke-width="${S.lw}" stroke-linejoin="round"/>`; } }
      } else if (K.tail === "feathers") { // birds: short fan of tail feathers
        if (!front) { const a = at(J.hip, J.t + 160, 8); [-14, 0, 14].forEach(d => { tail += curve([J.hip, a, at(J.hip, J.t + 168 + d, 22)], tailC, 6); }); }
      }
      // belly patch on the front of the torso
      const mid = { x: (J.hip.x + J.sh.x) / 2, y: (J.hip.y + J.sh.y) / 2 };
      const tl = Math.hypot(J.sh.x - J.hip.x, J.sh.y - J.hip.y);
      if (K.belly !== false) {
        if (front) belly = ell(at(mid, J.t, -4), tl * 0.36 * (K.bellyW || 1), S.torsoFront * 0.3 * (K.bellyW || 1), J.t, cream);
        else {
          const bc = { x: (mid.x + J.spineC.x) / 2, y: (mid.y + J.spineC.y) / 2 };
          belly = ell(at(bc, J.t - 90, S.torso * 0.2), tl * 0.38, S.torso * 0.24, J.t, cream);
        }
      }
      // back details: stripes, shell, hump, fin
      if (K.stripes) {
        const n = 3; for (let i = 0; i < n; i++) { const f = 0.3 + i * 0.2, q = { x: J.hip.x + (J.sh.x - J.hip.x) * f, y: J.hip.y + (J.sh.y - J.hip.y) * f };
          const back = front ? [at(q, J.t - 90, S.torsoFront * 0.48), at(q, J.t - 90, S.torsoFront * 0.3)] : [at(q, J.t + 90, S.torso * 0.48), at(q, J.t + 90, S.torso * 0.22)];
          marks += `<path d="M${X(back[0])} ${Y(back[0])} L${X(back[1])} ${Y(back[1])}" stroke="${K.stripes}" stroke-width="3.2" stroke-linecap="round"/>`;
          if (front) { const o2 = [at(q, J.t + 90, S.torsoFront * 0.48), at(q, J.t + 90, S.torsoFront * 0.3)]; marks += `<path d="M${X(o2[0])} ${Y(o2[0])} L${X(o2[1])} ${Y(o2[1])}" stroke="${K.stripes}" stroke-width="3.2" stroke-linecap="round"/>`; }
        }
      }
      if (K.shell && !front) {
        const sc = at({ x: (mid.x * 2 + J.spineC.x) / 3, y: (mid.y * 2 + J.spineC.y) / 3 }, J.t + 90, S.torso * 0.42);
        marks += ell(sc, tl * 0.62, S.torso * 0.5, J.t, K.shell, ` stroke="${S.line}" stroke-width="${S.lw}"`);
        marks += ell(sc, tl * 0.32, S.torso * 0.24, J.t, K.shellInner || K.shell, ' opacity=".9"');
      }
      if (K.hump && !front) { const q = at(J.sh, J.t + 120, S.torso * 0.32); marks += circ(q, S.torso * 0.45, K.hump, true); }
      if (K.fin && !front) { const b0 = at(mid, J.t + 90, S.torso * 0.45), a1 = at(b0, J.t + 20, 8), tip = at(b0, J.t + 130, 18), a2 = at(b0, J.t + 200, 6);
        marks += `<path d="M${X(a1)} ${Y(a1)} Q${X(tip)} ${Y(tip)} ${X(a2)} ${Y(a2)} Z" fill="${headC}" stroke="${S.line}" stroke-width="${S.lw}" stroke-linejoin="round"/>`; }
      if (K.suckers) [J.armN, J.legN].concat(front ? [J.armF, J.legF] : []).forEach(L => {
        const a = L[L.length === 4 ? 1 : 1], b3 = L[L.length === 4 ? 2 : 2];
        [0.3, 0.55, 0.8].forEach(f => { const q = { x: a.x + (b3.x - a.x) * f, y: a.y + (b3.y - a.y) * f }; front2b += circ(q, 2.3, K.suckers); });
      });
      // face
      const fwd = hA - 90;
      const P = (f, u) => at(at(c, fwd, r * f), hA, r * u);
      const eye = q => `<circle cx="${X(q)}" cy="${Y(q)}" r="${(r * 0.13).toFixed(1)}" fill="${K.eyeC || ink}"/>`;
      const patch = q => K.eyePatch ? ell(q, r * 0.24, r * 0.3, hA + (front ? 0 : 0), K.eyePatch) : "";
      if (front) {
        if (K.mask) face += ell(P(0, 0.05), r * 0.85, r * 0.3, fwd, K.mask);
        face += patch(P(0.4, 0.04)) + patch(P(-0.4, 0.04));
        face += eye(P(0.4, 0.08)) + eye(P(-0.4, 0.08));
        if (K.cheeks !== false) face += ell(P(0.62, -0.22), r * 0.17, r * 0.11, 0, cheek, ' opacity=".85"') + ell(P(-0.62, -0.22), r * 0.17, r * 0.11, 0, cheek, ' opacity=".85"');
        if (K.muzzle === "beak") {
          face += `<path d="M${X(P(-0.24, -0.1))} ${Y(P(-0.24, -0.1))} L${X(P(0.24, -0.1))} ${Y(P(0.24, -0.1))} L${X(P(0, -0.82))} ${Y(P(0, -0.82))} Z" fill="${K.beakC}" stroke="${S.line}" stroke-width="${S.lw * 0.8}" stroke-linejoin="round"/>`;
          if (K.beakTip) face += tri(P(-0.08, -0.6), P(0.08, -0.6), P(0, -0.82), K.beakTip, 1);
        } else if (K.muzzle === "none") {
          const a = P(-0.16, -0.38), mc = P(0, -0.5), b2 = P(0.16, -0.38);
          face += `<path d="M${X(a)} ${Y(a)} Q${X(mc)} ${Y(mc)} ${X(b2)} ${Y(b2)}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
        } else {
          const big = K.muzzle === "round" ? 1.15 : 1;
          if (K.muzzle === "long") face += ell(P(0, -0.4), r * 0.3, r * 0.38, fwd, cream);
          else if (K.muzzle === "bottle") face += ell(P(0, -0.42), r * 0.34, r * 0.3, fwd, cream, ` stroke="${S.line}" stroke-width="${S.lw * 0.7}"`);
          else face += ell(P(0, -0.34), r * 0.36 * big, r * 0.27 * big, fwd, cream);
          face += ell(P(0, -0.2), r * 0.09 * (K.noseBig || 1), r * 0.065 * (K.noseBig || 1), fwd, ink);
          const m = (s1) => { const a = P(0, -0.3), b2 = P(0.2 * s1, -0.4), mc = P(0.1 * s1, -0.5); return `<path d="M${X(a)} ${Y(a)} Q${X(mc)} ${Y(mc)} ${X(b2)} ${Y(b2)}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`; };
          face += m(1) + m(-1);
        }
      } else {
        if (K.mask) face += ell(P(0.45, 0.08), r * 0.45, r * 0.28, fwd, K.mask);
        face += patch(P(0.42, 0.06));
        face += eye(P(0.42, 0.1));
        if (K.cheeks !== false) face += ell(P(0.22, -0.3), r * 0.17, r * 0.11, fwd, cheek, ' opacity=".85"');
        if (K.muzzle === "beak") {
          const len = K.beakLen || 1.9;
          face += `<path d="M${X(P(0.78, 0.08))} ${Y(P(0.78, 0.08))} L${X(P(len, -0.12))} ${Y(P(len, -0.12))} L${X(P(0.8, -0.32))} ${Y(P(0.8, -0.32))} Z" fill="${K.beakC}" stroke="${S.line}" stroke-width="${S.lw * 0.8}" stroke-linejoin="round"/>`;
          if (K.beakTip) face += `<path d="M${X(P(len - 0.45, -0.02))} ${Y(P(len - 0.45, -0.02))} L${X(P(len, -0.12))} ${Y(P(len, -0.12))} L${X(P(len - 0.4, -0.24))} ${Y(P(len - 0.4, -0.24))} Z" fill="${K.beakTip}"/>`;
        } else if (K.muzzle === "long" || K.muzzle === "bottle") {
          const L = K.muzzle === "bottle" ? 1.25 : 1.1;
          face += `<path d="M${X(P(0.6, 0.05))} ${Y(P(0.6, 0.05))} Q${X(P(L, -0.05))} ${Y(P(L, -0.05))} ${X(P(L + 0.12, -0.3))} ${Y(P(L + 0.12, -0.3))} Q${X(P(0.8, -0.55))} ${Y(P(0.8, -0.55))} ${X(P(0.45, -0.5))} ${Y(P(0.45, -0.5))} Z" fill="${K.muzzle === "bottle" ? headC : cream}" stroke="${S.line}" stroke-width="${S.lw * 0.8}" stroke-linejoin="round"/>`;
          if (K.muzzle === "long") face += ell(P(L + 0.08, -0.22), r * 0.1, r * 0.08, fwd, ink);
          const a = P(L - 0.05, -0.4), b2 = P(0.7, -0.44);
          face += `<path d="M${X(a)} ${Y(a)} L${X(b2)} ${Y(b2)}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round"/>`;
        } else if (K.muzzle === "none") {
          const a = P(0.95, -0.36), mc = P(0.86, -0.5), b2 = P(0.72, -0.4);
          face += `<path d="M${X(a)} ${Y(a)} Q${X(mc)} ${Y(mc)} ${X(b2)} ${Y(b2)}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
        } else {
          const big = K.muzzle === "round" ? 1.15 : 1;
          face += ell(P(0.74, -0.3), r * 0.3 * big, r * 0.24 * big, fwd, cream);
          face += ell(P(0.98, -0.2), r * 0.08 * (K.noseBig || 1), r * 0.065 * (K.noseBig || 1), fwd, ink);
          const a = P(0.95, -0.36), mc = P(0.86, -0.5), b2 = P(0.72, -0.4);
          face += `<path d="M${X(a)} ${Y(a)} Q${X(mc)} ${Y(mc)} ${X(b2)} ${Y(b2)}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
        }
      }
      if (K.headSpots) [[34, 0.55, 0.13], [-18, 0.62, 0.1], [8, 0.3, 0.08]].forEach(([d, f, rr]) => { face += circ(at(c, hA + d, r * f), r * rr, K.headSpots); });
      if (K.cap) face += ell(at(c, hA, r * 0.62), r * 0.34, r * 0.22, hA - 90, K.cap);
      if (K.crest) {
        if (front) { const a = at(c, hA, r * 0.8); front2 += curve([a, at(a, hA + 20, r * 0.5), at(a, hA - 25, r * 0.9)], K.crest, 2.6); }
        else { const a = at(c, hA + 150, r * 0.8), m = at(c, hA + 170, r * 1.5), t = at(c, hA + 160, r * 2.1); front2 += curve([a, m, t], K.crest, 2.6); }
      }
      // whiskers (seal, otter)
      if (K.whiskers) {
        const wl = (q, ang) => { const e = at(q, ang, r * 0.55); return `<path d="M${X(q)} ${Y(q)} L${X(e)} ${Y(e)}" stroke="${ink}" stroke-width="1" stroke-linecap="round" opacity=".7"/>`; };
        if (front) [1, -1].forEach(sg => { const q = P(0.22 * sg, -0.36); [-8, 8].forEach(d => { face += wl(q, fwd + (sg > 0 ? 0 : 180) + d * sg); }); });
        else { const q = P(0.8, -0.36); [-12, 4].forEach(d => { face += wl(q, fwd + d); }); }
      }
      if (K.ears === "horn" && front) {} // horns already drawn
      const sw = (b.maxX - b.minX) / 2 * 0.85 + 12;
      shadow = `<ellipse cx="${(VB.w / 2).toFixed(1)}" cy="${VB.floor + 5}" rx="${sw.toFixed(1)}" ry="6" fill="var(--cat-shadow, #e3cfb3)"/>`;
    }
    const head = front2 + ears + `<circle cx="${X(c)}" cy="${Y(c)}" r="${r}" fill="${headC}"${S.line ? ` stroke="${S.line}" stroke-width="${S.lw}"` : ""}/>` + face;
    const strap = pose.strap ? `<path d="${line(pose.strap === "F" ? [J.armF[2], J.legF[2]] : [J.armN[2], J.legN[3]])}" stroke="var(--strap, #6a5acd)" stroke-width="3" stroke-linecap="round"/>` : "";
    const floor = o.floor === false ? "" : shadow ? shadow : `<line x1="8" x2="${VB.w - 8}" y1="${VB.floor + 5}" y2="${VB.floor + 5}" stroke="var(--floor, #c9d4ce)" stroke-width="3" stroke-linecap="round"/>`;
    // tall poses (inversions) are scaled down around the floor so they stay inside the frame
    const top = Math.max(b.maxY, ...[J.armN, J.armF, J.legN, J.legF].flat().map(q => q.y)) + 12;
    const room = VB.floor - 6;
    const body = tail + limb(J.armF, armFC, S.arm) + limb(J.legF, legFC, S.leg) + torso + belly + marks + neck + head + limb(J.legN, legNC, S.leg) + strap + limb(J.armN, armNC, S.arm) + front2b;
    if (top > room) { const k = (room / top).toFixed(3); return floor + `<g transform="translate(${VB.w / 2} ${VB.floor + 5}) scale(${k}) translate(${-VB.w / 2} ${-(VB.floor + 5)})">${body}</g>`; }
    return floor + body;
    return floor + tail + limb(J.armF, farC, S.arm) + limb(J.legF, farC, S.leg) + torso + belly + neck + head + limb(J.legN, nearC, S.leg) + strap + limb(J.armN, nearC, S.arm);
  }
  function svg(pose, o) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" role="img">${svgInner(pose, o)}</svg>`;
  }

  root.PoseEngine = { SEG, STYLES, KITS, compute, lerp, svg, svgInner, VB };
  if (typeof module !== "undefined") module.exports = root.PoseEngine;
})(typeof window !== "undefined" ? window : globalThis);
