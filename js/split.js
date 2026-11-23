// Parte un titular en palabras enmascaradas para revelarlas con GSAP.
// Mantiene el texto accesible: el contenedor conserva aria-label con el texto original.

export function splitWords(el) {
  if (!el || el.classList.contains('is-split')) return [];
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  //   (no-break) se respeta: une palabras que no deben separarse
  const words = el.textContent.trim().split(/[ \t\n\r]+/);
  el.textContent = '';
  const inners = [];
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    outer.className = 'w';
    outer.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = word;
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    inners.push(inner);
  });
  el.classList.add('is-split');
  return inners;
}
