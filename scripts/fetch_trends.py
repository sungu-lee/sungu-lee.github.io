#!/usr/bin/env python3
"""최신 연구동향 자동 수집기.

arXiv API 와 NASA / ESA 공개 RSS 피드에서 원격탐사·위성 관련 최신 항목을
모아 ``data/trends.json`` 으로 저장한다. GitHub Actions 에서 매일 실행되며,
표준 라이브러리만 사용하므로 별도 설치가 필요 없다.

한 소스가 실패해도 나머지는 계속 수집하고, 전부 실패하면 기존 파일을 유지한다.

Usage:
    python scripts/fetch_trends.py [--out data/trends.json] [--max 18]
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

UA = "Mozilla/5.0 (compatible; sgl-homepage-trends/1.0; +https://github.com)"
TIMEOUT = 25

ARXIV_API = "http://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"

# (표시 카테고리, arXiv search_query) — 관심 주제를 늘리려면 여기에 추가
ARXIV_QUERIES: list[tuple[str, str]] = [
    ("Remote Sensing AI", 'abs:"remote sensing" AND (cat:eess.IV OR cat:cs.CV)'),
    ("Satellite Imagery", 'abs:"satellite imagery" AND (cat:cs.CV OR cat:eess.IV)'),
    ("Sea Ice", 'abs:"sea ice"'),
    ("Forest / Vegetation", 'abs:"forest" AND abs:"remote sensing"'),
    ("Calibration", 'abs:"radiometric calibration"'),
]

# (표시 소스, 카테고리, RSS URL)
RSS_FEEDS: list[tuple[str, str, str]] = [
    ("NASA", "Earth Observatory",
     "https://earthobservatory.nasa.gov/feeds/earth-observatory.rss"),
    ("ESA", "Observing the Earth",
     "https://www.esa.int/rssfeed/Our_Activities/Observing_the_Earth"),
]

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
ARXIV_VER_RE = re.compile(r"v\d+$")


@dataclass
class Item:
    """피드 한 건."""

    source: str
    cat: str
    title: str
    url: str
    date: str          # YYYY-MM-DD
    summary: str


def clean(text: str, limit: int = 240) -> str:
    """HTML 태그와 여분 공백을 제거하고 길이를 제한한다."""
    text = html.unescape(TAG_RE.sub(" ", text or ""))
    text = WS_RE.sub(" ", text).strip()
    return text[: limit - 1] + "…" if len(text) > limit else text


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def parse_date(raw: str) -> str:
    """다양한 날짜 표기를 YYYY-MM-DD 로 정규화한다."""
    raw = (raw or "").strip()
    for fmt in (
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%d",
    ):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return raw[:10]


def from_arxiv(cat: str, query: str, n: int = 6) -> list[Item]:
    params = urllib.parse.urlencode(
        {
            "search_query": query,
            "start": 0,
            "max_results": n,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    root = ET.fromstring(fetch(f"{ARXIV_API}?{params}"))
    out: list[Item] = []
    for entry in root.findall(f"{ATOM}entry"):
        title = clean(entry.findtext(f"{ATOM}title", ""), 200)
        link = entry.findtext(f"{ATOM}id", "").strip()
        if not title or not link:
            continue
        out.append(
            Item(
                source="arXiv",
                cat=cat,
                title=title,
                url=link.replace("http://", "https://"),
                date=parse_date(entry.findtext(f"{ATOM}published", "")),
                summary=clean(entry.findtext(f"{ATOM}summary", "")),
            )
        )
    return out


def from_rss(source: str, cat: str, url: str, n: int = 6) -> list[Item]:
    root = ET.fromstring(fetch(url))
    out: list[Item] = []
    # RSS 2.0 (channel/item) 과 Atom (entry) 를 모두 처리
    entries = root.findall(".//item") or root.findall(f".//{ATOM}entry")
    for entry in entries[:n]:
        title = clean(entry.findtext("title") or entry.findtext(f"{ATOM}title") or "", 200)
        link = entry.findtext("link") or ""
        if not link:
            node = entry.find(f"{ATOM}link")
            link = node.get("href", "") if node is not None else ""
        if not title or not link:
            continue
        raw_date = (
            entry.findtext("pubDate")
            or entry.findtext(f"{ATOM}published")
            or entry.findtext(f"{ATOM}updated")
            or ""
        )
        out.append(
            Item(
                source=source,
                cat=cat,
                title=title,
                url=link.strip(),
                date=parse_date(raw_date),
                summary=clean(
                    entry.findtext("description")
                    or entry.findtext(f"{ATOM}summary")
                    or ""
                ),
            )
        )
    return out


def collect() -> tuple[list[Item], list[str]]:
    """모든 소스를 순회하며 수집한다. (항목, 실패한 소스명) 을 돌려준다."""
    items: list[Item] = []
    failed: list[str] = []

    for cat, query in ARXIV_QUERIES:
        try:
            items += from_arxiv(cat, query)
        except (urllib.error.URLError, ET.ParseError, OSError) as exc:
            failed.append(f"arXiv/{cat}: {exc}")

    for source, cat, url in RSS_FEEDS:
        try:
            items += from_rss(source, cat, url)
        except (urllib.error.URLError, ET.ParseError, OSError) as exc:
            failed.append(f"{source}: {exc}")

    return items, failed


def dedupe(items: list[Item]) -> list[Item]:
    seen: set[str] = set()
    out: list[Item] = []
    for it in items:
        # arXiv 는 같은 논문의 v1/v2 를 한 건으로 묶는다
        key = ARXIV_VER_RE.sub("", it.url) if "arxiv.org/abs/" in it.url else it.url
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/trends.json", type=Path)
    ap.add_argument("--max", default=18, type=int, help="저장할 최대 항목 수")
    args = ap.parse_args()

    items, failed = collect()
    for msg in failed:
        print(f"[warn] {msg}", file=sys.stderr)

    if not items:
        print("[error] 수집된 항목이 없어 기존 파일을 유지합니다.", file=sys.stderr)
        return 1

    items = dedupe(items)
    items.sort(key=lambda i: i.date, reverse=True)
    items = items[: args.max]

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sources": sorted({i.source for i in items}),
        "count": len(items),
        "items": [asdict(i) for i in items],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"[ok] {len(items)}건 저장 → {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
