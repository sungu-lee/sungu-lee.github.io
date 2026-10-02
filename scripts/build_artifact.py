#!/usr/bin/env python3
"""claude.ai 아티팩트(웹 미리보기)용 단일 페이지를 만든다.

아티팩트 뷰어는 게시 시점에 ``<!doctype html><head>…</head><body>`` 껍데기를
자동으로 씌우므로, 본문 조각만 남긴 파일을 만들어야 한다. 또한 뷰어는
외부 iframe·이미지를 차단하므로 ``window.ARTIFACT_MODE`` 를 켜서 영상
카드를 링크 카드로 바꾼다.

원본은 ``index.html`` 하나뿐이고 이 스크립트는 거기서 파생물을 만들 뿐이므로
내용을 두 곳에서 관리할 필요가 없다.

Usage:
    python scripts/build_artifact.py            # build/artifact.html 생성
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "build" / "artifact.html"

TITLE = "Sun-Gu Lee | Radiometric Calibration · SAR · Satellite Applications"

# 아티팩트 CSP: 외부 스타일시트는 Google Fonts 만 허용된다(Pretendard CDN 은 차단).
HEAD = """<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<style>
  /* 아티팩트 환경에서는 Pretendard 대신 Noto Sans KR 을 쓴다 */
  :root{{--sans:"Noto Sans KR",-apple-system,BlinkMacSystemFont,"Segoe UI","Malgun Gothic",system-ui,sans-serif}}
  body{{padding:0}}
</style>
<script>window.ARTIFACT_MODE = true;</script>
""".format(title=TITLE)


def body_of(html: str) -> str:
    """<body> … </body> 안쪽만 추출한다."""
    m = re.search(r"<body[^>]*>(.*)</body>", html, re.S | re.I)
    if not m:
        raise SystemExit("index.html 에서 <body> 를 찾지 못했습니다.")
    return m.group(1).strip()


def main() -> int:
    if not SRC.exists():
        raise SystemExit(f"원본을 찾을 수 없습니다: {SRC}")
    body = body_of(SRC.read_text(encoding="utf-8"))

    # skip 링크는 아티팩트 뷰어에서 의미가 없으므로 그대로 두되, 본문만 붙인다.
    out = HEAD + "\n" + body + "\n"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(f"[ok] {len(out):,} bytes → {OUT.relative_to(ROOT)}")
    print("     함께 게시할 파일: assets/css/style.css, assets/js/*.js, data/trends.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
