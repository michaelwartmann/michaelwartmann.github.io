// Aufguss Studio – short looping YouTube clips (only loaded when someone taps; no outside requests before that).
// A technique can carry  clip: { id: "YouTubeId", start: 42.0, end: 45.0, credit: "Channel" }
(function (root) {
  "use strict";
  let apiPromise = null;
  function loadApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      if (root.YT && root.YT.Player) return resolve(root.YT);
      const prev = root.onYouTubeIframeAPIReady;
      root.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(root.YT); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => { apiPromise = null; reject(new Error("offline")); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }
  function parseId(url) {
    const m = String(url).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || String(url).match(/^([\w-]{11})$/);
    return m ? m[1] : null;
  }
  function parseTime(url) {
    const m = String(url).match(/[?&]t=(\d+)/); return m ? +m[1] : 0;
  }
  const originVar = () => (/^https?:/.test(location.protocol) ? { origin: location.origin } : {});
  const fmt = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60); return m + ":" + (s - m * 60).toFixed(1).padStart(4, "0"); };

  // Loop a clip inside `el`. Returns a handle with stop().
  async function loop(el, clip, opts = {}) {
    const YT = await loadApi();
    const box = document.createElement("div");
    el.innerHTML = ""; el.appendChild(box);
    let timer = null;
    const player = new YT.Player(box, {
      host: "https://www.youtube-nocookie.com",
      videoId: clip.id, width: "100%", height: "100%",
      playerVars: Object.assign({ start: Math.floor(clip.start), end: Math.ceil(clip.end), autoplay: 1, mute: 1, controls: opts.controls ? 1 : 0, playsinline: 1, rel: 0 }, originVar()),
      events: {
        onReady: (e) => { e.target.mute(); e.target.seekTo(clip.start, true); e.target.playVideo(); if (opts.rate) e.target.setPlaybackRate(opts.rate); },
        onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(clip.start, true); e.target.playVideo(); } },
      },
    });
    timer = setInterval(() => {
      try { if (player.getCurrentTime && player.getCurrentTime() >= clip.end) player.seekTo(clip.start, true); } catch (x) {}
    }, 100);
    return { player, stop() { clearInterval(timer); try { player.destroy(); } catch (x) {} el.innerHTML = ""; }, setRate(r) { try { player.setPlaybackRate(r); } catch (x) {} } };
  }

  // Clip picker for the review page.
  function picker(root_, techniques, lang) {
    const T = lang === "de"
      ? { h: "Clip-Picker", intro: "YouTube-Link einfügen, Technik wählen, abspielen. Am Anfang einer sauberen Wiederholung „Start“ tippen, am Ende „Ende“. Dann „Testen“ und die Zeile an Claude schicken.",
          url: "YouTube-Link", tech: "Technik", load: "Laden", start: "Start", end: "Ende", test: "Testen (Schleife)", copy: "Zeile kopieren", copied: "Kopiert", back: "−0,2 s", fwd: "+0,2 s", slow: "Langsam", credit: "Kanal (für die Nennung)" }
      : { h: "Clip picker", intro: "Paste a YouTube link, choose the technique, play. Tap “Start” at the beginning of one clean repeat and “End” at its end. Then “Test” and send the line to Claude.",
          url: "YouTube link", tech: "Technique", load: "Load", start: "Start", end: "End", test: "Test (loop)", copy: "Copy line", copied: "Copied", back: "−0.2 s", fwd: "+0.2 s", slow: "Slow", credit: "Channel (for the credit)" };
    root_.innerHTML = `
      <h2>${T.h}</h2><p class="meta">${T.intro}</p>
      <div class="pk-row"><label>${T.url} <input id="pkUrl" type="url" placeholder="https://www.youtube.com/watch?v=…"></label>
        <label>${T.tech} <select id="pkTech">${techniques.map((t) => `<option value="${t.no}">${t.no} · ${t.code} ${t.name[lang] || t.name.en}</option>`).join("")}</select></label>
        <label>${T.credit} <input id="pkCredit" type="text" placeholder="Flow Aufguss Academy"></label>
        <button id="pkLoad">${T.load}</button></div>
      <div id="pkPlayer" class="pk-player"></div>
      <div class="pk-row"><button id="pkBack">${T.back}</button><button id="pkFwd">${T.fwd}</button><button id="pkSlow" aria-pressed="false">${T.slow}</button>
        <button id="pkStart">${T.start}: <b id="pkS">–</b></button><button id="pkEnd">${T.end}: <b id="pkE">–</b></button><button id="pkTest">${T.test}</button></div>
      <div class="pk-row"><code id="pkLine">–</code> <button id="pkCopy">${T.copy}</button></div>`;
    const $ = (s) => root_.querySelector(s);
    let player = null, id = null, s = null, e = null, testTimer = null;
    const line = () => {
      const tech = techniques.find((t) => String(t.no) === $("#pkTech").value);
      const txt = id && s != null && e != null ? `${tech.no} · ${tech.code} · ${id} · ${s.toFixed(1)}–${e.toFixed(1)}${$("#pkCredit").value ? " · " + $("#pkCredit").value : ""}` : "–";
      $("#pkLine").textContent = txt; return txt;
    };
    $("#pkLoad").onclick = async () => {
      id = parseId($("#pkUrl").value); if (!id) return;
      s = e = null; $("#pkS").textContent = $("#pkE").textContent = "–"; line();
      const YT = await loadApi();
      const box = document.createElement("div"); $("#pkPlayer").innerHTML = ""; $("#pkPlayer").appendChild(box);
      player = new YT.Player(box, { host: "https://www.youtube-nocookie.com", videoId: id, width: "100%", height: "100%",
        playerVars: Object.assign({ start: parseTime($("#pkUrl").value), playsinline: 1, rel: 0, mute: 1 }, originVar()) });
    };
    const now = () => (player && player.getCurrentTime ? player.getCurrentTime() : 0);
    $("#pkBack").onclick = () => player && player.seekTo(now() - 0.2, true);
    $("#pkFwd").onclick = () => player && player.seekTo(now() + 0.2, true);
    $("#pkSlow").onclick = (ev) => { const on = ev.currentTarget.getAttribute("aria-pressed") !== "true"; ev.currentTarget.setAttribute("aria-pressed", on); player && player.setPlaybackRate(on ? 0.5 : 1); };
    $("#pkStart").onclick = () => { s = now(); $("#pkS").textContent = fmt(s); line(); };
    $("#pkEnd").onclick = () => { e = now(); $("#pkE").textContent = fmt(e); line(); };
    $("#pkTech").onchange = line; $("#pkCredit").oninput = line;
    $("#pkTest").onclick = () => {
      if (!player || s == null || e == null || e <= s) return;
      clearInterval(testTimer); player.seekTo(s, true); player.playVideo();
      testTimer = setInterval(() => { if (now() >= e) player.seekTo(s, true); }, 80);
    };
    $("#pkCopy").onclick = async (ev) => { try { await navigator.clipboard.writeText(line()); ev.currentTarget.textContent = T.copied; } catch (x) {} };
  }

  root.AufgussClip = { loop, picker, parseId };
})(typeof window !== "undefined" ? window : globalThis);
