// Aufguss Studio – animated technique demo.
// A simple figure moves its hands along a looping path; the towel is simulated as cloth
// (Verlet points with fixed distances, gravity and air drag). The towel only holds its shape
// when the motion gives it tension: spin it slowly and it folds, like the real thing.
(function (root) {
  "use strict";

  const TAU = Math.PI * 2;
  const G = -9.81;

  function v(x, y, z) { return [x, y, z]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function len(a) { return Math.hypot(a[0], a[1], a[2]); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function smooth(t) { return t * t * (3 - 2 * t); }

  const SHOULDER_R = v(0.2, 1.45, 0), SHOULDER_L = v(-0.2, 1.45, 0);
  const REST_R = v(0.28, 0.95, 0.05), REST_L = v(-0.28, 0.95, 0.05);

  // ---------- Cloth ----------
  class Cloth {
    constructor(cols, rows, w, h) {
      this.cols = cols; this.rows = rows; this.w = w; this.h = h;
      this.p = []; this.q = []; this.pin = new Map(); this.links = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const pt = v(c / (cols - 1) * w, -r / (rows - 1) * h + 1.5, 0.3);
        this.p.push(pt.slice()); this.q.push(pt.slice());
      }
      const idx = (c, r) => r * cols + c;
      this.idx = idx;
      const link = (a, b, k = 1) => this.links.push([a, b, len(sub(this.p[a], this.p[b])), k]);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (c < cols - 1) link(idx(c, r), idx(c + 1, r));
        if (r < rows - 1) link(idx(c, r), idx(c, r + 1));
        if (c < cols - 1 && r < rows - 1) { link(idx(c, r), idx(c + 1, r + 1)); link(idx(c + 1, r), idx(c, r + 1)); }
        if (c < cols - 2) link(idx(c, r), idx(c + 2, r), 0.12);  // soft bending: keeps it from crumpling into a string
        if (r < rows - 2) link(idx(c, r), idx(c, r + 2), 0.12);
      }
    }
    place(fn) { // put every point somewhere sensible before the first frame
      for (let i = 0; i < this.p.length; i++) { const pt = fn(i); this.p[i] = pt.slice(); this.q[i] = pt.slice(); }
    }
    step(dt, drag) {
      for (let i = 0; i < this.p.length; i++) {
        if (this.pin.has(i)) continue;
        const p = this.p[i], q = this.q[i];
        const vel = mul(sub(p, q), drag);
        this.q[i] = p.slice();
        this.p[i] = add(add(p, vel), v(0, G * dt * dt, 0));
      }
      for (let it = 0; it < 8; it++) {
        for (const [a, b, rest, k] of this.links) {
          const pa = this.p[a], pb = this.p[b];
          const d = sub(pb, pa), l = len(d) || 1e-6;
          const diff = k * (l - rest) / l;
          const fa = this.pin.has(a) ? 0 : (this.pin.has(b) ? 1 : 0.5);
          const fb = this.pin.has(b) ? 0 : (this.pin.has(a) ? 1 : 0.5);
          if (fa) this.p[a] = add(pa, mul(d, diff * fa));
          if (fb) this.p[b] = sub(pb, mul(d, diff * fb));
        }
        for (const [i, pos] of this.pin) this.p[i] = pos.slice();
        for (let i = 0; i < this.p.length; i++) if (this.p[i][1] < 0.02) this.p[i][1] = 0.02; // floor
      }
    }
  }

  // ---------- Hand paths per kind ----------
  // Returns { R, L, pins: [[pointIndex, handKey, offset]] , release? }
  function makeMotion(demo, cloth) {
    const kind = demo.kind;
    const k = cloth.idx;
    const C = cloth.cols - 1, Rw = cloth.rows - 1;
    const two = !!demo.twoTowels;
    const big = demo.big ? 1.5 : 1;

    switch (kind) {
      case "rotate": {
        const plane = demo.plane || "horizontal";
        const rad = (plane === "horizontal" ? 0.2 : 0.24) * big;
        return {
          grip: "corner",
          hands(t, w) {
            const a = w * t;
            let R;
            if (plane === "horizontal") R = v(0.3 + rad * Math.cos(a), 2.0, rad * Math.sin(a));
            else if (plane === "wall") R = v(0.5 + rad * Math.cos(a), 1.5 + rad * Math.sin(a), 0.15);
            else R = v(0.25 + rad * Math.cos(a), 1.85 + 0.08 * Math.sin(a), 0.1 + rad * Math.sin(a));
            let L = null;
            if (two) L = v(-R[0], R[1], plane === "horizontal" ? -R[2] : R[2]); // mirrored, opposite direction
            return { R, L };
          },
        };
      }
      case "eight": {
        return {
          grip: "corner",
          hands(t, w) {
            const a = w * t;
            const A = demo.x ? 0.32 : 0.36, B = demo.x ? 0.26 : 0.16;
            const hy = demo.double ? 1.45 + 0.2 * Math.sin(a / 2) : 1.45;
            const R = v(0.05 + A * Math.sin(a), hy + B * Math.sin(2 * a), 0.3);
            let L = null;
            if (two) { const b = a + Math.PI; L = v(-0.05 + A * Math.sin(b), hy + B * Math.sin(2 * b), 0.3); }
            return { R, L };
          },
        };
      }
      case "sweep": {
        if (two) return { // wings: one towel per hand, mirrored up and down
          grip: "corner",
          hands(t, w) { const a = w * t; const R = v(0.35 + 0.25 * Math.cos(a), 1.55 + 0.4 * Math.sin(a), 0.15); return { R, L: v(-R[0], R[1], R[2]) }; },
        };
        const amp = (demo.speed < 0.6 ? 0.28 : 0.45) * (demo.big ? 1.2 : 1);
        return {
          grip: "vertical",
          hands(t, w) {
            const x = amp * Math.sin(w * t);
            const z = 0.3 + 0.08 * Math.cos(w * t);
            return { R: v(x + 0.05, 1.95, z), L: v(x - 0.05, 1.1, z + 0.05) };
          },
        };
      }
      case "shovel": {
        return {
          grip: "spread",
          hands(t, w) {
            const a = w * t;
            const y = 1.55 + 0.5 * Math.cos(a), z = 0.15 + 0.35 * Math.sin(a);
            const spread = 0.12 + 0.13 * (Math.cos(a) + 1) / 2;
            return { R: v(spread, y, z), L: v(-spread, y, z) };
          },
        };
      }
      case "comb": {
        return {
          grip: "spread",
          hands(t, w) {
            const f = (w * t / TAU) % 1;
            const up = f < 0.35 ? smooth(f / 0.35) : 1 - smooth((f - 0.35) / 0.65);
            const y = 0.95 + 0.85 * up, z = 0.35;
            return { R: v(0.25, y, z), L: v(-0.25, y, z) };
          },
        };
      }
      case "whip": {
        return {
          grip: "corner",
          hands(t, w) {
            const f = (w * t / TAU) % 1;
            let R;
            const top = v(0.3, 2.0, -0.05), hit = v(0.2, 1.15, 0.55), rest = v(0.3, 1.3, 0.25);
            if (f < 0.45) R = lerp(rest, top, smooth(f / 0.45));
            else if (f < 0.58) R = lerp(top, hit, smooth((f - 0.45) / 0.13));
            else R = lerp(hit, rest, smooth((f - 0.58) / 0.42));
            const L = demo.twoHands ? add(R, v(-0.12, -0.02, 0)) : null;
            return { R, L, sameTowel: !!demo.twoHands };
          },
        };
      }
      case "flatspin": {
        return {
          grip: "center",
          hands(t, w) {
            const a = w * t;
            const R = v(0.15 + 0.03 * Math.cos(a), 1.95, 0.05 + 0.03 * Math.sin(a));
            return { R, L: two ? v(-R[0], R[1], R[2]) : null, angle: a };
          },
        };
      }
      case "throw": {
        return {
          grip: "corner", throws: true,
          hands(t, w) { const a = w * t; return { R: v(0.4 + 0.25 * Math.cos(a), 1.55 + 0.25 * Math.sin(a), 0.2), L: null }; },
        };
      }
      case "wave": {
        if (demo.oneHand) return {
          grip: "corner",
          hands(t, w) { const a = w * t; return { R: v(0.35 * Math.sin(a / 2), 1.5 + 0.22 * Math.sin(a), 0.35), L: null }; },
        };
        return {
          grip: "spread",
          hands(t, w) {
            const a = w * t;
            return { R: v(0.3, 1.5 + 0.25 * Math.sin(a + Math.PI / 2), 0.3 + 0.1 * Math.sin(2 * a)),
                     L: v(-0.3, 1.5 + 0.25 * Math.sin(a), 0.3 + 0.1 * Math.cos(2 * a)) };
          },
        };
      }
      case "recorded": {
        // Real arm motion from a filmed clip (pose tracking), one cycle, looped. Both hands hold the towel together.
        const D = demo.data, N = D.wR.length;
        const at = (key, ph) => { const f = ph * N, i = Math.floor(f) % N, j = (i + 1) % N, u = f - Math.floor(f); return lerp(D[key][i], D[key][j], u); };
        // centre of the hand circle; the towel corner sits a bit outside the hands (wrist rotation + grip), so we enlarge its circle
        const mean = [0, 1, 2].map((c) => D.wR.reduce((a, p, i) => a + (p[c] + D.wL[i][c]) / 2, 0) / N);
        const gain = demo.gain || 2.2;
        return {
          grip: "corner",
          hands(t, w) {
            const ph = ((w * t / TAU) % 1 + 1) % 1;
            const wR = at("wR", ph), wL = at("wL", ph);
            const m = lerp(wR, wL, 0.5), grip = add(mean, mul(sub(m, mean), gain));
            return { R: [grip[0], Math.max(grip[1], m[1]), grip[2]], L: null, armR: [at("sR", ph), at("eR", ph), wR], armL: [at("sL", ph), at("eL", ph), wL] };
          },
        };
      }
      case "fan": default: {
        return {
          grip: "fan",
          hands(t, w) { const a = w * t; return { R: v(0.3 + 0.2 * Math.sin(a), 1.55 + 0.08 * Math.cos(2 * a), 0.35), L: null }; },
        };
      }
    }
  }

  // ---------- Player ----------
  class TechniqueDemo {
    constructor(canvas, technique, opts = {}) {
      this.canvas = canvas; this.ctx = canvas.getContext("2d");
      this.t = technique; this.demo = technique.demo || { kind: "rotate" };
      this.tempo = 1; this.time = 0; this.running = false;
      this.colors = opts.colors || { body: "#3b2a20", towel: "#f4efe6", edge: "#b98a5c", line: "#d9c7b3" };
      this.build();
      this.resize();
      this._onResize = () => this.resize();
      root.addEventListener && root.addEventListener("resize", this._onResize);
    }
    build() {
      const d = this.demo;
      this.motion = makeMotion(d, { idx: (c, r) => r * 8 + c, cols: 8, rows: 6 });
      const grip = this.motion.grip;
      this.cloths = [];
      const count = d.twoTowels && grip !== "spread" && grip !== "vertical" ? 2 : 1;
      for (let n = 0; n < count; n++) {
        let cloth;
        if (grip === "corner") cloth = new Cloth(3, 9, 0.22 * (d.big ? 1.3 : 1), 0.8 * (d.big ? 1.4 : 1) * (d.twoTowels ? 0.85 : 1)); // folded strip
        else if (grip === "center") cloth = new Cloth(9, 9, 0.7, 0.7);
        else if (grip === "vertical") cloth = new Cloth(7, 7, 0.75 * (d.big ? 1.3 : 1), 0.8);
        else if (grip === "fan") cloth = null;
        else cloth = new Cloth(8, 6, 0.6, 0.5); // spread
        this.cloths.push(cloth);
      }
      this.thrown = false; this.throwTimer = 0;
      // warm up so the first frame looks right
      this.time = 0;
      const h = this.motion.hands(0, this.omega());
      this.cloths.forEach((cl, n) => { if (cl) this.placeCloth(cl, n === 0 ? h.R : (h.L || h.R)); });
      for (let i = 0; i < 90; i++) this.tick(1 / 60);
    }
    omega() { return TAU * (this.demo.speed || 1) * this.tempo; }
    placeCloth(cl, hand) {
      cl.place((i) => {
        const c = i % cl.cols, r = Math.floor(i / cl.cols);
        return add(hand, v((c / (cl.cols - 1) - 0.5) * cl.w * 0.3, -r / (cl.rows - 1) * cl.h, 0.02 * c));
      });
    }
    setTempo(x) { this.tempo = x; }
    pinCloth(cl, h, n) {
      const grip = this.motion.grip;
      cl.pin.clear();
      const hand = n === 0 ? h.R : h.L;
      if (grip === "corner") {
        if (this.thrown && n === 0) return;
        cl.pin.set(cl.idx(0, 0), hand); cl.pin.set(cl.idx(1, 0), add(hand, v(0.04, 0, 0))); cl.pin.set(cl.idx(2, 0), add(hand, v(0.08, 0, 0)));
      } else if (grip === "spread") {
        cl.pin.set(cl.idx(0, 0), h.L); cl.pin.set(cl.idx(cl.cols - 1, 0), h.R);
      } else if (grip === "vertical") {
        cl.pin.set(cl.idx(0, 0), h.R); cl.pin.set(cl.idx(0, cl.rows - 1), h.L);
      } else if (grip === "center") {
        const mid = Math.floor(cl.cols / 2), a = h.angle || 0, r = 0.09;
        cl.pin.set(cl.idx(mid, mid), hand);
        cl.pin.set(cl.idx(mid + 1, mid), add(hand, v(r * Math.cos(a), 0, r * Math.sin(a))));
        cl.pin.set(cl.idx(mid - 1, mid), add(hand, v(-r * Math.cos(a), 0, -r * Math.sin(a))));
        cl.pin.set(cl.idx(mid, mid + 1), add(hand, v(-r * Math.sin(a), 0, r * Math.cos(a))));
        cl.pin.set(cl.idx(mid, mid - 1), add(hand, v(r * Math.sin(a), 0, -r * Math.cos(a))));
      }
    }
    tick(dt) {
      const steps = 4, h_ = dt / steps;
      for (let s = 0; s < steps; s++) {
        this.time += h_;
        const w = this.omega();
        let h = this.motion.hands(this.time, w);
        // throw: let go at the top of every third turn, the hand follows the corner and catches it
        if (this.motion.throws) {
          const turn = Math.floor(w * this.time / TAU), frac = (w * this.time / TAU) % 1;
          if (!this.thrown && turn % 3 === 2 && frac > 0.2 && frac < 0.3) { this.thrown = true; this.throwTimer = 0; const cl = this.cloths[0]; const p = cl.p[0]; cl.q[0] = sub3(p, mul(v(-0.6, 3.2, 0.2), h_)); }
          if (this.thrown) {
            this.throwTimer += h_;
            const corner = this.cloths[0].p[0];
            const target = this.motion.hands(this.time, w).R;
            const catchHand = lerp(target, corner, Math.min(1, this.throwTimer * 2));
            h = { R: catchHand, L: null };
            if (this.throwTimer > 0.55 && len(sub3(corner, catchHand)) < 0.12) this.thrown = false;
            if (this.throwTimer > 1.6) this.thrown = false;
          }
          this.lastCatch = h.R;
        }
        this.hands = h;
        this.cloths.forEach((cl, n) => {
          if (!cl) return;
          if (n === 1 && !h.L) return;
          this.pinCloth(cl, h, n);
          cl.step(h_, 0.996);
        });
      }
    }
    resize() {
      const c = this.canvas, dpr = Math.min(2, (root.devicePixelRatio || 1));
      const w = c.clientWidth || 320, hgt = c.clientHeight || 320;
      c.width = Math.round(w * dpr); c.height = Math.round(hgt * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = hgt;
      this.draw();
    }
    // view: a little from the side and from above, so horizontal circles read as ellipses
    project(p) {
      const yaw = 0.42, pitch = 0.22;
      const x1 = p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw);
      const z1 = -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw);
      const y1 = (p[1] - 1.1) * Math.cos(pitch) - z1 * Math.sin(pitch);
      const z2 = (p[1] - 1.1) * Math.sin(pitch) + z1 * Math.cos(pitch);
      const s = Math.min(this.W, this.H) / 2.6;
      return [this.W / 2 + x1 * s, this.H * 0.52 - y1 * s, z2];
    }
    arm(shoulder, hand) {
      if (!hand) hand = shoulder[0] > 0 ? REST_R : REST_L;
      const d = sub(hand, shoulder), L = Math.min(len(d), 0.6), u = 0.3;
      const dir = mul(d, 1 / (len(d) || 1));
      const mid = add(shoulder, mul(dir, L / 2));
      const bend = Math.sqrt(Math.max(0, u * u - (L / 2) * (L / 2)));
      const out = v(Math.sign(shoulder[0]) * 0.7, -0.4, -0.5);
      const ol = len(out);
      const elbow = add(mid, mul(out, bend / ol));
      const reach = add(shoulder, mul(dir, L));
      return [shoulder, elbow, reach];
    }
    draw() {
      const ctx = this.ctx, C = this.colors;
      ctx.clearRect(0, 0, this.W, this.H);
      // floor, ceiling
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      const f1 = this.project(v(-1.2, 0, 0)), f2 = this.project(v(1.2, 0, 0));
      ctx.beginPath(); ctx.moveTo(f1[0], f1[1]); ctx.lineTo(f2[0], f2[1]); ctx.stroke();
      ctx.setLineDash([4, 6]);
      const c1 = this.project(v(-1.2, 2.25, 0)), c2 = this.project(v(1.2, 2.25, 0));
      ctx.beginPath(); ctx.moveTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.stroke();
      ctx.setLineDash([]);

      const h = this.hands || this.motion.hands(this.time, this.omega());
      const items = []; // depth-sorted: towel quads and limbs
      // towel quads
      this.cloths.forEach((cl, n) => {
        if (!cl || (n === 1 && !h.L)) return;
        for (let r = 0; r < cl.rows - 1; r++) for (let c = 0; c < cl.cols - 1; c++) {
          const a = cl.p[cl.idx(c, r)], b = cl.p[cl.idx(c + 1, r)], d = cl.p[cl.idx(c + 1, r + 1)], e = cl.p[cl.idx(c, r + 1)];
          const P = [a, b, d, e].map((p) => this.project(p));
          const nrm = cross(sub(b, a), sub(e, a));
          const shade = Math.abs(nrm[2]) / (len(nrm) || 1);
          items.push({ z: (P[0][2] + P[2][2]) / 2, draw: () => {
            ctx.fillStyle = shadeColor(C.towel, 0.72 + 0.28 * shade);
            ctx.strokeStyle = C.edge; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); ctx.fill(); ctx.stroke();
          } });
        }
      });
      // body
      const limb = (pts, wdt) => {
        const P = pts.map((p) => this.project(p));
        const z = P.reduce((s, p) => s + p[2], 0) / P.length;
        items.push({ z, draw: () => {
          ctx.strokeStyle = C.body; ctx.lineWidth = wdt; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.stroke();
        } });
      };
      const s = Math.min(this.W, this.H) / 2.6;
      limb([v(0.12, 0.02, 0), v(0.12, 0.5, 0), v(0.1, 0.95, 0)], 0.09 * s);
      limb([v(-0.12, 0.02, 0), v(-0.12, 0.5, 0), v(-0.1, 0.95, 0)], 0.09 * s);
      limb([v(0, 0.95, 0), v(0, 1.45, 0)], 0.2 * s);
      limb(h.armR ? [h.armL[0], h.armR[0]] : [SHOULDER_L, SHOULDER_R], 0.09 * s);
      limb(h.armR || this.arm(SHOULDER_R, h.R), 0.075 * s);
      limb(h.armL || this.arm(SHOULDER_L, h.L), 0.075 * s);
      const head = this.project(v(0, 1.68, 0));
      items.push({ z: head[2], draw: () => { ctx.fillStyle = C.body; ctx.beginPath(); ctx.arc(head[0], head[1], 0.11 * s, 0, TAU); ctx.fill(); } });
      // fan
      if (this.motion.grip === "fan" && h.R) {
        const P = this.project(h.R);
        items.push({ z: P[2] + 0.01, draw: () => {
          ctx.fillStyle = C.edge; ctx.beginPath();
          const ang = -Math.PI / 2 + 0.6 * Math.sin(this.omega() * this.time);
          ctx.moveTo(P[0], P[1]); ctx.arc(P[0], P[1], 0.32 * s, ang - 0.8, ang + 0.8); ctx.closePath(); ctx.fill();
        } });
      }
      items.sort((a, b) => b.z - a.z).forEach((it) => it.draw());
    }
    play() {
      if (this.running) return;
      this.running = true;
      let last = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        this.tick(dt); this.draw();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    pause() { this.running = false; cancelAnimationFrame(this.raf); }
    destroy() { this.pause(); root.removeEventListener && root.removeEventListener("resize", this._onResize); }
  }

  function sub3(a, b) { return sub(a, b); }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function shadeColor(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }

  root.TechniqueDemo = TechniqueDemo;
})(typeof window !== "undefined" ? window : globalThis);
