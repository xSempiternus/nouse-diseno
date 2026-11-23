// Formulario de cotización. Si CONTACT.formulario tiene una URL (Formspree, Web3Forms, etc.) envía ahí;
// si no, abre el correo del visitante con los datos ya escritos (funciona sin servidor).
import { CONTACT } from './config.js';

export function initQuote() {
  const form = document.getElementById('cotizar');
  if (!form) return;
  const status = document.getElementById('quote-status');
  const btn = form.querySelector('button[type="submit"]');
  const say = (msg, ok) => { status.textContent = msg; status.dataset.state = ok ? 'ok' : 'err'; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form._gotcha?.value) return;
    const bad = [...form.elements].find((el) => el.required && !String(el.value).trim());
    if (bad) { bad.focus(); return say('Completa los campos obligatorios.', false); }
    if (!form.email.validity.valid) { form.email.focus(); return say('Revisa tu correo.', false); }

    const d = Object.fromEntries(new FormData(form));
    delete d._gotcha;
    const asunto = `Cotización de proyecto — ${d.nombre}`;
    const cuerpo = [`Nombre: ${d.nombre}`, `Correo: ${d.email}`, d.telefono && `Teléfono: ${d.telefono}`, d.empresa && `Empresa: ${d.empresa}`,
      `Tipo: ${d.tipo}`, d.plazo && `Plazo: ${d.plazo}`, '', d.mensaje].filter((x) => x !== false && x !== '' || x === '').join('\n');

    if (!CONTACT.formulario) {
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
      return say('Se abrió tu correo con la cotización lista para enviar.', true);
    }
    btn.disabled = true; say('Enviando…', true);
    try {
      const r = await fetch(CONTACT.formulario, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, _subject: asunto }) });
      if (!r.ok) throw new Error(r.status);
      form.reset(); say('¡Gracias! Recibimos tu solicitud y te respondemos pronto.', true);
    } catch {
      say(`No pudimos enviarlo. Escríbenos a ${CONTACT.email}.`, false);
    } finally { btn.disabled = false; }
  });
}
