/* ================================================================
   Sachin — portfolio "open book"
   A vertical, scroll-snapping stack of spreads. Each spread has a
   left-page canvas (art) and a right-page line of text. A shared,
   fixed background of flowing glyphs + vignette + grain sits behind
   everything for atmosphere.

   To add a spread:
     1. Add a <section class="spread" id="spread-x" data-spread="kind">
        in index.html (see the existing ones).
     2. Add an entry to SPREADS below for its right-page text.
     3. Add an init function that calls runCanvas(...) for its art,
        or reuse an existing kind.
   ================================================================ */

/* ================================================================
   1) SETTINGS — edit here.
   ================================================================ */

// Shared flowing background of letters & numbers (behind all spreads).
const FLOW = {
  characters: "01",  // just 1s and 0s — binary rain
  fontSize:   11,
  density:    0.0038,
  color:      "200, 200, 200",
  baseOpacity: 0.008, // very faint — deep night
  maxOpacity:  0.03,  // darker peak
  flowX:      10,
  flowY:      18,
  jitter:     3
};

// Per-spread right-page text (keyed by the section id).
const SPREADS = {
    "spread-portrait": {
        eyebrow: "About me",
        line: "Software engineer & researcher — I build thoughtful systems, explore ideas, and turn requirements into living software."
    },
  "spread-ai":         { eyebrow: "Artificial Intelligence",
                         line: "From awareness to transformational, adopt AI as needed." },
  "spread-postgres":   { eyebrow: "PostgreSQL",
                           line: "From infrastructure to Database administration, everything related to PostgreSQL." }
};

// Projects tab content. Each entry is Augment high impact workflows with AIary — the full
// detail for each project lives in its own repository. Rendered as
// cards into #projects-grid by the tabs() module below.
//   status  — short lifecycle label (e.g. "In design", "Active")
//   tags    — a few keyword pills
//   links   — array of { label, href }. Omit href (or leave falsy)
//             to render a disabled placeholder link.
//   art     — a character-grid for the LEFT-PAGE pixel-art (see
//             pixelArt()). Each row is a string; recognised cells are
//             the three brightness tones used by the renderer:
//               muted  (body):      E or S
//               bright (highlight): B or Q
//               accent (brightest): T or N
//             ' ' = empty. Grids are ~43 wide x 22 tall so they stay
//             centred by the .pixel-art CSS transform.
const PROJECTS = [
  {
    name: "oxpecker",
    status: "In design",
    // Pixel-art oxpecker-on-an-elephant (the bird's real-world host).
    art: [
      "                    B                      ",
      "                   BBB                     ",
      "                  BBBBB                    ",
      "                   BBB                     ",
      "            EEEEEEEEEEEEEEEEEEEEE          ",
      "         EEEEEEEEEEEEEEEEEEEEEEEE          ",
      "       EEEEEEEEEEEEEEEEEEEEEEEEEEEE        ",
      "      EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE      ",
      "     EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE     ",
      "    EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE    ",
      "   EEEEEEE EEEEEEEEEEEEEEEEEEEEEEEEEEEEE   ",
      "  EEEEEEEE EEEEEEEEEEEEEEEEEEEEEEEEEEEEE   ",
      "  EEEEEEE  EEEEEEEEEEEEEEEEEEEEEEEEEEEEE   ",
      "  EEE      EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE  ",
      "  EE       EEEEEEEEEEEEEEEEEEEEEEEEEEEE E  ",
      "  EE   TT  EEEEEEEEEEEEEEEEEEEEEEEEEEE  E  ",
      "  EE  TT   EEEEEE    EEEE     EEEEEEE   E  ",
      "   E  T    EEEEEE    EEEE     EEEEEE   EEE ",
      "           EEEEEE    EEEE     EEEEEE    E  ",
      "           EEEEEE    EEEE     EEEEEE       ",
      "           EEEEEE    EEEE     EEEEEE       ",
      "           EEEEEE    EEEE     EEEEEE       "
    ],
    tagline: "A keyboard-driven PostgreSQL TUI, built for the terminal and the cluster.",
    summary:
      "A static-binary Postgres client that runs anywhere — including air-gapped " +
      "Kubernetes. Read-only by default with explicit, audited write safety. Lazy " +
      "catalog introspection, a fuzzy object finder, keyset-paged data views, and a " +
      "streaming SQL results grid. Later phases add seeded synthetic data generation " +
      "and resettable database environments for training AI agents, exposed over MCP.",
    tags: ["Go / Rust", "PostgreSQL", "TUI", "Kubernetes", "Air-gapped", "AI agents"],
    links: [
      { label: "Repo", href: "https://github.com/nofinsachin/oxpecker" },
      { label: "Project", href: "https://github.com/users/nofinsachin/projects/1" }
    ]
  },
  {
    name: "scribe",
    status: "In design",
    tagline: "A local-first TUI that answers who changed this field, and when.",
    summary:
      "A tiny, offline terminal explorer for Kubernetes object authorship. It decodes " +
      "an object's managedFields into a browsable field → actor → timestamp graph, so " +
      "you can see exactly which controller last wrote each field and pivot across the " +
      "owner chain. No backend, no SaaS, no audit-log pipeline — just a single static " +
      "binary. Runs interactively as a TUI, or non-interactively for piping into scripts.",
    tags: ["Rust", "ratatui", "kube-rs", "Kubernetes", "TUI", "managedFields"],
    // Left-page art: a pure-CSS 3D pencil writing on paper (see
    // pencilArt() + the .pencil-stage rules in styles.css).
    artKind: "pencil",
    links: [
      { label: "Repo", href: "https://github.com/nofinsachin/scribe" }
    ]
  }
];

