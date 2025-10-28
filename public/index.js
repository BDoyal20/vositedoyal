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

  // Smooth scroll for on-page anchors
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

  // ===== Uniform Demo Player =====
  const players = Array.from(document.querySelectorAll('[data-demo]'));

  const fmt = (t) => {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  function pauseOthers(exceptAudio) {
    players.forEach(p => {
      const a = p.querySelector('audio');
      if (a && a !== exceptAudio) {
        a.pause();
        updateUI(p, 'paused');
      }
    });
  }

  function updateUI(container, state) {
    const btn = container.querySelector('[data-action="toggle"]');
    const time = container.querySelector('[data-time]');
    const audio = container.querySelector('audio');
    const seek = container.querySelector('.demo-seek');
    const bar = container.querySelector('[data-bar]');

    if (audio && seek && bar) {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      const cur = isFinite(audio.currentTime) ? audio.currentTime : 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      seek.value = String(pct);
      bar.style.width = `${pct}%`;
      if (time) time.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    }

    if (btn) {
      if (state === 'playing') {
        btn.textContent = '⏸';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Pause');
      } else {
        btn.textContent = '▶';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Play');
      }
    }
  }

  players.forEach(container => {
    const audio = container.querySelector('audio');
    const toggle = container.querySelector('[data-action="toggle"]');
    const stop = container.querySelector('[data-action="stop"]');
    const seek = container.querySelector('.demo-seek');
    const progress = container.querySelector('[data-progress]');
    const bar = container.querySelector('[data-bar]');

    if (!audio || !toggle || !seek || !progress || !bar) return;

    // Toggle play/pause
    toggle.addEventListener('click', () => {
      if (audio.paused) {
        pauseOthers(audio);
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    // Stop
    stop?.addEventListener('click', () => {
      audio.pause();
      audio.currentTime = 0;
      updateUI(container, 'paused');
    });

    // Range input seek
    seek.addEventListener('input', () => {
      if (!isFinite(audio.duration) || audio.duration === 0) return;
      const pct = Number(seek.value);
      audio.currentTime = (pct / 100) * audio.duration;
      updateUI(container, audio.paused ? 'paused' : 'playing');
    });

    // Click-to-seek on the bar
    function seekFromClientX(clientX) {
      const rect = progress.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      if (isFinite(audio.duration)) {
        audio.currentTime = pct * audio.duration;
        updateUI(container, audio.paused ? 'paused' : 'playing');
      }
    }

    progress.addEventListener('click', (e) => {
      seekFromClientX(e.clientX);
    });

    // Drag-to-seek with Pointer Events
    let dragging = false;

    function onPointerMove(e) {
      if (!dragging) return;
      seekFromClientX(e.clientX);
    }
    function onPointerUp() {
      dragging = false;
      progress.releasePointerCapture?.(activeId);
      activeId = null;
      document.body.style.userSelect = '';
    }

    let activeId = null;
    progress.addEventListener('pointerdown', (e) => {
      dragging = true;
      activeId = e.pointerId;
      progress.setPointerCapture?.(activeId);
      document.body.style.userSelect = 'none';
      seekFromClientX(e.clientX);
    });
    progress.addEventListener('pointermove', onPointerMove);
    progress.addEventListener('pointerup', onPointerUp);
    progress.addEventListener('pointercancel', onPointerUp);
    progress.addEventListener('lostpointercapture', onPointerUp);

    // Media events
    audio.addEventListener('loadedmetadata', () => updateUI(container, 'paused'));
    audio.addEventListener('timeupdate', () => updateUI(container, audio.paused ? 'paused' : 'playing'));
    audio.addEventListener('play', () => {
      pauseOthers(audio);
      updateUI(container, 'playing');
    });
    audio.addEventListener('pause', () => updateUI(container, 'paused'));
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      updateUI(container, 'paused');
    });
  });
});
