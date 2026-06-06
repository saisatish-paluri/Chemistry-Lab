# ChemLab — Virtual Chemistry Laboratory

A browser-based virtual chemistry lab for Class 6–12 students. Fifteen interactive experiments with live simulations, curriculum-aligned assessments, and a full 118-element periodic table.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4, custom design system (`globals.css`) |
| Animation | Framer Motion 12 |
| State | Zustand 5 (with `persist` middleware) |
| Testing | Vitest |
| Fonts | Geist Sans / Geist Mono (via `next/font`) |

## Experiments (15 total)

| Experiment | Class | Difficulty |
|---|---|---|
| Density & Floating/Sinking | 6–7 | Beginner |
| Filtration Basics | 6–7 | Beginner |
| Dissolving Rate | 6–7 | Beginner |
| Indicator Test | 7–8 | Beginner |
| Acid-Base Titration | 9–11 | Beginner |
| Flame Test | 9–11 | Beginner |
| Gas Collection | 9–10 | Beginner |
| Electrolysis | 10–12 | Intermediate |
| Solubility & Precipitation | 10–11 | Intermediate |
| Redox Displacement | 9–11 | Intermediate |
| Separation Techniques | 9–11 | Intermediate |
| Reaction Kinetics | 11–12 | Advanced |
| Gas Laws | 11–12 | Advanced |
| Chemical Equilibrium | 11–12 | Advanced |
| Calorimetry | 11–12 | Advanced |

## Install

```bash
npm install
```

Node.js 18+ required.

## Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **LAN access:** if testing on a local network, the allowed dev origin is configured in `next.config.ts`.

## Test

```bash
npm test
```

Uses Vitest. Test files live in `src/__tests__/`.

## Lint

```bash
npm run lint
```

ESLint with the Next.js plugin. Zero warnings policy enforced.

## Build

```bash
npm run build
```

Produces an optimised production build in `.next/`.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Full design system + lab layout CSS
│   ├── page.tsx             # Homepage (Hero → FeatureStrip → PeriodicTable → SectionCards)
│   └── experiments/
│       ├── layout.tsx       # Lab header (breadcrumb, jumper, accent bar)
│       ├── page.tsx         # Experiments index page
│       └── [slug]/          # One route per experiment
│
├── components/
│   ├── lab/                 # Shared lab shell components
│   │   ├── LabPageShell.tsx # 3-panel layout (left | center workspace | right controls)
│   │   ├── StatusBar.tsx    # Live metric chips
│   │   ├── ObservationPanel.tsx
│   │   └── ...
│   └── experiments/         # Per-experiment UI components
│       ├── titration/
│       ├── flame-test/
│       └── ...
│
├── lib/
│   ├── experiments-catalog.ts  # Single source of truth for all 15 experiment entries
│   ├── experiment-education.ts # Education panel content per experiment
│   ├── mcq-data.ts             # Post-lab MCQ questions
│   ├── engine/                 # Pure-function simulation engines (no side effects)
│   │   ├── titration-engine.ts
│   │   ├── gas-laws-engine.ts
│   │   └── ...
│   └── store/                  # Zustand stores (wire engines to persistence)
│       ├── active-lab-store.ts # Global active-lab accent/title
│       ├── titration-store.ts
│       └── ...
│
└── __tests__/               # Vitest test suites (engine + validation + catalog)
```

## Experiment System

Each experiment follows the same architecture:

1. **Engine** (`src/lib/engine/<slug>-engine.ts`) — pure functions, no React, no side effects. Takes state + action → returns new state.
2. **Store** (`src/lib/store/<slug>-store.ts`) — Zustand store that calls the engine and persists to `localStorage`.
3. **Workspace** (`.../experiments/<slug>/<Slug>Workspace.tsx`) — SVG or div-based canvas showing the live simulation. Receives state as props.
4. **Page** (`.../experiments/<slug>/<Slug>Page.tsx`) — assembles `<LabPageShell>` with workspace, controls, status bar, and observations.
5. **Route** (`src/app/experiments/<slug>/page.tsx`) — Next.js page that renders the `<Page>` component.

### Catalog

`src/lib/experiments-catalog.ts` is the single source of truth. It exports:

- `CATALOG` (default) — array of `ExperimentEntry`
- `EXPERIMENT_LABEL_MAP` — `{ href → title }` (used by the layout header and jumper)
- `EXPERIMENT_ACCENT_MAP` — `{ href → accent colour }`
- `EXPERIMENT_SUBJECT_MAP` — `{ href → subject string }`

The dashboard, experiments index, and layout header all derive their data from this catalog. Adding a new experiment requires: engine → store → workspace → page → route → append entry to `CATALOG`.

### Lab Shell Layout

`<LabPageShell>` provides the 3-panel layout used by every experiment:

```
┌──────────────┬─────────────────────────┬──────────────┐
│ Left panel   │   Center: workspace     │  Right panel │
│ (≥1920 px)   │   + reaction note       │  Controls    │
│              │                         │  Guide       │
│              ├─────────────────────────┤  Info        │
│              │   centerBottom (graph)  ├──────────────┤
│              │   (side-by-side ≥1024)  │ Observations │
└──────────────┴─────────────────────────┴──────────────┘
```

CSS classes: `.lab-left-panel`, `.lab-center-col`, `.lab-center-main`, `.lab-ws-area`, `.lab-center-bottom`, `.lab-right-panel`, `.lab-obs-panel` — all defined in `globals.css`.
