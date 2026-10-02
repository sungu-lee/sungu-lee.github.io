/* =============================================================================
 *  simulator.js — 위성 활용 시뮬레이터 엔진
 *
 *  실제 위성영상이 아니라, 지표 피복별 분광 반사율과 센서 특성을 물리적으로
 *  모사해 장면을 합성한다. 그 위에 실제 연구에서 쓰는 처리 체인
 *  (TOA 반사도 → 지수 산출 → 탐지)을 그대로 적용해 결과를 보여준다.
 *  따라서 화면의 수치는 "이 알고리즘이 이런 장면에서 무엇을 만들어내는가" 를
 *  보여주는 것이며, 특정 지역의 실측값이 아니다.
 *
 *  흐름:  makeScene(app, date, seed)  → 지표 진실값(반사율·피복·피해도)
 *         sample(scene, sensor)       → 센서 해상도·잡음 반영
 *         render(product)             → 화면 픽셀
 * ========================================================================== */
window.SIM = (function () {
  "use strict";

  var W = 480, H = 300;                 // 지표 진실값 격자
  var CLASS = { WATER: 0, FOREST: 1, CROP: 2, SOIL: 3, URBAN: 4, ICE: 5, SNOW: 6 };

  /* 지표 피복별 대표 반사율 [B, G, R, NIR] (0–1) */
  var SPECTRA = {
    0: [0.035, 0.045, 0.028, 0.012],   // 물
    1: [0.030, 0.055, 0.032, 0.380],   // 침엽·활엽 산림
    2: [0.045, 0.080, 0.055, 0.430],   // 농경지(생육기)
    3: [0.110, 0.150, 0.195, 0.260],   // 나지
    4: [0.150, 0.160, 0.170, 0.200],   // 도시
    5: [0.620, 0.640, 0.630, 0.480],   // 해빙
    6: [0.820, 0.860, 0.850, 0.700]    // 적설
  };

  /* KOMPSAT-3 TCT 계수(밝기·녹색도·습윤도) — 이 연구에서 도출한 계수의 형태 */
  var TCT = {
    b: [0.3210, 0.4980, 0.5460, 0.5890],
    g: [-0.2740, -0.4180, -0.5320, 0.6840],
    w: [0.2190, 0.4360, -0.1930, -0.8520]
  };

  var SENSORS = {
    "k3":  { label: "KOMPSAT-3",  gsd: 2.8,  block: 3, snr: 120, kind: "optical" },
    "k3a": { label: "KOMPSAT-3A", gsd: 2.2,  block: 2, snr: 130, kind: "optical" },
    "k7":  { label: "KOMPSAT-7",  gsd: 1.12, block: 1, snr: 150, kind: "optical" },
    "k5":  { label: "KOMPSAT-5",  gsd: 3.0,  block: 3, snr: 0,   kind: "sar" }
  };

  /* ---------- 결정론적 잡음 ---------- */
  function hash(x, y, s) {
    // Math.imul 로 32비트 곱을 유지해야 상위 비트가 보존된다
    var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function value2(x, y, s) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = smooth(x - xi), yf = smooth(y - yi);
    var a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
    var c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf;
  }
  function fbm(x, y, s, oct, lac, gain) {
    var v = 0, amp = 0.5, f = 1, norm = 0;
    for (var i = 0; i < oct; i++) {
      v += amp * value2(x * f, y * f, s + i * 17);
      norm += amp; amp *= gain; f *= lac;
    }
    return v / norm;
  }

  /* ---------- 장면 생성 ---------- */
  function makeScene(app, dateIdx, seed) {
    var n = W * H;
    var refl = [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)];
    var cls = new Uint8Array(n);
    var sig = new Float32Array(n);      // 응용별 신호(피해도·수분·유빙농도 등)
    var shade = new Float32Array(n);    // 지형 음영

    var t = dateIdx;                    // 0,1,2 = 시기
    var i, x, y, idx;

    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        idx = y * W + x;
        var fx = x / 48, fy = y / 48;

        var h = fbm(fx, fy, seed, 5, 2.0, 0.55);                  // 표고
        var wet = fbm(fx + 31, fy + 17, seed + 91, 4, 2.1, 0.6);  // 수분
        var parcel = 0;

        // 지형 음영 (북서 조명)
        var hx = fbm(fx + 0.02, fy, seed, 5, 2.0, 0.55) - h;
        var hy = fbm(fx, fy + 0.02, seed, 5, 2.0, 0.55) - h;
        shade[idx] = Math.max(0.55, Math.min(1.25, 1 + (hx + hy) * 9));

        var c;
        if (app === "seaice") {
          // 해빙: 유빙 농도가 시기에 따라 감소
          var ice = fbm(fx * 0.8, fy * 0.8, seed + 5, 4, 2.2, 0.55);
          var thr = 0.42 + t * 0.07;
          c = ice > thr ? CLASS.ICE : CLASS.WATER;
          sig[idx] = Math.max(0, Math.min(1, (ice - thr + 0.18) / 0.36));
        } else if (app === "flood") {
          var level = 0.36 + t * 0.055;                            // 수위 상승
          c = h < level ? CLASS.WATER : (wet > 0.55 ? CLASS.CROP : CLASS.SOIL);
          if (h > 0.66) c = CLASS.FOREST;
          sig[idx] = h < level && h > 0.36 ? 1 : 0;                // 신규 침수
        } else {
          if (h < 0.30) c = CLASS.WATER;
          else if (h > 0.53) c = CLASS.FOREST;
          else if (wet > 0.48) {
            c = CLASS.CROP;
            // 경작지 필지 경계
            parcel = (Math.floor(x / 26 + fbm(fx, fy, seed + 3, 2, 2, 0.5) * 2) * 7 +
                      Math.floor(y / 19)) % 5;
          } else c = CLASS.SOIL;
          // 도시
          var urb = fbm(fx * 1.6 + 60, fy * 1.6 + 60, seed + 7, 3, 2.3, 0.5);
          if (urb > 0.70 && c !== CLASS.WATER) c = CLASS.URBAN;
        }
        cls[idx] = c;

        var sp = SPECTRA[c];
        var b0 = sp[0], b1 = sp[1], b2 = sp[2], b3 = sp[3];

        if (app === "forest" && c === CLASS.FOREST) {
          // 소나무재선충 피해: NIR 급감 + R 상승 (t 에 따라 확산)
          var d = fbm(fx * 1.3 + 12, fy * 1.3 + 44, seed + 11, 4, 2.1, 0.55);
          var dmg = Math.max(0, (d - (0.60 - t * 0.075))) / 0.26;
          dmg = Math.max(0, Math.min(1, dmg));
          sig[idx] = dmg;
          b3 = b3 * (1 - 0.62 * dmg);
          b2 = b2 + 0.105 * dmg;
          b1 = b1 + 0.025 * dmg;
        } else if (app === "crop" && c === CLASS.CROP) {
          // 필지별 생육 차이 + 시기별 성장
          var vigor = 0.45 + 0.55 * fbm(fx * 0.9 + 70, fy * 0.9 + 12, seed + 13, 3, 2, 0.55);
          vigor *= 0.55 + 0.30 * t + 0.15 * (parcel / 4);
          vigor = Math.max(0.15, Math.min(1.25, vigor));
          sig[idx] = Math.min(1, vigor / 1.25);
          b3 = b3 * (0.45 + 0.75 * vigor);
          b2 = b2 * (1.35 - 0.55 * vigor);
        } else if (app === "soil") {
          // 토양수분: 수분이 높을수록 가시광 어두워짐
          var sm = Math.max(0, Math.min(1, wet * (0.75 + 0.2 * t)));
          sig[idx] = sm;
          b0 *= (1 - 0.35 * sm); b1 *= (1 - 0.35 * sm);
          b2 *= (1 - 0.40 * sm); b3 *= (1 - 0.15 * sm);
        }

        var g = 0.90 + 0.20 * hash(x, y, seed + 99);   // 화소 단위 변이
        refl[0][idx] = b0 * g * shade[idx];
        refl[1][idx] = b1 * g * shade[idx];
        refl[2][idx] = b2 * g * shade[idx];
        refl[3][idx] = b3 * g * shade[idx];
      }
    }
    return { refl: refl, cls: cls, sig: sig, shade: shade, app: app, date: dateIdx, seed: seed };
  }

  /* ---------- 센서 샘플링 ---------- */
  function sample(scene, sensorKey) {
    var S = SENSORS[sensorKey], blk = S.block, n = W * H;
    var out = [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)];
    var sar = new Float32Array(n);
    var bx, by, x, y, b, idx;

    for (by = 0; by < H; by += blk) {
      for (bx = 0; bx < W; bx += blk) {
        var acc = [0, 0, 0, 0], cnt = 0, sigAcc = 0;
        for (y = by; y < Math.min(by + blk, H); y++) {
          for (x = bx; x < Math.min(bx + blk, W); x++) {
            idx = y * W + x;
            for (b = 0; b < 4; b++) acc[b] += scene.refl[b][idx];
            sigAcc += scene.sig[idx];
            cnt++;
          }
        }
        var noise = S.snr ? 1 : 0;
        var vals = [0, 0, 0, 0];
        for (b = 0; b < 4; b++) {
          var m = acc[b] / cnt;
          if (noise) m += (hash(bx, by, b * 31 + 5) - 0.5) * (1 / S.snr);
          vals[b] = Math.max(0, m);
        }
        // SAR 후방산란: 수분·거칠기 → σ0, 스페클(지수분포 근사)
        var sigm = sigAcc / cnt;
        var cIdx = scene.cls[by * W + bx];
        var rough = cIdx === CLASS.WATER ? 0.05 :
                    cIdx === CLASS.URBAN ? 0.95 :
                    cIdx === CLASS.FOREST ? 0.55 :
                    cIdx === CLASS.ICE ? 0.45 : 0.30;
        var s0 = rough * (0.45 + 0.75 * sigm);
        for (y = by; y < Math.min(by + blk, H); y++) {
          for (x = bx; x < Math.min(bx + blk, W); x++) {
            idx = y * W + x;
            for (b = 0; b < 4; b++) out[b][idx] = vals[b];
            var u = Math.max(1e-4, hash(x, y, scene.seed + 777));
            sar[idx] = Math.max(0, Math.min(1, s0 * (-Math.log(u)) * 0.85));
          }
        }
      }
    }
    return { bands: out, sar: sar, sensor: S };
  }

  /* ---------- 지수 ---------- */
  function ndvi(bands, i) {
    var nir = bands[3][i], r = bands[2][i];
    var d = nir + r;
    return d > 1e-6 ? (nir - r) / d : 0;
  }
  function tct(bands, i, k) {
    var c = TCT[k];
    return c[0] * bands[0][i] + c[1] * bands[1][i] + c[2] * bands[2][i] + c[3] * bands[3][i];
  }

  /* ---------- 색 ---------- */
  function stretch(v, lo, hi) {
    return Math.max(0, Math.min(255, ((v - lo) / (hi - lo)) * 255));
  }
  function rampNDVI(v) {
    // 물/나지 → 갈색, 식생 → 녹색
    var t = Math.max(-0.2, Math.min(0.9, v));
    if (t < 0.05) return [40, 62, 92];
    var u = (t - 0.05) / 0.85;
    return [Math.round(196 - 150 * u), Math.round(150 + 50 * u), Math.round(92 - 40 * u)];
  }
  function rampRisk(v) {
    var u = Math.max(0, Math.min(1, v));
    return [Math.round(60 + 195 * u), Math.round(180 - 140 * u), Math.round(90 - 60 * u)];
  }

  /* ---------- 렌더 ---------- */
  function render(ctx, scene, samp, product) {
    var img = ctx.createImageData(W, H);
    var d = img.data, bands = samp.bands, isSar = samp.sensor.kind === "sar";
    var i, p, v, c;

    for (i = 0; i < W * H; i++) {
      p = i * 4;
      var r = 0, g = 0, b = 0;

      if (isSar && (product === "rgb" || product === "fcc")) {
        v = Math.pow(samp.sar[i], 0.55) * 255;
        r = g = b = v;
      } else if (product === "rgb") {
        r = stretch(bands[2][i], 0.01, 0.34);
        g = stretch(bands[1][i], 0.01, 0.30);
        b = stretch(bands[0][i], 0.01, 0.26);
      } else if (product === "fcc") {
        r = stretch(bands[3][i], 0.01, 0.50);
        g = stretch(bands[2][i], 0.01, 0.34);
        b = stretch(bands[1][i], 0.01, 0.30);
      } else if (product === "ndvi") {
        c = rampNDVI(ndvi(bands, i)); r = c[0]; g = c[1]; b = c[2];
      } else if (product === "tct") {
        r = stretch(tct(bands, i, "b"), 0.02, 0.45);
        g = stretch(tct(bands, i, "g"), -0.02, 0.26);
        b = stretch(tct(bands, i, "w"), -0.30, 0.06);
      } else if (product === "detect") {
        // 바탕은 흑백, 탐지 결과를 색으로 덮는다
        // 바탕은 밝기(TCT brightness)로 만든 회색조 — 탐지 결과가 잘 얹히도록 밝게
        var base = isSar ? 60 + Math.pow(samp.sar[i], 0.55) * 185
                         : 45 + stretch(tct(bands, i, "b"), 0.02, 0.42) * 0.72;
        var s = detectScore(scene, samp, i);
        if (s > 0.35) {
          c = rampRisk(s);
          var a = 0.55 + 0.35 * Math.min(1, (s - 0.35) / 0.5);   // 점수가 높을수록 진하게
          r = c[0] * a + base * (1 - a);
          g = c[1] * a + base * (1 - a);
          b = c[2] * a + base * (1 - a);
        } else { r = g = b = base; }
      }
      d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255;
    }
    return img;
  }

  /* ---------- 탐지 점수 (응용별) ---------- */
  function detectScore(scene, samp, i) {
    var bands = samp.bands, app = scene.app;
    var nd = ndvi(bands, i);
    var tg = tct(bands, i, "g");
    var tw = tct(bands, i, "w");

    if (app === "forest") {
      if (scene.cls[i] !== CLASS.FOREST) return 0;
      // NDVI(0.25) + 노화지수(0.30) + NIR/R(0.20) + TCG(0.15) + EVI 대용(0.10)
      var si = (bands[2][i] - bands[1][i]) / Math.max(1e-6, bands[2][i] + bands[1][i]);
      var nr = bands[3][i] / Math.max(1e-6, bands[2][i]);
      var s = 0.25 * (1 - Math.min(1, Math.max(0, (nd - 0.2) / 0.6))) +
              0.30 * Math.min(1, Math.max(0, (si + 0.1) / 0.45)) +
              0.20 * (1 - Math.min(1, nr / 7)) +
              0.15 * (1 - Math.min(1, Math.max(0, tg / 0.22))) +
              0.10 * (1 - Math.min(1, Math.max(0, (nd - 0.1) / 0.7)));
      return s;
    }
    if (app === "crop") {
      if (scene.cls[i] !== CLASS.CROP) return 0;
      return Math.min(1, Math.max(0, (nd - 0.25) / 0.55));
    }
    if (app === "soil") {
      return Math.min(1, Math.max(0, samp.sar[i] * 1.5 + tw * 0.8 + 0.15));
    }
    if (app === "seaice") {
      return scene.cls[i] === CLASS.ICE ? 0.45 + 0.5 * scene.sig[i] : 0;
    }
    if (app === "flood") {
      return scene.sig[i] > 0.5 ? 0.9 : (scene.cls[i] === CLASS.WATER ? 0.42 : 0);
    }
    return 0;
  }

  /* ---------- 통계 ---------- */
  function stats(scene, samp) {
    var n = W * H, i, nd = 0, cnt = 0, hit = 0, target = 0, sum = 0;
    for (i = 0; i < n; i++) {
      var v = ndvi(samp.bands, i);
      nd += v; cnt++;
      var s = detectScore(scene, samp, i);
      if (s > 0.35) hit++;
      if (scene.app === "forest" && scene.cls[i] === CLASS.FOREST) target++;
      if (scene.app === "crop" && scene.cls[i] === CLASS.CROP) target++;
      if (scene.app === "seaice" && scene.cls[i] === CLASS.ICE) target++;
      sum += scene.sig[i];
    }
    return {
      ndviMean: nd / cnt,
      hitPct: (hit / n) * 100,
      targetPct: (target / n) * 100,
      sigMean: sum / n
    };
  }

  return {
    W: W, H: H, CLASS: CLASS, SENSORS: SENSORS,
    makeScene: makeScene, sample: sample, render: render, stats: stats,
    ndvi: ndvi, tct: tct
  };
})();
