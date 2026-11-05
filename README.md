# Sachin — portfolio

A single-page, scroll-snapping "open book" personal site. Dark, minimal,
night-themed, with a faint binary-rain background and three spreads:

- **Experience** — a polished, continuously-flowing canvas hourglass.
- **DevOps & Platform Engineering** — a slowly spinning, shimmering 3D polyhedron (CSS 3D).
- **Artificial Intelligence** — a dots-only world map with drifting light/dark and a hover glow.

Top tabs (Home / Projects / Research) blend into the background.

## Files
- `index.html` — markup (tabs + the three spreads)
- `styles.css` — theme, scroll-snap book layout, shimmer polyhedron, tabs
- `script.js` — background flow, spread framework, hourglass, world map, tabs

Everything is vanilla HTML/CSS/JS with one optional Google Font. No build step.

## Run locally
Open `index.html` in a browser, or serve the folder (recommended, since it
loads external CSS/JS):

```bash
python3 -m http.server
# then visit http://localhost:8000
```

## Content
Edit the constants near the top of `script.js`:
- `SPREADS` — the right-page text for each spread.
- `FLOW` — the background binary rain.
- `HOURGLASS`, `WORLDMAP` — the Spread 1 / Spread 3 visuals.
Spread 2's shimmer polyhedron lives in `styles.css` (`.shimmer-stage`).
