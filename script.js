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
  fontSize:   7,
  density:    0.0038,
  color:      "237, 237, 237",
  baseOpacity: 0.008, // very faint — deep night
  maxOpacity:  0.03,  // darker peak
  flowX:      10,
  flowY:      18,
  jitter:     3
};

// Per-spread right-page text (keyed by the section id).
const SPREADS = {
  "spread-experience": { eyebrow: "Experience", line: "Sixteen years of IT experience." },
  "spread-devops":     { eyebrow: "DevOps & Platform Engineering",
                         line: "Building the tools and pipelines that ship software." },
  "spread-ai":         { eyebrow: "Artificial Intelligence",
                         line: "Bringing intelligence to systems, everywhere." }
};

// Projects tab content. Each entry is a CONDENSED summary — the full
// detail for each project lives in its own repository. Rendered as
// cards into #projects-grid by the tabs() module below.
//   status  — short lifecycle label (e.g. "In design", "Active")
//   tags    — a few keyword pills
//   links   — array of { label, href }. Omit href (or leave falsy)
//             to render a disabled placeholder link.
const PROJECTS = [
  {
    name: "oxpecker",
    status: "In design",
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
  }
];

// ---- Spread 1: Hourglass (left page) — polished ----
const HOURGLASS = {
  heightFrac:  0.34, widthRatio: 0.62, neckRatio: 0.05,
  duration:    12,   centerFrac: 0.25,
  bulge:       0.28,  // how rounded the glass bulbs are (0 = straight cone)
  sandColor:   "rgba(237,237,237,0.6)",
  sandEdge:    "rgba(237,237,237,0.85)",  // brighter sand surface line
  streamColor: "rgba(237,237,237,0.85)",
  glassColor:  "rgba(237,237,237,0.42)",  // glass outline (base)
  glassHi:     "rgba(237,237,237,0.85)",  // glass highlight (light catching)
  frameColor:  "rgba(237,237,237,0.78)",  // end caps + posts (the frame)
  glow:        "rgba(237,237,237,0.25)",
  aura:        "rgba(237,237,237,0.06)",  // faint radial glow behind it
  lineWidth:   1.6,
  grains:      7,     // number of falling sand particles in the stream
  grainSize:   1.3    // particle radius (px)
};

// ---- Spread 2: CSS 3D tool cube (left page) ----
// The cube is implemented in pure CSS (preserve-3d) — see the .cube rules
// in styles.css and the markup in index.html. Edit the six tool names in
// the .cube__face elements in index.html. JS only handles hover-pause.

// ---- Spread 3: Dots-only world map (left page) ----
const WORLDMAP = {
  centerFrac: 0.25,   // horizontal centre of the map (left page)
  widthFrac:  0.42,   // map width as a fraction of viewport width
  dotSize:    1.6,    // base dot radius (px)
  gap:        7,      // spacing between dot cells (px); smaller = denser
  color:      "237, 237, 237",

  // --- brightness range ---
  minAlpha:   0.06,   // darkest a dot gets (the "dark" side)
  maxAlpha:   0.85,   // brightest a dot gets (lit regions)

  // --- drifting light/dark PATCHES (value-noise field) ---
  patchScale: 3.2,    // how many noise cells across the map (bigger = smaller patches)
  patchDrift: 0.06,   // how fast the patches wander (units/sec)
  contrast:   1.6,    // >1 pushes patches toward clearer light/dark separation

  // --- wandering HOTSPOTS (bright flares that roam the map) ---
  hotspots:   3,      // number of roaming bright spots
  hotRadius:  0.16,   // hotspot influence radius (fraction of map width)
  hotSpeed:   0.05,   // how fast hotspots roam

  // --- slow global sweep (kept subtle, layered under the patches) ---
  pulseAlpha: 0.25,   // extra brightness from the sweep band
  pulseSpeed: 0.08,   // sweep speed (fraction/sec)

  // bright dots swell slightly so lit regions "glow"
  sizeBoost:  0.9,    // extra px radius at full brightness

  // --- hover highlight (brightens dots near the cursor) ---
  hoverRadius: 90,    // px radius of the hover glow
  hoverBoost:  0.9,   // extra brightness (0..1) at the cursor centre

  glow:       "rgba(237,237,237,0.3)"
};

