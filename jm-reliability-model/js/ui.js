/* ============================================================
   ui.js  (UPDATED)
   DOM wiring + event listeners + scroll observer + hero bugs
   NEW: theme toggle (Feature 5), solution toggle (Feature 4)
   ============================================================ */

/* ── DOM REFERENCES ── */
const elStatN           = document.getElementById('stat-N');
const elStatI           = document.getElementById('stat-i');
const elStatRem         = document.getElementById('stat-rem');
const elStatLambda      = document.getElementById('stat-lambda');
const elStatImprovement = document.getElementById('stat-improvement');
const elProgressBar     = document.getElementById('fix-progress-bar');
const elRelIndicator    = document.getElementById('rel-indicator');
const elRelLabel        = document.getElementById('rel-label');
const elRelSub          = document.getElementById('rel-sub');
const elSliderN         = document.getElementById('slider-N');
const elSliderPhi       = document.getElementById('slider-phi');
const elLblN            = document.getElementById('lbl-N');
const elLblPhi          = document.getElementById('lbl-phi');
const elBtnFix          = document.getElementById('btn-fix');
const elBtnReset        = document.getElementById('btn-reset');
const elBtnAuto         = document.getElementById('btn-auto');
const elThemeToggle     = document.getElementById('theme-toggle');

/* ============================================================
   refreshUI() — called after every state change
   ============================================================ */
function refreshUI() {
  const n          = getN();
  const i          = getBugsFix();
  const remaining  = getRemaining();
  const lambda     = getLambda();
  const initLambda = getInitLambda();

  elStatN.textContent      = n;
  elStatI.textContent      = i;
  elStatRem.textContent    = remaining;
  elStatLambda.textContent = lambda.toFixed(5);

  if (i > 0 && initLambda > 0) {
    const pct = (((initLambda - lambda) / initLambda) * 100).toFixed(1);
    elStatImprovement.textContent = pct + '%';
  } else {
    elStatImprovement.textContent = '—';
  }

  const progressPct = n > 0 ? (i / n) * 100 : 0;
  elProgressBar.style.width = progressPct + '%';

  updateReliabilityIndicator(getReliabilityStatus());
  elBtnFix.disabled = (i >= n);
}

/* ── Reliability indicator ── */
const reliabilityText = {
  unstable:  { label: 'Unstable',  sub: 'High failure rate — fix more bugs' },
  improving: { label: 'Improving', sub: 'Reliability is increasing steadily' },
  stable:    { label: 'Stable',    sub: 'Low failure rate — system is reliable' }
};

function updateReliabilityIndicator(status) {
  elRelIndicator.className = `reliability-indicator rel-${status}`;
  elRelLabel.textContent   = reliabilityText[status].label;
  elRelSub.textContent     = reliabilityText[status].sub;
}

/* ── Auto button state ── */
function setAutoButtonState(running) {
  elBtnAuto.textContent = running ? 'Pause' : 'Auto Run';
  elBtnAuto.classList.toggle('running', running);
}

/* ============================================================
   SIMULATION EVENT LISTENERS
   ============================================================ */
elBtnFix.addEventListener('click',  () => fixOneBug());
elBtnReset.addEventListener('click', () => resetSimulation());

elBtnAuto.addEventListener('click', () => {
  if (isAutoRunning()) { stopAutoRun(); }
  else { setAutoButtonState(true); startAutoRun(); }
});

elSliderN.addEventListener('input', () => {
  const v = parseInt(elSliderN.value);
  elLblN.textContent = v;
  setN(v);
});

elSliderPhi.addEventListener('input', () => {
  const v = parseInt(elSliderPhi.value) / 1000;
  elLblPhi.textContent = v.toFixed(3);
  setPhi(v);
});

/* ============================================================
   FEATURE 5 — THEME TOGGLE (Light / Dark Mode)
   Toggles the data-theme attribute on <html>.
   CSS in components.css handles all style changes.
   ============================================================ */
let isDark = true;

elThemeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  elThemeToggle.textContent = isDark ? 'Dark' : 'Light';

  // Update chart colors for light mode
  updateChartTheme(isDark);
});

function updateChartTheme(dark) {
  if (typeof reliabilityChart === 'undefined') return;

  const gridColor  = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const tickColor  = dark ? '#7a8ba8'                : '#4a5878';
  const lineColor  = dark ? '#00d4ff'                : '#007acc';
  const fillColor  = dark ? 'rgba(0,212,255,0.07)'   : 'rgba(0,122,204,0.07)';
  const theoColor  = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';

  reliabilityChart.data.datasets[0].borderColor    = theoColor;
  reliabilityChart.data.datasets[1].borderColor    = lineColor;
  reliabilityChart.data.datasets[1].backgroundColor = fillColor;
  reliabilityChart.data.datasets[2].borderColor    = lineColor;
  reliabilityChart.data.datasets[2].backgroundColor = lineColor;
  reliabilityChart.data.datasets[2].pointBackgroundColor = lineColor;

  reliabilityChart.options.scales.x.grid.color   = gridColor;
  reliabilityChart.options.scales.y.grid.color   = gridColor;
  reliabilityChart.options.scales.x.ticks.color  = tickColor;
  reliabilityChart.options.scales.y.ticks.color  = tickColor;
  reliabilityChart.options.scales.x.title.color  = tickColor;
  reliabilityChart.options.scales.y.title.color  = tickColor;

  reliabilityChart.update('none');
}

/* ============================================================
   FEATURE 4 — SOLUTION TOGGLE
   Toggles visibility of solution blocks inside the modal.
   Called from inline onclick in HTML.
   ============================================================ */
function toggleSolution(id) {
  const block  = document.getElementById(id);
  const btn    = block.previousElementSibling;
  const isOpen = block.classList.contains('visible');
  block.classList.toggle('visible', !isOpen);
  btn.textContent = isOpen ? '▶ Show Solution' : '▼ Hide Solution';
}

/* ============================================================
   CLOSE MODALS ON OVERLAY CLICK
   ============================================================ */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* Close modals on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open')
      .forEach(m => m.classList.remove('open'));
  }
});

/* ============================================================
   HERO BUG STRIP ANIMATION
   ============================================================ */
(function initHeroBugStrip() {
  const strip     = document.getElementById('hero-bugs');
  const DOT_COUNT = 16;
  const dots      = [];
  const label     = strip.querySelector('.bug-strip-label');

  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'bug-dot';
    dot.style.animationDelay = (i * 0.15) + 's';
    strip.insertBefore(dot, label);
    dots.push(dot);
  }

  let fixedCount = 0;
  setInterval(() => {
    if (fixedCount < DOT_COUNT) {
      dots[fixedCount].classList.add('fixed');
      fixedCount++;
    } else {
      dots.forEach(d => d.classList.remove('fixed'));
      fixedCount = 0;
    }
  }, 700);
})();

/* ============================================================
   SCROLL FADE-IN
   ============================================================ */
const scrollObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }),
  { threshold: 0.08 }
);
document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));

/* ── INIT ── */
resetSimulation();
