/* Saltanat Atelier — thread colour picker, pull-the-hem tool */
(() => {
  'use strict';
  const M = window.Motion || { $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => Array.from(r.querySelectorAll(s)), motion: false, fine: false, reduce: true, ready: (f) => f(), toast() {} };
  const { $, $$ } = M;
  const root = document.documentElement;

  /* Thread colours re-tint the whole page */
  const spools = $$('.spool');
  const book = $('#book');
  let saved = '';
  try { saved = localStorage.getItem('sa-thread') || ''; } catch (e) { /* ignore */ }
  const pick = (s, remember) => {
    spools.forEach((x) => { const on = x === s; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
    root.style.setProperty('--accent', s.dataset.c);
    root.style.setProperty('--accent-ink', s.dataset.i);
    if (book) book.dataset.bg = s.dataset.c;
    if (book) book.dataset.fg = s.dataset.i;
    const meta = $('meta[name=theme-color]');
    if (remember) { try { localStorage.setItem('sa-thread', s.dataset.c); } catch (e) { /* ignore */ } }
  };
  spools.forEach((s) => s.addEventListener('click', () => pick(s, true)));
  const init = spools.find((s) => s.dataset.c === saved);
  if (init) pick(init, false);

  /* Hem tool */
  const svg = $('#pants');
  if (svg) {
    const line = $('#hem-line'), handle = $('#hem-handle'), cut = $('#cut-rect');
    const cmEl = $('#hem-cm'), wa = $('#hem-wa'), item = $('#book-item');
    const BASE = 440, K = 10, MAX = 15;
    let cm = 4;
    const set = (v, fromUser) => {
      cm = Math.max(0, Math.min(MAX, Math.round(v * 2) / 2));
      const y = BASE - cm * K;
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      cut.setAttribute('y', y); cut.setAttribute('height', 460 - y);
      handle.querySelector('circle').setAttribute('cy', y);
      handle.querySelector('path').setAttribute('transform', 'translate(0 ' + (y - 400) + ')');
      handle.setAttribute('aria-valuenow', cm);
      cmEl.textContent = String(cm).replace('.', ',');
      const msg = 'Здравствуйте! Хочу укоротить брюки на ' + String(cm).replace('.', ',') + ' см. Когда можно прийти на примерку?';
      wa.href = 'https://wa.me/77473494161?text=' + encodeURIComponent(msg);
      wa.target = '_blank'; wa.rel = 'noopener';
      if (fromUser && item && !item.value) item.value = 'брюки, укоротить на ' + String(cm).replace('.', ',') + ' см';
    };
    const toCm = (e) => {
      const r = svg.getBoundingClientRect();
      const y = ((e.clientY - r.top) / r.height) * 460;
      return (BASE - y) / K;
    };
    let drag = false;
    svg.addEventListener('pointerdown', (e) => { drag = true; svg.setPointerCapture(e.pointerId); set(toCm(e), true); });
    svg.addEventListener('pointermove', (e) => { if (drag) set(toCm(e), true); });
    const end = () => { drag = false; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(cm + 0.5, true); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(cm - 0.5, true); }
    });
    set(cm, false);
    // a first pull so people see it is a handle
    if (M.motion && 'IntersectionObserver' in window) {
      let done = false;
      new IntersectionObserver((en) => {
        if (!en[0].isIntersecting || done) return;
        done = true;
        const t0 = performance.now();
        const run = (now) => {
          const p = Math.min(1, (now - t0) / 1400);
          if (!drag) set(4 + Math.sin(p * Math.PI) * 5, false);
          if (p < 1 && !drag) requestAnimationFrame(run); else if (!drag) set(4, false);
        };
        requestAnimationFrame(run);
      }, { threshold: 0.6 }).observe(svg);
    }
  }
})();
