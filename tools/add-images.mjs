// Convierte imágenes originales de content/nuevos/<id>/ en assets/<id>/<nombre>-400.webp y -1200.webp
// y las agrega al JSON del proyecto (content/proyectos/<id>.json). Uso: npm run imagenes
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let sharp;
try { sharp = (await import('sharp')).default; }
catch {
  console.error('Falta la librería "sharp". Instálala una sola vez con:\n\n    npm install\n\n(o: npm i -D sharp). Necesitas Node.js 18 o superior.');
  process.exit(1);
}

const base = join(root, 'content/nuevos');
if (!existsSync(base)) { console.log('No existe content/nuevos/. Crea content/nuevos/<id-del-proyecto>/ y copia ahí las imágenes.'); process.exit(0); }
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const natural = (a, b) => a.localeCompare(b, 'es', { numeric: true });

let total = 0;
for (const id of readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const jf = join(root, 'content/proyectos', `${id}.json`);
  if (!existsSync(jf)) { console.warn(`Saltado "${id}": primero crea content/proyectos/${id}.json (copia otro y edítalo, con "imgs": []).`); continue; }
  const proj = JSON.parse(readFileSync(jf, 'utf8'));
  proj.imgs = proj.imgs || [];
  const files = readdirSync(join(base, id)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort(natural);
  if (!files.length) continue;
  const out = join(root, 'assets', id); mkdirSync(out, { recursive: true });
  const used = new Set(proj.imgs.map((i) => i[0]));
  let n = proj.imgs.length;
  for (const f of files) {
    let name = `${id}-${String(++n).padStart(2, '0')}`;
    while (used.has(name)) name = `${id}-${String(++n).padStart(2, '0')}`;
    used.add(name);
    const src = join(base, id, f);
    const big = await sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(out, `${name}-1200.webp`));
    await sharp(src).rotate().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(out, `${name}-400.webp`));
    proj.imgs.push([name, big.width, big.height]);
    console.log(`${id}: ${f} -> ${name} (${big.width}x${big.height})`);
    total++;
  }
  const { imgs, ...rest } = proj;
  writeFileSync(jf, JSON.stringify(rest, null, 2).replace(/\n}$/, '') + ',\n  "imgs": [\n' + imgs.map((i) => '    ' + JSON.stringify(i)).join(',\n') + '\n  ]\n}\n');
}
console.log(total ? `${total} imagen(es) listas. Ahora ejecuta: npm run build` : 'No había imágenes nuevas.');
console.log('Recuerda mover o borrar los originales de content/nuevos/ para no procesarlos dos veces.');
