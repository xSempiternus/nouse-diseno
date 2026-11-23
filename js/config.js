// Generado por tools/build.mjs desde content/sitio.json. Para cambiar el contacto edita ese archivo.
// Si un campo es null, el sitio no lo muestra.
export const CONTACT = {
  nombre: 'Cristian Richardson',
  email: 'hola@ndsno.cl',
  telefono: '+56 9 7740 0404',
  whatsapp: '56977400404',   // solo dígitos con código país
  instagram: null,           // usuario sin @; null = oculto
  formulario: null,         // URL del servicio de formularios; null = abre el correo
};

// Enlaces derivados (los usan el index, el menú y las páginas de proyecto).
const digits = (s) => String(s).replace(/[^\d+]/g, '');
export function contactLinks(c = CONTACT) {
  return {
    mail: c.email ? `mailto:${c.email}?subject=${encodeURIComponent('Cotización de proyecto')}` : null,
    wa: c.whatsapp ? `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Hola, quisiera cotizar un proyecto')}` : null,
    tel: c.telefono ? `tel:${digits(c.telefono)}` : null,
    ig: c.instagram ? `https://instagram.com/${c.instagram}` : null,
  };
}
