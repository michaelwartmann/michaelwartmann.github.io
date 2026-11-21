"use strict";
// Standby – content. Every section: title, one-line lead, parts with bullet lists (EN + DE), sources.
// Numbers carry their source in the "src" list. Checked: November 2026.
const CHECKED = "2026-11";

const SECTIONS = [
{
  id: "now", icon: "⏱",
  t: { en: "What now? Hour by hour", de: "Was jetzt? Stunde für Stunde" },
  lead: { en: "The power is out. Do these things in this order.", de: "Der Strom ist weg. Tu diese Dinge in dieser Reihenfolge." },
  parts: [
    { h: { en: "First hour", de: "Erste Stunde" }, li: {
      en: ["Check whether it's only your home: look at the fuse box and at the neighbours' windows.",
           "Switch off the stove, oven, iron and heaters, so nothing starts burning when power comes back. Leave one lamp switched on so you notice when it does.",
           "Get torches and the radio out. Tune in to your regional public radio station.",
           "Fill pots, bottles and the bathtub with water while it still flows.",
           "Keep the fridge and freezer closed.",
           "Put your phone into power-saving mode and airplane mode. Switch it on only at fixed times."],
      de: ["Prüfen, ob nur deine Wohnung betroffen ist: Sicherungskasten, Fenster der Nachbarn.",
           "Herd, Ofen, Bügeleisen und Heizgeräte ausschalten, damit nichts brennt, wenn der Strom wiederkommt. Eine Lampe eingeschaltet lassen, damit du es merkst.",
           "Taschenlampen und Radio herausholen. Den regionalen öffentlich-rechtlichen Sender einstellen.",
           "Töpfe, Flaschen und Badewanne mit Wasser füllen, solange es noch läuft.",
           "Kühlschrank und Gefriertruhe geschlossen lassen.",
           "Handy in den Energiesparmodus und Flugmodus. Nur zu festen Zeiten einschalten."] } },
    { h: { en: "Day 1", de: "Tag 1" }, li: {
      en: ["Set up one warm room for everyone (see Warmth).",
           "Eat what spoils first: fridge, then freezer, then the stock.",
           "Set up the emergency toilet before you need it.",
           "Knock on your neighbours' doors. Who is alone, old, ill, or has small children?",
           "Find out where your town's emergency point (Kat-Leuchtturm / Notfall-Treffpunkt) is.",
           "Agree on a meeting place and two fixed times a day, e.g. 10:00 and 18:00."],
      de: ["Einen warmen Raum für alle einrichten (siehe Wärme).",
           "Zuerst essen, was verdirbt: Kühlschrank, dann Gefriertruhe, dann Vorrat.",
           "Nottoilette aufbauen, bevor du sie brauchst.",
           "Bei den Nachbarn klingeln. Wer ist allein, alt, krank oder hat kleine Kinder?",
           "Herausfinden, wo der Notfall-Treffpunkt / Kat-Leuchtturm deiner Gemeinde ist.",
           "Treffpunkt und zwei feste Uhrzeiten am Tag vereinbaren, z. B. 10:00 und 18:00."] } },
    { h: { en: "Day 3", de: "Tag 3" }, li: {
      en: ["Count water and food. How many days are left at the current rate? Adjust now, not later.",
           "Keep a simple daily routine: getting up, meals, tasks, light-out time.",
           "Hold a short neighbourhood meeting: who has what (stove, tools, radio, first aid), who checks on whom.",
           "Take rubbish and toilet bags outside to a closed bin."],
      de: ["Wasser und Essen zählen. Wie viele Tage reicht es noch? Jetzt anpassen, nicht später.",
           "Einfachen Tagesablauf halten: Aufstehen, Mahlzeiten, Aufgaben, Licht aus.",
           "Kurzes Nachbarschaftstreffen: Wer hat was (Kocher, Werkzeug, Radio, Erste Hilfe), wer schaut nach wem.",
           "Müll und Toilettenbeutel nach draußen in eine geschlossene Tonne."] } },
    { h: { en: "Week 1", de: "Woche 1" }, li: {
      en: ["Share cooking and fuel with neighbours: one hot meal together saves fuel and lifts the mood.",
           "Check everyone daily for small wounds, diarrhoea, coughs, and signs of getting too cold.",
           "If it's freezing and the house gets cold: protect the water pipes (see Tech).",
           "Start treating water before the stored water runs out."],
      de: ["Kochen und Brennstoff mit Nachbarn teilen: eine warme Mahlzeit zusammen spart Brennstoff und hebt die Stimmung.",
           "Täglich alle anschauen: kleine Wunden, Durchfall, Husten, Anzeichen von Unterkühlung.",
           "Bei Frost und kalter Wohnung: Wasserleitungen schützen (siehe Technik).",
           "Wasser aufbereiten, bevor der Vorrat zu Ende ist."] } },
    { h: { en: "Week 2 and after", de: "Ab Woche 2" }, li: {
      en: ["Ration calmly: smaller portions are fine, too little water is not.",
           "Pool resources in the street: water treatment, cooking, child care, checks on older people.",
           "Watch the mood, including your own. Talk, move, keep to the routine.",
           "When the power comes back: switch devices on one by one. Let tap water run for a few minutes before drinking. Check frozen food: if it thawed, throw it out."],
      de: ["Ruhig einteilen: kleinere Portionen sind in Ordnung, zu wenig Wasser nicht.",
           "In der Straße zusammenlegen: Wasseraufbereitung, Kochen, Kinderbetreuung, Besuche bei Älteren.",
           "Auf die Stimmung achten, auch auf die eigene. Reden, bewegen, beim Ablauf bleiben.",
           "Wenn der Strom zurück ist: Geräte nacheinander einschalten. Leitungswasser vor dem Trinken ein paar Minuten laufen lassen. Tiefkühlware prüfen: aufgetaut heißt weg."] } }
  ],
  src: ["BBK: Ratgeber für Notfallvorsorge und richtiges Handeln in Notsituationen", "BBK: Stromausfall – Vorsorge und Selbsthilfe", "TAB (Bundestag) 2011: Was bei einem Blackout geschieht"]
},
{
  id: "water", icon: "💧",
  t: { en: "Water", de: "Wasser" },
  lead: { en: "More important than food. Without power, pumps can stop within hours.", de: "Wichtiger als Essen. Ohne Strom können die Pumpen nach Stunden stehen." },
  parts: [
    { h: { en: "How much", de: "Wie viel" }, li: {
      en: ["2 litres per person per day for drinking and cooking (BBK). That is 20 L per person for 10 days, 56 L for 4 weeks.",
           "Store at least 2 weeks. After that, you need a way to make water safe.",
           "Extra water for washing and the toilet: fill the bathtub and buckets at the start. That water is not for drinking.",
           "Upper floors lose water pressure first."],
      de: ["2 Liter pro Person und Tag zum Trinken und Kochen (BBK). Das sind 20 L pro Person für 10 Tage, 56 L für 4 Wochen.",
           "Mindestens 2 Wochen lagern. Danach brauchst du eine Möglichkeit, Wasser trinkbar zu machen.",
           "Zusätzliches Wasser zum Waschen und für die Toilette: am Anfang Badewanne und Eimer füllen. Dieses Wasser nicht trinken.",
           "Obere Stockwerke verlieren zuerst den Wasserdruck."] } },
    { h: { en: "Where to get more", de: "Woher mehr" }, li: {
      en: ["Many towns have emergency drinking-water wells (Trinkwassernotbrunnen) and water points. Ask your town now where yours is.",
           "Rainwater: collect it in clean containers, then treat it.",
           "Streams and ponds only as a last resort, always filtered and boiled."],
      de: ["Viele Gemeinden haben Trinkwassernotbrunnen und Wasserausgabestellen. Jetzt bei der Gemeinde fragen, wo deiner ist.",
           "Regenwasser in saubere Behälter sammeln, dann aufbereiten.",
           "Bäche und Teiche nur als letzter Ausweg, immer filtern und abkochen."] } },
    { h: { en: "Make it safe", de: "Trinkbar machen" }, li: {
      en: ["Cloudy water: let it settle, then pour it through a clean cloth first.",
           "Boil: bring to a rolling boil for at least 1 minute. This kills germs.",
           "Water filter (hollow fibre, about €25): removes bacteria and parasites. Most don't remove viruses or chemicals, so boil as well if you are unsure.",
           "Disinfection tablets (chlorine): follow the packet exactly, wait the stated time.",
           "Never drink water from heating systems, or water that smells of fuel or chemicals – boiling doesn't help there."],
      de: ["Trübes Wasser: absetzen lassen, dann durch ein sauberes Tuch gießen.",
           "Abkochen: mindestens 1 Minute sprudelnd kochen. Das tötet Keime.",
           "Wasserfilter (Hohlfaser, etwa 25 €): entfernt Bakterien und Parasiten. Die meisten keine Viren und keine Chemikalien – im Zweifel zusätzlich abkochen.",
           "Entkeimungstabletten (Chlor): genau nach Packung, Einwirkzeit abwarten.",
           "Niemals Wasser aus der Heizung trinken oder Wasser, das nach Treibstoff oder Chemie riecht – Abkochen hilft da nicht."] } }
  ],
  src: ["BBK: Ratgeber für Notfallvorsorge (2 L pro Person und Tag)", "TAB 2011: Wasserversorgung bei Stromausfall", "WHO: Boil water (technical brief)"]
},
{
  id: "warmth", icon: "🔥",
  t: { en: "Warmth", de: "Wärme" },
  lead: { en: "Almost all heating needs electricity. Plan to keep people warm, not the whole home.", de: "Fast jede Heizung braucht Strom. Plane, Menschen warm zu halten, nicht die ganze Wohnung." },
  parts: [
    { h: { en: "One warm room", de: "Ein warmer Raum" }, li: {
      en: ["Choose the smallest room with the fewest outside walls, ideally facing south.",
           "Close the other rooms. Hang blankets over windows and doors at night, open curtains in the sun.",
           "Everyone sleeps in this room. People warm a room too.",
           "Air it briefly (5 minutes, window wide open) two or three times a day, against damp and stale air."],
      de: ["Den kleinsten Raum mit den wenigsten Außenwänden wählen, am besten nach Süden.",
           "Andere Räume schließen. Nachts Decken vor Fenster und Türen hängen, bei Sonne Vorhänge auf.",
           "Alle schlafen in diesem Raum. Menschen wärmen einen Raum mit.",
           "Zwei- bis dreimal am Tag kurz stoßlüften (5 Minuten), gegen Feuchtigkeit und schlechte Luft."] } },
    { h: { en: "Keep the body warm", de: "Den Körper warm halten" }, li: {
      en: ["Layers: wool or fleece close to the skin, then more layers. A hat and socks, indoors too.",
           "Sleep in a sleeping bag on a mat or blankets, not on the cold floor.",
           "Hot-water bottle, warm drinks, regular meals: the body needs fuel to make heat.",
           "Move every hour. Stay dry: damp clothes make you cold."],
      de: ["Schichten: Wolle oder Fleece auf der Haut, darüber mehr Schichten. Mütze und Socken, auch drinnen.",
           "Im Schlafsack auf Matte oder Decken schlafen, nicht auf dem kalten Boden.",
           "Wärmflasche, warme Getränke, regelmäßige Mahlzeiten: der Körper braucht Brennstoff für Wärme.",
           "Jede Stunde bewegen. Trocken bleiben: feuchte Kleidung macht kalt."] } },
    { h: { en: "Danger: too cold", de: "Gefahr: Unterkühlung" }, li: {
      en: ["Watch for strong shivering, confusion, slurred speech, clumsiness, sleepiness.",
           "Babies, small children and older people cool down faster and notice it less.",
           "If someone stops shivering but is still cold and confused: this is an emergency. Warm them slowly with blankets and body heat, give warm sweet drinks if they're awake, and get help."],
      de: ["Achte auf starkes Zittern, Verwirrtheit, verwaschene Sprache, Ungeschicklichkeit, Schläfrigkeit.",
           "Babys, kleine Kinder und ältere Menschen kühlen schneller aus und merken es weniger.",
           "Wenn jemand nicht mehr zittert, aber kalt und verwirrt ist: Notfall. Langsam mit Decken und Körperwärme wärmen, wach: warme süße Getränke, Hilfe holen."] } },
    { h: { en: "Never indoors", de: "Niemals drinnen" }, li: {
      en: ["No charcoal grill, gas barbecue, generator or gas oven for heating. They make carbon monoxide (CO): invisible, no smell, deadly.",
           "Only use heaters approved for indoor use, with ventilation and a battery CO alarm."],
      de: ["Kein Holzkohlegrill, Gasgrill, Generator oder Gasbackofen zum Heizen. Sie erzeugen Kohlenmonoxid (CO): unsichtbar, geruchlos, tödlich.",
           "Nur Heizgeräte, die für Innenräume zugelassen sind, mit Lüftung und CO-Melder mit Batterie."] } }
  ],
  src: ["BBK: Stromausfall – Vorsorge und Selbsthilfe", "Berlin, Januar 2026: tagelanger Stromausfall bei rund −10 °C"]
},
{
  id: "food", icon: "🥫",
  t: { en: "Food", de: "Essen" },
  lead: { en: "Spartan is fine. You can go weeks on simple food, but not days without water.", de: "Spartanisch ist in Ordnung. Mit einfachem Essen kommt man Wochen aus, ohne Wasser keine Tage." },
  parts: [
    { h: { en: "What to store", de: "Was lagern" }, li: {
      en: ["Things you eat anyway and that keep without a fridge: rice, oats, pasta, lentils, crispbread, tinned beans, vegetables and fish, nuts, peanut butter, oil, honey, salt.",
           "Things you can eat cold first: oats soaked in water or UHT milk, tins, crispbread, nuts, dried fruit.",
           "Eat from the stock and refill it, so nothing expires.",
           "The Ready check calculates the amounts for your household."],
      de: ["Was ihr sowieso esst und ohne Kühlschrank hält: Reis, Haferflocken, Nudeln, Linsen, Knäckebrot, Dosenbohnen, -gemüse und -fisch, Nüsse, Erdnussbutter, Öl, Honig, Salz.",
           "Zuerst, was kalt essbar ist: Haferflocken in Wasser oder H-Milch eingeweicht, Dosen, Knäckebrot, Nüsse, Trockenobst.",
           "Aus dem Vorrat essen und nachkaufen, damit nichts abläuft.",
           "Der Vorrats-Check rechnet die Mengen für deinen Haushalt aus."] } },
    { h: { en: "Fridge and freezer", de: "Kühlschrank und Gefriertruhe" }, li: {
      en: ["A closed fridge stays cold for about 4 hours, a full freezer about 48 hours (half full: 24).",
           "Eat the fridge first, then the freezer. In winter, a balcony or a box outside can be a fridge.",
           "Meat, fish, dairy or cooked food that has been above 5 °C for more than 2 hours: throw it out. When in doubt, throw it out."],
      de: ["Ein geschlossener Kühlschrank bleibt etwa 4 Stunden kalt, eine volle Gefriertruhe etwa 48 Stunden (halb voll: 24).",
           "Erst den Kühlschrank essen, dann die Gefriertruhe. Im Winter kann der Balkon oder eine Kiste draußen der Kühlschrank sein.",
           "Fleisch, Fisch, Milchprodukte oder Gekochtes, das mehr als 2 Stunden über 5 °C war: wegwerfen. Im Zweifel weg damit."] } },
    { h: { en: "Cooking without power", de: "Kochen ohne Strom" }, li: {
      en: ["Camping stove with gas cartridges: only by an open window or outside, never unattended.",
           "Save fuel: soak lentils and rice beforehand, use a lid, cook one pot for everyone, keep it warm wrapped in blankets.",
           "Cook together with neighbours: one stove, one pot, many people."],
      de: ["Campingkocher mit Gaskartuschen: nur am offenen Fenster oder draußen, nie unbeaufsichtigt.",
           "Brennstoff sparen: Linsen und Reis vorher einweichen, Deckel drauf, ein Topf für alle, in Decken eingewickelt warm halten.",
           "Mit Nachbarn zusammen kochen: ein Kocher, ein Topf, viele Leute."] } }
  ],
  src: ["BBK: Checkliste 10-Tage-Vorrat", "USDA: Food safety in a power outage (4 h fridge, 48 h full freezer)"]
},
{
  id: "toilet", icon: "🚽",
  t: { en: "Toilet & hygiene", de: "Toilette & Hygiene" },
  lead: { en: "Without power, sewage can stop too. Dirty hands are the fastest way to get sick.", de: "Ohne Strom kann auch das Abwasser ausfallen. Schmutzige Hände machen am schnellsten krank." },
  parts: [
    { h: { en: "Emergency toilet", de: "Nottoilette" }, li: {
      en: ["If the authorities say sewage is down, or the toilet won't drain: stop flushing.",
           "Put a strong bin bag (two, one inside the other) into the toilet bowl or a bucket.",
           "After each use, cover with cat litter, sawdust or shredded paper. That keeps the smell down.",
           "Close full bags tightly and keep them outside in a closed bin, away from water.",
           "You need: bucket with lid, strong bags, about 10 L of litter per week, toilet paper, gloves."],
      de: ["Wenn gemeldet wird, dass das Abwasser ausfällt, oder die Toilette nicht mehr abläuft: nicht mehr spülen.",
           "Einen festen Müllbeutel (zwei ineinander) in die Toilettenschüssel oder einen Eimer legen.",
           "Nach jeder Benutzung mit Katzenstreu, Sägespänen oder Papierschnipseln abdecken. Das hält den Geruch klein.",
           "Volle Beutel fest verschließen und draußen in einer geschlossenen Tonne lagern, weg vom Wasser.",
           "Du brauchst: Eimer mit Deckel, feste Beutel, etwa 10 L Streu pro Woche, Toilettenpapier, Handschuhe."] } },
    { h: { en: "Clean hands, clean food", de: "Saubere Hände, sauberes Essen" }, li: {
      en: ["Wash hands after the toilet and before food, with soap and a little water. Or use hand sanitiser.",
           "A canister with a tap, soap and a towel next to the toilet makes it easy.",
           "Wash with a cloth and a bowl of warm water. That's enough.",
           "Wash dishes in one bowl, rinse in a second. Throw dirty water into the toilet bucket or outside."],
      de: ["Hände nach der Toilette und vor dem Essen waschen, mit Seife und wenig Wasser. Oder Desinfektionsmittel.",
           "Ein Kanister mit Hahn, Seife und Handtuch neben der Toilette macht es leicht.",
           "Waschen mit Lappen und einer Schüssel warmem Wasser. Das reicht.",
           "Geschirr in einer Schüssel spülen, in einer zweiten nachspülen. Schmutzwasser in den Toiletteneimer oder nach draußen."] } }
  ],
  src: ["BBK: Ratgeber für Notfallvorsorge (Hygiene)", "TAB 2011: Abwasserentsorgung bei Stromausfall"]
},
{
  id: "light", icon: "🔦",
  t: { en: "Light & phone power", de: "Licht & Handy-Strom" },
  lead: { en: "Light for safety, the phone for this app and news. Both need a power plan.", de: "Licht für die Sicherheit, das Handy für diese App und Nachrichten. Beides braucht einen Strom-Plan." },
  parts: [
    { h: { en: "Light", de: "Licht" }, li: {
      en: ["A headlamp per person: hands free, safer than candles.",
           "LED lanterns for the warm room. Spare batteries, or rechargeable ones plus a solar charger.",
           "Candles only under supervision, never near children sleeping, never left alone."],
      de: ["Eine Stirnlampe pro Person: Hände frei, sicherer als Kerzen.",
           "LED-Laternen für den warmen Raum. Ersatzbatterien, oder Akkus plus Solarlader.",
           "Kerzen nur unter Aufsicht, nie bei schlafenden Kindern, nie allein lassen."] } },
    { h: { en: "Phone power plan", de: "Strom-Plan fürs Handy" }, li: {
      en: ["Airplane mode, low brightness, dark mode, power saving. Switch on twice a day at the agreed times.",
           "A 20,000 mAh power bank charges a phone about 3–4 times.",
           "For weeks you need a solar panel. A foldable 20–30 W panel charges a phone in a few hours of sun; on grey winter days much less.",
           "A car can charge phones from its USB socket – only run the engine outdoors, never in a garage."],
      de: ["Flugmodus, wenig Helligkeit, Dunkelmodus, Energiesparen. Zweimal am Tag zu den vereinbarten Zeiten einschalten.",
           "Eine Powerbank mit 20.000 mAh lädt ein Handy etwa 3–4 Mal.",
           "Für Wochen brauchst du ein Solarpanel. Ein faltbares 20–30-W-Panel lädt ein Handy in ein paar Sonnenstunden; an grauen Wintertagen deutlich weniger.",
           "Ein Auto lädt Handys über USB – Motor nur draußen laufen lassen, nie in der Garage."] } },
    { h: { en: "News", de: "Nachrichten" }, li: {
      en: ["Battery, crank or solar radio: public radio keeps broadcasting on emergency power. It's the most reliable news source.",
           "Warning apps and cell broadcast need the mobile network – they may not work.",
           "Keep some cash at home in small notes: card payment and ATMs need power."],
      de: ["Radio mit Batterie, Kurbel oder Solar: der öffentlich-rechtliche Rundfunk sendet mit Notstrom weiter. Die verlässlichste Quelle.",
           "Warn-Apps und Cell Broadcast brauchen das Mobilfunknetz – sie können ausfallen.",
           "Etwas Bargeld in kleinen Scheinen zu Hause: Kartenzahlung und Geldautomaten brauchen Strom."] } }
  ],
  src: ["BBK: Stromausfall – Vorsorge und Selbsthilfe", "Expertenkommission Berlin 2026: Zusammenbruch des Mobilfunks"]
},
{
  id: "health", icon: "🩹",
  t: { en: "Health & first aid", de: "Gesundheit & Erste Hilfe" },
  lead: { en: "When 112 is slow, you are the help. This page doesn't replace a first-aid course – do one.", de: "Wenn 112 nicht schnell kommt, bist du die Hilfe. Diese Seite ersetzt keinen Erste-Hilfe-Kurs – mach einen." },
  parts: [
    { h: { en: "Getting help", de: "Hilfe holen" }, li: {
      en: ["Try 112 first. If phones are down, go to the town's emergency point (Kat-Leuchtturm), a fire station or a hospital: they can call for help by radio.",
           "Send two people if you can: one stays with the injured person."],
      de: ["Zuerst 112 versuchen. Wenn das Telefon nicht geht: zum Kat-Leuchtturm, zur Feuerwache oder ins Krankenhaus – dort kann per Funk Hilfe gerufen werden.",
           "Wenn möglich zu zweit: einer bleibt bei der verletzten Person."] } },
    { h: { en: "Someone collapses", de: "Jemand bricht zusammen" }, li: {
      en: ["Speak to them loudly, shake their shoulders. No reaction: tilt the head back, look and listen for normal breathing for 10 seconds.",
           "Breathing normally: recovery position (on the side), keep warm, check breathing all the time.",
           "Not breathing normally: start CPR. Push hard and fast in the middle of the chest, 5–6 cm deep, 100–120 times a minute. 30 pushes, 2 breaths. Don't stop until help comes or they breathe.",
           "Fainted but breathing: lay them down flat with legs raised."],
      de: ["Laut ansprechen, an den Schultern rütteln. Keine Reaktion: Kopf überstrecken, 10 Sekunden auf normale Atmung sehen und hören.",
           "Atmet normal: stabile Seitenlage, warm halten, Atmung ständig prüfen.",
           "Atmet nicht normal: Wiederbelebung. Fest und schnell in die Brustmitte drücken, 5–6 cm tief, 100–120 Mal pro Minute. 30-mal drücken, 2-mal beatmen. Nicht aufhören, bis Hilfe da ist oder die Person atmet.",
           "Ohnmächtig, aber atmet: flach hinlegen, Beine hoch."] } },
    { h: { en: "Bleeding, burns, wounds", de: "Blutung, Verbrennung, Wunden" }, li: {
      en: ["Bleeding: press firmly on the wound with a clean cloth. Keep pressing. Then a pressure bandage.",
           "Burns: cool with lukewarm (not ice-cold) water for 10–20 minutes, then cover loosely with something clean. Large burns, burns on face or hands, children: get help.",
           "Small wounds: rinse with drinking water, cover with a plaster. Check daily.",
           "Signs of infection – spreading redness, warmth, pus, fever: get medical help."],
      de: ["Blutung: mit einem sauberen Tuch fest auf die Wunde drücken. Weiterdrücken. Dann Druckverband.",
           "Verbrennung: 10–20 Minuten mit lauwarmem (nicht eiskaltem) Wasser kühlen, dann locker sauber abdecken. Große Verbrennungen, Gesicht oder Hände, Kinder: Hilfe holen.",
           "Kleine Wunden: mit Trinkwasser ausspülen, Pflaster drauf. Täglich anschauen.",
           "Zeichen einer Entzündung – Rötung, die sich ausbreitet, Wärme, Eiter, Fieber: ärztliche Hilfe holen."] } },
    { h: { en: "Carbon monoxide (CO)", de: "Kohlenmonoxid (CO)" }, li: {
      en: ["Headache, dizziness, nausea, sleepiness – especially several people at once, or pets too: suspect CO.",
           "Get everyone into fresh air at once, open windows, switch off stoves and heaters, get help."],
      de: ["Kopfschmerz, Schwindel, Übelkeit, Schläfrigkeit – besonders bei mehreren Personen gleichzeitig oder auch bei Haustieren: an CO denken.",
           "Sofort alle an die frische Luft, Fenster auf, Kocher und Heizgeräte aus, Hilfe holen."] } },
    { h: { en: "Diarrhoea", de: "Durchfall" }, li: {
      en: ["The danger is losing fluid, especially for children.",
           "Oral rehydration solution: 1 litre of safe water + 6 level teaspoons of sugar + ½ level teaspoon of salt. Drink small sips often.",
           "Get help if: no urine for many hours, very sleepy, blood in the stool, a baby or small child who won't drink."],
      de: ["Die Gefahr ist der Flüssigkeitsverlust, besonders bei Kindern.",
           "Trinklösung: 1 Liter sicheres Wasser + 6 gestrichene Teelöffel Zucker + ½ gestrichener Teelöffel Salz. Oft in kleinen Schlucken trinken.",
           "Hilfe holen bei: viele Stunden kein Urin, sehr schläfrig, Blut im Stuhl, Baby oder Kleinkind trinkt nicht."] } },
    { h: { en: "Get help at once", de: "Sofort Hilfe holen" }, li: {
      en: ["Chest pain, trouble breathing, heavy bleeding, unconscious.",
           "Signs of stroke: face drooping, arm weak, speech slurred.",
           "Suspected CO poisoning, severe hypothermia, a child who is limp or very hard to wake."],
      de: ["Brustschmerz, Atemnot, starke Blutung, Bewusstlosigkeit.",
           "Zeichen eines Schlaganfalls: hängender Mundwinkel, schwacher Arm, verwaschene Sprache.",
           "Verdacht auf CO-Vergiftung, starke Unterkühlung, ein Kind, das schlaff oder kaum weckbar ist."] } },
    { h: { en: "Kit at home", de: "Zu Hause bereit" }, li: {
      en: ["A first-aid kit (a car kit, DIN 13164, is a fine start), plasters, disinfectant, pain and fever medicine, thermometer, oral rehydration salts.",
           "Your personal medicines for at least 10 days."],
      de: ["Verbandkasten (ein Kfz-Verbandkasten nach DIN 13164 reicht für den Anfang), Pflaster, Desinfektion, Schmerz- und Fiebermittel, Thermometer, Elektrolyt-Pulver.",
           "Deine persönlichen Medikamente für mindestens 10 Tage."] } }
  ],
  src: ["European Resuscitation Council (ERC) Guidelines", "WHO: oral rehydration solution", "BBK: Hausapotheke", "Review by DRK first-aid trainers: pending"]
},
{
  id: "tech", icon: "🔧",
  t: { en: "Tech & repair", de: "Technik & Reparatur" },
  lead: { en: "Know where your switches and valves are. A small toolbox fixes most things.", de: "Wisse, wo Schalter und Ventile sind. Ein kleiner Werkzeugkasten repariert das Meiste." },
  parts: [
    { h: { en: "Know your home", de: "Kenne deine Wohnung" }, li: {
      en: ["Where are the fuse box, the main water valve and the gas valve? Find them today, mark them, show everyone.",
           "Frost and no heating: if it may get below 0 °C indoors, close the main water valve and open the taps at the lowest point to drain the pipes. Burst pipes cause more damage than the outage.",
           "When power returns: switch on large devices one at a time."],
      de: ["Wo sind Sicherungskasten, Hauptwasserhahn und Gasabsperrhahn? Heute suchen, markieren, allen zeigen.",
           "Frost und keine Heizung: wenn es drinnen unter 0 °C werden kann, Hauptwasserhahn zu und die Hähne am tiefsten Punkt öffnen, um die Leitungen zu leeren. Geplatzte Rohre schaden mehr als der Stromausfall.",
           "Wenn der Strom zurück ist: große Geräte einzeln einschalten."] } },
    { h: { en: "Small toolbox", de: "Kleiner Werkzeugkasten" }, li: {
      en: ["Screwdrivers, pliers, adjustable spanner, knife or multitool, small saw, hammer.",
           "Duct tape, cable ties, strong cord, a tarpaulin, work gloves.",
           "A bicycle and its repair kit: transport when fuel and buses are gone."],
      de: ["Schraubendreher, Zange, Rollgabelschlüssel, Messer oder Multitool, kleine Säge, Hammer.",
           "Gewebeband, Kabelbinder, feste Schnur, eine Plane, Arbeitshandschuhe.",
           "Ein Fahrrad mit Flickzeug: Transport, wenn Sprit und Busse fehlen."] } },
    { h: { en: "Fire", de: "Feuer" }, li: {
      en: ["The fire brigade may be slow. A fire blanket and an extinguisher in the kitchen, and know how to use them.",
           "A battery smoke alarm and CO alarm in the warm room."],
      de: ["Die Feuerwehr kann langsam sein. Löschdecke und Feuerlöscher in die Küche, und wissen, wie sie funktionieren.",
           "Rauchmelder und CO-Melder mit Batterie im warmen Raum."] } },
    { h: { en: "Generators", de: "Stromerzeuger" }, li: {
      en: ["Only outdoors, far from windows and doors. Never in a garage, cellar or on a balcony.",
           "Never feed power into the house wiring yourself – that can kill workers on the grid."],
      de: ["Nur draußen, weit weg von Fenstern und Türen. Nie in Garage, Keller oder auf dem Balkon.",
           "Nie selbst Strom ins Hausnetz einspeisen – das kann Arbeiter am Netz töten."] } }
  ],
  src: ["BBK: Stromausfall – Vorsorge und Selbsthilfe"]
},
{
  id: "mind", icon: "🫶",
  t: { en: "Mind & community", de: "Kopf & Gemeinschaft" },
  lead: { en: "Calm, routine and each other get people through weeks.", de: "Ruhe, Ablauf und einander bringen Menschen durch Wochen." },
  parts: [
    { h: { en: "Routine", de: "Tagesablauf" }, li: {
      en: ["Fixed times: getting up, meals, tasks, news, light out. It gives the day a shape.",
           "Everyone gets a task, children too: water duty, lamp duty, checking on a neighbour.",
           "Move every day, outside when you can."],
      de: ["Feste Zeiten: Aufstehen, Mahlzeiten, Aufgaben, Nachrichten, Licht aus. Das gibt dem Tag eine Form.",
           "Jeder bekommt eine Aufgabe, auch Kinder: Wasserdienst, Lampendienst, nach einem Nachbarn schauen.",
           "Jeden Tag bewegen, draußen, wenn es geht."] } },
    { h: { en: "Children", de: "Kinder" }, li: {
      en: ["Tell them calmly and honestly what's happening: \"The power is off for a while. We're prepared and we're together.\"",
           "Books, cards, board games, drawing, stories in the evening.",
           "Let them ask questions, and don't force long talks."],
      de: ["Ruhig und ehrlich erklären, was los ist: „Der Strom ist eine Weile weg. Wir sind vorbereitet und wir sind zusammen.“",
           "Bücher, Karten, Brettspiele, Malen, Geschichten am Abend.",
           "Fragen zulassen, keine langen Gespräche erzwingen."] } },
    { h: { en: "Each other", de: "Füreinander" }, li: {
      en: ["Stress, worry and bad sleep are normal. Talk about it.",
           "Visit people who are alone, especially older people.",
           "Share skills, not just things: who can repair, cook, give first aid, look after children?",
           "Rumours spread fast. Before you pass something on: Where is it from? Did the radio or the emergency point say so?"],
      de: ["Stress, Sorgen und schlechter Schlaf sind normal. Darüber reden.",
           "Menschen besuchen, die allein sind, besonders Ältere.",
           "Fähigkeiten teilen, nicht nur Dinge: Wer kann reparieren, kochen, Erste Hilfe, Kinder betreuen?",
           "Gerüchte verbreiten sich schnell. Bevor du etwas weitersagst: Woher kommt es? Hat es das Radio oder der Notfall-Treffpunkt gesagt?"] } }
  ],
  src: ["BBK: Ratgeber für Notfallvorsorge (Psychosoziale Hinweise)"]
},
{
  id: "comms", icon: "📻",
  t: { en: "Communication", de: "Kommunikation" },
  lead: { en: "When the mobile network fails, talk locally. The more you agree beforehand, the less tech you need.", de: "Wenn das Handynetz ausfällt, wird lokal geredet. Je mehr vorher abgesprochen ist, desto weniger Technik braucht es." },
  parts: [
    { h: { en: "Layer 0: no tech", de: "Stufe 0: ohne Technik" }, li: {
      en: ["A fixed meeting place and two fixed times a day, e.g. 10:00 and 18:00.",
           "A paper notice board there: news, needs, offers, who has been checked on.",
           "For emergencies: the town's emergency point (Kat-Leuchtturm / Notfall-Meldestelle). It forwards emergency calls by radio or satellite phone.",
           "Fill in your Communication card in this app and print it."],
      de: ["Ein fester Treffpunkt und zwei feste Uhrzeiten am Tag, z. B. 10:00 und 18:00.",
           "Dort ein Papier-Schwarzes-Brett: Neuigkeiten, Bedarf, Angebote, wer besucht wurde.",
           "Für Notfälle: Kat-Leuchtturm / Notfall-Meldestelle der Gemeinde. Dort werden Notrufe per Funk oder Satellitentelefon weitergegeben.",
           "Deine Kommunikationskarte in dieser App ausfüllen und ausdrucken."] } },
    { h: { en: "Layer 1: phone only", de: "Stufe 1: nur Handy" }, li: {
      en: ["Offline messengers send messages phone-to-phone over Bluetooth or Wi-Fi, about 100 m: Briar (Android), bitchat (Android and iPhone).",
           "Install now, while there is internet, and add your neighbours as contacts."],
      de: ["Offline-Messenger schicken Nachrichten von Handy zu Handy über Bluetooth oder WLAN, etwa 100 m: Briar (Android), bitchat (Android und iPhone).",
           "Jetzt installieren, solange es Internet gibt, und Nachbarn als Kontakte hinzufügen."] } },
    { h: { en: "Layer 2: walkie-talkies", de: "Stufe 2: Funkgeräte" }, li: {
      en: ["PMR446 radios: licence-free, about €50–100 a pair, run on AA batteries.",
           "Realistic range in town: 0.5–3 km. Enough for a street or a village.",
           "Agree on one channel for the neighbourhood. Keep messages short."],
      de: ["PMR446-Funkgeräte: anmeldefrei, etwa 50–100 € pro Paar, laufen mit AA-Batterien.",
           "Realistische Reichweite im Ort: 0,5–3 km. Genug für eine Straße oder ein Dorf.",
           "Einen Kanal für die Nachbarschaft vereinbaren. Kurz funken."] } },
    { h: { en: "Layer 3: mesh radio", de: "Stufe 3: Mesh-Funk" }, li: {
      en: ["Meshtastic: small LoRa radios (about €20–40 each, 868 MHz in Europe) pass text messages from one to the next, 1–4 km per hop.",
           "Runs for days on a small battery or a solar panel. One tech-minded neighbour with a few nodes on rooftops can connect a whole village."],
      de: ["Meshtastic: kleine LoRa-Funkgeräte (etwa 20–40 € pro Stück, in Europa 868 MHz) reichen Textnachrichten weiter, 1–4 km pro Sprung.",
           "Laufen tagelang mit kleinem Akku oder Solarpanel. Ein technikbegeisterter Nachbar mit ein paar Knoten auf Dächern verbindet ein ganzes Dorf."] } },
    { h: { en: "Light governance", de: "Einfache Organisation" }, li: {
      en: ["One contact person per building or street.",
           "A list of who needs a daily check-in.",
           "A skills list: first aid, repairs, cooking, radio.",
           "Decisions at the meeting, written on the board."],
      de: ["Eine Ansprechperson pro Haus oder Straße.",
           "Eine Liste, wer täglich besucht werden muss.",
           "Eine Fähigkeitenliste: Erste Hilfe, Reparieren, Kochen, Funk.",
           "Entscheidungen beim Treffen, aufgeschrieben am Brett."] } }
  ],
  src: ["Kreis Viersen / Berlin / Stuttgart: Bevölkerungsschutz-Leuchttürme", "Expertenkommission Berlin 2026", "Briar Project", "Meshtastic"]
}
];
