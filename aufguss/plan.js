// Floor-plan editor for your own sauna. Nodes (corners) and edges (walls), in metres.
// Drag a corner to move it. Tap a wall once to mark a spot, tap the mark again to add a corner there.
// Walls never cross: a move that would make them cross is not accepted. Or draw the room by hand:
// the line is simplified and the rounded corners are sharpened. Pinch or +/− to zoom, drag empty space to pan.
(function (root) {
  "use strict";
  const TAU = Math.PI * 2;
  const KEY = "aufguss.plan";
  const DEF = () => ({ pts: [[0, 0, 0], [3, 0, 0], [3, 3, 1], [0, 3, 0]], oven: [0.5, 0.5], h: 2.4, rows: 3, kw: 9, topH: 1.2, v: 2 });
  // pts[i] = [x, y, bench] — bench = 1 if the wall from corner i to corner i+1 carries benches

  function load() {
    try { const p = JSON.parse(localStorage.getItem(KEY)); if (p && p.v === 2 && p.pts && p.pts.length >= 3) return p; } catch (e) {}
    return DEF();
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  // ---------- geometry ----------
  const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  function inside(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function segX(a, b, c, d) { // proper intersection of segments ab and cd
    const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  }
  function crosses(P) {
    const n = P.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (segX(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return true;
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 0.05) return true;
    return Math.abs(area(P)) < 0.5;
  }
  function segDist(p, a, b) { const ab = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / ((ab[0] ** 2 + ab[1] ** 2) || 1))); return { d: Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t), t }; }
  function rdp(pts, eps) {
    if (pts.length < 3) return pts;
    let dm = 0, im = 0; const a = pts[0], b = pts[pts.length - 1];
    for (let i = 1; i < pts.length - 1; i++) { const d = segDist(pts[i], a, b).d; if (d > dm) { dm = d; im = i; } }
    if (dm < eps) return [a, b];
    return rdp(pts.slice(0, im + 1), eps).slice(0, -1).concat(rdp(pts.slice(im), eps));
  }
  function hull(P) { // monotone chain
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const snap = (x, s = 0.05) => Math.round(x / s) * s;
  // hand-drawn line → room: simplify, drop near-straight corners, square up walls that are almost straight
  function sharpen(path) {
    let P = path.slice();
    // close the loop
    const span = Math.max(...P.map((p) => p[0])) - Math.min(...P.map((p) => p[0])) + Math.max(...P.map((p) => p[1])) - Math.min(...P.map((p) => p[1]));
    P = rdp(P, Math.max(0.08, span * 0.04));
    if (Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < span * 0.15) P.pop();
    const straight = () => { for (let pass = 0; pass < 3; pass++) { // remove corners that turn less than ~20°
      const out = [];
      for (let i = 0; i < P.length; i++) {
        const a = out.length ? out[out.length - 1] : P[(i - 1 + P.length) % P.length], b = P[i], c = P[(i + 1) % P.length];
        const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - b[0], c[1] - b[1]];
        const ang = Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]));
        if (ang > 0.55 || P.length - (i + 1) + out.length < 3) out.push(b);
      }
      if (out.length >= 3) P = out;
    } };
    const square = () => { for (let it = 0; it < 2; it++) for (let i = 0; i < P.length; i++) { // walls within 10° of the grid become exactly straight
      const a = P[i], b = P[(i + 1) % P.length], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const m = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
      if (m < 0.17 || m > Math.PI / 2 - 0.17) {
        if (Math.abs(Math.cos(ang)) > Math.abs(Math.sin(ang))) { const y = (a[1] + b[1]) / 2; a[1] = y; b[1] = y; } else { const x = (a[0] + b[0]) / 2; a[0] = x; b[0] = x; }
      }
    } };
    straight(); square(); straight(); square();
    P = P.map((p) => [snap(p[0]), snap(p[1]), 0]);
    if (area(P) < 0) P.reverse();
    if (crosses(P)) P = hull(P).map((p) => [p[0], p[1], 0]);
    return P;
  }
  // which wall gets benches by default: the longest wall farthest from the stove
  function defaultBench(plan) {
    const P = plan.pts, o = plan.oven || [0, 0]; let best = -1, bi = 0;
    P.forEach((p, i) => { const q = P[(i + 1) % P.length], L = Math.hypot(q[0] - p[0], q[1] - p[1]), m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], s = L * Math.hypot(m[0] - o[0], m[1] - o[1]); if (s > best) { best = s; bi = i; } });
    P.forEach((p, i) => (p[2] = i === bi ? 1 : 0));
  }
  // inward normal of wall i
  function inward(P, i) {
    const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    let n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
    const m = [(a[0] + b[0]) / 2 + n[0] * 0.05, (a[1] + b[1]) / 2 + n[1] * 0.05];
    if (!inside(P, m[0], m[1])) n = [-n[0], -n[1]];
    return { n, L, a, b, dir: [(b[0] - a[0]) / L, (b[1] - a[1]) / L] };
  }
  // benches: rows from the wall into the room; the top row sits at the wall
  const ROW_H = [0.45, 0.9, 1.35], ROW_D = 0.55;
  function benches(plan) {
    const out = [];
    plan.pts.forEach((p, i) => {
      if (!p[2]) return;
      const w = inward(plan.pts, i), rows = plan.rows || 3;
      for (let r = 0; r < rows; r++) { // r = 0 is the top row at the wall
        const k = rows - 1 - r; // height index: top row is highest
        const top = plan.topH || 1.2; // rows evenly spaced up to the top bench
        out.push({ wall: i, d0: r * ROW_D, d1: (r + 1) * ROW_D, h: +(top * (k + 1) / rows).toFixed(3), top: r === 0, row: rows - r, ...w });
      }
    });
    return out;
  }
  function seats(plan) {
    const out = [];
    for (const b of benches(plan)) {
      const usable = b.L - 0.4, n = Math.max(1, Math.floor(usable / 0.6));
      for (let s = 0; s < n; s++) {
        const t = 0.2 + (s + 0.5) * usable / n, d = (b.d0 + b.d1) / 2 + 0.05;
        const x = b.a[0] + b.dir[0] * t + b.n[0] * d, y = b.a[1] + b.dir[1] * t + b.n[1] * d;
        if (!inside(plan.pts, x, y)) continue;
        out.push({ x, y, seatH: b.h + 0.05, head: b.h + 0.05 + 0.72, row: b.row, top: b.top, n: b.n });
      }
    }
    return out;
  }

  // ---------- the editor ----------
  function editor(el, opts) {
    const lang = opts.lang, tr = (en, de) => (lang === "de" ? de : en);
    let plan = load();
    el.innerHTML = `
      <div class="ed-tools" role="toolbar">
        <button data-mode="move" aria-pressed="true">${tr("Move", "Verschieben")}</button>
        <button data-mode="draw" aria-pressed="false">${tr("Draw by hand", "Von Hand zeichnen")}</button>
        <button data-mode="oven" aria-pressed="false">${tr("Stove", "Ofen")}</button>
        <button data-mode="bench" aria-pressed="false">${tr("Benches", "Bänke")}</button>
        <button id="edZin" aria-label="${tr("Zoom in", "Hineinzoomen")}">+</button><button id="edZout" aria-label="${tr("Zoom out", "Herauszoomen")}">−</button>
      </div>
      <canvas class="edcv" role="application" aria-label="${tr("Floor plan of your sauna", "Grundriss deiner Sauna")}"></canvas>
      <p class="hint ed-hint" aria-live="polite"></p>
      <div class="ed-row">
        <button id="edDel" disabled>${tr("Delete corner", "Ecke löschen")}</button>
        <label class="ed-len" hidden>${tr("Wall length", "Wandlänge")} <input id="edLen" type="number" min="0.3" max="12" step="0.05" inputmode="decimal"> m</label>
        <button data-tpl="2,2">2×2 m</button><button data-tpl="3,2.5">3×2,5 m</button><button data-tpl="L">${tr("L-shape", "L-Form")}</button>
      </div>
      <div class="ed-grid">
        <label>${tr("Ceiling", "Decke")} <input id="edH" type="range" min="1.9" max="3.2" step="0.05"><output id="edHo"></output></label>
        <label>${tr("Bench rows", "Bankreihen")} <input id="edRows" type="range" min="1" max="3" step="1"><output id="edRo"></output></label>
        <label>${tr("Top bench", "Obere Bank")} <input id="edTop" type="range" min="0.8" max="1.6" step="0.05"><output id="edTo"></output></label>
        <label>${tr("Stove power", "Ofenleistung")} <input id="edKw" type="range" min="4" max="18" step="1"><output id="edKo"></output></label>
      </div>
      <div class="ed-out" aria-live="polite"></div>`;
    const cv = el.querySelector(".edcv"), ctx = cv.getContext("2d"), hint = el.querySelector(".ed-hint");
    let mode = "move", view = { s: 80, ox: 40, oy: 40 }, sel = null, selEdge = null, pending = null, drag = null, path = null;
    const ptrs = new Map();
    function fit() {
      const P = plan.pts, xs = P.map((p) => p[0]).concat(plan.oven ? plan.oven[0] : []), ys = P.map((p) => p[1]).concat(plan.oven ? plan.oven[1] : []);
      const w = cv.clientWidth, h = cv.clientHeight, minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
      view.s = Math.min((w - 60) / Math.max(1, maxx - minx), (h - 60) / Math.max(1, maxy - miny));
      view.ox = (w - (maxx - minx) * view.s) / 2 - minx * view.s; view.oy = (h - (maxy - miny) * view.s) / 2 - miny * view.s;
    }
    function size() { const dpr = Math.min(2, root.devicePixelRatio || 1), w = cv.clientWidth, h = Math.round(Math.min(w * 0.9, 460)); cv.style.height = h + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    const S = (p) => [view.ox + p[0] * view.s, view.oy + p[1] * view.s];
    const W = (x, y) => [(x - view.ox) / view.s, (y - view.oy) / view.s];
    function draw() {
      const w = cv.clientWidth, h = cv.clientHeight; ctx.clearRect(0, 0, w, h);
      // grid every 50 cm, stronger every metre
      const [x0, y0] = W(0, 0), [x1, y1] = W(w, h);
      for (let g = Math.floor(x0 * 2) / 2; g <= x1; g += 0.5) { const X = view.ox + g * view.s; ctx.strokeStyle = Math.abs(g % 1) < 1e-6 ? "rgba(127,100,80,0.28)" : "rgba(127,100,80,0.12)"; ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, h); ctx.stroke(); }
      for (let g = Math.floor(y0 * 2) / 2; g <= y1; g += 0.5) { const Y = view.oy + g * view.s; ctx.strokeStyle = Math.abs(g % 1) < 1e-6 ? "rgba(127,100,80,0.28)" : "rgba(127,100,80,0.12)"; ctx.beginPath(); ctx.moveTo(0, Y); ctx.lineTo(w, Y); ctx.stroke(); }
      const P = plan.pts;
      // floor
      ctx.fillStyle = "rgba(181,118,63,0.16)"; ctx.beginPath(); P.forEach((p, i) => { const s = S(p); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath(); ctx.fill();
      // benches
      for (const b of benches(plan)) {
        const q = [[0, b.d0], [b.L, b.d0], [b.L, b.d1], [0, b.d1]].map(([t, d]) => S([b.a[0] + b.dir[0] * t + b.n[0] * d, b.a[1] + b.dir[1] * t + b.n[1] * d]));
        ctx.fillStyle = `rgba(160,100,50,${0.25 + 0.18 * (b.row - 1)})`; ctx.beginPath(); q.forEach((s, i) => (i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]))); ctx.closePath(); ctx.fill();
      }
      // walls with lengths
      P.forEach((p, i) => {
        const q = P[(i + 1) % P.length], a = S(p), b = S(q), L = Math.hypot(q[0] - p[0], q[1] - p[1]);
        ctx.strokeStyle = selEdge === i ? "#c0471f" : p[2] ? "#7a3e1d" : "#5a4a40"; ctx.lineWidth = selEdge === i ? 5 : 4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], nn = inward(P, i).n;
        ctx.fillStyle = "#2f2119"; ctx.font = "600 12px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(L.toFixed(2).replace(".", lang === "de" ? "," : ".") + " m", m[0] + nn[0] * 16, m[1] + nn[1] * 16);
      });
      // stove
      if (plan.oven) { const o = S([plan.oven[0] - 0.27, plan.oven[1] - 0.27]); ctx.fillStyle = "#5a4a40"; ctx.fillRect(o[0], o[1], 0.54 * view.s, 0.54 * view.s); ctx.fillStyle = "#fff"; ctx.font = "700 11px system-ui"; ctx.fillText(tr("stove", "Ofen"), o[0] + 0.27 * view.s, o[1] + 0.27 * view.s); }
      // seats
      ctx.fillStyle = "rgba(63,111,128,0.8)"; for (const s of seats(plan)) { const q = S([s.x, s.y]); ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(3, 0.1 * view.s), 0, TAU); ctx.fill(); }
      // corners
      P.forEach((p, i) => { const s = S(p); ctx.fillStyle = sel === i ? "#c0471f" : "#7a3e1d"; ctx.beginPath(); ctx.arc(s[0], s[1], sel === i ? 10 : 8, 0, TAU); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); });
      if (pending) { const s = S(pending.p); ctx.strokeStyle = "#c0471f"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(s[0], s[1], 14, 0, TAU); ctx.stroke(); ctx.fillStyle = "#c0471f"; ctx.font = "700 18px system-ui"; ctx.fillText("+", s[0], s[1] + 1); }
      if (path) { ctx.strokeStyle = "#c0471f"; ctx.lineWidth = 3; ctx.beginPath(); path.forEach((p, i) => { const s = S(p); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); }
      // scale bar
      const nice = [0.25, 0.5, 1, 2, 5].find((m) => m * view.s >= 60) || 5, bw = nice * view.s;
      ctx.fillStyle = "rgba(255,253,249,0.85)"; ctx.fillRect(8, h - 30, bw + 16, 24);
      ctx.strokeStyle = "#2f2119"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(16, h - 12); ctx.lineTo(16 + bw, h - 12); ctx.moveTo(16, h - 17); ctx.lineTo(16, h - 7); ctx.moveTo(16 + bw, h - 17); ctx.lineTo(16 + bw, h - 7); ctx.stroke();
      ctx.fillStyle = "#2f2119"; ctx.font = "600 11px system-ui"; ctx.textAlign = "center"; ctx.fillText((nice < 1 ? nice * 100 + " cm" : nice + " m"), 16 + bw / 2, h - 22);
      out();
    }
    function setHint() {
      hint.textContent = {
        move: pending ? tr("Tap the + again to add a corner there.", "Tippe nochmal auf das +, um dort eine Ecke einzufügen.") : tr("Drag a corner to move it. Tap a wall to add a corner (tap twice). Drag the empty space to move the view.", "Zieh eine Ecke, um sie zu verschieben. Tippe auf eine Wand, um eine Ecke einzufügen (zweimal tippen). Zieh die freie Fläche, um die Ansicht zu verschieben."),
        draw: tr("Draw the room with your finger in one line; the corners are sharpened when you let go.", "Zeichne den Raum mit dem Finger in einem Zug; beim Loslassen werden die Ecken geschärft."),
        oven: tr("Tap or drag to place the stove.", "Tippe oder zieh, um den Ofen zu setzen."),
        bench: tr("Tap a wall to put benches along it (or take them away).", "Tippe auf eine Wand, um dort Bänke aufzustellen (oder wegzunehmen)."),
      }[mode];
    }
    function out() {
      const P = plan.pts, A = Math.abs(area(P)), V = A * plan.h, st = seats(plan), top = Math.max(...benches(plan).map((b) => b.h), 0);
      const clear = plan.h - (top + 0.05 + 0.9); // head top ≈ 90 cm above the seat
      el.querySelector(".ed-out").innerHTML = `<p><b>${fmt(A)} m²</b> × ${fmt(plan.h)} m = <b>${fmt(V)} m³</b> · ${st.length} ${tr("seats", "Plätze")} · ${tr("water per infusion at most", "Wasser pro Aufguss höchstens")} <b>${Math.round(V * (opts.waterPerM3 || 30) / 50) * 50} ml</b></p>
        <p>${top ? tr(`Top row: about <b>${Math.round(clear * 100)} cm</b> between the heads and the ceiling.`, `Obere Reihe: etwa <b>${Math.round(clear * 100)} cm</b> zwischen Köpfen und Decke.`) + " " + (clear < 0.25 ? tr("Very hot up there.", "Sehr heiß dort oben.") : clear > 0.7 ? tr("Lots of air above the heads: the heat stays up there unless someone waves.", "Viel Luft über den Köpfen: Die Hitze bleibt oben, wenn niemand wedelt.") : "") : tr("No benches yet: choose “Benches” and tap a wall.", "Noch keine Bänke: „Bänke“ wählen und auf eine Wand tippen.")}</p>`;
    }
    const fmt = (x) => x.toFixed(1).replace(".", lang === "de" ? "," : ".");
    function commit() { save(plan); draw(); opts.onChange && opts.onChange(plan); }

    // pointer handling
    function hit(x, y) {
      const P = plan.pts;
      for (let i = 0; i < P.length; i++) { const s = S(P[i]); if (Math.hypot(s[0] - x, s[1] - y) < 18) return { node: i }; }
      if (plan.oven) { const o = S(plan.oven); if (Math.abs(o[0] - x) < 0.27 * view.s + 6 && Math.abs(o[1] - y) < 0.27 * view.s + 6) return { oven: true }; }
      const wpt = W(x, y);
      let best = null; P.forEach((p, i) => { const r = segDist(wpt, p, P[(i + 1) % P.length]); if (r.d * view.s < 16 && (!best || r.d < best.d)) best = { edge: i, d: r.d, t: r.t }; });
      return best || {};
    }
    cv.addEventListener("pointerdown", (e) => {
      cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      ptrs.set(e.pointerId, [x, y]);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; drag = { pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.s, ox: view.ox, oy: view.oy, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; path = null; return; }
      if (mode === "draw") { path = [W(x, y)]; return; }
      if (mode === "oven") { plan.oven = W(x, y).map((v) => snap(v)); drag = { oven: true }; draw(); return; }
      const h = hit(x, y);
      if (mode === "bench") { if (h.edge != null) { plan.pts[h.edge][2] = plan.pts[h.edge][2] ? 0 : 1; commit(); } return; }
      if (h.node != null) { sel = h.node; selEdge = null; pending = null; drag = { node: h.node, start: plan.pts[h.node].slice() }; }
      else if (h.oven) drag = { oven: true };
      else if (h.edge != null) {
        const a = plan.pts[h.edge], b = plan.pts[(h.edge + 1) % plan.pts.length], p = [snap(a[0] + (b[0] - a[0]) * h.t), snap(a[1] + (b[1] - a[1]) * h.t)];
        if (pending && pending.edge === h.edge && Math.hypot(S(pending.p)[0] - x, S(pending.p)[1] - y) < 26) { // second tap: add the corner
          plan.pts.splice(h.edge + 1, 0, [pending.p[0], pending.p[1], a[2]]); sel = h.edge + 1; pending = null; selEdge = null; commit();
        } else { pending = { edge: h.edge, p }; selEdge = h.edge; sel = null; showLen(); }
      } else { sel = null; selEdge = null; pending = null; drag = { pan: [x, y], ox: view.ox, oy: view.oy }; }
      el.querySelector("#edDel").disabled = sel == null || plan.pts.length <= 3; showLen(); setHint(); draw();
    });
    cv.addEventListener("pointermove", (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [x, y]);
      if (drag && drag.pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), k = d / drag.pinch; zoomAt(drag.c[0], drag.c[1], drag.s * k / view.s); return; }
      if (path) { const w = W(x, y), l = path[path.length - 1]; if (Math.hypot(w[0] - l[0], w[1] - l[1]) > 0.03) path.push(w); draw(); return; }
      if (!drag) return;
      if (drag.pan) { view.ox = drag.ox + x - drag.pan[0]; view.oy = drag.oy + y - drag.pan[1]; draw(); return; }
      const w = W(x, y).map((v) => snap(v));
      if (drag.oven) { if (inside(plan.pts, w[0], w[1])) { plan.oven = w; draw(); } return; }
      if (drag.node != null) {
        const old = plan.pts[drag.node].slice(); plan.pts[drag.node] = [w[0], w[1], old[2]];
        if (crosses(plan.pts)) { plan.pts[drag.node] = old; hint.textContent = tr("Walls can't cross.", "Wände dürfen sich nicht kreuzen."); }
        draw();
      }
    });
    const up = (e) => {
      ptrs.delete(e.pointerId);
      if (path) {
        if (path.length > 8) { const P = sharpen(path); if (P.length >= 3) { plan.pts = P; if (!plan.oven || !inside(P, plan.oven[0], plan.oven[1])) { const c = P.reduce((s, p) => [s[0] + p[0] / P.length, s[1] + p[1] / P.length], [0, 0]); plan.oven = [snap(P[0][0] * 0.6 + c[0] * 0.4), snap(P[0][1] * 0.6 + c[1] * 0.4)]; } defaultBench(plan); sel = null; pending = null; fit(); setMode("move"); } }
        path = null; commit(); return;
      }
      if (drag && (drag.node != null || drag.oven)) commit();
      drag = null;
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", (e) => { const r = cv.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12); e.preventDefault(); }, { passive: false });
    function zoomAt(x, y, k) { const ns = Math.max(20, Math.min(400, view.s * k)); k = ns / view.s; view.ox = x - (x - view.ox) * k; view.oy = y - (y - view.oy) * k; view.s = ns; draw(); }
    el.querySelector("#edZin").onclick = () => zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, 1.25);
    el.querySelector("#edZout").onclick = () => zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, 0.8);
    function setMode(m) { mode = m; pending = null; selEdge = null; el.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === m)); setHint(); draw(); }
    el.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
    el.querySelector("#edDel").onclick = () => { if (sel == null || plan.pts.length <= 3) return; const old = plan.pts.slice(); plan.pts.splice(sel, 1); if (crosses(plan.pts)) plan.pts = old; sel = null; el.querySelector("#edDel").disabled = true; commit(); };
    function showLen() {
      const lab = el.querySelector(".ed-len"), inp = el.querySelector("#edLen");
      if (selEdge == null) { lab.hidden = true; return; }
      const a = plan.pts[selEdge], b = plan.pts[(selEdge + 1) % plan.pts.length]; lab.hidden = false; inp.value = Math.hypot(b[0] - a[0], b[1] - a[1]).toFixed(2);
    }
    el.querySelector("#edLen").onchange = (e) => { // exact length: move the end corner along the wall
      if (selEdge == null) return; const i = selEdge, j = (i + 1) % plan.pts.length, a = plan.pts[i], b = plan.pts[j], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nl = +e.target.value;
      if (!(nl > 0.2)) return; const old = b.slice(); plan.pts[j] = [a[0] + (b[0] - a[0]) / L * nl, a[1] + (b[1] - a[1]) / L * nl, b[2]];
      if (crosses(plan.pts)) { plan.pts[j] = old; hint.textContent = tr("That length would make walls cross.", "Mit dieser Länge würden sich Wände kreuzen."); } commit();
    };
    el.querySelectorAll("[data-tpl]").forEach((b) => (b.onclick = () => {
      const t = b.dataset.tpl;
      if (t === "L") plan.pts = [[0, 0, 0], [3, 0, 0], [3, 1.5, 0], [1.6, 1.5, 0], [1.6, 3, 0], [0, 3, 1]];
      else { const [w, d] = t.split(",").map(Number); plan.pts = [[0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0]]; }
      plan.oven = [0.5, 0.5]; defaultBench(plan); sel = null; pending = null; fit(); commit();
    }));
    const H = el.querySelector("#edH"), R = el.querySelector("#edRows"), K = el.querySelector("#edKw"), TB = el.querySelector("#edTop");
    const labs = () => { el.querySelector("#edHo").textContent = " " + fmt2(plan.h) + " m"; el.querySelector("#edRo").textContent = " " + plan.rows; el.querySelector("#edKo").textContent = " " + plan.kw + " kW"; el.querySelector("#edTo").textContent = " " + fmt2(plan.topH || 1.2) + " m"; };
    const fmt2 = (x) => x.toFixed(2).replace(".", lang === "de" ? "," : ".");
    H.value = plan.h; R.value = plan.rows; K.value = plan.kw; TB.value = plan.topH || 1.2; labs();
    TB.oninput = () => { plan.topH = +TB.value; labs(); commit(); };
    H.oninput = () => { plan.h = +H.value; labs(); commit(); }; R.oninput = () => { plan.rows = +R.value; labs(); commit(); }; K.oninput = () => { plan.kw = +K.value; labs(); commit(); };
    size(); fit(); setHint(); draw();
    const onR = () => { size(); draw(); }; root.addEventListener("resize", onR);
    return { get plan() { return plan; }, redraw: draw, stop() { root.removeEventListener("resize", onR); } };
  }

  root.AufgussPlan = { editor, load, save, benches, seats, inside, area, inward, ROW_H, ROW_D, crosses, sharpen };
})(typeof window !== "undefined" ? window : globalThis);
