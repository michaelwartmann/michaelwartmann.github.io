/* Popely – Spiel-Engine (Basti in der Popely-Welt). MIT. Keine Abhängigkeiten.
   Läuft im Browser (self.Popely) und in Node (module.exports) für die Simulation.
   Regeln: files/Popely_Regeln_Preistafel.pdf. Standard-Annahmen für Lücken stehen bei RULES. */
(function (root) {
  'use strict';

  const RULES = {
    // Abgestimmt mit 1.000 simulierten Partien. Papier-Preistafel (26.11.2026): Gehalt 10, Konzert 20,
    // 4 Bausteine pro Person – damit wurde die Bühne in der Simulation nie fertig (das Geld reicht nicht).
    start: 75, gehalt: 20, gage: 10, egoGrenze: 50, egoMalus: 2,
    pacht: [5, 8, 12, 16], miete: [1, 1, 2, 2], pachtRunden: 2,
    klein: { cost: 15, pts: 1 }, mittel: { cost: 50, pts: 5 }, mega: { cost: 125, pts: 13 },
    konzert: { cost: 10, pts: 1 },
    werkstattBaustein: 10,   // Annahme: auf der Werkstatt 1 Baustein für 1 Gage
    projektFeldRabatt: 5,    // Annahme: auf dem Projekt-Feld legt die Bank 5 Plektren dazu
    bausteineProPerson: n => 3,
    maxRunden: 12            // statt 90 Minuten: so viele Tischrunden, dann gewinnt der Turm
  };

  // 30 Felder, im Uhrzeigersinn ab Start (unten rechts)
  const F = (n, t, i, s, g) => ({ n, t, i, s: s || 0, g: g || '' });
  const FIELDS = [
    F('Aufwachen', 'start', '☀️'),
    F('Kellerproberaum', 'pacht', '🥁', 1, 'Proberaum-Gasse'),
    F('Sternenfunk', 'S', '📡'),
    F('Waschküchen-Studio', 'pacht', '🎛️', 1, 'Proberaum-Gasse'),
    F('Unplugged', 'U', '🔌'),
    F('Garagenbühne', 'pacht', '🎸', 1, 'Proberaum-Gasse'),
    F('Tourbus', 'pacht', '🚐', 3, 'Reisewege'),
    F('Ego-Steuer', 'steuer', '🪞'),
    F('Erholungsinsel', 'pause', '🏝️'),
    F('Küchentisch', 'pacht', '🍲', 2, 'Skywalker-Hof'),
    F('Werkstatt', 'werkstatt', '🔧'),
    F('Kinderzimmer', 'pacht', '🧸', 2, 'Skywalker-Hof'),
    F('Verstärker-Werk', 'pacht', '🔊', 2, 'Kraftquellen'),
    F('Sternenfunk', 'S', '📡'),
    F('Skywalker-Haus', 'pacht', '🌌', 3, 'Skywalker-Hof'),
    F('Autopilot', 'autopilot', '🤖'),
    F('Sternenfähre', 'pacht', '🚀', 3, 'Reisewege'),
    F('Projekt', 'projekt', '🌱'),
    F('Podcast-Studio', 'pacht', '🎙️', 3, 'Bühne & Business'),
    F('Unplugged', 'U', '🔌'),
    F('Gründer-Garage', 'pacht', '💡', 4, 'Bühne & Business'),
    F('Werkstatt', 'werkstatt', '🔧'),
    F('Club-Bühne', 'pacht', '🎤', 4, 'Bühne & Business'),
    F('Ab in den Autopilot', 'goauto', '🌀'),
    F('Atem-Kraftwerk', 'pacht', '🌬️', 4, 'Kraftquellen'),
    F('Sternenfunk', 'S', '📡'),
    F('Festival-Wiese', 'pacht', '🎪', 4, 'Bühne & Business'),
    F('Projekt', 'projekt', '🌱'),
    F('Unplugged', 'U', '🔌'),
    F('Ego-Steuer', 'steuer', '🪞')
  ];
  const AUTOPILOT = 15;

  const P = (id, n, i, size) => ({ id, n, i, size });
  const PROJECTS = [
    P(0, 'Gemeinschaftsgarten', '🌻', 'klein'), P(1, 'Proberaum für alle', '🥁', 'klein'),
    P(2, 'Kinderbühne', '🧸', 'klein'), P(3, 'Atemraum im Park', '🌬️', 'klein'),
    P(4, 'Musikschule', '🎼', 'mittel'), P(5, 'Familienzentrum', '👨‍👩‍👧', 'mittel'),
    P(6, 'Offenes Podcast-Studio', '🎙️', 'mittel'), P(7, 'Krankenhaus mit Herz', '🏥', 'mittel'),
    P(8, 'Festival für die ganze Stadt', '🎪', 'mega'), P(9, 'Sternenwarte', '🔭', 'mega'),
    P(10, 'Akademie der Echtheit', '🏛️', 'mega')
  ];

  // Geheime Persönlichkeiten. e = Ego (0 gibt, 1 nimmt), m = Mut (0 spart, 1 sofort),
  // r = Gegenseitigkeit (0 keine … 1 stark), z = Zufall. Nie im Spiel anzeigen.
  const NPCS = {
    lotte: { name: 'Lotte', e: 0.75, m: 0.6, r: 0, z: 0.3 },
    rocco: { name: 'Rocco', e: 0.15, m: 0.7, r: 1, z: 0.15 },
    mira: { name: 'Mira', e: 0.15, m: 0.25, r: 0.5, z: 0.15 },
    jay: { name: 'Jay', e: 0.85, m: 0.35, r: 0.5, z: 0.15 },
    kalle: { name: 'Kalle', e: 0.3, m: 0.9, r: 0, z: 0.5 },
    nova: { name: 'Nova', e: null, m: null, r: null, z: 0.5 }
  };

  // ---------- Zufall mit Seed ----------
  function rnd(G) { // mulberry32
    let t = (G.rng = (G.rng + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const rint = (G, n) => Math.floor(rnd(G) * n);
  function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = rint(G, i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- Neues Spiel ----------
  function newGame(opts) {
    const cards = opts.cards;
    const G = {
      v: 1, seed: opts.seed >>> 0, rng: opts.seed >>> 0, dice: opts.dice || 'w4w8',
      players: [], turn: 0, round: 1, maxRounds: opts.maxRounds || RULES.maxRunden,
      stage: 0, goal: 0, tower: { bricks: 0, loot: {} }, lordAt: null,
      leases: {}, projDeck: [], open: [], done: [], mega: {},
      decks: { S: [], U: [] }, ending: false, over: null, kind: {}, turnsPlayed: 0
    };
    opts.players.forEach((o, i) => {
      let npc = null;
      if (!o.human) {
        const b = NPCS[o.npc];
        npc = { id: o.npc, e: b.e, m: b.m, r: b.r, z: b.z };
        if (b.e === null) { npc.e = 0.1 + rnd(G) * 0.85; npc.m = 0.1 + rnd(G) * 0.85; npc.r = rnd(G) < 0.5 ? 0 : 0.7; }
      }
      G.players.push({ name: o.name, human: !!o.human, npc, color: o.color || i, pos: 0, pl: RULES.start, pts: 0, amp: 0, bricks: 0, kept: [], auto: false, laps: 0 });
    });
    G.goal = RULES.bausteineProPerson(G.players.length) * G.players.length;
    cards.forEach((c, i) => G.decks[c.d].push(i));
    shuffle(G, G.decks.S); shuffle(G, G.decks.U);
    G.projDeck = shuffle(G, PROJECTS.map(p => p.id));
    // nie drei Mega-Projekte gleichzeitig am Anfang: ein kleines nach vorn
    G.open = [];
    refill(G);
    if (G.open.every(id => PROJECTS[id].size === 'mega')) {
      const k = G.projDeck.findIndex(id => PROJECTS[id].size === 'klein');
      const sw = G.projDeck.splice(k, 1)[0]; G.projDeck.push(G.open[0]); G.open[0] = sw;
    }
    return G;
  }
  function refill(G) { while (G.open.length < 3 && G.projDeck.length) G.open.push(G.projDeck.pop()); }

  // ---------- Hilfen ----------
  const others = (G, p) => G.players.map((_, i) => i).filter(i => i !== p);
  function extreme(G, key, max, excl) { // Index mit größtem/kleinstem Wert, Gleichstand: zufällig
    let best = null, idx = [];
    G.players.forEach((q, i) => {
      if (i === excl) return;
      const v = q[key];
      if (best === null || (max ? v > best : v < best)) { best = v; idx = [i]; } else if (v === best) idx.push(i);
    });
    return idx[rint(G, idx.length)];
  }
  function pay(G, p, amt) { const q = G.players[p]; const x = Math.min(q.pl, amt); q.pl -= x; return x; }
  function give(G, from, to, amt) { const x = pay(G, from, amt); G.players[to].pl += x; note(G, to, from, +1); return x; }
  function note(G, who, about, d) { // "who" merkt sich, wie "about" zu ihm war
    const k = who + '>' + about; G.kind[k] = clamp((G.kind[k] || 0) + d, -3, 3);
  }
  const score = q => q.pts - RULES.egoMalus * q.amp;
  function pressure(G) { return clamp(G.round / G.maxRounds - G.stage / G.goal, 0, 1); }
  function dividend(G) { return G.done.length; } // Preistafel: pro fertigem Projekt auf dem Tisch

  // ---------- NPC-Entscheidungen ----------
  function chance(G, q, base) { return rnd(G) < clamp(base + (rnd(G) - 0.5) * q.npc.z, 0.02, 0.98); }
  function egoToward(G, p, o) {
    const q = G.players[p].npc; const k = G.kind[p + '>' + o] || 0;
    return clamp(q.e - q.r * 0.22 * k, 0, 1);
  }
  function cushion(q) { return Math.round((1 - q.npc.m) * 12); }

  function npcDecide(G, p, kind, d) {
    const q = G.players[p], n = q.npc, pr = pressure(G);
    switch (kind) {
      case 'lease': return q.pl - d.price >= cushion(q) && chance(G, q, 0.3 + 0.35 * n.e);
      case 'guest': return chance(G, q, egoToward(G, p, d.guest) * 1.05 - 0.05) ? 'miete' : 'buehne';
      case 'autopilot': return q.pl >= RULES.gage + cushion(q) && chance(G, q, 0.25 + 0.6 * n.m) ? 'pay' : 'skip';
      case 'veto': return d.card.k.includes('lord') || (d.card.t === 'Knopf gedrückt' && d.drawer === p) ? true : false;
      case 'verlockung': return chance(G, q, n.e);
      case 'angebot': return chance(G, q, n.e * 0.95);
      case 'knopf': return q.pl >= RULES.gage + cushion(q) && chance(G, q, 0.3 + 0.5 * n.m) ? 'pay' : 'auto';
      case 'lauter': return q.pl >= RULES.gage && chance(G, q, 1 - n.e) ? 'give' : 'amp';
      case 'join': return q.pl >= RULES.gage && chance(G, q, (1 - n.e) * 0.9 + pr * 0.3);
      case 'partner': { // 2+2: Partner wählen (wer ist am nettesten zu mir / wer hat Geld)
        const c = others(G, p).filter(o => G.players[o].pl >= d.half);
        if (!c.length || q.pl < d.half) return null;
        c.sort((a, b) => (G.kind[p + '>' + b] || 0) - (G.kind[p + '>' + a] || 0));
        return c[0];
      }
      case 'partnerOk': return q.pl >= d.half && chance(G, q, 0.95 - n.e * 0.5);
      case 'megaJoin': return megaAmount(G, p, d.id);
    }
    return null;
  }
  function megaAmount(G, p, id) {
    const q = G.players[p], n = q.npc, pr = pressure(G);
    const need = RULES.mega.cost - megaPaid(G, id);
    const budget = q.pl - cushion(q);
    if (budget < 10 || !chance(G, q, (1 - n.e) * (0.9 - 0.35 * n.m) + pr * 0.3)) return 0;
    return Math.min(need, Math.floor(budget * (0.5 + 0.4 * (1 - n.e)) / 5) * 5);
  }
  function megaPaid(G, id) { const m = G.mega[id] || {}; return Object.values(m).reduce((a, b) => a + b, 0); }

  // Was der NPC nach dem Ziehen tut (Projekt, Konzert, Werkstatt, Mega)
  function npcAction(G, p, T) {
    const q = G.players[p], n = q.npc, pr = pressure(G);
    const cu = cushion(q), rab = T.rabatt;
    if (!T.built) {
      const costOf = id => RULES[PROJECTS[id].size].cost - rab;
      const aff = G.open.filter(id => PROJECTS[id].size !== 'mega' && costOf(id) <= q.pl - Math.min(cu, 5));
      const mittelOpen = G.open.some(id => PROJECTS[id].size === 'mittel');
      const megaOpen = G.open.filter(id => PROJECTS[id].size === 'mega');
      if (aff.length && chance(G, q, 1.05 - n.e * 0.85 + pr * 0.4)) {
        const mit = aff.filter(id => PROJECTS[id].size === 'mittel');
        if (mit.length) return { a: 'project', id: mit[0] };
        // Geduldige sparen auf das mittlere Projekt, statt klein zu bauen
        const save = mittelOpen && q.pl >= 25 && chance(G, q, (1 - n.m) * 0.75 - pr * 0.5);
        if (!save) return { a: 'project', id: aff[0] };
      }
      if (megaOpen.length && !T.megaTried) {
        T.megaTried = true;
        megaOpen.sort((a, b) => megaPaid(G, b) - megaPaid(G, a));
        const amt = megaAmount(G, p, megaOpen[0]);
        // lohnt sich nur, wenn schon etwas drin ist oder der NPC geduldig ist
        if (amt >= 10 && (megaPaid(G, megaOpen[0]) > 0 || !aff.length || n.m < 0.5)) return { a: 'mega', id: megaOpen[0], amt };
      }
    }
    if (T.werkstatt && !T.brick && q.pl - RULES.werkstattBaustein >= Math.min(cu, 5) && chance(G, q, 1 - n.e * 0.8 + pr * 0.3)) return { a: 'brick' };
    if (!T.concert && q.pl - RULES.konzert.cost >= cu && chance(G, q, (1 - n.e) * (0.25 + 0.6 * n.m) + pr * 0.6)) return { a: 'concert' };
    return { a: 'end' };
  }

  // ---------- Ablauf ----------
  // io.emit(ev) zeigt etwas (darf ein Promise liefern), io.ask(p, kind, data) fragt einen Menschen.
  async function decide(G, io, p, kind, data) {
    if (G.players[p].human) return io.ask(p, kind, data || {});
    return npcDecide(G, p, kind, data || {});
  }
  const emit = (io, ev) => io.emit ? io.emit(ev) : undefined;

  async function placeBrick(G, io, p, why) {
    G.stage++; G.players[p].bricks++;
    await emit(io, { t: 'brick', p, why });
    if (G.stage >= G.goal && !G.ending) { G.ending = true; await emit(io, { t: 'lastbrick', p }); }
  }
  async function addPts(G, io, p, n, why) { if (!n) return; G.players[p].pts += n; await emit(io, { t: 'pts', p, n, why }); }

  async function lordSteal(G, io, why) {
    const v = extreme(G, 'pl', true);
    G.lordAt = v;
    const q = G.players[v];
    const zi = q.kept.findIndex(ci => io.cards[ci].t === 'Der Zaubertrick');
    if (zi >= 0) { q.kept.splice(zi, 1); await emit(io, { t: 'lord', v, got: 0, trick: true, why }); return; }
    const x = pay(G, v, RULES.gage);
    G.tower.loot[v] = (G.tower.loot[v] || 0) + x;
    await emit(io, { t: 'lord', v, got: x, why });
  }
  async function lordHome(G, io, giveBack) {
    G.lordAt = null;
    if (giveBack) {
      for (const k of Object.keys(G.tower.loot)) G.players[k].pl += G.tower.loot[k];
      G.tower.loot = {};
      G.stage += G.tower.bricks; G.tower.bricks = 0;
      if (G.stage >= G.goal) G.ending = true;
    }
    await emit(io, { t: 'lordhome', giveBack: !!giveBack });
  }

  async function passStart(G, io, p) {
    const q = G.players[p];
    const ego = q.pl > RULES.egoGrenze;
    const div = dividend(G, p);
    q.pl += RULES.gehalt + div; q.laps++;
    if (ego) q.amp++;
    const ended = [];
    for (const k of Object.keys(G.leases)) if (G.leases[k].o === p && --G.leases[k].left <= 0) { delete G.leases[k]; ended.push(+k); }
    await emit(io, { t: 'start', p, div, ego, ended });
  }

  async function moveBy(G, io, p, steps) {
    const q = G.players[p], from = q.pos;
    q.pos = (q.pos + steps) % FIELDS.length;
    await emit(io, { t: 'move', p, from, to: q.pos, steps });
    if (from + steps >= FIELDS.length) await passStart(G, io, p);
  }

  async function toAutopilot(G, io, p) {
    const q = G.players[p], from = q.pos;
    q.pos = AUTOPILOT; q.auto = true;
    await emit(io, { t: 'jump', p, from, to: AUTOPILOT });
  }

  async function finishProject(G, io, p, id, shares, ptsMap) {
    G.open.splice(G.open.indexOf(id), 1); delete G.mega[id];
    G.done.push({ id, shares });
    refill(G);
    await emit(io, { t: 'project', p, id, shares, pts: ptsMap });
    for (const k of Object.keys(ptsMap)) await addPts(G, io, +k, ptsMap[k], 'projekt');
    await placeBrick(G, io, p, 'projekt');
  }

  async function drawCard(G, io, p, d) {
    if (!G.decks[d].length) {
      const kept = new Set(); G.players.forEach(q => q.kept.forEach(c => kept.add(c)));
      io.cards.forEach((c, i) => { if (c.d === d && !kept.has(i)) G.decks[d].push(i); });
      shuffle(G, G.decks[d]);
    }
    const ci = G.decks[d].pop(), c = io.cards[ci];
    // Liebevoll widersprechen: gegen Sternenfunk-Karten
    let holders = [];
    if (d === 'S') holders = G.players.map((q, i) => i).filter(i => G.players[i].kept.some(k => io.cards[k].t === 'Liebevoll widersprechen'));
    const human = holders.find(i => G.players[i].human);
    const res = await emit(io, { t: 'card', p, ci, card: c, canVeto: human !== undefined ? human : null });
    let veto = null;
    if (res === 'veto') veto = human;
    else for (const h of holders) if (!G.players[h].human && npcDecide(G, h, 'veto', { card: c, drawer: p })) { veto = h; break; }
    if (veto !== null) {
      const q = G.players[veto]; q.kept.splice(q.kept.findIndex(k => io.cards[k].t === 'Liebevoll widersprechen'), 1);
      await emit(io, { t: 'veto', p: veto, card: c });
      return null;
    }
    return applyCard(G, io, p, ci, c);
  }

  async function applyCard(G, io, p, ci, c) {
    const q = G.players[p], g = RULES.gage;
    switch (c.t) {
      case 'Einfach machen': return 'again';
      case 'Musikerleben': pay(G, p, g); await emit(io, { t: 'pay', p, n: g, why: 'Sprit' }); await addPts(G, io, p, 1, c.t); break;
      case 'Verlockung':
        if (await decide(G, io, p, 'verlockung', { card: c })) { q.pl += 2 * g; q.amp++; await emit(io, { t: 'tempt', p, yes: true, n: 2 * g, amp: 1 }); }
        else await emit(io, { t: 'tempt', p, yes: false }); break;
      case 'Das große Angebot':
        if (await decide(G, io, p, 'angebot', { card: c })) { q.pl += 4 * g; q.amp += 2; await emit(io, { t: 'tempt', p, yes: true, n: 4 * g, amp: 2 }); }
        else { await emit(io, { t: 'tempt', p, yes: false }); await addPts(G, io, p, 1, c.t); } break;
      case 'Knopf gedrückt':
        if (q.pl >= g && (await decide(G, io, p, 'knopf', { card: c })) === 'pay') { pay(G, p, g); await emit(io, { t: 'pay', p, n: g, why: 'bleibt wach' }); }
        else await toAutopilot(G, io, p); break;
      case 'Je lauter, desto …': {
        const top = extreme(G, 'pts', true), low = extreme(G, 'pts', false, top);
        const ch = G.players[top].pl >= g ? await decide(G, io, top, 'lauter', { card: c, low }) : 'amp';
        if (ch === 'give') { const x = give(G, top, low, g); await emit(io, { t: 'give', from: top, to: low, n: x }); }
        else { G.players[top].amp++; await emit(io, { t: 'amp', p: top, n: 1 }); } break;
      }
      case 'Ego-Spiegel': {
        const top = extreme(G, 'amp', true);
        if (G.players[top].amp > 0 && top !== p) { const x = pay(G, top, g); q.pl += x; await emit(io, { t: 'give', from: top, to: p, n: x, forced: true }); }
        else await emit(io, { t: 'nothing', p }); break;
      }
      case 'Neun Mahlzeiten': {
        const low = extreme(G, 'pl', false);
        for (const o of others(G, low)) { const x = give(G, o, low, g); await emit(io, { t: 'give', from: o, to: low, n: x, forced: true }); } break;
      }
      case 'Ich gönne dir, Bruder': {
        const top = extreme(G, 'pts', true, p);
        const x = give(G, top, p, g); await emit(io, { t: 'give', from: top, to: p, n: x, forced: true });
        await addPts(G, io, p, 1, c.t); await addPts(G, io, top, 1, c.t); break;
      }
      case 'Ego unplugged': if (q.amp > 0) { q.amp--; await emit(io, { t: 'amp', p, n: -1 }); } else await emit(io, { t: 'nothing', p }); break;
      case 'Gefühlsführerschein':
        if (q.human) await io.ask(p, 'gefuehl', { card: c }); else await emit(io, { t: 'say', p, kind: 'gefuehl' });
        await addPts(G, io, p, 1, c.t); break;
      case 'Echte Frage': {
        const left = (p + 1) % G.players.length;
        if (q.human) await io.ask(p, 'frage', { card: c, left }); else await emit(io, { t: 'say', p, kind: 'frage', left });
        note(G, left, p, 1); note(G, p, left, 1);
        await addPts(G, io, p, 1, c.t); await addPts(G, io, left, 1, c.t); break;
      }
      case 'Hoffnung': {
        const min = Math.min(...G.players.map(x => x.pts));
        if (q.pts === min) await addPts(G, io, p, 2, c.t); else { q.pl += g; await emit(io, { t: 'gain', p, n: g }); } break;
      }
      case 'Geben': {
        const low = extreme(G, 'pl', false, p);
        const x = give(G, p, low, g); await emit(io, { t: 'give', from: p, to: low, n: x });
        await addPts(G, io, p, 1, c.t); await addPts(G, io, low, 1, c.t); break;
      }
      case 'Aurora lacht': for (let i = 0; i < G.players.length; i++) G.players[i].pl += RULES.gehalt; await emit(io, { t: 'aurora' }); break;
      case 'Jam-Session': case 'Alle im selben Raumschiff': {
        const jam = c.t === 'Jam-Session', inn = [];
        for (let k = 0; k < G.players.length; k++) {
          const o = (p + k) % G.players.length;
          if (G.players[o].pl >= g && await decide(G, io, o, 'join', { card: c, jam, drawer: p })) { pay(G, o, g); inn.push(o); }
        }
        await emit(io, { t: 'joined', who: inn, jam });
        if (jam) { for (const o of inn) await addPts(G, io, o, 1, c.t); if (inn.length >= 2) { inn.forEach(a => inn.forEach(b => a !== b && note(G, a, b, 1))); await placeBrick(G, io, inn.includes(p) ? p : inn[0], 'jam'); } }
        else if (inn.length >= 2) { for (const o of inn) await addPts(G, io, o, 1, c.t); await lordHome(G, io, false); }
        break;
      }
      case 'Zwei plus zwei ist fünf': {
        const id = G.open.find(i => PROJECTS[i].size === 'klein');
        if (id === undefined) { await emit(io, { t: 'nothing', p, why: 'kein kleines Projekt offen' }); break; }
        const half = Math.ceil(RULES.klein.cost / 2);
        const partner = await decide(G, io, p, 'partner', { card: c, half, id });
        if (partner === null || partner === undefined || q.pl < half) { await emit(io, { t: 'nothing', p }); break; }
        const ok = G.players[partner].human ? await io.ask(partner, 'partnerOk', { card: c, half, id, from: p }) : npcDecide(G, partner, 'partnerOk', { half });
        if (!ok) { await emit(io, { t: 'declined', p: partner, by: p }); note(G, p, partner, -1); break; }
        pay(G, p, half); pay(G, partner, RULES.klein.cost - half); note(G, p, partner, 1); note(G, partner, p, 1);
        await finishProject(G, io, p, id, { [p]: half, [partner]: RULES.klein.cost - half }, { [p]: 1, [partner]: 1 }); break;
      }
      case 'Das Ohr hört alles': await lordSteal(G, io, 'karte'); break;
      case 'Der Beat ist weg':
        if (G.stage > 0) { G.stage--; G.tower.bricks++; if (G.stage < G.goal) G.ending = false; await emit(io, { t: 'beat' }); } else await emit(io, { t: 'nothing', p }); break;
      case 'War das deine Karte?': await lordHome(G, io, true); break;
      case 'Kommt diese Enttäuschung öfter vor?':
        if (G.tower.bricks > 0) { G.tower.bricks--; await emit(io, { t: 'rescue', p }); await placeBrick(G, io, p, 'zauber'); await addPts(G, io, p, 1, c.t); }
        else await emit(io, { t: 'nothing', p }); break;
      case 'Liebevoll widersprechen': case 'Der Zaubertrick': q.kept.push(ci); await emit(io, { t: 'keep', p, card: c }); break;
    }
    return null;
  }

  async function resolveField(G, io, p, T) {
    const q = G.players[p], f = FIELDS[q.pos];
    switch (f.t) {
      case 'pacht': {
        const L = G.leases[q.pos];
        if (!L) {
          const price = RULES.pacht[f.s - 1];
          if (q.pl >= price && await decide(G, io, p, 'lease', { field: q.pos, price })) {
            pay(G, p, price); G.leases[q.pos] = { o: p, left: RULES.pachtRunden, open: 0 };
            await emit(io, { t: 'lease', p, field: q.pos, price });
          }
        } else if (L.o !== p) {
          const canOpen = L.open !== G.round;
          const ch = canOpen ? await decide(G, io, L.o, 'guest', { guest: p, field: q.pos, miete: RULES.miete[f.s - 1] }) : 'miete';
          if (ch === 'buehne') {
            L.open = G.round; note(G, p, L.o, 1);
            const o = G.players[L.o];
            if (o.amp > 0) { o.amp--; await emit(io, { t: 'open', o: L.o, guest: p, field: q.pos, amp: true }); }
            else { await emit(io, { t: 'open', o: L.o, guest: p, field: q.pos }); await addPts(G, io, L.o, 1, 'buehne'); }
          } else {
            const x = pay(G, p, RULES.miete[f.s - 1]); G.players[L.o].pl += x; note(G, p, L.o, -1);
            await emit(io, { t: 'rent', o: L.o, guest: p, field: q.pos, n: x });
          }
        }
        break;
      }
      case 'S': case 'U': return drawCard(G, io, p, f.t);
      case 'steuer': { const x = pay(G, p, RULES.gage); await emit(io, { t: 'tax', p, n: x }); break; }
      case 'werkstatt': T.werkstatt = true; break;
      case 'projekt': T.rabatt = RULES.projektFeldRabatt; break;
      case 'goauto': await toAutopilot(G, io, p); break;
    }
    return null;
  }

  function rollDice(G) {
    if (G.dice === '2w6') return [1 + rint(G, 6), 1 + rint(G, 6)];
    return [1 + rint(G, 4), 1 + rint(G, 8)];
  }

  // Was der Mensch gerade tun darf
  function actionOptions(G, p, T) {
    const q = G.players[p], o = [];
    if (!T.built) for (const id of G.open) {
      const pr = PROJECTS[id];
      if (pr.size === 'mega') { const need = RULES.mega.cost - megaPaid(G, id); if (q.pl >= 5) o.push({ a: 'mega', id, need, paid: megaPaid(G, id) }); }
      else { const cost = RULES[pr.size].cost - T.rabatt; o.push({ a: 'project', id, cost, ok: q.pl >= cost }); }
    }
    if (!T.concert) o.push({ a: 'concert', cost: RULES.konzert.cost, ok: q.pl >= RULES.konzert.cost });
    if (T.werkstatt && !T.brick) o.push({ a: 'brick', cost: RULES.werkstattBaustein, ok: q.pl >= RULES.werkstattBaustein });
    return o;
  }

  async function doAction(G, io, p, T, act) {
    const q = G.players[p];
    if (act.a === 'project' && !T.built) {
      const pr = PROJECTS[act.id], cost = RULES[pr.size].cost - T.rabatt;
      if (pr.size === 'mega' || q.pl < cost || !G.open.includes(act.id)) return;
      pay(G, p, cost); T.built = true; T.rabatt = 0;
      await finishProject(G, io, p, act.id, { [p]: cost }, { [p]: RULES[pr.size].pts });
    } else if (act.a === 'mega' && !T.built) {
      if (!G.open.includes(act.id)) return;
      const need = RULES.mega.cost - megaPaid(G, act.id);
      const amt = Math.min(need, q.pl, Math.max(0, act.amt | 0));
      if (amt <= 0) return;
      pay(G, p, amt); T.built = true;
      const m = (G.mega[act.id] = G.mega[act.id] || {}); m[p] = (m[p] || 0) + amt;
      Object.keys(m).forEach(k => { if (+k !== p) { note(G, +k, p, 1); note(G, p, +k, 1); } });
      await emit(io, { t: 'megapay', p, id: act.id, n: amt, paid: megaPaid(G, act.id) });
      if (megaPaid(G, act.id) >= RULES.mega.cost) {
        // Punkte nach Anteil (größter Rest)
        const tot = RULES.mega.cost, P13 = RULES.mega.pts, ks = Object.keys(m);
        const raw = ks.map(k => m[k] / tot * P13), fl = raw.map(Math.floor);
        let rest = P13 - fl.reduce((a, b) => a + b, 0);
        ks.map((k, i) => [raw[i] - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { fl[i]++; rest--; } });
        const pm = {}; ks.forEach((k, i) => pm[k] = fl[i]);
        await finishProject(G, io, p, act.id, Object.assign({}, m), pm);
      }
    } else if (act.a === 'concert' && !T.concert && q.pl >= RULES.konzert.cost) {
      pay(G, p, RULES.konzert.cost); T.concert = true;
      await emit(io, { t: 'concert', p });
      await addPts(G, io, p, RULES.konzert.pts, 'konzert');
      await placeBrick(G, io, p, 'konzert');
    } else if (act.a === 'brick' && T.werkstatt && !T.brick && q.pl >= RULES.werkstattBaustein) {
      pay(G, p, RULES.werkstattBaustein); T.brick = true;
      await emit(io, { t: 'workshop', p });
      await placeBrick(G, io, p, 'werkstatt');
    }
  }

  async function playTurn(G, io) {
    const p = G.turn, q = G.players[p];
    const T = { built: false, concert: false, brick: false, werkstatt: false, rabatt: 0 };
    await emit(io, { t: 'turn', p });
    let skip = false;
    if (q.auto) {
      q.auto = false;
      const ch = q.pl >= RULES.gage ? await decide(G, io, p, 'autopilot', {}) : 'skip';
      if (ch === 'pay') { pay(G, p, RULES.gage); await emit(io, { t: 'pay', p, n: RULES.gage, why: 'Autopilot aus' }); }
      else { skip = true; await emit(io, { t: 'skip', p }); }
    }
    if (!skip) {
      let again = 0;
      do {
        if (q.human) await io.ask(p, 'roll', { again: again > 0 });
        const [a, b] = rollDice(G);
        await emit(io, { t: 'roll', p, a, b });
        if (a === b) await lordSteal(G, io, 'pasch');
        await moveBy(G, io, p, a + b);
        const r = await resolveField(G, io, p, T);
        again = r === 'again' && again < 3 && !q.auto ? again + 1 : 0;
        if (again) await emit(io, { t: 'again', p });
      } while (again);
      // Aktionen
      if (!q.auto) for (let guard = 0; guard < 8; guard++) {
        let act;
        if (q.human) { const opts = actionOptions(G, p, T); act = await io.ask(p, 'action', { opts, T }); }
        else act = npcAction(G, p, T);
        if (!act || act.a === 'end') break;
        await doAction(G, io, p, T, act);
      }
    }
    G.turnsPlayed++;
    G.turn = (G.turn + 1) % G.players.length;
    if (G.turn === 0) {
      if (G.stage >= G.goal) G.over = 'buehne';
      else if (G.round >= G.maxRounds) G.over = 'turm';
      else { G.ending = false; G.round++; }
    }
    await emit(io, { t: 'endturn', p });
  }

  function ranking(G) {
    return G.players.map((q, i) => ({ i, name: q.name, score: score(q), pts: q.pts, amp: q.amp, bricks: q.bricks, pl: q.pl }))
      .sort((a, b) => b.score - a.score || b.bricks - a.bricks);
  }

  async function run(G, io) { while (!G.over) await playTurn(G, io); return ranking(G); }

  const api = { RULES, FIELDS, PROJECTS, NPCS, AUTOPILOT, newGame, playTurn, run, ranking, score, megaPaid, actionOptions, dividend };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Popely = api;
})(typeof self !== 'undefined' ? self : this);
