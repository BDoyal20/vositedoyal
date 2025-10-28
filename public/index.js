// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll for anchor links on the page
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

  // Quick play buttons for DemoPlayer components
  const demoButtons = document.querySelectorAll('[data-demo-src]');
  demoButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-demo-src');
      if (!src) return;
      const container = btn.closest('.demo-player');
      const audio = container ? container.querySelector('audio') : null;
      if (audio) {
        if (audio.getAttribute('src') !== src) audio.setAttribute('src', src);
        audio.play();
      } else {
        new Audio(src).play();
      }
    });
  });
});
