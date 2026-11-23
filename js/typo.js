// Evita palabras viudas: une con &nbsp; las dos últimas palabras del último texto de un elemento.
export function nbspLast(text) {
  return text.replace(/(\S)\s+(\S+\s*)$/, '$1 $2');
}

export function tidy(root = document, selector = 'p, li, .card__title, .area__desc, h3') {
  root.querySelectorAll(selector).forEach((el) => {
    if (el.hasAttribute('data-split') || el.closest('[data-split]')) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
    if (last) last.nodeValue = nbspLast(last.nodeValue);
  });
}
