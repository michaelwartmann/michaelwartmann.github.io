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

  // Extras handed to guests or used for a special moment (from real Aufguss plans); mostly for special/show infusions.
  const EXTRAS = [
    { id: "none", en: "No extras", de: "Keine Extras" },
    { id: "ice-breathe", en: "Ice to hold under the nose", de: "Eis zum Atmen vor die Nase" },
    { id: "frozen-fruit", en: "Frozen fruit", de: "Gefrorene Früchte" },
    { id: "ice-lolly", en: "Ice lollies", de: "Wassereis" },
    { id: "honey", en: "Honey for the skin", de: "Honig für die Haut" },
    { id: "salt", en: "Salt peeling", de: "Salzpeeling" },
    { id: "coffee", en: "Coffee peeling", de: "Kaffeepeeling" },
    { id: "cream", en: "Body cream", de: "Körpercreme" },
    { id: "ginger", en: "Ginger shot", de: "Ingwer-Shot" },
    { id: "fire-ice", en: "Ice ball with a flame (show; check house rules)", de: "Eiskugel mit Flamme (Show; Hausregeln prüfen)" },
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
    waterPerM3: 30, // max. g water per m³ room per Aufguss (DGfdB R 26.30.04 / DGUV); some say 20–30
    volumeFromSeats(seats) { return Math.round(4 + 1.5 * seats); }, // rough estimate: small home cabin ≈ 2 m³ per seat, big public saunas less
    clearanceFactor: { tight: 0.8, normal: 1, roomy: 1 }, // heads close to the ceiling sit in the hottest layer
    reachFactor: { near: 0.85, mid: 1, far: 1.25 },        // far guests: steam needs longer, distribute longer
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
    { no: "G9", en: "Water and room. Guideline: at most 30 g water per m³ of room per infusion (DGfdB / DGUV), more in later rounds. Nobody can see m³, so the app asks what you can see: how many guests fit, how close the heads on the top bench are to the ceiling, and how far the farthest guest is from the oven. 1 litre of water makes about 1.7 m³ of steam: it rises above the oven like a mushroom, spreads under the ceiling, then sinks onto the benches. A good sauna master sees where it is and when it arrives.",
      de: "Wasser und Raum. Richtwert: höchstens 30 g Wasser pro m³ Raum pro Aufguss (DGfdB / DGUV), in späteren Runden mehr. Kubikmeter sieht niemand, also fragt die App, was man sieht: wie viele Gäste Platz haben, wie nah die Köpfe auf der oberen Bank an der Decke sind und wie weit der fernste Gast vom Ofen sitzt. 1 Liter Wasser ergibt etwa 1,7 m³ Dampf: Er steigt über dem Ofen wie ein Pilz auf, breitet sich unter der Decke aus und sinkt dann auf die Bänke. Ein guter Aufgussmeister sieht, wo er ist und wann er ankommt." },
    { no: "G10", en: "Stamina (circulation): the body can only lose heat by sweating, so heat builds up over the whole infusion. Heart rate rises by about 40 beats per minute in 10 minutes, and humidity adds to it on top of temperature. That's why length depends on temperature: guideline 6–10 min, at most 12, at 90 °C or more; championships 12–15 min. Below 90 °C up to 15 min (our assumption, to verify).",
      de: "Ausdauer (Kreislauf): Der Körper kann Wärme nur durch Schwitzen loswerden, also staut sich die Hitze über den ganzen Aufguss. Der Puls steigt in 10 Minuten um etwa 40 Schläge pro Minute, und die Luftfeuchte kommt zur Temperatur noch dazu. Darum hängt die Dauer von der Temperatur ab: Richtwert 6–10 Min., höchstens 12, bei 90 °C und mehr; bei Meisterschaften 12–15 Min. Unter 90 °C bis 15 Min. (unsere Annahme, noch prüfen)." },
    { no: "G11", en: "Scent in the ice ball, pure water for pouring. Scent in the water is less elegant: every round smells the same. For special show infusions you can get fancy, e.g. an ice ball with a core you can light (check house rules and safety).",
      de: "Duft in die Eiskugel, reines Wasser zum Aufgießen. Duft im Wasser ist weniger elegant: Jede Runde riecht gleich. Für besondere Show-Aufgüsse geht es verspielter, z. B. eine Eiskugel mit einem Kern, den man anzünden kann (Hausregeln und Sicherheit prüfen)." },
    { no: "G12", en: "Peak heat (skin): a different limit from stamina. Steam condenses on the skin and burns; skin temperature already sits near the heat-pain threshold. Guests who aren't used to it hit their limit first. Watch the top bench: first people bend forward, then they leave. Bending forward means ease off.",
      de: "Spitzenhitze (Haut): eine andere Grenze als die Ausdauer. Dampf kondensiert auf der Haut und brennt; die Hauttemperatur liegt ohnehin nahe der Hitze-Schmerzschwelle. Ungeübte Gäste erreichen ihre Grenze zuerst. Die obere Bank beobachten: Erst beugen sich die Leute nach vorn, dann gehen sie. Nach vorn beugen heißt: zurücknehmen." },
    { no: "G13", en: "Magic moments (special and show infusions only): extras for guests such as ice to breathe through, frozen fruit, ice lollies, honey, salt or coffee peeling, a ginger shot; lighting, smoke and props. Small surprises, placed where the story needs them, often in the airing break.",
      de: "Magische Momente (nur für besondere und Show-Aufgüsse): Extras für Gäste wie Eis zum Atmen, gefrorene Früchte, Wassereis, Honig, Salz- oder Kaffeepeeling, ein Ingwer-Shot; Licht, Rauch und Requisiten. Kleine Überraschungen, dort platziert, wo die Geschichte sie braucht, oft in der Lüftungspause." },
  ];

  root.AUFGUSS_DATA = { TECHNIQUES, OPTIONS, SCENTS, STYLES, RULES, GRAMMAR, EXTRAS };
})(typeof window !== "undefined" ? window : globalThis);
