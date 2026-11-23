import { initHalftone } from './halftone.js';
// Punto de entrada. GSAP y ScrollTrigger se cargan como scripts clásicos
// (vendor/, versión fija 3.12.5) y quedan en window.
import { splitWords } from './split.js';
import { initNav, setHash } from './nav.js';
import { initZoom } from './zoom.js';
import { initWorks } from './works.js';
import { CONTACT, contactLinks } from './config.js';
import { initQuote } from './quote.js';
import { tidy } from './typo.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'power4.out'; // ≈ cubic-bezier(.23,1,.32,1) para entradas largas

function ready(fn) {
  if (window.gsap && window.ScrollTrigger) return fn();
  addEventListener('load', fn, { once: true }); // scripts defer ya ejecutados en load
}

document.getElementById('year').textContent = new Date().getFullYear();

// ---- contacto (solo datos de config.js; los nulos no se muestran)
(function renderContact() {
  const L = contactLinks();
  const box = document.getElementById('contact-actions');
  const parts = [];
  
  if (L.wa) parts.push(`<a class="btn-ghost" href="${L.wa}" rel="noopener">Escribir por WhatsApp</a>`);
  if (L.tel) parts.push(`<a class="btn-ghost" href="${L.tel}">${CONTACT.telefono}</a>`);
  if (L.ig) parts.push(`<a class="btn-ghost" href="${L.ig}" rel="noopener">Instagram @${CONTACT.instagram}</a>`);
  box.innerHTML = parts.join('');
  box.hidden = !parts.length;
  const who = document.getElementById('contact-who');
  if (CONTACT.nombre) who.textContent = `Contacto: ${CONTACT.nombre}`; else who.hidden = true;
  document.querySelectorAll('[data-contact-link]').forEach((a) => {
    const href = L[a.dataset.contactLink];
    if (href) { a.href = href; if (a.dataset.contactLink === 'tel') a.textContent = CONTACT.telefono; if (a.closest('.foot') && a.dataset.contactLink === 'mail') a.textContent = CONTACT.email; }
    else a.hidden = true;
  });
})();

initQuote();

const works = initWorks({
  onOpen: (id) => setHash(id ? `trabajos/${id}` : (location.hash.startsWith('#trabajos') ? 'trabajos' : '')),
});

// abrir proyecto desde un enlace directo #trabajos/<id>
const deep = location.hash.match(/^#trabajos\/([\w-]+)/);
if (deep) requestAnimationFrame(() => {
  document.getElementById('trabajos').scrollIntoView({ behavior: 'instant' });
  works.open(deep[1]);
});

// Enlaces "abrir proyecto" de la escena 2 → grilla + detalle (#trabajos/<id>)
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-open-project]');
  if (!a) return;
  e.preventDefault();
  const id = a.dataset.openProject;
  document.getElementById('trabajos').scrollIntoView({ behavior: 'instant' });
  const card = document.querySelector(`.card[data-id="${id}"]`);
  works.open(id, card || a);
});

initNav({
  onSectionChange: (id) => {
    if (document.getElementById('detail').open) return;
    if (id === 'inicio' || id == null) { setHash(''); return; }
    setHash(id);
  },
});

tidy();
initHalftone(document.getElementById('halftone'), { reduced });
initCursor();

ready(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap) { document.querySelectorAll('[data-split]').forEach((el) => el.classList.add('is-split')); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (reduced) {
    document.querySelectorAll('[data-split]').forEach((el) => el.classList.add('is-split'));
    return; // versión estática: sin scrub, sin revelados
  }

  // Portada: un solo momento orquestado al cargar
  const heroWords = splitWords(document.querySelector('.hero__title'));
  gsap.timeline({ defaults: { ease: EASE } })
    .from('.hero__kicker', { autoAlpha: 0, y: 12, duration: 0.8 }, 0)
    .from(heroWords, { yPercent: 110, duration: 1, stagger: { each: 0.075 } }, 0.1)
    .from('.hero__lede, .hero__areas', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.55)
    .from('.nav__bar', { autoAlpha: 0, y: -12, duration: 0.8 }, 0.2);

  // Escena 2: ampolleta fija (progreso → --p)
  initZoom({ ScrollTrigger });

  // Títulos de sección: revelado no-scrub al entrar (patrón evast)
  document.querySelectorAll('.sec-head__title').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, duration: 1, ease: EASE, stagger: { each: 0.06 },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Grilla: entrada por filas, una sola vez
  gsap.set('#grid > li', { opacity: 0 });
  ScrollTrigger.batch('#grid > li', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.06, overwrite: true }),
  });
  document.addEventListener('works:filtered', () => {
    gsap.set('#grid > li:not([hidden])', { opacity: 1, y: 0 });
    ScrollTrigger.refresh();
  });

  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});

// ---- cursor custom con lerp (solo puntero fino y con movimiento)
function initCursor() {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const el = document.getElementById('cursor');
  const label = document.getElementById('cursor-label');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 }, target = { ...pos };
  let shown = false, text = '';
  addEventListener('pointermove', (e) => {
    target.x = e.clientX; target.y = e.clientY;
    if (!shown) { pos.x = target.x; pos.y = target.y; shown = true; el.classList.remove('is-hidden'); }
    const t = e.target.closest?.('[data-cursor]');
    const next = t ? t.dataset.cursor : '';
    if (next !== text) { text = next; label.textContent = text; el.classList.toggle('has-label', !!text); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.classList.add('is-hidden'); shown = false; });
  const L = 0.18;
  (function tick() {
    pos.x += (target.x - pos.x) * L;
    pos.y += (target.y - pos.y) * L;
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    requestAnimationFrame(tick);
  })();
}
