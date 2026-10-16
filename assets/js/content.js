/* =============================================================================
 *  content.js — 홈페이지의 모든 텍스트/데이터가 이 파일 하나에 들어 있습니다.
 *  HTML/CSS를 건드릴 필요 없이 여기만 수정하면 사이트 전체에 반영됩니다.
 *
 *  ※ 기본 언어는 영문(en)입니다. config.defaultLang 으로 변경하세요.
 *  ※ 실적 자료 출처: Sungu_CV_4.docx, 우수연구원 공적조서(2026.05),
 *     ust 교원지원참고자료.hwpx, sci정리중.xlsx, 특허증 PDF, 연구책임자경력.PNG
 *  ※ 연구분야 카드의 viz 값: calval · sar · fusion · indices · forest · seaice · ai · ontology
 * ========================================================================== */

const SITE = {
  /* ---- 공통(언어 무관) 설정 ------------------------------------------- */
  config: {
    defaultLang: "en",               // 방문자에게 먼저 보이는 언어
    email: "leesg@kari.re.kr",
    phone: "+82-42-860-2854",        // CV 기재 번호. 비우면 표시 안 됨
    aiUrl: "data/ai.json",
    trendsUrl: "data/trends.json",
    tleUrl: "data/tle.json",       // GitHub Actions 가 매일 CelesTrak 에서 갱신
    // 첫 화면 애니메이션에 그려지는 위성 편대 (순서대로 궤도를 통과)
    /* 첫 화면 지표면에 쓸 실사 위성영상.
       등장방형(EPSG:4326, plate carrée)으로 리샘플한 트루컬러 영상을
       assets/img/ 에 넣고 아래 경로와 경위도 범위를 적으면 그 영상이
       한반도 지표면으로 깔린다. null 이면 해안선 벡터 지도로 대체된다.
         예: { url: "assets/img/korea-basemap.jpg",
               west: 105.5, east: 149.5, south: 26, north: 46 }              */
    basemap: null,

    fleet: [
      { label: "KOMPSAT-3",  sub: "AEISS · 685 km · PAN 0.7 m",      kind: "optical" },
      { label: "KOMPSAT-3A", sub: "AEISS-A · PAN 0.55 m",           kind: "optical-ir" },
      { label: "KOMPSAT-5",  sub: "COSI · X-band SAR",               kind: "sar" },
      { label: "KOMPSAT-7",  sub: "AEISS-HR · PAN 0.3 m",           kind: "optical-hr" },
      { label: "NEONSAT",    sub: "초소형 군집위성 · NEONSAT-1",     kind: "cluster" }
    ],
    links: {
      kari: "https://www.kari.re.kr",
      ust: "https://www.ust.ac.kr",
      ustSchool: "https://www.ust.ac.kr",  // TODO: KARI 스쿨 페이지 URL
      orcid: "",
      googleScholar: "",
      researchGate: ""
    }
  },

  /* ---- English (primary) ---------------------------------------------- */
  en: {
    meta: {
      title: "Sun-Gu Lee | Radiometric Calibration · SAR · Satellite Applications",
      description:
        "Principal Researcher at KARI, Associate Professor at UST KARI School. Radiometric calibration of the KOMPSAT series, SAR applications, and multi-sensor convergence for Earth observation."
    },
    nav: {
      home: "Home", tracking: "Live Map", about: "About", research: "Research",
      aiwatch: "AI Watch", media: "Media", publications: "Publications", teaching: "Teaching",
      apps: "Simulator", sites: "Links", contact: "Contact"
    },
    hero: {
      eyebrow: "Radiometric calibration · SAR · Multi-sensor convergence",
      name: "Sun-Gu Lee",
      nameSub: "이선구, Ph.D.",
      roles: [
        "Principal Researcher, Satellite Application Research Team, KARI",
        "Associate Professor, UST KARI School (Aerospace System Engineering)"
      ],
      tagline:
        "My discipline is radiometric calibration — making the numbers a satellite records physically trustworthy. On that foundation I work on optical and SAR image applications, and on fusing the Korean satellite constellation into measurements of soil moisture, forests, ice and crops.",
      cta: [
        { label: "Research Areas", href: "#research" },
        { label: "Student Supervision", href: "#teaching", ghost: true }
      ],
      stats: [
        { value: "20+", label: "years at KARI (since 2001)" },
        { value: "₩24.2B", label: "as PI, Satellite Application Program 2022–2026" },
        { value: "K3·3A·5·7", label: "cal-val & applications · CAS500-1 · NEONSAT" }
      ],
      hud: {
        title: "KOMPSAT-3 · Arirang-3",
        rows: [
          { k: "Orbit", v: "Sun-synchronous 685 km · i 98.13°" },
          { k: "Crossing", v: "LTAN 13:30" },
          { k: "AEISS", v: "PAN 0.7 m · MS 2.8 m" },
          { k: "Bands", v: "B · G · R · NIR (450–900 nm)" }
        ],
        note: "Launched 17 May 2012 · primary research platform"
      },
      console: {
        title: "AEISS processing pipeline",
        status: "ACQUIRING",
        bandHeading: "Spectral band response",
        bands: [
          { k: "B", nm: "450–520 nm" }, { k: "G", nm: "520–600 nm" },
          { k: "R", nm: "630–690 nm" }, { k: "NIR", nm: "760–900 nm" }
        ],
        sampleHeading: "Sample scene at this stage",
        sampleTags: [
          "L0 · raw DN", "L1R · calibrated DN", "L1G · TOA reflectance",
          "L2 · surface reflectance", "TCT · B/G/W composite", "NDVI · index map",
          "AI · change mask", "QA · quality flags"
        ],
        stageHeading: "Processing stages",
        stages: [
          "L0 → L1R restoration",
          "Radiometric calibration (gain · offset)",
          "TOA reflectance conversion",
          "Atmospheric · shadow correction",
          "Tasseled Cap transform (B · G · W)",
          "Vegetation · sea ice indices",
          "AI change detection inference",
          "Quality flag QA"
        ],
        fleetHeading: "Constellation in view",
        note: "Illustrative research workflow · not live satellite telemetry"
      }
    },
    sim: {
      pageTitle: "Applications Simulator | Sun-Gu Lee",
      back: "← Back to homepage",
      heading: "Applications Simulator",
      lead: "A synthetic scene, built from land-cover spectral signatures and sensor characteristics, run through the same processing chain used in the research: TOA reflectance → index retrieval → detection. Change the application, the satellite, the acquisition date and the product, and watch every stage respond.",
      labels: {
        app: "Application", sensor: "Satellite", date: "Acquisition", product: "Product",
        chain: "Processing chain", stats: "Scene statistics", legend: "Legend",
        gsd: "Ground sample distance", regenerate: "New scene", mode: "Mode"
      },
      apps: [
        { key: "forest", label: "Forest pest detection", desc: "Pine wilt disease risk from weighted fusion of NDVI, a senescence index, the NIR/Red ratio, Tasseled Cap Greenness and EVI over KOMPSAT-3 imagery." },
        { key: "crop",   label: "Crop vigour & yield",   desc: "Parcel-level vigour from multi-temporal NDVI, the basis of early spatial yield prediction." },
        { key: "soil",   label: "Soil moisture (SAR)",   desc: "Backscatter-driven soil moisture with a semi-empirical model; compare the optical and SAR views of the same ground." },
        { key: "seaice", label: "Sea ice concentration", desc: "Ice versus open water, with floe concentration declining across the three acquisitions." },
        { key: "flood",  label: "Flood mapping",         desc: "Newly inundated area between acquisitions — the all-weather case where SAR carries the observation." }
      ],
      sensors: [
        { key: "k3",  label: "KOMPSAT-3",  note: "MS 2.8 m · optical" },
        { key: "k3a", label: "KOMPSAT-3A", note: "MS 2.2 m · optical + IR" },
        { key: "k7",  label: "KOMPSAT-7",  note: "MS 1.12 m · optical" },
        { key: "k5",  label: "KOMPSAT-5",  note: "3 m · X-band SAR" }
      ],
      products: [
        { key: "rgb",    label: "True colour" },
        { key: "fcc",    label: "False colour (NIR)" },
        { key: "ndvi",   label: "NDVI" },
        { key: "tct",    label: "Tasseled Cap" },
        { key: "detect", label: "Detection" }
      ],
      dates: ["Acquisition 1", "Acquisition 2", "Acquisition 3"],
      chain: [
        "L0 → L1R restoration",
        "Radiometric calibration (gain · offset)",
        "TOA reflectance conversion",
        "Sensor resampling at GSD",
        "Atmospheric · shadow correction",
        "Index retrieval (NDVI · TCT)",
        "Weighted probabilistic fusion",
        "Detection mask & quality flags"
      ],
      stats: {
        ndvi: "Mean NDVI", detected: "Flagged area", target: "Target class area", signal: "Mean signal"
      },
      legendDetect: ["low risk", "high risk"],
      legendNdvi: ["bare / water", "dense vegetation"],
      sarNote: "KOMPSAT-5 is a radar sensor: true and false colour show calibrated backscatter with speckle, not reflectance.",
      disclaimer: "Everything on this page is simulated. The scene is generated procedurally from published land-cover reflectance ranges and sensor specifications; the processing chain and index formulations mirror the research, but no figure here is a measurement of a real location."
    },
    trends: {
      heading: "Research Feed",
      sub: "high-resolution EO · standard products · L2 · multi-sensor — auto-collected daily, AI work first",
      updatedPrefix: "updated", liveLabel: "LIVE",
      emptyTitle: "Waiting for the first automated collection",
      emptyBody: "A GitHub Action queries arXiv, NASA and ESA every day at 06:00 KST across these tracks. Papers that apply AI are marked and listed first.",
      pause: "Pause", resume: "Play"
    },
    tracking: {
      heading: "Where the satellites are now",
      lead: "Ground positions of the KOMPSAT series and NEONSAT, propagated in your browser from the latest public orbital elements. The shaded area is the night side; the solid line is the past 35 minutes of ground track, the dashed line the next 35.",
      liveLabel: "LIVE",
      tlePrefix: "orbital elements",
      day: "Sunlit", night: "Eclipse",
      cols: ["Satellite", "Lat", "Lon", "Alt (km)", "Speed (km/s)", "Illumination"],
      emptyBody: "Orbital elements have not been collected yet. Once the GitHub Action runs, the satellites and their ground tracks appear on this map.",
      note: "Positions are propagated from TLE elements with a Keplerian model including J2 secular terms — good to a few kilometres for a same-day element set, but not a precise orbit determination. Nothing here reflects actual imaging tasking or acquisition plans."
    },

    about: {
      heading: "About",
      lead:
        "I joined the Korea Aerospace Research Institute in 2001 and have worked on the full life cycle of satellite imagery since — from the physics of the sensor to the services built on its data.",
      paragraphs: [
        "My doctoral work established absolute radiometric calibration for the KOMPSAT-2 multispectral camera, cross-validated against IKONOS and QuickBird — the first such standard in Korea, published in the Journal of Applied Remote Sensing. I went on to lead KARI's image calibration and validation teams and to take responsibility for the radiometric, spatial and geometric cal-val of KOMPSAT-3, 3A and 5.",
        "From 2015 I led ground system development for CAS500-1 and supported the ground segments for GK-2 and KOMPSAT-6. Since 2022 I have been principal investigator of the national Satellite Application Program, a five-year effort of roughly ₩4.8 billion per year.",
        "My recent work runs along three lines. SAR: soil moisture retrieval comparing KOMPSAT-5 with Sentinel-1, super-resolution and refocusing of SAR target responses, polarimetric landslide detection, and forest height from PolInSAR. Convergence: spatio-temporal fusion of KOMPSAT-3A with Sentinel-2, multi-satellite surface reflectance, and platform work such as Open Data Cube and KIWI-SAT. Applications: Tasseled Cap coefficients for KOMPSAT-3, crop yield prediction, species distribution modelling, and pine wilt disease detection.",
        "From September 2026 I supervise graduate students in the Aerospace System Engineering program of the UST KARI School, working with operational KOMPSAT data and the institute's calibration facilities."
      ],
      careerHeading: "Appointments",
      career: [
        { period: "2026 – present", title: "Associate Professor", org: "UST KARI School, Aerospace System Engineering" },
        { period: "2021.05 – 2025.03", title: "Director, Satellite Application Division", org: "KARI" },
        { period: "2013.07 – present", title: "Principal Researcher", org: "Satellite Application / Cal-Val, KARI" },
        { period: "2012.04 – 2014.12", title: "Head, Data Processing & Cal-Val Team", org: "KARI" },
        { period: "2011.09 – 2012.03", title: "Head, Image Calibration Technology Team", org: "KARI" },
        { period: "2001.07 – 2010.08", title: "Senior Researcher, Remote Sensing Team", org: "Satellite Information Research Institute, KARI" }
      ],
      // 학력 섹션은 표시하지 않음 (배열이 비면 블록이 자동으로 숨겨진다)
      educationHeading: "Education",
      education: [],
      awardsHeading: "Honours",
      awards: [
        { period: "2012", title: "Minister's Award", org: "Ministry of Education and Science, Korea" },
        { period: "2011", title: "President's Award", org: "Korea Aerospace Research Institute" }
      ],
      societyHeading: "Professional Service",
      societies: [
        "Korean Society for Aerospace System Engineering — organiser, Organized Session on Earth observation imagery and AI, Autumn 2026",
        "Standing Director, Korean Association of Geographic Information Studies",
        "Technical Director, Korean Society for Aerospace System Engineering",
        "Guest Editor, Remote Sensing (MDPI) — Special Issue “Earth Observation from KOMPSAT”",
        "Lecturer, Satellite Image Processing — Chungnam National University"
      ]
    },
    research: {
      heading: "Research",
      lead: "Radiometric calibration is the foundation; SAR and multi-sensor convergence extend what one optical scene can answer; applications turn that into measurements of soil, forests, ice and crops.",
      refsHeading: "Related outputs",
      // 연구분야 카드를 세 묶음으로 나눠 보여준다 (areas[].group 이 여기 key 를 가리킴)
      groups: [
        { key: "calval", label: "Calibration & standard products",
          note: "Making the recorded numbers physically trustworthy — and the products built directly on them" },
        { key: "imagery", label: "Optical & SAR image applications",
          note: "What a single scene can be made to answer, and how AI raises that ceiling" },
        { key: "fusion", label: "Multi-sensor convergence & domain applications",
          note: "Fusing the constellation into measurements of soil, forests, ice and crops" }
      ],
      areas: [
        {
          viz: "calval", group: "calval",
          tag: "Core discipline",
          title: "Radiometric Calibration",
          body:
            "Absolute and relative radiometric calibration of the KOMPSAT series, vicarious calibration over reference targets, and cross-calibration against Landsat-8, EO-1 Hyperion, IKONOS and QuickBird. I led the radiometric, spatial and geometric cal-val of KOMPSAT-3, 3A and 5, and established Korea's first KOMPSAT-2 absolute calibration standard.",
          keywords: ["Absolute radiometry", "Vicarious calibration", "Cross-calibration", "SNR / MTF / RER", "TOA reflectance", "6S surface reflectance"],
          refs: [
            { label: "Absolute radiometric calibration of the KOMPSAT-2 multispectral camera (J. Appl. Remote Sens., 2012) — first author", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "NDVI from top-of-canopy reflectance of KOMPSAT-3A (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" }
          ]
        },
        {
          viz: "sar", group: "imagery",
          tag: "Radar",
          title: "SAR Applications",
          body:
            "KOMPSAT-5 X-band SAR where optical imagery cannot see. Soil moisture retrieval with a semi-empirical model compared against Sentinel-1; super-resolution and refocusing of target responses; polarimetric observation for landslide detection; forest height retrieval from PolInSAR with population-based optimisation; glacier velocity from coarse-to-fine offset tracking; and prototype automatic change-detection alerting from multi-temporal scenes.",
          keywords: ["KOMPSAT-5 X-band", "Soil moisture", "PolInSAR", "Super-resolution", "Offset tracking", "Change detection"],
          refs: [
            { label: "KOMPSAT-5 vs Sentinel-1 for soil moisture, semi-empirical model (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "Open-access PDF — soil moisture paper", url: "files/rs-2022-kompsat5-sentinel1-soil-moisture.pdf", kind: "pdf" },
            { label: "Super-resolution procedure for target responses in KOMPSAT-5 images (Sensors, 2022)", url: "https://doi.org/10.3390/s22197189", kind: "doi" },
            { label: "Open-access PDF — KOMPSAT-5 super-resolution", url: "files/sensors-2022-kompsat5-super-resolution.pdf", kind: "pdf" },
            { label: "Efficient super-resolution method for targets observed by satellite SAR (Sensors, 2023)", url: "https://doi.org/10.3390/s23135893", kind: "doi" },
            { label: "Single-, dual- and quad-polarimetric SAR for landslide detection (ISPRS IJGI, 2019)", url: "https://doi.org/10.3390/ijgi8090384", kind: "doi" },
            { label: "Fine-tuning of forest height retrieval in PolInSAR (IEEE GRSL, 2025)", url: "https://ieeexplore.ieee.org/document/10930519", kind: "doi" }
          ]
        },
        {
          viz: "fusion", group: "fusion",
          tag: "Convergence",
          title: "Multi-sensor Convergence",
          body:
            "Spatio-temporal fusion of high-resolution optical imagery — KOMPSAT-3A with Sentinel-2 — surface reflectance derived from multi-satellite data fusion, and a harmonised Tasseled Cap framework spanning KOMPSAT-3/3A/5 and CAS500 so that indices remain comparable across platforms. Supported by platform work on Open Data Cube and the KIWI-SAT array database system.",
          keywords: ["KOMPSAT-3A × Sentinel-2", "Spatio-temporal fusion", "Open Data Cube", "KIWI-SAT", "Virtual constellation"],
          refs: [
            { label: "NDVI from KOMPSAT-3A top-of-canopy reflectance via Orfeo ToolBox (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Soil moisture across KOMPSAT-5 and Sentinel-1 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" }
          ]
        },
        {
          viz: "indices", group: "calval",
          tag: "Spectral indices",
          title: "Tasseled Cap & Vegetation Indices",
          body:
            "The first PCA-derived Tasseled Cap Transformation coefficients specific to KOMPSAT-3, compared against deep-learning derivations, plus a shadow-aware TCT framework and balanced scene sampling for training set construction. Earlier work improved KOMPSAT-2 TCT coefficients for the Korean peninsula and derived NDVI from top-of-canopy reflectance of KOMPSAT-3A.",
          keywords: ["TCT", "Brightness / Greenness / Wetness", "PCA", "NDVI vs TCG", "Shadow-aware TCT", "TOC reflectance"],
          refs: [
            { label: "NDVI with top-of-canopy reflectance from KOMPSAT-3A (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Absolute radiometric calibration underpinning index derivation (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" }
          ]
        },
        {
          viz: "forest", group: "fusion",
          tag: "Ecosystems",
          title: "Forest, Crop & Habitat Monitoring",
          body:
            "Probabilistic multi-indicator fusion for pine wilt disease from KOMPSAT-3 imagery at 2.8 m GSD; early spatial prediction of rice and other crop yields from satellite imagery and deep learning; and species distribution modelling for habitat prediction, delivered as the KARI-SDM QGIS plugin.",
          keywords: ["Pine wilt disease", "Crop yield prediction", "Species distribution", "Multi-temporal", "KARI-SDM"]
        },
        {
          viz: "seaice", group: "fusion",
          tag: "Cryosphere",
          title: "Polar & Route Safety",
          body:
            "Sea ice concentration and type from combined optical and SAR observation, seasonal variability and long-term trends, and prediction supporting safe navigation of the Northern Sea Route. Related glacier work measures two-dimensional ice velocity in East Antarctica from KOMPSAT-5 offset tracking.",
          keywords: ["Sea ice", "Northern Sea Route", "Campbell Glacier", "Offset tracking", "Time series"]
        },
        {
          viz: "ai", group: "imagery",
          tag: "AI for EO",
          title: "AI for Remote Sensing",
          body:
            "Deep learning inside operational processing chains: fine-tuned vision-language models for satellite image understanding, label-to-image translation for data augmentation of KOMPSAT imagery, agentic AI prototypes for satellite application workflows, GPU-parallel unsupervised classification of out-of-memory scenes, and neural image matching for KOMPSAT-3A.",
          keywords: ["Vision-language models", "Data augmentation", "Agentic AI", "GPU parallel processing", "Image matching"]
        },
        {
          viz: "ontology", group: "fusion",
          tag: "Platform",
          title: "Imagery Platform & Applications",
          body:
            "Ground system development and the services built on it — CAS500-1 ground segment, satellite information big-data support systems, ontology and metadata design, and application studies covering water quality, resource exploration, disaster monitoring, land cover, precision agriculture and public safety.",
          keywords: ["Ground segment", "Big data", "Ontology", "Application services", "TRL assessment"]
        }
      ],
      simCta: { label: "Open the applications simulator", note: "Run the processing chain on a synthetic KOMPSAT scene — pick an application, a satellite and a product.", href: "applications.html" },
      projectHeading: "Research Projects",
      projects: [
        {
          period: "2022.01 – 2026.12",
          title: "Satellite Application Program",
          org: "National Research Council of Science & Technology — Principal Investigator",
          body:
            "Five consecutive years as PI of the national satellite application program, approximately ₩4.77–4.92 billion per year (₩24.2 billion cumulative), covering satellite information application research across optical and SAR platforms."
        },
        {
          period: "2026.05 – 2027.04",
          title: "SIRMS",
          org: "KARI × UST Joint Research — Principal Investigator",
          body:
            "Satellite imagery based remote sensing monitoring system, integrating retrieval algorithms and AI analysis pipelines, validated on Arctic sea ice and forest health."
        },
        {
          period: "2022.05 – 2026.12",
          title: "Satellite Big-Data Application Support System",
          org: "Ministry of Science and ICT — Co-investigator",
          body: "Development of a support framework for large-scale satellite information analysis and distribution."
        },
        {
          period: "2020.01 – 2027.12",
          title: "Microsatellite Constellation — Application System",
          org: "Ministry of Science and ICT — Co-investigator",
          body: "Application system development for the national microsatellite constellation program."
        },
        {
          period: "2022.11 – 2030.12",
          title: "Microsatellite System Development — Application System",
          org: "Ministry of Science and ICT — Co-investigator",
          body: "Application system development for the follow-on microsatellite system program."
        },
        {
          period: "2015 – 2019",
          title: "CAS500-1 Ground System Development",
          org: "Compact Advanced Satellite 500-1 — Lead (approx. US$5M)",
          body: "Ground segment development lead for CAS500-1, with supporting roles on the GK-2, KOMPSAT-6 and lunar programme ground systems."
        },
        {
          period: "2011 – 2014",
          title: "KOMPSAT-3 / 3A / 5 Calibration & Validation",
          org: "Lead (approx. US$11M combined)",
          body: "Radiometric, spatial and geometric calibration and validation for the KOMPSAT-3, KOMPSAT-3A and KOMPSAT-5 system development projects."
        }
      ]
    },
    aiwatch: {
      heading: "AI Watch",
      lead:
        "Where machine learning for Earth observation is actually moving, and where I place each technique in my own work. The radar is my judgement; the feed below is collected automatically from arXiv every morning so the two can be checked against each other.",
      liveLabel: "AUTO",
      radarHeading: "Technology radar",
      radarNote:
        "Placement reflects how far each technique has come in my own KOMPSAT work — not its popularity. Reviewed each half-year.",
      rings: [
        { key: "adopt",  label: "ADOPT",  note: "In production use on KOMPSAT data" },
        { key: "trial",  label: "TRIAL",  note: "Prototyped and published, not yet operational" },
        { key: "assess", label: "ASSESS", note: "Tracking closely; no results of my own yet" },
        { key: "hold",   label: "HOLD",   note: "Watching, but not worth committing to now" }
      ],
      tracks: [
        { key: "sar",         short: "SAR-DL",  ring: "adopt",
          label: "SAR deep learning",
          note: "Soil moisture retrieval and super-resolution on KOMPSAT-5" },
        { key: "restoration", short: "SR",      ring: "adopt",
          label: "Super-resolution · restoration",
          note: "Registered as software; used on KOMPSAT-3/3A products" },
        { key: "vlm",         short: "VLM",     ring: "trial",
          label: "Vision-language models",
          note: "Fine-tuned multimodal models for scene understanding (IGARSS 2025)" },
        { key: "agentic",     short: "AGENT",   ring: "trial",
          label: "Agentic AI",
          note: "Prototype of an agent-driven satellite application pipeline" },
        { key: "foundation",  short: "FM",      ring: "assess",
          label: "Earth observation foundation models",
          note: "Moving fast; the calibration question underneath them is still open" },
        { key: "ssl",         short: "SSL",     ring: "assess",
          label: "Self-supervised · few-shot",
          note: "Promising where labelled KOMPSAT data is thin" }
      ],
      feedHeading: "Latest papers by track",
      allLabel: "All tracks",
      volumeHeading: "Monthly publication volume",
      volumeNote:
        "arXiv submissions combining Earth observation with machine learning, counted per month. The current month is left out — it is not finished yet, so it is not comparable. A rough but honest measure of how fast the field is moving.",
      volumeUnit: "papers",
      volumeEmpty: "Waiting for the first automated collection.",
      statLatest: "papers in the latest full month",
      statDelta: "change over 12 months",
      statTracked: "papers in the feed",
      tableLabel: "View as table",
      tableMonth: "Month",
      tableCount: "Papers",
      updatedPrefix: "collected",
      emptyTitle: "Waiting for the first automated collection",
      emptyBody:
        "A GitHub Action queries arXiv every morning at 06:00 KST and files the results by track."
    },

    media: {
      heading: "Media & Results",
      lead: "Earth observation mission videos and research result imagery.",
      videoHeading: "Videos",
      play: "Play",
      videos: [
        { id: "0XCZgwDltmY", title: "KOMPSAT-3 (Arirang-3) mission extension", caption: "Operation of Korea's sub-metre optical EO satellite (Korean narration)", credit: "© KARI TV" },
        { id: "N-F3hM8IxZM", title: "KOMPSAT-7 (Arirang-7) launch", caption: "30 cm class very-high-resolution Earth observation (Korean narration)", credit: "© KARI TV" },
        { id: "Bv3pB9TaWOk", title: "Sentinel-2: an introduction", caption: "How a multispectral Earth observation mission is built and operated", credit: "© ESA" },
        { id: "6eh4EqVCXLk", title: "Landsat Senses a Disturbance in the Forest", caption: "Detecting forest disturbance from satellite time series", credit: "© NASA Goddard" }
      ],
      galleryHeading: "Research Imagery",
      gallery: [],
      galleryEmpty: "Result imagery in preparation."
    },
    publications: {
      heading: "Publications & Achievements",
      lead: "Peer-reviewed papers, conference presentations, patents and registered software.",
      highlightsHeading: "Selected Achievements",
      highlights: [
        { title: "Korea's first KOMPSAT-2 calibration standard", body: "Absolute radiometric calibration of the KOMPSAT-2 multispectral camera by a reflectance-based method, cross-validated with IKONOS and QuickBird (J. Applied Remote Sensing, 2012, first author)." },
        { title: "Cal-val lead for KOMPSAT-3 / 3A / 5", body: "Responsible for radiometric, spatial and geometric calibration and validation across three KOMPSAT system development projects (2011–2014)." },
        { title: "PI, national Satellite Application Program", body: "Principal investigator for five consecutive years (2022–2026), approximately ₩24.2 billion cumulative." },
        { title: "First KOMPSAT-3 Tasseled Cap coefficients", body: "Sensor-specific TCT coefficients derived by PCA and compared against deep-learning derivations, with a shadow-aware framework — the first for the KOMPSAT series." }
      ],
      tabs: { papers: "Journal Papers", conferences: "Conferences", patents: "Patents", software: "Software" },

      papers: [
        { year: 2025, authors: "Lee, S.-G. et al. (4th+)", title: "Breeding habitat prediction and nest-site characteristics of the fairy pitta (Pitta nympha) in Geoje-si, South Korea: insights from a species distribution model", venue: "Global Ecology and Conservation", type: "SCI" },
        { year: 2025, authors: "Lee, S.-J., Lee, S.-G. (2nd author)", title: "Fine-tuning of forest height retrieval in PolInSAR using population-based optimization", venue: "IEEE Geoscience and Remote Sensing Letters", type: "SCI" },
        { year: 2024, authors: "co-author", title: "Prospects of utilizing the Korean satellite program for geological disaster detection and analysis", venue: "Geoscience Journal", type: "SCI" },
        { year: 2023, authors: "Lee, S.-J., Lee, S.-G. (2nd author)", title: "Efficient super-resolution method for targets observed by satellite SAR", venue: "Sensors", type: "SCI" },
        { year: 2022, authors: "Lee, S.-J., Lee, S.-G. (2nd author)", title: "Super-resolution procedure for target responses in KOMPSAT-5 images", venue: "Sensors", type: "SCI" },
        { year: 2022, authors: "co-author", title: "Comparison of KOMPSAT-5 and Sentinel-1 radar data for soil moisture estimation using a new semi-empirical model", venue: "Remote Sensing", type: "SCI" },
        { year: 2022, authors: "Lee, S.-J., Lee, S.-G. (2nd author)", title: "Refocusing performance analysis for KOMPSAT-5 images", venue: "Journal of the Korean Institute of Electromagnetic Engineering and Science, 33(4), 259–264", type: "KCI" },
        { year: 2022, authors: "Han, S.-H., Lee, J.-H., Lee, S.-G.", title: "Parallel processing of satellite imagery using a GPU", venue: "Journal of the Korean Society of Surveying, Geodesy, Photogrammetry and Cartography, 40(6)", type: "KCI" },
        { year: 2020, authors: "co-author", title: "Determination of the Normalized Difference Vegetation Index (NDVI) with top-of-canopy reflectance from a KOMPSAT-3A image using Orfeo ToolBox", venue: "ISPRS International Journal of Geo-Information", type: "SCI" },
        { year: 2019, authors: "2nd author", title: "On the use of single-, dual- and quad-polarimetric SAR observation for landslide detection", venue: "ISPRS International Journal of Geo-Information", type: "SCI" },
        { year: 2019, authors: "co-author", title: "Consideration points for application of KOMPSAT data to Open Data Cube", venue: "Journal of the Korea Association of Geographic Information Studies", type: "SCI" },
        { year: 2016, authors: "co-author", title: "Estimation of seasonal topographic variation in tidal flats using the waterline method: a case study in Gomso and Hampyeong Bay, South Korea", venue: "Coastal and Shelf Science", type: "SCI" },
        { year: 2016, authors: "co-author", title: "Relating light reflectance of a leaf to light absorbance by foliar chlorophyll as a preliminary approach to detection of forest condition by remote sensing", venue: "Journal of Animal and Plant Sciences", type: "SCI" },
        { year: 2012, authors: "Lee, S., Jin, C., Choi, C., Lim, H., Kim, Y., Kim, J. (first author)", title: "Absolute radiometric calibration of the KOMPSAT-2 multispectral camera using a reflectance-based method and empirical comparison with IKONOS and QuickBird images", venue: "Journal of Applied Remote Sensing", type: "SCI" },
        { year: 2012, authors: "co-author", title: "Analysis of spatial and seasonal distributions of MODIS aerosol optical properties and ground-based measurements of mass concentrations in the Yellow Sea region in 2009", venue: "Environmental Monitoring and Assessment", type: "SCI" },
        { year: 2011, authors: "co-author", title: "Characteristics of aerosol types during large-scale transport of air pollution over the Yellow Sea region and at Cheongwon, Korea, in 2008", venue: "Environmental Monitoring and Assessment", type: "SCI" },
        { year: 2006, authors: "Lee, S.-G. (first author)", title: "Field campaign and test results for absolute radiometric calibration", venue: "Journal of Aerospace System Engineering (KARI)", type: "KCI" }
      ],

      conferences: [
        { year: 2026, authors: "Lee, S.-G.", title: "A methodological framework for satellite-based forest pest and disease monitoring using multi-feature probabilistic fusion of KOMPSAT-3 multispectral imagery", venue: "77th International Astronautical Congress (IAC 2026), Earth Observation Symposium — Paper ID 106539", type: "Conference" },
        { year: 2025, authors: "Lee, D.-H., Chung, D.-W., Lee, S.-G.", title: "Development of a web-based analytical framework for soil moisture estimation using multi-polarized SAR data", venue: "ISPRS Geo-Spatial Week 2025", type: "Conference" },
        { year: 2025, authors: "Park, K.-H., Lee, S.-G.", title: "Satellite data augmentation via label-to-image translation for KOMPSAT imagery", venue: "International Symposium on Remote Sensing 2025", type: "Conference" },
        { year: 2025, authors: "Oh, H., Shin, D.-B., Seo, H.-W., Lee, S.-G., Chung, D.-W.", title: "Enhancing satellite image analysis with fine-tuned vision-language models", venue: "IEEE IGARSS 2025", type: "Conference" },
        { year: 2025, authors: "Lee, S.-G.", title: "Derivation and comparison of KOMPSAT-3 multispectral TCT coefficients using PCA and AI models", venue: "Korean Society for Aerospace System Engineering, Autumn 2025", type: "Conference" },
        { year: 2025, authors: "Park, K.-H., Lee, D.-H., Lee, S.-G.", title: "Prototype development of an agentic AI based satellite application system", venue: "Korean Society of Remote Sensing, Autumn 2025", type: "Conference" },
        { year: 2024, authors: "Oh, H., Shin, D.-B., Lee, S.-G.", title: "Finetuning multimodal models for enhanced satellite image understanding", venue: "AGU Fall Meeting 2024", type: "Conference" },
        { year: 2024, authors: "Han, S.-H., Lee, J.-H., Lee, S.-G.", title: "Autoencoder-based unsupervised classification of satellite imagery with parallel processing", venue: "Korean Association of Geographic Information Studies, Autumn 2024", type: "Conference" },
        { year: 2023, authors: "Han, S.-H., Lee, J.-H., Lee, S.-G.", title: "Parallel processing of an out-of-memory satellite image using a GPU: implemented on k-means clustering", venue: "AGU Fall Meeting 2023", type: "Conference" },
        { year: 2023, authors: "Sharma, S., Ryu, D., Sumesh, K.C., Lee, S.-G., Jeong, S.", title: "Synergistic use of Sentinel-1 and Sentinel-2 images for in-season crop type classification using Google Earth Engine and machine learning", venue: "IEEE IGARSS 2023", type: "Conference" },
        { year: 2023, authors: "Lee, H.-H., Lee, S.-G.", title: "Feasibility study for application of an artificial neural network to KOMPSAT-3A satellite image matching", venue: "28th International Symposium on Remote Sensing", type: "Conference" },
        { year: 2016, authors: "Lee, S.-G. et al.", title: "Radiometric cross-calibration of KOMPSAT-3A with Landsat-8", venue: "ISPRS Congress", type: "Conference" },
        { year: 2014, authors: "Lee, S.-G. et al.", title: "Retrieval of surface reflectance of KOMPSAT-3 using the 6S model and vicarious radiometric calibration", venue: "Korean Society of Remote Sensing", type: "Conference" },
        { year: 2012, authors: "Lee, S.-G. et al.", title: "Improvement of KOMPSAT-2 Tasseled Cap Transformation coefficients for the Korean peninsula", venue: "Korean Society of Remote Sensing", type: "Conference" }
      ],

      patents: [
        { year: 2026, title: "Method and system for estimating vessel shape", number: "KR 10-2916018 (filed 10-2022-0123234, 28 Sep 2022)", status: "Registered 16 Jan 2026", country: "KR", inventors: "Korea Aerospace Research Institute" },
        { year: 2025, title: "Method and system for predicting spatial information of crop yield", number: "KR 10-2804554 (filed 10-2022-0121636, 26 Sep 2022)", status: "Registered 30 Apr 2025", country: "KR", inventors: "Korea Aerospace Research Institute" },
        { year: 2025, title: "System for estimating soil moisture content using SAR satellite data", number: "Published application", status: "Published", country: "KR", inventors: "Korea Aerospace Research Institute" },
        { year: 2025, title: "Method and apparatus for deriving Tasseled Cap Transformation coefficients based on adaptive principal component analysis optimised for multispectral satellite sensors", number: "Prior-art search completed Oct 2025", status: "Filing in progress", country: "KR", inventors: "S.-G. Lee (lead inventor)" }
      ],

      software: [
        { year: 2025, title: "KOMPSAT-3 multispectral preprocessing and balanced sampling for TCT training datasets", number: "Program registration SDC2025-1108", status: "Registration filed", country: "KR", inventors: "DN → surface reflectance · NDVI land cover classification · per-scene balanced sampling" },
        { year: 2024, title: "Super-resolution algorithm for KOMPSAT-3 / 3A imagery", number: "Program registration 3443", status: "Registered", country: "KR", inventors: "" },
        { year: 2024, title: "Satellite imagery sales management system", number: "Program registration 3536", status: "Registered", country: "KR", inventors: "" },
        { year: 2023, title: "Container-based satellite image analysis and management library", number: "Program registration 3346", status: "Registered", country: "KR", inventors: "" },
        { year: 2023, title: "KIWI-SAT satellite information analysis program — REST API", number: "Program registration 3320", status: "Registered", country: "KR", inventors: "" },
        { year: 2022, title: "Map information collection and matching support library", number: "Program registration 3207", status: "Registered", country: "KR", inventors: "" }
      ],
      empty: "List in preparation.",
      disclaimer: "Selected items. Additional domestic journal papers, conference presentations and registered programs are not listed individually."
    },
    teaching: {
      heading: "UST Teaching",
      lead:
        "As a full-time faculty member of the UST KARI School (Aerospace System Engineering), I supervise MS and PhD students in satellite information applications, with access to operational KOMPSAT data, calibration reference datasets and KARI facilities.",
      appointment: {
        heading: "Appointment",
        rows: [
          { k: "School", v: "UST KARI School" },
          { k: "Major", v: "Aerospace System Engineering" },
          { k: "Position", v: "Full-time Faculty · Associate Professor" },
          { k: "Term", v: "Sep 1, 2026 – Aug 31, 2031" }
        ]
      },
      topicsHeading: "Supervision Topics",
      // 각 주제 카드의 "자세히" 안에 들어가는 강의 내용 — goals(학습목표) · modules(핵심 내용) ·
      // practice(데이터·도구) · refs(관련 자료). 초안이므로 자유롭게 고쳐 쓰세요.
      topicLabels: { goals: "What you will learn", modules: "Core content", practice: "Data & tools", refs: "Related material", open: "Lecture outline & material", close: "Close" },
      topics: [
        {
          title: "Radiometric calibration & image quality",
          body: "Absolute, relative and vicarious calibration of KOMPSAT sensors; cross-sensor validation; SNR, MTF and RER characterisation.",
          goals: [
            "Derive absolute gain and offset for a multispectral sensor from reflectance-based vicarious targets",
            "Cross-calibrate against a reference sensor and account for spectral response differences",
            "Characterise image quality — SNR, MTF, RER — from in-scene targets and report it defensibly"
          ],
          modules: [
            "Sensor radiometric model: DN → at-sensor radiance → TOA reflectance; sources of uncertainty",
            "Vicarious calibration: reflectance-based method, site selection, field spectroradiometry, atmospheric transfer with 6S",
            "Cross-calibration: simultaneous nadir overpass, spectral band adjustment factors, trend monitoring",
            "Spatial quality: edge-target MTF, relative edge response, SNR over uniform targets",
            "Case study: establishing the KOMPSAT-2 absolute calibration standard and the KOMPSAT-3/3A/5 cal-val programme"
          ],
          practice: "KOMPSAT-3/3A L1R scenes with calibration reference datasets · Landsat-8/9 Collection 2 · Py6S · Python (NumPy, rasterio)",
          refs: [
            { label: "Absolute radiometric calibration of the KOMPSAT-2 multispectral camera (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "NDVI from top-of-canopy reflectance of KOMPSAT-3A (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Py6S — Python interface to the 6S radiative transfer code", url: "https://py6s.readthedocs.io", kind: "web" }
          ]
        },
        {
          title: "SAR applications",
          body: "KOMPSAT-5 soil moisture, super-resolution and refocusing, polarimetric analysis, PolInSAR forest height, offset tracking.",
          goals: [
            "Read X-band backscatter physically — geometry, speckle, σ⁰ calibration — before applying any model",
            "Implement and validate a semi-empirical soil moisture retrieval against in-situ data",
            "Apply polarimetric and interferometric methods to a real forest or glacier problem"
          ],
          modules: [
            "SAR imaging geometry, speckle statistics, radiometric calibration to σ⁰ and terrain flattening",
            "Soil moisture: semi-empirical models, roughness and vegetation effects, KOMPSAT-5 versus Sentinel-1",
            "Point-target super-resolution and refocusing of target responses",
            "Polarimetry: decompositions, single/dual/quad-pol comparison for landslide detection",
            "PolInSAR forest height (RVoG) and coarse-to-fine offset tracking for glacier velocity"
          ],
          practice: "KOMPSAT-5 L1A/L1D · Sentinel-1 GRD/SLC · ESA SNAP · PolSARpro · Python",
          refs: [
            { label: "KOMPSAT-5 vs Sentinel-1 for soil moisture, semi-empirical model (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "Open-access PDF — soil moisture paper", url: "files/rs-2022-kompsat5-sentinel1-soil-moisture.pdf", kind: "pdf" },
            { label: "Super-resolution procedure for target responses in KOMPSAT-5 images (Sensors, 2022)", url: "https://doi.org/10.3390/s22197189", kind: "doi" },
            { label: "Open-access PDF — KOMPSAT-5 super-resolution", url: "files/sensors-2022-kompsat5-super-resolution.pdf", kind: "pdf" },
            { label: "Single-, dual- and quad-polarimetric SAR for landslide detection (ISPRS IJGI, 2019)", url: "https://doi.org/10.3390/ijgi8090384", kind: "doi" },
            { label: "Fine-tuning of forest height retrieval in PolInSAR (IEEE GRSL, 2025)", url: "https://ieeexplore.ieee.org/document/10930519", kind: "doi" },
            { label: "ESA SNAP toolbox", url: "https://step.esa.int/main/toolboxes/snap/", kind: "web" }
          ]
        },
        {
          title: "Multi-sensor convergence",
          body: "Spatio-temporal fusion of KOMPSAT-3A with Sentinel-2, harmonisation across the Korean constellation, cross-platform index continuity.",
          goals: [
            "Make reflectance from different sensors comparable — spectrally, radiometrically and geometrically",
            "Implement a spatio-temporal fusion method and evaluate it honestly against held-out scenes",
            "Build an analysis-ready data cube from heterogeneous sources"
          ],
          modules: [
            "Spectral response differences, band adjustment factors, BRDF normalisation",
            "Co-registration and resampling: where fusion errors actually come from",
            "Spatio-temporal fusion: STARFM-family methods and deep-learning alternatives, KOMPSAT-3A × Sentinel-2",
            "Harmonised Tasseled Cap across KOMPSAT-3/3A/5 and CAS500 for cross-platform index continuity",
            "Open Data Cube, STAC catalogues and the KIWI-SAT array database as the platform layer"
          ],
          practice: "KOMPSAT-3A + Sentinel-2 L2A pairs · Open Data Cube · Orfeo ToolBox · xarray / rasterio",
          refs: [
            { label: "NDVI from KOMPSAT-3A top-of-canopy reflectance via Orfeo ToolBox (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Soil moisture across KOMPSAT-5 and Sentinel-1 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "Open Data Cube", url: "https://www.opendatacube.org", kind: "web" },
            { label: "Copernicus Data Space Ecosystem — Sentinel-2 access", url: "https://dataspace.copernicus.eu", kind: "web" }
          ]
        },
        {
          title: "Spectral index development",
          body: "TCT and vegetation index design, atmospheric, topographic and shadow correction, suitability for Korean land surfaces.",
          goals: [
            "Derive sensor-specific Tasseled Cap coefficients by PCA and understand what each axis means physically",
            "Design a sampling strategy that keeps the derivation representative of Korean land cover",
            "Correct for atmosphere, topography and shadow before trusting any index"
          ],
          modules: [
            "Tasseled Cap theory: Kauth–Thomas, Crist–Cicone, and why coefficients are sensor-specific",
            "PCA / Gram–Schmidt derivation, balanced scene sampling, comparison with deep-learning derivations",
            "Shadow-aware TCT and topographic correction (C-correction, SCS+C) for mountainous terrain",
            "NDVI, EVI, Greenness: comparability across sensors and processing levels",
            "Validation design: field reference, cross-sensor consistency, seasonal stability"
          ],
          practice: "KOMPSAT-3 L1G scenes over Korea · scikit-learn · Python · QGIS",
          refs: [
            { label: "NDVI with top-of-canopy reflectance from KOMPSAT-3A (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Absolute radiometric calibration underpinning index derivation (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "Patent in progress — adaptive-PCA TCT coefficient derivation (see Publications → Patents)", url: "#publications", kind: "web" }
          ]
        },
        {
          title: "Ecosystem & polar monitoring",
          body: "Pine wilt disease detection, crop yield prediction, species distribution modelling, sea ice and glacier time series.",
          goals: [
            "Turn a sequence of scenes into a defensible measurement of change, not just a pretty map",
            "Fuse several weak indicators probabilistically rather than relying on one threshold",
            "Validate against field or reference data and quantify uncertainty"
          ],
          modules: [
            "Pine wilt disease: multi-indicator probabilistic fusion over KOMPSAT-3 at 2.8 m",
            "Crop yield: phenology from time series, early-season prediction with deep learning",
            "Species distribution modelling and habitat prediction — the KARI-SDM QGIS plugin",
            "Sea ice concentration and type from combined optical and SAR observation; Northern Sea Route safety",
            "Glacier velocity from KOMPSAT-5 offset tracking in East Antarctica"
          ],
          practice: "Multi-temporal KOMPSAT-3/3A · Sentinel-1/2 · QGIS · PyTorch · NSIDC and Copernicus marine products",
          refs: [
            { label: "SIRMS — Satellite-based Ice Route Monitoring System (KARI × UST, 2026–27)", url: "#research", kind: "web" },
            { label: "NSIDC Sea Ice Index", url: "https://nsidc.org/data/seaice_index", kind: "web" },
            { label: "Copernicus Data Space Ecosystem — Sentinel-1/2 access", url: "https://dataspace.copernicus.eu", kind: "web" }
          ]
        },
        {
          title: "AI for Earth observation",
          body: "Vision-language models, data augmentation, agentic workflows, GPU-parallel processing, model reliability and explainability.",
          goals: [
            "Adapt a foundation or vision-language model to satellite imagery with limited labels",
            "Generate and audit synthetic training data for a real EO task",
            "Build an agentic processing workflow and make its outputs explainable and reliable"
          ],
          modules: [
            "EO foundation models and self-supervised pretraining; what transfers to KOMPSAT and what does not",
            "Vision-language models for scene understanding, captioning and retrieval",
            "Label-to-image translation and other augmentation strategies; measuring their real effect",
            "Agentic workflows: LLM-driven pipelines over processing chains, tool use, guardrails",
            "GPU-parallel unsupervised classification of out-of-memory scenes; explainability and reliability"
          ],
          practice: "PyTorch 2.x · Hugging Face · LangGraph · KOMPSAT-3A chips with reference labels",
          refs: [
            { label: "AI Watch — live radar and feed of remote-sensing AI papers on this site", url: "#aiwatch", kind: "web" },
            { label: "Papers with Code — remote sensing benchmarks", url: "https://paperswithcode.com/area/computer-vision/remote-sensing", kind: "web" }
          ]
        }
      ],
      offerHeading: "What Students Get",
      offers: [
        "Access to KOMPSAT-2/3/3A/5 and CAS500 imagery with calibration reference datasets",
        "Research topics and funding linked to the national Satellite Application Program",
        "Guidance through to SCI publications, patents and software registration",
        "Opportunities to present at IGARSS, AGU, ISPRS, IAC and domestic society meetings"
      ],
      recruitHeading: "Openings",
      recruitBody:
        "I welcome inquiries from prospective MS, PhD and integrated MS-PhD students year-round. Prior remote sensing experience is not required — Python-based data analysis skills and a genuine interest in Earth observation are enough. Send a short CV and your topics of interest by email to arrange a meeting.",
      recruitCta: "Contact for supervision"
    },
    contact: {
      heading: "Contact",
      lead: "For research collaboration and student supervision inquiries, please reach out by email.",
      labels: { email: "Email", phone: "Phone", office: "Address" },
      office: "Satellite Application Research Team, Korea Aerospace Research Institute, 169-84 Gwahak-ro, Yuseong-gu, Daejeon 34133, Republic of Korea",
      linksHeading: "Links",
      linkLabels: { kari: "KARI", ust: "UST", ustSchool: "UST KARI School", orcid: "ORCID", googleScholar: "Google Scholar", researchGate: "ResearchGate" }
    },
    family: {
      heading: "Related sites",
      lead: "Institutions, national utilisation centres and societies I work with.",
      groups: [
        {
          key: "centre",
          label: "National satellite utilisation centres",
          note: "Domain centres that operate and distribute Korean satellite products",
          items: [
            { label: "KSATDB", sub: "Satellite Information Utilization Support Service · KARI", url: "https://ksatdb.kari.re.kr/main/main.do", lead: true },
            { label: "National Land Satellite Centre", sub: "NGII · land observation", url: "https://www.ngii.go.kr/nlsc/" },
            { label: "National Meteorological Satellite Centre", sub: "KMA · GEO-KOMPSAT", url: "https://nmsc.kma.go.kr" },
            { label: "Environmental Satellite Centre", sub: "NIER · GEMS", url: "https://nesc.nier.go.kr/ko/html/index.do" },
            { label: "Korea Ocean Satellite Centre", sub: "KIOST · GOCI", url: "https://kosc.kiost.ac.kr" }
          ]
        },
        {
          key: "society",
          label: "Academic societies",
          note: "Societies where I serve on the board or publish",
          items: [
            { label: "Korean Society of Remote Sensing", sub: "KSRS", url: "https://www.ksrs.or.kr" },
            { label: "Korean Association of Geographic Information Studies", sub: "KAGIS · Standing Director", url: "https://kagis.or.kr" },
            { label: "Society for Aerospace System Engineering", sub: "SASE · Technical Director", url: "https://sase.or.kr" }
          ]
        },
        {
          key: "org",
          label: "Affiliation",
          note: "",
          items: [
            { label: "Korea Aerospace Research Institute", sub: "KARI", url: "https://www.kari.re.kr" },
            { label: "UST KARI School", sub: "University of Science and Technology", url: "https://ust.ac.kr" }
          ]
        }
      ]
    },

    footer: {
      copy: "© 2026 Sun-Gu Lee. All rights reserved.",
      note: "Korea Aerospace Research Institute · UST KARI School"
    },
    ui: { langToggle: "한국어", top: "Back to top", menu: "Menu", close: "Close",
          more: "Show more", less: "Show less", details: "Details", hide: "Hide" }
  },

  /* ---- 한국어 ---------------------------------------------------------- */
  ko: {
    meta: {
      title: "이선구 | 위성 검보정 · SAR · 융복합활용",
      description:
        "한국항공우주연구원 책임연구원 · UST 한국항공우주연구원 스쿨 부교수. KOMPSAT 복사 검보정, SAR 활용, 다중센서 융복합 활용 연구."
    },
    nav: {
      home: "홈", tracking: "실시간 위치", about: "소개", research: "연구분야",
      aiwatch: "AI 동향", media: "영상·자료", publications: "성과", teaching: "교원활동",
      apps: "시뮬레이터", sites: "관련 사이트", contact: "연락처"
    },
    hero: {
      eyebrow: "복사 검보정 · SAR 활용 · 융복합활용",
      name: "이 선 구",
      nameSub: "Sun-Gu Lee, Ph.D.",
      roles: [
        "한국항공우주연구원 위성활용연구팀 책임연구원",
        "UST 한국항공우주연구원 스쿨 부교수 (항공우주시스템공학)"
      ],
      tagline:
        "주 전공은 복사 검보정입니다. 위성이 기록한 값을 신뢰할 수 있는 물리량으로 만드는 일에서 출발해, 광학·SAR 영상 활용과 국내 위성군의 융복합으로 토양수분·산림·해빙·작물을 측정하는 연구를 합니다.",
      cta: [
        { label: "연구분야 보기", href: "#research" },
        { label: "UST 학생 지도", href: "#teaching", ghost: true }
      ],
      stats: [
        { value: "20+", label: "년 KARI 재직 (2001~)" },
        { value: "242억원", label: "위성정보활용사업 연구책임 2022–2026" },
        { value: "K3·3A·5·7", label: "검보정·활용 · CAS500-1 · NEONSAT" }
      ],
      hud: {
        title: "KOMPSAT-3 · 아리랑 3호",
        rows: [
          { k: "궤도", v: "태양동기 685 km · i 98.13°" },
          { k: "통과시각", v: "LTAN 13:30" },
          { k: "AEISS", v: "PAN 0.7 m · MS 2.8 m" },
          { k: "분광대역", v: "B · G · R · NIR (450–900 nm)" }
        ],
        note: "발사 2012.05.17 · 주 연구 대상 위성"
      },
      console: {
        title: "AEISS 관측 파이프라인",
        status: "ACQUIRING",
        bandHeading: "분광 밴드 응답",
        bands: [
          { k: "B", nm: "450–520 nm" }, { k: "G", nm: "520–600 nm" },
          { k: "R", nm: "630–690 nm" }, { k: "NIR", nm: "760–900 nm" }
        ],
        sampleHeading: "현재 단계의 샘플 영상",
        sampleTags: [
          "L0 · 원시 DN", "L1R · 보정 DN", "L1G · TOA 반사도",
          "L2 · 지표 반사도", "TCT · B/G/W 합성", "NDVI · 지수영상",
          "AI · 변화 마스크", "QA · 품질 플래그"
        ],
        stageHeading: "처리 단계",
        stages: [
          "L0 → L1R 복원", "복사 검보정 (gain · offset)", "TOA 반사도 변환",
          "대기 · 그림자 보정", "TCT 변환 (B · G · W)", "식생 · 해빙 지수 산출",
          "AI 변화탐지 추론", "품질 플래그 QA"
        ],
        fleetHeading: "화면의 위성 편대",
        note: "연구 처리 흐름 개념 시연 · 실시간 위성 자료 아님"
      }
    },
    sim: {
      pageTitle: "위성활용 시뮬레이터 | 이선구",
      back: "← 홈페이지로 돌아가기",
      heading: "위성활용 시뮬레이터",
      lead: "지표 피복별 분광 반사율과 센서 특성으로 합성한 장면에, 연구에서 실제로 쓰는 처리 체인 — TOA 반사도 → 지수 산출 → 탐지 — 을 그대로 적용합니다. 응용·위성·촬영시기·산출물을 바꾸면 모든 단계가 함께 반응합니다.",
      labels: {
        app: "응용 분야", sensor: "위성", date: "촬영 시기", product: "산출물",
        chain: "처리 체인", stats: "장면 통계", legend: "범례",
        gsd: "지상표본거리", regenerate: "새 장면", mode: "관측 방식"
      },
      apps: [
        { key: "forest", label: "산림 병해충 탐지", desc: "KOMPSAT-3 영상에서 NDVI·노화지수·NIR/R 비·Tasseled Cap Greenness·EVI를 가중 융합한 소나무재선충 위험도." },
        { key: "crop",   label: "작물 생육·생산량",  desc: "다시기 NDVI 기반 필지 단위 생육도 — 생산량 공간정보 조기 예측의 토대." },
        { key: "soil",   label: "토양수분 (SAR)",    desc: "후방산란 기반 반경험적 토양수분 추정. 같은 지역을 광학과 SAR로 번갈아 볼 수 있습니다." },
        { key: "seaice", label: "해빙 농도",         desc: "해빙과 개방 수면의 구분. 세 시기에 걸쳐 유빙 농도가 감소합니다." },
        { key: "flood",  label: "홍수 침수 탐지",    desc: "시기 간 신규 침수 구역 — SAR이 관측을 담당하는 전천후 사례." }
      ],
      sensors: [
        { key: "k3",  label: "KOMPSAT-3",  note: "MS 2.8 m · 광학" },
        { key: "k3a", label: "KOMPSAT-3A", note: "MS 2.2 m · 광학 + 적외" },
        { key: "k7",  label: "KOMPSAT-7",  note: "MS 1.12 m · 광학" },
        { key: "k5",  label: "KOMPSAT-5",  note: "3 m · X-밴드 SAR" }
      ],
      products: [
        { key: "rgb",    label: "실제 색상" },
        { key: "fcc",    label: "위색 합성 (NIR)" },
        { key: "ndvi",   label: "NDVI" },
        { key: "tct",    label: "Tasseled Cap" },
        { key: "detect", label: "탐지 결과" }
      ],
      dates: ["1차 촬영", "2차 촬영", "3차 촬영"],
      chain: [
        "L0 → L1R 복원",
        "복사 검보정 (gain · offset)",
        "TOA 반사도 변환",
        "센서 지상표본거리 재배열",
        "대기 · 그림자 보정",
        "지수 산출 (NDVI · TCT)",
        "가중 확률 융합",
        "탐지 마스크 · 품질 플래그"
      ],
      stats: {
        ndvi: "평균 NDVI", detected: "탐지 면적", target: "대상 피복 면적", signal: "평균 신호"
      },
      legendDetect: ["낮음", "높음"],
      legendNdvi: ["나지 / 수체", "울창한 식생"],
      sarNote: "KOMPSAT-5는 레이더 센서입니다. 실제 색상·위색 합성 자리에는 반사율이 아니라 스페클이 포함된 후방산란이 표시됩니다.",
      disclaimer: "이 페이지의 모든 영상은 시뮬레이션입니다. 공개된 지표 피복 반사율 범위와 센서 제원으로 장면을 절차적으로 생성하고, 처리 체인과 지수 산출식은 실제 연구와 동일하게 적용했습니다. 다만 어떤 수치도 특정 지역의 실측값이 아닙니다."
    },
    trends: {
      heading: "최신 연구동향",
      sub: "고해상도 지구관측 · 표준영상 · L2 부가산출물 · 융복합활용 — 매일 자동 수집, AI 연구 우선",
      updatedPrefix: "갱신", liveLabel: "LIVE",
      emptyTitle: "첫 자동 수집을 기다리는 중입니다",
      emptyBody: "GitHub Actions 가 매일 06:00(KST) 아래 주제로 arXiv·NASA·ESA 를 훑습니다. AI 를 적용한 연구에는 표시가 붙고 앞쪽에 배치됩니다.",
      pause: "일시정지", resume: "재생"
    },
    tracking: {
      heading: "지금 위성은 어디에 있나",
      lead: "KOMPSAT 시리즈와 NEONSAT의 지상 투영 위치입니다. 최신 공개 궤도요소(TLE)를 브라우저에서 직접 전파해 표시합니다. 어두운 영역은 야간, 실선은 지난 35분 지상 자취, 점선은 앞으로 35분입니다.",
      liveLabel: "LIVE",
      tlePrefix: "궤도요소",
      day: "주간", night: "야간",
      cols: ["위성", "위도", "경도", "고도 (km)", "속도 (km/s)", "일조"],
      emptyBody: "아직 궤도요소를 수집하지 않았습니다. GitHub Actions가 한 번 실행되면 위성과 지상 자취가 이 지도에 표시됩니다.",
      note: "TLE로부터 J2 장주기항을 포함한 케플러 모델로 전파한 근사 위치입니다. 당일 궤도요소 기준 수 km 수준이며 정밀 궤도결정(POD) 값이 아닙니다. 실제 촬영 계획·임무 운용과는 무관합니다."
    },

    about: {
      heading: "소개",
      lead:
        "2001년 한국항공우주연구원에 입사한 이래 위성영상의 전주기 — 센서의 물리에서 그 자료 위에 세워지는 서비스까지 — 를 다뤄 왔습니다.",
      paragraphs: [
        "박사학위 연구로 KOMPSAT-2 다중분광카메라의 절대복사검보정을 수립하고 IKONOS·QuickBird와 교차검증했습니다. 국내 최초의 검보정 표준으로, Journal of Applied Remote Sensing에 제1저자로 게재했습니다. 이후 영상검보정기술팀장과 자료처리/검보정팀장을 맡았고 KOMPSAT-3·3A·5의 복사·공간·기하 검보정을 책임 수행했습니다.",
        "2015년부터는 차세대중형위성 1호(CAS500-1) 지상시스템 개발을 책임지고 GK-2·KOMPSAT-6 지상시스템 개발에 참여했습니다. 2022년부터는 국가 위성정보활용사업의 연구책임자로 연 약 48억원 규모의 과제를 5년 연속 수행하고 있습니다.",
        "최근 연구는 세 갈래입니다. SAR — KOMPSAT-5와 Sentinel-1을 비교한 반경험적 토양수분 추정, SAR 표적 응답의 초해상화와 재초점화, 편파 관측 기반 산사태 탐지, PolInSAR 산림 수고 추정, 오프셋트래킹 기반 빙하 이동속도 관측. 융복합 — KOMPSAT-3A와 Sentinel-2의 시공간 자료 융합, 다중위성 융합 지표반사도 산출, Open Data Cube·KIWI-SAT 플랫폼. 활용 — KOMPSAT-3 전용 TCT 계수, 작물 생산량 예측, 종분포 모델링, 소나무재선충 탐지.",
        "2026년 9월부터 UST 한국항공우주연구원 스쿨 전임교원으로서 항공우주시스템공학 전공 학생을 지도합니다."
      ],
      careerHeading: "주요 경력",
      career: [
        { period: "2026 – 현재", title: "부교수 (전임교원)", org: "UST 한국항공우주연구원 스쿨, 항공우주시스템공학 전공" },
        { period: "2021.05 – 2025.03", title: "위성활용부장", org: "한국항공우주연구원" },
        { period: "2013.07 – 현재", title: "책임연구원", org: "한국항공우주연구원 위성활용·검보정" },
        { period: "2012.04 – 2014.12", title: "자료처리/검보정팀장", org: "한국항공우주연구원" },
        { period: "2011.09 – 2012.03", title: "영상검보정기술팀장", org: "한국항공우주연구원" },
        { period: "2001.07 – 2010.08", title: "선임연구원, 원격탐사팀", org: "한국항공우주연구원 위성정보연구소" }
      ],
      educationHeading: "학력",
      education: [],
      awardsHeading: "수상",
      awards: [
        { period: "2012", title: "교육과학기술부 장관 표창", org: "교육과학기술부" },
        { period: "2011", title: "한국항공우주연구원장 표창", org: "한국항공우주연구원" }
      ],
      societyHeading: "학회 · 대외 활동",
      societies: [
        "항공우주시스템공학회 2026 추계학술대회 — 「지구관측위성영상과 AI기술 활용」 OS세션 조직·좌장",
        "한국지리정보학회 상임이사",
        "항공우주시스템공학회 기술이사",
        "Remote Sensing (MDPI) Special Issue “Earth Observation from KOMPSAT” Guest Editor",
        "충남대학교 위성자료영상처리 강의"
      ]
    },
    research: {
      heading: "연구분야",
      lead: "복사 검보정이 토대이고, SAR과 융복합활용이 단일 광학 영상의 한계를 넘어서며, 그 위에서 토양·산림·해빙·작물을 실제로 측정하는 활용 연구가 이루어집니다.",
      refsHeading: "관련 성과",
      // 연구분야 카드를 세 묶음으로 나눠 보여준다 (areas[].group 이 여기 key 를 가리킴)
      groups: [
        { key: "calval", label: "복사 검보정 · 표준산출물",
          note: "위성이 기록한 값을 신뢰할 수 있는 물리량으로 만드는 일과, 그 위에 바로 세워지는 산출물" },
        { key: "imagery", label: "광학 · SAR 영상 활용",
          note: "한 장의 영상에서 답을 끌어내는 처리 기술과, AI로 그 한계를 끌어올리는 연구" },
        { key: "fusion", label: "융복합활용 · 도메인 응용",
          note: "국내 위성군을 융합해 토양·산림·해빙·작물을 실제로 측정하는 연구" }
      ],
      areas: [
        {
          viz: "calval", group: "calval",
          tag: "주 전공",
          title: "복사 검보정",
          body:
            "KOMPSAT 시리즈의 절대·상대 복사 검보정, 기준 타깃 기반 대리 검보정, Landsat-8·EO-1 Hyperion·IKONOS·QuickBird와의 교차 검보정. KOMPSAT-3·3A·5의 복사·공간·기하 검보정을 책임 수행했고, 국내 최초의 KOMPSAT-2 절대복사검보정 표준을 수립했습니다.",
          keywords: ["절대복사보정", "대리검보정", "교차검보정", "SNR / MTF / RER", "TOA 반사도", "6S 지표반사도"],
          refs: [
            { label: "KOMPSAT-2 다중분광카메라 절대복사검보정 (J. Appl. Remote Sens., 2012) — 제1저자", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "KOMPSAT-3A 지표반사도 기반 NDVI 산출 (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" }
          ]
        },
        {
          viz: "sar", group: "imagery",
          tag: "레이더",
          title: "SAR 활용",
          body:
            "광학이 볼 수 없는 조건에서의 KOMPSAT-5 X-밴드 SAR 활용. 반경험적 모델 기반 토양수분 추정(Sentinel-1 비교), 표적 응답의 초해상화 및 재초점화, 편파 관측 기반 산사태 탐지, 군집 최적화 기반 PolInSAR 산림 수고 추정, Coarse-to-fine 오프셋트래킹 빙하 이동속도 관측, 다중시기 자동변화탐지 알림 프로토타입.",
          keywords: ["KOMPSAT-5 X-band", "토양수분", "PolInSAR", "초해상화", "오프셋트래킹", "자동변화탐지"],
          refs: [
            { label: "KOMPSAT-5와 Sentinel-1 비교 반경험적 토양수분 추정 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "오픈액세스 PDF — 토양수분 논문", url: "files/rs-2022-kompsat5-sentinel1-soil-moisture.pdf", kind: "pdf" },
            { label: "KOMPSAT-5 영상 표적 응답 초해상화 (Sensors, 2022)", url: "https://doi.org/10.3390/s22197189", kind: "doi" },
            { label: "오픈액세스 PDF — KOMPSAT-5 초해상화", url: "files/sensors-2022-kompsat5-super-resolution.pdf", kind: "pdf" },
            { label: "위성 SAR 표적 효율적 초해상화 기법 (Sensors, 2023)", url: "https://doi.org/10.3390/s23135893", kind: "doi" },
            { label: "단일·이중·사중 편파 SAR 기반 산사태 탐지 (ISPRS IJGI, 2019)", url: "https://doi.org/10.3390/ijgi8090384", kind: "doi" },
            { label: "PolInSAR 산림 수고 추정 미세조정 (IEEE GRSL, 2025)", url: "https://ieeexplore.ieee.org/document/10930519", kind: "doi" }
          ]
        },
        {
          viz: "fusion", group: "fusion",
          tag: "융복합",
          title: "다중센서 융복합활용",
          body:
            "고해상도 광학 위성영상의 시공간 자료 융합 — KOMPSAT-3A와 Sentinel-2 — 다중위성 자료 융합을 통한 지표반사도 산출, 그리고 KOMPSAT-3/3A/5와 CAS500을 아우르는 조화된 TCT 프레임워크로 플랫폼이 달라도 지수가 비교 가능하도록 합니다. Open Data Cube 적용과 KIWI-SAT 다차원 배열 DB 기반 처리체계가 이를 뒷받침합니다.",
          keywords: ["KOMPSAT-3A × Sentinel-2", "시공간 융합", "Open Data Cube", "KIWI-SAT", "가상 군집"],
          refs: [
            { label: "Orfeo ToolBox 기반 KOMPSAT-3A 지표반사도 NDVI (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "KOMPSAT-5·Sentinel-1 교차 토양수분 추정 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" }
          ]
        },
        {
          viz: "indices", group: "calval",
          tag: "분광지수",
          title: "TCT · 식생지수 개발",
          body:
            "KOMPSAT-3 센서 특화 국내 최초의 PCA 기반 TCT 계수 도출과 딥러닝 기반 도출과의 비교, 그림자 인지(shadow-aware) TCT 프레임워크, 균형 샘플링 기반 훈련 데이터셋 구성. 앞서 한반도 대상 KOMPSAT-2 TCT 계수를 개선하고 KOMPSAT-3A 지표반사도 기반 NDVI를 산출했습니다.",
          keywords: ["TCT", "밝기/녹색도/습윤도", "PCA", "NDVI vs TCG", "Shadow-aware TCT", "TOC 반사도"],
          refs: [
            { label: "KOMPSAT-3A 지표반사도 기반 NDVI (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "지수 산출의 토대가 된 절대복사검보정 (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" }
          ]
        },
        {
          viz: "forest", group: "fusion",
          tag: "생태계",
          title: "산림 · 작물 · 서식지 모니터링",
          body:
            "KOMPSAT-3 2.8 m 영상 기반 소나무재선충병 다중지표 확률 융합 탐지, 위성영상과 딥러닝을 활용한 벼 등 주요 작물 생산량 공간정보 조기 예측, 그리고 서식지 예측을 위한 종분포 모델링(KARI-SDM QGIS 플러그인).",
          keywords: ["소나무재선충", "작물 생산량 예측", "종분포 모델", "다시기 분석", "KARI-SDM"]
        },
        {
          viz: "seaice", group: "fusion",
          tag: "극지",
          title: "극지 · 항로 안전",
          body:
            "광학·SAR 결합 해빙 농도·유형 분석, 계절 변동과 장기 추세, 북극항로(NSR) 안전 운항 지원 예측. 연계 연구로 KOMPSAT-5 오프셋트래킹을 활용해 동남극 Campbell Glacier의 2차원 이동속도를 관측했습니다.",
          keywords: ["해빙", "북극항로", "Campbell Glacier", "오프셋트래킹", "시계열"]
        },
        {
          viz: "ai", group: "imagery",
          tag: "AI",
          title: "원격탐사 AI",
          body:
            "운용 처리 체인 내부의 딥러닝: 위성영상 이해를 위한 비전-언어 모델 파인튜닝, KOMPSAT 영상 증강을 위한 label-to-image 변환, 에이전틱 AI 기반 위성활용 시스템 프로토타입, 메모리 초과 영상의 GPU 병렬 무감독 분류, KOMPSAT-3A 신경망 영상정합.",
          keywords: ["비전-언어 모델", "데이터 증강", "에이전틱 AI", "GPU 병렬처리", "영상정합"]
        },
        {
          viz: "ontology", group: "fusion",
          tag: "플랫폼",
          title: "지상시스템 · 활용 서비스",
          body:
            "지상시스템 개발과 그 위의 서비스 — CAS500-1 지상시스템, 위성정보 빅데이터 활용지원체계, 온톨로지·메타데이터 설계, 그리고 수질·자원탐사·재해·토지피복·정밀농업·치안 분야 활용 연구.",
          keywords: ["지상시스템", "빅데이터", "온톨로지", "활용 서비스", "TRL 평가"]
        }
      ],
      simCta: { label: "위성활용 시뮬레이터 열기", note: "합성한 KOMPSAT 장면에 처리 체인을 그대로 적용해 봅니다 — 응용·위성·산출물을 골라 보세요.", href: "applications.html" },
      projectHeading: "연구과제 수행실적",
      projects: [
        {
          period: "2022.01 – 2026.12",
          title: "위성정보활용사업",
          org: "국가과학기술연구회 — 연구책임자",
          body:
            "국가 위성정보활용사업 연구책임자 5년 연속 수행. 연 약 47.7~49.2억원, 누적 약 242억원 규모로 광학·SAR 위성정보 활용 연구를 총괄합니다."
        },
        {
          period: "2026.05 – 2027.04",
          title: "SIRMS",
          org: "KARI × UST 공동연구 — 연구책임자",
          body: "위성영상 기반 원격탐사 모니터링 체계 연구. 북극 해빙 및 산림 건강 모니터링을 대상으로 지표 산출 알고리즘과 AI 분석 파이프라인을 통합 검증합니다."
        },
        {
          period: "2022.05 – 2026.12",
          title: "위성정보 빅데이터 활용지원체계 개발",
          org: "과학기술정보통신부 — 참여연구원",
          body: "대규모 위성정보 분석·유통을 위한 지원체계 개발."
        },
        {
          period: "2020.01 – 2027.12",
          title: "초소형군집위성 개발 — 활용시스템 개발",
          org: "과학기술정보통신부 — 참여연구원",
          body: "초소형 군집위성 사업의 활용시스템 개발."
        },
        {
          period: "2022.11 – 2030.12",
          title: "초소형위성 체계개발 — 활용시스템 개발",
          org: "과학기술정보통신부 — 참여연구원",
          body: "후속 초소형위성 체계개발 사업의 활용시스템 개발."
        },
        {
          period: "2015 – 2019",
          title: "차세대중형위성 1호(CAS500-1) 지상시스템 개발",
          org: "책임 (약 50억원 규모)",
          body: "CAS500-1 지상시스템 개발 책임. GK-2, KOMPSAT-6, 달탐사 지상시스템 개발 참여."
        },
        {
          period: "2011 – 2014",
          title: "KOMPSAT-3 / 3A / 5 검보정",
          org: "책임 (합계 약 110억원 규모)",
          body: "KOMPSAT-3·3A·5 시스템개발사업의 복사·공간·기하 검보정 책임 수행."
        }
      ]
    },
    aiwatch: {
      heading: "AI 기술동향",
      lead:
        "지구관측 분야의 기계학습이 실제로 어디로 가고 있는지, 그리고 제 연구에서 각 기법을 어디에 두고 있는지를 함께 보여줍니다. 레이더는 제 판단이고, 아래 논문 목록은 매일 아침 arXiv에서 자동 수집되므로 둘을 서로 견줘볼 수 있습니다.",
      liveLabel: "자동",
      radarHeading: "기술 레이더",
      radarNote:
        "유행이 아니라 제 KOMPSAT 연구에서 각 기법이 어디까지 와 있는지를 기준으로 배치했습니다. 반기마다 재검토합니다.",
      rings: [
        { key: "adopt",  label: "도입", note: "KOMPSAT 자료에 실제로 쓰고 있음" },
        { key: "trial",  label: "시험", note: "시제품·논문까지 갔으나 아직 운용 전" },
        { key: "assess", label: "평가", note: "주시 중 — 아직 제 결과물은 없음" },
        { key: "hold",   label: "보류", note: "지켜보되 지금 투입할 단계는 아님" }
      ],
      tracks: [
        { key: "sar",         short: "SAR-DL", ring: "adopt",
          label: "SAR 딥러닝",
          note: "KOMPSAT-5 토양수분 추정·초해상화에 적용" },
        { key: "restoration", short: "초해상", ring: "adopt",
          label: "초해상·영상복원",
          note: "프로그램 등록 완료, KOMPSAT-3/3A 산출물에 사용" },
        { key: "vlm",         short: "VLM",    ring: "trial",
          label: "비전-언어 모델",
          note: "장면 이해용 멀티모달 모델 미세조정 (IGARSS 2025)" },
        { key: "agentic",     short: "에이전트", ring: "trial",
          label: "에이전틱 AI",
          note: "에이전트 기반 위성활용 파이프라인 프로토타입" },
        { key: "foundation",  short: "FM",     ring: "assess",
          label: "지구관측 파운데이션 모델",
          note: "빠르게 움직이나 그 아래 검보정 문제는 아직 미해결" },
        { key: "ssl",         short: "SSL",    ring: "assess",
          label: "자기지도·소수샷 학습",
          note: "KOMPSAT 라벨 자료가 부족한 영역에서 유망" }
      ],
      feedHeading: "트랙별 최신 논문",
      allLabel: "전체",
      volumeHeading: "월별 논문 발표량",
      volumeNote:
        "지구관측과 기계학습이 함께 등장하는 arXiv 논문을 월 단위로 센 것입니다. 진행 중인 이번 달은 아직 끝나지 않아 비교가 안 되므로 제외했습니다. 거칠지만 분야의 속도를 가늠하는 정직한 지표입니다.",
      volumeUnit: "편",
      volumeEmpty: "첫 자동 수집을 기다리는 중입니다.",
      statLatest: "최근 완료 월 발표량",
      statDelta: "12개월 증감",
      statTracked: "수집된 논문",
      tableLabel: "표로 보기",
      tableMonth: "월",
      tableCount: "편수",
      updatedPrefix: "수집",
      emptyTitle: "첫 자동 수집을 기다리는 중입니다",
      emptyBody:
        "GitHub Action이 매일 06:00(KST)에 arXiv를 조회해 트랙별로 정리합니다."
    },

    media: {
      heading: "영상 · 연구자료",
      lead: "지구관측 임무 영상과 연구 결과 이미지입니다.",
      videoHeading: "영상",
      play: "재생",
      videos: [
        { id: "0XCZgwDltmY", title: "다목적실용위성(아리랑) 3호 임무연장", caption: "서브미터급 광학 관측위성 KOMPSAT-3의 운용과 임무연장", credit: "© 한국항공우주연구원 KARI TV" },
        { id: "N-F3hM8IxZM", title: "아리랑위성 7호 발사 성공", caption: "30cm급 초고해상도 지구관측 임무", credit: "© 한국항공우주연구원 KARI TV" },
        { id: "Bv3pB9TaWOk", title: "Sentinel-2: an introduction", caption: "다중분광 지구관측 임무의 구성과 관측 개념", credit: "© ESA" },
        { id: "6eh4EqVCXLk", title: "Landsat Senses a Disturbance in the Forest", caption: "위성 시계열로 산림 교란을 탐지하는 원리", credit: "© NASA Goddard" }
      ],
      galleryHeading: "연구 결과 이미지",
      gallery: [],
      galleryEmpty: "연구 결과 이미지를 준비 중입니다."
    },
    publications: {
      heading: "연구성과",
      lead: "학술지 논문, 학술대회 발표, 특허 및 프로그램 등록 실적입니다.",
      highlightsHeading: "대표 성과",
      highlights: [
        { title: "국내 최초 KOMPSAT-2 검보정 표준", body: "반사율 기반 방법으로 KOMPSAT-2 다중분광카메라 절대복사검보정을 수행하고 IKONOS·QuickBird와 교차검증 (J. Applied Remote Sensing, 2012, 제1저자)." },
        { title: "KOMPSAT-3 / 3A / 5 검보정 책임", body: "세 개 위성 시스템개발사업의 복사·공간·기하 검보정을 책임 수행 (2011–2014)." },
        { title: "위성정보활용사업 연구책임자", body: "2022년부터 5년 연속 국가 위성정보활용사업 연구책임자, 누적 약 242억원." },
        { title: "국내 최초 KOMPSAT-3 TCT 계수", body: "PCA로 센서 특화 TCT 계수를 도출하고 딥러닝 기반 도출과 비교, shadow-aware 프레임워크 구축 — KOMPSAT 시리즈 최초." }
      ],
      tabs: { papers: "학술지 논문", conferences: "학술대회", patents: "특허", software: "프로그램" },

      papers: [
        { year: 2025, authors: "공저", title: "Breeding habitat prediction and nest-site characteristics of the fairy pitta (Pitta nympha) in Geoje-si, South Korea", venue: "Global Ecology and Conservation", type: "SCI" },
        { year: 2025, authors: "제2저자", title: "Fine-tuning of forest height retrieval in PolInSAR using population-based optimization", venue: "IEEE Geoscience and Remote Sensing Letters", type: "SCI" },
        { year: 2024, authors: "공저", title: "Prospects of utilizing the Korean satellite program for geological disaster detection and analysis", venue: "Geoscience Journal", type: "SCI" },
        { year: 2023, authors: "제2저자", title: "Efficient super-resolution method for targets observed by satellite SAR", venue: "Sensors", type: "SCI" },
        { year: 2022, authors: "제2저자", title: "Super-resolution procedure for target responses in KOMPSAT-5 images", venue: "Sensors", type: "SCI" },
        { year: 2022, authors: "공저", title: "Comparison of KOMPSAT-5 and Sentinel-1 radar data for soil moisture estimation using a new semi-empirical model", venue: "Remote Sensing", type: "SCI" },
        { year: 2022, authors: "이승재, 이선구", title: "KOMPSAT-5 영상에 대한 재초점화(Refocusing) 성능 분석", venue: "한국전자파학회논문지 33(4), 259–264", type: "KCI" },
        { year: 2022, authors: "한수희, 이정호, 이선구", title: "GPU를 이용한 위성영상 병렬처리", venue: "한국측량학회지 40(6)", type: "KCI" },
        { year: 2020, authors: "공저", title: "Determination of NDVI with top-of-canopy reflectance from a KOMPSAT-3A image using Orfeo ToolBox", venue: "ISPRS International Journal of Geo-Information", type: "SCI" },
        { year: 2019, authors: "제2저자", title: "On the use of single-, dual- and quad-polarimetric SAR observation for landslide detection", venue: "ISPRS International Journal of Geo-Information", type: "SCI" },
        { year: 2019, authors: "공저", title: "Consideration points for application of KOMPSAT data to Open Data Cube", venue: "한국지리정보학회지", type: "SCI" },
        { year: 2016, authors: "공저", title: "Estimation of seasonal topographic variation in tidal flats using the waterline method", venue: "Coastal and Shelf Science", type: "SCI" },
        { year: 2016, authors: "공저", title: "Relating light reflectance of a leaf to light absorbance by foliar chlorophyll for detection of forest condition", venue: "Journal of Animal and Plant Sciences", type: "SCI" },
        { year: 2012, authors: "이선구 외 (제1저자)", title: "Absolute radiometric calibration of the KOMPSAT-2 multispectral camera using a reflectance-based method and empirical comparison with IKONOS and QuickBird images", venue: "Journal of Applied Remote Sensing", type: "SCI" },
        { year: 2012, authors: "공저", title: "Analysis of spatial and seasonal distributions of MODIS aerosol optical properties in the Yellow Sea region in 2009", venue: "Environmental Monitoring and Assessment", type: "SCI" },
        { year: 2011, authors: "공저", title: "Characteristics of aerosol types during large-scale transport of air pollution over the Yellow Sea region and at Cheongwon, Korea, in 2008", venue: "Environmental Monitoring and Assessment", type: "SCI" },
        { year: 2006, authors: "이선구 (제1저자)", title: "Absolute Radiometric Calibration을 위한 Field Campaign과 시험결과", venue: "항공우주기술", type: "KCI" }
      ],

      conferences: [
        { year: 2026, authors: "이선구", title: "KOMPSAT-3 다중분광영상의 다중지표 확률융합을 이용한 위성 기반 산림 병해충 모니터링 방법론", venue: "제77차 국제우주대회(IAC 2026) 지구관측 심포지엄 — Paper ID 106539", type: "Conference" },
        { year: 2025, authors: "이동호, 정대원, 이선구", title: "Development of a web-based analytical framework for soil moisture estimation using multi-polarized SAR data", venue: "ISPRS Geo-Spatial Week 2025", type: "Conference" },
        { year: 2025, authors: "박강현, 이선구", title: "Satellite data augmentation via label-to-image translation for KOMPSAT imagery", venue: "International Symposium on Remote Sensing 2025", type: "Conference" },
        { year: 2025, authors: "오한, 신동빈, 서현우, 이선구, 정대원", title: "Enhancing satellite image analysis with fine-tuned vision-language models", venue: "IEEE IGARSS 2025", type: "Conference" },
        { year: 2025, authors: "이선구", title: "PCA와 AI모델을 이용한 KOMPSAT-3 다중분광위성 TCT 계수 산정 및 비교분석", venue: "항공우주시스템공학회 2025 추계학술대회", type: "Conference" },
        { year: 2025, authors: "박강현, 이동호, 이선구", title: "에이전틱 AI 기반 위성활용 시스템 프로토타입 개발", venue: "대한원격탐사학회 2025 추계학술대회", type: "Conference" },
        { year: 2024, authors: "오한, 신동빈, 이선구", title: "Finetuning multimodal model for enhanced satellite image understanding", venue: "AGU Fall Meeting 2024", type: "Conference" },
        { year: 2024, authors: "한수희, 이정호, 이선구", title: "오토인코더 기반 위성영상의 무감독분류와 병렬처리", venue: "한국지리정보학회 2024 추계학술대회", type: "Conference" },
        { year: 2023, authors: "한수희, 이정호, 이선구", title: "Parallel processing an out-of-memory satellite image using a GPU: implemented on k-means clustering", venue: "AGU Fall Meeting 2023", type: "Conference" },
        { year: 2023, authors: "Sharma, S., 류동렬, Sumesh K.C., 이선구, 정승택", title: "Synergistic use of Sentinel-1 and Sentinel-2 images for in-season crop type classification", venue: "IEEE IGARSS 2023", type: "Conference" },
        { year: 2023, authors: "이훈희, 이선구", title: "Feasibility study for application of an artificial neural network for KOMPSAT-3A satellite image matching", venue: "28th International Symposium on Remote Sensing", type: "Conference" },
        { year: 2016, authors: "이선구 외", title: "Radiometric cross-calibration of KOMPSAT-3A with Landsat-8", venue: "ISPRS Congress", type: "Conference" },
        { year: 2014, authors: "이선구 외", title: "6S 모델과 대리복사검보정을 이용한 KOMPSAT-3 지표반사도 산출", venue: "대한원격탐사학회", type: "Conference" },
        { year: 2012, authors: "이선구 외", title: "한반도 대상 KOMPSAT-2 Tasseled Cap 변환 계수 개선", venue: "대한원격탐사학회", type: "Conference" }
      ],

      patents: [
        { year: 2026, title: "선박 형상 추정 방법 및 선박 형상 추정 시스템", number: "제10-2916018호 (출원 10-2022-0123234, 2022.09.28)", status: "등록 2026.01.16", country: "KR", inventors: "한국항공우주연구원" },
        { year: 2025, title: "작물 생산량 공간 정보 예측 방법 및 시스템", number: "제10-2804554호 (출원 10-2022-0121636, 2022.09.26)", status: "등록 2025.04.30", country: "KR", inventors: "한국항공우주연구원" },
        { year: 2025, title: "SAR 위성자료를 이용한 토양수분함량 추정 시스템", number: "공개특허", status: "공개", country: "KR", inventors: "한국항공우주연구원" },
        { year: 2025, title: "다중분광 위성센서에 최적화된 적응형 주성분분석 기반 TCT 계수 도출 방법 및 장치", number: "선행기술조사 완료 2025.10", status: "국내출원 진행", country: "KR", inventors: "이선구 (주발명자)" }
      ],

      software: [
        { year: 2025, title: "KOMPSAT-3 다중분광영상 전처리 및 TCT 훈련 데이터셋 균형 샘플링 소프트웨어", number: "프로그램 등록신청 SDC2025-1108", status: "등록 신청", country: "KR", inventors: "DN→지표반사율 변환 · NDVI 지표피복 분류 · 씬별 균형 샘플링" },
        { year: 2024, title: "다목적실용위성 3호·3A호 영상 초해상화 알고리즘", number: "프로그램 등록 제3443호", status: "등록", country: "KR", inventors: "" },
        { year: 2024, title: "위성영상 판매관리시스템", number: "프로그램 등록 제3536호", status: "등록", country: "KR", inventors: "" },
        { year: 2023, title: "컨테이너 기반 위성영상 분석관리 라이브러리", number: "프로그램 등록 제3346호", status: "등록", country: "KR", inventors: "" },
        { year: 2023, title: "위성정보분석프로그램(KIWI-SAT) REST API", number: "프로그램 등록 제3320호", status: "등록", country: "KR", inventors: "" },
        { year: 2022, title: "지도정보 수집 및 정합 지원 라이브러리", number: "프로그램 등록 제3207호", status: "등록", country: "KR", inventors: "" }
      ],
      empty: "목록을 준비 중입니다.",
      disclaimer: "주요 실적 위주로 선별했습니다. 이 밖의 국내 학술지 논문·학술대회 발표·프로그램 등록은 개별 표기하지 않았습니다."
    },
    teaching: {
      heading: "UST 교원 활동",
      lead:
        "UST 한국항공우주연구원 스쿨 항공우주시스템공학 전공 전임교원으로 위성정보 활용 분야 석·박사 과정 학생을 지도합니다. 실제 운용 중인 KOMPSAT 자료와 검보정 기준자료, 연구원 설비를 그대로 사용합니다.",
      appointment: {
        heading: "임용 정보",
        rows: [
          { k: "스쿨", v: "한국항공우주연구원 스쿨" },
          { k: "전공", v: "항공우주시스템공학" },
          { k: "교원구분", v: "전임교원 · 부교수" },
          { k: "임용기간", v: "2026.09.01 – 2031.08.31" }
        ]
      },
      topicsHeading: "지도 가능 연구주제",
      topicLabels: { goals: "학습 목표", modules: "핵심 내용", practice: "데이터 · 도구", refs: "관련 자료", open: "강의 개요 · 관련 자료", close: "접기" },
      topics: [
        {
          title: "복사 검보정 및 영상 품질",
          body: "KOMPSAT 센서의 절대·상대·대리 검보정, 센서 간 교차 검증, SNR·MTF·RER 특성 분석.",
          goals: [
            "반사도 기반 대리 표적으로 다중분광 센서의 절대 gain·offset을 도출한다",
            "기준 센서와 교차 검보정하고 분광응답 차이를 보정한다",
            "SNR·MTF·RER을 장면 내 표적에서 산출하고 근거 있게 보고한다"
          ],
          modules: [
            "센서 복사 모델: DN → 센서 입사 복사휘도 → TOA 반사도, 불확도 요인",
            "대리 검보정: 반사도 기반 방법, 사이트 선정, 현장 분광측정, 6S 대기 전달",
            "교차 검보정: 동시 관측, 분광 밴드 보정계수(SBAF), 경년 추세 감시",
            "공간 품질: 엣지 표적 MTF, 상대 엣지 응답(RER), 균일 표적 SNR",
            "사례: KOMPSAT-2 절대검보정 표준 수립과 KOMPSAT-3/3A/5 검보정 프로그램"
          ],
          practice: "KOMPSAT-3/3A L1R + 검보정 기준 자료 · Landsat-8/9 Collection 2 · Py6S · Python(NumPy, rasterio)",
          refs: [
            { label: "KOMPSAT-2 다중분광카메라 절대복사검보정 (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "KOMPSAT-3A 수관 상부 반사도 기반 NDVI (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "Py6S — 6S 복사전달 코드 파이썬 인터페이스", url: "https://py6s.readthedocs.io", kind: "web" }
          ]
        },
        {
          title: "SAR 활용",
          body: "KOMPSAT-5 토양수분, 초해상화·재초점화, 편파 분석, PolInSAR 산림 수고, 오프셋트래킹.",
          goals: [
            "모델을 적용하기 전에 X-밴드 후방산란을 물리적으로 읽는다 — 기하, 스페클, σ⁰ 보정",
            "반경험적 토양수분 추정을 구현하고 현장 자료로 검증한다",
            "편파·간섭 기법을 실제 산림 또는 빙하 문제에 적용한다"
          ],
          modules: [
            "SAR 영상 기하, 스페클 통계, σ⁰ 복사보정과 지형 평탄화",
            "토양수분: 반경험적 모델, 거칠기·식생 영향, KOMPSAT-5 대 Sentinel-1",
            "점표적 초해상화와 표적 응답 재초점화",
            "편파: 분해 기법, 단일·이중·사중 편파의 산사태 탐지 비교",
            "PolInSAR 산림 수고(RVoG)와 coarse-to-fine 오프셋트래킹 빙하 이동속도"
          ],
          practice: "KOMPSAT-5 L1A/L1D · Sentinel-1 GRD/SLC · ESA SNAP · PolSARpro · Python",
          refs: [
            { label: "KOMPSAT-5와 Sentinel-1 비교 반경험적 토양수분 추정 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "오픈액세스 PDF — 토양수분 논문", url: "files/rs-2022-kompsat5-sentinel1-soil-moisture.pdf", kind: "pdf" },
            { label: "KOMPSAT-5 영상 표적 응답 초해상화 (Sensors, 2022)", url: "https://doi.org/10.3390/s22197189", kind: "doi" },
            { label: "오픈액세스 PDF — KOMPSAT-5 초해상화", url: "files/sensors-2022-kompsat5-super-resolution.pdf", kind: "pdf" },
            { label: "단일·이중·사중 편파 SAR 기반 산사태 탐지 (ISPRS IJGI, 2019)", url: "https://doi.org/10.3390/ijgi8090384", kind: "doi" },
            { label: "PolInSAR 산림 수고 추정 미세조정 (IEEE GRSL, 2025)", url: "https://ieeexplore.ieee.org/document/10930519", kind: "doi" },
            { label: "ESA SNAP 툴박스", url: "https://step.esa.int/main/toolboxes/snap/", kind: "web" }
          ]
        },
        {
          title: "다중센서 융복합",
          body: "KOMPSAT-3A와 Sentinel-2 시공간 융합, 국내 위성군 조화, 플랫폼 간 지수 연속성.",
          goals: [
            "서로 다른 센서의 반사도를 분광·복사·기하적으로 비교 가능하게 만든다",
            "시공간 융합 기법을 구현하고 별도 장면으로 정직하게 평가한다",
            "이기종 자료로 분석준비자료(ARD) 데이터 큐브를 구축한다"
          ],
          modules: [
            "분광응답 차이, 밴드 보정계수, BRDF 정규화",
            "정합과 리샘플링: 융합 오차가 실제로 어디서 생기는가",
            "시공간 융합: STARFM 계열과 딥러닝 대안, KOMPSAT-3A × Sentinel-2",
            "KOMPSAT-3/3A/5·CAS500 조화 TCT 프레임워크로 플랫폼 간 지수 연속성 확보",
            "Open Data Cube, STAC 카탈로그, KIWI-SAT 다차원 배열 DB — 플랫폼 계층"
          ],
          practice: "KOMPSAT-3A + Sentinel-2 L2A 쌍 · Open Data Cube · Orfeo ToolBox · xarray / rasterio",
          refs: [
            { label: "Orfeo ToolBox 기반 KOMPSAT-3A 수관 상부 반사도 NDVI (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "KOMPSAT-5·Sentinel-1 토양수분 (Remote Sensing, 2022)", url: "https://doi.org/10.3390/rs14164042", kind: "doi" },
            { label: "Open Data Cube", url: "https://www.opendatacube.org", kind: "web" },
            { label: "Copernicus Data Space Ecosystem — Sentinel-2 자료", url: "https://dataspace.copernicus.eu", kind: "web" }
          ]
        },
        {
          title: "분광지수 개발",
          body: "TCT·식생지수 설계, 대기·지형·그림자 보정, 국내 지표 환경 적합성 평가.",
          goals: [
            "PCA로 센서 전용 Tasseled Cap 계수를 도출하고 각 축의 물리적 의미를 이해한다",
            "국내 토지피복을 대표하도록 도출용 표본 설계를 한다",
            "지수를 신뢰하기 전에 대기·지형·그림자를 보정한다"
          ],
          modules: [
            "Tasseled Cap 이론: Kauth–Thomas, Crist–Cicone, 계수가 센서별인 이유",
            "PCA / Gram–Schmidt 도출, 균형 장면 샘플링, 딥러닝 도출과의 비교",
            "그림자 인지 TCT와 산악 지형 보정(C-correction, SCS+C)",
            "NDVI·EVI·Greenness: 센서·처리수준 간 비교 가능성",
            "검증 설계: 현장 기준, 센서 간 일관성, 계절 안정성"
          ],
          practice: "국내 KOMPSAT-3 L1G 장면 · scikit-learn · Python · QGIS",
          refs: [
            { label: "KOMPSAT-3A 수관 상부 반사도 NDVI (ISPRS IJGI, 2020)", url: "https://doi.org/10.3390/ijgi9040257", kind: "doi" },
            { label: "지수 도출의 토대가 되는 절대복사검보정 (J. Appl. Remote Sens., 2012)", url: "https://doi.org/10.1117/1.JRS.6.063594", kind: "doi" },
            { label: "출원 진행 중 특허 — 적응형 PCA 기반 TCT 계수 도출 (성과 → 특허 참조)", url: "#publications", kind: "web" }
          ]
        },
        {
          title: "생태계 · 극지 모니터링",
          body: "소나무재선충 탐지, 작물 생산량 예측, 종분포 모델링, 해빙·빙하 시계열.",
          goals: [
            "장면의 나열을 보기 좋은 지도가 아니라 근거 있는 변화 측정으로 만든다",
            "하나의 임계값 대신 여러 약한 지표를 확률적으로 융합한다",
            "현장·기준 자료로 검증하고 불확도를 정량화한다"
          ],
          modules: [
            "소나무재선충병: KOMPSAT-3 2.8 m 영상 다중지표 확률 융합",
            "작물 생산량: 시계열 생물계절, 딥러닝 기반 조기 예측",
            "종분포 모델링과 서식지 예측 — KARI-SDM QGIS 플러그인",
            "광학·SAR 결합 해빙 농도·유형, 북극항로(NSR) 안전",
            "동남극 KOMPSAT-5 오프셋트래킹 빙하 이동속도"
          ],
          practice: "다시기 KOMPSAT-3/3A · Sentinel-1/2 · QGIS · PyTorch · NSIDC·Copernicus 해양 산출물",
          refs: [
            { label: "SIRMS — 위성 기반 빙해 항로 감시 체계 (KARI × UST, 2026–27)", url: "#research", kind: "web" },
            { label: "NSIDC Sea Ice Index", url: "https://nsidc.org/data/seaice_index", kind: "web" },
            { label: "Copernicus Data Space Ecosystem — Sentinel-1/2 자료", url: "https://dataspace.copernicus.eu", kind: "web" }
          ]
        },
        {
          title: "지구관측 AI",
          body: "비전-언어 모델, 데이터 증강, 에이전틱 워크플로, GPU 병렬처리, 모델 신뢰도·설명가능성.",
          goals: [
            "라벨이 적은 위성영상에 파운데이션·비전-언어 모델을 적응시킨다",
            "실제 EO 과제용 합성 학습자료를 생성하고 그 효과를 검증한다",
            "에이전틱 처리 워크플로를 구축하고 결과를 설명 가능·신뢰 가능하게 만든다"
          ],
          modules: [
            "EO 파운데이션 모델과 자기지도 사전학습; KOMPSAT에 전이되는 것과 안 되는 것",
            "장면 이해·캡셔닝·검색을 위한 비전-언어 모델",
            "Label-to-image 변환 등 증강 전략과 실제 효과 측정",
            "에이전틱 워크플로: LLM 기반 처리체인 파이프라인, 도구 사용, 가드레일",
            "메모리 초과 장면의 GPU 병렬 무감독 분류; 설명가능성과 신뢰도"
          ],
          practice: "PyTorch 2.x · Hugging Face · LangGraph · 기준 라벨이 있는 KOMPSAT-3A 칩",
          refs: [
            { label: "AI 동향 — 이 사이트의 원격탐사 AI 논문 레이더·피드", url: "#aiwatch", kind: "web" },
            { label: "Papers with Code — 원격탐사 벤치마크", url: "https://paperswithcode.com/area/computer-vision/remote-sensing", kind: "web" }
          ]
        }
      ],
      offerHeading: "학생에게 제공하는 것",
      offers: [
        "KOMPSAT-2/3/3A/5 및 CAS500 영상과 검보정 기준 자료 접근",
        "국가 위성정보활용사업과 연계된 연구 주제 및 연구비 지원",
        "SCI 논문·특허 출원·프로그램 등록까지 이어지는 성과 설계 지도",
        "IGARSS, AGU, ISPRS, IAC 및 국내 학회 발표 기회"
      ],
      recruitHeading: "학생 모집",
      recruitBody:
        "석사·박사·석박사통합 과정 지원자를 상시 상담합니다. 원격탐사 경험이 없더라도 Python 기반 데이터 분석 경험과 지구관측 분야에 대한 관심이 있다면 지원 가능합니다. 관심 주제와 간단한 이력을 이메일로 보내주시면 개별 면담을 안내합니다.",
      recruitCta: "지도교수 면담 문의"
    },
    contact: {
      heading: "연락처",
      lead: "연구 협력, 학생 지도 문의는 이메일로 연락 주시기 바랍니다.",
      labels: { email: "이메일", phone: "전화", office: "주소" },
      office: "대전광역시 유성구 과학로 169-84, 한국항공우주연구원 위성활용연구팀 (34133)",
      linksHeading: "관련 링크",
      linkLabels: { kari: "한국항공우주연구원", ust: "UST 과학기술연합대학원대학교", ustSchool: "UST 한국항공우주연구원 스쿨", orcid: "ORCID", googleScholar: "Google Scholar", researchGate: "ResearchGate" }
    },
    family: {
      heading: "관련 사이트",
      lead: "함께 일하는 기관, 국내 위성정보 활용센터, 학회입니다.",
      groups: [
        {
          key: "centre",
          label: "국내 위성정보 활용센터",
          note: "국내 위성 산출물을 운영·배포하는 분야별 센터",
          items: [
            { label: "KSATDB", sub: "위성정보 활용지원 서비스 · 한국항공우주연구원", url: "https://ksatdb.kari.re.kr/main/main.do", lead: true },
            { label: "국토위성센터", sub: "국토지리정보원 · 국토관측", url: "https://www.ngii.go.kr/nlsc/" },
            { label: "국가기상위성센터", sub: "기상청 · 천리안위성", url: "https://nmsc.kma.go.kr" },
            { label: "환경위성센터", sub: "국립환경과학원 · GEMS", url: "https://nesc.nier.go.kr/ko/html/index.do" },
            { label: "해양위성센터", sub: "한국해양과학기술원 · GOCI", url: "https://kosc.kiost.ac.kr" }
          ]
        },
        {
          key: "society",
          label: "학회",
          note: "임원으로 활동하거나 논문을 싣는 학회",
          items: [
            { label: "대한원격탐사학회", sub: "KSRS", url: "https://www.ksrs.or.kr" },
            { label: "한국지리정보학회", sub: "KAGIS · 상임이사", url: "https://kagis.or.kr" },
            { label: "항공우주시스템공학회", sub: "SASE · 기술이사", url: "https://sase.or.kr" }
          ]
        },
        {
          key: "org",
          label: "소속",
          note: "",
          items: [
            { label: "한국항공우주연구원", sub: "KARI", url: "https://www.kari.re.kr" },
            { label: "UST 한국항공우주연구원 스쿨", sub: "과학기술연합대학원대학교", url: "https://ust.ac.kr" }
          ]
        }
      ]
    },

    footer: {
      copy: "© 2026 이선구 (Sun-Gu Lee). All rights reserved.",
      note: "한국항공우주연구원 · UST 한국항공우주연구원 스쿨"
    },
    ui: { langToggle: "EN", top: "맨 위로", menu: "메뉴", close: "닫기",
          more: "더 보기", less: "접기", details: "자세히", hide: "접기" }
  }
};
