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

  const SHOULDER_R = v(0.13, 1.45, 0), SHOULDER_L = v(-0.13, 1.45, 0);
  const ENGINE_U = 28 / 0.3, REACH = (28 + 26 - 0.5) / ENGINE_U; // mascot arm: 0.30 + 0.28 m
  function reach(sh, p) { if (!p) return p; const d = sub(p, sh), l = len(d); return l > REACH ? add(sh, mul(d, REACH / l)) : p; }
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
        if (c < cols - 2) link(idx(c, r), idx(c + 2, r), 0.35);  // bending: terry folded double is fairly stiff
        if (r < rows - 2) link(idx(c, r), idx(c, r + 2), 0.35);
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
        // Side flag, as in the Aufguss.it tutorial: both hands on the same long edge, the top hand over the head,
        // the bottom hand at the hip. Each hand reaches far on its own side and only to the middle on the other.
        // The towel faces the guests at each end and turns edge-on as it reverses.
        const big = demo.big ? 1.2 : 1;
        return {
          grip: "vertical",
          hands(t, w) {
            const s = Math.sin(w * t), c = Math.cos(w * t);
            const top = v((0.3 + 0.17 * s) * big, 1.95 + 0.06 * (1 - s * s), 0.18 + 0.06 * c);
            const low = v((-0.12 + 0.4 * s) * big, 1.0 + 0.05 * (1 - s * s), 0.3 + 0.06 * c);
            return { R: top, L: low };
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
        // Comb, as in the Aufguss.it tutorial: both hands hold the top corners, gather the towel at the chest,
        // then snap apart so it bursts open and throws a puff of air. Alternates low (bottom benches)
        // and high, flung up over the head (top benches).
        return {
          grip: "spread",
          hands(t, w) {
            const cyc = w * t / TAU, f = ((cyc % 1) + 1) % 1, high = Math.floor(cyc) % 2 === 1;
            let open, lift;
            if (f < 0.22) { open = smooth(f / 0.22); lift = open; }            // snap apart
            else if (f < 0.5) { open = 1; lift = 1 - (high ? 0.15 : 0.3) * smooth((f - 0.22) / 0.28); } // hold, let it fly
            else { open = 1 - smooth((f - 0.5) / 0.5); lift = 0.7 * (1 - smooth((f - 0.5) / 0.5)); } // gather again
            const half = 0.06 + 0.3 * open;
            const y = high ? 1.45 + 0.55 * lift : 1.15 + 0.2 * lift, z = 0.25 + (high ? -0.12 : 0.2) * lift; // high: the towel flies up and back over the head
            return { R: v(half, y, z), L: v(-half, y, z) };
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
      case "keys": {
        // Authored from watching tutorials: keyframes [phase 0–1, right hand xyz, left hand xyz or null],
        // interpolated with a closed Catmull-Rom spline so the loop has no corners.
        const K = demo.keys.slice().sort((p, q) => p[0] - q[0]), n = K.length;
        const cr = (p0, p1, p2, p3, u) => p1.map((_, i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u * u + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u * u * u));
        const at = (ph, j) => {
          let i = n - 1; for (let m = 0; m < n; m++) if (K[m][0] <= ph) i = m;
          const k1 = K[i], k2 = K[(i + 1) % n], t1 = k1[0], t2 = k2[0] + (i + 1 >= n ? 1 : 0), p = ph < t1 ? ph + 1 : ph;
          const u = (p - t1) / ((t2 - t1) || 1), g = (m) => K[((m % n) + n) % n][j];
          return k1[j] ? cr(g(i - 1) || k1[j], k1[j], g(i + 1) || k1[j], g(i + 2) || k1[j], u) : null;
        };
        return {
          grip: demo.grip || "spread",
          hands(t, w) {
            const ph = ((w * t / TAU) % 1 + 1) % 1, R = at(ph, 1), L = at(ph, 2), out = { R, L, sameTowel: demo.grip === "corner" && !!K[0][2] };
            if (demo.spin) { // the whole body turns: hands are authored in the body frame and rotated about the vertical axis
              const th = TAU * demo.spin * ph, c = Math.cos(th), sn = Math.sin(th), rot = (p) => p && v(p[0] * c + p[2] * sn, p[1], -p[0] * sn + p[2] * c);
              Object.assign(out, { R: rot(R), L: rot(L), Rl: R, Ll: L, yaw: th });
            }
            return out;
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
      this.figure = opts.figure && opts.figure !== "stick" && root.PoseEngine ? opts.figure : null;
      if (this.figure) this.setupLayers();
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
        if (grip === "corner") cloth = new Cloth(4, 12, 0.375 * (d.big ? 1.33 : 1), 1.0 * (d.big ? 1.5 : 1) * (d.twoTowels ? 0.8 : 1)); // waving towel 100×75 cm folded double (Saunagut WM towel ≈ 0.66 kg)
        else if (grip === "center") cloth = new Cloth(9, 9, 0.7, 0.7);
        else if (grip === "vertical") cloth = new Cloth(7, 8, 0.75 * (d.big ? 1.3 : 1), 1.0);
        else if (grip === "fan") cloth = null;
        else cloth = new Cloth(8, 6, d.cloth ? d.cloth[0] : 0.75, d.cloth ? d.cloth[1] : 0.5); // open towel, top edge held
        this.cloths.push(cloth);
      }
      this.thrown = false; this.throwTimer = 0;
      // warm up so the first frame looks right
      this.time = 0;
      const h = this.motion.hands(0, this.omega());
      this.cloths.forEach((cl, n) => { if (cl) this.placeCloth(cl, n === 0 ? h.R : (h.L || h.R)); });
      for (let i = 0; i < 90; i++) this.tick(1 / 60);
    }
    // mascots have big heads: keep paws (and the towel corners they hold) out of the face
    clear(p) { // in the drawn (pitched) view, so what you see is what is cleared
      if (!p || !this.figure || !root.PoseEngine) return p;
      const HR = root.PoseEngine.STYLES.cat.head, U = ENGINE_U, cp = Math.cos(0.32), sp = Math.sin(0.32);
      const hx = 0, hy = (root.PoseEngine.SEG.neck + HR) / U, r = (HR + 8) / U;
      const px = p[0], py = (p[1] - SHOULDER_R[1]) * cp - p[2] * sp;
      const dx = px - hx, dy = py - hy, d = Math.hypot(dx, dy);
      if (d >= r) return p;
      const ux = d < 1e-3 ? Math.sign(p[0] || 1) : dx / d, uy = d < 1e-3 ? 0 : dy / d;
      const nx = hx + ux * r, ny = hy + uy * r;
      return v(nx, SHOULDER_R[1] + (ny + p[2] * sp) / cp, p[2]);
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
        cl.pin.set(cl.idx(0, 0), hand); cl.pin.set(cl.idx(1, 0), add(hand, v(0.07, 0, 0)));
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
        if (!h.armR && h.yaw == null) h = Object.assign({}, h, { R: this.clear(reach(SHOULDER_R, h.R)), L: this.clear(reach(SHOULDER_L, h.L)) });
        this.hands = h;
        this.cloths.forEach((cl, n) => {
          if (!cl) return;
          if (n === 1 && !h.L) return;
          this.pinCloth(cl, h, n);
          cl.step(h_, 0.998);
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
    setupLayers() {
      const c = this.canvas, wrap = document.createElement("div");
      wrap.className = "figwrap"; wrap.style.cssText = "position:relative;width:100%;height:" + (c.clientHeight || 300) + "px";
      c.parentNode.insertBefore(wrap, c);
      this.back = document.createElement("canvas"); this.svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svgEl.setAttribute("viewBox", "-30 -50 320 280"); // extra room above the head for the flying towel this.svgEl.setAttribute("aria-hidden", "true");
      for (const el of [this.back, this.svgEl, c]) { el.style.position = "absolute"; el.style.inset = "0"; el.style.width = "100%"; el.style.height = "100%"; wrap.appendChild(el); }
      c.style.background = "transparent"; this.back.className = c.className; wrap.style.background = getComputedStyle(c).backgroundColor; wrap.style.borderRadius = "12px"; wrap.style.margin = "8px 0";
      this.bctx = this.back.getContext("2d"); this.wrap = wrap;
    }
    drawAnimal() {
      // One mapping for everything: world metres → engine units (U per metre, shoulders at engine y=50, hip at 0).
      // The arms are solved with inverse kinematics so both paws sit exactly where the hands hold the towel.
      const E = root.PoseEngine, C = this.colors, h = this.hands || this.motion.hands(this.time, this.omega());
      const dpr = Math.min(2, root.devicePixelRatio || 1), W = this.W, H = this.H;
      if (this.back.width !== Math.round(W * dpr)) { this.back.width = Math.round(W * dpr); this.back.height = Math.round(H * dpr); this.bctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      const U = ENGINE_U, pitch = 0.32, cp = Math.cos(pitch), sp = Math.sin(pitch);
      const M = (p) => ({ x: p[0] * U, y: 50 + ((p[1] - SHOULDER_R[1]) * cp - p[2] * sp) * U });
      const deg = (r) => r * 180 / Math.PI;
      // 3D arm: the elbow sits on the circle allowed by the two segments, as close as possible to a natural "pole"
      // (elbows hang down when the hands are low, open outwards when they are high). Then everything is projected,
      // and the engine draws the projected (foreshortened) segment lengths.
      const A3 = 0.3, B3 = 0.28;
      const ik = (S2, Sw, T, side) => {
        let d = sub(T, Sw), l = len(d); const lm = A3 + B3 - 0.004; if (l > lm) { d = mul(d, lm / l); l = lm; } if (l < 0.05) { d = v(0, -0.05, 0.02); l = len(d); }
        const dir = mul(d, 1 / l), x = (A3 * A3 - B3 * B3 + l * l) / (2 * l), r = Math.sqrt(Math.max(0, A3 * A3 - x * x));
        const u = Math.max(0, Math.min(1, (T[1] - Sw[1]) / 0.3 + 0.3));
        const pole = add(mul(v(side * 0.35, -1, -0.3), 1 - u), mul(v(side, -0.25, -0.2), u));
        let pp = sub(pole, mul(dir, pole[0] * dir[0] + pole[1] * dir[1] + pole[2] * dir[2])), pl = len(pp) || 1;
        const Ew = add(add(Sw, mul(dir, x)), mul(pp, r / pl)), Tw = add(Sw, d);
        const e2 = M(Ew), t2 = M(Tw), s2 = M(Sw), ex = S2.x + e2.x - s2.x, ey = S2.y + e2.y - s2.y, tx = S2.x + t2.x - s2.x, ty = S2.y + t2.y - s2.y;
        return { a: [deg(Math.atan2(ey - S2.y, ex - S2.x)), deg(Math.atan2(ty - ey, tx - ex))], L: [Math.hypot(ex - S2.x, ey - S2.y), Math.hypot(tx - ex, ty - ey)] };
      };
      const handR = h.Rl || h.R || REST_R, handL = h.Ll || h.L || (h.sameTowel ? add(h.R, v(-0.1, -0.02, 0)) : (h.armR ? add(h.R, v(-0.08, -0.03, 0)) : REST_L));
      // the body leans a little into the swing (weight over the side where the hands are), knees soften
      const side = Math.max(-1, Math.min(1, ((handR[0] + handL[0]) / 2) / 0.35));
      this.lean = (this.lean ?? 0) * 0.85 + side * 0.15;
      const tAng = 90 - 6 * this.lean, perp = (tAng - 90) * Math.PI / 180, shc = { x: Math.cos(tAng * Math.PI / 180) * 50, y: Math.sin(tAng * Math.PI / 180) * 50 };
      const SN = { x: shc.x + Math.cos(perp) * 12, y: shc.y + Math.sin(perp) * 12 }, SF = { x: shc.x - Math.cos(perp) * 12, y: shc.y - Math.sin(perp) * 12 };
      const kn = 4 * Math.abs(this.lean);
      const iN = ik(SN, SHOULDER_R, handR, 1), iF = ik(SF, SHOULDER_L, handL, -1);
      const pose = { view: "front", t: tAng, aN: iN.a, aF: iF.a, LN: iN.L, LF: iF.L, lN: [-90 + 3 * this.lean - kn, -90 + kn, 0], lF: [-90 + 3 * this.lean + kn, -90 - kn, 180] };
      // keep the body still: cancel the engine's re-centring, which depends on where the arms are
      const J = E.compute(pose, { head: E.STYLES.cat.head }), HR = E.STYLES.cat.head;
      const xs = [J.hip, J.sh, ...J.armN, ...J.armF, ...J.legN, ...J.legF].map((p) => p.x).concat([J.head.x - HR, J.head.x + HR]);
      const cx = E.VB.w / 2 - (Math.min(...xs) + Math.max(...xs)) / 2, dyF = J.hip.y; // compute() lifted everything by dyF
      const cx0 = E.VB.w / 2;
      // turning body (twirls): squash and mirror the width by cos(yaw), the old paper-cut trick
      const sx = h.yaw == null ? 1 : (Math.cos(h.yaw) >= 0 ? 1 : -1) * (0.45 + 0.55 * Math.abs(Math.cos(h.yaw)));
      this.svgEl.innerHTML = `<g transform="translate(${cx0} 0) scale(${sx.toFixed(3)} 1) translate(${-cx0} 0)"><g transform="translate(${(cx0 - cx).toFixed(2)} 0)">${E.svgInner(pose, { style: "cat", animal: this.figure })}</g></g>`;
      const VX = -30, VY = -50, VW = 320, VH = 280, k = Math.min(W / VW, H / VH), ox = (W - VW * k) / 2 - VX * k, oy = (H - VH * k) / 2 - VY * k;
      const P = (p) => { const m = M(p); return [ox + (m.x + cx0) * k, oy + (E.VB.floor - (m.y + dyF)) * k, p[2]]; };
      const front = this.ctx, back = this.bctx;
      front.clearRect(0, 0, W, H); back.clearRect(0, 0, W, H);
      const behind = (z) => z < -0.06;
      this.cloths.forEach((cl, n) => {
        if (!cl || (n === 1 && !h.L)) return;
        const quads = [];
        for (let r = 0; r < cl.rows - 1; r++) for (let c = 0; c < cl.cols - 1; c++) {
          const A = cl.p[cl.idx(c, r)], B = cl.p[cl.idx(c + 1, r)], D = cl.p[cl.idx(c + 1, r + 1)], F = cl.p[cl.idx(c, r + 1)];
          const nrm = cross(sub(B, A), sub(F, A)), shade = Math.abs(nrm[2]) / (len(nrm) || 1);
          const z = (A[2] + D[2]) / 2;
          quads.push({ Q: [A, B, D, F].map(P), z, shade, layer: behind(z) ? back : front });
        }
        quads.sort((p, q) => p.z - q.z).forEach(({ Q, shade, layer }) => {
          layer.fillStyle = shadeColor(C.towel, 0.78 + 0.22 * shade); layer.strokeStyle = layer.fillStyle; layer.lineWidth = 1.2; layer.lineJoin = "round";
          layer.beginPath(); layer.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < 4; i++) layer.lineTo(Q[i][0], Q[i][1]); layer.closePath(); layer.fill(); layer.stroke();
        });
        // hem along the free edge
        const free = this.motion.grip === "vertical" ? Array.from({ length: cl.rows }, (_, r) => cl.idx(cl.cols - 1, r)) : Array.from({ length: cl.cols }, (_, c) => cl.idx(c, cl.rows - 1));
        const hem = free.map((i) => P(cl.p[i])), hz = cl.p[free[0]][2], hl = behind(hz) ? back : front;
        hl.strokeStyle = C.edge; hl.lineWidth = 2.2; hl.lineCap = "round"; hl.beginPath(); hem.forEach((q, i) => (i ? hl.lineTo(q[0], q[1]) : hl.moveTo(q[0], q[1]))); hl.stroke();
      });
      if (this.motion.grip === "fan" && h.R) { // a sauna fan in the paw
        const q = P(h.R), R = 0.3 * U * k, ang = -Math.PI / 2 + 0.6 * Math.sin(this.omega() * this.time);
        front.fillStyle = C.edge; front.strokeStyle = shadeColor(C.towel, 0.6); front.lineWidth = 1;
        front.beginPath(); front.moveTo(q[0], q[1]); front.arc(q[0], q[1], R, ang - 0.8, ang + 0.8); front.closePath(); front.fill();
        for (let i = -3; i <= 3; i++) { const u = ang + i * 0.25; front.beginPath(); front.moveTo(q[0], q[1]); front.lineTo(q[0] + Math.cos(u) * R, q[1] + Math.sin(u) * R); front.stroke(); }
      }
    }
    draw() {
      if (this.figure) return this.drawAnimal();
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
            ctx.fillStyle = shadeColor(C.towel, 0.78 + 0.22 * shade); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2; ctx.lineJoin = "round";
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
    destroy() { this.pause(); root.removeEventListener && root.removeEventListener("resize", this._onResize); if (this.wrap) { this.wrap.parentNode.insertBefore(this.canvas, this.wrap); this.wrap.remove(); } }
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
