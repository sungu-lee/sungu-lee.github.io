# 배포 가이드 — GitHub Pages + UST 교원홈페이지 연결

이 폴더의 파일을 그대로 GitHub에 올리면 무료로 영구 URL이 생깁니다.
서버·도메인 비용 없음, 수정 후 재업로드 5초, HTTPS 자동 적용.

---

## 0. 준비 (10분, 최초 1회)

1. https://github.com/join 에서 계정 생성
   - **사용자명(username)이 곧 홈페이지 주소가 됩니다.**
     예: `sungulee` → `https://sungulee.github.io`
   - 권장: `sungulee`, `sglee-kari`, `sunguleekari` 처럼 이름 기반의 짧은 영문
   - 기관 이메일 또는 개인 이메일 중 장기적으로 유지할 쪽으로 가입
2. 이메일 인증 완료

---

## 1. 저장소 생성 (3분)

1. 로그인 후 우측 상단 `+` → **New repository**
2. 설정값
   | 항목 | 값 |
   |---|---|
   | Repository name | `<username>.github.io` ← **반드시 이 형식** (예: `sungulee.github.io`) |
   | Description | `Personal homepage` (선택) |
   | Public / Private | **Public** (Pages 무료 사용 조건) |
   | Add a README file | 체크 해제 |
3. **Create repository**

> `<username>.github.io` 이름으로 만들면 주소가 `https://<username>.github.io/` 로 깔끔하게 나옵니다.
> 다른 이름(예: `homepage`)으로 만들면 주소가 `https://<username>.github.io/homepage/` 가 됩니다.

---

## 2. 파일 업로드 (5분)

### 방법 A — 웹 드래그 앤 드롭 (Git 설치 불필요, 권장)

1. 방금 만든 저장소 첫 화면에서 **uploading an existing file** 링크 클릭
   (이미 파일이 있다면 `Add file` → `Upload files`)
2. 탐색기에서 `D:\UST교원관련\homepage` 폴더를 열고
   **폴더 안의 내용물 전체**(`index.html`, `assets`, `data`, `scripts`, `.nojekyll` 등)를 드래그
   - ⚠️ `homepage` 폴더 자체를 드래그하면 한 단계 더 들어간 경로가 되어 페이지가 안 뜹니다.
     반드시 **폴더를 열고 그 안의 항목들**을 드래그하세요.
   - ⚠️ `.nojekyll` 은 점(.)으로 시작해 탐색기에서 숨겨질 수 있습니다.
     [보기] → [표시] → [숨긴 항목] 을 켜고 함께 올리세요.
   - `workflow-update-trends.yml` 은 3-1 단계에서 따로 처리하므로 지금은 같이 올려도 되고 빼도 됩니다.
3. 하단 **Commit changes** 클릭

### 방법 B — Git 명령 (PowerShell)

```powershell
cd D:\UST교원관련\homepage
git init
git add .
git commit -m "Initial homepage"
git branch -M main
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

---

## 3. Pages 활성화 (2분)

1. 저장소 상단 **Settings** → 좌측 메뉴 **Pages**
2. *Build and deployment* 항목
   - Source: **Deploy from a branch**
   - Branch: **main** / 폴더: **/ (root)** → **Save**
3. 1~3분 후 같은 화면 상단에 주소가 표시됩니다:
   `https://<username>.github.io/`

> 처음에는 404가 뜰 수 있습니다. 2~3분 기다렸다가 새로고침(Ctrl+F5)하세요.

---

## 3-1. 최신 연구동향 자동 갱신 켜기 (5분, 중요)

GitHub Actions 가 매일 새 논문·뉴스를 모아 `data/trends.json` 을 갱신하고
저장소에 커밋합니다. 아래 두 단계를 한 번만 해두면 이후로는 손댈 일이 없습니다.

**(1) 워크플로 파일 만들기**

`D:\UST교원관련\homepage\workflow-update-trends.yml` 의 내용을 GitHub 저장소 안의
`.github/workflows/update-trends.yml` 경로로 옮겨야 합니다. 웹에서 바로 만드는 게 가장 쉽습니다.

1. 저장소 첫 화면 → **Add file** → **Create new file**
2. 파일명 칸에 아래를 **그대로 입력** (슬래시를 치면 폴더가 자동 생성됩니다)
   ```
   .github/workflows/update-trends.yml
   ```
3. 메모장으로 `workflow-update-trends.yml` 을 열어 전체 복사 → 편집창에 붙여넣기
4. **Commit changes**
5. 저장소에 올라간 `workflow-update-trends.yml`(루트에 있는 것)은 지워도 됩니다.

