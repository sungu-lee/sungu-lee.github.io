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

# 원격탐사 맥락으로 한정하는 공통 조건
RS = ('(abs:"remote sensing" OR abs:"satellite" OR abs:"earth observation" '
      'OR abs:"spaceborne")')

# (표시 카테고리, arXiv search_query)
#   고해상도 지구관측 → 표준영상(L1) → L2 부가산출물 → 센서 도메인별 활용
#   순서로, 연구 흐름을 그대로 따라간다. AI 적용 여부는 질의로 거르지 않고
#   수집 후 is_ai() 로 표시한다 — 비(非)AI 쪽 진전도 놓치지 않기 위해서다.
ARXIV_QUERIES: list[tuple[str, str]] = [
    ("High-resolution EO",
     f'{RS} AND (abs:"high-resolution" OR abs:"very high resolution" '
     f'OR abs:"sub-meter" OR abs:"submeter")'),
    ("Standard products · L1",
     f'{RS} AND (abs:"radiometric calibration" OR abs:"geometric correction" '
     f'OR abs:"orthorectification" OR abs:"sensor model" OR abs:"image registration" '
     f'OR abs:"vicarious calibration")'),
    ("L2 value-added",
     f'{RS} AND (abs:"atmospheric correction" OR abs:"surface reflectance" '
     f'OR abs:"biophysical" OR abs:"vegetation index" OR abs:"soil moisture" '
     f'OR abs:"land cover")'),
    ("SAR",
     '(abs:"synthetic aperture radar" OR abs:"SAR imagery") AND '
     '(abs:"polarimetric" OR abs:"interferometric" OR abs:"backscatter" '
     'OR abs:"despeckling" OR abs:"deep learning")'),
    ("Optical · multispectral",
     f'{RS} AND (abs:"multispectral" OR abs:"pansharpening" '
     f'OR abs:"panchromatic" OR abs:"super-resolution")'),
    ("Hyperspectral",
     'abs:"hyperspectral" AND (abs:"remote sensing" OR abs:"satellite" '
     'OR abs:"unmixing" OR abs:"classification")'),
    ("Multi-sensor fusion",
     f'{RS} AND (abs:"data fusion" OR abs:"multi-sensor" OR abs:"multimodal" '
     f'OR abs:"cross-sensor")'),
]

# AI 적용 연구를 가려내는 표지 — 제목·초록에서 찾는다
AI_RE = re.compile(
    r"\b(deep learning|neural network|transformer|foundation model|self-supervised|"
    r"convolutional|machine learning|diffusion model|vision-language|segment anything|"
    r"large language model|attention mechanism|generative adversarial)\b",
    re.I,
)

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
    ai: bool = False   # AI 기법을 쓴 연구인지


def is_ai(title: str, summary: str) -> bool:
    """AI 기법을 적용한 연구인지 제목·초록으로 판별한다."""
    return bool(AI_RE.search(f"{title} {summary}"))


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
        summary = clean(entry.findtext(f"{ATOM}summary", ""))
        out.append(
            Item(
                source="arXiv",
                cat=cat,
                title=title,
                url=link.replace("http://", "https://"),
                date=parse_date(entry.findtext(f"{ATOM}published", "")),
                summary=summary,
                ai=is_ai(title, entry.findtext(f"{ATOM}summary", "") or ""),
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


def _rev(date: str) -> str:
    """문자열 날짜를 내림차순 정렬 키로 바꾼다(최신이 앞)."""
    return "".join(chr(ord("9") - int(ch)) if ch.isdigit() else ch for ch in date)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/trends.json", type=Path)
    ap.add_argument("--max", default=21, type=int, help="저장할 최대 항목 수")
    args = ap.parse_args()

    items, failed = collect()
    for msg in failed:
        print(f"[warn] {msg}", file=sys.stderr)

    if not items:
        print("[error] 수집된 항목이 없어 기존 파일을 유지합니다.", file=sys.stderr)
        return 1

    items = dedupe(items)
    # AI 적용 연구를 앞세우되(요청 사항), 같은 그룹 안에서는 최신순
    items.sort(key=lambda i: (not i.ai, _rev(i.date)))
    items = items[: args.max]

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sources": sorted({i.source for i in items}),
        "count": len(items),
        "aiCount": sum(1 for i in items if i.ai),
        "categories": [c for c, _ in ARXIV_QUERIES],
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
