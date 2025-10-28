document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 64,
        behavior: 'smooth'
      });
    });
  });

  // ===== Demo Players =====
  const players = Array.from(document.querySelectorAll('[data-demo]'));

  const fmt = (t) => {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  function pauseOthers(except) {
    players.forEach((p) => {
      const a = p.querySelector('audio');
      if (a && a !== except) {
        a.pause();
        updateUI(p, 'paused');
      }
    });
  }

  function updateUI(container, state) {
    if (container.dataset.dragging === 'true') return; // skip updates during drag
    const btn = container.querySelector('[data-action="toggle"]');
    const time = container.querySelector('[data-time]');
    const audio = container.querySelector('audio');
    const seek = container.querySelector('.demo-seek');
    const bar = container.querySelector('[data-bar]');
    const thumb = container.querySelector('[data-thumb]');

    if (audio && seek && bar && thumb) {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      const cur = isFinite(audio.currentTime) ? audio.currentTime : 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      seek.value = String(pct);
      bar.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      if (time) time.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    }

    if (btn) {
      if (state === 'playing') {
        btn.textContent = '⏸';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.textContent = '▶';
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  players.forEach((container) => {
    const audio = container.querySelector('audio');
    const toggle = container.querySelector('[data-action="toggle"]');
    const stop = container.querySelector('[data-action="stop"]');
    const progress = container.querySelector('[data-progress]');
    const bar = container.querySelector('[data-bar]');
    const thumb = container.querySelector('[data-thumb]');
    const seek = container.querySelector('.demo-seek');

    if (!audio || !toggle || !progress || !bar || !thumb) return;

    // Toggle play/pause
    toggle.addEventListener('click', () => {
      if (audio.paused) {
        pauseOthers(audio);
        audio.play().catch(() => {});
      } else audio.pause();
    });

    // Stop button
    stop?.addEventListener('click', ()
