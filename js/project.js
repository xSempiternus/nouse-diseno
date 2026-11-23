// Página de proyecto: año del pie y lightbox simple (mejora progresiva; sin JS los enlaces abren la imagen).
(function () {
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  var dlg = document.getElementById('lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var img = document.createElement('img'); img.id = 'lb-img';
  var count = document.getElementById('lb-count');
  var idx = 0, opener = null;
  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx], t = a.querySelector('img');
    img.src = a.href; img.alt = t.alt; img.width = t.width; img.height = t.height;
    count.textContent = (idx + 1) + ' / ' + links.length;
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault(); opener = a; if (!img.parentNode) dlg.appendChild(img); show(i); dlg.showModal();
      document.getElementById('lb-close').focus();
    });
  });
  document.getElementById('lb-prev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(idx + 1); });
  document.getElementById('lb-close').addEventListener('click', function (e) { e.preventDefault(); dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  dlg.addEventListener('close', function () { if (opener) opener.focus({ preventScroll: true }); });
})();
