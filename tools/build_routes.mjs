// Genera trabajos/<id>.html para cada proyecto de js/data.js. Uso: node tools/build_routes.mjs
// (La plantilla vive en tools/lib/page.mjs; el flujo completo con content/ es tools/build.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { makeRenderer } from './lib/page.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { PROJECTS } = await import(pathToFileURL(join(root, 'js/data.js')).href);
const { CONTACT, contactLinks } = await import(pathToFileURL(join(root, 'js/config.js')).href);
const { nbspLast } = await import(pathToFileURL(join(root, 'js/typo.js')).href);
const page = makeRenderer({ PROJECTS, CONTACT, L: contactLinks(), nbspLast });

mkdirSync(join(root, 'trabajos'), { recursive: true });
PROJECTS.forEach((p, i) => writeFileSync(join(root, 'trabajos', `${p.id}.html`), page(p, i)));
console.log(`${PROJECTS.length} páginas en trabajos/`);
