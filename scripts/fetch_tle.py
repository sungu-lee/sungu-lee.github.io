#!/usr/bin/env python3
"""KOMPSAT / NEONSAT 위성의 최신 TLE(궤도요소)를 내려받아 저장한다.

CelesTrak 의 공개 GP 질의를 이름으로 호출하므로 NORAD ID 를 하드코딩하지 않는다.
결과는 ``data/tle.json`` 에 저장되고, 홈페이지는 이 파일을 읽어 브라우저에서
SGP4 로 현재 위치를 계산한다(서버 없이 동작하도록 하기 위함).

한 질의가 실패해도 나머지는 계속 수집하며, 전부 실패하면 기존 파일을 유지한다.

Usage:
    python scripts/fetch_tle.py [--out data/tle.json]
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA = "Mozilla/5.0 (compatible; sgl-homepage-tle/1.0)"
TIMEOUT = 25
GP = "https://celestrak.org/NORAD/elements/gp.php"
# CelesTrak 이 막히는 망에서 쓰는 예비 경로 (같은 GP 자료를 중계)
FALLBACK = "https://tle.ivanstanojevic.me/api/tle/{norad}"

# 예비 경로용 NORAD 카탈로그 번호
NORAD = {
    "KOMPSAT-3": 38338,
    "KOMPSAT-3A": 40536,
    "KOMPSAT-5": 39227,
    "KOMPSAT-7": 66820,
    "NEONSAT": 59587,
}

# 화면에 표시할 위성. name 은 CelesTrak 이름 질의어, label 은 홈페이지 표기.
WANTED: list[dict[str, str]] = [
    {"query": "KOMPSAT", "match": "KOMPSAT-3", "label": "KOMPSAT-3", "kind": "optical"},
    {"query": "KOMPSAT", "match": "KOMPSAT-3A", "label": "KOMPSAT-3A", "kind": "optical-ir"},
    {"query": "KOMPSAT", "match": "KOMPSAT-5", "label": "KOMPSAT-5", "kind": "sar"},
    {"query": "KOMPSAT", "match": "KOMPSAT-7", "label": "KOMPSAT-7", "kind": "optical-hr"},
    {"query": "NEONSAT", "match": "NEONSAT", "label": "NEONSAT", "kind": "cluster"},
]


def fetch_tle_block(query: str) -> str:
    """이름으로 TLE 묶음을 받아온다."""
    url = f"{GP}?{urllib.parse.urlencode({'NAME': query, 'FORMAT': 'TLE'})}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read().decode("utf-8", "replace")


def checksum_ok(line: str) -> bool:
    """TLE 69번째 열의 모듈러 10 체크섬을 검증한다(전송 오류 탐지)."""
    if len(line) != 69 or not line[68].isdigit():
        return False
    total = sum(int(c) for c in line[:68] if c.isdigit())
    total += sum(1 for c in line[:68] if c == "-")
    return total % 10 == int(line[68])


def from_fallback(label: str) -> tuple[str, str, str] | None:
    """예비 API 에서 한 위성의 TLE 를 받아온다."""
    norad = NORAD.get(label)
    if not norad:
        return None
    req = urllib.request.Request(FALLBACK.format(norad=norad), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        d = json.loads(resp.read().decode("utf-8", "replace"))
    l1, l2 = d.get("line1", ""), d.get("line2", "")
    if checksum_ok(l1) and checksum_ok(l2):
        return (d.get("name", label), l1, l2)
    return None


def parse_tle(text: str) -> dict[str, tuple[str, str]]:
    """3줄 TLE 텍스트를 {이름: (1행, 2행)} 으로 파싱한다."""
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    out: dict[str, tuple[str, str]] = {}
    i = 0
    while i + 2 < len(lines) + 1:
        if i + 2 >= len(lines) + 1:
            break
        name = lines[i].strip()
        if i + 2 >= len(lines):
            break
        l1, l2 = lines[i + 1], lines[i + 2]
        if l1.startswith("1 ") and l2.startswith("2 "):
            out[name.upper()] = (l1, l2)
            i += 3
        else:
            i += 1
    return out


def pick(catalog: dict[str, tuple[str, str]], match: str) -> tuple[str, str, str] | None:
    """이름에 match 가 들어간 첫 항목을 고른다. (정확 일치 우선)"""
    key = match.upper()
    if key in catalog:
        return (key,) + catalog[key]
    for name, tle in sorted(catalog.items()):
        if key in name:
            return (name,) + tle
    return None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/tle.json", type=Path)
    args = ap.parse_args()

    cache: dict[str, dict[str, tuple[str, str]]] = {}
    sats: list[dict[str, str]] = []
    failed: list[str] = []

    for w in WANTED:
        q = w["query"]
        if q not in cache:
            try:
                cache[q] = parse_tle(fetch_tle_block(q))
            except (urllib.error.URLError, OSError) as exc:
                cache[q] = {}
                failed.append(f"{q}: {exc}")
        hit = pick(cache[q], w["match"])
        if not hit:
            try:
                hit = from_fallback(w["label"])
            except (urllib.error.URLError, OSError, ValueError) as exc:
                failed.append(f"{w['label']} fallback: {exc}")
        if not hit:
            failed.append(f"{w['match']}: not found in catalog")
            continue
        name, l1, l2 = hit
        if not (checksum_ok(l1) and checksum_ok(l2)):
            failed.append(f"{w['label']}: TLE checksum failed — skipped")
            continue
        sats.append({"label": w["label"], "kind": w["kind"], "name": name,
                     "norad": NORAD.get(w["label"]), "l1": l1, "l2": l2})

    for msg in failed:
        print(f"[warn] {msg}", file=sys.stderr)

    if not sats:
        print("[error] TLE 를 하나도 받지 못해 기존 파일을 유지합니다.", file=sys.stderr)
        return 1

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "CelesTrak GP (public domain orbital elements)",
        "count": len(sats),
        "sats": sats,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[ok] {len(sats)}기 저장 → {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
