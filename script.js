'use strict';

/* ==========================================================================
   CONFIG — the few things you'll actually want to edit per-school
   ========================================================================== */
const CONFIG = {
  // EDIT ME: real date/time Case Zero opens. ISO with IST offset shown here.
  launchDate: new Date('2026-08-14T09:00:00+05:30'),

  // The four digits hidden in the Briefing section (selectable, invisible text).
  // Must match the code a visitor gets when they highlight that line.
  secretCode: '4471',

  // EDIT ME: where "Register Your Team" should go.
  registerEmail: 'casezero@yourschool.edu',

  // EDIT ME: one entry per house. color drives the emblem + gloss text.
  houses: [
    { name: 'Agni', gloss: 'Fire', color: '#EF5B3B', tagline: 'Moves first, asks questions never.' },
    { name: 'Vayu', gloss: 'Air', color: '#5A6ACF', tagline: 'Already three steps ahead of the file.' },
    { name: 'Prithvi', gloss: 'Earth', color: '#1F7A6C', tagline: 'Never misses a detail, never in a hurry.' },
    { name: 'Jal', gloss: 'Water', color: '#2E9BB0', tagline: 'Finds a way through anything in its path.' }
  ]
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScramble();
  initScratch();
  initLock();
  initHouses();
  initNavTracking();
  initRevealObserver();
});

/* ==========================================================================
   Countdown — "CASE OPENS IN"
   ========================================================================== */
