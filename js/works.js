// Trabajos: filtros por área, grilla de tarjetas (enlaces reales a trabajos/<id>.html),
// áreas y clientes. El detalle vive ahora en páginas propias (tools/build_routes.mjs).

import { PROJECTS } from './data.js';

export const CATEGORIES = ['Editorial', 'Gráfica', 'Imagen corporativa', 'Web', 'Fotografía'];

const AREA_COPY = {
  'Editorial': 'Libros, revistas, anuarios y memorias: diseño de portada, maquetación y sistema gráfico de cada publicación.',
  'Gráfica': 'Afiches, cartas, mascotas y piezas para exposición y punto de venta.',
  'Imagen corporativa': 'Logotipos y sistemas de marca, con sus aplicaciones en local, impresos y redes sociales.',
  'Web': 'Sitios corporativos diseñados para ordenar la información y llevar la marca a la pantalla.',
  'Fotografía': 'Registro fotográfico con gráfica integrada para eventos y comunicación.',
};

// Nombres de cliente para la lista (desde el manifest, sin agregar ninguno).
function clientNames() {
  const seen = new Set();
  const names = [];
  PROJECTS.forEach((p) => {
    p.cliente.split(/\s\/\s/).forEach((raw) => {
      const n = raw.replace(/\s*\(.*?\)\s*/g, '').trim();
      const key = n.toLowerCase();
      if (n && !seen.has(key)) { seen.add(key); names.push(n); }
    });
  });
  return names;
}

const src = (p, base, size) => `assets/${p.id}/${base}-${size}.webp`;

function altFor(p, i) {
  const first = i === 0;
  return `${p.titulo}, ${p.categoria.toLowerCase()} para ${p.cliente.replace(/\s*\(.*?\)/g, '')}. ${first ? p.destaca : `Imagen ${i + 1} de ${p.imgs.length}.`}`;
}

export function initWorks({ onOpen } = {}) {
  const grid = document.getElementById('grid');
  const filters = document.getElementById('filters');
  const status = document.getElementById('filter-status');
  const frag = document.createDocumentFragment();

  // ---- tarjetas
  PROJECTS.forEach((p) => {
    const [base, w, h] = p.imgs[0];
    const li = document.createElement('li');
    li.dataset.cat = p.categoria;
    li.innerHTML = `
      <a class="card" href="trabajos/${p.id}.html" data-id="${p.id}" data-cursor="Ver proyecto">
        <span class="card__media${h > w ? ' is-tall' : ''}">
          <img src="${src(p, base, 400)}"
               srcset="${src(p, base, 400)} 400w, ${src(p, base, 1200)} ${w}w"
               sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1100px) 46vw, 30vw"
               width="${w}" height="${h}" loading="lazy" decoding="async" alt="">
          <span class="card__count" aria-hidden="true">${String(p.imgs.length).padStart(2, '0')} img</span>
        </span>
        <span class="card__body">
          <span class="card__title">${p.titulo}</span>
          <span class="card__meta"><span class="card__cat">${p.categoria}</span><span>${p.cliente.replace(/\s*\(.*?\)/g, '')}</span></span>
        </span>
      </a>`;
    li.querySelector('img').alt = altFor(p, 0);
    frag.appendChild(li);
  });
  grid.appendChild(frag);

  // ---- filtros
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, PROJECTS.filter((p) => p.categoria === c).length]));
  const allBtn = chip('Todos', PROJECTS.length, true);
  filters.appendChild(allBtn);
  CATEGORIES.forEach((c) => filters.appendChild(chip(c, counts[c], false)));
  function chip(label, n, pressed) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.filter = label;
    b.setAttribute('aria-pressed', String(pressed));
    b.innerHTML = `${label} <span aria-hidden="true">${String(n).padStart(2, '0')}</span>`;
    b.setAttribute('aria-label', `${label}, ${n} proyectos`);
    return b;
  }
  function applyFilter(label) {
    filters.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === label)));
    let n = 0;
    grid.querySelectorAll('li').forEach((li) => {
      const show = label === 'Todos' || li.dataset.cat === label;
      li.hidden = !show; if (show) n++;
    });
    status.textContent = label === 'Todos' ? `Mostrando los ${n} proyectos` : `Mostrando ${n} proyectos de ${label}`;
    document.dispatchEvent(new CustomEvent('works:filtered'));
  }
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (b) applyFilter(b.dataset.filter);
  });
  // enlaces de la portada y de áreas que llevan a un filtro
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-filter-link]');
    if (a) applyFilter(a.dataset.filterLink);
  });

  // ---- áreas
  const areaList = document.getElementById('area-list');
  CATEGORIES.forEach((c) => {
    const ps = PROJECTS.filter((p) => p.categoria === c).slice(0, 3);
    const li = document.createElement('li');
    li.className = 'area';
    li.innerHTML = `
      <div><h3 class="area__name">${c}<small>${String(counts[c]).padStart(2, '0')}</small></h3>
        <a class="area__link" href="#trabajos" data-filter-link="${c}">Ver trabajos de ${c.toLowerCase()}</a></div>
      <p class="area__desc">${AREA_COPY[c]}</p>
      <div class="area__thumbs" aria-hidden="true">${ps.map((p) => `<img src="${src(p, p.imgs[0][0], 400)}" width="76" height="54" loading="lazy" decoding="async" alt="">`).join('')}</div>`;
    areaList.appendChild(li);
  });

  // ---- clientes
  const cl = document.getElementById('client-list');
  clientNames().forEach((n) => { const li = document.createElement('li'); li.textContent = n; cl.appendChild(li); });

  // ---- rutas: el detalle es una página propia
  const pageUrl = (id) => `trabajos/${id}.html`;
  function open(id) {
    if (PROJECTS.some((p) => p.id === id)) location.assign(pageUrl(id));
  }

  return { open, projects: PROJECTS };
}

// Hashes antiguos #trabajos/<id> -> página del proyecto (también si cambia el hash en la misma página).
function redirectLegacyHash() {
  const m = location.hash.match(/^#trabajos\/([\w-]+)/);
  if (m && PROJECTS.some((p) => p.id === m[1])) location.replace(`trabajos/${m[1]}.html`);
}
redirectLegacyHash();
addEventListener('hashchange', redirectLegacyHash);
