// Construye el sitio desde content/: js/data.js, js/config.js, trabajos/<id>.html, sitemap.xml y robots.txt.
// Uso: node tools/build.mjs   (sin dependencias)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { makeRenderer } from './lib/page.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (f) => {
  try { return JSON.parse(readFileSync(f, 'utf8')); }
  catch (e) { throw new Error(`No se pudo leer ${f}: ${e.message}`); }
};

// 1. Leer y validar contenido
const sitio = readJson(join(root, 'content/sitio.json'));
const dir = join(root, 'content/proyectos');
const projects = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => {
  const p = readJson(join(dir, f));
  const errs = [];
  for (const k of ['id', 'titulo', 'categoria', 'cliente', 'destaca']) if (!p[k] || typeof p[k] !== 'string') errs.push(`falta "${k}"`);
  if (p.id && f !== `${p.id}.json`) errs.push(`el nombre del archivo debe ser ${p.id}.json`);
  if (p.id && !/^[a-z0-9-]+$/.test(p.id)) errs.push('"id" solo admite minúsculas, números y guiones');
  if (!Array.isArray(p.imgs) || !p.imgs.length) errs.push('"imgs" debe tener al menos una imagen');
  else p.imgs.forEach((im, k) => {
    if (!Array.isArray(im) || typeof im[0] !== 'string' || !(im[1] > 0) || !(im[2] > 0)) errs.push(`imagen ${k + 1} debe ser ["nombre", ancho, alto]`);
    else if (!existsSync(join(root, 'assets', p.id, `${im[0]}-1200.webp`))) errs.push(`no existe assets/${p.id}/${im[0]}-1200.webp`);
  });
  if (errs.length) throw new Error(`${f}: ${errs.join('; ')}`);
  return p;
}).sort((a, b) => (a.orden ?? 1e9) - (b.orden ?? 1e9) || a.id.localeCompare(b.id));
if (!projects.length) throw new Error('No hay proyectos en content/proyectos/');
const ids = new Set(); projects.forEach((p) => { if (ids.has(p.id)) throw new Error(`id repetido: ${p.id}`); ids.add(p.id); });

// 2. Generar archivos en memoria
const PROJECTS = projects.map(({ id, titulo, categoria, cliente, destaca, imgs }) => ({ id, titulo, categoria, cliente, destaca, imgs }));
const dataJs = `// Generado por tools/build.mjs desde content/proyectos/*.json. No editar a mano.
// imgs: [base, ancho1200, alto1200] -> assets/<id>/<base>-1200.webp y -400.webp
export const PROJECTS = ${JSON.stringify(PROJECTS, null, 1)};
`;

const c = sitio.contacto || {};
const q = (v) => (v == null || v === '' ? 'null' : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`);
const configJs = `// Generado por tools/build.mjs desde content/sitio.json. Para cambiar el contacto edita ese archivo.
// Si un campo es null, el sitio no lo muestra.
export const CONTACT = {
  nombre: ${q(c.nombre)},
  email: ${q(c.email)},
  telefono: ${q(c.telefono)},
  whatsapp: ${q(c.whatsapp)},   // solo dígitos con código país
  instagram: ${q(c.instagram)},           // usuario sin @; null = oculto
  formulario: ${q(c.formulario)},         // URL del servicio de formularios; null = abre el correo
};

// Enlaces derivados (los usan el index, el menú y las páginas de proyecto).
const digits = (s) => String(s).replace(/[^\\d+]/g, '');
export function contactLinks(c = CONTACT) {
  return {
    mail: c.email ? \`mailto:\${c.email}?subject=\${encodeURIComponent('Cotización de proyecto')}\` : null,
    wa: c.whatsapp ? \`https://wa.me/\${c.whatsapp}?text=\${encodeURIComponent('Hola, quisiera cotizar un proyecto')}\` : null,
    tel: c.telefono ? \`tel:\${digits(c.telefono)}\` : null,
    ig: c.instagram ? \`https://instagram.com/\${c.instagram}\` : null,
  };
}
`;

const baseUrl = String(sitio.url || '').trim().replace(/\/+$/, '');
const out = new Map([['js/data.js', dataJs], ['js/config.js', configJs]]);

const { nbspLast } = await import(pathToFileURL(join(root, 'js/typo.js')).href);
const contactLinks = (cc) => {
  const digits = (s) => String(s).replace(/[^\d+]/g, '');
  return {
    mail: cc.email ? `mailto:${cc.email}?subject=${encodeURIComponent('Cotización de proyecto')}` : null,
    wa: cc.whatsapp ? `https://wa.me/${cc.whatsapp}?text=${encodeURIComponent('Hola, quisiera cotizar un proyecto')}` : null,
    tel: cc.telefono ? `tel:${digits(cc.telefono)}` : null,
    ig: cc.instagram ? `https://instagram.com/${cc.instagram}` : null,
  };
};
const CONTACT = { nombre: c.nombre ?? null, email: c.email ?? null, telefono: c.telefono ?? null, whatsapp: c.whatsapp ?? null, instagram: c.instagram || null };
const page = makeRenderer({ PROJECTS, CONTACT, L: contactLinks(CONTACT), nbspLast, baseUrl });
PROJECTS.forEach((p, i) => out.set(`trabajos/${p.id}.html`, page(p, i)));

if (baseUrl) {
  const urls = [`${baseUrl}/`, ...PROJECTS.map((p) => `${baseUrl}/trabajos/${p.id}.html`)];
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  out.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
} else {
  for (const f of ['sitemap.xml', 'robots.txt']) if (existsSync(join(root, f))) unlinkSync(join(root, f));
}

// 3. Escribir solo lo que cambia (y avisar)
const changed = [], same = [];
for (const [rel, txt] of out) {
  const f = join(root, rel);
  const prev = existsSync(f) ? readFileSync(f, 'utf8') : null;
  if (prev === txt) { same.push(rel); continue; }
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, txt);
  changed.push(`${prev === null ? 'nuevo' : 'cambió'}: ${rel}`);
}
// páginas huérfanas (proyectos eliminados)
for (const f of readdirSync(join(root, 'trabajos'))) {
  if (f.endsWith('.html') && !ids.has(f.slice(0, -5))) { unlinkSync(join(root, 'trabajos', f)); changed.push(`eliminado: trabajos/${f}`); }
}
console.log(`${PROJECTS.length} páginas de proyecto generadas (${projects.length} proyectos).`);
console.log(changed.length ? changed.join('\n') : 'Sin cambios: todo estaba al día.');
if (!baseUrl) console.log('Nota: "url" vacío en content/sitio.json, se omiten sitemap.xml y robots.txt.');
