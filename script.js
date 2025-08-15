document.getElementById('year').textContent = new Date().getFullYear();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
(() => {
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!els.length || reduceMotion) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();
(() => {
  if (reduceMotion) return;
  const cards = document.querySelectorAll('[data-tilt]');
  const max = 10;
  cards.forEach(card => {
    function onMove(e){
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-y) * max;
      const ry = x * max;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    }
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#' || id === '#0') return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
(() => {
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;
  const page = document.getElementById('page');
  const rootScroll = document.scrollingElement || document.documentElement;
  let stretch = 0;
  const MAX = 0.045;
  const DECAY = 0.82;
  const WHEEL_K = 0.00085;
  const TOUCH_K = 0.0022;
  let rafId = 0;
  let touching = false;
  let startY = 0;
  const atTop = () => rootScroll.scrollTop <= 0;
  const atBottom = () => Math.ceil(rootScroll.scrollTop + window.innerHeight) >= rootScroll.scrollHeight;
  const apply = () => {
    page.style.setProperty('--stretch-y', String(1 + stretch));
    page.classList.add('is-stretching');
  };
  const clearStretch = () => {
    page.style.removeProperty('--stretch-y');
    page.classList.remove('is-stretching');
  };
  const release = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function animate(){
      stretch *= DECAY;
      if (stretch <= 0.001) {
        stretch = 0;
        clearStretch();
        return;
      }
      apply();
      rafId = requestAnimationFrame(animate);
    });
  };
  window.addEventListener('wheel', (e) => {
    const dy = e.deltaY;
    if ((dy < 0 && atTop()) || (dy > 0 && atBottom())) {
      e.preventDefault();
      page.style.setProperty('--stretch-origin', dy < 0 ? '0%' : '100%');
      stretch = Math.min(MAX, stretch + Math.abs(dy) * WHEEL_K);
      apply();
      cancelAnimationFrame(rafId);
    } else if (stretch > 0) {
      release();
    }
  }, { passive: false });
  window.addEventListener('touchstart', (e) => { touching = true; startY = e.touches[0].clientY; cancelAnimationFrame(rafId); }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!touching) return;
    const y = e.touches[0].clientY;
    const dy = startY - y;
    if ((dy < 0 && atTop()) || (dy > 0 && atBottom())) {
      e.preventDefault();
      page.style.setProperty('--stretch-origin', dy < 0 ? '0%' : '100%');
      stretch = Math.min(MAX, Math.abs(dy) * TOUCH_K);
      apply();
    }
  }, { passive: false });
  window.addEventListener('touchend', () => { touching = false; if (stretch > 0) release(); }, { passive: true });
  window.addEventListener('scroll', () => { if (stretch > 0 && !atTop() && !atBottom()) release(); }, { passive: true });
})();
(function () {
  const nav = document.querySelector('.nav');
  const spacer = document.getElementById('nav-spacer');
  if (!nav || !spacer) return;
  function sizeNavSpace() {
    const cs = getComputedStyle(nav);
    const top = parseFloat(cs.top) || 0;
    spacer.style.height = (nav.offsetHeight + top) + 'px';
  }
  window.addEventListener('load', sizeNavSpace, { once: true });
  window.addEventListener('resize', sizeNavSpace);
  document.fonts && document.fonts.ready && document.fonts.ready.then(sizeNavSpace);
})();
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const full = intro.getAttribute('data-text') || intro.textContent.trim();
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) { intro.textContent = full; return; }
  let i = 0;
  const speed = 28;
  function tick() {
    i++;
    intro.textContent = full.slice(0, i);
    if (i < full.length) {
      setTimeout(tick, speed);
    } else {
      intro.classList.remove('typing');
    }
  }
  window.addEventListener('load', () => { setTimeout(tick, 420); }, { once: true });
})();
