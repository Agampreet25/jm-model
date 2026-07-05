/* ============================================================
   particles.js
   Animated particle network in the background canvas.
   Runs independently — no connection to the simulation.
   ============================================================ */

(function () {

  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles;

  /* ── Resize canvas to fill window ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Create a fresh set of particles ── */
  function initParticles() {
    particles = [];

    // More particles on larger screens (1 per ~14000px²)
    const count = Math.floor((W * H) / 14000);

    for (let i = 0; i < count; i++) {
      particles.push({
        x:     Math.random() * W,           // random start position
        y:     Math.random() * H,
        r:     Math.random() * 1.5 + 0.3,  // radius 0.3–1.8px
        vx:    (Math.random() - 0.5) * 0.18, // slow horizontal drift
        vy:    (Math.random() - 0.5) * 0.18, // slow vertical drift
        alpha: Math.random() * 0.4 + 0.05,  // opacity 0.05–0.45
        hue:   Math.random() < 0.6 ? '200' : '260' // cyan or purple
      });
    }
  }

  /* ── Draw one animation frame ── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 1. Draw and move each particle
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
      ctx.fill();

      // Move by velocity
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen edges (toroidal space)
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    });

    // 2. Draw faint connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          // Fade line opacity with distance
          const opacity = 0.06 * (1 - dist / 120);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${opacity})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    // Loop at ~60fps
    requestAnimationFrame(draw);
  }

  /* ── Init ── */
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  draw();

})();
