#!/usr/bin/env python3
"""원격탐사 AI 기술동향 수집기.

arXiv API 에서 "원격탐사 × 인공지능" 교집합만 추려 ``data/ai.json`` 으로 저장한다.
홈페이지의 AI Watch 섹션이 이 파일을 읽어 트랙별 최신 논문과 월별 발표량 추이를
그린다. GitHub Actions 에서 매일 실행되며 표준 라이브러리만 사용한다.

두 가지를 수집한다.

1. 트랙별 최신 논문
   파운데이션 모델 / 비전-언어 / SAR 딥러닝 / 자기지도학습 / 에이전틱 AI /
   초해상·복원 여섯 갈래로 나눠 각각 최신 논문을 받아온다.

2. 월별 발표량
   arXiv 응답의 ``opensearch:totalResults`` 를 월 단위 질의로 읽는다.
   목록을 받아 세는 방식은 max_results 상한에 걸려 과소집계되므로,
   건수만 돌려받는 질의(max_results=0)를 월마다 던진다.

한 질의가 실패해도 나머지는 계속 수집하고, 전부 실패하면 기존 파일을 유지한다.

Usage:
    python scripts/fetch_ai.py [--out data/ai.json] [--months 12] [--per-track 5]
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

UA = "Mozilla/5.0 (compatible; sgl-homepage-aiwatch/1.0; +https://sungu-lee.github.io)"
TIMEOUT = 30
POLITE_DELAY = 3.0          # arXiv 가 권고하는 질의 간격(초)

ARXIV_API = "https://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"
OPENSEARCH = "{http://a9.com/-/spec/opensearch/1.1/}"

# 원격탐사 맥락으로 한정하는 공통 조건 — 이게 없으면 일반 CV 논문이 쏟아진다
RS_SCOPE = (
    '(abs:"remote sensing" OR abs:"satellite imagery" OR abs:"earth observation" '
    'OR abs:"aerial imagery" OR abs:"SAR imagery")'
)

# (트랙 키, arXiv 질의) — 트랙 이름·설명은 content.js 에서 국·영문으로 붙인다
TRACKS: list[tuple[str, str]] = [
    ("foundation",
     f'{RS_SCOPE} AND (abs:"foundation model" OR abs:"pretrained model" '
     f'OR abs:"geospatial foundation")'),
    ("vlm",
     f'{RS_SCOPE} AND (abs:"vision-language" OR abs:"multimodal" '
     f'OR abs:"image captioning" OR abs:"visual question answering")'),
    ("sar",
     f'(abs:"SAR" OR abs:"synthetic aperture radar") AND '
     f'(abs:"deep learning" OR abs:"neural network" OR abs:"transformer")'),
    ("ssl",
     f'{RS_SCOPE} AND (abs:"self-supervised" OR abs:"contrastive learning" '
     f'OR abs:"masked autoencoder" OR abs:"few-shot")'),
    ("agentic",
     f'{RS_SCOPE} AND (abs:"large language model" OR abs:"LLM agent" '
     f'OR abs:"agentic" OR abs:"tool use")'),
    ("restoration",
     f'{RS_SCOPE} AND (abs:"super-resolution" OR abs:"pansharpening" '
     f'OR abs:"image restoration" OR abs:"denoising")'),
]

# 월별 추이에 쓰는 하나의 넓은 질의
VOLUME_QUERY = (
    f'{RS_SCOPE} AND (abs:"deep learning" OR abs:"neural network" '
    f'OR abs:"machine learning" OR abs:"transformer" OR abs:"foundation model")'
)

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
ARXIV_VER_RE = re.compile(r"v\d+$")


@dataclass
class Paper:
    """논문 한 건."""

    track: str
    title: str
    authors: str
    url: str
    date: str          # YYYY-MM-DD
    summary: str


def clean(text: str, limit: int = 260) -> str:
    text = html.unescape(TAG_RE.sub(" ", text or ""))
    text = WS_RE.sub(" ", text).strip()
    return text[: limit - 1] + "…" if len(text) > limit else text


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def query(params: dict[str, object]) -> ET.Element:
    return ET.fromstring(fetch(f"{ARXIV_API}?{urllib.parse.urlencode(params)}"))


def parse_date(raw: str) -> str:
    raw = (raw or "").strip()
    for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return raw[:10]


def authors_of(entry: ET.Element, limit: int = 3) -> str:
    names = [
        (a.findtext(f"{ATOM}name") or "").strip()
        for a in entry.findall(f"{ATOM}author")
    ]
    names = [n for n in names if n]
    if not names:
        return ""
    if len(names) <= limit:
        return ", ".join(names)
    return ", ".join(names[:limit]) + f" 외 {len(names) - limit}명"


def latest(track: str, search: str, n: int) -> list[Paper]:
    """트랙의 최신 논문 n 건."""
    root = query(
        {
            "search_query": search,
            "start": 0,
            "max_results": n,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    out: list[Paper] = []
    for entry in root.findall(f"{ATOM}entry"):
        title = clean(entry.findtext(f"{ATOM}title", ""), 200)
        link = (entry.findtext(f"{ATOM}id", "") or "").strip()
        if not title or not link:
            continue
        out.append(
            Paper(
                track=track,
                title=title,
                authors=authors_of(entry),
                url=link.replace("http://", "https://"),
                date=parse_date(entry.findtext(f"{ATOM}published", "")),
                summary=clean(entry.findtext(f"{ATOM}summary", "")),
            )
        )
    return out


def month_spans(months: int) -> list[tuple[str, str, str]]:
    """최근 months 개월의 (라벨, 시작, 끝) 을 오래된 순으로 돌려준다."""
    now = datetime.now(timezone.utc)
    y, m = now.year, now.month
    spans: list[tuple[str, str, str]] = []
    for back in range(months - 1, -1, -1):
        yy, mm = y, m - back
        while mm <= 0:
            mm += 12
            yy -= 1
        if mm == 12:
            ny, nm = yy + 1, 1
        else:
            ny, nm = yy, mm + 1
        spans.append(
            (f"{yy:04d}-{mm:02d}", f"{yy:04d}{mm:02d}010000", f"{ny:04d}{nm:02d}010000")
        )
    return spans


def volume(months: int) -> tuple[list[dict[str, object]], list[str]]:
    """월별 발표 건수. 건수만 받아오므로 상한에 걸리지 않는다."""
    series: list[dict[str, object]] = []
    failed: list[str] = []
    for label, start, end in month_spans(months):
        search = f"{VOLUME_QUERY} AND submittedDate:[{start} TO {end}]"
        try:
            root = query({"search_query": search, "start": 0, "max_results": 1})
            total = root.findtext(f"{OPENSEARCH}totalResults", "0")
            series.append({"month": label, "count": int(total or 0)})
        except urllib.error.HTTPError as exc:
            body = ""
            try:
                body = exc.read().decode("utf-8", "replace")[:160].replace("\n", " ")
            except Exception:
                pass
            failed.append(f"volume/{label}: HTTP {exc.code} {body}")
        except (urllib.error.URLError, ET.ParseError, OSError, ValueError) as exc:
            failed.append(f"volume/{label}: {type(exc).__name__}: {exc}")
            series.append({"month": label, "count": None})
        time.sleep(POLITE_DELAY)
    return series, failed


def dedupe(papers: list[Paper]) -> list[Paper]:
    seen: set[str] = set()
    out: list[Paper] = []
    for p in papers:
        key = ARXIV_VER_RE.sub("", p.url)
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="data/ai.json", type=Path)
    ap.add_argument("--months", default=12, type=int, help="월별 추이 기간")
    ap.add_argument("--per-track", default=5, type=int, help="트랙별 논문 수")
    args = ap.parse_args()

    papers: list[Paper] = []
    failed: list[str] = []
    counts: dict[str, int] = {}

    for track, search in TRACKS:
        try:
            got = latest(track, search, args.per_track)
            papers += got
            counts[track] = len(got)
        except (urllib.error.URLError, ET.ParseError, OSError) as exc:
            failed.append(f"{track}: {exc}")
            counts[track] = 0
        time.sleep(POLITE_DELAY)

    series, vol_failed = volume(args.months)
    failed += vol_failed

    papers = dedupe(papers)
    papers.sort(key=lambda p: p.date, reverse=True)

    for msg in failed:
        print(f"[warn] {msg}", file=sys.stderr)

    if not papers and not any(s["count"] for s in series):
        print("[error] 아무것도 받지 못해 기존 파일을 유지합니다.", file=sys.stderr)
        return 1

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "arXiv API (cs.CV · cs.LG · eess.IV), filtered to Earth-observation context",
        "window": f"last {args.months} months",
        "trackCounts": counts,
        "volume": series,
        "count": len(papers),
        "papers": [asdict(p) for p in papers],
        "warnings": failed[:20],
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"[ok] 논문 {len(papers)}건 · 월별 {len(series)}개 구간 → {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