function initCountdown() {
  const days = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const mins = document.getElementById('cd-mins');
  const secs = document.getElementById('cd-secs');
  const secsTile = document.getElementById('cd-secs-tile');
  const label = document.querySelector('.countdown__label');
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');

  if (!days || !hours || !mins || !secs) return;

  function pad(n) { return String(Math.max(n, 0)).padStart(2, '0'); }

  function goLive() {
    days.textContent = '00';
    hours.textContent = '00';
    mins.textContent = '00';
    secs.textContent = '00';
    if (label) label.textContent = 'CASE IS LIVE';
    if (statusPill) statusPill.classList.add('navbar__status--live');
    if (statusText) statusText.textContent = 'LIVE';
  }

  let lastSecs = null;

  function tick() {
    const diff = CONFIG.launchDate.getTime() - Date.now();
    if (diff <= 0) {
      goLive();
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    days.textContent = pad(d);
    hours.textContent = pad(h);
    mins.textContent = pad(m);
    secs.textContent = pad(s);

    if (s !== lastSecs && secsTile) {
      secsTile.classList.remove('tick');
      void secsTile.offsetWidth; // restart the CSS animation
      secsTile.classList.add('tick');
      lastSecs = s;
    }
  }

  // assign the interval first so a same-tick clearInterval() inside tick() is always valid
  let timer = setInterval(tick, 1000);
  tick();
}

/* ==========================================================================
   Scramble-reveal — hero tagline decodes itself on load
   ========================================================================== */
function initScramble() {
  const el = document.getElementById('scramble-target');
  if (!el) return;
  const final = el.textContent.trim();

  if (prefersReducedMotion) {
    el.textContent = final;
    return;
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?#%&*';
  const len = final.length;
  const revealAt = Array.from({ length: len }, (_, i) => i * 20 + Math.random() * 140 + 150);
  el.textContent = '';
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    let out = '';
    let done = true;
    for (let i = 0; i < len; i++) {
      const ch = final[i];
      if (ch === ' ') { out += ' '; continue; }
      if (elapsed > revealAt[i]) {
        out += ch;
      } else {
        done = false;
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = out;
    if (!done) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ==========================================================================
   Scratch-to-reveal — hover/focus reveal (CSS) + tap toggle for touch
   ========================================================================== */
function initScratch() {
  document.querySelectorAll('.scratch').forEach((node) => {
    node.addEventListener('click', () => node.classList.toggle('is-open'));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.classList.toggle('is-open');
      }
    });
  });
}

/* ==========================================================================
   Combination lock — the Fragment 0 puzzle
   ========================================================================== */
function initLock() {
  const dialsContainer = document.getElementById('lock-dials');
  const lock = document.getElementById('combo-lock');
  const submitBtn = document.getElementById('lock-submit');
  const feedback = document.getElementById('lock-feedback');
  if (!dialsContainer || !submitBtn || !feedback) return;

  const digits = [0, 0, 0, 0];

  function chevron(dir) {
    const d = dir === 1 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6';
    return `<svg viewBox="0 0 24 24" fill="none"><path d="${d}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  digits.forEach((_, i) => {
    const dial = document.createElement('div');
    dial.className = 'dial';
    dial.innerHTML = `
      <button type="button" class="dial__btn" data-index="${i}" data-dir="1" aria-label="Digit ${i + 1}, increase">${chevron(1)}</button>
      <div class="dial__digit" tabindex="0" role="spinbutton" data-index="${i}" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0" aria-label="Digit ${i + 1}">0</div>
      <button type="button" class="dial__btn" data-index="${i}" data-dir="-1" aria-label="Digit ${i + 1}, decrease">${chevron(-1)}</button>
    `;
    dialsContainer.appendChild(dial);
  });

  function setDigit(i, value) {
    digits[i] = ((value % 10) + 10) % 10;
    const display = dialsContainer.querySelector(`.dial__digit[data-index="${i}"]`);
    if (display) {
      display.textContent = String(digits[i]);
      display.setAttribute('aria-valuenow', String(digits[i]));
    }
  }

  dialsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.dial__btn');
    if (!btn) return;
    setDigit(Number(btn.dataset.index), digits[Number(btn.dataset.index)] + Number(btn.dataset.dir));
  });

  dialsContainer.addEventListener('keydown', (e) => {
    const target = e.target.closest('.dial__digit');
    if (!target) return;
    const i = Number(target.dataset.index);
    if (e.key === 'ArrowUp') { e.preventDefault(); setDigit(i, digits[i] + 1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setDigit(i, digits[i] - 1); }
  });

  submitBtn.addEventListener('click', () => {
    const code = digits.join('');
    feedback.classList.remove('is-success', 'is-error');

    if (code === CONFIG.secretCode) {
      feedback.textContent = 'FRAGMENT 0 — VERIFIED. Case Zero already has its eye on you.';
      feedback.classList.add('is-success');
      submitBtn.disabled = true;
      dialsContainer.querySelectorAll('.dial__btn').forEach((b) => { b.disabled = true; });
      if (lock) lock.classList.add('is-open');
    } else {
      feedback.textContent = 'No match. The number is hiding, not gone.';
      feedback.classList.add('is-error');
      dialsContainer.querySelectorAll('.dial').forEach((d) => {
        d.classList.remove('is-shaking');
        void d.offsetWidth; // restart the CSS animation
        d.classList.add('is-shaking');
      });
    }
  });
}

/* ==========================================================================
   Houses — rendered from CONFIG so the roster is a one-line edit
   ========================================================================== */
function initHouses() {
  const grid = document.getElementById('house-grid');
  if (grid) {
    CONFIG.houses.forEach((house) => {
      const card = document.createElement('div');
      card.className = 'house-card';
      card.style.setProperty('--house-color', house.color);
      card.innerHTML = `
        <span class="house-card__emblem">${house.name.charAt(0)}</span>
        <span class="house-card__name">${house.name}</span>
        <span class="house-card__gloss">${house.gloss}</span>
        <p class="house-card__tagline">${house.tagline}</p>
      `;
      grid.appendChild(card);
    });
  }

  const registerLink = document.getElementById('register-link');
  if (registerLink) {
    const subject = encodeURIComponent('Register our house \u2014 Case Zero');
    registerLink.href = `mailto:${CONFIG.registerEmail}?subject=${subject}`;
  }
}

/* ==========================================================================
   Navbar — highlight the link matching the section in view
   ========================================================================== */
function initNavTracking() {
  const links = Array.from(document.querySelectorAll('.navbar__link'));
  if (!links.length) return;

  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!('IntersectionObserver' in window) || !sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.find((l) => l.dataset.section === entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('navbar__link--active'));
          link.classList.add('navbar__link--active');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => io.observe(s));
}

/* ==========================================================================
   Scroll reveal — base fade/slide via CSS class, extra stagger via GSAP
   ========================================================================== */
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const staggerMap = {
    briefing: '.note-row li',
    format: '.trail__node',
    method: '.method-card',
    details: '.detail-card',
    enlist: '.house-card'
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        const sel = staggerMap[entry.target.id];
        if (sel && window.gsap) {
          const items = entry.target.querySelectorAll(sel);
          if (items.length) {
            gsap.fromTo(
              items,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.15 }
            );
          }
        }
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => io.observe(el));
}