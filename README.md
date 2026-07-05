# Jelinski–Moranda Software Reliability Model
### An Interactive Educational Visualization

> A browser-based interactive tool that visually teaches the Jelinski–Moranda (1972) software reliability model — one of the earliest and most foundational models in software engineering.

**Author:** Agampreet Saini  
**Institution:** University of Petroleum and Energy Studies (UPES), Dehradun, India  
**Program:** B.Tech. Computer Science  

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [The Model — Theory](#the-model--theory)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Use the Simulation](#how-to-use-the-simulation)
- [Screenshots](#screenshots)
- [Academic Context](#academic-context)
- [Limitations of the Model](#limitations-of-the-model)
- [License](#license)

---

## Overview

This project is a fully client-side, zero-dependency web application that explains and simulates the **Jelinski–Moranda (J–M) Software Reliability Growth Model**. It was built as an academic visualization tool to help students understand how software reliability evolves as bugs are detected and removed during testing.

The core insight of the J–M model is elegant: **each bug fix permanently reduces the failure rate of a software system.** This tool makes that abstraction visual, interactive, and mathematically grounded.

---

## Live Demo

Open `index.html` directly in any modern browser — no server, no build step, no installation required.

```
git clone https://github.com/your-username/jm-reliability-model.git
cd jm-reliability-model
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or use **VS Code Live Server** for hot-reload during development.

> **Internet required** only for Google Fonts (Playfair Display + Nunito Sans) and Chart.js CDN. All logic runs locally.

---

## Features

### Core Sections
- **Hero** — Author introduction with photo, project title, and live animated bug-fix strip
- **Theory** — Deep mathematical treatment of the model from first principles
- **Simulation** — Live interactive simulation with real-time chart
- **Model Comparison** — Side-by-side table against 4 competing reliability models
- **Insights** — Interpretation of the graph and what each property means
- **Limitations** — Honest critical analysis of where the model breaks down

### Interactive Simulation
- **Fix a Bug button** — Steps through the model one failure interval at a time
- **Auto Run / Pause** — Automatically advances the simulation at 600ms intervals
- **Reset** — Clears progress and rebuilds the chart
- **N slider** — Adjust total bug count (5 to 100)
- **φ (phi) slider** — Adjust per-bug hazard rate constant (0.001 to 0.050)
- **Live stats panel** — Shows N, bugs fixed, remaining bugs, current hazard rate, and % reliability improvement in real time
- **Progress bar** — Visual indicator of how far through the fix cycle you are

### Chart Visualization
- **Staircase graph** — Hazard Rate z(t) vs. Time — the academically correct representation of the J–M model
- **Two datasets** — Grey dashed theoretical curve (full model) + cyan solid user progress curve
- **Bug fix markers** — Cyan dots at each fix event with hover tooltips
- **Smooth animations** — Each step animates in at 300ms
- **Glowing line effect** — Custom Chart.js plugin for the cyan glow

### Reliability Status Indicator
| Status | Condition | Colour |
|---|---|---|
| Unstable | > 60% bugs remaining | Red |
| Improving | 25–60% bugs remaining | Yellow |
| Stable | < 25% bugs remaining | Green |

### Modals
- **Mathematical Derivation** — 5-step derivation from exponential distribution to MLE estimates
- **Practice Problems** — 2 fully worked numerical problems with show/hide solution toggle

### UI / UX
- **Light / Dark mode** toggle — full theme switch including chart color updates
- **Scroll-triggered fade-in** animations via IntersectionObserver
- **Sticky author card** — stays in view as you scroll the hero section
- **Animated particle background** — canvas-based floating particle network
- **Responsive layout** — works on desktop and mobile

---

## The Model — Theory

### What is Software Reliability?
Software reliability R(t) is the probability that a software system executes without failure during a specified time interval, given a defined operational environment.

### The J–M Formula

```
z(t) = φ · (N − i)
```

| Symbol | Meaning |
|---|---|
| `z(t)` | Hazard rate — failures per unit time in the ith interval |
| `φ` | Per-fault failure rate constant (estimated from data) |
| `N` | Total initial fault count (unknown, estimated via MLE) |
| `i` | Number of faults removed so far |
| `N − i` | Remaining faults |

### The Reliability Function (per interval)

```
R_i(t) = e^(−φ(N−i+1)·t)
```

The probability of surviving to time t in the ith inter-failure interval.

### MLE Estimate of φ

```
φ̂ = n / Σᵢ (N − i + 1) · xᵢ
```

Where `xᵢ` are the observed inter-failure times and `n` is the number of observed failures.

### Key Assumptions
1. The software starts with a **fixed, finite number N** of faults
2. Each fault is **perfectly removed** when detected — no new faults introduced
3. **All faults contribute equally** to the failure rate (homogeneity)
4. Inter-failure times follow an **exponential distribution** (memoryless)

---

## Project Structure

```
jm-reliability-model/
│
├── index.html              # All HTML structure and content
├── agam.jpg                # Author photo (referenced in index.html)
│
├── css/
│   ├── base.css            # CSS variables, typography, reset, fonts
│   ├── layout.css          # Navigation, sections, hero, footer, grid
│   ├── components.css      # Cards, modals, table, author card, animations
│   └── simulation.css      # Control panel, sliders, buttons, chart panel
│
└── js/
    ├── particles.js        # Animated canvas particle background
    ├── chart-setup.js      # Chart.js setup, staircase datasets, public API
    ├── simulation.js       # J–M model logic, state, formula, getters/setters
    └── ui.js               # DOM wiring, event listeners, theme toggle, observers
```

### Separation of Concerns

| File | Responsibility |
|---|---|
| `simulation.js` | Owns model state (N, phi, i) and all calculations. No DOM access. |
| `ui.js` | Reads state via getters, pushes to DOM. Owns all event listeners. |
| `chart-setup.js` | Owns Chart.js instance. Exposes `rebuildTheoreticalCurve()`, `addUserPoint()`, `clearUserProgress()`. |
| `particles.js` | Self-contained canvas animation. No connection to simulation. |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| HTML5 | — | Structure and content |
| CSS3 | — | Dark theme, grid layout, animations |
| Vanilla JavaScript | ES6+ | All simulation logic and DOM manipulation |
| Chart.js | 4.4.1 | Staircase graph rendering |
| Playfair Display | Google Fonts | Display / heading typeface |
| Nunito Sans | Google Fonts | Body text typeface |

**No frameworks. No build tools. No package manager.**  
One `index.html`, four CSS files, four JS files, one image.

---

## Getting Started

### Option 1 — Direct Open (simplest)
1. Download or clone this repository
2. Double-click `index.html`
3. It opens in your default browser

### Option 2 — VS Code Live Server (recommended for development)
1. Open the project folder in VS Code
2. Install the **Live Server** extension by Ritwick Dey
3. Right-click `index.html` → **Open with Live Server**
4. Opens at `http://127.0.0.1:5500` with auto-refresh on save

### Option 3 — Any local HTTP server
```bash
# Python 3
python -m http.server 5500

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:5500`

---

## How to Use the Simulation

1. **Set parameters** using the sliders on the left panel
   - **N** — how many bugs the software starts with
   - **φ** — how dangerous each individual bug is

2. **Click "Fix a Bug"** to fix one bug at a time
   - The cyan staircase on the chart extends by one step
   - The hazard rate drops instantly
   - All stats update in real time

3. **Watch the graph** — compare your progress (cyan) against the full theoretical curve (grey dashed)

4. **Click "Auto Run"** to let the simulation run automatically
   - Click "Pause" to stop at any point
   - Click "Reset" to start over

5. **Open the modals** using the buttons in the hero section
   - "View Derivation" — step through the 5-step mathematical derivation
   - "Practice Problems" — two worked exam-style numerical problems

6. **Toggle theme** using the Dark / Light button in the top-right of the navigation bar

---

## Screenshots

> The hero section showing the author card alongside the project title

> The staircase graph — grey dashed theoretical model, cyan user progress, dots at each fix event

> The Mathematical Derivation modal showing all 5 steps

> Light mode — full theme switch including chart colors

---

## Academic Context

The Jelinski–Moranda model was first published in:

> Jelinski, Z. and Moranda, P. (1972). *Software Reliability Research.* In W. Freiberger (Ed.), Statistical Computer Performance Evaluation (pp. 465–484). Academic Press.

It is one of the **earliest formal software reliability growth models (SRGMs)** and is classified as an **exponential class, time-between-failures model**. Despite being over 50 years old, it remains the standard introductory model in software reliability courses due to its mathematical simplicity and intuitive structure.

### Comparison with Other Models

| Model | Year | Fault Count | Repair Type |
|---|---|---|---|
| Jelinski–Moranda | 1972 | Fixed N | Perfect |
| Littlewood–Verrall | 1973 | Fixed N | Imperfect |
| Musa Basic | 1975 | Fixed N | Perfect |
| Goel–Okumoto | 1979 | Infinite (NHPP) | Perfect |
| Musa–Okumoto | 1984 | Infinite (NHPP) | Perfect |

---

## Limitations of the Model

The J–M model makes several idealizing assumptions that limit its applicability to real-world systems:

- **Perfect repair** — In practice, up to 15–20% of bug fixes introduce new faults
- **Equal fault severity** — Not all bugs are equally dangerous; this model treats them identically
- **Fixed N** — Modern CI/CD systems ship new code continuously, making N a moving target
- **Exponential inter-failure times** — Real systems often exhibit non-exponential failure patterns
- **No operational profile** — The model ignores workload, concurrency, and environment
- **AI/ML systems** — Failures from distributional shift or adversarial inputs have no countable N

---

## License

This project is submitted as an academic coursework visualization.  
Feel free to use, adapt, or reference with appropriate attribution.

```
Agampreet Saini
B.Tech. Computer Science
University of Petroleum and Energy Studies (UPES)
Dehradun, India
```

---

*Built with HTML, CSS, and JavaScript. No frameworks. No build step. Just open and run.*
