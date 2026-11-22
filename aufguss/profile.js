// Aufguss profile: who is waving, without accounts. Same idea as Mat Cat Yoga.
// A person carries a code like "fiery young bear" / "feuriger junger Bär":
//   animal = their nature, read from power and rhythm (and scent knowledge): strong → bear, rhythmic → cat, both → tiger, …
//   age    = level (skill): baby → young → grown → wise → ancient
//   heat   = how much heat they carry themselves: mild → warm → fiery
// What matters for a good infusion, in this order: safety (heat, circulation), air (power and stamina),
// shape (rhythm and coordination), and the experience (scents, story, reading the guests).
(function (root) {
  // fam = technique families the composer favours; grow = what this nature works on next.
  const NATURES = [
    { id: "power", en: "Strong, less rhythm", de: "Stark, weniger Rhythmus",
      text: "You move a lot of air and last long. Classic, powerful techniques suit you: Propeller, Flag, Lumberjack, a big towel and a strong Abschlagen. You grow with figure eights and timing to the music.",
      textDe: "Du bewegst viel Luft und hältst lange durch. Dir liegen klassische, kräftige Techniken: Propeller, Fahne, Holzfäller, ein großes Tuch und ein kräftiges Abschlagen. Wachsen kannst du mit Achten und dem Timing zur Musik.",
      animals: [["bear", "Bear", "Bär", "m"], ["bison", "Bison", "Bison", "m"], ["gorilla", "Gorilla", "Gorilla", "m"]],
      fam: ["whip", "rotation", "sweep"], towel: "big" },
    { id: "rhythm", en: "Rhythmic, less strong", de: "Rhythmisch, weniger kräftig",
      text: "Shapes and timing come easily; long rounds tire your arms. Flowing techniques suit you: eights, waves, snakes and twirls with a light towel. You grow with stamina: short, strong rounds.",
      textDe: "Formen und Timing fallen dir leicht; lange Runden machen die Arme müde. Dir liegen fließende Techniken: Achten, Wellen, Schlangen und Twirls mit einem leichten Tuch. Wachsen kannst du mit Ausdauer: kurze, kräftige Runden.",
      animals: [["cat", "Cat", "Katze", "f"], ["seal", "Seal", "Robbe", "f"], ["octopus", "Octopus", "Krake", "m"]],
      fam: ["eight", "wave", "flatspin"], towel: "light" },
    { id: "show", en: "Strong and rhythmic", de: "Stark und rhythmisch",
      text: "You bring both. Show suits you: two towels, throws, pizza spins and combinations, early in the infusion. Keep the last round classic and strong.",
      textDe: "Du bringst beides mit. Dir liegt die Show: zwei Tücher, Würfe, Pizza-Drehungen und Kombinationen, früh im Aufguss. Die letzte Runde bleibt klassisch und kräftig.",
      animals: [["tiger", "Tiger", "Tiger", "m"], ["panther", "Panther", "Panther", "m"], ["dolphin", "Dolphin", "Delfin", "m"]],
      fam: ["throw", "flatspin", "eight"], towel: "two" },
    { id: "host", en: "The calm host", de: "Ruhige Gastgeberin, ruhiger Gastgeber",
      text: "You know scents and you watch your guests. A calm, precise infusion suits you: clean distribution, a story, blends that change from round to round. You grow with one or two techniques that carry more air.",
      textDe: "Du kennst Düfte und achtest auf deine Gäste. Dir liegt ein ruhiger, genauer Aufguss: saubere Verteilung, eine Geschichte, Mischungen, die sich von Runde zu Runde ändern. Wachsen kannst du mit ein, zwei Techniken, die mehr Luft bewegen.",
      animals: [["heron", "Heron", "Reiher", "m"], ["crane", "Crane", "Kranich", "m"], ["flamingo", "Flamingo", "Flamingo", "m"]],
      fam: ["sweep", "rotation", "wave"], towel: "normal" },
    { id: "allround", en: "All-rounder", de: "Allrounder",
      text: "Nothing stands out, nothing holds you back. Your infusions bring variety: a bit of everything.",
      textDe: "Nichts sticht heraus, nichts hält dich zurück. Deine Aufgüsse bringen Abwechslung: von allem etwas.",
      animals: [["fox", "Fox", "Fuchs", "m"], ["wolf", "Wolf", "Wolf", "m"], ["otter", "Otter", "Otter", "m"]],
      fam: [], towel: "normal" },
    { id: "gentle", en: "Gentle start", de: "Sanfter Start",
      text: "Power, rhythm and heat are all still growing. Start with Propeller, Flag and Abschlagen, short infusions, and add one technique at a time.",
      textDe: "Kraft, Rhythmus und Hitze wachsen alle noch. Fang mit Propeller, Fahne und Abschlagen an, kurzen Aufgüssen, und nimm eine Technik nach der anderen dazu.",
      animals: [["panda", "Panda", "Panda", "m"], ["koala", "Koala", "Koala", "m"], ["turtle", "Turtle", "Schildkröte", "f"]],
      fam: ["rotation", "sweep"], towel: "normal" },
  ];
  const NATURE = Object.fromEntries(NATURES.map((n) => [n.id, n]));
  const ANIMALS = NATURES.flatMap((n) => n.animals.map(([id, en, de, g]) => ({ id, en, de, g, nature: n.id })));
  const ANIMAL = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

  const AGES = [
    { n: 1, en: "baby", de: "Baby", stem: null, tech: 1 },
    { n: 2, en: "young", de: "jung", stem: "jung", tech: 1 },
    { n: 3, en: "grown", de: "erwachsen", stem: "erwachsen", tech: 2 },
    { n: 4, en: "wise", de: "weise", stem: "weis", tech: 3 },
    { n: 5, en: "ancient", de: "uralt", stem: "uralt", tech: 3 },
  ];
  // Heat = what the person can carry: suggested length and how hot the peak may get.
  const HEATS = [
    { n: 1, en: "mild", de: "mild", stem: "mild", minutes: 8, text: "Short infusions (about 8 min), a gentle peak. Stand lower when you wave, breathe through the nose.", textDe: "Kurze Aufgüsse (etwa 8 Min.), ein sanfter Höhepunkt. Beim Wedeln tiefer stehen, durch die Nase atmen." },
    { n: 2, en: "warm", de: "warm", stem: "warm", minutes: 10, text: "Standard infusions (about 10 min).", textDe: "Normale Aufgüsse (etwa 10 Min.)." },
    { n: 3, en: "fiery", de: "feurig", stem: "feurig", minutes: 12, text: "Long infusions are possible (12 min and more at lower temperatures). Your guests are the limit, not you.", textDe: "Lange Aufgüsse sind möglich (12 Min. und mehr bei niedrigerer Temperatur). Die Grenze sind deine Gäste, nicht du." },
  ];

  // ---------- the questionnaire ----------
  // Single choice: answer index. Multi: list of ids. All text EN/DE.
  const QUESTIONS = [
    { id: "exp", en: "How do you know infusions?", de: "Wie kennst du Aufgüsse?", opts: [
      ["Hardly: a few times as a guest", "Kaum: ein paarmal als Gast"], ["Regular guest", "Regelmäßig als Gast"],
      ["I've waved for friends", "Ich habe schon für Freunde gewedelt"], ["I do infusions at a sauna", "Ich mache Aufgüsse in einer Sauna"],
      ["I train others or compete", "Ich bilde aus oder mache Wettbewerbe"]] },
    { id: "heat", en: "On the top bench at about 90 °C: how long are you comfortable?", de: "Oben auf der Bank bei etwa 90 °C: wie lange fühlst du dich wohl?", opts: [
      ["Under 5 minutes", "Unter 5 Minuten"], ["5–8 minutes", "5–8 Minuten"], ["8–12 minutes", "8–12 Minuten"], ["Longer, and I like the peak", "Länger, und ich mag den Höhepunkt"]] },
    { id: "power", en: "Small test: a full 1-litre bottle in each hand, arms straight out to the sides. How long?", de: "Kleiner Test: eine volle 1-Liter-Flasche in jeder Hand, Arme gestreckt zur Seite. Wie lange?", opts: [
      ["Under 30 seconds", "Unter 30 Sekunden"], ["30–60 seconds", "30–60 Sekunden"], ["1–2 minutes", "1–2 Minuten"], ["Over 2 minutes", "Über 2 Minuten"]] },
    { id: "rhythm", en: "Small test: draw a circle in the air with one hand and a figure eight with the other, at the same time.", de: "Kleiner Test: Mit einer Hand einen Kreis in die Luft malen und mit der anderen eine Acht, gleichzeitig.", opts: [
      ["Not yet", "Noch nicht"], ["Slowly", "Langsam"], ["Yes", "Ja"], ["Yes, and I can switch hands on the beat", "Ja, und ich kann im Takt die Hände wechseln"]] },
    { id: "moves", multi: true, en: "What else do you do? (any)", de: "Was machst du sonst? (beliebig viele)", opts: [
      ["dance", "Dance", "Tanz"], ["martial", "Martial arts, staff, nunchaku", "Kampfkunst, Stab, Nunchaku"], ["racket", "Tennis or other racket sports", "Tennis oder andere Schlägersportarten"],
      ["juggle", "Juggling, flag, poi, color guard", "Jonglieren, Fahne, Poi, Color Guard"], ["music", "Music, drumming", "Musik, Trommeln"],
      ["gym", "Gymnastics, rhythmic gymnastics", "Turnen, Rhythmische Sportgymnastik"], ["strength", "Strength training, climbing", "Krafttraining, Klettern"],
      ["endurance", "Swimming, rowing, running", "Schwimmen, Rudern, Laufen"], ["yoga", "Yoga, tai chi, qigong", "Yoga, Tai-Chi, Qigong"], ["stage", "Theatre, storytelling", "Theater, Geschichten erzählen"]] },
    { id: "scent", en: "Essential oils and scents:", de: "Ätherische Öle und Düfte:", opts: [
      ["I hardly know them", "Kenne ich kaum"], ["I have favourites", "Ich habe Lieblingsdüfte"], ["I blend my own", "Ich mische selbst"],
      ["I know doses, skin safety and allergies", "Ich kenne Dosierung, Hautverträglichkeit und Allergien"]] },
    { id: "care", multi: true, optional: true, en: "Anything to take care of? (optional, stays on your phone)", de: "Worauf achten? (optional, bleibt auf deinem Handy)", opts: [
      ["shoulder", "Shoulders", "Schultern"], ["wrist", "Wrists", "Handgelenke"], ["dizzy", "Low blood pressure, dizzy in the heat", "Niedriger Blutdruck, Schwindel in der Hitze"],
      ["heart", "Heart or circulation", "Herz oder Kreislauf"], ["pregnant", "Pregnant", "Schwanger"]] },
  ];

  const CARE_TXT = {
    shoulder: ["Fewer overhead rotations; flags and sweeps at chest height; short rounds.", "Weniger Rotationen über Kopf; Fahne und Schwünge auf Brusthöhe; kurze Runden."],
    wrist: ["Avoid finger twirls and pizza spins; hold the towel with the whole hand.", "Fingertwirls und Pizza meiden; das Tuch mit der ganzen Hand halten."],
    dizzy: ["Wave from the lower bench level, no deep bends at the peak, sit down after the Abschlagen.", "Von der unteren Bankhöhe aus wedeln, keine tiefen Beugen am Höhepunkt, nach dem Abschlagen hinsetzen."],
    heart: ["Talk to your doctor before you wave hot infusions. Keep them mild and short.", "Sprich mit deiner Ärztin oder deinem Arzt, bevor du heiße Aufgüsse wedelst. Halte sie mild und kurz."],
    pregnant: ["Ask your midwife or doctor first; waving in the heat is hard work.", "Frag zuerst deine Hebamme oder Ärztin; Wedeln in der Hitze ist harte Arbeit."],
  };
  const SCENT_TXT = [
    ["Start with single oils on the ice ball: eucalyptus, lemon, mint. 2–3 drops are enough.", "Fang mit einzelnen Ölen auf der Eiskugel an: Eukalyptus, Zitrone, Minze. 2–3 Tropfen reichen."],
    ["Build a scent story: fresh → warm → deep, one oil per round.", "Bau eine Duftgeschichte: frisch → warm → tief, ein Öl pro Runde."],
    ["Blends per round work for you; keep one round simple so the guests notice the change.", "Mischungen pro Runde passen zu dir; halte eine Runde schlicht, damit die Gäste den Wechsel merken."],
    ["You can guide others: doses, allergies, which oils never go on the stones undiluted.", "Du kannst andere anleiten: Dosierung, Allergien, welche Öle nie pur auf die Steine kommen."],
  ];

  // ---------- assessment ----------
  function assess(a) {
    const mv = new Set(a.moves || []);
    const P = (a.power ?? 1) / 3 + (mv.has("strength") ? 0.15 : 0) + (mv.has("endurance") ? 0.15 : 0) + (mv.has("martial") ? 0.05 : 0);
    const R = (a.rhythm ?? 1) / 3 + (mv.has("dance") ? 0.2 : 0) + (mv.has("juggle") ? 0.25 : 0) + (mv.has("martial") ? 0.15 : 0) + (mv.has("music") ? 0.1 : 0)
      + (mv.has("gym") ? 0.15 : 0) + (mv.has("racket") ? 0.1 : 0);
    const K = (a.scent ?? 0) / 3 + (mv.has("stage") ? 0.15 : 0) + (mv.has("yoga") ? 0.05 : 0) + ((a.exp ?? 0) >= 3 ? 0.15 : 0);
    const fit = {
      gentle: (1 - P) + (1 - R) - 1.0,
      power: P - R - 0.2 - (R >= 0.67 ? 0.4 : 0),
      rhythm: R - P - 0.2 - (P >= 0.67 ? 0.4 : 0),
      show: Math.min(P, R) - 0.55,
      host: K - Math.max(P, R) + 0.05,
      allround: 0.3 - Math.abs(P - R) * 0.5,
    };
    const natures = Object.entries(fit).sort((x, y) => y[1] - x[1]).map(([id]) => id);

    let lv = [1, 1.6, 2.4, 3.6, 4.6][a.exp ?? 0];
    lv += [-0.4, 0, 0.3, 0.5][a.rhythm ?? 1] + [-0.3, 0, 0.2, 0.3][a.power ?? 1];
    if (mv.has("juggle") || mv.has("martial") || mv.has("dance")) lv += 0.3;
    if ((a.exp ?? 0) <= 1) lv = Math.min(lv, 2.4); // never waved for others: start at most "young"
    const level = Math.max(1, Math.min(5, Math.round(lv)));

    let h = [1, 1.6, 2.4, 3][a.heat ?? 1];
    const care = a.care || [];
    if (care.includes("heart") || care.includes("pregnant") || care.includes("dizzy")) h = Math.min(h, 1);
    const heat = Math.max(1, Math.min(3, Math.round(h)));
    return { natures, level, heat, scent: a.scent ?? 0, care, scores: { P, R, K } };
  }

  // ---------- code words ----------
  const DE_END = { m: "er", f: "e", n: "es" };
  function code(st, lang) {
    const a = ANIMAL[st.animal], age = AGES[(st.level || 1) - 1], h = HEATS[(st.heat || 2) - 1];
    if (!a) return "";
    if (lang === "de") {
      const hh = h.stem + DE_END[a.g];
      return age.n === 1 ? `${hh} Baby-${a.de}` : `${hh} ${age.stem + DE_END[a.g]} ${a.de}`;
    }
    return `${h.en} ${age.en} ${a.en.toLowerCase()}`;
  }

  // What the profile changes in the composer.
  function options(st) {
    const a = ANIMAL[st.animal] || ANIMAL.fox, nat = NATURE[a.nature], age = AGES[(st.level || 1) - 1], h = HEATS[(st.heat || 2) - 1];
    const care = st.care || [];
    return {
      level: age.tech, minutes: h.minutes, fam: nat.fam, towel: nat.towel,
      avoid: (care.includes("wrist") ? ["P"] : []).concat(care.includes("shoulder") ? ["R·2T", "X1·2T"] : []),
      mildPeak: h.n === 1,
      style: nat.id === "show" && age.tech >= 2 ? "show" : nat.id === "host" ? "classic" : null,
    };
  }

  // Feedback after an infusion: technique too easy/hard → level; heat too much/fine → heat.
  function next(st, fb) {
    const out = Object.assign({}, st);
    if (fb.tech === "easy" && out.level < 5) out.level++;
    if (fb.tech === "hard" && out.level > 1) out.level--;
    if (fb.heat === "much" && out.heat > 1) out.heat--;
    if (fb.heat === "more" && out.heat < 3 && !(st.care || []).some((c) => ["heart", "pregnant", "dizzy"].includes(c))) out.heat++;
    return out;
  }

  root.AufgussProfile = { NATURES, NATURE, ANIMALS, ANIMAL, AGES, HEATS, QUESTIONS, CARE_TXT, SCENT_TXT, assess, code, options, next };
  if (typeof module !== "undefined") module.exports = root.AufgussProfile;
})(typeof window !== "undefined" ? window : globalThis);
