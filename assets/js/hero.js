/* =============================================================================
 *  hero.js — 첫 화면 우주/위성 애니메이션 (Canvas 2D, 외부 라이브러리 없음)
 *
 *  구성:  별(시차·반짝임) → 지구 림(수평선) + 대기 글로우 + 지표 디테일
 *         → 극궤도 호 → 위성 → 관측 스캔빔 → 지상 관측 자취(ground track)
 *
 *  지오메트리: 지구를 화면 아래쪽에 중심을 둔 거대한 원으로 두고,
 *  궤도는 그 원과 동심원(반지름 = 지구반경 + 고도)으로 잡는다. 위성은 궤도
 *  꼭대기 부근을 좌→우로 통과하므로 실제 위성 패스와 같은 움직임이 된다.
 *
 *  · prefers-reduced-motion 이면 정지 화면 1프레임만 그린다
 *  · 화면 밖으로 나가거나 탭이 숨겨지면 애니메이션을 멈춘다
 * ========================================================================== */
(function () {
  "use strict";

  var cv = document.getElementById("heroCanvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");

  var W = 0, H = 0, DPR = 1;
  var stars = [], lights = [];
  var t0 = performance.now();
  var running = true;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MOBILE_PICK = ["KOMPSAT-3", "KOMPSAT-5", "KOMPSAT-7"];

  // 캔버스에 그릴 위성 편대 (content.js 의 config.fleet)
  var FLEET_ALL = (window.SITE && SITE.config && SITE.config.fleet) || [
    { label: "KOMPSAT-3", kind: "optical" },
    { label: "KOMPSAT-3A", kind: "optical-ir" },
    { label: "KOMPSAT-5", kind: "sar" },
    { label: "KOMPSAT-7", kind: "optical-hr" },
    { label: "NEONSAT", kind: "cluster" }
  ];

  function fleet() {
    if (W >= 780) return FLEET_ALL;
    var pick = FLEET_ALL.filter(function (f) { return MOBILE_PICK.indexOf(f.label) >= 0; });
    return pick.length ? pick : FLEET_ALL;
  }

  var HORIZON = 0.80;   // 지구 림이 나타나는 높이 (hero 높이 대비)
  var ALT = 0.615;      // 궤도 고도 — 편대가 상단바 아래·제목 위 띠를 지나가도록
  var PERIOD = 27000;   // 위성이 화면을 한 번 가로지르는 시간 (ms)

  function resize() {
    var r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = W * DPR;
    cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    SURF = null; SURF_KEY = "";
    seed();
  }

  function rngFactory(s) {
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function seed() {
    var rnd = rngFactory(1337);
    stars = [];
    var n = Math.max(110, Math.min(420, Math.round((W * H) / 4200)));
    for (var i = 0; i < n; i++) {
      var depth = rnd();
      stars.push({
        x: rnd() * W,
        y: rnd() * H * HORIZON,
        r: 0.35 + depth * 1.2,
        a: 0.22 + rnd() * 0.62,
        sp: 0.4 + rnd() * 1.5,
        ph: rnd() * Math.PI * 2,
        dz: 0.2 + depth * 0.8
      });
    }
    // 지표의 도시 불빛
    lights = [];
    for (var k = 0; k < 46; k++) {
      lights.push({ fx: rnd(), fy: rnd(), a: 0.25 + rnd() * 0.6, ph: rnd() * Math.PI * 2 });
    }
  }

  // 지평선 = 히어로 본문(통계 줄)의 아래 — 지표 띠가 텍스트에 겹치지 않도록
  function horizonY() {
    var st = document.getElementById("heroStats");
    if (st && cv) {
      var gap = W < 780 ? 158 : 14;   // 모바일은 편대가 지나갈 어두운 띠를 남긴다
      var y = st.getBoundingClientRect().bottom - cv.getBoundingClientRect().top + gap;
      if (y > H * 0.5 && y < H - 60) return y;
    }
    return H * HORIZON;
  }

  function geom() {
    var r = Math.max(W * 1.25, H * 1.6);          // 지구 반경(화면보다 크게)
    // 모바일에서는 본문 위를 지나가면 글씨를 가리므로, 지평선 바로 위를 낮게 통과시킨다
    var orbitTop = W < 780
      ? Math.max(H * 0.45, horizonY() - 118)
      : Math.min(H * 0.135, 200);                    // 위성 편대가 지나는 높이(px)
    return {
      cx: W * 0.42,   // 우측 콘솔 패널을 피해 왼쪽으로 치우친 궤도
      cy: r + horizonY(),                          // 림이 본문 아래에 오도록
      r: r,
      ro: r + (horizonY() - orbitTop)              // 궤도 반경
    };
  }

  // i번째 위성의 궤도상 위상 → 각도. 편대가 일정 간격으로 좌→우 통과한다.
  function satAngle(tm, i, n) {
    var G = geom();
    var span = Math.min(1.2, (W * 0.34) / G.ro);
    var base = reduced ? 0.5 : ((tm % PERIOD) / PERIOD);
    var p = (base + i / n) % 1;
    return { a: -Math.PI / 2 + (p * 2 - 1) * span, p: p };
  }

  function at(G, a) {
    return { x: G.cx + G.ro * Math.cos(a), y: G.cy + G.ro * Math.sin(a) };
  }

  /* ---------- painters ---------- */
  function paintSky() {
    var g = ctx.createLinearGradient(0, 0, W * 0.35, H);
    g.addColorStop(0, "#040a16");
    g.addColorStop(0.62, "#071428");
    g.addColorStop(1, "#0a1c33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var n = ctx.createRadialGradient(W * 0.80, H * 0.10, 0, W * 0.80, H * 0.10, Math.max(W, H) * 0.6);
    n.addColorStop(0, "rgba(30,120,160,.15)");
    n.addColorStop(1, "rgba(30,120,160,0)");
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, W, H);
  }

  function paintStars(tm) {
    ctx.fillStyle = "#dff1ff";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduced ? 1 : 0.6 + 0.4 * Math.sin(tm * 0.0011 * s.sp + s.ph);
      var dx = reduced ? 0 : Math.sin(tm * 0.00005 * s.dz) * 7 * s.dz;
      ctx.globalAlpha = s.a * tw;
      ctx.beginPath();
      ctx.arc(s.x + dx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function paintOrbit(G, a) {
    var span = Math.min(1.25, (W * 0.60) / G.ro);
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.ro, -Math.PI / 2 - span, -Math.PI / 2 + span);
    ctx.strokeStyle = "rgba(150,205,230,.24)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([6, 9]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 지나온 궤적을 밝게
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.ro, -Math.PI / 2 - span, a);
    ctx.strokeStyle = "rgba(111,216,224,.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /* ---------- 한반도 중심 지표면 ----------
     지평선 아래를 "위성에서 비스듬히 내려다본 지면" 으로 보고, 실제 해안선을
     원근 투영해 그린다. 중심 경도 127.5°E, 위도 30~52°N 구간이 화면 하단에서
     지평선까지 압축되어 한반도·일본·중국 동해안이 드러난다.
  ------------------------------------------------------------------------ */
  var LON0 = 127.5;        // 화면 중앙 경도 (한반도)
  var LAT_NEAR = 32;       // 화면 아래쪽 위도
  var LAT_FAR = 43;        // 지평선 쪽 위도
  var PK = 1.5;            // 원근 압축 계수

  function inBox(p, b) {
    return p[0] >= b.x0 && p[0] <= b.x1 && p[1] >= b.y0 && p[1] <= b.y1;
  }

  // Sutherland–Hodgman: 경위도 창으로 폴리곤을 자른다
  function clipRing(ring, b) {
    var edges = [
      function (p) { return p[0] >= b.x0; }, function (p) { return p[0] <= b.x1; },
      function (p) { return p[1] >= b.y0; }, function (p) { return p[1] <= b.y1; }
    ];
    var cut = [
      function (a, c) { return ix(a, c, 0, b.x0); }, function (a, c) { return ix(a, c, 0, b.x1); },
      function (a, c) { return ix(a, c, 1, b.y0); }, function (a, c) { return ix(a, c, 1, b.y1); }
    ];
    function ix(a, c, ax, v) {
      var t = (v - a[ax]) / ((c[ax] - a[ax]) || 1e-9);
      return ax === 0 ? [v, a[1] + t * (c[1] - a[1])] : [a[0] + t * (c[0] - a[0]), v];
    }
    var out = ring;
    for (var e = 0; e < 4 && out.length; e++) {
      var inp = out;
      out = [];
      for (var i = 0; i < inp.length; i++) {
        var cur = inp[i], prv = inp[(i + inp.length - 1) % inp.length];
        var ci = edges[e](cur), pi = edges[e](prv);
        if (ci) {
          if (!pi) out.push(cut[e](prv, cur));
          out.push(cur);
        } else if (pi) {
          out.push(cut[e](prv, cur));
        }
      }
    }
    return out;
  }

  function ground(G, lon, lat) {
    var t = (lat - LAT_NEAR) / (LAT_FAR - LAT_NEAR);
    t = Math.max(-0.45, Math.min(1.45, t));
    var p = 1 / (1 + PK * t);
    var pEnd = 1 / (1 + PK);
    var f = (p - pEnd) / (1 - pEnd);            // 1=화면 아래, 0=지평선
    var yTop = G.cy - G.r;
    var yBot = H * 1.0;
    var dl = lon - LON0;
    while (dl > 180) dl -= 360;
    while (dl < -180) dl += 360;
    return [G.cx + dl * (90 * Math.max(0.5, Math.min(1.1, W / 1360))) * p, yTop + (yBot - yTop) * f, p];
  }

  /* ---------- 지표면 ----------
     실사 위성영상(등장방형/EPSG:4326)을 basemap 으로 깔 수 있는 구조.
     SITE.config.basemap 에 파일과 경위도 범위를 지정하면 그 영상을 위도
     스트립 단위로 원근 투영해 붙이고, 없거나 로드에 실패하면 해안선 벡터
     지도로 그린다. (절차적 지형 합성은 실사와 이질감이 커서 제거)
  ------------------------------------------------------------------------ */
  var BM = (window.SITE && SITE.config && SITE.config.basemap) || null;
  var BM_IMG = null, BM_STATE = BM ? "loading" : "none";
  var SURF = null, SURF_KEY = "";

  if (BM) {
    BM_IMG = new Image();
    BM_IMG.onload = function () { BM_STATE = "ready"; SURF = null; SURF_KEY = ""; };
    BM_IMG.onerror = function () { BM_STATE = "fail"; };
    BM_IMG.src = BM.url;
  }

  function bmBox() {
    return BM
      ? { x0: BM.west, x1: BM.east, y0: BM.south, y1: BM.north }
      : { x0: LON0 - 52, x1: LON0 + 52, y0: LAT_NEAR - 14, y1: LAT_FAR + 3 };
  }

  // 실사 영상을 위도 스트립으로 잘라 원근 투영 (리사이즈 때만 갱신)
  function buildSurface(G) {
    var top = G.cy - G.r;
    var B = bmBox();
    var cvs = document.createElement("canvas");
    cvs.width = Math.max(1, Math.round(W * DPR));
    cvs.height = Math.max(1, Math.round((H - top + 4) * DPR));
    var c2 = cvs.getContext("2d");
    c2.setTransform(DPR, 0, 0, DPR, 0, 0);
    c2.imageSmoothingEnabled = true;
    c2.imageSmoothingQuality = "high";

    var iw = BM_IMG.naturalWidth, ih = BM_IMG.naturalHeight;
    var N = 180;
    for (var i = 0; i < N; i++) {
      var latA = B.y1 - (i / N) * (B.y1 - B.y0);
      var latB = B.y1 - ((i + 1) / N) * (B.y1 - B.y0);
      var latM = (latA + latB) / 2;
      var yA = ground(G, LON0, latA)[1] - top;
      var yB = ground(G, LON0, latB)[1] - top;
      if (yB <= yA) continue;
      if (yA > H - top + 4) break;
      var xL = ground(G, B.x0, latM)[0], xR = ground(G, B.x1, latM)[0];
      var sy = (B.y1 - latA) / (B.y1 - B.y0) * ih;
      var sh2 = Math.max(0.5, (latA - latB) / (B.y1 - B.y0) * ih);
      c2.drawImage(BM_IMG, 0, sy, iw, sh2, xL, yA, xR - xL, yB - yA + 1);
    }
    SURF = cvs;
    SURF_KEY = W + "x" + H + "x" + Math.round(top);
  }

  /* basemap(실사 영상)이 없을 때의 지도.
     Natural Earth 10m 동아시아 발췌(assets/js/coast-ea.js)를 쓰고, 색과 선은
     아래 실시간 위치 지도(tracker.js)와 같은 계열로 맞춘다. */
  var MAPCOL = {
    landNear: "#27709b",
    landFar: "#1a5378",
    edge: "rgba(160,235,255,.45)",
    grid: "rgba(160,235,255,.10)"
  };

  function coastData() {
    if (window.COAST_EA && window.COAST_EA.length) {
      return { rings: window.COAST_EA, box: window.COAST_EA_BOX, hi: true };
    }
    return { rings: window.WORLD_LAND || [], box: { west: LON0 - 52, east: LON0 + 52, south: LAT_NEAR - 14, north: LAT_FAR + 3 }, hi: false };
  }

  function paintVectorLand(G, top) {
    var C = coastData();
    if (!C.rings.length) return;
    var box = { x0: C.box.west, x1: C.box.east, y0: C.box.south, y1: C.box.north };

    var lg = ctx.createLinearGradient(0, top, 0, H);
    lg.addColorStop(0, MAPCOL.landFar);
    lg.addColorStop(1, MAPCOL.landNear);

    ctx.beginPath();
    for (var i = 0; i < C.rings.length; i++) {
      var poly = C.hi ? C.rings[i] : clipRing(C.rings[i], box);
      if (poly.length < 3) continue;
      for (var k = 0; k < poly.length; k++) {
        var q = ground(G, poly[k][0], poly[k][1]);
        if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      }
      ctx.closePath();
    }
    ctx.fillStyle = lg;
    ctx.fill("evenodd");
    ctx.strokeStyle = MAPCOL.edge;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function paintEarth(G, tm) {
    var top = G.cy - G.r;

    // 대기 글로우
    var glow = ctx.createRadialGradient(G.cx, G.cy, G.r * 0.998, G.cx, G.cy, G.r + H * 0.16);
    glow.addColorStop(0, "rgba(120,215,240,.5)");
    glow.addColorStop(0.35, "rgba(85,180,222,.2)");
    glow.addColorStop(1, "rgba(70,170,215,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.r + H * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.r, 0, Math.PI * 2);
    ctx.clip();

    // 바다 바탕
    var sea = ctx.createLinearGradient(0, top, 0, H);
    sea.addColorStop(0, "#13405f");
    sea.addColorStop(0.3, "#0e3050");
    sea.addColorStop(1, "#08243c");
    ctx.fillStyle = sea;
    ctx.fillRect(0, top, W, H - top);

    if (BM_STATE === "ready") {
      if (SURF_KEY !== W + "x" + H + "x" + Math.round(top)) buildSurface(G);
      if (SURF) ctx.drawImage(SURF, 0, 0, W, SURF.height / DPR, 0, top, W, SURF.height / DPR);
    } else {
      paintVectorLand(G, top);
    }

    // 경위선
    ctx.strokeStyle = MAPCOL.grid;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (var la = LAT_NEAR - 10; la <= LAT_FAR; la += 3) {
      var p0 = ground(G, LON0 - 44, la), p1 = ground(G, LON0 + 44, la);
      ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
    }
    for (var lo = LON0 - 44; lo <= LON0 + 44; lo += 4) {
      var q0 = ground(G, lo, LAT_NEAR - 10), q1 = ground(G, lo, LAT_FAR);
      ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]);
    }
    ctx.stroke();

    // 대기 산란 — 지평선으로 갈수록 푸르게
    var haze = ctx.createLinearGradient(0, top, 0, top + (H - top) * 0.6);
    haze.addColorStop(0, "rgba(150,205,235,.5)");
    haze.addColorStop(0.35, "rgba(120,180,220,.16)");
    haze.addColorStop(1, "rgba(110,170,215,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, top, W, (H - top) * 0.6);

    // 도시 불빛
    var cities = [[126.98, 37.57], [129.08, 35.18], [128.60, 35.87], [127.38, 36.35],
                  [126.85, 35.16], [125.75, 39.03], [139.69, 35.69], [135.50, 34.69],
                  [121.47, 31.23], [116.41, 39.90]];
    for (var m2 = 0; m2 < cities.length; m2++) {
      var cp = ground(G, cities[m2][0], cities[m2][1]);
      var fl = reduced ? 0.7 : 0.5 + 0.35 * Math.sin(tm * 0.0018 + m2);
      ctx.globalAlpha = Math.min(1, cp[2] * 2.1) * fl * 0.6;
      ctx.fillStyle = "#ffe0ae";
      ctx.beginPath();
      ctx.arc(cp[0], cp[1], 1.3 + cp[2] * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 한반도 표식
    if (W > 340) {
      var kp = ground(G, 127.6, 37.2);
      ctx.font = "700 " + (W < 780 ? 10 : 12) + "px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(235,250,255,.95)";
      ctx.shadowColor = "rgba(3,12,24,.9)";
      ctx.shadowBlur = 6;
      if (W < 780) {
        ctx.textAlign = "center";
        ctx.fillText("KOREAN PENINSULA", kp[0], kp[1] - 54);
      } else {
        ctx.beginPath();
        ctx.moveTo(kp[0] - 18, kp[1]);
        ctx.lineTo(kp[0] - 92, kp[1]);
        ctx.strokeStyle = "rgba(235,250,255,.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText("KOREAN PENINSULA", kp[0] - 98, kp[1] + 4);
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // 림 라이트
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.r, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.strokeStyle = "rgba(185,240,255,.95)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  function paintTrack(G, a) {
    // 이미 관측한 지상 자취
    var span = Math.min(1.25, (W * 0.60) / G.ro);
    ctx.beginPath();
    ctx.arc(G.cx, G.cy, G.r - 2, -Math.PI / 2 - span, a);
    ctx.strokeStyle = "rgba(111,216,224,.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /* ---------- 관측 빔 ----------
     광학(KOMPSAT-3/3A/7, NEONSAT): 지표에서 올라오는 반사광을 관측 밴드별로
       분해해 B(450–520) · G(520–600) · R(630–690) · NIR(760–900) 네 갈래로 그린다.
       NIR 은 비가시광이므로 관례대로 심홍색으로 표기한다.
     SAR(KOMPSAT-5): 측면 지향(side-looking)으로 X-밴드 편파 전파를 송신하고
       산란된 신호를 수신하는 모습 — 송신(V 편파)·수신(HH/HV) 파형을 함께 표시.
  ------------------------------------------------------------------------ */
  var BANDS = [
    { n: "B",   c: "80,150,255",  w: "450–520" },
    { n: "G",   c: "70,220,140",  w: "520–600" },
    { n: "R",   c: "255,95,95",   w: "630–690" },
    { n: "NIR", c: "210,90,235",  w: "760–900" }
  ];

  // 위성 아래 지표의 관측 지점 (한반도 부근)
  // 관측 지점 — 한반도 상공. 위성 위치에 따라 좌우로 조금씩 이동한다.
  function target(G, S, side) {
    var q = ground(G, LON0 + (side || 0), 36.6);
    return { x: q[0] + (S.x - G.cx) * 0.06, y: q[1] };
  }

  function paintOpticalBeam(G, S, tm) {
    var T = target(G, S, 0);
    var half = Math.max(20, W * 0.021);
    var pulse = reduced ? 0.75 : 0.62 + 0.3 * Math.sin(tm * 0.0038);

    for (var k = 0; k < 4; k++) {
      var x0 = T.x - half + (2 * half) * (k / 4);
      var x1 = T.x - half + (2 * half) * ((k + 1) / 4);
      var ax = S.x + (k - 1.5) * 3;                  // 초점면에서 밴드별 분리
      var g = ctx.createLinearGradient(ax, S.y, (x0 + x1) / 2, T.y);
      g.addColorStop(0, "rgba(" + BANDS[k].c + ",.55)");
      g.addColorStop(0.16, "rgba(" + BANDS[k].c + ",.16)");
      g.addColorStop(0.55, "rgba(" + BANDS[k].c + ",.02)");
      g.addColorStop(0.9, "rgba(" + BANDS[k].c + ",.20)");
      g.addColorStop(1, "rgba(" + BANDS[k].c + ",.42)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ax - 4.5, S.y);
      ctx.lineTo(x0, T.y);
      ctx.lineTo(x1, T.y);
      ctx.lineTo(ax + 4.5, S.y);
      ctx.closePath();
      ctx.fill();

      // 지표 → 위성으로 올라오는 반사광 마커
      if (!reduced) {
        var q = (tm * 0.00022 + k * 0.25) % 1;
        var mx = (x0 + x1) / 2 + (ax - (x0 + x1) / 2) * q;
        var my = T.y + (S.y - T.y) * q;
        ctx.globalAlpha = Math.sin(Math.PI * q) * 0.9;
        ctx.fillStyle = "rgba(" + BANDS[k].c + ",1)";
        ctx.beginPath();
        ctx.arc(mx, my, 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // 관측 풋프린트 — 밴드별 띠
    ctx.globalAlpha = pulse;
    for (var b = 0; b < 4; b++) {
      ctx.fillStyle = "rgba(" + BANDS[b].c + ",.55)";
      ctx.fillRect(T.x - half + (2 * half) * (b / 4), T.y - 3, (2 * half) / 4 - 1.5, 6);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(200,245,255,.75)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(T.x, T.y, half * 1.02, half * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (W > 900) {
      ctx.font = "700 9px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      for (var t = 0; t < 4; t++) {
        ctx.fillStyle = "rgba(" + BANDS[t].c + ",.95)";
        ctx.fillText(BANDS[t].n, T.x - half + (2 * half) * ((t + 0.5) / 4), T.y + 18);
      }
      ctx.textAlign = "left";
    }
  }

  /* SAR — X-band 펄스가 아래로 퍼져 나가 지표를 때리고, 후방산란 신호가
     안테나로 되돌아오는 한 주기를 반복한다.
       송신: 안테나를 중심으로 하는 구면 파면(호)이 아래로 확장 — 주황, 실선, V 편파
       수신: 지표 산란점을 중심으로 하는 파면이 위로 확장 — 청록, 파선, HH/HV
     왕복 주기를 눈으로 셀 수 있도록 레인지 게이트 표시와 지표 반짝임을 넣었다. */
  /* SAR — X-band 펄스가 지표로 내려가 산란하고, 그 신호가 안테나로 되돌아오는
     왕복을 반복한다. 파면은 지표 위 구간에서 왕복하도록 두어 실제로 오가는 것이
     눈에 보이고, 안테나 쪽에서는 송신/수신 순간에 맞춰 짧게 점멸한다.
       송신  주황 실선 구면파 · V 편파 (아래로)
       수신  청록 파선 구면파 · HH/HV  (위로) */
  function paintSarBeam(G, S, tm) {
    var T = target(G, S, 6.2);
    var dx = T.x - S.x, dy = T.y - S.y;
    var L = Math.hypot(dx, dy) || 1;
    var ux = dx / L, uy = dy / L;
    var nx = -uy, ny = ux;
    var half = Math.max(30, W * 0.042);
    var AMB = "255,170,74", CY = "108,232,238";
    var ax = Math.atan2(uy, ux);
    var alpha = Math.atan2(half, L);

    // 조사 영역 (레인지 스와스) — 중간 구간은 거의 투명해 본문을 가리지 않는다
    var g = ctx.createLinearGradient(S.x, S.y, T.x, T.y);
    g.addColorStop(0, "rgba(" + AMB + ",.30)");
    g.addColorStop(0.16, "rgba(" + AMB + ",.08)");
    g.addColorStop(0.6, "rgba(" + AMB + ",.02)");
    g.addColorStop(1, "rgba(" + AMB + ",.17)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(S.x, S.y);
    ctx.lineTo(T.x + nx * half, T.y + ny * half);
    ctx.lineTo(T.x - nx * half, T.y - ny * half);
    ctx.closePath();
    ctx.fill();

    var CYCLE = 3000;
    var ph = reduced ? 0.34 : (tm % CYCLE) / CYCLE;
    var going = ph < 0.5;
    var u = going ? ph * 2 : (ph - 0.5) * 2;

    // 파면이 오가는 구간 — 지표 위 seg 픽셀
    var seg = Math.max(165, Math.min(L * 0.7, (H - (G.cy - G.r)) + 70));
    var d0 = L - seg;                       // 구간 시작(축 방향 거리)

    function arcAt(d, col, fade, dash, wide, centreGround) {
      if (fade <= 0.02) return;
      ctx.lineWidth = wide;
      ctx.strokeStyle = "rgba(" + col + "," + fade.toFixed(3) + ")";
      ctx.setLineDash(dash);
      ctx.beginPath();
      if (centreGround) ctx.arc(T.x, T.y, L - d, ax + Math.PI - alpha * 1.5, ax + Math.PI + alpha * 1.5);
      else ctx.arc(S.x, S.y, d, ax - alpha, ax + alpha);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (var k = 0; k < 6; k++) {
      var f = u - k * 0.14;
      if (f <= 0 || f >= 1) continue;
      var fade = (1 - k * 0.13) * Math.min(1, Math.sin(Math.PI * f) * 2.1);
      var d = going ? d0 + f * seg : L - f * seg;
      arcAt(d, going ? AMB : CY, fade, going ? [] : [9, 6], k === 0 ? 3 : 2.1);

      // 편파 눈금 — 선두 파면에만 (V: 진행방향과 직각인 면)
      if (k === 0 && going) {
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = "rgba(" + AMB + "," + (fade * 0.9).toFixed(3) + ")";
        for (var v = -1; v <= 1; v++) {
          var av = ax + alpha * v * 0.7;
          var qx = S.x + Math.cos(av) * d, qy = S.y + Math.sin(av) * d;
          ctx.beginPath();
          ctx.moveTo(qx - Math.cos(av) * 5.5, qy - Math.sin(av) * 5.5);
          ctx.lineTo(qx + Math.cos(av) * 5.5, qy + Math.sin(av) * 5.5);
          ctx.stroke();
        }
      }
    }

    // 안테나 — 송신 직후/수신 직전에 점멸하는 작은 구면파
    var emit = going ? Math.max(0, 1 - u * 5) : Math.max(0, 1 - (1 - u) * 5);
    if (emit > 0.02) {
      for (var e = 0; e < 3; e++) {
        var er = 10 + e * 9 + (1 - emit) * 26;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(" + (going ? AMB : CY) + "," + (emit * (0.75 - e * 0.2)).toFixed(3) + ")";
        ctx.setLineDash(going ? [] : [6, 4]);
        ctx.beginPath();
        ctx.arc(S.x, S.y, er, ax - alpha * 3.2, ax + alpha * 3.2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 지표 산란 — 펄스가 닿는 순간 반짝인다
    var hit = Math.max(0, 1 - Math.abs(ph - 0.5) * 10);
    ctx.strokeStyle = "rgba(" + AMB + "," + (0.5 + hit * 0.5).toFixed(3) + ")";
    ctx.lineWidth = 1.6 + hit * 2.4;
    ctx.beginPath();
    ctx.ellipse(T.x, T.y, half * 1.1 + hit * 8, half * 0.23 + hit * 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (hit > 0.04) {
      ctx.globalAlpha = hit * 0.55;
      ctx.fillStyle = "rgba(255,228,186,1)";
      ctx.beginPath();
      ctx.ellipse(T.x, T.y, half * 1.1, half * 0.23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (W > 900) {
      ctx.font = "700 10px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(" + (going ? AMB : CY) + ",.95)";
      ctx.fillText(going ? "TX ▼  V-pol" : "RX ▲  HH · HV",
                   S.x + ux * 52 + nx * 26, S.y + uy * 52 + ny * 26);
      ctx.fillStyle = "rgba(200,228,242,.72)";
      ctx.font = "600 9px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("X-BAND SAR  ·  9.66 GHz", T.x, T.y + 20);
      ctx.textAlign = "left";
    }
  }

  // 빔은 "위성 바로 아래" 와 "지표 바로 위" 두 구간에만 렌더링한다.
  // (본문 텍스트 위를 긴 띠가 가로지르지 않도록)
  function inZones(G, S, draw) {
    var gTop = G.cy - G.r;
    if (gTop - S.y < 430) { draw(); return; }   // 짧은 빔(모바일)은 통째로
    var zones = [[S.y - 30, S.y + Math.min(150, (gTop - S.y) * 0.26)],
                 [gTop - 120, H + 40]];
    for (var z = 0; z < zones.length; z++) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-40, zones[z][0], W + 80, zones[z][1] - zones[z][0]);
      ctx.clip();
      draw();
      ctx.restore();
    }
  }

  function paintBeam(G, S, a, tm, kind) {
    if (kind === "sar") paintSarBeam(G, S, tm);
    else inZones(G, S, function () { paintOpticalBeam(G, S, tm); });
  }

  /* ---------- 위성 편대 ----------
     로컬 좌표계: +y = 지구 방향(nadir), +x = 진행 방향.
     실제 형상 특징을 반영한 원본 도해입니다(사진 복제 아님).
       optical      KOMPSAT-3   광학 버스 + 양날개 전지판 + 나디르 망원경
       optical-ir   KOMPSAT-3A  광학 + 적외선 모듈(경통 옆 소형 센서)
       optical-hr   KOMPSAT-7   대구경 망원경 + 대형 전지판
       sar          KOMPSAT-5   측면 지향 평면 SAR 안테나 + 단일 전지판
       cluster      NEONSAT     초소형 위성 군집(3기)
  ------------------------------------------------------------------------ */

  function wing(x, y, w, h, cells) {
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#3d92bd");
    g.addColorStop(1, "#1d5c80");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(205,240,255,.55)";
    ctx.lineWidth = 0.7;
    ctx.strokeRect(x, y, w, h);
    for (var i = 1; i < cells; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (i * w) / cells, y);
      ctx.lineTo(x + (i * w) / cells, y + h);
      ctx.stroke();
    }
  }

  function bus(w, h) {
    var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, "#f4fbff");
    g.addColorStop(1, "#b9d3e2");
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(10,28,51,.35)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = "rgba(10,28,51,.18)";
    ctx.fillRect(-w / 2, -h / 2 + h * 0.28, w, 1.8);
    ctx.fillRect(-w / 2, -h / 2 + h * 0.66, w, 1.8);
  }

  function telescope(w, len, aperture) {
    ctx.fillStyle = "#dceaf4";
    ctx.fillRect(-w / 2, 0, w, len);
    ctx.strokeStyle = "rgba(10,28,51,.35)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-w / 2, 0, w, len);
    ctx.fillStyle = "#0a1c33";
    ctx.beginPath();
    ctx.ellipse(0, len, aperture, aperture * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8fe3f0";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function antenna(top) {
    ctx.strokeStyle = "#eef8fc";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, top); ctx.lineTo(0, top - 7);
    ctx.moveTo(-3.4, top - 7); ctx.lineTo(3.4, top - 7);
    ctx.stroke();
  }

  function drawOptical(kind) {
    var big = kind === "optical-hr";
    var ww = big ? 28 : 24, wh = big ? 13 : 11;
    wing(-12 - ww, -wh / 2, ww, wh, 3);
    wing(12, -wh / 2, ww, wh, 3);
    ctx.strokeStyle = "#cfe6f2"; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-12, 0); ctx.lineTo(-9, 0);
    ctx.moveTo(9, 0); ctx.lineTo(12, 0);
    ctx.stroke();

    bus(big ? 22 : 18, big ? 24 : 22);
    telescope(big ? 13 : 11, big ? 15 : 11, big ? 6.5 : 5.5);

    if (kind === "optical-ir") {           // KOMPSAT-3A 적외선 모듈
      ctx.fillStyle = "#e8a55a";
      ctx.fillRect(7, 9, 6, 7);
      ctx.strokeStyle = "rgba(10,28,51,.35)";
      ctx.strokeRect(7, 9, 6, 7);
    }
    antenna(big ? -12 : -11);
  }

  function drawSar() {
    // 측면 지향 평면 SAR 안테나 (진행 방향으로 길고, 지구 쪽으로 기울어짐)
    ctx.save();
    ctx.rotate(0.42);
    var g = ctx.createLinearGradient(-26, 2, 26, 12);
    g.addColorStop(0, "#9fc4d8");
    g.addColorStop(1, "#5d8ea8");
    ctx.fillStyle = g;
    ctx.fillRect(-26, 3, 52, 8);
    ctx.strokeStyle = "rgba(230,248,255,.7)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-26, 3, 52, 8);
    for (var i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-26 + i * (52 / 6), 3);
      ctx.lineTo(-26 + i * (52 / 6), 11);
      ctx.stroke();
    }
    ctx.restore();

    wing(-34, -6, 22, 12, 3);            // 단일 전지판 (한쪽)
    ctx.strokeStyle = "#cfe6f2"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-9, 0); ctx.stroke();

    bus(17, 20);
    antenna(-10);
  }

  function drawCluster() {
    // 초소형 위성 3기 군집
    var pos = [[0, 0], [-15, 9], [14, 8]];
    for (var i = 0; i < pos.length; i++) {
      ctx.save();
      ctx.translate(pos[i][0], pos[i][1]);
      var sc = i === 0 ? 1 : 0.8;
      ctx.scale(sc, sc);
      wing(-14, -2.6, 8, 5.2, 2);
      wing(6, -2.6, 8, 5.2, 2);
      ctx.fillStyle = "#eef8fc";
      ctx.fillRect(-5, -5, 10, 10);
      ctx.strokeStyle = "rgba(10,28,51,.35)";
      ctx.lineWidth = 0.7;
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.fillStyle = "#2f7fa8";
      ctx.fillRect(-3, 5, 6, 3);
      ctx.restore();
    }
  }

  function paintSat(S, ang, sat, sc) {
    ctx.save();
    ctx.translate(S.x, S.y);
    ctx.rotate(ang);            // ang = 궤도 접선각 = 로컬 +y 가 나디르를 향하는 각
    ctx.scale(sc, sc);
    if (sat.kind === "sar") drawSar();
    else if (sat.kind === "cluster") drawCluster();
    else drawOptical(sat.kind);
    ctx.restore();

    var gl = ctx.createRadialGradient(S.x, S.y, 0, S.x, S.y, 36 * sc);
    gl.addColorStop(0, "rgba(160,235,255,.22)");
    gl.addColorStop(1, "rgba(160,235,255,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(S.x, S.y, 36 * sc, 0, Math.PI * 2);
    ctx.fill();
  }

  function paintLabel(S, sat, sc, strong) {
    var dy = 30 * sc;
    ctx.textAlign = "center";
    ctx.font = (strong ? "700 11.5px " : "600 10px ") +
      "system-ui, -apple-system, 'Segoe UI', sans-serif";
    ctx.fillStyle = strong ? "#8fe3f0" : "rgba(143,227,240,.62)";
    ctx.fillText(sat.label, S.x, S.y - dy);
    if (strong && sat.sub) {
      ctx.font = "10px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(160,195,220,.8)";
      ctx.fillText(sat.sub, S.x, S.y - dy + 13);
    }
    ctx.textAlign = "left";
  }

  /* ---------- frame ---------- */
  function frame(now) {
    var tm = now - t0;
    var G = geom();
    var FLEET = fleet();
    var n = FLEET.length;

    // 편대 각 위성의 위치를 먼저 계산 (가장 天頂에 가까운 위성이 관측 중)
    var sats = [], featured = 0, best = 9;
    for (var i = 0; i < n; i++) {
      var ph = satAngle(tm, i, n);
      var S = at(G, ph.a);
      var S2 = at(G, ph.a + 0.02);
      sats.push({ a: ph.a, p: ph.p, S: S, ang: Math.atan2(S2.y - S.y, S2.x - S.x), sat: FLEET[i] });
      var d = Math.abs(ph.p - 0.5);
      if (d < best) { best = d; featured = i; }
    }

    paintSky();
    paintStars(tm);
    paintOrbit(G, sats[featured].a);
    paintEarth(G, tm);
    paintTrack(G, sats[featured].a);
    // 광학(B·G·R·NIR)과 SAR(편파) 빔을 항상 한 쌍씩 보여준다
    var fk = sats[featured].sat.kind === "sar";
    var other = -1, ob = 9;
    for (var o = 0; o < sats.length; o++) {
      if ((sats[o].sat.kind === "sar") === fk) continue;
      var od = Math.abs(sats[o].p - 0.5);
      if (od < ob) { ob = od; other = o; }
    }
    paintBeam(G, sats[featured].S, sats[featured].a, tm, sats[featured].sat.kind);
    if (other >= 0) paintBeam(G, sats[other].S, sats[other].a, tm, sats[other].sat.kind);

    var sc = W < 780 ? 0.72 : Math.max(0.72, Math.min(1.08, W / 1250));
    var labelAll = W > 980;
    for (var k = 0; k < n; k++) {
      paintSat(sats[k].S, sats[k].ang, sats[k].sat, sc);
    }
    if (W > 560) {
      for (var m = 0; m < n; m++) {
        if (labelAll || m === featured) paintLabel(sats[m].S, sats[m].sat, sc, m === featured);
      }
    }

    // 하단 페이드 — 본문(밝은 톤)과 자연스럽게 연결
    var f = ctx.createLinearGradient(0, H - 150, 0, H);
    f.addColorStop(0, "rgba(6,15,30,0)");
    f.addColorStop(1, "rgba(6,15,30,.92)");
    ctx.fillStyle = f;
    ctx.fillRect(0, H - 150, W, 150);

    if (running && !reduced) requestAnimationFrame(frame);
  }

  /* ---------- lifecycle ---------- */
  function start() {
    if (reduced) { frame(performance.now()); return; }
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  resize();
  requestAnimationFrame(frame);

  var rt;
  // 히어로 높이는 main.js 가 본문을 렌더한 뒤에 확정되므로 캔버스 크기를 관찰한다
  if (window.ResizeObserver) {
    var ro2 = new ResizeObserver(function () {
      var r2 = cv.getBoundingClientRect();
      if (Math.abs(r2.width - W) > 1 || Math.abs(r2.height - H) > 1) {
        resize();
        if (reduced) frame(performance.now());
      }
    });
    ro2.observe(cv);
  } else {
    setTimeout(function () { resize(); if (reduced) frame(performance.now()); }, 400);
  }

  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (reduced) frame(performance.now()); }, 160);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) start(); else running = false; });
    }, { threshold: 0.02 }).observe(cv);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) running = false; else start();
  });
})();
