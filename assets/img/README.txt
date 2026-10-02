첫 화면(히어로) 지표면용 실사 위성영상 넣는 법
================================================

1) 영상 준비
   · 투영: 등장방형(EPSG:4326 / plate carrée). QGIS·ENVI 등에서 WGS84 경위도로
     리샘플하면 됩니다. UTM/극사투영 상태로 넣으면 지형이 어긋납니다.
   · 범위: 한반도가 가운데 오도록. 권장 105.5°E~149.5°E, 26°N~46°N
     (중국 동해안 ~ 일본 열도까지 들어와 한반도가 또렷하게 읽힙니다)
   · 밴드: 트루컬러(R,G,B). 필요하면 팬샤프닝·색보정한 것.
   · 크기: 가로 3000~6000 px 권장 (그 이상은 페이지가 무거워집니다)
   · 형식: JPEG 품질 80~88. 파일 5 MB 이하가 적당합니다.
   · 파일명: korea-basemap.jpg 로 이 폴더에 저장

2) 설정
   assets/js/content.js 의 config.basemap 을 다음처럼 고칩니다.

     basemap: {
       url: "assets/img/korea-basemap.jpg",
       west: 105.5, east: 149.5, south: 26, north: 46
     },

   west/east/south/north 는 실제 영상의 네 모서리 경위도로 정확히 적어야
   위성 빔이 한반도에 제대로 떨어집니다.

3) 저작권
   · KOMPSAT 영상은 KARI 저작물입니다. 웹 공개용으로 쓰기 전에 배포 조건을
     확인하시고, 페이지 하단(footer.note)에 출처를 적어 두는 것이 안전합니다.
   · 저작권 제약이 없는 대안: NASA Blue Marble / VIIRS (public domain).
