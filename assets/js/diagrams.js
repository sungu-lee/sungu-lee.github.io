/* =============================================================================
 *  diagrams.js — 연구분야 카드용 원본 SVG 다이어그램
 *  외부 이미지 없이 코드로 그리므로 용량이 거의 0이고 확대해도 선명합니다.
 *  각 함수는 SVG 문자열을 반환하며, content.js 의 area.viz 값으로 선택됩니다.
 * ========================================================================== */
window.VIZ = (function () {
  "use strict";

  var W = 320, H = 168;
  var NAVY = "#0b2545", TEAL = "#0f7b7b", SKY = "#3a9bd5",
      LINE = "#c9d6e4", INK3 = "#7b8a99", AMBER = "#d98324", RED = "#c0453b",
      GREEN = "#2f8f5b";

  function open(extra) {
    return '<svg class="viz" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ' +
      (extra || "") + '>';
  }
  function axes(x0, y0, x1, y1, xl, yl) {
    return '<path d="M' + x0 + ' ' + y0 + ' V' + y1 + ' H' + x1 + '" fill="none" stroke="' + LINE + '" stroke-width="1.2"/>' +
      '<text x="' + x1 + '" y="' + (y1 + 13) + '" text-anchor="end" font-size="8.5" fill="' + INK3 + '">' + xl + '</text>' +
      '<text x="' + (x0 - 4) + '" y="' + (y0 + 2) + '" text-anchor="end" font-size="8.5" fill="' + INK3 + '">' + yl + '</text>';
  }

  /* 1. 복사 검보정 — 센서 응답 전달함수와 기준 타깃 */
  function calval() {
    var pts = [], i, x, y;
    for (i = 0; i <= 40; i++) {
      x = 44 + i * 6.1;
      y = 128 - 96 * (1 - Math.exp(-i / 13.5));
      pts.push((i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
    }
    var targets = "", tp = [[0.18, .04], [0.34, -.03], [0.52, .05], [0.70, -.04], [0.86, .02]];
    tp.forEach(function (t) {
      var tx = 44 + t[0] * 244, ii = t[0] * 40;
      var ty = 128 - 96 * (1 - Math.exp(-ii / 13.5)) + t[1] * 60;
      targets += '<line x1="' + tx + '" y1="' + (ty - 7) + '" x2="' + tx + '" y2="' + (ty + 7) + '" stroke="' + TEAL + '" stroke-width="1.1"/>' +
        '<rect x="' + (tx - 3) + '" y="' + (ty - 3) + '" width="6" height="6" fill="#fff" stroke="' + TEAL + '" stroke-width="1.6"/>';
    });
    return open('aria-label="센서 복사 전달함수와 기준 타깃 검증점"') +
      axes(44, 22, 300, 128, "at-sensor radiance", "DN") +
      '<path d="' + pts.join("") + '" fill="none" stroke="' + NAVY + '" stroke-width="2.2" stroke-linecap="round"/>' +
      targets +
      '<text x="300" y="34" text-anchor="end" font-size="9" fill="' + NAVY + '" font-weight="700">gain · offset</text>' +
      '<text x="300" y="45" text-anchor="end" font-size="8.5" fill="' + INK3 + '">vicarious targets</text>' +
      '</svg>';
  }

  /* 2. 다중분광 지수 — TCT 3축 + 산란 */
  function indices() {
    var cx = 132, cy = 82, cloud = "", i;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (i = 0; i < 70; i++) {
      var a = rnd() * Math.PI * 2, r = Math.pow(rnd(), 0.6) * 46;
      var px = cx + Math.cos(a) * r * 1.25, py = cy + Math.sin(a) * r * 0.62;
      var g = rnd();
      cloud += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="2" fill="' +
        (g > .62 ? GREEN : g > .3 ? TEAL : SKY) + '" opacity="' + (0.35 + g * 0.45).toFixed(2) + '"/>';
    }
    function arrow(dx, dy, col, label) {
      var ex = cx + dx, ey = cy + dy;
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '" stroke="' + col + '" stroke-width="2" marker-end="url(#ah)"/>' +
        '<text x="' + (ex + (dx > 0 ? 5 : dx < 0 ? -5 : 0)) + '" y="' + (ey + (dy < 0 ? -4 : 11)) + '" font-size="9" font-weight="700" fill="' + col + '" text-anchor="' + (dx > 0 ? "start" : dx < 0 ? "end" : "middle") + '">' + label + '</text>';
    }
    return open('aria-label="Tasseled Cap 밝기·녹색도·습윤도 3축과 화소 분포"') +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>' +
      cloud +
      arrow(74, 26, NAVY, "Brightness") +
      arrow(-6, -62, GREEN, "Greenness") +
      arrow(-80, 22, SKY, "Wetness") +
      '<text x="300" y="158" text-anchor="end" font-size="8.5" fill="' + INK3 + '">PCA → KOMPSAT-3 TCT</text>' +
      '</svg>';
  }

  /* 1-b. SAR 활용 — 측면 관측 기하와 후방산란 프로파일 */
  function sar() {
    var s = "";
    // 위성 + 측면 조사(side-looking) 빔
    s += '<g stroke="' + NAVY + '" stroke-width="1.6" fill="none">' +
      '<rect x="44" y="20" width="16" height="12" fill="' + NAVY + '"/>' +
      '<rect x="30" y="23" width="12" height="6" fill="' + SKY + '"/>' +
      '<rect x="62" y="23" width="12" height="6" fill="' + SKY + '"/></g>';
    s += '<path d="M52 34 L118 118 L176 118 Z" fill="' + TEAL + '" opacity=".13"/>' +
      '<line x1="52" y1="34" x2="118" y2="118" stroke="' + TEAL + '" stroke-width="1.2" stroke-dasharray="4 3"/>' +
      '<line x1="52" y1="34" x2="176" y2="118" stroke="' + TEAL + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
    s += '<text x="66" y="74" font-size="8.5" fill="' + TEAL + '" font-weight="700">look angle</text>';
    // 지표면
    s += '<line x1="20" y1="118" x2="300" y2="118" stroke="' + LINE + '" stroke-width="1.4"/>';
    // 지표 유형별 후방산란 막대 (σ0)
    var cells = [["water", 12, SKY], ["ice", 40, "#7fb8d8"], ["forest", 62, GREEN], ["urban", 84, NAVY]];
    cells.forEach(function (c, i) {
      var x = 196 + i * 26;
      s += '<rect x="' + x + '" y="' + (118 - c[1]) + '" width="16" height="' + c[1] + '" rx="2" fill="' + c[2] + '" opacity=".8"/>' +
        '<text x="' + (x + 8) + '" y="130" text-anchor="middle" font-size="7" fill="' + INK3 + '">' + c[0] + '</text>';
    });
    s += '<text x="300" y="26" text-anchor="end" font-size="9" font-weight="700" fill="' + NAVY + '">σ⁰ backscatter</text>' +
      '<text x="300" y="37" text-anchor="end" font-size="8.5" fill="' + INK3 + '">X-band · all-weather</text>' +
      '<text x="20" y="152" font-size="8.5" fill="' + INK3 + '">cloud · night · polar winter — optics blind, SAR sees</text>';
    return open('aria-label="SAR 측면 관측 기하와 지표 유형별 후방산란 차이"') + s + '</svg>';
  }

  /* 1-c. 융복합 활용 — 다중 플랫폼을 하나의 연속 시계열로 조화 */
  function fusion() {
    var s = "";
    var rows = [
      ["KOMPSAT-3", 30, NAVY, [0, 1, 0, 1, 1, 0, 1, 0]],
      ["KOMPSAT-3A", 52, TEAL, [1, 0, 1, 0, 0, 1, 0, 1]],
      ["KOMPSAT-5", 74, SKY, [0, 1, 1, 0, 1, 0, 0, 1]],
      ["CAS500", 96, GREEN, [1, 0, 0, 1, 0, 1, 1, 0]]
    ];
    rows.forEach(function (r) {
      s += '<text x="12" y="' + (r[1] + 3) + '" font-size="8" fill="' + INK3 + '">' + r[0] + '</text>';
      r[3].forEach(function (on, i) {
        var x = 78 + i * 15;
        s += '<rect x="' + x + '" y="' + (r[1] - 5) + '" width="10" height="10" rx="2" fill="' +
          (on ? r[2] : "#eef2f6") + '" opacity="' + (on ? ".85" : "1") + '"/>';
      });
      if (r[3].some(function (v) { return v; })) {
        s += '<path d="M198 ' + r[1] + ' C216 ' + r[1] + ' 220 128 236 128" fill="none" stroke="' + r[2] + '" stroke-width="1.1" opacity=".55"/>';
      }
    });
    // 조화된 단일 시계열
    var pts = [];
    for (var i = 0; i <= 30; i++) {
      var x = 240 + i * 2, y = 128 - 10 - Math.sin(i / 30 * Math.PI * 2) * 9;
      pts.push((i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
    }
    s += '<rect x="236" y="96" width="70" height="46" rx="6" fill="#fff" stroke="' + TEAL + '" stroke-width="1.4"/>' +
      '<path d="' + pts.join("") + '" fill="none" stroke="' + TEAL + '" stroke-width="1.8"/>' +
      '<text x="271" y="108" text-anchor="middle" font-size="8" font-weight="700" fill="' + TEAL + '">harmonized</text>';
    s += '<text x="12" y="16" font-size="8.5" fill="' + INK3 + '">acquisitions over time →</text>' +
      '<text x="12" y="158" font-size="8.5" fill="' + NAVY + '" font-weight="700">virtual constellation · one continuous series</text>';
    return open('aria-label="여러 위성의 관측을 하나의 연속 시계열로 조화하는 개념"') + s + '</svg>';
  }

  /* 3. 북극 해빙 — 계절 진동 + 감소 추세 */
  function seaice() {
    var s = [], tr = [], i, x, y, base;
    for (i = 0; i <= 96; i++) {
      x = 30 + i * 2.82;
      base = 104 - i * 0.30;
      y = base + Math.sin(i / 96 * Math.PI * 2 * 5.5) * 26;
      s.push((i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
      tr.push((i ? "L" : "M") + x.toFixed(1) + " " + base.toFixed(1));
    }
    var floes = "", f = [[46, 36, 13, 7], [72, 28, 9, 5], [104, 40, 16, 8], [140, 30, 11, 6], [176, 38, 14, 7]];
    f.forEach(function (q) {
      floes += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="' + q[2] + '" ry="' + q[3] + '" fill="#dceef8" stroke="' + SKY + '" stroke-width="1"/>';
    });
    return open('aria-label="북극 해빙 면적의 계절 변동과 장기 감소 추세"') +
      floes +
      axes(30, 14, 302, 138, "year", "extent") +
      '<path d="' + s.join("") + '" fill="none" stroke="' + SKY + '" stroke-width="1.7" opacity=".85"/>' +
      '<path d="' + tr.join("") + '" fill="none" stroke="' + RED + '" stroke-width="2" stroke-dasharray="5 4"/>' +
      '<text x="302" y="26" text-anchor="end" font-size="9" font-weight="700" fill="' + RED + '">declining trend</text>' +
      '</svg>';
  }

  /* 4. 산림 건강도 — 격자 히트맵 + 피해 군집 */
  function forest() {
    var g = "", r, c, seed = 19;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (r = 0; r < 7; r++) {
      for (c = 0; c < 15; c++) {
        var dx = c - 10.5, dy = r - 4.2;
        var dmg = Math.exp(-(dx * dx / 5.5 + dy * dy / 3.2));
        var v = Math.max(0, Math.min(1, 1 - dmg * 1.15 - rnd() * 0.12));
        var col = v > .72 ? GREEN : v > .48 ? "#7ea94f" : v > .3 ? AMBER : RED;
        g += '<rect x="' + (28 + c * 17.6) + '" y="' + (26 + r * 15.4) + '" width="16" height="13.8" rx="2" fill="' + col + '" opacity="' + (0.35 + v * 0.55).toFixed(2) + '"/>';
      }
    }
    return open('aria-label="다시기 영상 기반 산림 건강도 격자와 피해 군집 탐지"') + g +
      '<rect x="146" y="46" width="72" height="62" rx="4" fill="none" stroke="' + RED + '" stroke-width="1.8" stroke-dasharray="4 3"/>' +
      '<text x="182" y="42" text-anchor="middle" font-size="9" font-weight="700" fill="' + RED + '">damage cluster</text>' +
      '<text x="28" y="152" font-size="8.5" fill="' + INK3 + '">t₁ → t₂ → t₃  multi-temporal health index</text>' +
      '</svg>';
  }

  /* 5. 원격탐사 AI — 인코더-디코더 파이프라인 */
  function ai() {
    var b = "", enc = [[30, 52, 24, 58], [62, 60, 20, 42], [90, 68, 16, 26]];
    var dec = [[214, 68, 16, 26], [240, 60, 20, 42], [268, 52, 24, 58]];
    function blk(q, col) {
      return '<rect x="' + q[0] + '" y="' + q[1] + '" width="' + q[2] + '" height="' + q[3] + '" rx="3" fill="' + col + '" opacity=".85"/>';
    }
    enc.forEach(function (q) { b += blk(q, NAVY); });
    dec.forEach(function (q) { b += blk(q, TEAL); });
    b += '<rect x="122" y="70" width="72" height="22" rx="4" fill="#fff" stroke="' + SKY + '" stroke-width="1.6"/>' +
      '<text x="158" y="85" text-anchor="middle" font-size="9" font-weight="700" fill="' + SKY + '">latent</text>';
    // skip connections
    b += '<path d="M42 44 C100 16 220 16 278 44" fill="none" stroke="' + INK3 + '" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<path d="M72 54 C120 32 200 32 250 54" fill="none" stroke="' + INK3 + '" stroke-width="1" stroke-dasharray="3 3"/>';
    b += '<text x="30" y="126" font-size="8.5" fill="' + INK3 + '">multispectral stack</text>' +
      '<text x="292" y="126" text-anchor="end" font-size="8.5" fill="' + INK3 + '">change / class map</text>' +
      '<text x="158" y="146" text-anchor="middle" font-size="9" font-weight="700" fill="' + NAVY + '">encoder — decoder</text>';
    return open('aria-label="다중분광 입력에서 변화탐지 결과까지의 딥러닝 파이프라인"') + b + '</svg>';
  }

  /* 6. 온톨로지 — 노드-링크 지식그래프 */
  function ontology() {
    var nodes = [
      [160, 78, 17, "scene", NAVY],
      [72, 42, 12, "sensor", TEAL], [72, 118, 12, "orbit", TEAL],
      [248, 42, 12, "product", TEAL], [248, 118, 12, "AOI", TEAL],
      [160, 22, 9, "band", SKY], [160, 140, 9, "quality", SKY],
      [36, 80, 8, "cal", SKY], [286, 80, 8, "index", SKY]
    ];
    var edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [3, 8], [1, 5], [4, 8]];
    var s = "";
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + LINE + '" stroke-width="1.2"/>';
    });
    nodes.forEach(function (n, i) {
      s += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" fill="' + (i === 0 ? n[4] : "#fff") + '" stroke="' + n[4] + '" stroke-width="1.8"/>' +
        '<text x="' + n[0] + '" y="' + (n[1] + 3) + '" text-anchor="middle" font-size="' + (i === 0 ? 8.5 : 7.5) + '" font-weight="700" fill="' + (i === 0 ? "#fff" : n[4]) + '">' + n[3] + '</text>';
    });
    return open('aria-label="위성영상 메타데이터 온톨로지 지식그래프"') + s + '</svg>';
  }

  return {
    calval: calval, sar: sar, fusion: fusion, indices: indices,
    seaice: seaice, forest: forest, ai: ai, ontology: ontology
  };
})();
