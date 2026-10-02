# 이선구 개인 홈페이지

한국항공우주연구원(KARI) 책임연구원 · UST 한국항공우주연구원 스쿨 부교수 개인 홈페이지.
빌드 도구 없이 동작하는 정적 사이트입니다. `index.html` 을 더블클릭하면 로컬에서 바로 확인됩니다.

## 구조

```
homepage/
├─ index.html                       # 페이지 뼈대 (거의 수정할 일 없음)
├─ assets/
│  ├─ css/style.css                 # 디자인. :root 변수로 색/폰트 조정
│  ├─ js/content.js                 # ★ 모든 텍스트·논문·특허·영상 데이터 (여기만 수정)
│  ├─ js/main.js                    # content.js 를 화면에 렌더링 (수정 불필요)
│  ├─ js/hero.js                    # 첫 화면 우주·위성 편대 애니메이션 (Canvas)
│  ├─ js/diagrams.js                # 연구분야 카드 SVG 다이어그램 8종
│  └─ img/gallery/                  # (연구 결과 이미지를 여기에 넣으세요)
├─ files/                           # 연구분야 카드에서 링크하는 원문 PDF (README.txt 참고)
├─ data/trends.json                 # 최신 연구동향 — GitHub Actions 가 매일 자동 갱신
├─ scripts/fetch_trends.py          # 동향 수집기 (표준 라이브러리만 사용)
├─ scripts/build_artifact.py        # 웹 미리보기(아티팩트)용 페이지 생성
├─ build/artifact.html              # 위 스크립트 산출물
├─ workflow-update-trends.yml       # → GitHub 에서 .github/workflows/update-trends.yml 로 만들 것 (DEPLOY.md 3-1)
├─ .nojekyll                        # GitHub Pages 처리 옵션 (삭제 금지)
├─ DEPLOY.md                        # 배포 및 UST 연결 가이드
└─ README.md
```

## 화면 구성

1. **첫 화면(다크)** — 별·지구 림·극궤도·관측 스캔빔이 Canvas 로 실시간 렌더링.
   KOMPSAT-3 · 3A · 5 · 7 · NEONSAT 편대가 실제 형상 특징(광학 망원경 / 적외선 모듈 /
   측면 지향 SAR 안테나 / 대구경 망원경 / 초소형 군집)을 반영해 차례로 궤도를 통과합니다.
   우측에 관측·처리 콘솔(분광 밴드 응답 · 처리 단계 진행 · 편대 목록 · AEISS 제원).
   콘솔은 연구 처리 흐름을 보여주는 개념 시연이며 실시간 위성 자료가 아닙니다.
   인물 사진은 사용하지 않습니다.
   외부 이미지 0바이트, 저사양 기기와 `prefers-reduced-motion` 환경에서는 정지 화면으로 전환.
2. **최신 연구동향 스트립** — 첫 화면 하단. arXiv·NASA·ESA 최신 항목이 흐르며, 마우스를 올리면 정지.
3. **소개 / 연구분야 / 영상·자료 / 성과 / UST 교원활동 / 연락처** — 밝은 톤 본문.
   연구분야 8개 카드에는 각각 주제를 설명하는 원본 SVG 다이어그램이 들어갑니다.
   순서는 주 전공 우선 — 복사 검보정 → SAR 활용 → 융복합활용 → 그 밖의 활용 연구.

## 수정 방법

**내용 변경은 `assets/js/content.js` 한 파일에서 끝납니다.** 영문이 기본이라 `en:` 블록이
먼저 오고, 한국어는 `ko:` 블록에 같은 구조로 들어 있습니다. `TODO` 주석이 달린 곳을 먼저 채우세요.

