/* =============================================================================
 *  aiwatch.js — AI 기술동향 모니터링 시각화 (외부 라이브러리 없음)
 *
 *  두 가지를 그린다.
 *    radar(L)   기술 레이더 — 도입/시험/평가/보류 네 고리에 추적 기술을 배치.
 *               고리는 순서가 있는 척도이므로 색은 한 계열의 명도 단계만 쓴다
 *               (무지개 금지). 점에는 항상 직접 라벨이 붙어 색에만 기대지 않는다.
 *    volume(d)  최근 12개월 arXiv 발표량 — 단일 계열이므로 범례 없이 면적+선,
 *               마지막 점에만 값 라벨, 나머지는 호버 툴팁이 맡는다.
 * ========================================================================== */
window.AIWATCH = (function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  // 고리 = 순서 척도 → 한 계열의 명도 단계 (성숙할수록 밝다)
  var RING_COLOR = {
    adopt: "#35dfe8",
    trial: "#2aa9c4",
    assess: "#4a7fa0",
    hold: "#5b6b7d"
  };
  var SERIES = "#35dfe8";          // 단일 계열 색
  var SURFACE = "#0c2338";         // 차트 바탕 — 마크 링/간격에 쓴다
  var GRID = "rgba(143,227,240,.16)";
  var INK = "#cfe3f2";
  var INK_MUTED = "#89a6c0";

  function svg(w, h) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("width", "100%");
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    s.setAttribute("role", "img");
    return s;
  }

  function node(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  function text(x, y, str, attrs) {
    var t = node("text", attrs || {});
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.textContent = str;
    return t;
  }

  /* ---------------- 기술 레이더 ---------------- */
  function radar(host, L) {
    if (!host) return;
    host.innerHTML = "";
    var A = L.aiwatch;
    var rings = A.rings || [];
    var tracks = A.tracks || [];
    if (!rings.length || !tracks.length) return;

    var W = 560, H = 400, cx = W * 0.5, cy = H * 0.5;
    var rMax = Math.min(cx, cy) - 26;
    var s = svg(W, H);
    s.setAttribute("aria-label", A.radarHeading);

    // 고리 — 안쪽이 도입, 바깥이 보류
    rings.forEach(function (ring, i) {
      var r = rMax * ((i + 1) / rings.length);
      s.appendChild(node("circle", {
        cx: cx, cy: cy, r: r, fill: "none",
        stroke: GRID, "stroke-width": 1
      }));
      // 라벨은 고리 꼭대기 왼쪽 — 점 라벨은 오른쪽으로 뻗으므로 서로 비킨다
      s.appendChild(text(cx - 14, cy - r + 15, ring.label, {
        "text-anchor": "end",
        fill: INK_MUTED,
        "font-size": 10,
        "font-weight": 700,
        "letter-spacing": ".08em"
      }));
    });

    // 기술 점 — 고리별 반지름 중앙, 각도는 균등 분배
    var byRing = {};
    tracks.forEach(function (t) { (byRing[t.ring] = byRing[t.ring] || []).push(t); });

    rings.forEach(function (ring, ri) {
      var list = byRing[ring.key] || [];
      var inner = rMax * (ri / rings.length);
      var outer = rMax * ((ri + 1) / rings.length);
      var r = (inner + outer) / 2;
      list.forEach(function (t, i) {
        // 고리 안에서는 360도 균등 분배, 고리마다 오프셋을 줘 서로 겹치지 않게
        var step = Math.PI * 2 / list.length;
        var a = -Math.PI / 2 + (i + 0.5) * step + ri * (Math.PI * 2 / (rings.length * 2));
        var x = cx + r * Math.cos(a);
        var y = cy + r * Math.sin(a);
        var col = RING_COLOR[ring.key] || SERIES;

        // 표면색 링 — 선 위에 겹쳐도 또렷하게
        s.appendChild(node("circle", {
          cx: x, cy: y, r: 7, fill: col, stroke: SURFACE, "stroke-width": 2
        }));
        var right = x >= cx;
        s.appendChild(text(x + (right ? 13 : -13), y + 4, t.short, {
          "text-anchor": right ? "start" : "end",
          fill: INK,
          "font-size": 11.5,
          "font-weight": 700
        }));
      });
    });

    s.appendChild(node("circle", { cx: cx, cy: cy, r: 2.5, fill: INK_MUTED }));
    host.appendChild(s);

    // 범례 — 고리 뜻풀이
    var lg = document.createElement("ul");
    lg.className = "radar-legend";
    rings.forEach(function (ring) {
      var li = document.createElement("li");
      var dot = document.createElement("i");
      dot.style.background = RING_COLOR[ring.key] || SERIES;
      li.appendChild(dot);
      var b = document.createElement("b");
      b.textContent = ring.label;
      li.appendChild(b);
      var sp = document.createElement("span");
      sp.textContent = ring.note;
      li.appendChild(sp);
      lg.appendChild(li);
    });
    host.appendChild(lg);

    // 약어 풀이 — 점 라벨이 짧으므로 전체 이름을 표로 받쳐준다
    var key = document.createElement("ul");
    key.className = "radar-key";
    tracks.forEach(function (t) {
      var li = document.createElement("li");
      var dot = document.createElement("i");
      dot.style.background = RING_COLOR[t.ring] || SERIES;
      li.appendChild(dot);
      var b = document.createElement("b");
      b.textContent = t.short;
      li.appendChild(b);
      var sp = document.createElement("span");
      sp.textContent = t.label;
      li.appendChild(sp);
      key.appendChild(li);
    });
    host.appendChild(key);
  }

  /* ---------------- 월별 발표량 ---------------- */
  function volume(host, data, L) {
    if (!host) return;
    host.innerHTML = "";
    var A = L.aiwatch;
    var raw = (data && data.volume) || [];
    var pts = raw.filter(function (p) { return typeof p.count === "number"; });
    if (pts.length < 2) {
      var p = document.createElement("p");
      p.className = "aiw-empty";
      p.textContent = A.volumeEmpty;
      host.appendChild(p);
      // 월별 추이가 없더라도 수집된 논문 수는 보여줄 수 있다
      if (data && data.count) {
        var one = document.createElement("ul");
        one.className = "aiw-stats one";
        var li = document.createElement("li");
        var b = document.createElement("b");
        b.textContent = String(data.count);
        var sp = document.createElement("span");
        sp.textContent = A.statTracked;
        li.appendChild(b); li.appendChild(sp);
        one.appendChild(li);
        host.appendChild(one);
      }
      return;
    }

    var W = 560, H = 230;
    var ml = 42, mr = 20, mt = 20, mb = 30;
    var iw = W - ml - mr, ih = H - mt - mb;
    var max = Math.max.apply(null, pts.map(function (p) { return p.count; }));
    var top = Math.max(1, Math.ceil(max / 50) * 50);

    function px(i) { return ml + (pts.length === 1 ? iw / 2 : (i / (pts.length - 1)) * iw); }
    function py(v) { return mt + ih - (v / top) * ih; }

    var s = svg(W, H);
    s.setAttribute("aria-label", A.volumeHeading);

    // 눈금 — 가늘고 뒤로 물러나게
    [0, 0.5, 1].forEach(function (f) {
      var y = mt + ih - f * ih;
      s.appendChild(node("line", {
        x1: ml, y1: y, x2: W - mr, y2: y, stroke: GRID, "stroke-width": 1
      }));
      s.appendChild(text(ml - 8, y + 4, String(Math.round(top * f)), {
        "text-anchor": "end", fill: INK_MUTED, "font-size": 10
      }));
    });

    // 면적 — 계열색 10% 수준의 옅은 워시
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + px(i) + " " + py(p.count); }).join(" ");
    s.appendChild(node("path", {
      d: d + " L" + px(pts.length - 1) + " " + (mt + ih) + " L" + px(0) + " " + (mt + ih) + " Z",
      fill: SERIES, "fill-opacity": 0.12, stroke: "none"
    }));
    s.appendChild(node("path", {
      d: d, fill: "none", stroke: SERIES, "stroke-width": 2,
      "stroke-linejoin": "round", "stroke-linecap": "round"
    }));

    // x 축 — 첫·중간·마지막만 (라벨 과밀 방지)
    [0, Math.floor((pts.length - 1) / 2), pts.length - 1].forEach(function (i) {
      s.appendChild(text(px(i), H - 10, pts[i].month.slice(2), {
        "text-anchor": i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle",
        fill: INK_MUTED, "font-size": 10
      }));
    });

    // 마지막 점만 직접 라벨 — 나머지는 툴팁이 맡는다
    var li = pts.length - 1;
    s.appendChild(node("circle", {
      cx: px(li), cy: py(pts[li].count), r: 5,
      fill: SERIES, stroke: SURFACE, "stroke-width": 2
    }));
    s.appendChild(text(px(li) - 8, py(pts[li].count) - 12, String(pts[li].count), {
      "text-anchor": "end", fill: INK, "font-size": 12, "font-weight": 700
    }));

    // 호버 — 각 달마다 넉넉한 적중 영역
    var hov = node("g", { opacity: 0 });
    var vline = node("line", { y1: mt, y2: mt + ih, stroke: SERIES, "stroke-width": 1, "stroke-opacity": .5 });
    var hdot = node("circle", { r: 5, fill: SERIES, stroke: SURFACE, "stroke-width": 2 });
    hov.appendChild(vline);
    hov.appendChild(hdot);
    s.appendChild(hov);

    var tip = document.createElement("div");
    tip.className = "aiw-tip";
    tip.hidden = true;
    host.appendChild(tip);

    pts.forEach(function (p, i) {
      var band = iw / pts.length;
      var hit = node("rect", {
        x: px(i) - band / 2, y: mt, width: band, height: ih,
        fill: "transparent"
      });
      hit.addEventListener("mouseenter", function () {
        hov.setAttribute("opacity", 1);
        vline.setAttribute("x1", px(i));
        vline.setAttribute("x2", px(i));
        hdot.setAttribute("cx", px(i));
        hdot.setAttribute("cy", py(p.count));
        tip.hidden = false;
        tip.textContent = p.month + " · " + p.count + " " + A.volumeUnit;
        tip.style.left = (px(i) / W * 100) + "%";
      });
      hit.addEventListener("mouseleave", function () {
        hov.setAttribute("opacity", 0);
        tip.hidden = true;
      });
      s.appendChild(hit);
    });

    host.appendChild(s);

    // 표 대체 — 색·호버에 기대지 않는 읽기 경로
    var det = document.createElement("details");
    det.className = "aiw-table";
    var sum = document.createElement("summary");
    sum.textContent = A.tableLabel;
    det.appendChild(sum);
    var tb = document.createElement("table");
    var head = document.createElement("tr");
    [A.tableMonth, A.tableCount].forEach(function (h) {
      var th = document.createElement("th");
      th.textContent = h;
      head.appendChild(th);
    });
    tb.appendChild(head);
    pts.forEach(function (p) {
      var tr = document.createElement("tr");
      var a = document.createElement("td"); a.textContent = p.month;
      var b = document.createElement("td"); b.textContent = p.count;
      tr.appendChild(a); tr.appendChild(b);
      tb.appendChild(tr);
    });
    det.appendChild(tb);
    host.appendChild(det);

    // 헤드라인 수치 — 한 자리 숫자 세 개는 차트가 아니라 스탯으로
    var first = pts[0].count, last = pts[pts.length - 1].count;
    var delta = first ? Math.round(((last - first) / first) * 100) : 0;
    var stats = document.createElement("ul");
    stats.className = "aiw-stats";
    [
      { v: String(last), k: A.statLatest },
      { v: (delta >= 0 ? "+" : "") + delta + "%", k: A.statDelta },
      { v: String((data && data.count) || 0), k: A.statTracked }
    ].forEach(function (row) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = row.v;
      var sp = document.createElement("span");
      sp.textContent = row.k;
      li.appendChild(b);
      li.appendChild(sp);
      stats.appendChild(li);
    });
    host.appendChild(stats);
  }

  return { radar: radar, volume: volume, ringColor: RING_COLOR };
})();
