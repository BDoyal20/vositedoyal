document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
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

  // Demo players: exclusive playback and toggle text
  const players = Array.from(document.querySelectorAll('[data-demo]'));
  const audios = players.map(p => p.querySelector('audio'));

  function pauseAll(except) {
    audios.forEach(a => {
      if (a !== except) {
        a.pause();
        const container = a.closest('[data-demo]');
        const btn = container?.querySelector('.play');
        const live = container?.querySelector('[aria-live]');
        if (btn) {
          btn.textContent = '▶ Play';
          btn.setAttribute('aria-pressed', 'false');
        }
        if (live) live.textContent = '';
      }
    });
  }

  players.forEach(container => {
    const btn = container.querySelector('.play');
    const audio = container.querySelector('audio');
    const live = container.querySelector('[aria-live]');

    // Button click toggles play/pause
    btn?.addEventListener('click', () => {
      const src = btn.getAttribute('data-demo-src');
      if (!src) return;
      if (audio.getAttribute('src') !== src) audio.setAttribute('src', src);

      if (audio.paused) {
        pauseAll(audio);
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    // Reflect state changes in UI
    audio?.addEventListener('play', () => {
      pauseAll(audio);
      if (btn) {
        btn.textContent = '⏸ Pause';
        btn.setAttribute('aria-pressed', 'true');
      }
      if (live) live.textContent = 'Now playing';
    });

    audio?.addEventListener('pause', () => {
      if (btn) {
        btn.textContent = '▶ Play';
        btn.setAttribute('aria-pressed', 'false');
      }
      if (live) live.textContent = 'Paused';
    });

    audio?.addEventListener('ended', () => {
      if (btn) {
        btn.textContent = '▶ Play';
        btn.setAttribute('aria-pressed', 'false');
      }
      if (live) live.textContent = '';
    });
  });
});
