/* =============================================================================
 *  tracker.js — KOMPSAT / NEONSAT 현재 위치 지도
 *
 *  data/tle.json (GitHub Actions 가 매일 CelesTrak 에서 갱신) 을 읽어
 *  orbit.js 로 브라우저에서 직접 전파한다. 서버도 외부 API 호출도 없다.
 *
 *  ※ 표시되는 것은 "위성이 지금 어느 지역 상공을 지나는가" 이며,
 *     실제 촬영(임무) 계획이나 정밀 궤도결정 값이 아니다.
 * ========================================================================== */
window.TRACKER = (function () {
  "use strict";

  var COL = {
    ocean: "#0d2b46",
    land: "#1d5f86",
    landEdge: "rgba(160,235,255,.45)",
    grid: "rgba(160,235,255,.10)",
    night: "rgba(2,7,16,.58)",
    track: "rgba(111,216,224,.45)",
    trackPast: "rgba(111,216,224,.85)",
    sat: "#eaf4fb",
    sar: "#ffb765",
    label: "#8fe3f0"
  };

  var state = { els: [], updated: null, timer: null, canvas: null, L: null, hover: -1 };

  function $(s) { return document.querySelector(s); }

  function project(lon, lat, w, h) {
    return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];
  }

  /* ---------- 지도 바탕 ---------- */
  function drawBase(ctx, w, h, now) {
    ctx.fillStyle = COL.ocean;
    ctx.fillRect(0, 0, w, h);

    var land = window.WORLD_LAND || [];
    ctx.beginPath();
    for (var i = 0; i < land.length; i++) {
      var ring = land[i];
      for (var j = 0; j < ring.length; j++) {
        var p = project(ring[j][0], ring[j][1], w, h);
        if (j === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
    }
    ctx.fillStyle = COL.land;
    ctx.fill("evenodd");
    ctx.strokeStyle = COL.landEdge;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 경위선
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (var lat = -60; lat <= 60; lat += 30) {
      var y = project(0, lat, w, h)[1];
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    for (var lon = -150; lon <= 150; lon += 30) {
      var x = project(lon, 0, w, h)[0];
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    ctx.stroke();
    // 적도 강조
    ctx.strokeStyle = "rgba(143,227,240,.22)";
    ctx.beginPath();
    var ey = project(0, 0, w, h)[1];
    ctx.moveTo(0, ey); ctx.lineTo(w, ey);
    ctx.stroke();

    drawNight(ctx, w, h, now);
  }

  /* ---------- 주야 경계 ---------- */
  function drawNight(ctx, w, h, now) {
    var ss = window.ORBIT.subsolar(now);
    var dec = ss.lat * Math.PI / 180;
    if (Math.abs(dec) < 1e-4) dec = 1e-4;
    var pts = [], i;
    for (i = 0; i <= 360; i += 2) {
      var lon = -180 + i;
      var dl = (lon - ss.lon) * Math.PI / 180;
      var lat = Math.atan(-Math.cos(dl) / Math.tan(dec)) * 180 / Math.PI;
      pts.push(project(lon, lat, w, h));
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    // 태양 적위가 북(+)이면 북극이 백야이므로 야간 영역은 곡선의 남쪽이다.
    if (dec > 0) { ctx.lineTo(w, h); ctx.lineTo(0, h); }
    else { ctx.lineTo(w, 0); ctx.lineTo(0, 0); }
    ctx.closePath();
    ctx.fillStyle = COL.night;
    ctx.fill();
  }

  /* ---------- 지상 자취 ---------- */
  function drawTrack(ctx, w, h, pts, past) {
    ctx.strokeStyle = past ? COL.trackPast : COL.track;
    ctx.lineWidth = past ? 1.6 : 1.1;
    if (!past) ctx.setLineDash([4, 5]);
    ctx.beginPath();
    var prev = null;
    for (var i = 0; i < pts.length; i++) {
      var p = project(pts[i][0], pts[i][1], w, h);
      if (prev && Math.abs(pts[i][0] - prev) > 180) ctx.moveTo(p[0], p[1]);   // 날짜변경선 처리
      else if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
      prev = pts[i][0];
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ---------- 위성 마커 ---------- */
  function drawSat(ctx, w, h, g, sat, idx, showLabel) {
    var p = project(g.lon, g.lat, w, h);
    var isSar = sat.kind === "sar";
    var c = isSar ? COL.sar : COL.sat;

    // 관측 가능 범위(지평선 기준 원) — 대략적인 가시권
    var horizonDeg = Math.acos(6378.137 / (6378.137 + g.altKm)) * 180 / Math.PI;
    ctx.beginPath();
    ctx.ellipse(p[0], p[1], (horizonDeg / 360) * w, (horizonDeg / 180) * h, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSar ? "rgba(255,183,101,.10)" : "rgba(143,227,240,.10)";
    ctx.fill();
    ctx.strokeStyle = isSar ? "rgba(255,183,101,.3)" : "rgba(143,227,240,.3)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p[0], p[1], 4.2, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.strokeStyle = "rgba(4,10,22,.85)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (showLabel) {
      ctx.font = "700 10.5px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = c;
      ctx.textAlign = p[0] > w - 90 ? "right" : "left";
      ctx.fillText(sat.label, p[0] + (p[0] > w - 90 ? -8 : 8), p[1] - 7);
      ctx.textAlign = "left";
    }
  }

  /* ---------- 표 ---------- */
  function fmt(v, d) { return (v >= 0 ? "" : "−") + Math.abs(v).toFixed(d); }

  function renderRows(now) {
    var tb = $("#trackBody");
    if (!tb) return;
    tb.innerHTML = "";
    var L = state.L;
    state.els.forEach(function (s, i) {
      var g = window.ORBIT.propagate(s.el, now);
      if (!g) return;
      var ss = window.ORBIT.subsolar(now);
      var dl = (g.lon - ss.lon) * Math.PI / 180;
      var el = Math.sin(ss.lat * Math.PI / 180) * Math.sin(g.lat * Math.PI / 180) +
               Math.cos(ss.lat * Math.PI / 180) * Math.cos(g.lat * Math.PI / 180) * Math.cos(dl);
      var lit = el > 0;

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="t-name"><i class="' + (s.kind === "sar" ? "sar" : "opt") + '"></i>' + s.label + "</td>" +
        "<td>" + fmt(g.lat, 2) + "°</td>" +
        "<td>" + fmt(g.lon, 2) + "°</td>" +
        "<td>" + g.altKm.toFixed(0) + "</td>" +
        "<td>" + g.speedKms.toFixed(2) + "</td>" +
        '<td><span class="lit ' + (lit ? "day" : "night") + '">' +
          (lit ? L.tracking.day : L.tracking.night) + "</span></td>";
      tb.appendChild(tr);
    });
  }

  /* ---------- 프레임 ---------- */
  function draw() {
    var cv = state.canvas;
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var rect = cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(rect.width), h = Math.round(rect.width / 2);
    if (cv.width !== w * dpr || cv.height !== h * dpr) {
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.height = h + "px";
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var now = new Date();
    drawBase(ctx, w, h, now);

    state.els.forEach(function (s) {
      var back = window.ORBIT.groundTrack(s.el, now, 35, 0, 60);
      var fwd = window.ORBIT.groundTrack(s.el, now, 0, 35, 60);
      drawTrack(ctx, w, h, fwd, false);
      drawTrack(ctx, w, h, back, true);
    });
    state.els.forEach(function (s, i) {
      var g = window.ORBIT.propagate(s.el, now);
      if (g) drawSat(ctx, w, h, g, s, i, w > 520);
    });

    renderRows(now);
    var stamp = $("#trackClock");
    if (stamp) stamp.textContent = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }

  /* ---------- 초기화 ---------- */
  function start(L) {
    state.L = L;
    state.canvas = $("#trackMap");
    if (!state.canvas || !window.ORBIT) return;

    // TLE 가 아직 없어도 바탕 지도와 주야 경계는 그린다.
    var box = $("#trackWrap"), empty = $("#trackEmpty");
    var has = state.els.length > 0;
    if (box) box.hidden = !has;
    if (empty) empty.hidden = has;

    var up = $("#trackUpdated");
    if (up && state.updated) {
      up.textContent = L.tracking.tlePrefix + " " + String(state.updated).slice(0, 10);
    }
    draw();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(draw, 1000);
  }

  function load(L) {
    var url = (window.SITE && SITE.config && SITE.config.tleUrl) || "data/tle.json";
    if (!window.fetch) { start(L); return; }
    fetch(url, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) {
        state.els = [];
        if (d && d.sats) {
          d.sats.forEach(function (s) {
            var el = window.ORBIT.parse(s.l1, s.l2);
            if (el) state.els.push({ label: s.label, kind: s.kind, el: el });
          });
          state.updated = d.updated;
        }
        start(L);
      });
  }

  function stop() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  return { load: load, start: start, stop: stop, hasData: function () { return state.els.length > 0; } };
})();