/* A compact land mask: each string is a row (north -> south); '#' = land,
   ' ' = sea. Columns map to longitude (-180 -> +180). It's deliberately
   coarse & stylized — enough to read as Earth without any map data file.
   Grid is 60 wide; the renderer samples it to place dots only on land. */
const LAND_MASK = [
  "            ####      #######                               ",
  "       ########### ############### ####          ####       ",
  "     ################################# ###      ##### ##    ",
  "    ##################################     ###########      ",
  "   ###############################         ###########      ",
  "    ###########################             #########       ",
  "     #####################    ##             #######        ",
  "       ###############         #              #####         ",
  "         ###########                           ###          ",
  "          #########            ####           ###    #      ",
  "           #######            ######         ###    ##      ",
  "            #####            ########       ###    ###      ",
  "             ####           ########       ##     ###       ",
  "             ###           ########             #####       ",
  "             ##            #######             ####         ",
  "             ##            ######              ###          ",
  "             #             #####               ##    ##     ",
  "                           ####                     ####    ",
  "                           ###                     #####    ",
  "                            #                       ###     ",
  "                                                            ",
  "                                               #            ",
  "                        ##          ###                     ",
  "                       ####        #####                    "
];

/* ================================================================
   2) APPLY RIGHT-PAGE TEXT (from SPREADS)
   ================================================================ */
