# Cómo editar el sitio de Nous Diseño

Todo el contenido está en la carpeta `content/`. No hace falta tocar código.
Necesitas tener instalado Node.js (nodejs.org, versión 18 o superior) una sola vez.

## Agregar un proyecto nuevo
1. Copia un archivo de `content/proyectos/` (por ejemplo `be-good.json`), pégalo con el nombre del proyecto
   en minúsculas y con guiones (`mi-proyecto.json`) y cambia dentro: `id` (igual al nombre del archivo),
   `titulo`, `categoria`, `cliente`, `destaca` (la frase breve) y `orden` (número: el 1 sale primero).
   Deja `"imgs": []` vacío.
2. Crea la carpeta `content/nuevos/mi-proyecto/` y copia ahí las fotos originales (jpg, png o webp).
   Se ordenan por nombre de archivo.
3. En una terminal, dentro de la carpeta del sitio: `npm install` (solo la primera vez) y luego `npm run imagenes`.
   Esto crea las versiones livianas en `assets/` y las anota en el JSON. Después borra las fotos de `content/nuevos/`.
4. Ejecuta `npm run build`. Se actualizan la portada y las páginas de `trabajos/`.

Para quitar un proyecto, borra su archivo `.json` y ejecuta `npm run build`.
Para cambiar el orden, cambia el número `orden`.

## Editar un texto de un proyecto
Abre `content/proyectos/<proyecto>.json`, cambia el texto entre comillas y ejecuta `npm run build`.

## Cambiar el contacto
Abre `content/sitio.json`, edita `nombre`, `email`, `telefono`, `whatsapp` (solo números, con código de país)
o `instagram` (usuario sin @; `null` para ocultarlo) y ejecuta `npm run build`.

## Textos de la portada y "Nosotros"
Por ahora siguen en `index.html` (busca el comentario `EDITAR`), porque llevan formato y espacios
especiales que se pueden romper. Edita solo el texto, sin borrar las etiquetas `<...>`.

## Previsualizar
Ejecuta `npm run dev` y abre http://localhost:8765 en el navegador. Para detenerlo, Ctrl+C.

## Publicar
Sube la carpeta completa del sitio (sin `node_modules`) a Netlify o Cloudflare Pages
(arrastrar y soltar, o conectar el repositorio). Si tienes un dominio, escríbelo en `url` dentro de
`content/sitio.json` (ejemplo: `https://ndsno.cl`) y vuelve a ejecutar `npm run build`:
se generan `sitemap.xml` y `robots.txt` para Google.

## Más adelante
Los archivos de `content/` ya están listos para conectar un panel de administración (`/admin`,
por ejemplo Decap CMS), con el que se podrá editar desde el navegador sin terminal.
