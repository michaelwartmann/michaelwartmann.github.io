// Towel lab: a small 3D simulator for waving techniques.
// A body with real 3D arms (shoulder, elbow, wrist), a towel as cloth, the air it pushes.
// Every hand follows a loop: centre + three oscillations (x, y, z) = the three degrees of freedom of the hand,
// plus a wrist twist. The torso can twist and lean. You can change everything while it runs,
// steer the hands live with the keyboard, record a loop and send it to the app, or let it explore.
(function () {
  "use strict";
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const v = (x, y, z) => [x, y, z];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const G = -9.81;
  const store = {
    get(k, d) { try { const s = localStorage.getItem("aufguss." + k); return s == null ? d : JSON.parse(s); } catch (e) { return d; } },
    set(k, val) { try { localStorage.setItem("aufguss." + k, JSON.stringify(val)); } catch (e) {} },
  };

  // ---------- body (metres; y up; the figure faces +z, towards the default camera) ----------
  const B = { hipY: 0.95, shY: 1.42, shX: 0.19, upper: 0.30, fore: 0.33, neckY: 1.52, headY: 1.70, headR: 0.15, hipX: 0.1, thigh: 0.45, shin: 0.47 };
  const REACH = B.upper + B.fore - 0.005;

  // rotation of the torso about the hip: twist (y), lean (sideways, z axis), bend (forwards, x axis)
  function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
  function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
  function rotAxis(p, k, a) { // Rodrigues
    const c = Math.cos(a), s = Math.sin(a);
    return add(add(mul(p, c), mul(cross(k, p), s)), mul(k, dot(k, p) * (1 - c)));
  }

  // ---------- motion spec ----------
  // hand: c = centre (m, body frame), a = amplitudes, f = frequency multipliers (0, 1, 2, 3), p = phases (deg),
  // tw = wrist twist amplitude (deg), tp = its phase, t0 = resting wrist angle.
  const hand = (o) => Object.assign({ c: [0.25, 1.4, 0.3], a: [0, 0, 0], f: [1, 1, 1], p: [0, 90, 0], tw: 0, tp: 0, t0: 0 }, o);
  const PRESETS = {
    propeller: { name: ["Propeller", "Propeller"], grip: "corner", towel: "strip", tempo: 2.1,
      R: hand({ c: [0.08, 1.98, 0.12], a: [0.3, 0, 0.3], f: [1, 0, 1], p: [0, 0, 90], tw: 0 }), Lmode: "join", L: hand({}), torso: { tw: 4, tp: 0, le: 0, lp: 0, be: 0, bp: 0 } },
    flag: { name: ["Side flag", "Seitliche Fahne"], grip: "edge", towel: "open", tempo: 0.6,
      R: hand({ c: [0.3, 1.97, 0.18], a: [0.17, 0.03, 0.06], f: [1, 2, 1], p: [0, 90, 90] }), Lmode: "own",
      L: hand({ c: [-0.12, 1.02, 0.3], a: [0.4, 0.03, 0.06], f: [1, 2, 1], p: [0, 90, 90] }), torso: { tw: 10, tp: 0, le: 6, lp: 0, be: 0, bp: 0 } },
    eight: { name: ["Figure eight", "Acht"], grip: "corner", towel: "strip", tempo: 1.0, asym: 0.25, hit: 0.0,
      R: hand({ c: [0.05, 1.65, 0.35], a: [0.38, 0.2, 0.06], f: [1, 2, 1], p: [0, 0, 90], tw: 40, tp: 0 }), Lmode: "join", L: hand({}), torso: { tw: 12, tp: 0, le: 4, lp: 0, be: 0, bp: 0 } },
    lumberjack: { name: ["Lumberjack", "Holzfäller"], grip: "spread", towel: "open", tempo: 0.5, asym: 0.6, hit: 0.25, tension: 0.06,
      R: hand({ c: [0.24, 1.5, 0.15], a: [0, 0.48, 0.32], f: [0, 1, 1], p: [0, 90, 0] }), Lmode: "mirror", L: hand({}), torso: { tw: 0, tp: 0, le: 0, lp: 0, be: 10, bp: 180 } },
    parachute: { name: ["Parachute", "Fallschirm"], grip: "spread", towel: "open", tempo: 0.75, asym: 0.5, hit: 0.25, tension: 0.05,
      R: hand({ c: [0.28, 1.45, 0.3], a: [0.08, 0.52, 0.22], f: [1, 1, 1], p: [90, 90, 0] }), Lmode: "mirror", L: hand({}), torso: { tw: 0, tp: 0, le: 0, lp: 0, be: 12, bp: 0 } },
    pizza: { name: ["Pizza (flat spin)", "Pizza"], grip: "spin", towel: "square", tempo: 2.4, spin: 2.2,
      R: hand({ c: [0.08, 1.72, 0.32], a: [0.02, 0.015, 0.02], f: [1, 2, 1], p: [0, 0, 90] }), Lmode: "join", L: hand({}), torso: { tw: 0, tp: 0, le: 0, lp: 0, be: 0, bp: 0 } },
  };
  const TOWELS = { // cols, rows, width, height (m). strip = 100×75 folded double lengthwise and again
    strip: [4, 12, 0.375, 1.0], open: [10, 8, 1.0, 0.7], square: [9, 9, 0.75, 0.75], big: [12, 9, 1.5, 1.0],
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // spline through keyframes (from techniques.js "keys" demos)
  function keysPath(keys) {
    const K = keys.slice().sort((p, q) => p[0] - q[0]), n = K.length;
    const cr = (p0, p1, p2, p3, u) => p1.map((_, i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u * u + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u * u * u));
    return (ph, j) => {
      let i = n - 1; for (let m = 0; m < n; m++) if (K[m][0] <= ph) i = m;
      const k1 = K[i], k2 = K[(i + 1) % n], t1 = k1[0], t2 = k2[0] + (i + 1 >= n ? 1 : 0), p = ph < t1 ? ph + 1 : ph;
      const u = (p - t1) / ((t2 - t1) || 1), g = (m) => K[((m % n) + n) % n][j];
      return k1[j] ? cr(g(i - 1) || k1[j], k1[j], g(i + 1) || k1[j], g(i + 2) || k1[j], u) : null;
    };
  }

  // ---------- cloth ----------
  class Cloth {
    constructor(spec) {
      const [cols, rows, w, h] = spec;
      Object.assign(this, { cols, rows, w, h });
      this.p = []; this.q = []; this.links = []; this.pins = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const pt = v(c / (cols - 1) * w - w / 2, 1.6 - r / (rows - 1) * h, 0.4); this.p.push(pt); this.q.push(pt.slice()); }
      const link = (a, b, k) => this.links.push([a, b, len(sub(this.p[a], this.p[b])), k]);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = this.idx(c, r);
        if (c < cols - 1) link(i, this.idx(c + 1, r), 1);
        if (r < rows - 1) link(i, this.idx(c, r + 1), 1);
        if (c < cols - 1 && r < rows - 1) { link(i, this.idx(c + 1, r + 1), 1); link(this.idx(c + 1, r), this.idx(c, r + 1), 1); }
        if (c < cols - 2) link(i, this.idx(c + 2, r), 0.6);
        if (r < rows - 2) link(i, this.idx(c, r + 2), 0.6);
        if (c < cols - 2 && r < rows - 2) { link(i, this.idx(c + 2, r + 2), 0.3); link(this.idx(c + 2, r), this.idx(c, r + 2), 0.3); }
      }
      this.prev = this.p.map((x) => x.slice());
    }
    idx(c, r) { return r * this.cols + c; }
    // pins: [[index, position], ...]
    // Physics: gravity, air resistance on every patch (the part that turns a fast towel into a board),
    // a little internal damping (terry cloth doesn't ring like silk), stiff links.
    step(dt, pins, colliders, drag) {
      const pinned = new Map(pins), n = this.p.length, cols = this.cols, rows = this.rows;
      const AREAL = 0.6, RHO = 0.95, CD = 1.2, CF = 0.06; // kg/m² (damp terry), hot air kg/m³, flat-plate drag, skin friction
      const mNode = AREAL * this.w * this.h / n;
      const vel = this.p.map((p, i) => sub(p, this.q[i])); // per step
      // air: per quad, the velocity of the patch against still air, split into normal and tangential parts
      const acc = this.p.map(() => [0, G, 0]);
      for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
        const ids = [this.idx(c, r), this.idx(c + 1, r), this.idx(c + 1, r + 1), this.idx(c, r + 1)], P = ids.map((i) => this.p[i]);
        const nr = cross(sub(P[2], P[0]), sub(P[3], P[1])), A = len(nr) / 2; if (!A) continue;
        const nu = mul(nr, 1 / (2 * A)), vq = mul(ids.reduce((s_, i) => add(s_, vel[i]), [0, 0, 0]), 1 / (4 * dt));
        const vn = dot(vq, nu), vt = sub(vq, mul(nu, vn)), vtl = len(vt);
        const F = add(mul(nu, -0.5 * RHO * CD * A * vn * Math.abs(vn)), mul(vt, -0.5 * RHO * CF * A * vtl));
        for (const i of ids) { const a_ = mul(F, 0.25 / mNode); acc[i] = add(acc[i], a_); }
      }
      for (let i = 0; i < n; i++) {
        if (pinned.has(i)) continue;
        let dv = mul(acc[i], dt * dt); const v0 = vel[i];
        // drag can't reverse the motion within one step (keeps it stable at high speed)
        const dl = len(dv), vl = len(v0); if (dl > vl + Math.abs(G) * dt * dt * 2) dv = mul(dv, (vl + Math.abs(G) * dt * dt * 2) / dl);
        vel[i] = add(mul(v0, drag), dv);
      }
      // internal damping: each point's velocity leans a little towards its neighbours' (removes ringing, keeps waves)
      const damp = 0.08, sm = vel.map((v_, i) => {
        const c = i % cols, r = (i / cols) | 0; let s_ = [0, 0, 0], k = 0;
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const cc = c + dc, rr = r + dr; if (cc >= 0 && cc < cols && rr >= 0 && rr < rows) { s_ = add(s_, vel[this.idx(cc, rr)]); k++; } }
        return add(mul(v_, 1 - damp), mul(s_, damp / k));
      });
      for (let i = 0; i < n; i++) { if (pinned.has(i)) continue; this.q[i] = this.p[i]; this.p[i] = add(this.p[i], sm[i]); }
      for (const [i, pos] of pins) { this.q[i] = this.p[i]; this.p[i] = pos.slice(); }
      for (let it = 0; it < 14; it++) {
        for (const [a, b, rest, k] of this.links) {
          const pa = this.p[a], pb = this.p[b], d = sub(pb, pa), l = len(d) || 1e-6, diff = (l - rest) / l * k;
          const ia = pinned.has(a) ? 0 : 1, ib = pinned.has(b) ? 0 : 1, w = ia + ib; if (!w) continue;
          const corr = mul(d, diff / w);
          if (ia) this.p[a] = add(pa, corr); if (ib) this.p[b] = sub(pb, corr);
        }
        for (const [i, pos] of pins) this.p[i] = pos.slice();
      }
      // keep the towel out of the body (capsules and spheres) and above the floor
      for (let i = 0; i < this.p.length; i++) {
        if (pinned.has(i)) continue;
        let p = this.p[i];
        for (const C of colliders) {
          let c = C.a;
          if (C.b) { const ab = sub(C.b, C.a), t = clamp(dot(sub(p, C.a), ab) / dot(ab, ab), 0, 1); c = add(C.a, mul(ab, t)); }
          const d = sub(p, c), l = len(d);
          if (l < C.r) p = add(c, mul(d, C.r / (l || 1e-6)));
        }
        if (p[1] < 0.01) p = [p[0], 0.01, p[2]];
        this.p[i] = p;
      }
    }
  }

  // ---------- the simulation ----------
  class Lab {
    constructor() {
      this.spec = clone(PRESETS.propeller); this.presetId = "propeller";
      this.t = 0; this.phase = 0; this.running = true; this.speed = 1;
      this.particles = []; this.trail = [];
      this.meter = { air: 0, open: 0, hand: 0 };
      this.cam = { yaw: -0.5, pitch: 0.18, dist: 3.4 };
      this.reset();
    }
    reset() {
      this.cloth = new Cloth(TOWELS[this.spec.towel] || TOWELS.open);
      this.lastHands = null;
      // drape the towel from the hands before the first frame
      const pose = this.pose(0);
      const pins = this.pins(pose);
      if (pins.length) { const anchor = pins[0][1]; this.cloth.p = this.cloth.p.map((p, i) => { const r = Math.floor(i / this.cloth.cols), c = i % this.cloth.cols; return add(anchor, v((c / (this.cloth.cols - 1)) * this.cloth.w * 0.3, -r / (this.cloth.rows - 1) * this.cloth.h, 0.05)); }); this.cloth.q = this.cloth.p.map((p) => p.slice()); }
      for (let i = 0; i < 120; i++) this.step(1 / 60, true);
    }
    // torso transform at phase ph
    torso(ph, extra = 0) {
      const T = this.spec.torso, th = TAU * ph;
      const tw = ((T.tw || 0) * Math.sin(th + (T.tp || 0) * D2R) + extra) * D2R, le = (T.le || 0) * D2R * Math.sin(th + (T.lp || 0) * D2R), be = (T.be || 0) * D2R * Math.sin(th + (T.bp || 0) * D2R);
      const hip = v(0, B.hipY, 0);
      const f = (p) => add(hip, rotY(rotZ(rotX(sub(p, hip), be), -le), tw));
      const dir = (p) => rotY(rotZ(rotX(p, be), -le), tw);
      return { f, dir, tw, le, be };
    }
    handTarget(H, ph, side) {
      const th = TAU * ph, o = [0, 1, 2].map((k) => H.c[k] + H.a[k] * Math.sin(H.f[k] * th + H.p[k] * D2R));
      return o;
    }
    // where both hands are (body frame), the wrist twist, and the torso
    // slow back, fast forward: the loop runs at speed 1 + a·cos(2π(ph − hit)); fastest at the hit
    warp(ph) { const a = this.spec.asym || 0, h = this.spec.hit || 0; return { ph: ((ph + a / TAU * (Math.sin(TAU * (ph - h)) + Math.sin(TAU * h))) % 1 + 1) % 1, rate: 1 + a * Math.cos(TAU * (ph - h)) }; }
    pose(ph0) {
      const S = this.spec, wp = this.warp(ph0), ph = wp.ph;
      let R, L, twR = 0, twL = 0;
      if (S.path) { R = S.path(ph, 1); L = S.path(ph, 2); }
      else {
        R = this.handTarget(S.R, ph);
        twR = ((S.R.t0 || 0) + (S.R.tw || 0) * Math.sin(TAU * ph + (S.R.tp || 0) * D2R)) * D2R;
        if (S.Lmode === "own") { L = this.handTarget(S.L, ph); twL = ((S.L.t0 || 0) + (S.L.tw || 0) * Math.sin(TAU * ph + (S.L.tp || 0) * D2R)) * D2R; }
        else if (S.Lmode === "mirror") { L = [-R[0], R[1], R[2]]; twL = -twR; }
        else if (S.Lmode === "opposite") { const r2 = this.handTarget(S.R, (ph + 0.5) % 1); L = [-r2[0], r2[1], r2[2]]; }
        else if (S.Lmode === "join") L = add(R, v(-0.07, -0.04, -0.01));
        else L = null;
      }
      const nudge = this.nudge || { R: [0, 0, 0], L: [0, 0, 0] };
      if (R) R = add(R, nudge.R); if (L) L = add(L, nudge.L);
      // two hands on one towel: pull apart at the fast part (tension), but never further than the towel allows
      if (R && L && (S.grip === "spread" || S.grip === "edge") && this.cloth) {
        const ax = sub(R, L), d = len(ax) || 1e-6, u = mul(ax, 1 / d), a = S.asym || 0;
        const pull = (S.tension || 0) * (a > 0 ? Math.max(0, (wp.rate - 1) / a) : 1);
        const maxD = (S.grip === "spread" ? this.cloth.w : this.cloth.h) * 0.97;
        const nd = Math.min(maxD, d + 2 * pull), mid = mul(add(R, L), 0.5);
        R = add(mid, mul(u, nd / 2)); L = sub(mid, mul(u, nd / 2));
      }
      // the body follows the hands a little: twist towards the side they are on
      const side = clamp(((R ? R[0] : 0) + (L ? L[0] : 0)) / 2 / 0.45, -1, 1);
      const T = this.torso(ph, side * (S.follow ?? 10));
      return { T, R, L, twR, twL, rate: wp.rate };
    }
    // solve the arm: shoulder, elbow, hand (world). Elbows hang down when hands are low, open out when high.
    arm(T, side, target) {
      const sh = T.f(v(side * B.shX, B.shY, 0));
      if (!target) { // resting arm
        const e = add(sh, T.dir(v(side * 0.06, -B.upper, 0.02))), h = add(e, T.dir(v(side * 0.02, -B.fore, 0.08)));
        return { sh, el: e, hd: h };
      }
      const lift = clamp((target[1] - B.shY) / 0.5, 0, 1) * 0.05; const sh2 = T.f(v(side * (B.shX - lift * 0.3), B.shY + lift, 0));
      let tw = T.f(target), d = sub(tw, sh2), l = len(d); const sh_ = sh2;
      if (l > REACH) { d = mul(d, REACH / l); l = REACH; } if (l < 0.08) { d = v(0, -0.08, 0.02); l = 0.08; }
      const dirn = mul(d, 1 / l), x = (B.upper * B.upper - B.fore * B.fore + l * l) / (2 * l), r = Math.sqrt(Math.max(0, B.upper * B.upper - x * x));
      const u = clamp((tw[1] - sh[1]) / 0.3 + 0.3, 0, 1);
      const pole = T.dir(add(mul(v(side * 0.35, -1, -0.3), 1 - u), mul(v(side, -0.25, -0.2), u)));
      let pp = sub(pole, mul(dirn, dot(pole, dirn))), pl = len(pp) || 1;
      const el = add(add(sh_, mul(dirn, x)), mul(pp, r / pl));
      return { sh: sh_, el, hd: add(sh_, d) };
    }
    pins(pose) {
      const S = this.spec, cl = this.cloth, T = pose.T;
      const aR = this.arm(T, 1, pose.R), aL = this.arm(T, -1, pose.L);
      this.arms = { R: aR, L: aL };
      const out = [];
      const grip = (a, tw) => { // the wrist: the edge leaves the hand the way the towel pulls it, turned only by changes of the twist
        const fa = norm(sub(a.hd, a.el)), cur = sub(cl.p[cl.idx(1, 0)], a.hd), dtw = tw - (this.lastTw ?? tw); this.lastTw = tw;
        const dir = len(cur) > 1e-4 ? norm(cur) : norm(cross(fa, v(0.3, 1, 0.2)));
        return add(a.hd, mul(rotAxis(dir, fa, dtw), cl.w / (cl.cols - 1)));
      };
      if (S.grip === "corner") { out.push([cl.idx(0, 0), aR.hd]); out.push([cl.idx(1, 0), grip(aR, pose.twR)]); }
      else if (S.grip === "spread") { out.push([cl.idx(cl.cols - 1, 0), aR.hd]); if (pose.L) out.push([cl.idx(0, 0), aL.hd]); }
      else if (S.grip === "spin") { // centre and the ring around it turn with the fingers
        const ci = (cl.cols - 1) / 2 | 0, cj = (cl.rows - 1) / 2 | 0, hub = add(aR.hd, v(0, 0.05, 0)), ang = TAU * (S.spin || 1.5) * this.t;
        const step = cl.w / (cl.cols - 1);
        for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const x = dc * step, z = dr * step, ca = Math.cos(ang), sa = Math.sin(ang); out.push([cl.idx(ci + dc, cj + dr), add(hub, v(x * ca - z * sa, 0, x * sa + z * ca))]); }
      }
      else if (S.grip === "edge") { out.push([cl.idx(0, 0), aR.hd]); if (pose.L) out.push([cl.idx(0, cl.rows - 1), aL.hd]); }
      return out;
    }
    colliders() {
      const T = this.lastPose ? this.lastPose.T : this.torso(0);
      return [
        { a: T.f(v(0, B.hipY + 0.05, 0)), b: T.f(v(0, B.shY - 0.04, 0)), r: 0.19 },
        { a: T.f(v(0, B.headY, 0.01)), r: B.headR + 0.03 },
        { a: v(B.hipX, 0.1, 0), b: v(B.hipX, B.hipY, 0), r: 0.09 }, { a: v(-B.hipX, 0.1, 0), b: v(-B.hipX, B.hipY, 0), r: 0.09 },
      ];
    }
    step(dt, quiet) {
      const sub_ = 4, h = dt / sub_;
      for (let s = 0; s < sub_; s++) {
        if (this.running) { this.t += h * this.speed; this.phase = ((this.t * this.spec.tempo) % 1 + 1) % 1; }
        const pose = this.pose(this.phase); this.lastPose = pose;
        const pins = this.pins(pose);
        this.cloth.step(h, pins, this.colliders(), 0.9995);
      }
      if (!quiet) this.measure(dt);
    }
    // air moved: for every patch of towel, area × the speed it pushes along its own normal (m³/s)
    measure(dt) {
      const cl = this.cloth, P = cl.p, Q = cl.prev;
      let air = 0, area = 0, nsum = [0, 0, 0];
      for (let r = 0; r < cl.rows - 1; r++) for (let c = 0; c < cl.cols - 1; c++) {
        const a = cl.idx(c, r), b = cl.idx(c + 1, r), d = cl.idx(c + 1, r + 1), e = cl.idx(c, r + 1);
        const n = cross(sub(P[b], P[a]), sub(P[e], P[a])), A = len(n); if (!A) continue;
        const nu = mul(n, 1 / A);
        const ctr = mul(add(add(P[a], P[b]), add(P[d], P[e])), 0.25), ctr0 = mul(add(add(Q[a], Q[b]), add(Q[d], Q[e])), 0.25);
        const vel = mul(sub(ctr, ctr0), 1 / dt), vn = dot(vel, nu);
        air += A * Math.abs(vn); area += A; nsum = add(nsum, n);
        if (Math.abs(vn) > 2.5 && Math.random() < 0.015 * Math.abs(vn) && this.particles.length < 160)
          this.particles.push({ p: ctr, v: mul(nu, vn * 0.45), life: 1 });
      }
      const k = 0.06;
      const handV = this.lastHand ? len(sub(this.arms.R.hd, this.lastHand)) / dt : 0; this.lastHand = this.arms.R.hd;
      // spin about the vertical through the hand, how far the towel hangs below horizontal, and the speed it needs
      { const hd = this.arms.R.hd, hv = this.prevHd ? mul(sub(hd, this.prevHd), 1 / dt) : [0, 0, 0]; this.prevHd = hd; let Lm = 0, I = 0, rs = [];
        for (let i = 0; i < P.length; i++) { const rx = P[i][0] - hd[0], rz = P[i][2] - hd[2], r2 = rx * rx + rz * rz; if (r2 < 0.0025) continue; const vx = (P[i][0] - Q[i][0]) / dt - hv[0], vz = (P[i][2] - Q[i][2]) / dt - hv[2]; Lm += rz * vx - rx * vz; I += r2; rs.push([Math.sqrt(r2), hd[1] - P[i][1]]); }
        const om = I ? Lm / I : 0; rs.sort((a, b) => b[0] - a[0]); const outer = rs.slice(0, Math.max(1, rs.length / 4 | 0));
        const rOut = outer.reduce((s_, q) => s_ + q[0], 0) / outer.length, droop = Math.atan2(outer.reduce((s_, q) => s_ + q[1], 0) / outer.length, rOut) / D2R;
        const need = Math.sqrt(9.81 / (Math.max(0.15, rOut * 0.7) * Math.tan(20 * D2R))) / TAU; // turns/s for ≤ 20° droop (conical pendulum)
        this.meter.spin = (this.meter.spin || 0) + (Math.abs(om) / TAU - (this.meter.spin || 0)) * k; this.meter.need = need; this.meter.droop = (this.meter.droop || 0) + (droop - (this.meter.droop || 0)) * k; }
            this.meter.air += (air - this.meter.air) * k;
      this.meter.open += ((area ? len(nsum) / area : 0) - this.meter.open) * k;
      this.meter.hand += (handV - this.meter.hand) * k;
      cl.prev = P.map((x) => x.slice());
      for (const q of this.particles) { q.p = add(q.p, mul(q.v, dt)); q.v = add(mul(q.v, 0.97), v(0, 0.25 * dt, 0)); q.life -= dt / 1.1; }
      this.particles = this.particles.filter((q) => q.life > 0);
      this.trail.push(this.arms.R.hd); if (this.trail.length > 90) this.trail.shift();
    }
  }

  // ---------- drawing ----------
  const COL = { fur: "#a0714a", belly: "#efd6ad", line: "#2b1d14", towel: [248, 243, 232], towelBack: [233, 220, 200], hem: "#c0703a", floor: "rgba(120,90,60,0.18)", air: [255, 140, 60] };
  class View {
    constructor(canvas, lab) {
      this.c = canvas; this.ctx = canvas.getContext("2d"); this.lab = lab;
      this.showAir = true; this.showTrail = true;
      this.resize(); addEventListener("resize", () => this.resize());
    }
    resize() {
      const dpr = Math.min(2, devicePixelRatio || 1), r = this.c.getBoundingClientRect();
      this.W = r.width; this.H = r.height; this.c.width = Math.round(r.width * dpr); this.c.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    camera() {
      const { yaw, pitch, dist } = this.lab.cam, tgt = v(0, 1.15, 0);
      const eye = add(tgt, v(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist));
      const fw = norm(sub(tgt, eye)), rt = norm(cross(fw, v(0, 1, 0))), up = cross(rt, fw);
      const f = Math.min(this.W, this.H * 0.9) * 1.25;
      this.P = (p) => { const d = sub(p, eye), z = dot(d, fw); return [this.W / 2 + dot(d, rt) * f / z, this.H * 0.52 - dot(d, up) * f / z, z, f / z]; };
      this.eye = eye;
    }
    draw() {
      const L = this.lab, ctx = this.ctx; this.camera();
      ctx.clearRect(0, 0, this.W, this.H);
      const P = this.P;
      // floor grid and shadows
      ctx.strokeStyle = COL.floor; ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) { const a = P(v(i * 0.25, 0, -1.25)), b = P(v(i * 0.25, 0, 1.25)), c = P(v(-1.25, 0, i * 0.25)), d = P(v(1.25, 0, i * 0.25)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke(); }
      const cl = L.cloth;
      ctx.fillStyle = "rgba(60,40,25,0.10)";
      for (let r = 0; r < cl.rows - 1; r++) for (let c = 0; c < cl.cols - 1; c++) {
        const q = [cl.idx(c, r), cl.idx(c + 1, r), cl.idx(c + 1, r + 1), cl.idx(c, r + 1)].map((i) => P(v(cl.p[i][0], 0, cl.p[i][2])));
        ctx.beginPath(); q.forEach((s, k) => (k ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]))); ctx.fill();
      }
      const sh = P(v(0, 0, 0)); ctx.fillStyle = "rgba(60,40,25,0.16)"; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], 0.3 * sh[3], 0.3 * sh[3] * 0.35, 0, 0, TAU); ctx.fill();

      // everything that has depth goes in one list, far first
      const items = [];
      const T = L.lastPose.T, arms = L.arms;
      const seg = (a, b, w, color, z0) => { const A = P(a), Bp = P(b); items.push({ z: z0 ?? (A[2] + Bp[2]) / 2, draw: () => capsule(ctx, A, Bp, w, color) }); };
      const ball = (c, r, color, z0) => { const C = P(c); items.push({ z: z0 ?? C[2], draw: () => { ctx.fillStyle = color; ctx.strokeStyle = COL.line; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(C[0], C[1], r * C[3], 0, TAU); ctx.fill(); ctx.stroke(); } }); };
      // legs (stable), torso, belly patch, arms, head
      for (const s of [1, -1]) {
        const hip = v(s * B.hipX, B.hipY, 0), knee = v(s * B.hipX * 1.05, B.hipY - B.thigh, 0.03), ank = v(s * B.hipX * 1.1, 0.06, 0);
        seg(hip, knee, 0.15, COL.fur); seg(knee, ank, 0.13, COL.fur); seg(ank, add(ank, v(s * 0.02, -0.02, 0.12)), 0.1, COL.fur);
      }
      const chest = T.f(v(0, B.shY - 0.06, 0)), pelvis = T.f(v(0, B.hipY + 0.06, 0));
      seg(pelvis, chest, 0.36, COL.fur);
      const fwd = T.dir(v(0, 0, 1)), toCam = norm(sub(this.eye, T.f(v(0, 1.2, 0))));
      if (dot(fwd, toCam) > 0.05) { const a = add(T.f(v(0, B.hipY + 0.14, 0)), mul(fwd, 0.13)), b = add(T.f(v(0, B.shY - 0.16, 0)), mul(fwd, 0.13)); const z = Math.min(P(a)[2], P(b)[2]) - 0.01; seg(a, b, 0.17, COL.belly, z); }
      for (const [k, s] of [["R", 1], ["L", -1]]) {
        const a = arms[k];
        seg(a.sh, a.el, 0.11, COL.fur); seg(a.el, a.hd, 0.1, COL.fur); ball(a.hd, 0.055, COL.fur);
      }
      const head = T.f(v(0, B.headY, 0)), hfwd = fwd, hup = T.dir(v(0, 1, 0)), hrt = norm(cross(hup, hfwd));
      seg(T.f(v(0, B.shY - 0.02, 0)), head, 0.12, COL.fur);
      const HP = P(head);
      items.push({ z: HP[2], draw: () => this.head(head, hfwd, hup, hrt) });
      // towel quads, two-sided shading
      const light = norm(v(0.4, 0.8, 0.6));
      for (let r = 0; r < cl.rows - 1; r++) for (let c = 0; c < cl.cols - 1; c++) {
        const ids = [cl.idx(c, r), cl.idx(c + 1, r), cl.idx(c + 1, r + 1), cl.idx(c, r + 1)], W3 = ids.map((i) => cl.p[i]), S = W3.map(P);
        const n = norm(cross(sub(W3[1], W3[0]), sub(W3[3], W3[0]))), ctr = mul(W3.reduce(add), 0.25);
        const facing = dot(n, sub(this.eye, ctr)) > 0, base = facing ? COL.towel : COL.towelBack, sh = 0.62 + 0.38 * Math.abs(dot(n, light));
        const col = `rgb(${base.map((x) => Math.round(x * sh)).join(",")})`;
        const z = (S[0][2] + S[1][2] + S[2][2] + S[3][2]) / 4;
        const edge = [r === 0, c === cl.cols - 2, r === cl.rows - 2, c === 0];
        items.push({ z, draw: () => {
          ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.lineJoin = "round";
          ctx.beginPath(); S.forEach((s, k) => (k ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = COL.hem; ctx.lineWidth = 2;
          edge.forEach((e, k) => { if (!e) return; const a = S[k], b = S[(k + 1) % 4]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
        } });
      }
      items.sort((a, b) => b.z - a.z).forEach((it) => it.draw());
      // hand path and air
      if (this.showTrail && L.trail.length > 2) { ctx.strokeStyle = "rgba(63,111,128,0.55)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); L.trail.forEach((p, i) => { const s = P(p); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); ctx.setLineDash([]); }
      if (this.showAir) for (const q of L.particles) { const s = P(q.p); ctx.fillStyle = `rgba(${COL.air.join(",")},${(q.life * 0.55).toFixed(3)})`; ctx.beginPath(); ctx.arc(s[0], s[1], clamp(0.012 * s[3] * (1.8 - q.life), 1.5, 5), 0, TAU); ctx.fill(); }
    }
    head(c, fw, up, rt) {
      const ctx = this.ctx, P = this.P, C = P(c), R = B.headR * C[3];
      const vis = (p) => dot(sub(p, c), sub(this.eye, c)) > 0;
      // ears first if they are behind the head
      const ears = [1, -1].map((s) => add(c, add(mul(rt, s * 0.11), add(mul(up, 0.11), mul(fw, -0.01)))));
      const ear = (e) => { const s = P(e); ctx.fillStyle = COL.fur; ctx.strokeStyle = COL.line; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(s[0], s[1], 0.05 * s[3], 0, TAU); ctx.fill(); ctx.stroke(); };
      ears.filter((e) => !vis(e)).forEach(ear);
      ctx.fillStyle = COL.fur; ctx.strokeStyle = COL.line; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(C[0], C[1], R, 0, TAU); ctx.fill(); ctx.stroke();
      ears.filter(vis).forEach(ear);
      const on = (x, y, z) => add(c, add(add(mul(rt, x), mul(up, y)), mul(fw, z)));
      const muz = on(0, -0.04, 0.12);
      if (vis(muz)) { const s = P(muz); ctx.fillStyle = COL.belly; ctx.beginPath(); ctx.ellipse(s[0], s[1], 0.055 * s[3], 0.04 * s[3], 0, 0, TAU); ctx.fill(); const n = P(on(0, -0.02, 0.15)); ctx.fillStyle = COL.line; ctx.beginPath(); ctx.arc(n[0], n[1], 0.014 * n[3], 0, TAU); ctx.fill(); }
      for (const s of [1, -1]) { const e = on(s * 0.055, 0.03, 0.135); if (vis(e)) { const q = P(e); ctx.fillStyle = COL.line; ctx.beginPath(); ctx.arc(q[0], q[1], 0.014 * q[3], 0, TAU); ctx.fill(); } }
    }
  }
  function capsule(ctx, A, Bp, w, color) {
    const wa = w * A[3], wb = w * Bp[3], wpx = (wa + wb) / 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = COL.line; ctx.lineWidth = wpx + 4.5; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(Bp[0], Bp[1]); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = wpx; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(Bp[0], Bp[1]); ctx.stroke();
  }

  // ---------- recording: one loop → keyframes for the app ----------
  function record(lab, n = 16) {
    const keys = [];
    for (let i = 0; i < n; i++) {
      const ph = i / n, pose = lab.pose(ph), T = pose.T;
      const R = lab.arm(T, 1, pose.R).hd, L = pose.L ? lab.arm(T, -1, pose.L).hd : null;
      const r3 = (p) => p.map((x) => +x.toFixed(3));
      keys.push([+ph.toFixed(4), r3(R), L ? r3(L) : null]);
    }
    const g = lab.spec.grip === "edge" ? "vertical" : lab.spec.grip;
    return { kind: "keys", grip: g, speed: +lab.spec.tempo.toFixed(3), cloth: [TOWELS[lab.spec.towel][2], TOWELS[lab.spec.towel][3]], source: "Towel lab recording", keys };
  }

  // keyframes → adjustable loop: per axis keep the mean and the strongest of the first two harmonics
  function fitLoop(path, j) {
    const N = 64, xs = [0, 1, 2].map(() => []);
    for (let i = 0; i < N; i++) { const q = path(i / N, j); if (!q) return null; q.forEach((x, k) => xs[k].push(x)); }
    const out = hand({});
    for (let k = 0; k < 3; k++) {
      const m = xs[k].reduce((a, b) => a + b, 0) / N; out.c[k] = +m.toFixed(3);
      let best = { a: 0, f: 0, p: 0 };
      for (const f of [1, 2]) {
        let sn = 0, cs = 0; xs[k].forEach((x, i) => { const th = TAU * f * i / N; sn += (x - m) * Math.sin(th); cs += (x - m) * Math.cos(th); });
        sn *= 2 / N; cs *= 2 / N; const a = Math.hypot(sn, cs);
        if (a > best.a * 1.2) best = { a, f, p: Math.atan2(cs, sn) / D2R };
      }
      out.a[k] = +best.a.toFixed(3); out.f[k] = best.f; out.p[k] = Math.round(best.p);
    }
    return out;
  }

  // ---------- explore: change a little, keep it if more air moves with an open towel ----------
  const NUM = (s) => [["R", "c", 0, -0.5, 0.6], ["R", "c", 1, 0.9, 2.05], ["R", "c", 2, -0.2, 0.6], ["R", "a", 0, 0, 0.5], ["R", "a", 1, 0, 0.55], ["R", "a", 2, 0, 0.5],
    ["R", "p", 0, -180, 180], ["R", "p", 1, -180, 180], ["R", "p", 2, -180, 180], ["R", "tw", null, 0, 120], ["torso", "tw", null, 0, 30], ["torso", "le", null, 0, 12], ["", "tempo", null, 0.3, 2.4]];
  function getP(spec, [h, k, i]) { const o = h ? spec[h] : spec; return i == null ? o[k] : o[k][i]; }
  function setP(spec, [h, k, i], val) { const o = h ? spec[h] : spec; if (i == null) o[k] = val; else o[k][i] = val; }

  // ---------- UI ----------
  const lang = (store.get("lang", null) || (navigator.language || "en")).slice(0, 2) === "de" ? "de" : "en";
  const tr = (en, de) => (lang === "de" ? de : en);
  const $ = (s) => document.querySelector(s);
  const lab = new Lab();
  const view = new View($("#stage"), lab);
  window.__lab = lab;

  const techniques = window.AUFGUSS_TECHNIQUES || [];
  const keyTechs = techniques.filter((t) => t.demo && t.demo.kind === "keys");

  function buildPresets() {
    $("#preset").innerHTML = Object.entries(PRESETS).map(([id, p]) => `<option value="${id}">${tr(...p.name)}</option>`).join("")
      + (keyTechs.length ? `<optgroup label="${tr("From the tutorials (keyframes)", "Aus den Tutorials (Keyframes)")}">${keyTechs.map((t) => `<option value="t:${t.id}">${t.code} · ${t.name[lang] || t.name.en}</option>`).join("")}</optgroup>` : "")
      + (saved().length ? `<optgroup label="${tr("Saved", "Gespeichert")}">${saved().map((s, i) => `<option value="s:${i}">${s.name}</option>`).join("")}</optgroup>` : "");
    $("#preset").value = lab.presetId;
  }
  const saved = () => store.get("lab.saved", []);
  function loadPreset(id) {
    lab.presetId = id; lab.nudge = { R: [0, 0, 0], L: [0, 0, 0] };
    if (id.startsWith("t:")) {
      const t = techniques.find((x) => "t:" + x.id === id), d = t.demo;
      const towel = d.cloth ? (d.cloth[0] > 1.2 ? "big" : "open") : d.grip === "corner" ? "strip" : "open";
      lab.spec = Object.assign(clone(PRESETS.flag), { grip: d.grip === "vertical" ? "edge" : d.grip, towel, tempo: d.speed || 0.6, Lmode: "own", torso: { tw: 0, tp: 0, le: 0, lp: 0, be: 0, bp: 0 } });
      lab.spec.keys = d.keys; lab.spec.path = keysPath(d.keys); lab.spec.clip = t.clip; lab.spec.name = t.name[lang] || t.name.en;
    } else if (id.startsWith("s:")) {
      const s = saved()[+id.slice(2)]; lab.spec = clone(s.spec); if (lab.spec.keys) lab.spec.path = keysPath(lab.spec.keys);
    } else lab.spec = clone(PRESETS[id]);
    lab.reset(); buildControls(); syncClip();
  }

  // sliders: [label, getter path, min, max, step, unit]
  function controlsList() {
    const S = lab.spec, rows = [[tr("Tempo (loops per second)", "Tempo (Schleifen pro Sekunde)"), ["", "tempo", null], 0.2, 2.5, 0.05, "/s"]];
    if (S.path) return rows.concat([[tr("Hands up/down (both)", "Hände hoch/runter (beide)"), ["nudge", "R", 1], -0.4, 0.4, 0.01, "m"], [tr("Slow back, fast forward", "Langsam zurück, schnell vor"), ["", "asym", null], 0, 0.85, 0.05, ""], [tr("Moment of the hit (in the loop)", "Moment des Schlags (in der Schleife)"), ["", "hit", null], 0, 1, 0.05, ""]]);
    const H = (h, title) => [
      [`${title}: ${tr("centre left–right", "Mitte links–rechts")}`, [h, "c", 0], -0.6, 0.6, 0.01, "m"], [`${title}: ${tr("centre height", "Mitte Höhe")}`, [h, "c", 1], 0.8, 2.1, 0.01, "m"], [`${title}: ${tr("centre forward", "Mitte vorne")}`, [h, "c", 2], -0.3, 0.7, 0.01, "m"],
      [`${title}: ${tr("swing left–right", "Schwung links–rechts")}`, [h, "a", 0], 0, 0.6, 0.01, "m"], [`${title}: ${tr("swing up–down", "Schwung hoch–runter")}`, [h, "a", 1], 0, 0.6, 0.01, "m"], [`${title}: ${tr("swing forward–back", "Schwung vor–zurück")}`, [h, "a", 2], 0, 0.6, 0.01, "m"],
      [`${title}: ${tr("rhythm left–right (×)", "Rhythmus links–rechts (×)")}`, [h, "f", 0], 0, 3, 1, ""], [`${title}: ${tr("rhythm up–down (×)", "Rhythmus hoch–runter (×)")}`, [h, "f", 1], 0, 3, 1, ""], [`${title}: ${tr("rhythm forward–back (×)", "Rhythmus vor–zurück (×)")}`, [h, "f", 2], 0, 3, 1, ""],
      [`${title}: ${tr("timing up–down", "Timing hoch–runter")}`, [h, "p", 1], -180, 180, 5, "°"], [`${title}: ${tr("timing forward–back", "Timing vor–zurück")}`, [h, "p", 2], -180, 180, 5, "°"],
      [`${title}: ${tr("wrist twist", "Handgelenk drehen")}`, [h, "tw", null], 0, 180, 5, "°"], [`${title}: ${tr("wrist timing", "Handgelenk Timing")}`, [h, "tp", null], -180, 180, 5, "°"],
    ];
    const timing = [[tr("Slow back, fast forward", "Langsam zurück, schnell vor"), ["", "asym", null], 0, 0.85, 0.05, ""], [tr("Moment of the hit (in the loop)", "Moment des Schlags (in der Schleife)"), ["", "hit", null], 0, 1, 0.05, ""]];
    if (S.grip === "spread" || S.grip === "edge") timing.push([tr("Pull the hands apart at the hit", "Hände beim Schlag auseinanderziehen"), ["", "tension", null], 0, 0.15, 0.01, "m"]);
    if (S.grip === "spin") timing.push([tr("Spin (turns per second)", "Drehung (Umdrehungen pro Sekunde)"), ["", "spin", null], 0, 4, 0.1, "/s"]);
    timing.push([tr("Body follows the hands", "Körper folgt den Händen"), ["", "follow", null], 0, 25, 1, "°"]);
    let out = rows.concat(timing, H("R", tr("Right hand", "Rechte Hand")));
    if (S.Lmode === "own") out = out.concat(H("L", tr("Left hand", "Linke Hand")));
    out = out.concat([[tr("Body twist", "Oberkörper drehen"), ["torso", "tw", null], 0, 40, 1, "°"], [tr("Body twist timing", "Drehen Timing"), ["torso", "tp", null], -180, 180, 5, "°"],
      [tr("Side lean", "Seitneigung"), ["torso", "le", null], 0, 20, 1, "°"], [tr("Forward bend", "Vorbeuge"), ["torso", "be", null], 0, 25, 1, "°"], [tr("Bend timing", "Beugen Timing"), ["torso", "bp", null], -180, 180, 5, "°"]]);
    return out;
  }
  const DEFV = { asym: 0, hit: 0, tension: 0, spin: 1.5, follow: 10 };
  function getV(path) { if (path[0] === "nudge") return lab.nudge ? lab.nudge.R[1] : 0; const v_ = getP(lab.spec, path); return v_ == null ? DEFV[path[1]] ?? 0 : v_; }
  function setV(path, val) {
    if (path[0] === "nudge") { lab.nudge = lab.nudge || { R: [0, 0, 0], L: [0, 0, 0] }; lab.nudge.R[1] = val; lab.nudge.L[1] = val; return; }
    setP(lab.spec, path, val);
  }
  function buildControls() {
    const S = lab.spec;
    $("#grip").value = S.grip; $("#towel").value = S.towel; $("#lmode").value = S.Lmode || "rest";
    $("#lmode").disabled = !!S.path; $("#simplify").hidden = !S.path;
    $("#sliders").innerHTML = controlsList().map(([label, path, min, max, step, unit], i) => {
      const val = getV(path);
      return `<label class="sl"><span>${label} <output id="o${i}">${fmt(val, step)}${unit}</output></span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-i="${i}"></label>`;
    }).join("");
    const list = controlsList();
    document.querySelectorAll("#sliders input").forEach((el) => (el.oninput = () => { const [, path, , , step, unit] = list[+el.dataset.i]; setV(path, +el.value); $("#o" + el.dataset.i).textContent = fmt(+el.value, step) + unit; }));
  }
  const fmt = (x, step) => (step >= 1 ? Math.round(x) : x.toFixed(2));
  function refreshSliders() { const list = controlsList(); document.querySelectorAll("#sliders input").forEach((el) => { const [, path, , , step, unit] = list[+el.dataset.i]; const val = getV(path); if (document.activeElement !== el) el.value = val; $("#o" + el.dataset.i).textContent = fmt(val, step) + unit; }); }

  // video next to the model (official YouTube player, muted loop)
  function syncClip() {
    const box = $("#clipbox"), clip = lab.spec.clip || (techniques.find((t) => t.clip && lab.presetId === "flag" && t.id === "flag") || {}).clip;
    box.innerHTML = clip ? `<button id="clipgo">${tr("Show the tutorial next to it", "Tutorial daneben zeigen")}</button> <span class="hint">${clip.credit || ""}</span>` : `<span class="hint">${tr("Choose a technique from the tutorials to see its video here.", "Wähle eine Technik aus den Tutorials, um hier ihr Video zu sehen.")}</span>`;
    if (clip) $("#clipgo").onclick = () => { box.innerHTML = `<div id="clipv" class="clipv"></div><div class="row"><button data-rate="0.25">0.25×</button><button data-rate="0.5">0.5×</button><button data-rate="1">1×</button></div>`; window.AufgussClip && window.AufgussClip.loop($("#clipv"), clip, { rate: 1 }).then((pl) => { box.querySelectorAll("[data-rate]").forEach((b) => (b.onclick = () => { pl && pl.setRate(+b.dataset.rate); lab.speed = +b.dataset.rate; $("#slow").value = lab.speed; })); }); };
  }

  // keyboard: live hands. Right hand W A S D (Q/E forward/back), left hand I J K L (U/O). Arrows turn the camera.
  const held = new Set();
  addEventListener("keydown", (e) => {
    if (e.target.matches("input[type=text], textarea, select")) return;
    const k = e.key.toLowerCase();
    if ("wasdqeijkluo".includes(k) && k.length === 1) { held.add(k); e.preventDefault(); }
    if (e.target.matches("input[type=range]")) return;
    if (e.key === "ArrowLeft") { lab.cam.yaw -= 0.12; e.preventDefault(); } if (e.key === "ArrowRight") { lab.cam.yaw += 0.12; e.preventDefault(); }
    if (e.key === "ArrowUp") { lab.cam.pitch = clamp(lab.cam.pitch + 0.08, -0.2, 1.3); e.preventDefault(); } if (e.key === "ArrowDown") { lab.cam.pitch = clamp(lab.cam.pitch - 0.08, -0.2, 1.3); e.preventDefault(); }
    if (e.key === " ") { lab.running = !lab.running; $("#play").textContent = lab.running ? "⏸" : "▶"; e.preventDefault(); }
  });
  addEventListener("keyup", (e) => held.delete(e.key.toLowerCase()));
  function liveKeys(dt) {
    if (!held.size) return;
    lab.nudge = lab.nudge || { R: [0, 0, 0], L: [0, 0, 0] };
    const sp = 0.5 * dt, m = { a: ["R", 0, -1], d: ["R", 0, 1], w: ["R", 1, 1], s: ["R", 1, -1], q: ["R", 2, 1], e: ["R", 2, -1], j: ["L", 0, -1], l: ["L", 0, 1], i: ["L", 1, 1], k: ["L", 1, -1], u: ["L", 2, 1], o: ["L", 2, -1] };
    for (const k of held) { const [h, ax, s] = m[k]; lab.nudge[h][ax] = clamp(lab.nudge[h][ax] + s * sp, -0.8, 0.8); }
  }
  // pointer: drag turns the camera, wheel or pinch zooms
  const stage = $("#stage"); let drag = null;
  stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: lab.cam.yaw, pitch: lab.cam.pitch }; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", (e) => { if (!drag) return; lab.cam.yaw = drag.yaw + (e.clientX - drag.x) * 0.01; lab.cam.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.008, -0.2, 1.3); });
  stage.addEventListener("pointerup", () => (drag = null));
  stage.addEventListener("wheel", (e) => { lab.cam.dist = clamp(lab.cam.dist * (1 + Math.sign(e.deltaY) * 0.08), 1.8, 7); e.preventDefault(); }, { passive: false });
  // phone: a pad that moves the right hand
  const pad = $("#pad"); let padOn = null;
  pad.addEventListener("pointerdown", (e) => { padOn = e.pointerId; pad.setPointerCapture(e.pointerId); padMove(e); });
  pad.addEventListener("pointermove", (e) => { if (padOn === e.pointerId) padMove(e); });
  pad.addEventListener("pointerup", () => { padOn = null; });
  function padMove(e) { const r = pad.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 2 - 1, y = 1 - (e.clientY - r.top) / r.height * 2; lab.nudge = lab.nudge || { R: [0, 0, 0], L: [0, 0, 0] }; lab.nudge.R[0] = x * 0.5; lab.nudge.R[1] = y * 0.5; pad.style.setProperty("--x", ((x + 1) * 50) + "%"); pad.style.setProperty("--y", ((1 - y) * 50) + "%"); }

  // explore
  let explore = null;
  function exploreStep() {
    const ex = explore; if (!ex) return;
    const score = lab.meter.air * (0.4 + lab.meter.open) / (1 + 0.15 * lab.meter.hand * lab.meter.hand);
    if (ex.trial) { if (score > ex.best) { ex.best = score; ex.kept++; } else lab.spec = ex.backup; }
    ex.backup = clone(lab.spec); ex.backup.path = lab.spec.path; // keep the spline function
    const n = NUM(lab.spec), pick = n[Math.floor(Math.random() * n.length)], [, , , lo, hi] = pick;
    const cur = getP(lab.spec, pick), step = (hi - lo) * (ex.wild ? 0.35 : 0.08) * (Math.random() * 2 - 1);
    setP(lab.spec, pick, clamp(cur + step, lo, hi)); ex.trial = true; ex.n++;
    $("#exinfo").textContent = tr(`Tried ${ex.n}, kept ${ex.kept}. Score ${ex.best.toFixed(2)}`, `Versucht ${ex.n}, behalten ${ex.kept}. Wert ${ex.best.toFixed(2)}`);
    refreshSliders();
  }

  // buttons
  function wire() {
    $("#preset").onchange = (e) => loadPreset(e.target.value);
    $("#grip").onchange = (e) => { lab.spec.grip = e.target.value; lab.reset(); };
    $("#towel").onchange = (e) => { lab.spec.towel = e.target.value; lab.reset(); };
    $("#lmode").onchange = (e) => { lab.spec.Lmode = e.target.value; if (e.target.value === "own" && !lab.spec.L.a.some(Boolean)) lab.spec.L = Object.assign(clone(lab.spec.R), { c: [-lab.spec.R.c[0], lab.spec.R.c[1], lab.spec.R.c[2]] }); buildControls(); lab.reset(); };
    $("#play").onclick = () => { lab.running = !lab.running; $("#play").textContent = lab.running ? "⏸" : "▶"; };
    $("#slow").oninput = (e) => (lab.speed = +e.target.value);
    $("#restart").onclick = () => lab.reset();
    document.querySelectorAll("[data-view]").forEach((b) => (b.onclick = () => { const [y, p] = b.dataset.view.split(",").map(Number); lab.cam.yaw = y; lab.cam.pitch = p; }));
    $("#air").onchange = (e) => (view.showAir = e.target.checked);
    $("#trail").onchange = (e) => (view.showTrail = e.target.checked);
    $("#bake").onclick = () => { // fold the live nudges into the loop
      const n = lab.nudge || { R: [0, 0, 0], L: [0, 0, 0] };
      if (lab.spec.path) { lab.spec.keys = lab.spec.keys.map(([ph, R, L]) => [ph, R && add(R, n.R), L && add(L, n.L)]); lab.spec.path = keysPath(lab.spec.keys); }
      else { lab.spec.R.c = add(lab.spec.R.c, n.R); if (lab.spec.Lmode === "own") lab.spec.L.c = add(lab.spec.L.c, n.L); }
      lab.nudge = { R: [0, 0, 0], L: [0, 0, 0] }; buildControls();
    };
    $("#simplify").onclick = () => {
      if (!lab.spec.path) return;
      const R = fitLoop(lab.spec.path, 1), L = fitLoop(lab.spec.path, 2);
      lab.spec.R = R; if (L) { lab.spec.L = L; lab.spec.Lmode = "own"; } else lab.spec.Lmode = "rest";
      delete lab.spec.path; delete lab.spec.keys; buildControls();
      $("#out").textContent = tr("Now every slider works. The loop is smoother than the keyframes; nudge it back where it matters.", "Jetzt wirken alle Regler. Die Schleife ist glatter als die Keyframes; schieb sie dort zurecht, wo es zählt.");
    };
    $("#zero").onclick = () => { lab.nudge = { R: [0, 0, 0], L: [0, 0, 0] }; refreshSliders(); };
    $("#explore").onclick = () => {
      if (explore) { clearInterval(explore.timer); explore = null; $("#explore").textContent = tr("Explore", "Erkunden"); $("#exinfo").textContent = ""; return; }
      explore = { n: 0, kept: 0, best: 0, trial: false, wild: $("#wild").checked, timer: setInterval(exploreStep, 2600) };
      $("#explore").textContent = tr("Stop exploring", "Erkunden stoppen");
    };
    $("#save").onclick = () => {
      const name = prompt(tr("Name for this motion", "Name für diese Bewegung"), lab.spec.name || tr("My motion", "Meine Bewegung")); if (!name) return;
      const spec = clone(lab.spec); delete spec.path; const all = saved(); all.push({ name, spec, demo: record(lab) }); store.set("lab.saved", all); buildPresets(); $("#preset").value = "s:" + (all.length - 1);
      $("#out").textContent = tr("Saved on this phone.", "Auf diesem Handy gespeichert.");
    };
    $("#export").onclick = async () => {
      const txt = JSON.stringify(record(lab));
      try { await navigator.clipboard.writeText(txt); $("#out").textContent = tr("Copied. Send it to Claude, or paste it into techniques.js.", "Kopiert. Schick es an Claude oder füge es in techniques.js ein."); }
      catch (e) { $("#out").textContent = txt; }
    };
    $("#toapp").onchange = () => {};
    $("#useapp").onclick = () => {
      const id = $("#toapp").value; if (!id) return;
      const ov = store.get("lab.override", {}); ov[id] = record(lab); store.set("lab.override", ov);
      $("#out").innerHTML = tr(`Done: the app now shows your version of this technique. <a href="index.html#t-${id}">Open it</a>`, `Fertig: Die App zeigt jetzt deine Version dieser Technik. <a href="index.html#t-${id}">Öffnen</a>`);
    };
    $("#toapp").innerHTML = `<option value="">${tr("Send this loop to a technique…", "Diese Schleife an eine Technik geben…")}</option>` + techniques.map((t) => `<option value="${t.id}">${t.code} · ${t.name[lang] || t.name.en}</option>`).join("");
  }

  // meters
  function meters() {
    const m = lab.meter;
    $("#mAir").textContent = m.air.toFixed(2); $("#mOpen").textContent = Math.round(clamp(m.open, 0, 1) * 100) + "%"; $("#mHand").textContent = m.hand.toFixed(1);
    const sp = m.spin || 0; $("#mSpin").textContent = sp > 0.15 ? `${sp.toFixed(1)}/s` : "–";
    $("#mSpinInfo").textContent = sp > 0.15 ? tr(`needs ≥ ${m.need.toFixed(1)}/s to stay flat · hangs ${Math.round(m.droop)}°`, `braucht ≥ ${m.need.toFixed(1).replace(".", ",")}/s, um flach zu bleiben · hängt ${Math.round(m.droop)}°`) : tr("not spinning", "dreht nicht");
    $("#bSpin").style.width = clamp(sp / Math.max(0.1, m.need || 1) * 50, 0, 100) + "%"; $("#bSpin").style.background = sp >= (m.need || 9) ? "#3f8f5a" : "";
    $("#bAir").style.width = clamp(m.air / 3 * 100, 0, 100) + "%"; $("#bOpen").style.width = clamp(m.open * 100, 0, 100) + "%"; $("#bHand").style.width = clamp(m.hand / 8 * 100, 0, 100) + "%";
  }

  // texts
  function texts() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en]").forEach((el) => (el.textContent = lang === "de" ? el.dataset.de : el.dataset.en));
  }

  texts(); buildPresets(); wire(); loadPreset("propeller");
  const qs = new URLSearchParams(location.search), qt = qs.get("t");
  if (qt && keyTechs.find((t) => t.id === qt)) { loadPreset("t:" + qt); buildPresets(); $("#preset").value = "t:" + qt; }
  else if (qt) { // techniques drawn with a built-in motion: start from the nearest lab preset
    const t = techniques.find((x) => x.id === qt), kind = t && t.demo && t.demo.kind;
    const map = { rotate: "propeller", recorded: "propeller", sweep: "flag", eight: "eight", flatspin: "pizza", shovel: "parachute", whip: "lumberjack", comb: "parachute", wave: "eight", throw: "eight", fan: "eight" };
    if (map[kind]) { loadPreset(map[kind]); lab.spec.clip = t.clip; syncClip(); $("#preset").value = map[kind]; }
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { lab.speed = 0.5; $("#slow").value = 0.5; }
  let last = performance.now(), acc = 0, fc = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    liveKeys(dt);
    lab.step(1 / 60); // fixed physics step per frame keeps the cloth stable
    view.draw();
    if (++fc % 6 === 0) { meters(); if (held.size) refreshSliders(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
