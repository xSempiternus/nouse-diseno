// Escena 2: ampolleta de Zitta Producciones, fija y minimalista.
// Solo expone el progreso del scroll como --p (0..1); el CSS hace escala,
// halo y aparición del texto. Sin WebGL.
export function initZoom({ ScrollTrigger }) {
  const section = document.getElementById('escena');
  if (!section) return;
  ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => section.style.setProperty('--p', st.progress.toFixed(4)),
  });
}
