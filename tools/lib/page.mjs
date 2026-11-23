// Plantilla de la página de proyecto (compartida por build.mjs y build_routes.mjs).
export function makeRenderer({ PROJECTS, CONTACT, L, nbspLast, baseUrl = '' }) {
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nb = (s) => esc(nbspLast(String(s))).replace(/\u00A0/g, '&nbsp;');
const client = (p) => p.cliente.replace(/\s*\(.*?\)/g, '');
const img = (p, base, size) => `../assets/${p.id}/${base}-${size}.webp`;
const alt = (p, i) => `${p.titulo}, ${p.categoria.toLowerCase()} para ${client(p)}. ${i === 0 ? p.destaca : `Imagen ${i + 1} de ${p.imgs.length}.`}`;

const contact = [];
contact.push(`<a class="btn" href="../index.html#cotizar">Cotizar un proyecto</a>`);
if (L.wa) contact.push(`<a class="btn-ghost" href="${esc(L.wa)}" rel="noopener">Escribir por WhatsApp</a>`);
if (L.tel) contact.push(`<a class="btn-ghost" href="${esc(L.tel)}">${esc(CONTACT.telefono)}</a>`);
if (L.ig) contact.push(`<a class="btn-ghost" href="${esc(L.ig)}" rel="noopener">Instagram @${esc(CONTACT.instagram)}</a>`);

function page(p, i) {
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const title = `${p.titulo} · ${p.categoria} · Nous Diseño`; // el sufijo de marca completo va en la description
  const figs = p.imgs.map(([b, w, h], k) => `
        <li class="shot${w >= h ? ' is-wide' : ''}">
          <a href="${img(p, b, 1200)}" data-lightbox aria-label="Ampliar imagen ${k + 1} de ${p.imgs.length}">
            <img src="${img(p, b, 1200)}" srcset="${img(p, b, 400)} 400w, ${img(p, b, 1200)} ${w}w"
                 sizes="(max-width: 900px) calc(100vw - 32px), ${w >= h ? '90vw' : '45vw'}"
                 width="${w}" height="${h}" ${k === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" alt="${esc(alt(p, k))}">
          </a>
        </li>`).join('');
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(`${p.titulo}: ${p.destaca} ${p.categoria} para ${client(p)}, por Nous Diseño, estudio de diseño y comunicación digital en Chile.`)}">
<link rel="icon" href="../assets/brand/favicon.png" type="image/png">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="${esc(baseUrl ? `${baseUrl}/trabajos/${p.id}.html` : `${p.id}.html`)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(p.destaca)}">
<meta property="og:image" content="${img(p, p.imgs[0][0], 1200)}">
<link rel="preload" href="../fonts/manrope.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="../css/styles.css">
<link rel="stylesheet" href="../css/project.css">
</head>
<body class="page-project">
<a class="skip" href="#main">Saltar al contenido</a>

<header class="nav" id="nav">
  <div class="nav__bar">
    <a class="logo" href="../index.html" aria-label="Nous Diseño, ir al inicio">
      <img src="../assets/brand/logo-nous-wordmark.webp" width="473" height="157" alt="Nous Diseño" decoding="async">
    </a>
    <nav class="nav__menu" aria-label="Principal">
      <a href="../index.html#trabajos" aria-current="page">Trabajos</a>
      <a href="../index.html#areas">Áreas</a>
      <a href="../index.html#nosotros">Nosotros</a>
      <a href="../index.html#clientes">Clientes</a>
      <a href="../index.html#contacto">Contacto</a>
    </nav>
    <a class="nav__cta" href="../index.html#cotizar">Cotizar un proyecto</a>
    <a class="nav__back" href="../index.html#trabajos">Trabajos</a>
  </div>
</header>

<main id="main">
  <article class="wrap project" aria-labelledby="p-title">
    <nav class="crumbs" aria-label="Migas de pan">
      <a href="../index.html#trabajos">← Todos los trabajos</a>
    </nav>
    <header class="project__head">
      <p class="project__meta">${esc(p.categoria)} · ${esc(p.cliente)}</p>
      <h1 class="project__title" id="p-title">${esc(p.titulo)}</h1>
      <p class="project__desc">${nb(p.destaca)}</p>
    </header>

    <section aria-label="Imágenes del proyecto">
      <ul class="shots" role="list">${figs}
      </ul>
    </section>
${contact.length ? `
    <aside class="project__contact" aria-labelledby="p-contact">
      <h2 id="p-contact">¿Tienes un proyecto parecido?</h2>
      ${CONTACT.nombre ? `<p class="project__who">Contacto: ${esc(CONTACT.nombre)}</p>` : ''}
      <div class="contact__actions">${contact.join('')}</div>
    </aside>
` : ''}
    <nav class="pager" aria-label="Otros proyectos">
      <a class="pager__prev" href="${prev.id}.html" rel="prev"><span>← Anterior</span><strong>${nb(prev.titulo)}</strong></a>
      <a class="pager__all btn-ghost" href="../index.html#trabajos">← Todos los trabajos</a>
      <a class="pager__next" href="${next.id}.html" rel="next"><span>Siguiente →</span><strong>${nb(next.titulo)}</strong></a>
    </nav>
  </article>
</main>

<footer class="foot">
  <div class="wrap foot__inner">
    <img class="foot__logo" src="../assets/brand/logo-nous-dark.webp" width="500" height="446" loading="lazy" decoding="async" alt="Nous, Diseño y Comunicación Digital">
    <address class="foot__contact">${L.mail ? `<a href="${esc(L.mail)}">${esc(CONTACT.email)}</a>` : ''}${L.tel ? `<a href="${esc(L.tel)}">${esc(CONTACT.telefono)}</a>` : ''}</address>
    <span class="foot__copy">© <span id="year"></span> Nous Diseño</span>
    <a class="foot__top" href="#main">Volver arriba</a>
  </div>
</footer>

<dialog class="lightbox" id="lightbox" aria-label="Imagen ampliada">
  <form method="dialog" class="lightbox__bar">
    <span class="lightbox__count" id="lb-count" aria-live="polite"></span>
    <button class="btn-ghost" type="button" id="lb-prev" aria-label="Imagen anterior">Anterior</button>
    <button class="btn-ghost" type="button" id="lb-next" aria-label="Imagen siguiente">Siguiente</button>
    <button class="btn-ghost" id="lb-close" aria-label="Cerrar imagen ampliada">Cerrar</button>
  </form>
</dialog>
<script src="../js/project.js" defer></script>
</body>
</html>
`;
}

return page;
}
