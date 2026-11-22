// Aufguss Studio – app: settings → composer (the grammar of an Aufguss) → timeline; technique library with demos.
(function () {
  "use strict";
  const { TECHNIQUES, OPTIONS, SCENTS, STYLES, RULES, GRAMMAR, EXTRAS } = window.AUFGUSS_DATA;
  const byId = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));

  // ---------- Text ----------
  const T = {
    en: {
      tagline: "Design your sauna infusion, round by round.",
      tabDesign: "Design", tabTech: "Techniques", tabPhys: "Physics", tabAbout: "About",
      setup: "Your infusion", minutes: "Length", min: "min", temp: "Sauna temperature", seats: "Guests who fit", clearance: "Heads on the top bench to the ceiling", clTight: "under 20 cm", clNormal: "20–40 cm", clRoomy: "more than 40 cm", reach: "Farthest guest from the oven", rNear: "under 2 m", rMid: "2–4 m", rFar: "more than 4 m", extras: "Extras", estimate: "estimate", watchTop: "Watch the top bench: if people bend forward or look pale and dizzy, ease off; dizzy guests go to a lower bench or lie down.", tightTxt: "Heads are close to the ceiling, in the hottest layer: a little less water, spread fast.", farTxt: "Far guests: the steam needs longer, keep distributing towards the back rows.", extraTxt: "Hand out: ",
      level: "Your level", lv1: "Beginner", lv2: "Intermediate", lv3: "Advanced",
      style: "Style", rounds: "Rounds", auto: "auto", theme: "Theme (optional)", themePh: "e.g. Forest morning, Ice palace",
      opening: "Opening", pour: "How you pour", scents: "Scents (one per round)", between: "Airing between rounds",
      airingAvail: "My sauna can", airNone: "not be aired", airDoor: "be aired via the door", airDraft: "get a full draft",
      music: "Music", closing: "Closing", build: "Build my infusion", plan: "Your plan", total: "Total",
      water: "Water", ice: "ice ball", perRound: "per round", swap: "Swap", tapTech: "Tap a technique to see it move.",
      phIntro: "Welcome", phOpening: "Opening ritual", phRound: "Round", phAiring: "Airing", phFinale: "Final round", phClose: "Closing",
      introTxt: "Welcome, theme and scents. Rules: anyone may leave at any time; new guests sit lower. Ask about allergies. Keep it under 90 seconds.",
      pourTxt: { ice: "Put the ice ball with {scent} on the stones, then pour {ml} ml pure water around it, slowly, ladle by ladle.",
                 water: "Pour {ml} ml water with {scent}, slowly, ladle by ladle. (Ice balls keep a separate scent per round.)",
                 iceonly: "Put the ice ball with {scent} on the stones and let it melt: gentle, steady steam." },
      spreadTxt: "Spread the steam from the ceiling down.",
      musicTxt: ["♪ Music: calm, slow, open (intro mood).", "♪ Music: building, more rhythm.", "♪ Music: the peak, strong beat; let it end with the last strike."],
      distTxt: "Distribute the heat to all benches.",
      abShort: "Short Abschlagen: one strike for each guest, so everyone gets the scent.",
      abFinal: "The real Abschlagen: strong strikes for each guest or row, now it is hottest.",
      airTxt: { door: "Open the door briefly and wave fresh air in. Heat drops a little.", draft: "Full draft: let the hot air out and start again from gentle." },
      closeTxt: { thanks: "Thank everyone. Ask people to stand up slowly and come down step by step: after the peak, blood pressure is low. Then: fresh air, cold shower, rest, drink.",
                  applause: "Bow, let the music play out. Ask people to stand up slowly. Then the cool-down tips.", silence: "A moment of silence before the door opens. Ask people to stand up slowly. Then the cool-down tips." },
      openTxt: { incense: "Light the incense (Räucherwerk) and let the smoke rise before the first pour.", hydrolate: "A few sprays of hydrolate to set the mood.",
                 bowl: "Strike the singing bowl and let it fade.", story: "Start your story: costume, first scene, first music cue." },
      warnTooLong: "At {temp} °C a guideline maximum is about {max} minutes. Shorten the infusion or lower the temperature.",
      warnNoTech: "You haven't ticked any techniques yet. Go to Techniques and tick what you can do. Until then the beginner set is used.",
      warnWater: "Scent in the water is less elegant: the oil floats and every round smells the same. Ice balls give each round its own scent.",
      heat: "Heat", show: "Show", air: "Air", family: "Family", related: "Related", canDo: "I can do this",
      toVerify: "description to verify", tempo: "Tempo", tempoHint: "Slower and the towel folds: it only holds its shape when it moves fast enough.",
      play: "Play", pause: "Pause", all: "All", mine: "Mine", close: "Close",
      fam: { rotation: "Rotation", eight: "Figure eight", sweep: "Sweep", whip: "Strike", flatspin: "Flat spin", throw: "Throw", wave: "Wave", pass: "Pass" },
      install: "Install on your phone", installTxt: "Android: menu ⋮ → Add to Home screen. iPhone: Share → Add to Home Screen. Works offline after the first visit.",
      aboutTitle: "The grammar of an Aufguss",
      about: [
        "Before: air the cabin, prepare ice balls (one per round, a few drops of essential oil each), pure water in the bucket, towel, music.",
        "Welcome (max. 90 s): theme, scents, rules, allergies. Anyone may leave at any time.",
        "Opening ritual (optional): incense, hydrolate, singing bowl, or the first scene of a story.",
        "2–4 rounds. Each round: pour → spread from the ceiling (Propeller) → distribute → optional short Abschlagen.",
        "Heat builds round by round. Complicated and show techniques come early, while it is not so hot yet. The last round is classic and strong.",
        "Optional airing between rounds, if the sauna allows: door open, or a full draft to start over.",
        "Final round: the real Abschlagen for every guest.",
        "Closing: thanks, door open, cool-down tips.",
        "Water: about 30 ml per m³ of room per infusion (guideline), more in later rounds.",
        "Length: guideline 6–10 minutes, at most 12, at 90 °C or more; championships 12–15 minutes.",
      ],
      aboutNote: "Prototype. The waving figure is a simulation, not a video. Techniques marked “to verify” have a name in use but no confirmed description yet.",
    },
    de: {
      tagline: "Gestalte deinen Saunaaufguss, Runde für Runde.",
      tabDesign: "Gestalten", tabTech: "Techniken", tabPhys: "Physik", tabAbout: "Über",
      setup: "Dein Aufguss", minutes: "Dauer", min: "Min.", temp: "Saunatemperatur", seats: "Gäste, die Platz haben", clearance: "Köpfe auf der oberen Bank bis zur Decke", clTight: "unter 20 cm", clNormal: "20–40 cm", clRoomy: "mehr als 40 cm", reach: "Fernster Gast vom Ofen", rNear: "unter 2 m", rMid: "2–4 m", rFar: "mehr als 4 m", extras: "Extras", estimate: "geschätzt", watchTop: "Die obere Bank beobachten: Wenn sich Leute nach vorn beugen oder blass und schwindlig wirken, zurücknehmen; Schwindlige setzen sich tiefer oder legen sich hin.", tightTxt: "Die Köpfe sind nah an der Decke, in der heißesten Schicht: etwas weniger Wasser, schnell verteilen.", farTxt: "Ferne Gäste: Der Dampf braucht länger, weiter zu den hinteren Reihen verteilen.", extraTxt: "Reichen: ",
      level: "Dein Level", lv1: "Einsteiger", lv2: "Fortgeschritten", lv3: "Profi",
      style: "Stil", rounds: "Runden", auto: "auto", theme: "Thema (optional)", themePh: "z. B. Waldmorgen, Eispalast",
      opening: "Eröffnung", pour: "Wie du aufgießt", scents: "Düfte (einer pro Runde)", between: "Lüften zwischen den Runden",
      airingAvail: "Meine Sauna kann", airNone: "nicht gelüftet werden", airDoor: "über die Tür gelüftet werden", airDraft: "ganz durchgelüftet werden",
      music: "Musik", closing: "Abschluss", build: "Aufguss erstellen", plan: "Dein Ablauf", total: "Gesamt",
      water: "Wasser", ice: "Eiskugel", perRound: "pro Runde", swap: "Tauschen", tapTech: "Tippe auf eine Technik, um sie in Bewegung zu sehen.",
      phIntro: "Begrüßung", phOpening: "Eröffnungsritual", phRound: "Runde", phAiring: "Lüften", phFinale: "Letzte Runde", phClose: "Abschluss",
      introTxt: "Begrüßung, Thema und Düfte. Regeln: Jeder darf jederzeit gehen; Neue sitzen unten. Nach Allergien fragen. Unter 90 Sekunden bleiben.",
      pourTxt: { ice: "Eiskugel mit {scent} auf die Steine legen, dann {ml} ml reines Wasser drumherum gießen, langsam, Kelle für Kelle.",
                 water: "{ml} ml Wasser mit {scent} aufgießen, langsam, Kelle für Kelle. (Eiskugeln geben jeder Runde einen eigenen Duft.)",
                 iceonly: "Eiskugel mit {scent} auf die Steine legen und schmelzen lassen: sanfter, gleichmäßiger Dampf." },
      spreadTxt: "Den Dampf von der Decke nach unten verteilen.",
      musicTxt: ["♪ Musik: ruhig, langsam, offen (Einstimmung).", "♪ Musik: steigernd, mehr Rhythmus.", "♪ Musik: der Höhepunkt, kräftiger Beat; mit dem letzten Schlag enden lassen."],
      distTxt: "Die Hitze auf alle Bänke verteilen.",
      abShort: "Kurzes Abschlagen: ein Schlag für jeden Gast, damit jeder den Duft bekommt.",
      abFinal: "Das richtige Abschlagen: kräftig für jeden Gast oder jede Reihe, jetzt ist es am heißesten.",
      airTxt: { door: "Tür kurz öffnen und frische Luft hereinwedeln. Die Hitze sinkt etwas.", draft: "Ganz lüften: heiße Luft raus und wieder sanft beginnen." },
      closeTxt: { thanks: "Allen danken. Bitten, langsam aufzustehen und Stufe für Stufe herunterzukommen: Nach dem Höhepunkt ist der Blutdruck niedrig. Dann: frische Luft, kalt duschen, ruhen, trinken.",
                  applause: "Verbeugen, die Musik ausklingen lassen. Bitten, langsam aufzustehen. Dann die Tipps zum Abkühlen.", silence: "Ein Moment Stille, bevor die Tür aufgeht. Bitten, langsam aufzustehen. Dann die Tipps zum Abkühlen." },
      openTxt: { incense: "Räucherwerk anzünden und den Rauch vor dem ersten Aufguss aufsteigen lassen.", hydrolate: "Ein paar Sprühstöße Hydrolat zur Einstimmung.",
                 bowl: "Klangschale anschlagen und ausklingen lassen.", story: "Die Geschichte beginnt: Kostüm, erste Szene, erster Musikeinsatz." },
      warnTooLong: "Bei {temp} °C liegt die Richtwert-Obergrenze bei etwa {max} Minuten. Kürzer planen oder die Temperatur senken.",
      warnNoTech: "Du hast noch keine Techniken angekreuzt. Unter Techniken ankreuzen, was du kannst. Bis dahin wird das Einsteiger-Set verwendet.",
      warnWater: "Duft im Wasser ist weniger elegant: Das Öl schwimmt oben und jede Runde riecht gleich. Eiskugeln geben jeder Runde ihren eigenen Duft.",
      heat: "Hitze", show: "Show", air: "Luft", family: "Familie", related: "Verwandt mit", canDo: "Kann ich",
      toVerify: "Beschreibung noch prüfen", tempo: "Tempo", tempoHint: "Langsamer, und das Tuch fällt zusammen: Es hält seine Form nur, wenn es schnell genug bewegt wird.",
      play: "Abspielen", pause: "Pause", all: "Alle", mine: "Meine", close: "Schließen",
      fam: { rotation: "Drehung", eight: "Acht", sweep: "Schwung", whip: "Schlag", flatspin: "Flache Drehung", throw: "Wurf", wave: "Welle", pass: "Durchgang" },
      install: "Aufs Handy holen", installTxt: "Android: Menü ⋮ → Zum Startbildschirm hinzufügen. iPhone: Teilen → Zum Home-Bildschirm. Funktioniert nach dem ersten Besuch offline.",
      aboutTitle: "Die Grammatik eines Aufgusses",
      about: [
        "Vorher: Kabine lüften, Eiskugeln vorbereiten (eine pro Runde, je ein paar Tropfen ätherisches Öl), reines Wasser im Kübel, Tuch, Musik.",
        "Begrüßung (max. 90 s): Thema, Düfte, Regeln, Allergien. Jeder darf jederzeit gehen.",
        "Eröffnungsritual (optional): Räucherwerk, Hydrolat, Klangschale oder die erste Szene einer Geschichte.",
        "2–4 Runden. Jede Runde: aufgießen → von der Decke verteilen (Propeller) → verteilen → optional kurzes Abschlagen.",
        "Die Hitze steigt von Runde zu Runde. Komplizierte und Show-Techniken kommen früh, solange es noch nicht so heiß ist. Die letzte Runde ist klassisch und kräftig.",
        "Optional lüften zwischen den Runden, wenn die Sauna es erlaubt: Tür auf oder ganz durchlüften und neu beginnen.",
        "Letzte Runde: das richtige Abschlagen für jeden Gast.",
        "Abschluss: Dank, Tür auf, Tipps zum Abkühlen.",
        "Wasser: etwa 30 ml pro m³ Raum pro Aufguss (Richtwert), in späteren Runden mehr.",
        "Dauer: Richtwert 6–10 Minuten, höchstens 12, bei 90 °C und mehr; bei Meisterschaften 12–15 Minuten.",
      ],
      aboutNote: "Prototyp. Die wedelnde Figur ist eine Simulation, kein Video. Techniken mit „noch prüfen“ sind im Gebrauch, aber ihre Beschreibung ist noch nicht bestätigt.",
    },
  };

  // ---------- State ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aufguss." + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("aufguss." + k, JSON.stringify(v)); } catch (e) {} },
  };
  const navLang = (navigator.language || "en").slice(0, 2);
  let lang = store.get("lang", navLang === "de" ? "de" : "en");
  const beginnerSet = TECHNIQUES.filter((t) => t.level === 1 && t.status === "described").map((t) => t.id);
  let mine = new Set(store.get("mine", []));
  let settings = Object.assign({
    minutes: 10, temp: 90, seats: 20, clearance: "normal", reach: "mid", extras: "none", level: 1, style: "classic", rounds: 0, theme: "",
    opening: "none", pour: "ice", scents: ["eucalyptus", "lemon", "mint", "pine"], airingAvail: "door", between: "none",
    music: false, closing: "thanks",
  }, store.get("settings", {}));
  let plan = null;
  let libFilter = "all";
  const PR = window.AufgussProfile;
  let me = store.get("me", null);
  let phys = null; // physics view, mounted on first visit // { animal, level, heat, care, scent, answers }

  const t = (k) => T[lang][k];
  const nm = (o) => (o && (o[lang] || o.en)) || "";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const mmss = (m) => { const s = Math.round(m * 60); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  // ---------- Composer: the grammar ----------
  function compose(S) {
    const style = STYLES.find((s) => s.id === S.style) || STYLES[0];
    const canDo = mine.size ? mine : new Set(beginnerSet);
    const maxLevel = Math.min(S.level, style.maxLevel);
    const rounds = S.rounds || (S.minutes >= 12 ? 4 : S.minutes >= 8 ? 3 : 2);
    const airing = S.airingAvail === "none" ? "none" : (S.between === "draft" && S.airingAvail !== "draft" ? "door" : S.between);
    const phases = [];
    const warnings = [];

    const intro = S.style === "show" ? 1.5 : 1;
    const opening = S.opening !== "none" ? (S.opening === "story" ? 1 : 0.5) : 0;
    const closing = 0.5;
    const airTime = airing === "none" ? 0 : airing === "draft" ? 1 : 0.5;
    const airAt = airing !== "none" && rounds >= 3 ? Math.ceil(rounds / 2) - 1 : -1; // airing after this round index (0-based)
    const finaleAb = 1.5;
    let roundTime = (S.minutes - intro - opening - closing - (airAt >= 0 ? airTime : 0) - finaleAb) / rounds;
    if (roundTime < 1.2) { roundTime = 1.2; }

    const volume = RULES.volumeFromSeats(S.seats || 20);
    const totalWater = RULES.waterPerM3 * volume * (RULES.clearanceFactor[S.clearance] || 1);
    const reachF = RULES.reachFactor[S.reach] || 1;
    const weights = rounds === 2 ? [0.4, 0.6] : rounds === 3 ? [0.25, 0.35, 0.4] : [0.2, 0.25, 0.25, 0.3];

    const used = new Set();
    const prof = me && PR ? PR.options(me) : null;
    const fit = (x) => (prof && prof.fam.includes(x.family) ? 1.5 : 0);
    const avoided = (x) => prof && prof.avoid.some((a) => x.code.startsWith(a) || x.code.includes(a));
    const pick = (phase, opts) => {
      let c = TECHNIQUES.filter((x) => canDo.has(x.id) && x.phase.includes(phase) && x.level <= opts.maxLevel && x.show <= opts.maxShow && !opts.exclude?.includes(x.id) && !avoided(x));
      if (!c.length) c = TECHNIQUES.filter((x) => beginnerSet.includes(x.id) && x.phase.includes(phase));
      c.sort((a, b) => opts.score(b) + fit(b) - opts.score(a) - fit(a));
      const fresh = c.find((x) => !used.has(x.id)) || c[0];
      if (fresh) used.add(fresh.id);
      return { chosen: fresh ? fresh.id : null, candidates: c.map((x) => x.id) };
    };

    let clock = 0;
    const push = (p) => { p.start = clock; clock += p.dur; phases.push(p); };
    push({ type: "intro", dur: intro, title: t("phIntro"), text: t("introTxt") + (S.theme ? " — " + S.theme : "") });
    if (opening) push({ type: "opening", dur: opening, title: t("phOpening"), text: T[lang].openTxt[S.opening] });

    // heat level per round: builds to the end; after a full draft it builds again
    for (let r = 0; r < rounds; r++) {
      const last = r === rounds - 1;
      const afterDraft = airing === "draft" && airAt >= 0 && r > airAt;
      const heatStage = afterDraft ? (r - airAt) / (rounds - airAt - 1 || 1) : r / (rounds - 1 || 1); // 0 … 1
      const scentId = S.scents[r % S.scents.length];
      const scent = nm(SCENTS.find((s) => s.id === scentId)) || "—";
      const ml = Math.round(totalWater * weights[r] / 10) * 10;
      const steps = [];
      steps.push({ kind: "pour", text: fmt(T[lang].pourTxt[S.pour], { scent, ml }), ml });
      steps.push({ kind: "tech", label: t("spreadTxt"), ...pick("spread", { maxLevel, maxShow: 3, score: (x) => x.air * 2 + (x.id === "propeller" ? 3 : 0), exclude: [] }) });
      // complexity falls as heat rises; show techniques early
      const lvl = heatStage < 0.5 ? maxLevel : heatStage < 1 ? Math.min(maxLevel, 2) : 1;
      const showCap = heatStage < 0.5 ? style.show : Math.min(style.show, 2);
      const nTech = roundTime >= 2.5 ? 2 : 1;
      for (let i = 0; i < nTech; i++) {
        steps.push({ kind: "tech", label: t("distTxt"), ...pick(last ? "peak" : "distribute", {
          maxLevel: lvl, maxShow: last ? 1 : showCap,
          score: (x) => (last ? x.heat * 3 + x.air : (heatStage < 0.5 ? x.show * 2 + x.level : x.air * 2 + x.heat) + (x.status === "described" ? 1 : 0)) + (reachF > 1 ? x.air : 0),
        }) });
      }
      if (S.reach === "far" && r === 0) steps.push({ kind: "note", text: t("farTxt") });
      if (S.clearance === "tight" && r === 0) steps.push({ kind: "note", text: t("tightTxt") });
      if (last || heatStage >= 0.99) steps.push({ kind: "note", text: t("watchTop") });
      if (!last) steps.push({ kind: "abShort", text: t("abShort") });
      if (style.music) steps.push({ kind: "music", text: T[lang].musicTxt[heatStage < 0.34 ? 0 : heatStage < 0.99 ? 1 : 2] });
      const title = last ? t("phFinale") : t("phRound") + " " + (r + 1);
      push({ type: "round", dur: roundTime, title, steps, heat: heatStage, scentId });
      const extra = S.extras && S.extras !== "none" ? t("extraTxt") + nm(EXTRAS.find((e) => e.id === S.extras)) : "";
      if (r === airAt) push({ type: "airing", dur: airTime, title: t("phAiring"), text: T[lang].airTxt[airing] + (extra ? " " + extra + "." : "") });
      else if (extra && airAt < 0 && r === rounds - 2) phases[phases.length - 1].steps.push({ kind: "note", text: extra + "." });
    }
    push({ type: "abFinal", dur: finaleAb, title: "Abschlagen", text: t("abFinal"),
      steps: [{ kind: "tech", label: "", ...pick("abschlag", { maxLevel: 3, maxShow: 3, score: (x) => x.heat * 2 + (x.id === "abschlagen" ? 5 : 0) }) }] });
    push({ type: "closing", dur: closing, title: t("phClose"), text: T[lang].closeTxt[S.closing] });

    const max = RULES.maxMinutes(S.temp);
    if (S.minutes > max) warnings.push(fmt(t("warnTooLong"), { temp: S.temp, max }));
    if (!mine.size) warnings.push(t("warnNoTech"));
    if (S.pour === "water") warnings.push(t("warnWater"));
    return { phases, total: clock, rounds, totalWater, volume, warnings };
  }

  // ---------- Rendering ----------
  function render() {
    document.documentElement.lang = lang;
    $("#tagline").textContent = t("tagline");
    document.querySelectorAll("[data-tab]").forEach((b) => (b.textContent = t("tab" + b.dataset.tab)));
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    renderDesign(); renderLibrary(); renderAbout();
    if (phys) { phys.stop(); phys = window.AufgussPhysics.mount($("#physics"), lang, RULES); if ($("#physics").hidden) phys.pause(); }
  }

  function opt(list, val) { return list.map((o) => `<option value="${o.id}" ${o.id === val ? "selected" : ""}>${esc(nm(o))}</option>`).join(""); }

  function renderDesign() {
    const S = settings;
    const scentSel = (i) => `<select data-scent="${i}" aria-label="${t("scents")} ${i + 1}">${SCENTS.map((s) => `<option value="${s.id}" ${S.scents[i] === s.id ? "selected" : ""}>${esc(nm(s))}</option>`).join("")}</select>`;
    const rounds = S.rounds || (S.minutes >= 12 ? 4 : S.minutes >= 8 ? 3 : 2);
    $("#design").innerHTML = `
      <section class="card" id="meCard" aria-live="polite"></section>
      <section class="card" aria-labelledby="setupH">
        <h2 id="setupH">${t("setup")}</h2>
        <label class="row"><span>${t("minutes")}</span><output>${S.minutes} ${t("min")}</output></label>
        <input type="range" min="6" max="15" step="1" value="${S.minutes}" data-k="minutes" aria-label="${t("minutes")}">
        <label class="row"><span>${t("temp")}</span><output>${S.temp} °C</output></label>
        <input type="range" min="70" max="105" step="5" value="${S.temp}" data-k="temp" aria-label="${t("temp")}">
        <label class="row"><span>${t("seats")}</span><output>${S.seats} · ≈ ${RULES.volumeFromSeats(S.seats)} m³ (${t("estimate")})</output></label>
        <input type="range" min="2" max="80" step="1" value="${S.seats}" data-k="seats" aria-label="${t("seats")}">
        <div class="grid2">
          <label>${t("level")}<select data-k="level">${[1, 2, 3].map((l) => `<option value="${l}" ${S.level == l ? "selected" : ""}>${t("lv" + l)}</option>`).join("")}</select></label>
          <label>${t("style")}<select data-k="style">${opt(STYLES, S.style)}</select></label>
          <label>${t("rounds")}<select data-k="rounds">${[0, 2, 3, 4].map((n) => `<option value="${n}" ${S.rounds == n ? "selected" : ""}>${n || t("auto")}</option>`).join("")}</select></label>
          <label>${t("opening")}<select data-k="opening">${opt(OPTIONS.opening, S.opening)}</select></label>
          <label>${t("pour")}<select data-k="pour">${opt(OPTIONS.pour, S.pour)}</select></label>
          <label>${t("airingAvail")}<select data-k="airingAvail">
            <option value="none" ${S.airingAvail === "none" ? "selected" : ""}>${t("airNone")}</option>
            <option value="door" ${S.airingAvail === "door" ? "selected" : ""}>${t("airDoor")}</option>
            <option value="draft" ${S.airingAvail === "draft" ? "selected" : ""}>${t("airDraft")}</option></select></label>
          <label>${t("between")}<select data-k="between" ${S.airingAvail === "none" ? "disabled" : ""}>${opt(OPTIONS.between.filter((o) => S.airingAvail === "draft" || o.id !== "draft"), S.between)}</select></label>
          <label>${t("closing")}<select data-k="closing">${opt(OPTIONS.closing, S.closing)}</select></label>
          <label>${t("clearance")}<select data-k="clearance">${["tight", "normal", "roomy"].map((c) => `<option value="${c}" ${S.clearance === c ? "selected" : ""}>${t("cl" + c[0].toUpperCase() + c.slice(1))}</option>`).join("")}</select></label>
          <label>${t("reach")}<select data-k="reach">${["near", "mid", "far"].map((c) => `<option value="${c}" ${S.reach === c ? "selected" : ""}>${t("r" + c[0].toUpperCase() + c.slice(1))}</option>`).join("")}</select></label>
          <label>${t("extras")}<select data-k="extras">${opt(EXTRAS, S.extras)}</select></label>
        </div>
        <fieldset class="scents"><legend>${t("scents")}</legend>${Array.from({ length: rounds }, (_, i) => scentSel(i)).join("")}</fieldset>
        <label>${t("theme")}<input type="text" data-k="theme" value="${esc(S.theme)}" placeholder="${esc(t("themePh"))}"></label>
      </section>
      <section id="planOut" aria-live="polite"></section>`;
    renderMe();
    renderPlan();
  }

  // ---------- Profile: your sauna animal ----------
  const L2 = (pair) => (lang === "de" ? pair[1] : pair[0]);
  function portrait(animal, wave) {
    const E = window.PoseEngine; if (!E) return "";
    const pose = { view: "front", aN: wave ? [70, 110] : [-75, -95], aF: [-105, -85], lN: [-90, -90, 0], lF: [-90, -90, 180] };
    try { return `<svg viewBox="-10 -20 300 250" aria-hidden="true">${E.svgInner(pose, { style: "cat", animal })}</svg>`; } catch (e) { return ""; }
  }
  function renderMe() {
    const el = $("#meCard"); if (!el || !PR) return;
    if (!me) {
      el.innerHTML = `<div class="me">${portrait("fox", true)}<div><h2>${lang === "de" ? "Welches Sauna-Tier bist du?" : "Which sauna animal are you?"}</h2>
        <p>${lang === "de" ? "Sieben kurze Fragen zu Hitze, Kraft, Rhythmus und Düften. Daraus wird dein Level und ein Aufguss, der zu dir passt." : "Seven short questions about heat, power, rhythm and scents. They set your level and an infusion that suits you."}</p>
        <button class="primary" data-quiz>${lang === "de" ? "Finde es heraus (1 Minute)" : "Find out (1 minute)"}</button></div></div>`;
      return;
    }
    const a = PR.ANIMAL[me.animal], nat = PR.NATURE[a.nature], h = PR.HEATS[me.heat - 1], o = PR.options(me);
    el.innerHTML = `<div class="me">${portrait(me.animal, true)}<div>
      <p class="code">${esc(PR.code(me, lang))}</p>
      <p>${esc(lang === "de" ? nat.de : nat.en)} · ${esc(lang === "de" ? "Techniken bis" : "techniques up to")} ${t("lv" + o.level)} · ${esc(lang === "de" ? h.textDe : h.text)}</p></div></div>
      <details><summary>${lang === "de" ? "Mehr zu dir" : "More about you"}</summary>
        <p>${esc(lang === "de" ? nat.textDe : nat.text)}</p>
        <p>${esc(L2(PR.SCENT_TXT[me.scent || 0]))}</p>
        ${(me.care || []).map((c) => `<p class="warn">${esc(L2(PR.CARE_TXT[c]))}</p>`).join("")}
        <p class="hint">${lang === "de" ? "Merk dir deinen Code: Er ist dein Profil. Kein Konto, nichts verlässt dein Handy." : "Remember your code: it is your profile. No account, nothing leaves your phone."}</p>
        <p>${lang === "de" ? "Nach einem Aufguss:" : "After an infusion:"}</p>
        <div class="controls"><button data-fb="easy">${lang === "de" ? "Techniken zu leicht" : "Techniques too easy"}</button>
        <button data-fb="hard">${lang === "de" ? "zu schwer" : "too hard"}</button>
        <button data-fb="much">${lang === "de" ? "Zu heiß für mich" : "Too hot for me"}</button></div>
      </details>
      <div class="controls"><button data-quiz>${lang === "de" ? "Neu testen" : "Take the test again"}</button></div>`;
  }
  let quizAnswers = {};
  function openQuiz() {
    quizAnswers = Object.assign({}, me && me.answers);
    const dlg = $("#sheet");
    dlg.innerHTML = `<div class="sheet-in quiz"><header><h2>${lang === "de" ? "Dein Sauna-Tier" : "Your sauna animal"}</h2><button class="x" data-close aria-label="${t("close")}">✕</button></header>
      ${PR.QUESTIONS.map((q) => `<fieldset><legend>${esc(lang === "de" ? q.de : q.en)}</legend>
        ${q.opts.map((o, i) => q.multi
          ? `<label><input type="checkbox" name="q-${q.id}" value="${o[0]}" ${(quizAnswers[q.id] || []).includes(o[0]) ? "checked" : ""}> ${esc(lang === "de" ? o[2] : o[1])}</label>`
          : `<label><input type="radio" name="q-${q.id}" value="${i}" ${quizAnswers[q.id] === i ? "checked" : ""}> ${esc(L2(o))}</label>`).join("")}
      </fieldset>`).join("")}
      <p class="hint" id="quizHint"></p>
      <button class="primary" id="quizGo">${lang === "de" ? "Mein Tier zeigen" : "Show my animal"}</button></div>`;
    dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
    $("#quizGo").onclick = () => {
      const a = {};
      for (const q of PR.QUESTIONS) {
        if (q.multi) a[q.id] = [...dlg.querySelectorAll(`input[name="q-${q.id}"]:checked`)].map((x) => x.value);
        else { const c = dlg.querySelector(`input[name="q-${q.id}"]:checked`); if (!c) { $("#quizHint").textContent = (lang === "de" ? "Noch offen: " : "Still open: ") + (lang === "de" ? q.de : q.en); dlg.querySelector(`input[name="q-${q.id}"]`).focus(); return; } a[q.id] = +c.value; }
      }
      showResult(a);
    };
  }
  function showResult(a, natIdx = 0) {
    const r = PR.assess(a), natId = r.natures[natIdx], nat = PR.NATURE[natId];
    let chosen = me && PR.ANIMAL[me.animal] && PR.ANIMAL[me.animal].nature === natId ? me.animal : nat.animals[0][0];
    const st = () => ({ animal: chosen, level: r.level, heat: r.heat, care: r.care, scent: r.scent, answers: a });
    const dlg = $("#sheet");
    const draw = () => {
      dlg.innerHTML = `<div class="sheet-in"><header><h2>${esc(PR.code(st(), lang))}</h2><button class="x" data-close aria-label="${t("close")}">✕</button></header>
        <p><b>${esc(lang === "de" ? nat.de : nat.en)}.</b> ${esc(lang === "de" ? nat.textDe : nat.text)}</p>
        <p>${lang === "de" ? "Wähle dein Tier:" : "Choose your animal:"}</p>
        <div class="pickanimal" role="group">${nat.animals.map(([id, en, de]) => `<button data-animal="${id}" aria-pressed="${id === chosen}">${portrait(id, id === chosen)}<span>${esc(lang === "de" ? de : en)}</span></button>`).join("")}</div>
        <p>${lang === "de" ? "Alter = dein Level" : "Age = your level"}: ${esc(lang === "de" ? PR.AGES[r.level - 1].de : PR.AGES[r.level - 1].en)} · ${lang === "de" ? "Hitze" : "Heat"}: ${esc(lang === "de" ? PR.HEATS[r.heat - 1].de : PR.HEATS[r.heat - 1].en)}</p>
        ${r.care.map((c) => `<p class="warn">${esc(L2(PR.CARE_TXT[c]))}</p>`).join("")}
        <div class="controls"><button class="primary" id="meSave">${lang === "de" ? "Das bin ich" : "That's me"}</button>
          <button id="meOther">${lang === "de" ? "Passt nicht – nächste Natur" : "Doesn't fit – next nature"}</button></div></div>`;
      dlg.querySelectorAll("[data-animal]").forEach((b) => (b.onclick = () => { chosen = b.dataset.animal; draw(); }));
      $("#meOther").onclick = () => showResult(a, (natIdx + 1) % r.natures.length);
      $("#meSave").onclick = () => { me = st(); store.set("me", me); applyProfile(); closeTech(); };
    };
    draw();
  }
  function applyProfile() {
    const o = PR.options(me);
    settings.level = o.level;
    settings.minutes = Math.min(o.minutes, RULES.maxMinutes(settings.temp));
    if (o.style) settings.style = o.style;
    store.set("settings", settings);
    if (PR.ANIMAL[me.animal]) { figure = me.animal; store.set("figure", figure); }
    if (!mine.size) { // a first guess at what you can do; untick what you can't
      TECHNIQUES.filter((x) => x.status === "described" && (x.level < o.level || (x.level === o.level && (o.fam.includes(x.family) || x.level === 1)))).forEach((x) => mine.add(x.id));
      store.set("mine", [...mine]);
    }
    render();
  }

  function renderPlan(existing) {
    plan = existing || compose(settings);
    const el = $("#planOut");
    const chip = (step, pi, si) => {
      const x = byId[step.chosen]; if (!x) return "";
      return `<div class="tech">
        <button class="chip" data-open="${x.id}"><span class="code">${esc(x.code)}</span> ${esc(nm(x.name))}${x.status === "named" ? ' <span class="verify" aria-label="' + t("toVerify") + '">?</span>' : ""}</button>
        ${step.candidates.length > 1 ? `<button class="swap" data-swap="${pi}:${si}" aria-label="${t("swap")}: ${esc(nm(x.name))}">⇄</button>` : ""}
        ${step.label ? `<span class="lbl">${esc(step.label)}</span>` : ""}</div>`;
    };
    el.innerHTML = `
      <h2>${t("plan")} <small>${t("total")} ${mmss(plan.total)} · ${t("water")} ≈ ${(Math.round(plan.totalWater / 100) / 10).toLocaleString(lang)} l</small></h2>
      ${plan.warnings.map((w) => `<p class="warn">${esc(w)}</p>`).join("")}
      <p class="hint">${t("tapTech")}</p>
      <ol class="timeline">${plan.phases.map((p, pi) => `
        <li class="ph ph-${p.type}" style="--heat:${p.heat ?? (p.type === "abFinal" ? 1 : 0)}">
          <div class="when">${mmss(p.start)}</div>
          <div class="body"><h3>${esc(p.title)} <small>${mmss(p.dur)}</small></h3>
            ${p.text ? `<p>${esc(p.text)}</p>` : ""}
            ${(p.steps || []).map((s, si) => s.kind === "tech" ? chip(s, pi, si) : `<p class="k-${s.kind}">${esc(s.text)}</p>`).join("")}
          </div></li>`).join("")}
      </ol>`;
  }

  function renderLibrary() {
    const list = TECHNIQUES.filter((x) => libFilter === "all" || (libFilter === "mine" ? mine.has(x.id) : String(x.level) === libFilter));
    const dots = (n) => "●".repeat(n) + "○".repeat(3 - n);
    $("#library").innerHTML = `
      <p style="margin:0 16px 8px"><a class="labbtn" href="lab.html">${lang === "de" ? "Wedel-Labor: Techniken in 3D ausprobieren" : "Towel lab: try techniques in 3D"}</a></p>
      <div class="filters" role="group">
        ${["all", "1", "2", "3", "mine"].map((f) => `<button data-filter="${f}" aria-pressed="${libFilter === f}">${f === "all" ? t("all") : f === "mine" ? t("mine") + " (" + mine.size + ")" : t("lv" + f)}</button>`).join("")}
      </div>
      <ul class="lib">${list.map((x) => `
        <li><button class="libitem" data-open="${x.id}">
          <strong><span class="code">${esc(x.code)}</span> ${esc(nm(x.name))}</strong>
          <span class="meta">${t("lv" + x.level)} · ${t("fam")[x.family]}${x.status === "named" ? " · " + t("toVerify") : ""}</span>
          <span class="meta">${t("air")} ${dots(x.air)} · ${t("heat")} ${dots(x.heat)} · ${t("show")} ${dots(x.show)}</span>
        </button>
        <label class="cando"><input type="checkbox" data-mine="${x.id}" ${mine.has(x.id) ? "checked" : ""}> ${t("canDo")}</label></li>`).join("")}
      </ul>`;
  }

  function renderAbout() {
    $("#about").innerHTML = `<section class="card"><h2>${t("aboutTitle")}</h2><ol class="gram">${GRAMMAR.map((g) => `<li><b>${g.no}</b> ${esc(g[lang] || g.en)}</li>`).join("")}</ol>
      <p class="hint">${t("aboutNote")}</p></section>
      <section class="card"><h2>${t("install")}</h2><p>${t("installTxt")}</p></section>
      <p class="foot">MIT · ${lang === "de" ? "Kostenlos, ohne Konto, ohne Tracking." : "Free, no account, no tracking."}</p>`;
  }

  // ---------- Technique sheet with demo ----------
  let demo = null;
  let figure = store.get("figure", "bear");
  const FIG = { bear: { en: "Bear", de: "Bär" }, cat: { en: "Cat", de: "Katze" }, panda: { en: "Panda", de: "Panda" }, fox: { en: "Fox", de: "Fuchs" },
    otter: { en: "Otter", de: "Otter" }, tiger: { en: "Tiger", de: "Tiger" }, koala: { en: "Koala", de: "Koala" }, stick: { en: "Stick figure", de: "Strichmännchen" } };
  function openTech(id) {
    const x0 = byId[id]; if (!x0) return;
    const ov = store.get("lab.override", {})[id], x = ov ? Object.assign({}, x0, { demo: ov }) : x0;
    const dlg = $("#sheet");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    dlg.innerHTML = `<div class="sheet-in">
      <header><h2><span class="code">${esc(x.code)}</span> ${esc(nm(x.name))}</h2><button class="x" data-close aria-label="${t("close")}">✕</button></header>
      <p class="meta">${t("lv" + x.level)} · ${t("fam")[x.family]} · ${x.hands === 2 ? "2 ✋" : "1 ✋"}${x.towels === 2 ? " · 2 towels" : ""}${x.status === "named" ? " · " + t("toVerify") : ""}</p>
      ${x.clip ? `<button class="clipbtn" id="clipBtn">▶ ${lang === "de" ? "Clip ansehen" : "Watch clip"} · ${esc(x.clip.credit || "YouTube")}</button><div class="cliphost" id="clipHost"></div>` : ""}
      <canvas id="demoCanvas" role="img" aria-label="${esc(nm(x.name))}"></canvas>
      <label class="figpick">${lang === "de" ? "Figur" : "Figure"} <select id="figSel">${(PR ? PR.ANIMALS.map((a) => a.id) : ["bear", "cat", "panda", "fox", "otter", "tiger", "koala"]).filter((f) => f === "cat" || (window.PoseEngine && window.PoseEngine.KITS[f])).concat(["stick"]).map((f) => `<option value="${f}" ${f === figure ? "selected" : ""}>${FIG[f] ? FIG[f][lang] : PR && PR.ANIMAL[f] ? PR.ANIMAL[f][lang] : f}</option>`).join("")}</select></label>
      <div class="controls"><button id="playBtn">${reduce ? t("play") : t("pause")}</button>
        <label>${t("tempo")} <input id="tempo" type="range" min="0.25" max="1.5" step="0.05" value="1"></label></div>
      <p class="hint">${t("tempoHint")}</p>
      <p class="controls"><a class="labbtn" href="lab.html?t=${esc(id)}">${lang === "de" ? "Im Wedel-Labor ausprobieren (3D)" : "Try it in the towel lab (3D)"}</a>
        ${ov ? `<button id="ovReset">${lang === "de" ? "Deine Labor-Version · zurücksetzen" : "Your lab version · reset"}</button>` : ""}</p>
      <p>${esc(nm(x.desc))}</p><p><em>${esc(nm(x.use))}</em></p>
      ${x.related && x.related.length ? `<p class="meta">${t("related")}: ${esc(x.related.join(", "))}</p>` : ""}
      ${x.aka && x.aka.length ? `<p class="meta">aka ${esc(x.aka.join(", "))}</p>` : ""}
      ${x.videos && x.videos.length ? `<p class="meta">▶ ${x.videos.map((v) => `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a>`).join(" · ")}</p>` : ""}
      <label class="cando"><input type="checkbox" data-mine="${x.id}" ${mine.has(x.id) ? "checked" : ""}> ${t("canDo")}</label>
    </div>`;
    dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
    const cs = getComputedStyle(document.documentElement);
    demo = new window.TechniqueDemo($("#demoCanvas"), x, { figure, colors: {
      body: cs.getPropertyValue("--ink").trim() || "#3b2a20", towel: "#f6f1e8", edge: cs.getPropertyValue("--wood").trim() || "#b98a5c", line: cs.getPropertyValue("--line").trim() || "#d9c7b3" } });
    if (!reduce) demo.play();
    if (ov) $("#ovReset").onclick = () => { const all = store.get("lab.override", {}); delete all[id]; store.set("lab.override", all); closeTech(); openTech(id); };
    $("#playBtn").onclick = () => { if (demo.running) { demo.pause(); $("#playBtn").textContent = t("play"); } else { demo.play(); $("#playBtn").textContent = t("pause"); } };
    $("#tempo").oninput = (e) => demo.setTempo(parseFloat(e.target.value));
    $("#figSel").onchange = (e) => { figure = e.target.value; store.set("figure", figure); closeTech(); openTech(id); };
    if (x.clip) $("#clipBtn").onclick = () => {
      if (clipLoop) { clipLoop.stop(); clipLoop = null; return; }
      window.AufgussClip.loop($("#clipHost"), x.clip).then((h) => (clipLoop = h)).catch(() => { $("#clipHost").textContent = lang === "de" ? "Offline: Clip nicht verfügbar." : "Offline: clip not available."; });
    };
  }
  let clipLoop = null;
  function closeTech() { const dlg = $("#sheet"); if (clipLoop) { clipLoop.stop(); clipLoop = null; } if (demo) { demo.destroy(); demo = null; } dlg.close ? dlg.close() : dlg.removeAttribute("open"); }

  // ---------- Events ----------
  document.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (k && e.target.type === "range") {
      settings[k] = parseFloat(e.target.value);
      e.target.previousElementSibling.querySelector("output").textContent = k === "seats" ? `${settings[k]} · ≈ ${RULES.volumeFromSeats(settings[k])} m³ (${t("estimate")})` : settings[k] + (k === "minutes" ? " " + t("min") : " °C");
      store.set("settings", settings); renderPlan();
    }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.k && el.type !== "range") {
      const k = el.dataset.k;
      settings[k] = ["level", "rounds"].includes(k) ? parseInt(el.value, 10) : el.value;
      if (settings.seats === undefined) settings.seats = 20;
      store.set("settings", settings);
      if (["rounds", "airingAvail", "style"].includes(k)) renderDesign(); else renderPlan();
    } else if (el.dataset.scent !== undefined) {
      settings.scents[+el.dataset.scent] = el.value; store.set("settings", settings); renderPlan();
    } else if (el.dataset.mine) {
      el.checked ? mine.add(el.dataset.mine) : mine.delete(el.dataset.mine);
      store.set("mine", [...mine]); renderLibrary(); renderPlan();
    }
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.tab) {
      document.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
      document.querySelectorAll("main > section.view").forEach((s) => (s.hidden = s.id !== b.dataset.view));
      if (b.dataset.view === "physics") { if (!phys && window.AufgussPhysics) phys = window.AufgussPhysics.mount($("#physics"), lang, RULES); else if (phys) phys.resume(); }
      else if (phys) phys.pause();
    } else if (b.dataset.lang) { lang = b.dataset.lang; store.set("lang", lang); render(); }
    else if (b.dataset.open) openTech(b.dataset.open);
    else if (b.dataset.quiz !== undefined) openQuiz();
    else if (b.dataset.fb) { me = PR.next(me, { tech: b.dataset.fb, heat: b.dataset.fb }); store.set("me", me); applyProfile(); }
    else if (b.dataset.close !== undefined) closeTech();
    else if (b.dataset.filter) { libFilter = b.dataset.filter; renderLibrary(); }
    else if (b.dataset.swap) {
      const [pi, si] = b.dataset.swap.split(":").map(Number);
      const step = plan.phases[pi].steps[si];
      const i = step.candidates.indexOf(step.chosen);
      step.chosen = step.candidates[(i + 1) % step.candidates.length];
      // re-render this plan without recomposing
      renderPlan(plan);
    }
  });
  $("#sheet").addEventListener("close", () => { if (clipLoop) { clipLoop.stop(); clipLoop = null; } if (demo) { demo.destroy(); demo = null; } });
  $("#sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") closeTech(); });

  render();
  const fromHash = () => { const m = location.hash.match(/^#t-([\w-]+)$/); if (m && byId[m[1]]) openTech(m[1]); };
  fromHash(); window.addEventListener("hashchange", fromHash);
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