(function applySpreadText() {
  document.querySelectorAll(".spread").forEach(sec => {
    const data = SPREADS[sec.id];
    if (!data) return;
    const eyebrow = sec.querySelector(".aspect__eyebrow");
    const line = sec.querySelector(".aspect__line");
    if (eyebrow) eyebrow.textContent = data.eyebrow;
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

    // The pure-CSS oxpecker bird — perched, built from layered shapes.
    // Pixel-art oxpecker-on-an-elephant (the bird's real-world host).
    // The scene is a character grid: 'E' = elephant (grey), 'B' = bird
    // (bright), 'T' = tusk (bright), ' ' = empty. It's rendered as a
    // single element whose box-shadow paints one square per pixel, so it
    // stays crisp at any scale and needs no image file. Scoped under
    // .bird-stage so it sits on the LEFT PAGE of the spread.
    const PIXEL_ART = [
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
    ];

    function pixelArt() {
      const cell = { E: "rgba(237,237,237,0.78)", B: "#ffffff", T: "rgba(237,237,237,0.95)" };
      const shadows = [];
      for (let y = 0; y < PIXEL_ART.length; y++) {
        const row = PIXEL_ART[y];
        for (let x = 0; x < row.length; x++) {
          const c = row[x];
          const color = cell[c];
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
      const num = String(i + 1).padStart(2, "0");
      return `
        <section class="spread" aria-label="${esc(p.name)}">
          ${pixelArt()}
          <div class="spread__spine" aria-hidden="true"></div>
          <div class="page--right">
            <p class="aspect__eyebrow">
              <span class="project__num">${num}</span>${esc(p.name)}
            </p>
            ${p.status ? `<p class="project__status">${esc(p.status)}</p>` : ""}
            ${p.tagline ? `<p class="aspect__line">${esc(p.tagline)}</p>` : ""}
            ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
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
   3) SHARED HELPERS
   ================================================================ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => Math.random() * (max - min) + min;
const wrap = (v, max) => ((v % max) + max) % max;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* Lightweight 2D value noise — smooth, deterministic, dependency-free.
   Returns a value in [0,1] that varies coherently across space (nearby
   inputs give similar outputs), so it's ideal for "patches of light".
   Used by the world map to brighten/dim coherent regions over time. */
function hash2(ix, iy) {
  // Cheap integer hash -> [0,1)
  let h = ix * 374761393 + iy * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return ((h >>> 0) % 100000) / 100000;
}
function valueNoise2D(x, y) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  // smoothstep fade
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash2(x0, y0),     n10 = hash2(x0 + 1, y0);
  const n01 = hash2(x0, y0 + 1), n11 = hash2(x0 + 1, y0 + 1);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;   // [0,1]
}

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

  function build() {
    const count = Math.max(60, Math.floor(width * height * cfg.density));
    glyphs = new Array(count).fill(0).map(() => ({
      x: rand(0, width), y: rand(0, height),
      char: cfg.characters[Math.floor(rand(0, cfg.characters.length))],
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
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${cfg.fontSize}px ${fontFamily}`;
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      g.x = wrap(g.x + cfg.flowX * motionScale * dt, width);
      g.y = wrap(g.y + cfg.flowY * motionScale * dt, height);
      const wob = reduceMotion ? 0 : Math.sin(tSec * g.jSpeed + g.phase) * cfg.jitter;
      const alpha = cfg.baseOpacity +
        (0.5 + 0.5 * Math.sin(tSec * 0.5 + g.phase)) * (cfg.maxOpacity - cfg.baseOpacity);
      if (!reduceMotion && Math.random() < 0.0008)
        g.char = cfg.characters[Math.floor(Math.random() * cfg.characters.length)];
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
    });
  }, { threshold: [0, 0.4, 0.75, 1] });
  document.querySelectorAll(".spread").forEach(s => io.observe(s));
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
   6) SPREAD 1 — HOURGLASS (continuous; never stops)
   ================================================================ */
(function initHourglass() {
  const canvas = document.querySelector('#spread-experience .spread__canvas');
  if (!canvas) return;
  const cfg = HOURGLASS;

  runCanvas(canvas, (ctx, dims) => {
    let cx = 0, topY = 0, midY = 0, botY = 0, halfW = 0, neckW = 0, chamberH = 0;
    let progress = reduceMotion ? 0.5 : 0;
    let grains = [];   // falling sand particles {t} where t in [0,1] down the stream

    function onResize(width, height) {
      const totalH = height * cfg.heightFrac;
      chamberH = totalH / 2;
      halfW = (chamberH * cfg.widthRatio) / 2;
      neckW = halfW * cfg.neckRatio * 2;
      const c = artCenter(width, height, cfg.centerFrac);
      cx = c.cx; topY = c.cy - totalH / 2; midY = topY + chamberH; botY = topY + totalH;
      // seed grains spread along the stream
      grains = new Array(cfg.grains).fill(0).map((_, i) => ({ t: i / cfg.grains }));
    }

    // Straight taper half-width (used to clip sand fills to the glass).
    function halfWidthAt(y) {
      if (y <= midY) { const f = (y - topY) / chamberH; return halfW + (neckW/2 - halfW) * f; }
      const f = (y - midY) / chamberH; return neckW/2 + (halfW - neckW/2) * f;
    }

    function step(dt) {
      if (reduceMotion) return;
      progress += dt / cfg.duration;
      if (progress >= 1) progress -= 1;
      // advance falling grains (fast, wrapping) only while sand is flowing
      for (const g of grains) { g.t += dt * 1.8; if (g.t > 1) g.t -= 1; }
    }

    // One curved glass side from (topX,topY) bowing out to the neck.
    // `sign` = -1 left, +1 right. Uses a quadratic bulge for a blown-glass look.
    function glassSide(sign) {
      const bx = sign * halfW;
      const nx = sign * (neckW / 2);
      const bulgeX = sign * halfW * (1 + cfg.bulge);
      ctx.beginPath();
      ctx.moveTo(cx + bx, topY);
      ctx.quadraticCurveTo(cx + bulgeX, topY + chamberH * 0.55, cx + nx, midY);
      ctx.quadraticCurveTo(cx + bulgeX, botY - chamberH * 0.55, cx + bx, botY);
    }

    function draw() {
      const { width, height } = dims();
      ctx.clearRect(0, 0, width, height);

      // --- ambient aura behind the piece ---
      const auraR = chamberH * 2.4;
      const ag = ctx.createRadialGradient(cx, (topY+botY)/2, 0, cx, (topY+botY)/2, auraR);
      ag.addColorStop(0, cfg.aura);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(cx - auraR, (topY+botY)/2 - auraR, auraR*2, auraR*2);

      // --- sand (top chamber draining, bottom pile growing) ---
      ctx.save();
      ctx.shadowColor = cfg.glow; ctx.shadowBlur = 16;
      ctx.fillStyle = cfg.sandColor;
      const levelY = topY + (midY - topY) * progress;
      ctx.beginPath();
      ctx.moveTo(cx - halfWidthAt(levelY), levelY);
      ctx.lineTo(cx + halfWidthAt(levelY), levelY);
      ctx.lineTo(cx + halfWidthAt(midY), midY);
      ctx.lineTo(cx - halfWidthAt(midY), midY);
      ctx.closePath(); ctx.fill();
      const pileTopY = botY - (botY - midY) * progress;
      ctx.beginPath();
      ctx.moveTo(cx - halfWidthAt(botY), botY);
      ctx.lineTo(cx + halfWidthAt(botY), botY);
      ctx.lineTo(cx + halfWidthAt(pileTopY), pileTopY);
      ctx.lineTo(cx, pileTopY + (midY - pileTopY) * 0.14);   // pile peak
      ctx.lineTo(cx - halfWidthAt(pileTopY), pileTopY);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // brighter sand surface lines (top level + pile ridge)
      ctx.strokeStyle = cfg.sandEdge; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - halfWidthAt(levelY), levelY); ctx.lineTo(cx + halfWidthAt(levelY), levelY); ctx.stroke();

      // --- falling sand grains (lively stream) ---
      if (progress > 0.001 && progress < 0.999) {
        ctx.fillStyle = cfg.streamColor;
        ctx.save(); ctx.shadowColor = cfg.glow; ctx.shadowBlur = 6;
        for (const g of grains) {
          const gy = midY + (pileTopY - midY) * g.t;
          const gx = cx + Math.sin(g.t * 18) * 0.6;   // tiny jitter
          ctx.beginPath(); ctx.arc(gx, gy, cfg.grainSize, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      // --- glass bulbs: base outline + a highlight pass on the right ---
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = cfg.glassColor; ctx.lineWidth = cfg.lineWidth;
      glassSide(-1); ctx.stroke();
      glassSide( 1); ctx.stroke();
      // highlight: a brighter, thinner stroke on the right side (light catching)
      ctx.strokeStyle = cfg.glassHi; ctx.lineWidth = cfg.lineWidth * 0.6;
      glassSide( 1); ctx.stroke();

      // --- frame: end caps + two side posts connecting them ---
      ctx.strokeStyle = cfg.frameColor; ctx.lineWidth = cfg.lineWidth * 1.6;
      const capOver = 8, postX = halfW + capOver;
      // top & bottom caps
      ctx.beginPath(); ctx.moveTo(cx - postX, topY); ctx.lineTo(cx + postX, topY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - postX, botY); ctx.lineTo(cx + postX, botY); ctx.stroke();
      // corner posts
      ctx.lineWidth = cfg.lineWidth * 1.2;
      ctx.beginPath(); ctx.moveTo(cx - postX, topY); ctx.lineTo(cx - postX, botY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + postX, topY); ctx.lineTo(cx + postX, botY); ctx.stroke();
    }
    return { onResize, step, draw, alwaysRun: true };
  });
})();

/* ================================================================
   7) SPREAD 2 — TUMBLING CUBES (pure CSS, no JS)
      The scene (rotating stage + three tumbling cubes) is entirely CSS —
      see the .tumble-stage rules in styles.css and the markup in
      index.html. Reduced motion is handled in CSS (animation: none).
      No JS module is required for this spread.
   ================================================================ */

/* ================================================================
   8) SPREAD 3 — DOTS-ONLY WORLD MAP
      Dots are placed only where the LAND_MASK marks land. Their
      brightness is a blend of:
        • a drifting value-NOISE field  -> coherent patches of light/dark
          that slowly wander (the main "illusion of light and dark"),
        • a few roaming HOTSPOTS        -> brighter flares that travel,
        • a subtle left->right SWEEP    -> faint global "activity".
      Brighter dots also swell a little so lit regions seem to glow.
      Reduced motion: a static noise field, no drift/hotspots/sweep.
   ================================================================ */
(function initWorldMap() {
  const canvas = document.querySelector('#spread-ai .spread__canvas');
  if (!canvas) return;
  const cfg = WORLDMAP;
  const rows = LAND_MASK.length;
  const cols = LAND_MASK[0].length;

  function isLand(col, row) {
    const line = LAND_MASK[row] || "";
    return line.charAt(col) === "#";
  }

  runCanvas(canvas, (ctx, dims) => {
    let dots = [];       // { x, y, u, v }  u,v = normalized map coords [0,1]
    let originX = 0, originY = 0, mapW = 0, mapH = 0;

    function onResize(width, height) {
      const c = artCenter(width, height, cfg.centerFrac);
      mapW = width * cfg.widthFrac;
      mapH = mapW * (rows / cols);
      originX = c.cx - mapW / 2;
      originY = c.cy - mapH / 2;

      dots = [];
      for (let y = 0; y <= mapH; y += cfg.gap) {
        for (let x = 0; x <= mapW; x += cfg.gap) {
          const col = Math.floor((x / mapW) * cols);
          const row = Math.floor((y / mapH) * rows);
          if (isLand(col, row)) {
            dots.push({ x: originX + x, y: originY + y, u: x / mapW, v: y / mapH });
          }
        }
      }
    }

    let tSec = 0;
    let px = -1, py = -1;   // pointer (client coords; -1 = none)
    function step(dt) { if (!reduceMotion) tSec += dt; }

    // Current positions of the roaming hotspots (in normalized u,v space).
    function hotspotAt(i, t) {
      // Each hotspot traces a slow Lissajous path so they never sync up.
      const a = i * 2.3994;  // golden-ish offset per hotspot
      return {
        u: 0.5 + 0.42 * Math.sin(t * cfg.hotSpeed * (1 + i * 0.3) + a),
        v: 0.5 + 0.38 * Math.cos(t * cfg.hotSpeed * (0.8 + i * 0.25) + a * 1.7)
      };
    }

    function draw() {
      const { width, height } = dims();
      ctx.clearRect(0, 0, width, height);

      // Drift offset for the noise field (frozen under reduced motion).
      const drift = reduceMotion ? 0 : tSec * cfg.patchDrift;
      // Sweep band centre [−0.2 .. 1.2].
      const sweep = reduceMotion ? -2 : wrap(tSec * cfg.pulseSpeed, 1.4) - 0.2;

      // Precompute hotspot positions this frame.
      const hs = [];
      if (!reduceMotion) for (let i = 0; i < cfg.hotspots; i++) hs.push(hotspotAt(i, tSec));

      ctx.shadowColor = cfg.glow; ctx.shadowBlur = 6;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // 1) Base brightness from the drifting noise field (coherent patches).
        let n = valueNoise2D(d.u * cfg.patchScale + drift, d.v * cfg.patchScale - drift);
        // push toward clearer light/dark with contrast around the midpoint
        n = Math.max(0, Math.min(1, 0.5 + (n - 0.5) * cfg.contrast));

        // 2) Hotspot flares add brightness near roaming points.
        let hot = 0;
        for (let k = 0; k < hs.length; k++) {
          const du = d.u - hs[k].u, dv = d.v - hs[k].v;
          const dist = Math.sqrt(du * du + dv * dv);
          hot = Math.max(hot, Math.max(0, 1 - dist / cfg.hotRadius));
        }

        // 3) Subtle global sweep.
        let sw = 0;
        if (!reduceMotion) sw = Math.max(0, 1 - Math.abs(d.u - sweep) * 7);

        // 4) Hover glow — brighten dots near the cursor (pixel distance).
        let hover = 0;
        if (px >= 0) {
          const hd = Math.hypot(d.x - px, d.y - py);
          hover = Math.max(0, 1 - hd / cfg.hoverRadius) * cfg.hoverBoost;
        }

        // Combine: noise sets the light/dark base; others add on top.
        let level = n + hot * 0.8 + sw * (cfg.pulseAlpha / (cfg.maxAlpha - cfg.minAlpha)) + hover;
        level = Math.max(0, Math.min(1, level));

        const alpha = cfg.minAlpha + level * (cfg.maxAlpha - cfg.minAlpha);
        const r = cfg.dotSize + level * cfg.sizeBoost;

        ctx.fillStyle = `rgba(${cfg.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // --- pointer events: hover glow follows the cursor ---
    canvas.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; });
    canvas.addEventListener("pointerleave", () => { px = -1; py = -1; });

    return { onResize, step, draw };
  });
})();
