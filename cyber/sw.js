// Offline cache. Network first, so updates arrive when online; the saved copy is used without internet.
const CACHE = "cyber-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "assets/apple-touch-icon.png", "assets/door.mp4", "assets/door.webp", "assets/icon-192.png", "assets/icon-512.png", "assets/icon-backpack.webp", "assets/icon-crane-mail.webp", "assets/icon-crane.webp", "assets/icon-heart.webp", "assets/icon-house.webp", "assets/icon-keys.webp", "assets/icon-lantern.webp", "assets/icon-lock.webp", "assets/icon-maskable-512.png", "assets/icon-masks.webp", "assets/icon-phone.webp", "assets/icon-router.webp", "assets/icon-shield.webp", "assets/intro.webp", "assets/philia-cheer.mp4", "assets/philia-cheer.webp", "assets/philia-face.webp", "assets/philia.webp", "assets/pillow.mp4", "assets/pillow.webp", "assets/poster.mp4", "assets/poster.webp", "assets/ying-face.webp", "assets/ying-vanish.mp4", "assets/ying-vanish.webp", "assets/ying.webp"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("cyber-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.headers.get("range")) return;
  e.respondWith(fetch(e.request).then((r) => { if (r.ok && r.status === 200) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match("index.html"))));
});
