/* =============================================================================
 *  orbit.js — TLE 기반 궤도 전파 (외부 라이브러리 없음)
 *
 *  케플러 궤도에 J2 장주기항(승교점 적경·근지점 인수·평균근점이각의 세속 변화)을
 *  더한 근사 전파기입니다. 완전한 SGP4 는 아니지만, 하루 이내의 최신 TLE 에
 *  대해 저궤도 위성의 지상 투영점을 수십 km 이내로 재현하므로 "지금 어디를
 *  지나고 있는가" 를 보여주는 용도로는 충분합니다.
 *  ※ 정밀 궤도결정(POD) 값이 아니며 실제 촬영 계획과도 무관합니다.
 *
 *  window.ORBIT.propagate(tle, date) → { lat, lon, altKm, speedKms }
 * ========================================================================== */
window.ORBIT = (function () {
  "use strict";

  var MU = 398600.4418;      // km^3/s^2
  var RE = 6378.137;         // km, WGS84 장반경
  var FLAT = 1 / 298.257223563;
  var J2 = 1.08262668e-3;
  var DEG = Math.PI / 180;
  var TWOPI = Math.PI * 2;

  /* ---------- TLE 파싱 ---------- */
  function parse(l1, l2) {
    var epochYear = parseInt(l1.substring(18, 20), 10);
    epochYear += epochYear < 57 ? 2000 : 1900;
    var epochDay = parseFloat(l1.substring(20, 32));

    var inc = parseFloat(l2.substring(8, 16)) * DEG;
    var raan = parseFloat(l2.substring(17, 25)) * DEG;
    var ecc = parseFloat("0." + l2.substring(26, 33).trim());
    var argp = parseFloat(l2.substring(34, 42)) * DEG;
    var m0 = parseFloat(l2.substring(43, 51)) * DEG;
    var nRev = parseFloat(l2.substring(52, 63));   // rev/day

    if (!isFinite(inc) || !isFinite(nRev) || nRev <= 0) return null;

    // 에폭(UTC) → Date
    var jan1 = Date.UTC(epochYear, 0, 1);
    var epoch = new Date(jan1 + (epochDay - 1) * 86400000);

    var n = (nRev * TWOPI) / 86400;                // rad/s
    var a = Math.pow(MU / (n * n), 1 / 3);         // km

    return { epoch: epoch, inc: inc, raan: raan, ecc: ecc, argp: argp, m0: m0, n: n, a: a };
  }

  /* ---------- 케플러 방정식 ---------- */
  function solveKepler(M, e) {
    var E = e < 0.8 ? M : Math.PI;
    for (var i = 0; i < 30; i++) {
      var d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= d;
      if (Math.abs(d) < 1e-11) break;
    }
    return E;
  }

  /* ---------- 그리니치 평항성시 (rad) ---------- */
  function gmst(date) {
    var jd = date.getTime() / 86400000 + 2440587.5;
    var T = (jd - 2451545.0) / 36525;
    var s = 67310.54841 +
            (876600 * 3600 + 8640184.812866) * T +
            0.093104 * T * T -
            6.2e-6 * T * T * T;              // seconds
    s = ((s % 86400) + 86400) % 86400;
    return (s / 240) * DEG;                  // 1초 = 1/240 도
  }

  /* ---------- ECI → 측지 위경도 ---------- */
  function eciToGeodetic(r, theta) {
    var x = r[0], y = r[1], z = r[2];
    var lon = Math.atan2(y, x) - theta;
    lon = ((lon + Math.PI) % TWOPI + TWOPI) % TWOPI - Math.PI;

    var p = Math.hypot(x, y);
    var e2 = FLAT * (2 - FLAT);
    var lat = Math.atan2(z, p);
    var C = 0;
    for (var i = 0; i < 8; i++) {
      C = 1 / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
      lat = Math.atan2(z + RE * C * e2 * Math.sin(lat), p);
    }
    var alt = p / Math.cos(lat) - RE * C;
    return { lat: lat / DEG, lon: lon / DEG, altKm: alt };
  }

  /* ---------- 전파 ---------- */
  function propagate(el, date) {
    if (!el) return null;
    var dt = (date.getTime() - el.epoch.getTime()) / 1000;   // s
    var e = el.ecc, i = el.inc, a = el.a, n = el.n;

    // J2 세속 변화율
    var p = a * (1 - e * e);
    var f = 1.5 * J2 * (RE / p) * (RE / p) * n;
    var si = Math.sin(i), ci = Math.cos(i);
    var raanDot = -f * ci;
    var argpDot = f * (2 - 2.5 * si * si);
    var mDot = n + f * Math.sqrt(1 - e * e) * (1 - 1.5 * si * si);

    var raan = el.raan + raanDot * dt;
    var argp = el.argp + argpDot * dt;
    var M = el.m0 + mDot * dt;

    var E = solveKepler(((M % TWOPI) + TWOPI) % TWOPI, e);
    var nu = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e);
    var rMag = a * (1 - e * Math.cos(E));

    // 근점좌표계 → ECI
    var xp = rMag * Math.cos(nu), yp = rMag * Math.sin(nu);
    var vFac = Math.sqrt(MU * a) / rMag;
    var vxp = -vFac * Math.sin(E);
    var vyp = vFac * Math.sqrt(1 - e * e) * Math.cos(E);

    var cO = Math.cos(raan), sO = Math.sin(raan);
    var cw = Math.cos(argp), sw = Math.sin(argp);

    function rot(x, y) {
      return [
        x * (cO * cw - sO * sw * ci) - y * (cO * sw + sO * cw * ci),
        x * (sO * cw + cO * sw * ci) - y * (sO * sw - cO * cw * ci),
        x * (sw * si) + y * (cw * si)
      ];
    }
    var r = rot(xp, yp);
    var v = rot(vxp, vyp);

    var g = eciToGeodetic(r, gmst(date));
    g.speedKms = Math.hypot(v[0], v[1], v[2]);
    g.periodMin = (TWOPI / n) / 60;
    return g;
  }

  /* 지상 자취: 현재 시각 ±minutes 분 구간 */
  function groundTrack(el, date, backMin, fwdMin, stepSec) {
    var pts = [], t;
    for (t = -backMin * 60; t <= fwdMin * 60; t += stepSec) {
      var g = propagate(el, new Date(date.getTime() + t * 1000));
      if (g) pts.push([g.lon, g.lat, t]);
    }
    return pts;
  }

  /* 태양 직하점 (주야 경계선용, 저정밀 근사) */
  function subsolar(date) {
    var jd = date.getTime() / 86400000 + 2440587.5;
    var d = jd - 2451545.0;
    var g = (357.529 + 0.98560028 * d) * DEG;
    var q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
    var eps = (23.439 - 0.00000036 * d) * DEG;
    var ra = Math.atan2(Math.cos(eps) * Math.sin(L), Math.cos(L));
    var dec = Math.asin(Math.sin(eps) * Math.sin(L));
    var lon = ((ra - gmst(date)) / DEG + 540) % 360 - 180;
    return { lat: dec / DEG, lon: lon };
  }

  return { parse: parse, propagate: propagate, groundTrack: groundTrack, subsolar: subsolar };
})();
