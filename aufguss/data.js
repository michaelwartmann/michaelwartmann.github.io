// Aufguss Studio – data: options per phase, scents, styles, rules and the grammar. Techniques live in techniques.js.
(function (root) {
  "use strict";

  const TECHNIQUES = root.AUFGUSS_TECHNIQUES || []; // see techniques.js

  // ---------- The grammar: phases of an Aufguss ----------
  // Each phase has options ("how"); the composer picks defaults from style and level.
  const OPTIONS = {
    opening: [
      { id: "none", en: "Straight in", de: "Direkt los" },
      { id: "incense", en: "Incense / smoke (Räucherwerk)", de: "Räucherwerk" },
      { id: "hydrolate", en: "Hydrolate spray", de: "Hydrolat-Spray" },
      { id: "bowl", en: "Singing bowl", de: "Klangschale" },
      { id: "story", en: "Story opening (show)", de: "Geschichte beginnt (Show)" },
    ],
    pour: [
      { id: "ice", en: "Ice ball with oil + pure water", de: "Eiskugel mit Öl + reines Wasser" },
      { id: "water", en: "Scent in the water", de: "Duft im Wasser" },
      { id: "iceonly", en: "Ice only (slow, gentle)", de: "Nur Eis (langsam, sanft)" },
    ],
    between: [
      { id: "none", en: "No airing", de: "Kein Lüften" },
      { id: "door", en: "Short airing: door open", de: "Kurz lüften: Tür auf" },
      { id: "draft", en: "Full airing: draft, start over", de: "Ganz lüften: Durchzug, neu beginnen" },
    ],
    closing: [
      { id: "thanks", en: "Thanks + cool-down tips", de: "Dank + Tipps zum Abkühlen" },
      { id: "applause", en: "Show bow + music outro", de: "Verbeugung + Musik-Outro" },
      { id: "silence", en: "A moment of silence", de: "Ein Moment Stille" },
    ],
  };

  const SCENTS = [
    { id: "eucalyptus", en: "Eucalyptus", de: "Eukalyptus" }, { id: "pine", en: "Pine", de: "Kiefer" },
    { id: "fir", en: "Fir", de: "Edeltanne" }, { id: "mint", en: "Mint", de: "Minze" },
    { id: "lemon", en: "Lemon", de: "Zitrone" }, { id: "orange", en: "Orange", de: "Orange" },
    { id: "lime", en: "Lime", de: "Limette" }, { id: "grapefruit", en: "Grapefruit", de: "Grapefruit" },
    { id: "lavender", en: "Lavender", de: "Lavendel" }, { id: "rosemary", en: "Rosemary", de: "Rosmarin" },
    { id: "birch", en: "Birch", de: "Birke" }, { id: "cedar", en: "Cedar", de: "Zeder" },
    { id: "ginger", en: "Ginger", de: "Ingwer" }, { id: "honey", en: "Honey", de: "Honig" },
    { id: "rose", en: "Rose", de: "Rose" }, { id: "vanilla", en: "Vanilla", de: "Vanille" },
  ];

  const STYLES = [
    { id: "classic", en: "Classic", de: "Klassisch", music: false, show: 1, maxLevel: 1 },
    { id: "standard", en: "Standard (with music)", de: "Standard (mit Musik)", music: true, show: 1, maxLevel: 2 },
    { id: "ice", en: "Ice ball infusion", de: "Eiskugel-Aufguss", music: true, show: 1, maxLevel: 2 },
    { id: "meditative", en: "Meditative", de: "Meditativ", music: true, show: 1, maxLevel: 1 },
    { id: "show", en: "Show / story", de: "Show / Geschichte", music: true, show: 3, maxLevel: 3 },
  ];

  // Rules with sources, shown in the app as "why".
  const RULES = {
    waterPerM3: 30, // ml per m³ room volume per Aufguss (DGUV / Sauna-Bund guideline); 30–60 g/m³ cited by some
    introMax: 90,   // seconds, Aufguss WM Modern Classic Cup
    maxMinutes(temp) { // guideline: 6–10 min, at most 12, at 90 °C or more; championships 12–15
      if (temp >= 95) return 10;
      if (temp >= 90) return 12;
      return 15;
    },
  };


  // The grammar of an Aufguss, numbered for review (G1 …).
  const GRAMMAR = [
    { no: "G1", en: "Before: air the cabin, prepare ice balls (one per round, a few drops of essential oil each), pure water in the bucket, towel, music.",
      de: "Vorher: Kabine lüften, Eiskugeln vorbereiten (eine pro Runde, je ein paar Tropfen ätherisches Öl), reines Wasser im Kübel, Tuch, Musik." },
    { no: "G2", en: "Welcome (max. 90 s): theme, scents, rules, allergies. Anyone may leave at any time; new guests sit lower.",
      de: "Begrüßung (max. 90 s): Thema, Düfte, Regeln, Allergien. Jeder darf jederzeit gehen; Neue sitzen unten." },
    { no: "G3", en: "Opening ritual (optional): incense (Räucherwerk), hydrolate, singing bowl, or the first scene of a story.",
      de: "Eröffnungsritual (optional): Räucherwerk, Hydrolat, Klangschale oder die erste Szene einer Geschichte." },
    { no: "G4", en: "2–4 rounds. Each round: pour (ice ball + pure water) → spread from the ceiling (Propeller) → distribute → short Abschlagen so everyone gets the scent.",
      de: "2–4 Runden. Jede Runde: aufgießen (Eiskugel + reines Wasser) → von der Decke verteilen (Propeller) → verteilen → kurzes Abschlagen, damit jeder den Duft bekommt." },
    { no: "G5", en: "Heat builds round by round. Complicated and show techniques come early, while it is not so hot yet. The last round is classic and strong.",
      de: "Die Hitze steigt von Runde zu Runde. Komplizierte und Show-Techniken kommen früh, solange es noch nicht so heiß ist. Die letzte Runde ist klassisch und kräftig." },
    { no: "G6", en: "Optional airing between rounds, if the sauna allows: door open, or a full draft that lets the heat out and starts the build again.",
      de: "Optional lüften zwischen den Runden, wenn die Sauna es erlaubt: Tür auf, oder ganz durchlüften, die Hitze raus und neu aufbauen." },
    { no: "G7", en: "Final: the real Abschlagen for every guest, when it is hottest.",
      de: "Finale: das richtige Abschlagen für jeden Gast, wenn es am heißesten ist." },
    { no: "G8", en: "Closing: thanks, door open, cool-down tips (fresh air, cold shower, rest, drink).",
      de: "Abschluss: Dank, Tür auf, Tipps zum Abkühlen (frische Luft, kalt duschen, ruhen, trinken)." },
    { no: "G9", en: "Water: about 30 ml per m³ of room per infusion (guideline), more in later rounds.",
      de: "Wasser: etwa 30 ml pro m³ Raum pro Aufguss (Richtwert), in späteren Runden mehr." },
    { no: "G10", en: "Length depends on temperature: guideline 6–10 min, at most 12, at 90 °C or more; championships 12–15 min. Below 90 °C up to 15 min (our assumption, to verify).",
      de: "Die Dauer hängt von der Temperatur ab: Richtwert 6–10 Min., höchstens 12, bei 90 °C und mehr; bei Meisterschaften 12–15 Min. Unter 90 °C bis 15 Min. (unsere Annahme, noch prüfen)." },
    { no: "G11", en: "Scent in the ice ball, pure water for pouring. Scent in the water is less elegant: every round smells the same.",
      de: "Duft in die Eiskugel, reines Wasser zum Aufgießen. Duft im Wasser ist weniger elegant: Jede Runde riecht gleich." },
  ];

  root.AUFGUSS_DATA = { TECHNIQUES, OPTIONS, SCENTS, STYLES, RULES, GRAMMAR };
})(typeof window !== "undefined" ? window : globalThis);
