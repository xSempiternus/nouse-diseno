// Barra superior: se oculta al bajar y vuelve al subir, menú móvil con
// panel de cristal, enlace activo según la sección visible y hash en la URL.

export function initNav({ onSectionChange } = {}) {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');
  const label = burger.querySelector('.burger__label');
  let open = false;

  function setOpen(next, { focusBack = true } = {}) {
    if (next === open) return;
    open = next;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    label.textContent = open ? 'Cerrar' : 'Menú';
    nav.classList.toggle('is-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.querySelector('a')?.focus();
      document.addEventListener('keydown', onKey);
    } else {
      menu.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      const done = () => { if (!open) menu.hidden = true; };
      matchMedia('(prefers-reduced-motion: reduce)').matches ? done() : setTimeout(done, 300);
      if (focusBack) burger.focus();
    }
  }
  function onKey(e) {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;
    // ciclo de foco dentro de botón + enlaces del menú
    const items = [burger, ...menu.querySelectorAll('a')];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
  }
  burger.addEventListener('click', () => setOpen(!open));
  burger.setAttribute('aria-label', 'Abrir menú');
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false, { focusBack: false });
    else if (e.target === menu) setOpen(false);
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (m) => m.matches && setOpen(false, { focusBack: false }));

  // ocultar al bajar / mostrar al subir
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (!open) nav.classList.toggle('is-hidden', y > 160 && y > lastY + 4);
      if (y < lastY - 4 || y < 160) nav.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  // sección activa → aria-current + hash
  const links = [...document.querySelectorAll('.nav__menu a[data-nav]')];
  const ids = ['inicio', 'trabajos', 'areas', 'nosotros', 'clientes', 'contacto'];
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  let current = null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.target.__vis = e.isIntersecting; });
    const active = sections.find((s) => s.__vis);
    const id = active ? active.id : null;
    if (id === current) return;
    current = id;
    links.forEach((a) => (a.dataset.nav === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    onSectionChange?.(id);
  }, { rootMargin: '-45% 0px -54% 0px' });
  sections.forEach((s) => io.observe(s));

  return { close: () => setOpen(false, { focusBack: false }) };
}

// Reemplaza el hash sin saltar ni crear entradas de historial (patrón kunal: /works).
export function setHash(hash) {
  const next = hash ? `#${hash}` : location.pathname + location.search;
  if (location.hash === (hash ? `#${hash}` : '')) return;
  try { history.replaceState(null, '', next); } catch { /* file:// u otros */ }
}
