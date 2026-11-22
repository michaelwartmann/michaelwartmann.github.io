// Your sauna in 3D: the floor plan becomes a room with stove, benches and guests.
// A coarse 3D air model (stable fluids) moves heat and steam; buoyancy from both; the guests' skin is the
// coldest surface, so they show how much heat arrives (convection + condensation).
// The sauna master runs the classic routine: pour, wait for the mushroom, wave across the stove from behind
// it while sweeping left and right, then step in front and walk one loop around the stove, waving at the guests.
(function (root) {
  "use strict";
  const TAU = Math.PI * 2, RV = 461.5, L_V = 2.26e6, T_SKIN = 38;
  const es = (T) => 611.2 * Math.exp(17.62 * T / (243.12 + T));
  const rhoSat = (T) => es(T) / (RV * (T + 273.15)) * 1000;
  const RHO_SKIN = rhoSat(T_SKIN);
  function dewPoint(T, Wg) { const e = Wg / 1000 * RV * (T + 273.15); if (e <= 1) return -40; const g = Math.log(e / 611.2); return 243.12 * g / (17.62 - g); }
  function skin(T, Wg, sp) { const h = 5 + 7 * Math.sqrt(sp + 0.02), conv = h * (T - T_SKIN), lat = Math.max(0, h / 1000 * L_V * (Wg - RHO_SKIN) / 1000); return { h, conv, lat, total: conv + lat, feels: T + lat / h }; }
  const v3 = (x, y, z) => [x, y, z], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm = (a) => { const l = Math.hypot(...a) || 1; return mul(a, 1 / l); };
  function heatColor(T) {
    const st = [[30, [52, 92, 140]], [50, [70, 150, 160]], [65, [235, 190, 90]], [85, [232, 120, 50]], [100, [200, 50, 35]], [140, [150, 25, 30]]];
    if (T <= st[0][0]) return st[0][1];
    for (let i = 1; i < st.length; i++) if (T <= st[i][0]) { const [t0, c0] = st[i - 1], [t1, c1] = st[i], f = (T - t0) / (t1 - t0); return c0.map((c, k) => c + (c1[k] - c) * f); }
    return st[st.length - 1][1];
  }

  // ---------- the room as a grid ----------
  class Room {
    constructor(plan) {
      const PL = root.AufgussPlan, P = plan.pts;
      this.plan = plan; this.H = plan.h;
      const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]);
      this.x0 = Math.min(...xs); this.z0 = Math.min(...zs); const W = Math.max(...xs) - this.x0, D = Math.max(...zs) - this.z0;
      const vol = W * D * this.H; this.c = Math.max(0.1, Math.cbrt(vol / 9000)); const c = this.c;
      this.NX = Math.ceil(W / c); this.NY = Math.ceil(this.H / c); this.NZ = Math.ceil(D / c);
      const NX = this.NX, NY = this.NY, NZ = this.NZ; this.SX = NX + 2; this.SXY = (NX + 2) * (NY + 2); this.N = this.SXY * (NZ + 2);
      const N = this.N; ["u", "v", "w", "u0", "v0", "w0", "T", "T0", "W", "W0", "p", "dv", "base"].forEach((k) => (this[k] = new Float32Array(N)));
      this.solid = new Uint8Array(N); this.heat = new Uint8Array(N);
      this.benches = PL.benches(plan); this.seats = PL.seats(plan);
      const ov = plan.oven || [this.x0 + 0.4, this.z0 + 0.4]; this.oven = { x: ov[0], z: ov[1], h: 0.85, r: 0.27 };
      for (let k = 0; k <= NZ + 1; k++) for (let j = 0; j <= NY + 1; j++) for (let i = 0; i <= NX + 1; i++) {
        const x = this.x0 + (i - 0.5) * c, y = (j - 0.5) * c, z = this.z0 + (k - 0.5) * c, id = this.ix(i, j, k);
        let s = i === 0 || j === 0 || k === 0 || i === NX + 1 || j === NY + 1 || k === NZ + 1 || !PL.inside(P, x, z);
        if (!s && Math.abs(x - this.oven.x) < this.oven.r && Math.abs(z - this.oven.z) < this.oven.r && y < this.oven.h) s = true;
        if (!s) for (const b of this.benches) { const rx = x - b.a[0], rz = z - b.a[1], t = rx * b.dir[0] + rz * b.dir[1], d = rx * b.n[0] + rz * b.n[1]; if (t >= -0.02 && t <= b.L + 0.02 && d >= b.d0 - 0.01 && d < b.d1 && y < b.h) { s = true; break; } }
        this.solid[id] = s ? 1 : 0;
        if (!s && Math.abs(x - this.oven.x) < this.oven.r && Math.abs(z - this.oven.z) < this.oven.r && y < this.oven.h + 0.2) this.heat[id] = 1;
        if (!s && Math.abs(x - this.oven.x) < this.oven.r + 0.1 && Math.abs(z - this.oven.z) < this.oven.r + 0.1 && y < this.oven.h + 0.7) this.heat[id] |= 2; // where the fresh steam goes
        this.base[id] = 40 + 60 * Math.pow(Math.max(0, Math.min(1, y / this.H)), 0.75);
      }
      // fluid cells and the solid cells that touch them (for the scalar boundary)
      const fl = [], bd = [], off = [1, -1, this.SX, -this.SX, this.SXY, -this.SXY];
      for (let id = 0; id < N; id++) {
        if (!this.solid[id]) fl.push(id);
        else { const nb = off.map((o) => id + o).filter((q) => q >= 0 && q < N && !this.solid[q]); if (nb.length) bd.push([id, nb]); }
      }
      this.fluid = Int32Array.from(fl); this.border = bd; this.off = off;
      this.reset();
    }
    ix(i, j, k) { return i + this.SX * j + this.SXY * k; }
    reset() { this.u.fill(0); this.v.fill(0); this.w.fill(0); this.T.set(this.base); this.W.fill(22); this.pour = 0; this.poured = 0; this.pending = 0; this.forces = []; this.t = 0; }
    pourWater(g) { this.pending += g; this.pour = 2.5; }
    scalarBnd(f) { for (const [id, nb] of this.border) { let s = 0; for (const q of nb) s += f[q]; f[id] = s / nb.length; } }
    velBnd() { const { u, v, w, solid, N } = this; for (let id = 0; id < N; id++) if (solid[id]) { u[id] = 0; v[id] = 0; w[id] = 0; } }
    project(it = 14) {
      const { u, v, w, p, dv, solid, fluid, SX, SXY } = this;
      for (const id of fluid) { dv[id] = -0.5 * (u[id + 1] - u[id - 1] + v[id + SX] - v[id - SX] + w[id + SXY] - w[id - SXY]); p[id] = 0; }
      for (let n = 0; n < it; n++) for (const id of fluid) {
        const pc = p[id];
        p[id] = (dv[id] + (solid[id + 1] ? pc : p[id + 1]) + (solid[id - 1] ? pc : p[id - 1]) + (solid[id + SX] ? pc : p[id + SX]) + (solid[id - SX] ? pc : p[id - SX]) + (solid[id + SXY] ? pc : p[id + SXY]) + (solid[id - SXY] ? pc : p[id - SXY])) / 6;
      }
      for (const id of fluid) {
        const pc = p[id];
        u[id] -= 0.5 * ((solid[id + 1] ? pc : p[id + 1]) - (solid[id - 1] ? pc : p[id - 1]));
        v[id] -= 0.5 * ((solid[id + SX] ? pc : p[id + SX]) - (solid[id - SX] ? pc : p[id - SX]));
        w[id] -= 0.5 * ((solid[id + SXY] ? pc : p[id + SXY]) - (solid[id - SXY] ? pc : p[id - SXY]));
      }
      this.velBnd();
    }
    advect(d, d0, dt) {
      const { u, v, w, fluid, SX, SXY, NX, NY, NZ } = this, k0 = dt / this.c;
      for (const id of fluid) {
        const k = Math.floor(id / SXY), r = id - k * SXY, j = Math.floor(r / SX), i = r - j * SX;
        let x = Math.max(0.5, Math.min(NX + 0.5, i - k0 * u[id])), y = Math.max(0.5, Math.min(NY + 0.5, j - k0 * v[id])), z = Math.max(0.5, Math.min(NZ + 0.5, k - k0 * w[id]));
        const i0 = x | 0, j0 = y | 0, kk = z | 0, a = x - i0, b = y - j0, cc = z - kk, q = i0 + SX * j0 + SXY * kk;
        d[id] = (1 - cc) * ((1 - b) * ((1 - a) * d0[q] + a * d0[q + 1]) + b * ((1 - a) * d0[q + SX] + a * d0[q + SX + 1]))
          + cc * ((1 - b) * ((1 - a) * d0[q + SXY] + a * d0[q + SXY + 1]) + b * ((1 - a) * d0[q + SXY + SX] + a * d0[q + SXY + SX + 1]));
      }
    }
    step(dt) {
      const { u, v, w, T, W, fluid, heat, SX, SXY, c } = this; this.t += dt;
      let tm = 0; for (const id of fluid) tm += T[id]; tm /= fluid.length;
      const kw = this.plan.kw || 9, stoneT = 90 + kw * 12;
      const F = this.forces;
      for (const id of fluid) {
        v[id] += dt * 9.81 * 0.3 * ((T[id] - tm) / (tm + 273.15) + 0.38 * (W[id] - 22) / 1000 / 0.97);
        if (heat[id] & 1) T[id] += (stoneT - T[id]) * Math.min(1, dt * 1.2);
        T[id] += (this.base[id] - T[id]) * dt * 0.03;
        W[id] += (22 - W[id]) * dt * 0.004; // slow exchange with fresh air
        if (F.length) {
          const k = Math.floor(id / SXY), r = id - k * SXY, j = Math.floor(r / SX), i = r - j * SX, x = this.x0 + (i - 0.5) * c, y = (j - 0.5) * c, z = this.z0 + (k - 0.5) * c;
          for (const f of F) { const dx = x - f.p[0], dy = y - f.p[1], dz = z - f.p[2], q = (dx * dx + dy * dy + dz * dz) / (f.r * f.r); if (q < 1) { const s = (1 - q) * dt * f.k; u[id] += f.d[0] * s; v[id] += f.d[1] * s; w[id] += f.d[2] * s; } }
        }
        u[id] *= 1 - dt * 0.3; v[id] *= 1 - dt * 0.3; w[id] *= 1 - dt * 0.3;
      }
      // steam from the stones: all of the water ends up in the air (g), at most saturated steam (~590 g/m³)
      if (this.pending > 0) {
        if (!this.steamCells) this.steamCells = Array.from(fluid).filter((id) => heat[id] & 2);
        const cv = c * c * c, rate = Math.min(this.pending, (this.pour > 0 ? 250 : 120) * dt);
        let room_ = 0; for (const id of this.steamCells) room_ += Math.max(0, 590 - W[id]) * cv;
        const put = Math.min(rate, room_);
        if (put > 0) for (const id of this.steamCells) { const share = Math.max(0, 590 - W[id]) * cv / room_; W[id] += put * share / cv; T[id] += (105 - T[id]) * dt * 1.5; v[id] += 6 * dt; }
        this.pending -= put; this.poured += put / 1000;
      }
      if (this.pour > 0) this.pour -= dt;
      this.velBnd(); this.project();
      this.u0.set(u); this.v0.set(v); this.w0.set(w);
      this.advect(u, this.u0, dt); this.advect(v, this.v0, dt); this.advect(w, this.w0, dt);
      this.velBnd(); this.project();
      this.scalarBnd(T); this.scalarBnd(W);
      this.T0.set(T); this.advect(T, this.T0, dt); this.W0.set(W); this.advect(W, this.W0, dt);
    }
    at(f, x, y, z) {
      const i = Math.max(1, Math.min(this.NX, Math.floor((x - this.x0) / this.c) + 1)), j = Math.max(1, Math.min(this.NY, Math.floor(y / this.c) + 1)), k = Math.max(1, Math.min(this.NZ, Math.floor((z - this.z0) / this.c) + 1));
      return f[this.ix(i, j, k)];
    }
    speed(x, y, z) { return Math.hypot(this.at(this.u, x, y, z), this.at(this.v, x, y, z), this.at(this.w, x, y, z)); }
  }

  // ---------- the routine ----------
  // returns where the master stands, where the towel pushes and in which direction, at routine time t
  function routine(room, t) {
    const o = [room.oven.x, room.oven.z], S = room.seats, PL = root.AufgussPlan, P = room.plan.pts;
    const g = S.length ? S.reduce((a, s) => [a[0] + s.x / S.length, a[1] + s.y / S.length], [0, 0]) : [o[0] + 1, o[1]];
    let d = [g[0] - o[0], g[1] - o[1]]; const dl = Math.hypot(...d) || 1; d = [d[0] / dl, d[1] / dl];
    const free = (p) => PL.inside(P, p[0], p[1]) && !(Math.abs(p[0] - o[0]) < 0.4 && Math.abs(p[1] - o[1]) < 0.4) && room.at(room.solid, p[0], 0.3, p[1]) === 0;
    const toward = (p, q, f) => { // walk from p towards q until free
      for (let k = 0; k <= 10; k++) { const r = [p[0] + (q[0] - p[0]) * k / 10, p[1] + (q[1] - p[1]) * k / 10]; if (free(r)) return r; }
      return q;
    };
    const behind = toward([o[0] - d[0] * 0.75, o[1] - d[1] * 0.75], [o[0] + d[1] * 0.7, o[1] - d[0] * 0.7]);
    const T_POUR = 4, T_WAIT = 10, T_P1 = 26, T_P2 = 48;
    if (t < T_POUR) return { phase: "pour", pos: toward([o[0] + d[0] * 0.6, o[1] + d[1] * 0.6], g), face: [-d[0], -d[1]], pour: true };
    if (t < T_WAIT) return { phase: "wait", pos: toward([o[0] + d[0] * 0.6 - d[1] * 0.5, o[1] + d[1] * 0.6 + d[0] * 0.5], g), face: [-d[0], -d[1]] };
    if (t < T_P1) { // behind the stove: wave across it, sweeping left and right
      const sw = Math.sin((t - T_WAIT) * TAU / 3.2) * 0.75, ca = Math.cos(sw), sa = Math.sin(sw), dir = [d[0] * ca - d[1] * sa, d[0] * sa + d[1] * ca];
      const hand = 1.75 + 0.18 * Math.sin((t - T_WAIT) * TAU * 0.9);
      return { phase: "across", pos: behind, face: dir, push: { p: [o[0] - d[0] * 0.15, hand, o[1] - d[1] * 0.15], d: [dir[0] * 1.6, -0.25, dir[1] * 1.6], r: 0.5, k: 9 }, wave: t };
    }
    if (t < T_P2) { // one loop around the stove, between stove and benches, waving at the guests
      const f = (t - T_P1) / (T_P2 - T_P1), a0 = Math.atan2(d[1], d[0]) - Math.PI * 0.55, ang = a0 + f * TAU, R = 0.85;
      const want = [o[0] + Math.cos(ang) * R, o[1] + Math.sin(ang) * R], pos = free(want) ? want : toward(want, g);
      let near = null, best = 1e9; for (const s of S) { const dd = Math.hypot(s.x - pos[0], s.y - pos[1]); if (dd < best) { best = dd; near = s; } }
      const tgt = near ? [near.x, near.y] : g, dir0 = [tgt[0] - pos[0], tgt[1] - pos[1]], l = Math.hypot(...dir0) || 1, dir = [dir0[0] / l, dir0[1] / l];
      const hy = near ? near.head - 0.1 : 1.5;
      return { phase: "loop", pos, face: dir, push: { p: [pos[0] + dir[0] * 0.45, hy + 0.1 * Math.sin(t * TAU), pos[1] + dir[1] * 0.45], d: [dir[0] * 1.8, -0.15, dir[1] * 1.8], r: 0.5, k: 10 }, wave: t };
    }
    return { phase: "done", pos: toward([o[0] + d[0] * 0.6 - d[1] * 0.5, o[1] + d[1] * 0.6 + d[0] * 0.5], g), face: [-d[0], -d[1]] };
  }

  // ---------- drawing ----------
  function view3d(cv, getRoom, lang) {
    const ctx = cv.getContext("2d"), tr = (en, de) => (lang === "de" ? de : en);
    const cam = { yaw: 0.7, pitch: 0.55, dist: 6 };
    let W, H, P, eye;
    function size() { const dpr = Math.min(2, root.devicePixelRatio || 1), r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    let framed = null;
    function frameRoom(room) { // look from the stove side towards the benches, close enough to fill the view
      const P_ = room.plan.pts, xs = P_.map((p) => p[0]), zs = P_.map((p) => p[1]), span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), room.H);
      const S = room.seats, o = room.oven, g = S.length ? S.reduce((a, s) => [a[0] + s.x / S.length, a[1] + s.y / S.length], [0, 0]) : [o.x + 1, o.z];
      cam.yaw = Math.atan2(o.x - g[0], o.z - g[1]) + 0.35; cam.pitch = 0.45; cam.dist = 1.5 * span + 1.6; framed = room;
    }
    function camera(room) {
      if (framed !== room) frameRoom(room);
      const P_ = room.plan.pts, cx = P_.reduce((s, p) => s + p[0], 0) / P_.length, cz = P_.reduce((s, p) => s + p[1], 0) / P_.length, tgt = [cx, room.H * 0.45, cz];
      eye = add(tgt, [Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist, Math.sin(cam.pitch) * cam.dist, Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist]);
      const fw = norm(sub(tgt, eye)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw), f = Math.min(W, H) * 1.2;
      P = (p) => { const d = sub(p, eye), z = dot(d, fw); return [W / 2 + dot(d, rt) * f / z, H * 0.5 - dot(d, up) * f / z, z, f / z]; };
    }
    const opt = { steam: true, flow: true, layer: 0 };
    const tracers = [];
    function draw(room, master, guests) {
      if (!W) size(); camera(room); ctx.clearRect(0, 0, W, H);
      const items = [], Pp = room.plan.pts, Hc = room.H;
      const poly = (pts, fill, stroke, z) => { const s = pts.map(P); items.push({ z: z ?? s.reduce((a, q) => a + q[2], 0) / s.length, d: () => { ctx.beginPath(); s.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); } } }); };
      // floor
      { const s = Pp.map((p) => P([p[0], 0, p[1]])); ctx.fillStyle = "#d9b58c"; ctx.beginPath(); s.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#7a3e1d"; ctx.lineWidth = 2; ctx.stroke(); }
      // walls: the ones facing away from the camera are drawn, the near ones only as an outline (cut-away)
      Pp.forEach((p, i) => {
        const q = Pp[(i + 1) % Pp.length], n = root.AufgussPlan.inward(Pp, i).n, mid = [(p[0] + q[0]) / 2, Hc / 2, (p[1] + q[1]) / 2], toE = sub(eye, mid);
        const far = toE[0] * n[0] + toE[2] * n[1] > 0;
        const quad = [[p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], Hc, q[1]], [p[0], Hc, p[1]]];
        if (far) poly(quad, "rgba(196,150,100,0.55)", "rgba(122,62,29,0.5)", 1e9);
        else { const s = quad.map(P); items.push({ z: -1e9, d: () => { ctx.strokeStyle = "rgba(122,62,29,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s[2][0], s[2][1]); ctx.lineTo(s[3][0], s[3][1]); ctx.moveTo(s[1][0], s[1][1]); ctx.lineTo(s[2][0], s[2][1]); ctx.stroke(); } }); }
      });
      // benches as boxes
      for (const b of room.benches) {
        const pt = (t, d, y) => [b.a[0] + b.dir[0] * t + b.n[0] * d, y, b.a[1] + b.dir[1] * t + b.n[1] * d];
        const top = [pt(0, b.d0, b.h), pt(b.L, b.d0, b.h), pt(b.L, b.d1, b.h), pt(0, b.d1, b.h)], front = [pt(0, b.d1, 0), pt(b.L, b.d1, 0), pt(b.L, b.d1, b.h), pt(0, b.d1, b.h)];
        poly(front, "#9b6235", "rgba(60,30,10,0.4)"); poly(top, "#c98b4f", "rgba(60,30,10,0.4)");
      }
      // stove with stones
      { const o = room.oven, r = o.r, h = o.h, c = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([a, b]) => [o.x + a, o.z + b]);
        c.forEach((p, i) => { const q = c[(i + 1) % 4]; poly([[p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], h, q[1]], [p[0], h, p[1]]], "#4c3f37", "#2b221d"); });
        poly(c.map((p) => [p[0], h, p[1]]), room.pour > 0 ? "#b08a78" : "#7d7570", "#2b221d"); }
      // guests
      guests.forEach((g) => {
        const hot = Math.min(1, Math.max(0, (g.s.total - 450) / 1100)), col = `rgb(${Math.round(226 + 29 * hot)},${Math.round(186 - 120 * hot)},${Math.round(150 - 110 * hot)})`;
        const seat = [g.x, g.seatH, g.y], knee = [g.x + g.n[0] * 0.42, g.seatH + 0.02, g.y + g.n[1] * 0.42], sh = [g.x - g.n[0] * 0.04, g.seatH + 0.5, g.y - g.n[1] * 0.04], hd = [g.x - g.n[0] * 0.02, g.head, g.y - g.n[1] * 0.02];
        cap(items, seat, sh, 0.3, col); cap(items, seat, knee, 0.15, col); cap(items, knee, [knee[0] + g.n[0] * 0.03, Math.max(0.05, g.seatH - 0.45), knee[2] + g.n[1] * 0.03], 0.11, col);
        ball(items, hd, 0.11, col, g.warn ? "#c0471f" : "#2b1d14");
      });
      // the sauna master (a bear) with a towel
      if (master) {
        const m = master, p = [m.pos[0], 0, m.pos[1]], f = [m.face[0], 0, m.face[1]], rt = [f[2], 0, -f[0]], fur = "#a0714a";
        const hip = add(p, [0, 0.95, 0]), sh = add(p, [0, 1.42, 0]);
        for (const s of [1, -1]) { const h0 = add(hip, mul(rt, 0.1 * s)); cap(items, h0, add(add(p, mul(rt, 0.11 * s)), [0, 0.05, 0]), 0.14, fur); }
        cap(items, hip, sh, 0.34, fur); ball(items, add(p, [0, 1.68, 0]), 0.15, fur, "#2b1d14");
        const ph = (m.wave || 0) * TAU * 1.1, hand = add(add(sh, mul(f, 0.35)), [0.15 * Math.sin(ph), 0.45 + 0.1 * Math.cos(ph), 0]);
        cap(items, add(sh, mul(rt, 0.18)), hand, 0.1, fur); cap(items, add(sh, mul(rt, -0.18)), add(hand, mul(rt, -0.08)), 0.1, fur);
        if (m.push) { // the towel, flying in the push direction
          const tip = add(hand, add(mul([m.push.d[0], 0, m.push.d[2]], 0.28), [0, -0.35 + 0.2 * Math.sin(ph * 2), 0])), side = mul(rt, 0.18);
          poly([sub(hand, side), add(hand, side), add(tip, side), sub(tip, side)], "rgba(248,243,232,0.95)", "#c0703a");
        } else if (m.pour) { poly([hand, add(hand, mul(f, 0.4)), add(add(hand, mul(f, 0.4)), [0, -0.05, 0]), add(hand, [0, -0.05, 0])], "#7a5a3a"); }
      }
      // heat layer (horizontal slice)
      if (opt.layer > 0) {
        const y = opt.layer, c = room.c;
        for (let k = 1; k <= room.NZ; k++) for (let i = 1; i <= room.NX; i++) {
          const x = room.x0 + (i - 1) * c, z = room.z0 + (k - 1) * c, id = room.ix(i, Math.min(room.NY, Math.floor(y / c) + 1), k); if (room.solid[id]) continue;
          const col = heatColor(room.T[id]); poly([[x, y, z], [x + c, y, z], [x + c, y, z + c], [x, y, z + c]], `rgba(${col.map(Math.round).join(",")},0.55)`);
        }
      }
      // steam: one soft disc per humid cell (white on white is order-independent, but we keep it in the depth sort)
      if (opt.steam) {
        const c = room.c, Wf = room.W;
        for (const id of room.fluid) {
          const wv = Wf[id]; if (wv < 70) continue;
          const k = Math.floor(id / room.SXY), r = id - k * room.SXY, j = Math.floor(r / room.SX), i = r - j * room.SX;
          const s = P([room.x0 + (i - 0.5) * c, (j - 0.5) * c, room.z0 + (k - 0.5) * c]); if (s[2] <= 0.1) continue;
          const a = Math.min(0.3, (wv - 70) / 800), rad = c * 0.9 * s[3];
          items.push({ z: s[2], d: () => { ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(s[0], s[1], rad, 0, TAU); ctx.fill(); } });
        }
      }
      items.sort((a, b) => b.z - a.z).forEach((it) => it.d());
      // flow tracers
      if (opt.flow) {
        while (tracers.length < 260) tracers.push(newTracer(room));
        ctx.strokeStyle = "rgba(63,111,128,0.6)"; ctx.lineWidth = 1.2;
        for (const t of tracers) {
          const u = room.at(room.u, ...t.p), vv = room.at(room.v, ...t.p), w = room.at(room.w, ...t.p), sp = Math.hypot(u, vv, w);
          if (sp > 0.05) { const a = P(t.p), b = P(sub(t.p, mul([u, vv, w], 0.15))); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
        }
      }
    }
    function newTracer(room) { for (let n = 0; n < 30; n++) { const id = room.fluid[(Math.random() * room.fluid.length) | 0], k = Math.floor(id / room.SXY), r = id - k * room.SXY, j = Math.floor(r / room.SX), i = r - j * room.SX; return { p: [room.x0 + (i - Math.random()) * room.c, (j - Math.random()) * room.c, room.z0 + (k - Math.random()) * room.c], age: 2 + Math.random() * 3 }; } }
    function moveTracers(room, dt) { for (let n = 0; n < tracers.length; n++) { const t = tracers[n]; t.p = add(t.p, mul([room.at(room.u, ...t.p), room.at(room.v, ...t.p), room.at(room.w, ...t.p)], dt)); t.age -= dt; if (t.age < 0 || room.at(room.solid, ...t.p)) tracers[n] = newTracer(room); } }
    function cap(items, a, b, w, col) { const A = P(a), B = P(b); items.push({ z: (A[2] + B[2]) / 2, d: () => { const px = w * (A[3] + B[3]) / 2; ctx.lineCap = "round"; ctx.strokeStyle = "#2b1d14"; ctx.lineWidth = px + 3; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = px; ctx.stroke(); } }); }
    function ball(items, c, r, col, line) { const C = P(c); items.push({ z: C[2] - 0.01, d: () => { ctx.fillStyle = col; ctx.strokeStyle = line; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(C[0], C[1], r * C[3], 0, TAU); ctx.fill(); ctx.stroke(); } }); }
    // orbit
    let drag = null; const ptrs = new Map();
    cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist, pinch: ptrs.size === 2 ? dist2() : 0 }; });
    const dist2 = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    cv.addEventListener("pointermove", (e) => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (!drag) return; if (ptrs.size === 2 && drag.pinch) { cam.dist = Math.max(2.5, Math.min(14, drag.dist * drag.pinch / dist2())); return; } cam.yaw = drag.yaw - (e.clientX - drag.x) * 0.01; cam.pitch = Math.max(0.05, Math.min(1.45, drag.pitch + (e.clientY - drag.y) * 0.008)); });
    const up = (e) => { ptrs.delete(e.pointerId); drag = null; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", (e) => { cam.dist = Math.max(2.5, Math.min(14, cam.dist * (e.deltaY > 0 ? 1.08 : 0.93))); e.preventDefault(); }, { passive: false });
    root.addEventListener("resize", size);
    return { draw, moveTracers, opt, cam, size, reset() { tracers.length = 0; } };
  }

  // ---------- page ----------
  function mount(el, lang) {
    const tr = (en, de) => (lang === "de" ? de : en);
    el.innerHTML = `
      <canvas class="s3cv" aria-label="${tr("Your sauna in 3D. Drag to turn, pinch or scroll to zoom.", "Deine Sauna in 3D. Ziehen zum Drehen, Zwei-Finger oder Mausrad zum Zoomen.")}"></canvas>
      <div class="controls">
        <button id="s3Run" class="primary">${tr("Infusion with waving", "Aufguss mit Wedeln")}</button>
        <button id="s3Pour">${tr("Only pour", "Nur aufgießen")}</button>
        <button id="s3Reset">${tr("Reset", "Neu")}</button>
        <label>${tr("Speed", "Tempo")} <select id="s3Speed"><option value="1">1×</option><option value="2" selected>2×</option><option value="4">4×</option><option value="8">8×</option></select></label>
      </div>
      <div class="controls">
        <label><input type="checkbox" id="s3Steam" checked> ${tr("steam", "Dampf")}</label>
        <label><input type="checkbox" id="s3Flow" checked> ${tr("air flow", "Luftströmung")}</label>
        <label>${tr("Heat layer", "Wärmeschicht")} <select id="s3Layer"><option value="0">${tr("off", "aus")}</option><option value="1.0">1,0 m</option><option value="1.6">1,6 m</option><option value="2.0">2,0 m</option></select></label>
      </div>
      <p class="hint" id="s3Phase" aria-live="polite"></p>
      <div id="s3Out" class="s3out"></div>`;
    let room = new Room(root.AufgussPlan.load()), t = -1, run = false, speed = 2, raf = 0, warmed = false;
    const cv = el.querySelector(".s3cv"), view = view3d(cv, () => room, lang);
    function guests() {
      return room.seats.map((s) => {
        const T = room.at(room.T, s.x, s.head, s.y), Wg = room.at(room.W, s.x, s.head, s.y), sp = room.speed(s.x, s.head, s.y), k = skin(T, Wg, sp), td = dewPoint(T, Wg);
        return Object.assign({}, s, { T, Wg, td, s: k, warn: k.total > 1150 || td > 58 });
      });
    }
    let firstFelt = null, routineStart = 0;
    function panel(G) {
      const top = G.filter((g) => g.top), low = G.filter((g) => g.row === 1), hot = G.reduce((a, g) => (!a || g.s.total > a.s.total ? g : a), null);
      const avg = (L, f) => (L.length ? L.reduce((s, g) => s + f(g), 0) / L.length : 0);
      const f = (x) => Math.round(x);
      let html = "";
      if (hot) html += `<div class="guest"><b>${tr("Hottest guest", "Heißester Gast")} (${tr("row", "Reihe")} ${hot.row})</b>
        <span>${tr("air", "Luft")} ${f(hot.T)} °C · ${tr("dew point", "Taupunkt")} ${f(hot.td)} °C${hot.td > T_SKIN ? ` · <em>${tr("condenses on skin", "kondensiert auf der Haut")}</em>` : ""}</span>
        <span>${tr("heat into the skin", "Wärme in die Haut")} <b>${f(hot.s.total)} W/m²</b> · ${tr("feels like", "fühlt sich an wie")} ${f(hot.s.feels)} °C ${tr("dry", "trocken")}</span>
        ${hot.warn ? `<span class="warn">${tr("Hot enough to hurt: ears and lips first. Lower the head, breathe slowly through the nose, wipe the ears.", "Heiß genug, dass es wehtut: zuerst Ohren und Lippen. Kopf senken, langsam durch die Nase atmen, Ohren abwischen.")}</span>` : ""}</div>`;
      html += `<p>${tr("Top row average", "Obere Reihe im Schnitt")}: <b>${f(avg(top, (g) => g.s.total))} W/m²</b> · ${tr("lowest row", "unterste Reihe")}: <b>${f(avg(low, (g) => g.s.total))} W/m²</b></p>`;
      if (firstFelt != null) html += `<p>${tr("Steam started condensing on the farthest guest", "Auf dem entferntesten Gast begann der Dampf zu kondensieren")} ${firstFelt.toFixed(0)} s ${tr("after pouring", "nach dem Aufguss")}.</p>`;
      html += `<p class="hint">${tr(`Water poured: ${room.poured.toFixed(1)} l · grid ${room.NX}×${room.NY}×${room.NZ} cells of ${Math.round(room.c * 100)} cm`, `Aufgegossen: ${room.poured.toFixed(1).replace(".", ",")} l · Gitter ${room.NX}×${room.NY}×${room.NZ} Zellen à ${Math.round(room.c * 100)} cm`)}</p>`;
      el.querySelector("#s3Out").innerHTML = html;
    }
    const PH = { pour: tr("Pouring: water on the stones.", "Aufgießen: Wasser auf die Steine."), wait: tr("Waiting: the steam mushroom rises to the ceiling.", "Warten: Der Dampfpilz steigt zur Decke."), across: tr("Behind the stove: waving across it, sweeping left and right to spread the mushroom.", "Hinter dem Ofen: über ihn hinweg wedeln, links und rechts, damit sich der Pilz verteilt."), loop: tr("One loop around the stove, between stove and benches, waving at the guests.", "Eine Runde um den Ofen, zwischen Ofen und Bänken, zu den Gästen wedeln."), done: tr("Done. Watch how long the heat stays.", "Fertig. Schau, wie lange die Hitze bleibt.") };
    let master = routine(room, 1e9);
    let farSeat = null; function pickFar() { const o = room.oven; farSeat = room.seats.reduce((a, s) => (!a || Math.hypot(s.x - o.x, s.y - o.z) > Math.hypot(a.x - o.x, a.y - o.z) ? s : a), null); }
    pickFar();
    let fc = 0, last = 0, poured = false, acc = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const rdt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
      acc += rdt * speed * 15; let steps = Math.min(6, Math.floor(acc)); acc -= steps; if (acc > 3) acc = 0;
      for (let n = 0; n < steps; n++) {
        if (t >= 0) {
          let r = routine(room, t);
          if (!run && r.phase !== "pour") r = Object.assign(routine(room, Math.min(t, 9)), { phase: t < 10 ? "wait" : "done" }); // only pouring: nobody waves
          master = r;
          if (r.pour && !poured) { room.pourWater(500); poured = true; }
          room.forces = run && r.push ? [r.push] : [];
          if (farSeat && firstFelt == null && t > 1 && dewPoint(room.at(room.T, farSeat.x, farSeat.head, farSeat.y), room.at(room.W, farSeat.x, farSeat.head, farSeat.y)) > T_SKIN) firstFelt = t;
          t += 1 / 15; if (t > 120) { t = -1; room.forces = []; }
        }
        room.step(1 / 15); view.moveTracers(room, 1 / 15);
      }
      const G = guests(); view.draw(room, master, G);
      if (++fc % 8 === 0) { panel(G); el.querySelector("#s3Phase").textContent = t >= 0 ? (PH[master.phase] || "") + ` (${Math.max(0, t).toFixed(0)} s)` : tr("Drag to turn the sauna. Start an infusion.", "Ziehen, um die Sauna zu drehen. Starte einen Aufguss."); }
    }
    function start(withWaving) { run = withWaving; t = 0; firstFelt = null; poured = false; }
    el.querySelector("#s3Run").onclick = () => start(true);
    el.querySelector("#s3Pour").onclick = () => start(false);
    el.querySelector("#s3Reset").onclick = () => { room.reset(); t = -1; master = routine(room, 1e9); firstFelt = null; view.reset(); warm(); };
    el.querySelector("#s3Speed").onchange = (e) => (speed = +e.target.value);
    el.querySelector("#s3Steam").onchange = (e) => (view.opt.steam = e.target.checked);
    el.querySelector("#s3Flow").onchange = (e) => (view.opt.flow = e.target.checked);
    el.querySelector("#s3Layer").onchange = (e) => (view.opt.layer = +e.target.value);
    function warm() { for (let i = 0; i < 90; i++) room.step(1 / 15); }
    warm(); view.size(); raf = requestAnimationFrame(frame);
    return {
      rebuild(plan) { room = new Room(plan); t = -1; master = routine(room, 1e9); pickFar(); view.reset(); warm(); },
      stop() { cancelAnimationFrame(raf); }, get room() { return room; },
    };
  }
  root.AufgussSauna3D = { mount, Room, routine };
})(typeof window !== "undefined" ? window : globalThis);