// Research tab content. Each entry is a topic I'm investigating —
// a short abstract plus the angle I'm taking. Rendered as a numbered
// list into #research-list by the tabs() module below.
//   status  — short lifecycle label (e.g. "Exploring", "Writing")
//   tags    — a few keyword pills
//   links   — optional array of { label, href }
const RESEARCH = [
  {
    title: "therapist",
    status: "Exploring",
    art: ["401", "403", "404", "500", "502"],   // left-page 3D error codes
    abstract:
      "Order management systems in telecom coordinate long, multi-step fulfilment " +
      "flows across many downstream systems. When a step stalls or fails, the order " +
      "falls into an error or jeopardy state that today is largely handled with static " +
      "rules, manual triage, and tribal knowledge — slow to resolve and hard to scale.",
    angle:
      "Survey the current state of error and jeopardy handling in modern OM stacks, " +
      "then design a modern, AI-powered approach: automatic classification of failures, " +
      "root-cause and impact prediction, and guided or autonomous remediation — reducing " +
      "fallout, missed SLAs, and manual intervention.",
    tags: ["Telecom", "Order Management", "Jeopardy", "AI / ML", "Automation"],
    links: []
  }
];

// ---- Services: Neural brain (left page) — monochrome 3D point cloud ----
const BRAIN = {
  centerFrac: 0.25,   // horizontal centre of the brain (left page)
  offsetY:    -100,   // px shift of the whole spread upward (brain + text, see CSS)
  widthFrac:  0.70,   // size as a fraction of viewport width...
  heightFrac: 0.86,   // ...and height; the smaller one fits the model
  color:      "234, 196, 210",   /* soft desaturated pink — a subtle tint on the brain */

  count:      1300,   // total nodes across all lobes (denser = reads as a brain)
  linkDist:   0.9,    // model-space distance under which nodes get a synapse
  maxLinks:   4,      // max synapse lines per node (richer web)

  // --- motion ---
  spinSpeed:  0.22,   // radians/sec the brain rotates around its vertical axis
  tiltX:      0.39,   // forward tilt (radians) ≈ the reference camera's 22° look-down
  tiltStart:  0.6,    // static spin angle used under reduced motion
  fov:        4.2,    // perspective strength (bigger = flatter)

  // --- node appearance (depth drives size + brightness) ---
  // Alphas are lower than for flat dots because additive blending
  // accumulates brightness where nodes overlap (dense = brighter).
  dotSize:    0.9,    // bright-core radius (px, far side)
  sizeBoost:  1.5,    // extra core radius for the nearest nodes
  glowScale:  3.2,    // halo radius = core * this (soft outer glow)
  minAlpha:   0.10,   // dimmest (far) node
  maxAlpha:   0.55,   // brightest (near) node core

  // --- synapse lines ---
  lineMinAlpha: 0.02, // faint far links
  lineMaxAlpha: 0.10, // brighter near links

  // --- hover highlight ---
  hoverRadius: 100,   // px radius of the hover glow
  hoverBoost:  0.8,   // extra brightness (0..1) at the cursor centre

  glow:       "rgba(234,196,210,0.3)"
};

/* ================================================================
   2) APPLY RIGHT-PAGE TEXT (from SPREADS)
   ================================================================ */
(function applySpreadText() {
  // Split a title into word <span>s so CSS can reveal them one at a time
  // (mirrors the Home hero). Each span gets a --i for the stagger.
  const esc = (s) => String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const toWords = (text) => String(text).trim().split(/\s+/)
    .map((w, i) => `<span class="word" style="--i:${i}">${esc(w)}</span>`)
    .join(" ");

  document.querySelectorAll(".spread").forEach(sec => {
    const data = SPREADS[sec.id];
    if (!data) return;
    const eyebrow = sec.querySelector(".aspect__eyebrow");
    const line = sec.querySelector(".aspect__line");
    if (eyebrow) eyebrow.innerHTML = data.eyebrow ? toWords(data.eyebrow) : "";
    if (line) line.textContent = data.line;
  });
})();

/* ================================================================
   2b) TOP TABS — real view routing (Home / Projects / Research).
       Clicking a tab shows the matching <main class="view"> and
       hides the others, updates the active-tab styling, and reflects
       the choice in the URL hash (so links/refreshes are stable).
       Also renders the PROJECTS cards into the Projects view once.
   ================================================================ */
