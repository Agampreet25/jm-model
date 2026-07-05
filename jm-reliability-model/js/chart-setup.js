/* ============================================================
   chart-setup.js  (FIXED — True Staircase Graph)

   The problem before: scatter type doesn't render lines properly
   for staircase shapes — it was only showing the dots.

   THE FIX:
   Use Chart.js type: 'line' with stepped: 'before' on each
   dataset. This is the CORRECT way to make a staircase in
   Chart.js — it natively handles the horizontal-then-vertical
   step shape without needing duplicate x-value tricks.

   stepped: 'before' means:
     - Draw a horizontal line at the OLD value
     - Then drop vertically to the NEW value
     - Exactly like the academic J-M staircase graph
   ============================================================ */

Chart.defaults.color       = '#7a8ba8';
Chart.defaults.font.family = "'DM Sans', sans-serif";

const chartCanvas = document.getElementById('reliabilityChart');
const chartCtx    = chartCanvas.getContext('2d');

/* ============================================================
   DATASETS
   We use type:'line' with stepped:'before' — this is the key.
   Each dataset gets ONE point per bug fix (clean, simple data).
   Chart.js draws the staircase shape automatically.
   ============================================================ */
const chartData = {
  labels: [],   // X-axis labels = time values [0, T1, T2, ...]

  datasets: [
    /* ── Dataset 0: Full theoretical staircase (grey dashed) ── */
    {
      label:           'Theoretical z(t)',
      data:            [],
      borderColor:     'rgba(255,255,255,0.2)',
      backgroundColor: 'transparent',
      borderWidth:     1.5,
      borderDash:      [6, 4],
      pointRadius:     0,
      pointHoverRadius:0,
      fill:            false,
      stepped:         'before',   // ← THIS makes the staircase
      tension:         0,
      order:           2
    },

    /* ── Dataset 1: User progress (cyan staircase) ── */
    {
      label:           'Your progress z(t)',
      data:            [],
      borderColor:     '#00d4ff',
      backgroundColor: 'rgba(0,212,255,0.07)',
      borderWidth:     2.5,
      pointRadius:     0,
      pointHoverRadius:0,
      fill:            true,
      stepped:         'before',   // ← THIS makes the staircase
      tension:         0,
      order:           1
    },

    /* ── Dataset 2: Dots at each bug fix moment ── */
    {
      label:           'Bug fix events',
      data:            [],
      borderColor:     '#00d4ff',
      backgroundColor: '#00d4ff',
      borderWidth:     2,
      pointRadius:     6,
      pointHoverRadius:9,
      pointBackgroundColor: '#00d4ff',
      pointBorderColor:     '#050810',
      pointBorderWidth:     2,
      showLine:        false,      // dots only — no line connecting them
      stepped:         false,
      tension:         0,
      order:           0
    }
  ]
};

/* ── Glow plugin ── */
Chart.register({
  id: 'glowLine',
  beforeDatasetsDraw(chart, args) {
    if (args.index === 0) return;
    chart.ctx.save();
    chart.ctx.shadowBlur  = 14;
    chart.ctx.shadowColor = 'rgba(0,212,255,0.5)';
  },
  afterDatasetsDraw(chart, args) {
    if (args.index === 0) return;
    chart.ctx.restore();
  }
});

