/* =============================================================================
 *  simpage.js — applications.html 컨트롤러
 *  content.js 의 sim 블록을 읽어 UI 를 구성하고 simulator.js 를 구동한다.
 * ========================================================================== */
(function () {
  "use strict";

  var LANG_KEY = "sgl-site-lang";
  var st = { lang: "en", app: "forest", sensor: "k3", date: 2, product: "detect", seed: 7, scene: null, samp: null };

  function $(s) { return document.querySelector(s); }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }

  function initialLang() {
    try { var v = localStorage.getItem(LANG_KEY); if (v === "ko" || v === "en") return v; } catch (e) {}
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "ko" || q === "en") return q;
    return SITE.config.defaultLang || "en";
  }

  /* ---------- 컨트롤 ---------- */
  function group(label, items, current, onPick) {
    var g = el("div", "sim-group");
    g.appendChild(el("span", "sim-glabel", label));
    var row = el("div", "sim-chips");
    items.forEach(function (it) {
      var b = el("button", "sim-chip" + (it.key === current ? " on" : ""));
      b.type = "button";
      b.appendChild(el("b", null, it.label));
      if (it.note) b.appendChild(el("span", null, it.note));
      b.addEventListener("click", function () { onPick(it.key); });
      row.appendChild(b);
    });
    g.appendChild(row);
    return g;
  }

  function renderControls(L) {
    var box = $("#simControls");
    clear(box);
    var S = L.sim;

    box.appendChild(group(S.labels.app, S.apps.map(function (a) { return { key: a.key, label: a.label }; }),
      st.app, function (k) { st.app = k; st.scene = null; run(); }));

    box.appendChild(group(S.labels.sensor, S.sensors, st.sensor,
      function (k) { st.sensor = k; run(); }));

    box.appendChild(group(S.labels.date, S.dates.map(function (d, i) { return { key: i, label: d }; }),
      st.date, function (k) { st.date = k; st.scene = null; run(); }));

    box.appendChild(group(S.labels.product, S.products, st.product,
      function (k) { st.product = k; run(); }));

    var extra = el("div", "sim-group");
    extra.appendChild(el("span", "sim-glabel", " "));
    var row = el("div", "sim-chips");
    var nb = el("button", "sim-chip alt", S.labels.regenerate);
    nb.type = "button";
    nb.addEventListener("click", function () { st.seed = Math.floor(Math.random() * 9999) + 1; st.scene = null; run(); });
    row.appendChild(nb);
    extra.appendChild(row);
    box.appendChild(extra);
  }

  /* ---------- 사이드 패널 ---------- */
  function renderChain(L) {
    var ol = $("#simChain");
    clear(ol);
    var order = { rgb: 3, fcc: 3, ndvi: 5, tct: 5, detect: 7 };
    var upto = order[st.product];
    L.sim.chain.forEach(function (s, i) {
      var li = el("li", i < upto ? "done" : (i === upto ? "active" : ""));
      li.appendChild(el("span", "cs-mark"));
      li.appendChild(el("span", "cs-txt", s));
      ol.appendChild(li);
    });
  }

  function renderStats(L) {
    var dl = $("#simStats");
    clear(dl);
    var s = window.SIM.stats(st.scene, st.samp);
    var rows = [
      [L.sim.stats.ndvi, s.ndviMean.toFixed(3)],
      [L.sim.stats.detected, s.hitPct.toFixed(1) + " %"],
      [L.sim.stats.target, s.targetPct.toFixed(1) + " %"],
      [L.sim.stats.signal, s.sigMean.toFixed(3)]
    ];
    rows.forEach(function (r) {
      var d = el("div");
      d.appendChild(el("dt", null, r[0]));
      d.appendChild(el("dd", null, r[1]));
      dl.appendChild(d);
    });
  }

  function renderLegend(L) {
    var box = $("#simLegend");
    clear(box);
    var pair = st.product === "ndvi" ? L.sim.legendNdvi : L.sim.legendDetect;
    var bar = el("div", "sim-bar " + (st.product === "ndvi" ? "ndvi" : "risk"));
    box.appendChild(bar);
    var ends = el("div", "sim-ends");
    ends.appendChild(el("span", null, pair[0]));
    ends.appendChild(el("span", null, pair[1]));
    box.appendChild(ends);
  }

  /* ---------- 실행 ---------- */
  function run() {
    var L = SITE[st.lang], S = L.sim;
    renderControls(L);

    if (!st.scene) st.scene = window.SIM.makeScene(st.app, st.date, st.seed);
    st.samp = window.SIM.sample(st.scene, st.sensor);

    var cv = $("#simCanvas");
    var ctx = cv.getContext("2d");
    var img = window.SIM.render(ctx, st.scene, st.samp, st.product);
    ctx.putImageData(img, 0, 0);

    var app = S.apps.filter(function (a) { return a.key === st.app; })[0];
    var sen = S.sensors.filter(function (a) { return a.key === st.sensor; })[0];
    var pro = S.products.filter(function (a) { return a.key === st.product; })[0];

    $("#simTagApp").textContent = app.label;
    $("#simTagSensor").textContent = sen.label + " · " + sen.note;
    $("#simTagProduct").textContent = pro.label;
    $("#simScale").textContent = S.labels.gsd + " " + window.SIM.SENSORS[st.sensor].gsd.toFixed(2) + " m";
    $("#simDesc").textContent = app.desc;

    var sarNote = $("#simSarNote");
    sarNote.textContent = S.sarNote;
    sarNote.hidden = st.sensor !== "k5";

    renderChain(L);
    renderStats(L);
    renderLegend(L);
  }

  function paintStatic() {
    var L = SITE[st.lang], S = L.sim;
    document.documentElement.lang = st.lang;
    document.title = S.pageTitle;
    $("#brandText").textContent = st.lang === "ko" ? "이선구" : "Sun-Gu Lee";
    $("#backLink").textContent = S.back;
    $("#simHeading").textContent = S.heading;
    $("#simLead").textContent = S.lead;
    $("#chainTitle").textContent = S.labels.chain;
    $("#statsTitle").textContent = S.labels.stats;
    $("#legendTitle").textContent = S.labels.legend;
    $("#simDisclaimer").textContent = S.disclaimer;
    $("#footCopy").textContent = L.footer.copy;
    $("#footNote").textContent = L.footer.note;
    $("#langBtn").textContent = L.ui.langToggle;
  }

  function init() {
    st.lang = initialLang();
    paintStatic();
    run();
    $("#langBtn").addEventListener("click", function () {
      st.lang = st.lang === "ko" ? "en" : "ko";
      try { localStorage.setItem(LANG_KEY, st.lang); } catch (e) {}
      paintStatic();
      run();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
