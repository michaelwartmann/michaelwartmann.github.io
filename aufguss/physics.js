// Sauna air physics: a cross-section of a cabin with a small 2D air model (stable fluids, Stam 1999),
// heat and steam as two scalars, buoyancy from both. Pour a ladle, watch the mushroom, wave, open the door,
// and read the guests on the benches as thermometers. Plus a floor-plan sketch for size, water and cold corners.
// Simplified on purpose: a 2D slice, turbulence as extra viscosity, walls that lose heat. The numbers are
// in the right range, not a CFD study.
(function (root) {
  "use strict";
  const TAU = Math.PI * 2;
  const W_ = 3.0, H_ = 2.4, CELL = 0.05, NX = Math.round(W_ / CELL), NY = Math.round(H_ / CELL), DEPTH = 2.0; // the slice stands for a 2 m deep cabin
  const IX = (i, j) => i + (NX + 2) * j, SIZE = (NX + 2) * (NY + 2);
  const T_SKIN = 38, L_V = 2.26e6, RV = 461.5;
  const es = (T) => 611.2 * Math.exp(17.62 * T / (243.12 + T)); // saturation vapour pressure, Pa
  const vapDensSat = (T) => es(T) / (RV * (T + 273.15)) * 1000; // g/m³
  function dewPoint(T, Wg) { const e = Wg / 1000 * RV * (T + 273.15); if (e <= 1) return -40; const g = Math.log(e / 611.2); return 243.12 * g / (17.62 - g); }
  const RHO_SAT_SKIN = vapDensSat(T_SKIN);
  // heat flowing into the skin: convection plus condensation (the "wave of heat" in an infusion)
  function skin(T, Wg, speed) {
    const h = 5 + 7 * Math.sqrt(speed + 0.02);                      // W/m²K, still air ≈ 5, a good towel ≈ 12–15
    const conv = h * (T - T_SKIN);
    const lat = Math.max(0, h / 1000 * L_V * (Wg - RHO_SAT_SKIN) / 1000); // mass transfer by the Lewis analogy
    return { h, conv, lat, total: conv + lat, feels: T + lat / h };
  }

  // ---------- cabin geometry (metres; x from the oven wall, y from the floor) ----------
  const OVEN = { x0: 0.05, x1: 0.6, y0: 0, y1: 0.8 }, STONES = { x0: 0.1, x1: 0.55, y0: 0.8, y1: 0.95 };
  const BENCHES = [{ x0: 1.75, y: 0.45 }, { x0: 2.2, y: 0.9 }, { x0: 2.6, y: 1.35 }];
  const GUESTS = [{ x: 1.95, b: 0 }, { x: 2.4, b: 1 }, { x: 2.8, b: 2 }];
  const solidAt = (x, y) => (x >= OVEN.x0 && x <= OVEN.x1 && y <= STONES.y1) || BENCHES.some((b) => x >= b.x0 && y <= b.y);

  class Air {
    constructor() {
      this.u = new Float32Array(SIZE); this.v = new Float32Array(SIZE); this.u0 = new Float32Array(SIZE); this.v0 = new Float32Array(SIZE);
      this.T = new Float32Array(SIZE); this.T0 = new Float32Array(SIZE); this.W = new Float32Array(SIZE); this.W0 = new Float32Array(SIZE);
      this.p = new Float32Array(SIZE); this.div = new Float32Array(SIZE); this.solid = new Uint8Array(SIZE); this.base = new Float32Array(SIZE);
      for (let j = 0; j <= NY + 1; j++) for (let i = 0; i <= NX + 1; i++) {
        const x = (i - 0.5) * CELL, y = (j - 0.5) * CELL, k = IX(i, j);
        this.solid[k] = i === 0 || j === 0 || i === NX + 1 || j === NY + 1 || solidAt(x, y) ? 1 : 0;
        this.base[k] = 42 + 58 * Math.pow(Math.max(0, y) / H_, 0.75); // stratified: ~42 °C at the floor, ~100 °C under the ceiling
      }
      this.reset();
    }
    reset() {
      this.u.fill(0); this.v.fill(0); this.T.set(this.base); this.W.fill(22); // dry Finnish sauna: ~5 % relative humidity
      this.poured = 0; this.pour = 0; this.door = 0; this.time = 0; this.wave = null;
    }
    // ----- solver pieces -----
    bnd(b, x) {
      const s = this.solid;
      for (let k = 0; k < SIZE; k++) if (s[k]) x[k] = 0;
      if (b === 0) { // scalars: copy from open neighbours so walls don't leak
        for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
          const k = IX(i, j); if (!s[k]) continue;
          let sum = 0, n = 0; for (const q of [k - 1, k + 1, k - (NX + 2), k + (NX + 2)]) if (!s[q]) { sum += x[q]; n++; }
          if (n) x[k] = sum / n;
        }
        for (let i = 0; i <= NX + 1; i++) { x[IX(i, 0)] = x[IX(i, 1)]; x[IX(i, NY + 1)] = x[IX(i, NY)]; }
        for (let j = 0; j <= NY + 1; j++) { x[IX(0, j)] = x[IX(1, j)]; x[IX(NX + 1, j)] = x[IX(NX, j)]; }
      }
    }
    advect(b, d, d0, u, v, dt) {
      const dt0 = dt / CELL;
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j); if (this.solid[k]) continue;
        let x = i - dt0 * u[k], y = j - dt0 * v[k];
        x = Math.max(0.5, Math.min(NX + 0.5, x)); y = Math.max(0.5, Math.min(NY + 0.5, y));
        const i0 = Math.floor(x), j0 = Math.floor(y), s1 = x - i0, t1 = y - j0, s0 = 1 - s1, t0 = 1 - t1;
        d[k] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j0 + 1)]) + s1 * (t0 * d0[IX(i0 + 1, j0)] + t1 * d0[IX(i0 + 1, j0 + 1)]);
      }
      this.bnd(b, d);
    }
    diffuse(b, x, x0, k_, dt) {
      const a = dt * k_ / (CELL * CELL);
      for (let it = 0; it < 6; it++) {
        for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) { const k = IX(i, j); if (this.solid[k]) continue; x[k] = (x0[k] + a * (x[k - 1] + x[k + 1] + x[k - NX - 2] + x[k + NX + 2])) / (1 + 4 * a); }
        this.bnd(b, x);
      }
    }
    project() {
      const { u, v, p, div, solid } = this;
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) { const k = IX(i, j); div[k] = -0.5 * (u[k + 1] - u[k - 1] + v[k + NX + 2] - v[k - NX - 2]); p[k] = 0; }
      for (let it = 0; it < 24; it++) {
        for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
          const k = IX(i, j); if (solid[k]) continue;
          let s = 0, n = 0; for (const q of [k - 1, k + 1, k - NX - 2, k + NX + 2]) if (!solid[q]) { s += p[q]; n++; } else { s += p[k]; n++; }
          p[k] = (div[k] + s) / 4;
        }
      }
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j); if (solid[k]) continue;
        const pl = solid[k - 1] ? p[k] : p[k - 1], pr = solid[k + 1] ? p[k] : p[k + 1], pd = solid[k - NX - 2] ? p[k] : p[k - NX - 2], pu = solid[k + NX + 2] ? p[k] : p[k + NX + 2];
        u[k] -= 0.5 * (pr - pl); v[k] -= 0.5 * (pu - pd);
      }
      this.bnd(1, u); this.bnd(2, v);
    }
    step(dt) {
      const { u, v, T, W, solid } = this;
      this.time += dt;
      // mean temperature of the air, so buoyancy has no net drift
      let tm = 0, n = 0; for (let k = 0; k < SIZE; k++) if (!solid[k]) { tm += T[k]; n++; } tm /= n;
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j); if (solid[k]) continue;
        const x = (i - 0.5) * CELL, y = (j - 0.5) * CELL;
        // buoyancy: hot air and steam (18 g/mol against 29 for air) are lighter; scaled down for a calm 2D slice
        v[k] += dt * 9.81 * 0.35 * ((T[k] - tm) / (tm + 273.15) + 0.38 * (W[k] - 22) / 1000 / 0.97);
        // the stove: hot stones keep heating the air right above them
        if (x > STONES.x0 && x < STONES.x1 && y > STONES.y1 && y < STONES.y1 + 0.12) {
          T[k] += (190 - T[k]) * Math.min(1, dt * 1.5);
          if (this.pour > 0) { W[k] = Math.min(560, W[k] + 900 * dt); T[k] += (110 - T[k]) * dt * 2; v[k] += 1.6 * dt * 10; } // steam bursts up
        }
        // walls, floor and the unseen third dimension lose heat: relax slowly to the stratified profile
        T[k] += (this.base[k] - T[k]) * dt * 0.035;
        // the door (bottom right) when open: cool, dry air comes in, humid air leaves
        if (this.door > 0 && x > W_ - 0.35 && y < 1.9) { T[k] += (24 - T[k]) * dt * 0.8; W[k] += (9 - W[k]) * dt * 0.8; u[k] -= dt * 1.2; }
        if (this.door > 0 && y > H_ - 0.3) { W[k] += (9 - W[k]) * dt * 0.15; T[k] += (this.base[k] - 8 - T[k]) * dt * 0.1; }
        // the towel
        const wv = this.wave;
        if (wv) { const dx = x - wv.x, dy = y - wv.y, r2 = (dx * dx + dy * dy) / (wv.r * wv.r); if (r2 < 1) { const f = (1 - r2) * dt * wv.k; u[k] += wv.fx * f; v[k] += wv.fy * f; } }
      }
      if (this.pour > 0) { this.pour -= dt; this.poured += 0.5 * dt / 2.5; }
      if (this.door > 0) this.door -= dt;
      this.bnd(1, u); this.bnd(2, v);
      this.u0.set(u); this.v0.set(v);
      this.diffuse(1, u, this.u0, 0.004, dt); this.diffuse(2, v, this.v0, 0.004, dt);
      this.project();
      this.u0.set(u); this.v0.set(v);
      this.advect(1, u, this.u0, this.u0, this.v0, dt); this.advect(2, v, this.v0, this.u0, this.v0, dt);
      this.project();
      // damping: turbulence and the third dimension eat motion
      for (let k = 0; k < SIZE; k++) { u[k] *= 1 - dt * 0.25; v[k] *= 1 - dt * 0.25; }
      this.T0.set(T); this.advect(0, T, this.T0, u, v, dt);
      this.W0.set(W); this.advect(0, W, this.W0, u, v, dt);
    }
    sample(f, x, y) { const i = Math.max(1, Math.min(NX, Math.floor(x / CELL) + 1)), j = Math.max(1, Math.min(NY, Math.floor(y / CELL) + 1)); return f[IX(i, j)]; }
    speed(x, y) { return Math.hypot(this.sample(this.u, x, y), this.sample(this.v, x, y)); }
  }

  // ---------- colours ----------
  function heatColor(T) { // 30 °C deep blue → 60 amber → 100 red → 130 near white
    const st = [[30, [52, 92, 140]], [50, [70, 150, 160]], [65, [235, 190, 90]], [85, [232, 120, 50]], [100, [200, 50, 35]], [140, [150, 25, 30]]];
    if (T <= st[0][0]) return st[0][1];
    for (let i = 1; i < st.length; i++) if (T <= st[i][0]) { const [t0, c0] = st[i - 1], [t1, c1] = st[i], f = (T - t0) / (t1 - t0); return c0.map((c, k) => c + (c1[k] - c) * f); }
    return st[st.length - 1][1];
  }

  // ---------- the view ----------
  function mount(el, lang, rules) {
    const tr = (en, de) => (lang === "de" ? de : en);
    el.innerHTML = `
      <section class="card phys">
        <h2>${tr("What happens in the air", "Was in der Luft passiert")}</h2>
        <p class="hint">${tr("A slice through a sauna: stove on the left, benches on the right, three guests as thermometers. Colours show the temperature, white mist the steam.", "Ein Schnitt durch eine Sauna: links der Ofen, rechts die Bänke, drei Gäste als Thermometer. Farben zeigen die Temperatur, weißer Nebel den Dampf.")}</p>
        <canvas id="physCv" class="physcv" role="img" aria-label="${tr("Cross-section of a sauna with moving air", "Querschnitt einer Sauna mit bewegter Luft")}"></canvas>
        <div class="controls">
          <button id="phPour" class="primary">${tr("Pour 0.5 l", "Aufgießen 0,5 l")}</button>
          <button id="phWave" aria-pressed="false">${tr("Wave", "Wedeln")}</button>
          <button id="phDoor">${tr("Door open", "Tür auf")}</button>
          <button id="phReset">${tr("Reset", "Neu")}</button>
        </div>
        <p class="hint">${tr("“Wave” sends air towards the top bench; or drag across the picture to wave yourself. The door stays open for 10 s.", "„Wedeln“ schickt Luft zur oberen Bank; oder zieh über das Bild, um selbst zu wedeln. Die Tür bleibt 10 s offen.")}</p>
        <div class="guests" id="phGuests"></div>
        <p class="hint" id="phInfo"></p>
      </section>
      <section class="card">
        <h2>${tr("Why an infusion feels so hot", "Warum sich ein Aufguss so heiß anfühlt")}</h2>
        <ul class="phys-list">
          <li>${tr("The air hardly gets hotter. What changes is the steam: as soon as the dew point of the air rises above your skin temperature (about 38 °C), water condenses on your skin, and every gram releases 2.26 kJ. That is the wave of heat.", "Die Luft wird kaum heißer. Was sich ändert, ist der Dampf: Sobald der Taupunkt der Luft über deiner Hauttemperatur (etwa 38 °C) liegt, kondensiert Wasser auf der Haut, und jedes Gramm gibt 2,26 kJ ab. Das ist die Hitzewelle.")}</li>
          <li>${tr("The mushroom: steam from the stones is hot and light (water vapour weighs 18 g/mol, air 29), so it shoots up, spreads along the ceiling and only slowly sinks at the walls. Without waving it stays up there.", "Der Pilz: Dampf von den Steinen ist heiß und leicht (Wasserdampf wiegt 18 g/mol, Luft 29), also schießt er hoch, breitet sich unter der Decke aus und sinkt erst langsam an den Wänden ab. Ohne Wedeln bleibt er dort oben.")}</li>
          <li>${tr("Waving does two things: it brings the hot, humid air from the ceiling down to the guests, and moving air carries heat into the skin faster (in still air about 5 W/m²K, with a good towel 12–15).", "Wedeln tut zwei Dinge: Es holt die heiße, feuchte Luft von der Decke zu den Gästen, und bewegte Luft bringt Wärme schneller in die Haut (in ruhender Luft etwa 5 W/m²K, mit einem guten Tuch 12–15).")}</li>
          <li>${tr("Layers: under the ceiling it is 30–50 K hotter than at the floor. The top bench is for the experienced, beginners sit low, and nobody stands up straight at the peak.", "Schichten: Unter der Decke ist es 30–50 K heißer als am Boden. Die obere Bank ist für Erfahrene, Neulinge sitzen unten, und am Höhepunkt steht niemand aufrecht.")}</li>
          <li>${tr("People are the best thermometers: watch faces and shoulders on the top bench. When they lean forward or cover their ears, wave less towards them and more into the corners.", "Menschen sind die besten Thermometer: Achte auf Gesichter und Schultern auf der oberen Bank. Wenn sie sich vorbeugen oder die Ohren zuhalten, wedel weniger zu ihnen und mehr in die Ecken.")}</li>
          <li>${tr(`Rule of thumb: at most ${rules.waterPerM3} g of water per m³ of room per infusion, poured in portions.`, `Faustregel: höchstens ${rules.waterPerM3} g Wasser pro m³ Raum pro Aufguss, in Portionen.`)}</li>
        </ul>
        <p class="hint">${tr("Simplified model: a 2D slice, turbulence as extra friction, numbers in the right range but not a measurement.", "Vereinfachtes Modell: ein 2D-Schnitt, Turbulenz als zusätzliche Reibung, Zahlen in der richtigen Größenordnung, aber keine Messung.")}</p>
      </section>
      <section class="card">
        <h2>${tr("Your sauna, from above", "Deine Sauna von oben")}</h2>
        <p class="hint">${tr("Tap the corners of the room (grid = 50 cm), then tap “Place stove” and tap where it stands.", "Tippe die Ecken des Raums an (Raster = 50 cm), dann „Ofen setzen“ und tippe, wo er steht.")}</p>
        <canvas id="planCv" class="plancv" role="img" aria-label="${tr("Floor plan editor", "Grundriss-Editor")}"></canvas>
        <div class="controls">
          <button id="plOven" aria-pressed="false">${tr("Place stove", "Ofen setzen")}</button>
          <button id="plUndo">${tr("Undo corner", "Ecke zurück")}</button>
          <button id="plClear">${tr("Clear", "Leeren")}</button>
          <label>${tr("Ceiling", "Decke")} <input id="plH" type="range" min="1.9" max="3" step="0.05" value="2.3"> <output id="plHo">2.3 m</output></label>
        </div>
        <div id="plOut" aria-live="polite"></div>
      </section>`;

    // ----- cross-section -----
    const air = new Air(), cv = el.querySelector("#physCv"), ctx = cv.getContext("2d");
    const img = document.createElement("canvas"); img.width = NX; img.height = NY; const ictx = img.getContext("2d"), idata = ictx.createImageData(NX, NY);
    const tracers = Array.from({ length: 220 }, () => newTracer());
    function newTracer() { let x, y; do { x = Math.random() * W_; y = Math.random() * H_; } while (solidAt(x, y)); return { x, y, age: Math.random() * 3 }; }
    let scale = 1, ox = 0, oy = 0, running = true, waveAuto = false, raf = 0, last = 0;
    function size() {
      const dpr = Math.min(2, root.devicePixelRatio || 1), w = cv.clientWidth, h = Math.round(w * H_ / W_);
      cv.style.height = h + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = w / W_; ox = 0; oy = h;
    }
    const X = (x) => ox + x * scale, Y = (y) => oy - y * scale;
    size(); const onR = () => size(); root.addEventListener("resize", onR);

    function draw() {
      const d = idata.data;
      for (let j = 1; j <= NY; j++) for (let i = 1; i <= NX; i++) {
        const k = IX(i, j), p = ((NY - j) * NX + (i - 1)) * 4;
        const c = heatColor(air.T[k]), mist = Math.min(1, Math.max(0, (air.W[k] - 40) / 260)) * 0.75;
        d[p] = c[0] + (250 - c[0]) * mist; d[p + 1] = c[1] + (248 - c[1]) * mist; d[p + 2] = c[2] + (245 - c[2]) * mist; d[p + 3] = 255;
      }
      ictx.putImageData(idata, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(img, 0, 0, NX, NY, X(0), Y(H_), W_ * scale, H_ * scale);
      // tracers show the flow
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.2;
      for (const t of tracers) {
        const u = air.sample(air.u, t.x, t.y), v = air.sample(air.v, t.x, t.y), sp = Math.hypot(u, v);
        if (sp > 0.03) { ctx.beginPath(); ctx.moveTo(X(t.x), Y(t.y)); ctx.lineTo(X(t.x - u * 0.12), Y(t.y - v * 0.12)); ctx.stroke(); }
      }
      // stove, stones, benches, wood
      ctx.fillStyle = "#5a4a40"; ctx.fillRect(X(OVEN.x0), Y(OVEN.y1), (OVEN.x1 - OVEN.x0) * scale, OVEN.y1 * scale);
      ctx.fillStyle = "#7d7570"; for (let x = STONES.x0 + 0.04; x < STONES.x1; x += 0.09) { ctx.beginPath(); ctx.arc(X(x), Y(STONES.y0 + 0.06), 0.045 * scale, 0, TAU); ctx.fill(); }
      ctx.fillStyle = "#b5763f";
      BENCHES.forEach((b) => { ctx.fillRect(X(b.x0), Y(b.y), (W_ - b.x0) * scale, 0.05 * scale); });
      ctx.fillStyle = "#8a5a33"; BENCHES.forEach((b) => ctx.fillRect(X(b.x0), Y(b.y - 0.05), (W_ - b.x0) * scale, (b.y - 0.05) * scale));
      // guests
      GUESTS.forEach((g, n) => {
        const by = BENCHES[g.b].y + 0.05, hx = g.x, hy = by + 0.72, T = air.sample(air.T, hx, hy), Wg = air.sample(air.W, hx, hy), s = skin(T, Wg, air.speed(hx, hy));
        const hot = Math.min(1, Math.max(0, (s.total - 500) / 1300));
        ctx.fillStyle = `rgb(${Math.round(225 + 30 * hot)},${Math.round(190 - 110 * hot)},${Math.round(160 - 110 * hot)})`; ctx.strokeStyle = "#2b1d14"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X(hx), Y(hy), 0.1 * scale, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X(hx - 0.12), Y(hy - 0.1), 0.24 * scale, 0.5 * scale, 6) : ctx.rect(X(hx - 0.12), Y(hy - 0.1), 0.24 * scale, 0.5 * scale); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.max(11, 0.09 * scale)}px system-ui`; ctx.textAlign = "center"; ctx.fillText(String(n + 1), X(hx), Y(hy) + 0.035 * scale);
      });
      // the waver
      const wx = 1.2; ctx.strokeStyle = "#2b1d14"; ctx.lineWidth = 3; ctx.fillStyle = "#a0714a";
      ctx.beginPath(); ctx.arc(X(wx), Y(1.62), 0.1 * scale, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(wx), Y(1.5)); ctx.lineTo(X(wx), Y(0.9)); ctx.moveTo(X(wx), Y(0.9)); ctx.lineTo(X(wx - 0.1), Y(0)); ctx.moveTo(X(wx), Y(0.9)); ctx.lineTo(X(wx + 0.1), Y(0)); ctx.stroke();
      const ph = air.time * TAU * 1.0, armX = wx + (waveAuto ? 0.25 + 0.15 * Math.sin(ph) : 0.15), armY = waveAuto ? 1.75 + 0.25 * Math.cos(ph) : 1.25;
      ctx.beginPath(); ctx.moveTo(X(wx), Y(1.45)); ctx.lineTo(X(armX), Y(armY)); ctx.stroke();
      if (waveAuto) { ctx.strokeStyle = "#f6f1e8"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(X(armX), Y(armY)); ctx.lineTo(X(armX + 0.3 * Math.cos(ph * 0.5 + 1)), Y(armY - 0.3)); ctx.stroke(); }
      // ceiling and floor lines
      ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 2; ctx.strokeRect(X(0), Y(H_), W_ * scale, H_ * scale);
      if (air.door > 0) { ctx.fillStyle = "rgba(120,190,230,0.6)"; ctx.fillRect(X(W_ - 0.06), Y(1.9), 0.06 * scale, 1.9 * scale); }
    }
    function guestsPanel() {
      const rows = GUESTS.map((g, n) => {
        const by = BENCHES[g.b].y + 0.05, hx = g.x, hy = by + 0.72, T = air.sample(air.T, hx, hy), Wg = air.sample(air.W, hx, hy), sp = air.speed(hx, hy), s = skin(T, Wg, sp), td = dewPoint(T, Wg);
        const lab = [tr("lower bench", "untere Bank"), tr("middle bench", "mittlere Bank"), tr("top bench", "obere Bank")][n];
        const pc = Math.min(100, s.conv / 25), pl = Math.min(100 - pc, s.lat / 25);
        return `<div class="guest"><b>${n + 1} · ${lab}</b>
          <span>${tr("air", "Luft")} ${Math.round(T)} °C · ${tr("dew point", "Taupunkt")} ${Math.round(td)} °C${td > T_SKIN ? " · <em>" + tr("condenses on skin", "kondensiert auf der Haut") + "</em>" : ""}</span>
          <span>${tr("heat into the skin", "Wärme in die Haut")} <b>${Math.round(s.total)} W/m²</b> · ${tr("feels like", "fühlt sich an wie")} ${Math.round(s.feels)} °C ${tr("dry", "trocken")}</span>
          <i class="bar"><span class="c" style="width:${pc}%"></span><span class="l" style="width:${pl}%"></span></i></div>`;
      }).join("");
      el.querySelector("#phGuests").innerHTML = rows + `<p class="hint"><span class="sw c"></span> ${tr("from hot air", "aus heißer Luft")} <span class="sw l"></span> ${tr("from condensing steam", "aus kondensierendem Dampf")}</p>`;
      el.querySelector("#phInfo").textContent = tr(`Water poured: ${air.poured.toFixed(1)} l`, `Aufgegossen: ${air.poured.toFixed(1).replace(".", ",")} l`);
    }
    let fc = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (waveAuto) { const ph = air.time * TAU; air.wave = { x: 1.55, y: 1.75 + 0.2 * Math.cos(ph), r: 0.38, fx: 1.4 * (0.6 + 0.4 * Math.sin(ph)), fy: -0.5, k: 9 }; }
      air.step(1 / 30); if (dt > 0.04) air.step(1 / 30);
      if (!drag && !waveAuto) air.wave = null;
      for (const t of tracers) { t.x += air.sample(air.u, t.x, t.y) / 30; t.y += air.sample(air.v, t.x, t.y) / 30; t.age -= 1 / 30; if (t.age < 0 || t.x < 0 || t.x > W_ || t.y < 0 || t.y > H_ || solidAt(t.x, t.y)) Object.assign(t, newTracer(), { age: 3 }); }
      draw(); if (++fc % 10 === 0) guestsPanel();
    }
    // drag = waving by hand
    let drag = null;
    cv.addEventListener("pointerdown", (e) => { const r = cv.getBoundingClientRect(); drag = { x: (e.clientX - r.left) / scale, y: (r.height - (e.clientY - r.top)) / scale, t: performance.now() }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / scale, y = (r.height - (e.clientY - r.top)) / scale, now = performance.now(), dts = Math.max(0.016, (now - drag.t) / 1000);
      const fx = Math.max(-6, Math.min(6, (x - drag.x) / dts)), fy = Math.max(-6, Math.min(6, (y - drag.y) / dts));
      air.wave = { x, y, r: 0.32, fx, fy, k: 6 }; drag = { x, y, t: now };
    });
    const end = () => { drag = null; air.wave = waveAuto ? air.wave : null; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    el.querySelector("#phPour").onclick = () => { air.pour = 2.5; };
    el.querySelector("#phDoor").onclick = () => { air.door = 10; };
    el.querySelector("#phReset").onclick = () => air.reset();
    el.querySelector("#phWave").onclick = (e) => { waveAuto = !waveAuto; e.currentTarget.setAttribute("aria-pressed", waveAuto); if (!waveAuto) air.wave = null; };
    // let the stove settle the room first
    for (let i = 0; i < 150; i++) air.step(1 / 30);
    raf = requestAnimationFrame(frame); guestsPanel();

    // ----- floor plan -----
    const pc = el.querySelector("#planCv"), pctx = pc.getContext("2d"), plan = Object.assign({ pts: [], oven: null, h: 2.3 }, load());
    function load() { try { return JSON.parse(localStorage.getItem("aufguss.plan")) || {}; } catch (e) { return {}; } }
    function save() { try { localStorage.setItem("aufguss.plan", JSON.stringify(plan)); } catch (e) {} }
    const GRID = 0.5, SPAN = 6; let ps = 1, ovenMode = false;
    function psize() { const dpr = Math.min(2, root.devicePixelRatio || 1), w = pc.clientWidth; pc.style.height = w + "px"; pc.width = Math.round(w * dpr); pc.height = Math.round(w * dpr); pctx.setTransform(dpr, 0, 0, dpr, 0, 0); ps = w / SPAN; }
    const onPR = () => { psize(); pdraw(); }; psize(); root.addEventListener("resize", onPR);
    const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
    function inside(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
    function pdraw() {
      const w = pc.clientWidth; pctx.clearRect(0, 0, w, w);
      pctx.strokeStyle = "rgba(127,100,80,0.25)"; pctx.lineWidth = 1;
      for (let g = 0; g <= SPAN; g += GRID) { pctx.beginPath(); pctx.moveTo(g * ps, 0); pctx.lineTo(g * ps, w); pctx.moveTo(0, g * ps); pctx.lineTo(w, g * ps); pctx.stroke(); }
      const P = plan.pts;
      if (P.length >= 3) { // warm near the stove and under its plume, cool in far corners
        const step = 0.1;
        for (let x = step / 2; x < SPAN; x += step) for (let y = step / 2; y < SPAN; y += step) {
          if (!inside(P, x, y)) continue;
          let t = 0.35; if (plan.oven) { const d = Math.hypot(x - plan.oven[0], y - plan.oven[1]); t = 0.25 + 0.75 * Math.exp(-d / 1.6); }
          const wallD = Math.min(...P.map((p, i) => segDist([x, y], p, P[(i + 1) % P.length]))); t -= 0.12 * Math.exp(-wallD / 0.25);
          const c = heatColor(40 + 70 * Math.max(0, Math.min(1, t))); pctx.fillStyle = `rgb(${c.map((x) => Math.round(x * 0.55 + 250 * 0.45)).join(",")})`; pctx.fillRect((x - step / 2) * ps, (y - step / 2) * ps, step * ps + 0.5, step * ps + 0.5);
        }
      }
      if (P.length) { pctx.strokeStyle = "#7a3e1d"; pctx.lineWidth = 3; pctx.beginPath(); P.forEach(([x, y], i) => (i ? pctx.lineTo(x * ps, y * ps) : pctx.moveTo(x * ps, y * ps))); if (P.length >= 3) pctx.closePath(); pctx.stroke(); pctx.fillStyle = "#7a3e1d"; P.forEach(([x, y]) => { pctx.beginPath(); pctx.arc(x * ps, y * ps, 5, 0, TAU); pctx.fill(); }); }
      if (plan.oven) { pctx.fillStyle = "#5a4a40"; pctx.fillRect((plan.oven[0] - 0.3) * ps, (plan.oven[1] - 0.3) * ps, 0.6 * ps, 0.6 * ps); pctx.fillStyle = "#fff"; pctx.font = "700 12px system-ui"; pctx.textAlign = "center"; pctx.fillText(tr("stove", "Ofen"), plan.oven[0] * ps, plan.oven[1] * ps + 4); }
      if (P.length >= 3 && plan.oven) { const far = P.reduce((b, p) => (Math.hypot(p[0] - plan.oven[0], p[1] - plan.oven[1]) > Math.hypot(b[0] - plan.oven[0], b[1] - plan.oven[1]) ? p : b)); pctx.strokeStyle = "#3f6f80"; pctx.lineWidth = 3; pctx.beginPath(); pctx.arc(far[0] * ps, far[1] * ps, 14, 0, TAU); pctx.stroke(); }
      pout();
    }
    function segDist(p, a, b) { const ab = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / ((ab[0] ** 2 + ab[1] ** 2) || 1))); return Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t); }
    function pout() {
      const P = plan.pts, o = el.querySelector("#plOut");
      if (P.length < 3) { o.innerHTML = `<p class="hint">${tr("At least three corners.", "Mindestens drei Ecken.")}</p>`; return; }
      const A = area(P), V = A * plan.h, water = V * rules.waterPerM3;
      let txt = `<p><b>${A.toFixed(1)} m²</b> × ${plan.h.toFixed(2)} m = <b>${V.toFixed(1)} m³</b>. ${tr("Water per infusion: at most", "Wasser pro Aufguss: höchstens")} <b>${Math.round(water / 50) * 50} ml</b> (${rules.waterPerM3} g/m³), ${tr("in 3–4 portions", "in 3–4 Portionen")}.</p>`;
      if (plan.oven) txt += `<p>${tr("The blue ring marks the corner farthest from the stove: the air stays coolest there. Seat beginners nearby, and wave towards it to bring heat into the dead corner.", "Der blaue Ring zeigt die Ecke, die am weitesten vom Ofen entfernt ist: Dort bleibt die Luft am kühlsten. Setz Neulinge in die Nähe und wedel dorthin, um Wärme in die tote Ecke zu bringen.")}</p>`;
      else txt += `<p class="hint">${tr("Place the stove to see warm and cool zones.", "Setz den Ofen, um warme und kühle Zonen zu sehen.")}</p>`;
      o.innerHTML = txt;
    }
    pc.addEventListener("click", (e) => {
      const r = pc.getBoundingClientRect(), x = Math.round((e.clientX - r.left) / ps / GRID * 2) * GRID / 2, y = Math.round((e.clientY - r.top) / ps / GRID * 2) * GRID / 2; // snap to 25 cm
      if (ovenMode) { plan.oven = [x, y]; ovenMode = false; el.querySelector("#plOven").setAttribute("aria-pressed", "false"); } else plan.pts.push([x, y]);
      save(); pdraw();
    });
    el.querySelector("#plOven").onclick = (e) => { ovenMode = !ovenMode; e.currentTarget.setAttribute("aria-pressed", ovenMode); };
    el.querySelector("#plUndo").onclick = () => { plan.pts.pop(); save(); pdraw(); };
    el.querySelector("#plClear").onclick = () => { plan.pts = []; plan.oven = null; save(); pdraw(); };
    const hEl = el.querySelector("#plH"); hEl.value = plan.h; el.querySelector("#plHo").textContent = plan.h.toFixed(2) + " m";
    hEl.oninput = () => { plan.h = +hEl.value; el.querySelector("#plHo").textContent = plan.h.toFixed(2) + " m"; save(); pout(); };
    if (!plan.pts.length) { plan.pts = [[1, 1], [4, 1], [4, 3.5], [1, 3.5]]; plan.oven = [1.5, 1.5]; }
    pdraw();

    return { stop() { cancelAnimationFrame(raf); root.removeEventListener("resize", onR); root.removeEventListener("resize", onPR); }, pause() { running = false; }, resume() { running = true; last = 0; }, air };
  }
  root.AufgussPhysics = { mount, skin, dewPoint, vapDensSat };
})(typeof window !== "undefined" ? window : globalThis);