> Git 명령을 쓴다면 이 과정 없이 로컬에서 `.github\workflows\` 폴더를 만들어
> 파일을 옮긴 뒤 push 하면 됩니다.

**(2) 커밋 권한 열기**

1. 저장소 **Settings** → 좌측 **Actions** → **General**
2. 맨 아래 *Workflow permissions* → **Read and write permissions** 선택 → **Save**
3. 상단 **Actions** 탭 → 좌측 목록에서 **Update research trends** 클릭
   → 우측 **Run workflow** → **Run workflow** (첫 수집 즉시 실행)
4. 1~2분 뒤 초록 체크 표시가 뜨면 홈페이지 첫 화면의 동향 카드가 채워집니다.

> 실패(빨간 X)하면 로그를 열어 확인하세요. 대부분 2번 권한 설정 누락입니다.
> 수집 키워드는 `scripts/fetch_trends.py` 의 `ARXIV_QUERIES` / `RSS_FEEDS` 에서 조정합니다.
> 국내 기관 RSS(KARI 보도자료 등)를 추가하고 싶으면 `RSS_FEEDS` 에 한 줄 추가하면 됩니다.

---

## 4. 동작 확인 체크리스트

- [ ] 첫 화면 위성 애니메이션이 움직임 (구형 기기·저사양에서는 정지 화면이 정상)
- [ ] 최신 연구동향 카드가 흐르고, 마우스를 올리면 멈춤
- [ ] 한/영 토글(우측 상단 `EN` 버튼) 정상 전환
- [ ] 우측 관측 콘솔의 밴드 막대가 움직이고 처리 단계가 순차 진행
- [ ] 영상 썸네일 표시 및 클릭 시 재생
- [ ] 연구분야 카드 6종 다이어그램 표시
- [ ] 모바일(휴대폰)에서 햄버거 메뉴 동작
- [ ] 이메일 링크 클릭 시 메일 작성 창

---

## 5. UST 교원홈페이지에 링크 연결

UST는 교원 개인 홈페이지 URL을 교원 정보에 등록해 공개 교수진 페이지에서 연결해 줍니다.
아래 두 경로 중 하나로 진행하세요.

**경로 1 — UST 학사정보시스템에서 직접 등록**
1. UST 학사정보시스템 로그인 → `교원인사` → `교원정보관리` → `교원마스터`
2. 교번 `23885` 조회 → **기본정보** 탭
3. 홈페이지/URL 입력란에 `https://<username>.github.io/` 입력 → **저장**
4. 입력란이 없거나 수정 권한이 잠겨 있으면 → 경로 2

**경로 2 — 학사 담당 부서에 요청**
UST 학사팀(또는 KARI 스쿨 행정 담당)에 아래 내용으로 요청 메일 발송:

> 안녕하십니까. 한국항공우주연구원 스쿨 항공우주시스템공학 전공 이선구입니다.
> 교원 소개 페이지에 개인 연구 홈페이지 링크 등록을 요청드립니다.
> - 교번: 23885
> - 성명: 이선구
> - 홈페이지 URL: https://<username>.github.io/
> 확인 부탁드립니다. 감사합니다.

**추가로 링크를 걸어두면 좋은 곳**
- KARI 연구자 프로필 / 내부 인트라넷 서명
- 논문 투고 시 corresponding author 정보
- ORCID, Google Scholar 프로필의 Homepage 항목
- 학회(대한원격탐사학회 등) 임원 소개란
- 이메일 서명 하단

---

## 6. 이후 수정하는 법

내용 수정은 **`assets/js/content.js` 한 파일**만 고치면 됩니다.

1. `D:\UST교원관련\homepage\assets\js\content.js` 를 메모장/VS Code로 열어 수정
2. 저장 후 브라우저에서 `index.html` 을 열어 확인 (로컬에서 바로 확인 가능)
3. GitHub 저장소 → 해당 파일 클릭 → 연필(✏️) 아이콘 → 내용 붙여넣기 → **Commit changes**
4. 1분 내 사이트 반영

**자주 하는 수정**
| 하고 싶은 것 | 수정 위치 (content.js) |
|---|---|
| 이메일 변경 | `config.email` |
| 콘솔 문구·처리단계 | `hero.console` |
| 논문 추가 | `ko.publications.papers` 배열에 항목 추가 (영문은 `en.publications.papers`) |
| 특허 추가 | `ko.publications.patents` / `en.publications.patents` |
| 학력 추가 | `ko.about.education` / `en.about.education` (비어 있으면 섹션 자동 숨김) |
| 과제 추가 | `ko.research.projects` / `en.research.projects` |
| ORCID·Scholar 링크 | `config.links.orcid`, `config.links.googleScholar` (비우면 자동 숨김) |
| 영상 추가 | `media.videos` — YouTube 주소 `v=` 뒤 11자리 id |
| 결과 이미지 추가 | `assets/img/gallery/` 에 넣고 `media.gallery` 에 항목 추가 |
| 색상 변경 | `assets/css/style.css` 최상단 `:root` 의 `--navy`, `--teal` |

> ⚠️ `content.js` 편집 시 따옴표 `"`, 쉼표 `,`, 중괄호 `{}` 를 지우지 않도록 주의하세요.
> 사이트가 빈 화면으로 뜨면 브라우저에서 `F12` → Console 탭에 오류 위치가 표시됩니다.

---

## 7. (선택) 개인 도메인 연결

`sungulee.kr` 같은 도메인을 쓰려면:
1. 가비아/후이즈 등에서 도메인 구입
2. DNS에 `CNAME` 레코드 → `<username>.github.io`
3. 저장소 Settings → Pages → Custom domain 에 도메인 입력 → Save
4. `Enforce HTTPS` 체크