| 하고 싶은 것 | 수정 위치 |
|---|---|
| 기본 언어 | `config.defaultLang` (현재 `"en"` — 방문자에게 영문이 먼저 보임) |
| 이메일 변경 | `config.email` |
| 논문·학회 추가 | `en.publications.papers` / `ko.publications.papers` (`status` 넣으면 상태 배지 표시) |
| 프로그램 등록 추가 | `publications.software` |
| 특허 추가 | `ko.publications.patents` / `en.publications.patents` |
| 학력 추가 | `ko.about.education` / `en.about.education` (비면 섹션 자동 숨김) |
| 과제 추가 | `ko.research.projects` / `en.research.projects` |
| **영상 추가** | `ko.media.videos` / `en.media.videos` — YouTube 주소의 `v=` 뒤 11자리 id 만 넣으면 됨 |
| **결과 이미지 추가** | 이미지를 `assets/img/gallery/` 에 넣고 `ko.media.gallery` / `en.media.gallery` 에 `{src,title,caption}` 추가 (비면 자동 숨김) |
| 히어로 위성 편대 | `config.fleet` — 이름·부제·형상(kind: optical / optical-ir / optical-hr / sar / cluster) |
| 관측 콘솔 문구·단계 | `ko.hero.console` / `en.hero.console` |
| 위성 제원 패널 | `ko.hero.hud` / `en.hero.hud` |
| 연구분야 그림 교체 | `research.areas[].viz` 값: `calval` `sar` `fusion` `indices` `forest` `seaice` `ai` `ontology` |
| 연구분야 링크 추가 | `research.areas[].refs` — `{ label, url, kind }`, kind 는 `doi`(외부 링크) 또는 `pdf`(files/ 안의 파일) |
| 동향 수집 키워드 | `scripts/fetch_trends.py` 의 `ARXIV_QUERIES` / `RSS_FEEDS` |
| 색상 변경 | `assets/css/style.css` 최상단 `:root` |

> ⚠️ `content.js` 편집 시 따옴표 `"`, 쉼표 `,`, 중괄호 `{}` 를 지우지 않도록 주의하세요.
> 사이트가 빈 화면으로 뜨면 브라우저에서 `F12` → Console 탭에 오류 위치가 표시됩니다.

## 연구분야 카드의 링크

각 연구분야 카드 하단의 **관련 성과(RELATED OUTPUTS)** 는 `content.js` 의
`research.areas[].refs` 에서 옵니다.

- `kind: "doi"` → 출판사 DOI 페이지로 새 탭 열기 (링크만 걸므로 저작권 문제 없음)
- `kind: "pdf"` → `files/` 폴더의 원문 PDF 직접 링크

`files/` 에는 **재배포가 허용된 파일만** 넣으세요. 현재는 MDPI 오픈액세스(CC BY 4.0)
논문 2편이 들어 있습니다. IEEE·SPIE·Springer·Elsevier 구독형 논문 PDF는 올리면 안 되고
DOI 링크만 걸어야 합니다. 자세한 내용은 `files/README.txt` 참고.

## 영상에 대하여

영상은 mp4 직접 업로드가 아니라 **YouTube 임베드**입니다. GitHub 은 파일 하나가 100MB 를
넘으면 거부하고 Pages 대역폭도 제한되기 때문입니다. 본인 발표·강의 영상은 YouTube 에
'일부공개(Unlisted)' 로 올린 뒤 id 만 `content.js` 에 넣으면 됩니다.
썸네일만 먼저 불러오고 클릭할 때 재생기를 삽입하므로 첫 로딩이 느려지지 않습니다.

현재 들어 있는 영상은 한국항공우주연구원 KARI TV(아리랑 3호 임무연장 · 아리랑 7호 발사),
ESA, NASA Goddard 공식 채널의 공개 영상입니다.

## 최신 연구동향 자동 갱신

`scripts/fetch_trends.py` 가 arXiv API 와 NASA Earth Observatory · ESA Observing the Earth
RSS 를 읽어 `data/trends.json` 에 저장하고, GitHub Actions 가 **매일 06:00 KST** 에 실행해
변경분을 자동 커밋합니다. 브라우저에서 직접 외부 API 를 호출하지 않으므로 CORS 나
응답 지연으로 화면이 비는 일이 없습니다.

로컬에서 미리 채워보려면:

```powershell
cd D:\UST교원관련\homepage
python scripts/fetch_trends.py
```

## 의존성

없음. Pretendard 웹폰트만 CDN(jsdelivr)에서 불러오며, 차단된 환경에서는
시스템 기본 한글 폰트로 자동 대체됩니다. 동향 수집기도 Python 표준 라이브러리만 씁니다.

## 배포

`DEPLOY.md` 참조 — GitHub Pages 무료 호스팅, Actions 권한 설정, UST 교원홈페이지 링크 등록 절차.