/* ── Build the chart ── */
const reliabilityChart = new Chart(chartCtx, {
  type: 'line',   // line type + stepped:'before' = staircase

  data: chartData,

  options: {
    responsive:          true,
    maintainAspectRatio: false,

    animation: { duration: 300, easing: 'easeOutCubic' },

    interaction: { mode: 'index', intersect: false },

    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c1225',
        borderColor:     'rgba(0,212,255,0.25)',
        borderWidth:     1,
        titleColor:      '#00d4ff',
        bodyColor:       '#e8edf5',
        padding:         12,
        callbacks: {
          title: (items) => `Time  t = ${items[0].label}`,
          label: (item)  => {
            if (item.datasetIndex === 0) return `  Theory:  z(t) = ${parseFloat(item.raw).toFixed(4)}`;
            if (item.datasetIndex === 1) return `  Actual:  z(t) = ${parseFloat(item.raw).toFixed(4)}`;
            return null;
          }
        }
      }
    },

    scales: {
      x: {
        type:  'category',
        title: {
          display: true,
          text:    'Time  (t)',
          color:   '#7a8ba8',
          font:    { size: 11 },
          padding: { top: 8 }
        },
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#7a8ba8', font: { size: 10 }, maxTicksLimit: 15 }
      },

      y: {
        title: {
          display: true,
          text:    'Hazard Rate  z(t)',
          color:   '#7a8ba8',
          font:    { size: 11 },
          padding: { bottom: 8 }
        },
        min:   0,
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color:    '#7a8ba8',
          font:     { size: 10 },
          callback: v => v.toFixed(3)
        }
      }
    }
  }
});

/* ============================================================
   INTERNAL STATE
   ============================================================ */
let _N            = 20;
let _phi          = 0.01;
let _stepDuration = 2.5;   // time width of each step

/* ============================================================
   PUBLIC FUNCTIONS
   ============================================================ */

/**
 * rebuildTheoreticalCurve(N, phi)
 *
 * Builds the FULL theoretical staircase for all N steps.
 * One label + one data point per step.
 *
 * Labels = time values at each fix point
 * Data   = hazard rate AT that fix point
 *
 * Chart.js stepped:'before' draws:
 *   - horizontal line from previous time to this time (at old value)
 *   - vertical drop to new value at this time
 */
function rebuildTheoreticalCurve(N, phi) {
  _N   = N;
  _phi = phi;

  // Step duration: auto-scale so chart isn't too cramped
  _stepDuration = parseFloat((Math.max(1, Math.round(40 / N * 10) / 10)).toFixed(1));

  const labels  = [];
  const theoData = [];
  const userStart = [];

  // Build N+1 time points: t=0, t=step, t=2*step, ... t=N*step
  for (let i = 0; i <= N; i++) {
    const t = parseFloat((i * _stepDuration).toFixed(2));
    const z = phi * (N - i);   // J-M formula: z decreases by phi each step

    labels.push(t);
    theoData.push(z);
  }

  // User starts with just the first point (i=0, z=phi*N)
  userStart.push(phi * N);
  // Pad remaining with null so the line only goes as far as user has progressed
  for (let i = 1; i <= N; i++) {
    userStart.push(null);
  }

  chartData.labels              = labels;
  chartData.datasets[0].data    = theoData;   // full theoretical staircase
  chartData.datasets[1].data    = userStart;  // user progress (mostly null)
  chartData.datasets[2].data    = [];         // fix markers reset

  reliabilityChart.update('none');
}

/**
 * addUserPoint(bugsFix, lambda)
 *
 * Reveals one more step of the user staircase.
 *
 * bugsFix = how many bugs fixed after this action
 * lambda  = new hazard rate = phi * (N - bugsFix)
 *
 * We fill in the next null slot in dataset[1].data with the
 * actual value — the stepped line extends by one more step.
 * Also adds a dot marker at the fix point.
 */
function addUserPoint(bugsFix, lambda) {
  // Fill in the value at position bugsFix (previously null)
  chartData.datasets[1].data[bugsFix] = lambda;

  // Add a dot at the fix time (x = bugsFix * stepDuration, y = lambda)
  chartData.datasets[2].data.push({
    x: chartData.labels[bugsFix],   // time value
    y: lambda                        // new rate after fix
  });

  reliabilityChart.update();
}

/**
 * clearUserProgress()
 * Resets user line back to start. Theoretical line unchanged.
 */
function clearUserProgress() {
  const N = _N;
  const startRate = _phi * N;

  // Reset: only first point has a value, rest are null
  chartData.datasets[1].data = [startRate, ...Array(N).fill(null)];
  chartData.datasets[2].data = [];

  reliabilityChart.update('none');
}
