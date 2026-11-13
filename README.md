# Sachin — portfolio

A single-page personal site with a dark, minimal, night theme and a faint
binary-rain background. Five tabs, each a "view":

- **Home** — a word-by-word hero ("All aboard the compute evolution.") above a
  pure-CSS steam train riding a timeline of computing eras (Mainframe → Personal →
  Internet → Cloud → AI). When the train reaches an era, a small CSS artwork pops
  up and the background rain switches glyphs.
- **About** — a big headline, a photo, drifting CSS birds, and a pure-CSS **Lego
  robot**: a platform plate drops in, bricks fall onto it and assemble a robot
  (the AI), its eyes open and glow, it blinks, then the scene fades and replays.
- **Services** — a scroll-snap "book" of two spreads: **Artificial Intelligence**
  (a monochrome 3D neural "brain" point cloud on a canvas, with a hover glow) and
  **PostgreSQL** (a pure-CSS elephant that breathes, flaps an ear, lifts its trunk to trumpet every 10 s, swings its
  trunk, swishes its tail and blinks).
- **Projects** — one full-screen spread per project (pixel art or a 3D CSS pencil
  on the left; name, status, tagline, summary, tags and links on the right).
- **Research** — one spread per research topic (3D CSS error codes on the left;
  abstract, angle, tags and links on the right).

## Files
- `index.html` — markup: tabs, the five views, Home train, About headline/photo/birds
  and the Lego stage mount point.
- `styles.css` — theme, tabs, book/spread layout, Home train, About, Lego robot,
  project/research art, reveal animations.
- `script.js` — all content constants, tab routing, project/research rendering,
  background rain, Home train/era logic, the neural brain, and the Lego robot.

Everything is vanilla HTML/CSS/JS with one optional Google Font (Poppins). No
build step.

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
# then visit http://localhost:8000
```

Tabs are hash-routed (`#about`, `#services`, `#projects`, `#research`; Home is
`#` or empty), so a view can be linked to directly.

## Editing content
Most content lives in constants near the top of `script.js`:

- `PROJECTS` — Projects tab. Each entry: `name`, `status`, `tagline`, `summary`,
  `tags`, `links` (`{ label, href }`; omit `href` for a disabled placeholder), and
  either `art` (a character grid for pixel art — see the comment above the array
  for the tone letters) or `artKind: "pencil"`.
- `RESEARCH` — Research tab. Each entry: `title`, `status`, `art` (list of error
  codes shown in 3D), `abstract`, `angle`, `tags`, `links`.
- `SPREADS` — right-page text for the Services spreads, keyed by section id.
  The elephant is the `.el*` rules in `styles.css` (markup in `#spread-postgres`).
- `FLOW` — the background binary rain.
- `BRAIN` — the Services neural-brain visual.

Elsewhere:

- **About headline** — the words in `.about-intro__line` in `index.html` (each word
  is a `<span class="word" style="--i:N">`; keep `--i` incrementing for the reveal).
- **Home hero and era milestones** — `index.html` (`.home-hero`, `.eras`).
- **Lego robot** — the `MAP` array in `legoRobot()` in `script.js`. Each row is a
  string, all the same length; the platform and stage size themselves from it.
  Legend: `h` head, `#` torso, `l` limbs, `a` antenna, `E` eye, `C` chest light,
  `.` empty. Colours are the `.lego--*` rules in `styles.css`; timings are
  `PLATE_DELAY`/`ROBOT_START` in the script and the `legoDrop`, `legoLid` and
  `legoCycle` keyframes in the CSS.

## Notes
- Projects and Research spreads are rendered the first time their tab is opened.
  `observeSpreads()` watches for newly added spreads so their text reveals
  correctly (without a page refresh).
- All animation respects `prefers-reduced-motion`.
- `styles.css?v=N` / `script.js?v=N` in `index.html` are manual cache-busters;
  bump them when you deploy changes.