(function tabs() {
  const tabEls  = Array.from(document.querySelectorAll(".tab"));
  const viewEls = Array.from(document.querySelectorAll(".view"));
  if (!tabEls.length || !viewEls.length) return;

  const names = tabEls.map(t => t.dataset.tab);

  // --- render the Projects cards (once) ---
  function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid || grid.childElementCount || !Array.isArray(PROJECTS)) return;
    const list = PROJECTS;
    const esc = (s) => String(s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));

    // Left-page pixel-art for a project. The scene is a character grid
    // (supplied per-project as `art`); it's rendered as a single element
    // whose box-shadow paints one square per pixel, so it stays crisp at
    // any scale and needs no image file. Scoped under .bird-stage so it
    // sits on the LEFT PAGE of the spread.
    //
    // Three brightness tones are recognised, each with two aliases so a
    // grid can read naturally for its subject:
    //   muted  (body):      E / S   e.g. elephant, parchment scroll
    //   bright (highlight): B / Q   e.g. bird, quill feather
    //   accent (brightest): T / N   e.g. tusk, ink / nib
    function pixelArt(grid) {
      if (!Array.isArray(grid) || !grid.length) return "";
      const MUTED  = "rgba(237,237,237,0.78)";
      const BRIGHT = "#ffffff";
      const ACCENT = "rgba(237,237,237,0.95)";
      const cell = { E: MUTED, S: MUTED, B: BRIGHT, Q: BRIGHT, T: ACCENT, N: ACCENT };
      const shadows = [];
      for (let y = 0; y < grid.length; y++) {
        const row = grid[y];
        for (let x = 0; x < row.length; x++) {
          const color = cell[row[x]];
          if (color) shadows.push(`calc(${x} * var(--px)) calc(${y} * var(--px)) 0 0 ${color}`);
        }
      }
      // The element itself is one pixel at the origin; box-shadow paints
      // the rest. Width/height just define the pixel size via --px.
      return `
        <div class="bird-stage" aria-hidden="true">
          <div class="pixel-art" style="box-shadow: ${shadows.join(", ")}"></div>
        </div>`;
    }

    // Pure-CSS 3D pencil writing on paper (left page). No JS animation —
    // all motion lives in the .pencil-stage rules in styles.css. The
    // markup is just the scene graph: a tilted paper sheet with graphite
    // lines that draw themselves, and a pencil (barrel / wood / lead /
    // ferrule / eraser) that drifts across it in sync. Monochrome.
    function pencilArt() {
      return `
        <div class="pencil-stage" aria-hidden="true">
          <div class="pencil-scene">
            <div class="paper">
              <span class="paper__line"></span>
              <span class="paper__line"></span>
              <span class="paper__line"></span>
            </div>
            <div class="pencil-anchor">
              <div class="pencil">
                <span class="pencil__eraser"></span>
                <span class="pencil__ferrule"></span>
                <span class="pencil__body"></span>
                <span class="pencil__wood"></span>
                <span class="pencil__lead"></span>
              </div>
            </div>
          </div>
        </div>`;
    }

    // Pick the left-page art for a project. Default is pixel-art; a
    // project can opt into a different scene via `artKind`.
    function projectArt(p) {
      if (p.artKind === "pencil") return pencilArt();
      return pixelArt(p.art);
    }

    // Each project is a full-viewport spread, mirroring the Home book:
    // left page = art, right page = eyebrow + caption. Extra project
    // detail (summary, tags, links) sits under the caption on the right.
    grid.innerHTML = list.map((p, i) => {
      const tags = (p.tags || []).map(t => `<li>${esc(t)}</li>`).join("");
      const links = (p.links || []).map(l => {
        const label = esc(l.label || "Link");
        return l.href
          ? `<a class="project-card__link" href="${esc(l.href)}" target="_blank" rel="noopener">${label}</a>`
          : `<a class="project-card__link" href="#" aria-disabled="true" title="Coming soon">${label}</a>`;
      }).join("");
      return `
        <section class="spread" aria-label="${esc(p.name)}">
          ${projectArt(p)}
          <div class="spread__spine" aria-hidden="true"></div>
          <div class="page--right">
            <p class="aspect__eyebrow">${esc(p.name)}</p>
            ${p.status ? `<p class="project__status">${esc(p.status)}</p>` : ""}
            ${p.tagline ? `<p class="aspect__line">${esc(p.tagline)}</p>` : ""}
            ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
            ${tags ? `<ul class="project-card__tags">${tags}</ul>` : ""}
            ${links ? `<div class="project-card__links">${links}</div>` : ""}
          </div>
        </section>`;
    }).join("");
  }

  // --- render the Research topics (once) ---
  function renderResearch() {
    const listEl = document.getElementById("research-list");
    if (!listEl || listEl.childElementCount || !Array.isArray(RESEARCH)) return;
    const esc = (s) => String(s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));

    // Pure-CSS 3D extruded error codes for the left page. Accepts a
    // single glyph or a list (e.g. ["401","403","404","500","502"]).
    // Each code is its own 3D glyph; CSS scatters them at different
    // positions, depths, and drift phases so the page reads full.
    // Depth comes from layered text-shadow. Scoped -> LEFT PAGE.
    function error3dArt(glyphs) {
      const list = Array.isArray(glyphs) ? glyphs : [glyphs];
      const items = list.map((g, k) =>
        `<span class="error3d__code" style="--k:${k}">${esc(g)}</span>`
      ).join("");
      return `
        <div class="error3d-stage" aria-hidden="true">
          <div class="error3d">${items}</div>
        </div>`;
    }

    listEl.innerHTML = RESEARCH.map((r, i) => {
      const tags = (r.tags || []).map(t => `<li>${esc(t)}</li>`).join("");
      const links = (r.links || []).map(l => {
        const label = esc(l.label || "Link");
        return l.href
          ? `<a class="project-card__link" href="${esc(l.href)}" target="_blank" rel="noopener">${label}</a>`
          : `<a class="project-card__link" href="#" aria-disabled="true" title="Coming soon">${label}</a>`;
      }).join("");
      return `
        <section class="spread" aria-label="${esc(r.title)}">
          ${error3dArt(r.art || ["404"])}
          <div class="spread__spine" aria-hidden="true"></div>
          <div class="page--right">
            <p class="aspect__eyebrow">${esc(r.title)}</p>
            ${r.status ? `<p class="project__status">${esc(r.status)}</p>` : ""}
            ${r.abstract ? `<p class="research-item__abstract">${esc(r.abstract)}</p>` : ""}
            ${r.angle ? `<p class="research-item__angle">${esc(r.angle)}</p>` : ""}
            ${tags ? `<ul class="project-card__tags">${tags}</ul>` : ""}
            ${links ? `<div class="project-card__links">${links}</div>` : ""}
          </div>
        </section>`;
    }).join("");
  }

  function setActive(name) {
    if (!names.includes(name)) name = "home";

    tabEls.forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      if (on) t.setAttribute("aria-current", "true");
      else    t.removeAttribute("aria-current");
    });

    viewEls.forEach(v => {
      const on = v.dataset.view === name;
      v.classList.toggle("is-active", on);
      if (on) v.removeAttribute("hidden");
      else    v.setAttribute("hidden", "");
    });

    if (name === "projects") renderProjects();
    if (name === "research") renderResearch();
    if (name === "home") replayHeroReveal();
  }

  // Restart the Home hero's word-by-word reveal each time Home is shown.
  // Toggling .reveal-reset (which kills the animation) and forcing a
  // reflow before removing it re-triggers the CSS keyframes from zero.
  function replayHeroReveal() {
    const hero = document.querySelector(".home-hero");
    if (!hero) return;
    hero.classList.add("reveal-reset");
    void hero.offsetWidth;            // force reflow so the restart "takes"
    hero.classList.remove("reveal-reset");
  }

  tabEls.forEach(el => el.addEventListener("click", (e) => {
    e.preventDefault();
    const name = el.dataset.tab;
    setActive(name);
    if (history.replaceState) history.replaceState(null, "", name === "home" ? "#" : "#" + name);
    else location.hash = name === "home" ? "" : name;
  }));

  // Respond to back/forward and direct #hash loads.
  window.addEventListener("hashchange", () => setActive(location.hash.replace(/^#/, "")));

  // Initial view from the URL hash (defaults to home).
  setActive(location.hash.replace(/^#/, ""));
})();

/* ================================================================
   2c) ABOUT — LEGO ROBOT. A platform plate drops in first (the
       "platform"), then bricks fall onto it one row at a time and
       assemble into a robot (AI). It holds, fades, and replays.
       Rendered flat (straight-on); CSS (.lego-*) does the look and
       the fall. Legend:
         h head   # torso   l limbs   E eyes   a antenna   C chest light
   ================================================================ */
(function legoRobot() {
  const root = document.getElementById("lego-robot");
  if (!root) return;

  // 15 columns wide (same as the platform). Two grey antennae angle out
  // at 45 deg; each starts ON TOP of the outermost head brick.
  const MAP = [
    "..a.........a..",
    "...a.......a...",
    "....a.....a....",
    "....hhhhhhh....",
    "....hEhhhEh....",
    "....hhhhhhh....",
    "......lll......",
    "...ll#####ll...",
    "..ll.#####.ll..",
    "..ll.#####.ll..",
    "..ll.##C##.ll..",
    ".....#####.....",
    ".....ll.ll.....",
    ".....ll.ll.....",
    "....lll.lll....",
  ];
  const COLS = MAP[0].length, PAD = 0;
  if (MAP.some(r => r.length !== COLS)) console.warn("legoRobot: uneven MAP rows");
  const rows = MAP.length;
  const at = (x, y) => (MAP[y] && MAP[y][x]) || ".";
  const stage = root.parentElement;          // the stage sizes itself from these
  stage.style.setProperty("--cols", COLS);
  stage.style.setProperty("--rows", rows);

  const PLATE_DELAY = 0.2, ROBOT_START = 1.5;
  let html = `<span class="lego-plate" style="--d:${PLATE_DELAY}s"></span>`;
  MAP.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === ".") return;
    const delay = (ROBOT_START + (rows - 1 - y) * 0.2 + Math.abs(x - 7) * 0.03).toFixed(2);
    const stud = (c !== "a" && at(x, y - 1) === ".") ? " lego--stud" : "";
    html += `<span class="lego lego--${c}${stud}" style="--x:${x + PAD};--y:${y};--d:${delay}s"></span>`;
  }));
  root.innerHTML = html;

  // Replay forever: when one cycle's animation ends, restart the lot.
  root.addEventListener("animationend", (e) => {
    if (e.target !== root) return;
    root.classList.remove("is-run");
    void root.offsetWidth;
    root.classList.add("is-run");
  });
  root.classList.add("is-run");
})();

