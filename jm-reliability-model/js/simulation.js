/* ============================================================
   simulation.js  (UPDATED)

   Core Jelinski–Moranda model logic.

   State:     N, phi, bugsFix
   Formula:   z(t) = λ(i) = φ × (N − i)
   Chart:     staircase over time — rebuildTheoreticalCurve
              and addUserPoint live in chart-setup.js

   This file owns state and computation only.
   DOM updates → ui.js
   Chart drawing → chart-setup.js
   ============================================================ */

/* ── STATE ── */
let N         = 20;     // Total initial bugs
let phi       = 0.01;   // Per-bug hazard rate (φ)
let bugsFix   = 0;      // Bugs fixed so far (i)
let autoTimer = null;   // setInterval reference for auto-run
let initZ     = null;   // z(t) at i=0, used for % improvement stat

/* ============================================================
   THE J–M FORMULA
   z(t) between fix i-1 and fix i:
     z_i = φ × (N − i)
   ============================================================ */
function computeLambda(remainingBugs) {
  return phi * remainingBugs;
}

/* ============================================================
   FIX ONE BUG
   ============================================================ */
function fixOneBug() {
  if (bugsFix >= N) return;

  bugsFix++;

  const remaining = N - bugsFix;
  const zNew      = computeLambda(remaining);

  // Tell chart to add the next step-down
  addUserPoint(bugsFix, zNew);

  // Refresh on-screen stats
  refreshUI();
}

/* ============================================================
   RESET
   ============================================================ */
function resetSimulation() {
  bugsFix = 0;
  initZ   = computeLambda(N);   // starting hazard rate

  // Rebuild theoretical staircase and reset user line
  rebuildTheoreticalCurve(N, phi);

  refreshUI();
  stopAutoRun();
}

/* ============================================================
   AUTO RUN
   ============================================================ */
function startAutoRun() {
  if (bugsFix >= N) resetSimulation();

  autoTimer = setInterval(() => {
    if (bugsFix >= N) {
      stopAutoRun();
    } else {
      fixOneBug();
    }
  }, 600);  // 600ms per step — slightly slower so staircase is visible
}

function stopAutoRun() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    setAutoButtonState(false);
  }
}

/* ── GETTERS (read by ui.js) ── */
function getN()           { return N; }
function getPhi()         { return phi; }
function getBugsFix()     { return bugsFix; }
function getRemaining()   { return N - bugsFix; }
function getLambda()      { return computeLambda(N - bugsFix); }
function getInitLambda()  { return initZ; }
function isAutoRunning()  { return autoTimer !== null; }

/* ── SETTERS (called by sliders in ui.js) ── */
function setN(value) {
  N = value;
  resetSimulation();
}

function setPhi(value) {
  phi   = value;
  initZ = computeLambda(N);
  resetSimulation();
}

/* ============================================================
   RELIABILITY STATUS
   Based on fraction of bugs remaining
   ============================================================ */
function getReliabilityStatus() {
  const ratio = getRemaining() / N;
  if (ratio > 0.60) return 'unstable';
  if (ratio > 0.25) return 'improving';
  return 'stable';
}

/* ── INIT ── */
initZ = computeLambda(N);
