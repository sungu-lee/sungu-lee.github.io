/* =============================================================================
 *  main.js — content.js 의 데이터를 읽어 페이지를 렌더링합니다.
 *  콘텐츠를 바꿀 때 이 파일은 수정할 필요가 없습니다.
 * ========================================================================== */
(function () {
  "use strict";

  var LANG_KEY = "sgl-site-lang";
  var state = { lang: null, pubTab: "papers", trends: null, tick: null, trackerLoaded: false };

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function get(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return (o === null || o === undefined) ? undefined : o[k];
    }, obj);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  function initialLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "ko" || saved === "en") return saved;
    } catch (e) { /* storage 차단 환경 무시 */ }
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "ko" || q === "en") return q;
    // 브라우저 언어로 추측하지 않는다 — 기본 언어는 config.defaultLang 이 정한다.
    return SITE.config.defaultLang || "en";
  }

  /* ---------- section renderers ---------- */

  function renderText(L) {
    $$("[data-bind]").forEach(function (node) {
      var v = get(L, node.getAttribute("data-bind"));
      if (v === undefined || v === null || v === "") {
        if (node.getAttribute("data-bind") !== "brand") node.style.display = "none";
      } else {
        node.style.display = "";
        node.textContent = v;
      }
    });
    $("[data-bind='brand']").style.display = "";
    $("[data-bind='brand']").textContent = state.lang === "ko" ? "이선구" : "Sun-Gu Lee";
    document.title = L.meta.title;
    var desc = $("meta[name='description']");
    if (desc) desc.setAttribute("content", L.meta.description);
    document.documentElement.lang = state.lang;
  }

  function renderNav(L) {
    var nav = $("#nav");
    clear(nav);
    Object.keys(L.nav).forEach(function (key) {
      var a = el("a", null, L.nav[key]);
      // apps 는 별도 페이지, 나머지는 같은 문서 안의 섹션
      a.href = key === "apps" ? "applications.html" : "#" + key;
      if (key === "apps") a.className = "nav-ext";
      nav.appendChild(a);
    });
  }

  function renderHero(L) {
    var roles = $("#heroRoles");
    clear(roles);
    L.hero.roles.forEach(function (r) { roles.appendChild(el("li", null, r)); });

    var cta = $("#heroCta");
    clear(cta);
    L.hero.cta.forEach(function (c) {
      var a = el("a", "btn" + (c.ghost ? " ghost" : ""), c.label);
      a.href = c.href;
      cta.appendChild(a);
    });

    var stats = $("#heroStats");
    clear(stats);
    L.hero.stats.forEach(function (s) {
      var li = el("li");
      li.appendChild(el("b", null, s.value));
      li.appendChild(el("span", null, s.label));
      stats.appendChild(li);
    });

    renderConsole(L);
  }

  /* ---------- 실시간 위치 지도 ---------- */
  function renderTracking(L) {
    var head = $("#trackHead");
    if (!head) return;
    clear(head);
    (L.tracking.cols || []).forEach(function (c) { head.appendChild(el("th", null, c)); });
    var empty = $("#trackEmpty");
    if (empty) empty.textContent = L.tracking.emptyBody;
    if (window.TRACKER) {
      if (state.trackerLoaded) window.TRACKER.start(L);
      else { state.trackerLoaded = true; window.TRACKER.load(L); }
    }
  }

  /* ---------- KOMPSAT-3 관측·처리 콘솔 (개념 시연) ----------
     실제 위성 텔레메트리가 아니라 연구 처리 흐름을 시각화한 패널입니다. */
  function renderConsole(L) {
    var box = $("#console");
    clear(box);
    if (state.tick) { clearInterval(state.tick); state.tick = null; }

    var c = L.hero.console, h = L.hero.hud;
    if (!c) { box.style.display = "none"; return; }
    box.style.display = "";

    // 헤더
    var head = el("div", "cs-head");
    var ttl = el("div", "cs-title");
    ttl.appendChild(el("span", "cs-dot"));
    ttl.appendChild(el("strong", null, c.title));
    head.appendChild(ttl);
    head.appendChild(el("span", "cs-status", c.status));
    box.appendChild(head);
    if (h) box.appendChild(el("p", "cs-sub", h.title + " · " + h.rows[0].v));

    // 분광 밴드 응답
    box.appendChild(el("h3", "cs-label", c.bandHeading));
    var bandBox = el("div", "cs-bands");
    var bars = [];
    c.bands.forEach(function (b) {
      var row = el("div", "cs-band");
      row.appendChild(el("span", "cs-bk", b.k));
      row.appendChild(el("span", "cs-bn", b.nm));
      var track = el("span", "cs-track");
      var fill = el("i");
      track.appendChild(fill);
      row.appendChild(track);
      var val = el("span", "cs-bv", "—");
      row.appendChild(val);
      bandBox.appendChild(row);
      bars.push({ fill: fill, val: val, v: 35 + Math.random() * 45 });
    });
    box.appendChild(bandBox);

    // 처리 단계
    box.appendChild(el("h3", "cs-label", c.stageHeading));
    var list = el("ol", "cs-stages");
    var items = c.stages.map(function (s) {
      var li = el("li");
      li.appendChild(el("span", "cs-mark"));
      li.appendChild(el("span", "cs-txt", s));
      list.appendChild(li);
      return li;
    });
    box.appendChild(list);

    // 화면에 그려지는 위성 편대
    var fleet = SITE.config.fleet || [];
    if (fleet.length && c.fleetHeading) {
      box.appendChild(el("h3", "cs-label", c.fleetHeading));
      var fl = el("ul", "cs-fleet");
      fleet.forEach(function (f) {
        var li = el("li");
        li.appendChild(el("b", null, f.label));
        if (f.sub) li.appendChild(el("span", null, f.sub));
        fl.appendChild(li);
      });
      box.appendChild(fl);
    }

    // 제원 + 고지
    if (h) {
      var dl = el("dl", "cs-specs");
      h.rows.slice(2).forEach(function (r) {
        var row = el("div");
        row.appendChild(el("dt", null, r.k));
        row.appendChild(el("dd", null, r.v));
        dl.appendChild(row);
      });
      box.appendChild(dl);
    }
    box.appendChild(el("p", "cs-note", c.note));

    // 애니메이션 — 밴드 응답 요동 + 처리 단계 진행
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var step = 0;

    function paint() {
      bars.forEach(function (b) {
        if (!reduced) {
          b.v += (Math.random() - 0.5) * 16;
          b.v = Math.max(28, Math.min(97, b.v));
        }
        b.fill.style.width = b.v.toFixed(0) + "%";
        b.val.textContent = b.v.toFixed(0);
      });
      items.forEach(function (li, i) {
        li.className = i < step ? "done" : (i === step ? "active" : "");
      });
      step = (step + 1) % (items.length + 1);
    }

    paint();
    if (!reduced) state.tick = setInterval(paint, 1500);
  }

  function timelineBlock(title, items) {
    if (!items || !items.length) return null;
    var box = document.createDocumentFragment();
    box.appendChild(el("h3", null, title));
    var ul = el("ul", "timeline");
    items.forEach(function (it) {
      var li = el("li");
      li.appendChild(el("div", "t-period", it.period));
      li.appendChild(el("div", "t-title", it.title));
      li.appendChild(el("div", "t-org", it.org));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  function renderAbout(L) {
    var body = $("#aboutBody");
    clear(body);
    L.about.paragraphs.forEach(function (p) { body.appendChild(el("p", null, p)); });

    var career = $("#careerBlock");
    clear(career);
    var cb = timelineBlock(L.about.careerHeading, L.about.career);
    if (cb) career.appendChild(cb);

    var edu = $("#educationBlock");
    clear(edu);
    var eb = timelineBlock(L.about.educationHeading, L.about.education);
    if (eb) edu.appendChild(eb);

    var awd = $("#awardsBlock");
    clear(awd);
    var ab = timelineBlock(L.about.awardsHeading, L.about.awards);
    if (ab) awd.appendChild(ab);

    var soc = $("#societyBlock");
    clear(soc);
    if (L.about.societies && L.about.societies.length) {
      soc.appendChild(el("h3", null, L.about.societyHeading));
      var ul = el("ul", "tag-list");
      L.about.societies.forEach(function (s) { ul.appendChild(el("li", null, s)); });
      soc.appendChild(ul);
    }
  }

  function renderResearch(L) {
    var grid = $("#researchAreas");
    clear(grid);
    L.research.areas.forEach(function (a) {
      var c = el("article", "card");
      if (a.viz && window.VIZ && window.VIZ[a.viz]) {
        var fig = el("div", "card-viz");
        fig.innerHTML = window.VIZ[a.viz]();
        c.appendChild(fig);
      }
      c.appendChild(el("div", "c-tag", a.tag));
      c.appendChild(el("h3", null, a.title));
      c.appendChild(el("p", null, a.body));
      if (a.keywords && a.keywords.length) {
        var kw = el("div", "kw");
        a.keywords.forEach(function (k) { kw.appendChild(el("span", null, k)); });
        c.appendChild(kw);
      }
      // 관련 성과 — 출판사 DOI 링크와 공개 가능한 원문 PDF
      if (a.refs && a.refs.length) {
        var box = el("div", "refs");
        box.appendChild(el("h4", null, L.research.refsHeading || "Related outputs"));
        var ul = el("ul");
        a.refs.forEach(function (r) {
          var li = el("li", r.kind === "pdf" ? "is-pdf" : "is-doi");
          var link = el("a", null, r.label);
          link.href = r.url;
          if (/^https?:/.test(r.url)) { link.target = "_blank"; link.rel = "noopener"; }
          else { link.setAttribute("download", ""); }
          li.appendChild(link);
          ul.appendChild(li);
        });
        box.appendChild(ul);
        c.appendChild(box);
      }
      grid.appendChild(c);
    });

    var cta = $("#simCta");
    if (cta) {
      clear(cta);
      if (L.research.simCta) {
        var box = el("a", "sim-cta");
        box.href = L.research.simCta.href;
        var tx = el("div");
        tx.appendChild(el("strong", null, L.research.simCta.label));
        tx.appendChild(el("span", null, L.research.simCta.note));
        box.appendChild(tx);
        box.appendChild(el("span", "sim-cta-arrow", "→"));
        cta.appendChild(box);
      }
    }

    var pl = $("#projectList");
    clear(pl);
    (L.research.projects || []).forEach(function (p) {
      var d = el("article", "project");
      d.appendChild(el("div", "p-meta", p.period));
      d.appendChild(el("h4", null, p.title));
      d.appendChild(el("div", "p-org", p.org));
      d.appendChild(el("p", null, p.body));
      pl.appendChild(d);
    });
  }

  function paperItem(p) {
    var li = el("li");
    li.appendChild(el("div", "pub-year", p.year || ""));
    var main = el("div", "pub-main");

    var t = el("div", "pub-title");
    if (p.url || p.doi) {
      var a = el("a", null, p.title);
      a.href = p.url || ("https://doi.org/" + p.doi);
      a.target = "_blank";
      a.rel = "noopener";
      t.appendChild(a);
    } else {
      t.textContent = p.title;
    }
    if (p.type) {
      var cls = p.type === "SCI" ? "badge" : (p.type === "KCI" ? "badge kci" : "badge conf");
      t.appendChild(el("span", cls, p.type));
    }
    if (p.status) t.appendChild(el("span", "badge state", p.status));
    main.appendChild(t);

    var meta = el("div", "pub-meta");
    if (p.authors) meta.appendChild(document.createTextNode(p.authors + " · "));
    if (p.venue) meta.appendChild(el("em", null, p.venue));
    if (p.doi) meta.appendChild(document.createTextNode(" · DOI " + p.doi));
    main.appendChild(meta);

    li.appendChild(main);
    return li;
  }

  function patentItem(p, L) {
    var li = el("li");
    li.appendChild(el("div", "pub-year", p.year || ""));
    var main = el("div", "pub-main");
    var t = el("div", "pub-title", p.title);
    if (p.status) t.appendChild(el("span", "badge reg", p.status));
    main.appendChild(t);
    var bits = [];
    if (p.number) bits.push(p.number);
    if (p.country) bits.push(p.country);
    if (p.inventors) bits.push(p.inventors);
    if (bits.length) main.appendChild(el("div", "pub-meta", bits.join(" · ")));
    li.appendChild(main);
    return li;
  }

  function renderPubPanel(L) {
    var panel = $("#pubPanel");
    clear(panel);
    var items = L.publications[state.pubTab];
    if (!items || !items.length) {
      panel.appendChild(el("p", "empty", L.publications.empty));
      return;
    }
    var sorted = items.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
    var ul = el("ul", "pub-list");
    sorted.forEach(function (it) {
      ul.appendChild(state.pubTab === "papers" ? paperItem(it) : patentItem(it, L));
    });
    panel.appendChild(ul);
    if (L.publications.disclaimer) {
      panel.appendChild(el("p", "pub-note", L.publications.disclaimer));
    }
    compactPubs(L);
  }

  function renderPublications(L) {
    var hl = $("#highlights");
    clear(hl);
    L.publications.highlights.forEach(function (h) {
      var d = el("div", "hl");
      d.appendChild(el("h4", null, h.title));
      d.appendChild(el("p", null, h.body));
      hl.appendChild(d);
    });

    var tabs = $("#pubTabs");
    clear(tabs);
    var keys = Object.keys(L.publications.tabs);
    if (keys.indexOf(state.pubTab) === -1) state.pubTab = keys[0];
    keys.forEach(function (key) {
      var b = el("button", null, L.publications.tabs[key]);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(state.pubTab === key));
      b.addEventListener("click", function () {
        state.pubTab = key;
        $$("#pubTabs button").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
        renderPubPanel(L);
      });
      tabs.appendChild(b);
    });

    renderPubPanel(L);
  }

  function renderTeaching(L) {
    var appt = $("#apptList");
    clear(appt);
    L.teaching.appointment.rows.forEach(function (r) {
      var row = el("div");
      row.appendChild(el("dt", null, r.k));
      row.appendChild(el("dd", null, r.v));
      appt.appendChild(row);
    });

    var offers = $("#offerList");
    clear(offers);
    L.teaching.offers.forEach(function (o) { offers.appendChild(el("li", null, o)); });

    var tg = $("#topicGrid");
    clear(tg);
    L.teaching.topics.forEach(function (t) {
      var d = el("article", "topic");
      d.appendChild(el("h4", null, t.title));
      d.appendChild(el("p", null, t.body));
      tg.appendChild(d);
    });

    $("#recruitBtn").textContent = L.teaching.recruitCta;
  }

  function renderFamily(L) {
    var box = $("#familyList");
    if (!box) return;
    clear(box);
    var F = L.family;
    if (!F || !F.items || !F.items.length) return;
    F.items.forEach(function (it) {
      var a = el("a", "fam");
      a.href = it.url;
      a.target = "_blank";
      a.rel = "noopener";

      var ic = el("span", "fam-ic");
      ic.setAttribute("aria-hidden", "true");
      ic.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<ellipse cx="12" cy="6" rx="7" ry="3"/>' +
        '<path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"/>' +
        '<path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"/></svg>';
      a.appendChild(ic);

      var tx = el("span", "fam-tx");
      if (it.tag) tx.appendChild(el("span", "fam-tag", it.tag));
      tx.appendChild(el("strong", null, it.label));
      if (it.sub) tx.appendChild(el("span", "fam-sub", it.sub));
      a.appendChild(tx);

      var go = el("span", "fam-go");
      go.setAttribute("aria-hidden", "true");
      go.textContent = "↗";
      a.appendChild(go);

      box.appendChild(a);
    });
  }

  function renderContact(L) {
    var cfg = SITE.config;
    var list = $("#contactList");
    clear(list);

    function row(label, valueNode) {
      var d = el("div");
      d.appendChild(el("dt", null, label));
      var dd = el("dd");
      dd.appendChild(valueNode);
      d.appendChild(dd);
      list.appendChild(d);
    }
    if (cfg.email) {
      var a = el("a", null, cfg.email);
      a.href = "mailto:" + cfg.email;
      row(L.contact.labels.email, a);
    }
    if (cfg.phone) row(L.contact.labels.phone, document.createTextNode(cfg.phone));
    if (L.contact.office) row(L.contact.labels.office, document.createTextNode(L.contact.office));

    var links = $("#linkList");
    clear(links);
    Object.keys(cfg.links).forEach(function (k) {
      var url = cfg.links[k];
      var label = L.contact.linkLabels[k];
      if (!url || !label) return;
      var li = el("li");
      var a2 = el("a", null, label);
      a2.href = url;
      a2.target = "_blank";
      a2.rel = "noopener";
      li.appendChild(a2);
      links.appendChild(li);
    });
  }

  /* ---------- Media: 영상(지연 로딩) + 결과 이미지 갤러리 ---------- */
  function renderMedia(L) {
    var grid = $("#videoGrid");
    clear(grid);
    // 미리보기(아티팩트) 환경은 외부 iframe·이미지를 차단하므로 링크 카드로 대체한다.
    var linkOnly = !!window.ARTIFACT_MODE;

    (L.media.videos || []).forEach(function (v) {
      var fig = el("figure", "video-card");
      var btn;
      if (linkOnly) {
        btn = el("a", "video-thumb plain");
        btn.href = "https://www.youtube.com/watch?v=" + v.id;
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.setAttribute("aria-label", L.media.play + ": " + v.title);
        btn.appendChild(el("span", "play-ico", "▶"));
      } else {
        btn = el("button", "video-thumb");
        btn.type = "button";
        btn.setAttribute("aria-label", L.media.play + ": " + v.title);
        // YouTube 썸네일만 먼저 불러오고, 클릭할 때 iframe 을 삽입한다(초기 로딩 절감).
        btn.style.backgroundImage = "url(https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg)";
        btn.appendChild(el("span", "play-ico", "▶"));
        btn.addEventListener("click", function () {
          var f = document.createElement("iframe");
          f.src = "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0";
          f.title = v.title;
          f.loading = "lazy";
          f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
          f.allowFullscreen = true;
          btn.replaceWith(f);
        });
      }
      fig.appendChild(btn);
      var cap = el("figcaption");
      cap.appendChild(el("strong", null, v.title));
      if (v.caption) cap.appendChild(el("span", null, v.caption));
      if (v.credit) cap.appendChild(el("span", "credit", v.credit));
      fig.appendChild(cap);
      grid.appendChild(fig);
    });

    var g = $("#gallery");
    var head = $("#galleryHead");
    clear(g);
    var items = L.media.gallery || [];
    if (!items.length) {
      head.style.display = "none";
      g.style.display = "none";
      return;
    }
    head.style.display = "";
    g.style.display = "";
    items.forEach(function (it) {
      var b = el("button", "shot");
      b.type = "button";
      var im = el("img");
      im.src = it.src;
      im.alt = it.title || "";
      im.loading = "lazy";
      b.appendChild(im);
      b.appendChild(el("span", "shot-cap", it.title || ""));
      b.addEventListener("click", function () { openLightbox(it); });
      g.appendChild(b);
    });
  }

  function openLightbox(it) {
    var lb = $("#lightbox");
    $("#lbImg").src = it.src;
    $("#lbImg").alt = it.title || "";
    $("#lbCap").textContent = [it.title, it.caption].filter(Boolean).join(" — ");
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }

  function closeLightbox() {
    $("#lightbox").hidden = true;
    $("#lbImg").src = "";
    document.body.style.overflow = "";
  }

  /* ---------- 최신 연구동향 (data/trends.json) ---------- */
  function trendCard(it) {
    var a = el("a", "trend");
    a.href = it.url;
    a.target = "_blank";
    a.rel = "noopener";
    var top = el("div", "trend-top");
    top.appendChild(el("span", "trend-src", it.source));
    top.appendChild(el("span", "trend-cat", it.cat));
    a.appendChild(top);
    a.appendChild(el("p", "trend-title", it.title));
    a.appendChild(el("span", "trend-date", it.date));
    return a;
  }

  function renderTrends(L, data) {
    var track = $("#trendsTrack");
    var upd = $("#trendsUpdated");
    clear(track);

    var items = (data && data.items) || [];
    if (!items.length) {
      upd.textContent = "";
      var box = el("div", "trend-empty");
      box.appendChild(el("strong", null, L.trends.emptyTitle));
      box.appendChild(el("span", null, L.trends.emptyBody));
      var kw = el("div", "trend-kw");
      ["Remote sensing AI", "Satellite imagery", "Sea ice", "Forest / Vegetation", "Radiometric calibration"]
        .forEach(function (k) { kw.appendChild(el("span", null, k)); });
      box.appendChild(kw);
      track.appendChild(box);
      track.classList.remove("marquee");
      return;
    }

    upd.textContent = L.trends.updatedPrefix + " " + String(data.updated || "").slice(0, 10);
    items.forEach(function (it) { track.appendChild(trendCard(it)); });
    // 끊김 없는 흐름을 위해 목록을 한 번 복제 (항목이 충분할 때만)
    if (items.length >= 5 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (it) {
        var c = trendCard(it);
        c.setAttribute("aria-hidden", "true");
        c.tabIndex = -1;
        track.appendChild(c);
      });
      track.classList.add("marquee");
      track.style.setProperty("--n", items.length * 2);
    } else {
      track.classList.remove("marquee");
    }
  }

  function loadTrends() {
    var url = SITE.config.trendsUrl || "data/trends.json";
    if (!window.fetch) { renderTrends(SITE[state.lang], null); return; }
    fetch(url, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) { state.trends = d; renderTrends(SITE[state.lang], d); });
  }

  /* ---------- render all ---------- */

  /* ==========================================================================
     모바일 간소화 — 좁은 화면에서는 긴 목록을 접고, 연구분야 카드는
     제목·요약만 먼저 보여준 뒤 [자세히] 로 펼친다. 넓은 화면은 그대로.
     ========================================================================== */
  var MOBILE = window.matchMedia("(max-width: 780px)");

  function isMobile() { return MOBILE.matches; }

  function realKids(box) {
    return Array.prototype.filter.call(box.children, function (n) {
      return n.nodeType === 1 && !n.classList.contains("more-btn");
    });
  }

  // 자식 요소를 limit 개만 남기고 접는다
  function limitChildren(box, limit, L) {
    if (!box) return;
    var old = box.parentNode.querySelector(":scope > .more-btn");
    if (old) old.remove();
    var kids = realKids(box);
    kids.forEach(function (k) { k.classList.remove("m-hide"); });
    if (!isMobile() || kids.length <= limit) return;

    var rest = kids.length - limit;
    var open = false;
    var b = el("button", "more-btn", L.ui.more + " +" + rest);
    b.type = "button";
    kids.forEach(function (k, i) { if (i >= limit) k.classList.add("m-hide"); });
    b.addEventListener("click", function () {
      open = !open;
      kids.forEach(function (k, i) { if (i >= limit) k.classList.toggle("m-hide", !open); });
      b.textContent = open ? L.ui.less : L.ui.more + " +" + rest;
      b.classList.toggle("is-open", open);
    });
    box.parentNode.insertBefore(b, box.nextSibling);
  }

  // 연구분야 카드: 모바일에서 다이어그램·키워드·관련성과를 접는다
  function collapseCards(L) {
    $$("#researchAreas .card").forEach(function (c) {
      var btn = c.querySelector(".card-more");
      if (!isMobile()) {
        c.classList.remove("collapsed");
        if (btn) btn.remove();
        return;
      }
      c.classList.add("collapsed");
      if (!btn) {
        btn = el("button", "card-more", L.ui.details);
        btn.type = "button";
        btn.addEventListener("click", function () {
          var open = c.classList.toggle("collapsed") === false;
          btn.textContent = open ? L.ui.hide : L.ui.details;
          btn.classList.toggle("is-open", open);
        });
        c.appendChild(btn);
      } else {
        btn.textContent = L.ui.details;
        btn.classList.remove("is-open");
      }
    });
  }

  function compact(L) {
    collapseCards(L);
    limitChildren($("#aboutBody"), 2, L);
    limitChildren($("#projectList"), 3, L);
    limitChildren($("#highlights"), 2, L);
    limitChildren($("#topicGrid"), 3, L);
    limitChildren($("#videoGrid"), 2, L);
    limitChildren($("#gallery"), 3, L);
    ["#careerBlock", "#awardsBlock", "#societyBlock"].forEach(function (sel) {
      var ul = document.querySelector(sel + " ul");
      if (ul) limitChildren(ul, 4, L);
    });
    compactPubs(L);
  }

  function compactPubs(L) {
    var ul = document.querySelector("#pubPanel .pub-list");
    if (ul) limitChildren(ul, 5, L);
  }

  function render() {
    var L = SITE[state.lang];
    renderText(L);
    renderNav(L);
    renderHero(L);
    renderTracking(L);
    renderAbout(L);
    renderResearch(L);
    renderMedia(L);
    renderPublications(L);
    renderTeaching(L);
    renderContact(L);
    renderFamily(L);
    renderTrends(L, state.trends);
    $("#langBtn").textContent = L.ui.langToggle;
    $("#toTop").setAttribute("aria-label", L.ui.top);
    $("#menuBtn").setAttribute("aria-label", L.ui.menu);
    compact(L);
    setupScrollSpy();
  }

  function setLang(lang) {
    state.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* noop */ }
    render();
  }

  /* ---------- interactions ---------- */
  var spyTargets = [];
  function setupScrollSpy() {
    spyTargets = $$("main section[id]").map(function (s) {
      return { id: s.id, node: s, link: $("#nav a[href='#" + s.id + "']") };
    });
    onScroll();
  }

  function onScroll() {
    var y = window.scrollY;
    $("#topbar").classList.toggle("scrolled", y > 8);
    $("#toTop").classList.toggle("show", y > 600);

    var current = null;
    spyTargets.forEach(function (t) {
      if (t.node.offsetTop - 120 <= y) current = t;
    });
    spyTargets.forEach(function (t) {
      if (t.link) t.link.classList.toggle("active", t === current);
    });
  }

  function init() {
    state.lang = initialLang();
    render();

    var wasMobile = isMobile();
    window.addEventListener("resize", function () {
      if (isMobile() !== wasMobile) { wasMobile = isMobile(); render(); }
    });

    $("#langBtn").addEventListener("click", function () {
      setLang(state.lang === "ko" ? "en" : "ko");
    });

    var menuBtn = $("#menuBtn");
    menuBtn.addEventListener("click", function () {
      var open = $("#nav").classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $("#nav").addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        $("#nav").classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", function (e) {
      if (e.target === this) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#lightbox").hidden) closeLightbox();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    loadTrends();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