/* ================================================================
   3) SHARED HELPERS
   ================================================================ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => Math.random() * (max - min) + min;
const wrap = (v, max) => ((v % max) + max) % max;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Compute the horizontal art centre for a spread. On narrow (stacked)
// screens, centre horizontally and lift into the upper page.
function artCenter(width, height, centerFrac) {
  const narrow = width <= 680;
  return {
    cx: narrow ? width / 2 : width * centerFrac,
    cy: narrow ? height * 0.28 : height / 2,
    narrow
  };
}

/* ================================================================
   4) SHARED BACKGROUND FLOW
   ================================================================ */
(function flow() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const cfg = FLOW;
  const motionScale = reduceMotion ? 0.08 : 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0, glyphs = [], rafId = null, lastT = 0, fontFamily = "monospace";

  // --- live, interactively-tunable state (driven by the Home stage) ---
  let chars = cfg.characters;        // current glyph set (eras swap this)
  let speedMul = 1, speedTarget = 1; // overall flow speed multiplier
  let boost = 0, boostTarget = 0;    // extra brightness 0..1 (eras/stoke)
  let driftX = 0, driftTarget = 0;   // extra horizontal drift px/s (parallax)
  const pickChar = () => chars[Math.floor(Math.random() * chars.length)];

  function build() {
    const count = Math.max(60, Math.floor(width * height * cfg.density));
    glyphs = new Array(count).fill(0).map(() => ({
      x: rand(0, width), y: rand(0, height),
      char: pickChar(),
      phase: rand(0, 6.283), jSpeed: rand(0.4, 1.2)
    }));
  }
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fontFamily = getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = "middle"; build();
  }
  function draw(t) {
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0; lastT = t;
    const tSec = t / 1000;
    // ease the interactive params toward their targets
    speedMul += (speedTarget - speedMul) * Math.min(1, dt * 3);
    boost    += (boostTarget - boost)    * Math.min(1, dt * 2.5);
    driftX   += (driftTarget - driftX)   * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${cfg.fontSize}px ${fontFamily}`;
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      g.x = wrap(g.x + (cfg.flowX * speedMul + driftX) * motionScale * dt, width);
      g.y = wrap(g.y + cfg.flowY * speedMul * motionScale * dt, height);
      const wob = reduceMotion ? 0 : Math.sin(tSec * g.jSpeed + g.phase) * cfg.jitter;
      const alpha = cfg.baseOpacity +
        (0.5 + 0.5 * Math.sin(tSec * 0.5 + g.phase)) * (cfg.maxOpacity - cfg.baseOpacity)
        + boost * 0.05;
      if (!reduceMotion && Math.random() < 0.0008) g.char = pickChar();
      ctx.fillStyle = `rgba(${cfg.color}, ${alpha})`;
      ctx.fillText(g.char, g.x + wob, g.y);
    }
  }
  function loop(t) { draw(t); rafId = requestAnimationFrame(loop); }
  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize(); rafId = requestAnimationFrame(loop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); lastT = 0; }
    else rafId = requestAnimationFrame(loop);
  });

  // Public hooks so the interactive Home stage can drive the atmosphere:
  // swap the glyph set per era, scale flow speed, add brightness/drift.
  window.__flow = {
    setChars(s) { if (s && s !== chars) { chars = s; /* reseed gradually via the random swap in draw() */ } },
    setSpeed(m) { speedTarget = m; },
    setBoost(b) { boostTarget = b; },
    setDrift(d) { driftTarget = d; },
    reset() { chars = cfg.characters; speedTarget = 1; boostTarget = 0; driftTarget = 0; }
  };
})();

/* ================================================================
   4b) MILESTONE POPUPS (Home) — train-driven, no user interaction.
       The train runs left→right on its own. As it ARRIVES at a milestone,
       that milestone's TUI popup unfolds (CSS reacts to .is-lit) and the
       background atmosphere morphs into that era's glyph set. The popup
       closes as the train moves on. Nothing responds to hover/click.
   ================================================================ */
(function homeMilestones() {
  const scene = document.querySelector(".train-scene");
  const loco  = scene && scene.querySelector(".loco");
  const train = scene && scene.querySelector(".train");
  const eras  = scene ? Array.from(scene.querySelectorAll(".era")) : [];
  if (!scene || !eras.length) return;

  // ---- Seamless hand-off: when the train finishes a run (reaches the
  //      right edge and the trainRoll animation loops), slide the site
  //      over to the About tab. Only acts while Home is the active view
  //      and the page is visible, so it won't fire in the background.
  //      The tabs() router listens on hashchange, so setting the hash is
  //      enough to switch views. ----
  if (train) {
    train.addEventListener("animationiteration", (e) => {
      if (e.animationName !== "trainRoll") return;
      const home = document.getElementById("view-home");
      if (!home || !home.classList.contains("is-active")) return;
      if (document.hidden) return;
      if (location.hash.replace(/^#/, "") !== "about") location.hash = "about";
    });
  }

  const flow = () => window.__flow;
  const eraFlow = eras.map(e => e.dataset.flow || "01");

  // ---- the passing train lights the era it is nearest (the only driver) ----
  let litIndex = -1, raf = null, running = false;
  let inRangeSince = 0;              // last time the engine was AT a milestone
  const LINGER = 1500;              // keep the banner this long after it passes (ms)
  function eraCenterX(e) {
    const r = e.getBoundingClientRect();
    return r.left + r.width / 2;
  }
  function setLit(index) {
    if (index === litIndex) return;
    eras.forEach((e, i) => e.classList.toggle("is-lit", i === index));
    litIndex = index;
    const f = flow();
    if (f && index >= 0) { f.setChars(eraFlow[index]); f.setBoost(0.4); }
    else if (f) { f.setBoost(0); }
  }
  function frame() {
    if (loco) {
      const engineX = loco.getBoundingClientRect().left
                    + loco.getBoundingClientRect().width * 0.75;   // loco front
      let nearest = -1, best = 70;                 // px threshold to "arrive"
      eras.forEach((e, i) => {
        const d = Math.abs(engineX - eraCenterX(e));
        if (d < best) { best = d; nearest = i; }
      });
      const now = performance.now();
      if (nearest >= 0) {
        // engine is at a milestone — light it and remember when.
        inRangeSince = now;
        setLit(nearest);
      } else if (litIndex >= 0 && (now - inRangeSince) > LINGER) {
        // engine has moved on AND the linger window elapsed — close the banner.
        setLit(-1);
      }
      /* else: keep the last banner open during the linger window */
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop()  {
    if (!running) return; running = false; cancelAnimationFrame(raf);
    eras.forEach(e => e.classList.remove("is-lit"));
    litIndex = -1; inRangeSince = 0;
    const f = flow(); if (f) f.reset();
  }
  function sync() {
    const home = document.getElementById("view-home");
    if (home && home.classList.contains("is-active")) start(); else stop();
  }
  const homeEl = document.getElementById("view-home");
  if (homeEl) new MutationObserver(sync).observe(homeEl, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("hashchange", () => setTimeout(sync, 0));
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else sync(); });
  sync();
})();

/* ================================================================
   5) SPREAD ANIMATION FRAMEWORK
      Each spread's left-page canvas runs its own rAF loop, but only
      DRAWS while its spread is on screen (tracked by IntersectionObserver)
      so off-screen spreads cost nothing.
   ================================================================ */
const SpreadArt = {
  registry: [],
  register(canvas, api) {
    const entry = { canvas, api, active: false };
    this.registry.push(entry);
    return entry;
  }
};

(function observeSpreads() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const sec = e.target;
      const canvas = sec.querySelector(".spread__canvas");
      const entry = SpreadArt.registry.find(r => r.canvas === canvas);
      if (entry) entry.active = e.isIntersecting && e.intersectionRatio > 0.4;
      // Drive the dramatic title reveal: add .is-visible when the spread
      // is mostly on screen, remove it when it leaves so the word-by-word
      // animation replays each time the spread is scrolled back into view.
      const shown = e.isIntersecting && e.intersectionRatio > 0.4;
      sec.classList.toggle("is-visible", shown);
    });
  }, { threshold: [0, 0.4, 0.75, 1] });
  document.querySelectorAll(".spread").forEach(s => io.observe(s));

  // Projects / Research spreads are rendered the first time their tab is
  // opened (after this ran), so watch for newly added spreads too —
  // otherwise they never get .is-visible and their text stays hidden.
  new MutationObserver((muts) => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.classList.contains("spread")) io.observe(n);
      n.querySelectorAll && n.querySelectorAll(".spread").forEach(s => io.observe(s));
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();

/* Generic per-canvas runner: sizes the canvas and drives the drawer's
   step(dt,t) + draw(t) each frame, only while the spread is active
   (unless the drawer opts into alwaysRun). */
function runCanvas(canvas, makeDrawer) {
  const ctx = canvas.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0, rafId = null, lastT = 0;
  const drawer = makeDrawer(ctx, () => ({ width, height }));
  const entry = SpreadArt.register(canvas, drawer);

  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (drawer.onResize) drawer.onResize(width, height);
  }
  function loop(t) {
    const dt = lastT ? Math.min(0.033, (t - lastT) / 1000) : 0; lastT = t;
    if (entry.active || drawer.alwaysRun) { drawer.step(dt, t); drawer.draw(t); }
    rafId = requestAnimationFrame(loop);
  }
  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize(); rafId = requestAnimationFrame(loop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); lastT = 0; }
    else rafId = requestAnimationFrame(loop);
  });
  return entry;
}

/* ================================================================
   7) SPREAD 2 — TUMBLING CUBES (pure CSS, no JS)
      The scene (rotating stage + three tumbling cubes) is entirely CSS —
      see the .tumble-stage rules in styles.css and the markup in
      index.html. Reduced motion is handled in CSS (animation: none).
      No JS module is required for this spread.
   ================================================================ */

/* ================================================================
   8) SPREAD 3 — NEURAL BRAIN (pure canvas 3D, dependency-free)
      A monochrome point-cloud "brain": ~550 nodes generated inside
      brain-shaped ellipsoids (two hemispheres + cerebellum + stem),
      rotated slowly in 3D and projected to 2D with simple perspective.
      Nearby nodes are joined by faint "synapse" lines (precomputed once).
      Depth controls each node's size + brightness so it reads as volume;
      a cursor hover brightens nearby nodes. Reduced motion: no spin.
   ================================================================ */
(function initBrain() {
  const canvas = document.querySelector('#spread-ai .spread__canvas');
  if (!canvas) return;
  const cfg = BRAIN;

  runCanvas(canvas, (ctx, dims) => {
    let nodes = [];      // { x,y,z } in model space (centered on origin)
    let edges = [];      // [i, j] index pairs for synapse lines
    let cx = 0, cy = 0, scale = 1;
    let tSec = 0;
    let px = -1, py = -1;        // pointer (client coords; -1 = none)

    // Pre-render ONE soft radial-glow dot to an offscreen canvas (the
    // monochrome equivalent of the reference's createCircleTexture glow
    // sprite). We then drawImage it per node — far cheaper than building
    // a radial gradient every frame, and with "lighter" compositing it
    // accumulates like additive blending so dense regions bloom.
    const SPRITE = 64;                         // sprite is 64x64 px
    const glowSprite = document.createElement("canvas");
    glowSprite.width = glowSprite.height = SPRITE;
    {
      const g = glowSprite.getContext("2d");
      const grad = g.createRadialGradient(SPRITE/2, SPRITE/2, 0, SPRITE/2, SPRITE/2, SPRITE/2);
      // Driven by cfg.color so the nodes carry the brain's tint (pink).
      grad.addColorStop(0,    `rgba(${cfg.color}, 1)`);
      grad.addColorStop(0.25, `rgba(${cfg.color}, 0.65)`);
      grad.addColorStop(0.55, `rgba(${cfg.color}, 0.18)`);
      grad.addColorStop(1,    `rgba(${cfg.color}, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE, SPRITE);
    }

    // Random point inside a unit sphere, then scaled to an ellipsoid and
    // offset to a lobe centre. Gives a soft, organic brain volume.
    function addLobe(count, c, rad) {
      for (let i = 0; i < count; i++) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const rr = Math.cbrt(Math.random());
        nodes.push({
          x: rr * Math.sin(phi) * Math.cos(theta) * rad.x + c.x,
          y: rr * Math.sin(phi) * Math.sin(theta) * rad.y + c.y,
          z: rr * Math.cos(phi)                   * rad.z + c.z
        });
      }
    }

    function buildModel() {
      nodes = []; edges = [];
      // Model units: cerebrum ~[-2,+2]; the stem reaches down to y ≈ -5.2.
      addLobe(Math.round(cfg.count * 0.33), { x: -0.6, y: 0,    z: 0    }, { x: 1.4, y: 1.8, z: 2.2 }); // left hemisphere
      addLobe(Math.round(cfg.count * 0.33), { x:  0.6, y: 0,    z: 0    }, { x: 1.4, y: 1.8, z: 2.2 }); // right hemisphere
      addLobe(Math.round(cfg.count * 0.16), { x:  0,   y: -1.6, z: -1.2 }, { x: 1.7, y: 1.1, z: 1.1 }); // cerebellum
      // Brain stem — now an EXTENDED, tapering column so the silhouette
      // reads as a human brain: pons/midbrain (upper, wider) flowing into
      // a long, narrow medulla that descends well below the cerebellum.
      addLobe(Math.round(cfg.count * 0.10), { x: 0, y: -2.6, z: -0.2 }, { x: 0.55, y: 1.0, z: 0.6 }); // pons / midbrain
      addLobe(Math.round(cfg.count * 0.08), { x: 0, y: -4.2, z: -0.1 }, { x: 0.34, y: 1.4, z: 0.38 }); // medulla / descending stem

      // Precompute synapse edges: join each node to a few close neighbours.
      const d2 = cfg.linkDist * cfg.linkDist;
      for (let i = 0; i < nodes.length; i++) {
        let made = 0;
        for (let j = i + 1; j < nodes.length && made < cfg.maxLinks; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          if (dx*dx + dy*dy + dz*dz < d2) { edges.push([i, j]); made++; }
        }
      }
    }

    function onResize(width, height) {
      const c = artCenter(width, height, cfg.centerFrac);
      cx = c.cx; cy = c.cy + (cfg.offsetY || 0);
      // Fit the model to a fraction of the viewport. The vertical extent
      // now binds: the extended stem reaches y ≈ -5.2, so divide by ~5.2
      // (its half-extent) to keep the whole brain — stem included — in
      // the fit box. Larger widthFrac/heightFrac make it a bit bigger.
      scale = Math.min(width * cfg.widthFrac, height * cfg.heightFrac) / 5.2 / 2;
      buildModel();
    }

    function step(dt) { if (!reduceMotion) tSec += dt; }

    // Rotate a model point around Y (spin) then X (fixed tilt), and project
    // to screen with a gentle perspective. Returns {sx, sy, depth} where
    // depth in [0,1] (0 = far, 1 = near) drives size + brightness.
    function project(n) {
      const ay = reduceMotion ? cfg.tiltStart : tSec * cfg.spinSpeed;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      // spin around Y
      let x = n.x * cosY + n.z * sinY;
      let z = -n.x * sinY + n.z * cosY;
      // Flip the model's vertical axis: the lobes are built with the
      // cerebellum/stem at negative y, and canvas +y points DOWN, which
      // rendered the brain upside down. Negating y here turns it upright.
      let y = -n.y;
      // fixed tilt around X so we look slightly down on it
      const cosX = Math.cos(cfg.tiltX), sinX = Math.sin(cfg.tiltX);
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;
      // perspective: far points (more negative z) shrink toward centre
      const persp = cfg.fov / (cfg.fov + z2);
      return {
        sx: cx + x * scale * persp,
        sy: cy + y2 * scale * persp,
        depth: Math.max(0, Math.min(1, (z2 + 2.6) / 5.2)) // normalize [-2.6..2.6]
      };
    }

    function draw() {
      const { width, height } = dims();
      ctx.clearRect(0, 0, width, height);

      // Project every node once this frame.
      const P = new Array(nodes.length);
      for (let i = 0; i < nodes.length; i++) P[i] = project(nodes[i]);

      // Additive blending (like the reference's AdditiveBlending): where
      // many nodes/lines overlap the light accumulates, so dense regions
      // bloom and the cloud reads as a solid, glowing brain volume. Draw
      // order no longer matters, so no depth sort is needed.
      ctx.globalCompositeOperation = "lighter";

      // --- synapse lines (faint web, behind the glowing nodes) ---
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e++) {
        const a = P[edges[e][0]], b = P[edges[e][1]];
        const depth = (a.depth + b.depth) / 2;
        const alpha = cfg.lineMinAlpha + depth * (cfg.lineMaxAlpha - cfg.lineMinAlpha);
        ctx.strokeStyle = `rgba(${cfg.color}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      // --- nodes: soft radial-glow sprites (nearer = bigger & brighter) ---
      for (let i = 0; i < nodes.length; i++) {
        const p = P[i];
        let level = p.depth;

        // hover: brighten nodes near the cursor (pixel distance)
        if (px >= 0) {
          const hd = Math.hypot(p.sx - px, p.sy - py);
          level += Math.max(0, 1 - hd / cfg.hoverRadius) * cfg.hoverBoost;
        }
        level = Math.max(0, Math.min(1, level));

        const alpha = cfg.minAlpha + level * (cfg.maxAlpha - cfg.minAlpha);
        const core = cfg.dotSize + level * cfg.sizeBoost;   // bright core radius
        const halo = core * cfg.glowScale;                  // drawn sprite radius

        // Stamp the cached glow sprite, scaled to 2*halo and faded by alpha.
        // "lighter" compositing makes overlapping stamps accumulate (bloom).
        ctx.globalAlpha = alpha;
        ctx.drawImage(glowSprite, p.sx - halo, p.sy - halo, halo * 2, halo * 2);
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = "source-over";
    }

    // --- pointer events: hover glow follows the cursor ---
    canvas.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; });
    canvas.addEventListener("pointerleave", () => { px = -1; py = -1; });

    return { onResize, step, draw };
  });
})();
