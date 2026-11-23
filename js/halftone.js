// Fondo generativo de la portada: un campo de semitono (puntos de imprenta)
// que respira con un ruido barato de senos y reacciona al puntero.
// Se pausa fuera de pantalla y con la pestaña oculta; con movimiento
// reducido dibuja un solo cuadro estático.

const GREEN = [47, 226, 122];

export function initHalftone(canvas, { reduced = false } = {}) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d', { alpha: false });
  let w = 0, h = 0, dpr = 1, step = 14, cols = 0, rows = 0;
  let raf = 0, running = false, visible = true, last = 0;
  const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };
  const t0 = performance.now();

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    step = w < 600 ? 12 : 15;
    cols = Math.ceil(w / step) + 1; rows = Math.ceil(h / step) + 1;
    draw(performance.now());
  }

  // valor 0..1 del campo en (x,y,t)
  function field(x, y, t) {
    const nx = x / w, ny = y / h;
    let v = Math.sin(nx * 6.2 + t * 0.35) * 0.5
          + Math.sin(ny * 7.4 - t * 0.27 + nx * 2.1) * 0.35
          + Math.sin((nx + ny) * 11.0 + t * 0.6) * 0.15;
    v = v * 0.5 + 0.5;
    // banda diagonal más densa, como una barrida de escáner
    const band = Math.sin((nx * 0.8 - ny * 0.6) * Math.PI * 2 - t * 0.22);
    v *= 0.55 + 0.45 * Math.max(0, band);
    // influencia del puntero
    const dx = x - pointer.x, dy = y - pointer.y;
    const d2 = dx * dx + dy * dy, R = 180;
    if (d2 < R * R) v = Math.min(1, v + (1 - Math.sqrt(d2) / R) * 0.65);
    return v;
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    const maxR = step * 0.42;
    // 3 capas de opacidad para dar profundidad sin coste de color por punto
    const buckets = [[], [], []];
    for (let j = 0; j < rows; j++) {
      const y = j * step + ((j & 1) ? 0 : 0);
      for (let i = 0; i < cols; i++) {
        const x = i * step + ((j & 1) ? step / 2 : 0);
        const v = field(x, y, t);
        if (v < 0.12) continue;
        const r = maxR * v;
        buckets[v > 0.66 ? 2 : v > 0.38 ? 1 : 0].push(x, y, r);
      }
    }
    const alphas = [0.28, 0.5, 0.85];
    for (let b = 0; b < 3; b++) {
      const arr = buckets[b];
      ctx.fillStyle = `rgba(${GREEN[0]},${GREEN[1]},${GREEN[2]},${alphas[b]})`;
      ctx.beginPath();
      for (let k = 0; k < arr.length; k += 3) {
        ctx.moveTo(arr[k] + arr[k + 2], arr[k + 1]);
        ctx.arc(arr[k], arr[k + 1], arr[k + 2], 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps es suficiente para un fondo
    last = now;
    draw(now);
  }
  function start() { if (reduced || running || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top;
    if (pointer.x < -1e3) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
  };
  const onLeave = () => { pointer.tx = pointer.ty = -1e4; };
  if (!reduced) {
    canvas.parentElement.addEventListener('pointermove', onMove, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', onLeave);
  }

  let rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 120); };
  window.addEventListener('resize', onResize);
  resize();
  start();

  return () => {
    stop(); io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('resize', onResize);
  };
}
