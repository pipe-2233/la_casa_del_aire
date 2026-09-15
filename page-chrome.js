// Intro del logo (recarga / primera visita) + telón al cambiar de página.
// El velo/telón se monta desde boot-intro.js antes de pintar; aquí sólo se anima.
const ease = p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const DIRS = ['left', 'right', 'up', 'down'];

function anim(dur, step) {
  return new Promise(res => {
    let started = false;
    const t0 = performance.now();
    const watchdog = setTimeout(() => { if (!started) { step(1); res(); } }, 320);
    const frame = t => {
      started = true;
      clearTimeout(watchdog);
      const p = Math.min(1, (t - t0) / dur);
      step(ease(p));
      if (p < 1) requestAnimationFrame(frame); else res();
    };
    requestAnimationFrame(frame);
  });
}

const slide = (dir, k) => {
  const v = (k * 100).toFixed(2) + '%';
  if (dir === 'left') return 'translate3d(-' + v + ',0,0)';
  if (dir === 'right') return 'translate3d(' + v + ',0,0)';
  if (dir === 'up') return 'translate3d(0,-' + v + ',0)';
  return 'translate3d(0,' + v + ',0)';
};

const waitFor = async (sel, ms = 1400) => {
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    const el = document.querySelector(sel);
    if (el && el.getBoundingClientRect().width > 4) return el;
    await new Promise(r => setTimeout(r, 60));
  }
  return document.querySelector(sel);
};

export function initPageChrome() {
  const content = document.querySelector('[data-page]');
  if (!content) return;
  let headerLogo = document.querySelector('[data-logo]');
  const veil = document.getElementById('om-veil');
  const curtain = document.getElementById('om-curtain');

  const dropGuard = () => document.querySelectorAll('#om-veil-css').forEach(e => e.remove());
  const showContent = () => {
    dropGuard();
    content.style.opacity = '1';
    content.style.transform = 'none';
    if (headerLogo) headerLogo.style.visibility = 'visible';
  };
  const cleanup = () => {
    const a = document.getElementById('om-veil'); if (a) a.remove();
    const b = document.getElementById('om-curtain'); if (b) b.remove();
    showContent();
  };

  const run = async () => {
    try {
      if (curtain) {                                  // el telón se recoge
        try { sessionStorage.removeItem('om-curtain'); } catch (e) {}
        showContent();
        const dir = curtain.getAttribute('data-dir') || 'left';
        await anim(460, p => curtain.style.transform = slide(dir, p));
        curtain.remove();
        return;
      }

      if (!veil) {                                    // fundido simple
        showContent();
        content.style.opacity = '0';
        content.style.transform = 'translateY(10px)';
        await anim(300, p => {
          content.style.opacity = String(p);
          content.style.transform = 'translateY(' + (10 * (1 - p)).toFixed(2) + 'px)';
        });
        showContent();
        return;
      }

      const mark = veil.querySelector('img');         // intro del logo
      headerLogo = await waitFor('[data-logo]');       // el menú es un componente aparte
      if (headerLogo) headerLogo.style.visibility = 'hidden';
      await new Promise(r => setTimeout(r, 480));

      let dx = 0, dy = 0, sc = 0.3;
      if (headerLogo && mark) {
        const a = mark.getBoundingClientRect();
        const b = headerLogo.getBoundingClientRect();
        dx = (b.left + b.width / 2) - (a.left + a.width / 2);
        dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        sc = b.width / a.width;
      }
      dropGuard();
      content.style.opacity = '0';
      await anim(820, p => {
        if (mark) mark.style.transform = 'translate(' + (dx * p).toFixed(2) + 'px,' + (dy * p).toFixed(2) + 'px) scale(' + (1 + (sc - 1) * p).toFixed(4) + ')';
        veil.style.background = 'rgba(233,237,242,' + (1 - Math.max(0, (p - 0.4) / 0.6)).toFixed(3) + ')';
        content.style.opacity = Math.max(0, (p - 0.25) / 0.75).toFixed(3);
      });
      if (headerLogo) headerLogo.style.visibility = 'visible';
      if (mark) await anim(180, p => mark.style.opacity = String(1 - p));
      cleanup();
    } catch (e) { cleanup(); }
  };

  setTimeout(cleanup, 3600);
  run();

  // telón al navegar: entra por una dirección al azar, sale por otra distinta
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    let url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();

    const outDir = DIRS[Math.floor(Math.random() * DIRS.length)];
    const rest = DIRS.filter(d => d !== outDir);
    const inDir = rest[Math.floor(Math.random() * rest.length)];
    try { sessionStorage.setItem('om-curtain', inDir); } catch (err) {}

    const panel = document.createElement('div');
    panel.id = 'om-curtain-out';
    panel.style.cssText = 'position:fixed;inset:0;z-index:320;background:#dfe5ec;display:grid;place-items:center;will-change:transform;transform:' + slide(outDir, 1);
    const mark = document.createElement('img');
    mark.src = 'assets/logo-casa-del-gas.png';
    mark.alt = '';
    mark.style.cssText = 'width:64px;height:64px;object-fit:contain;opacity:.55';
    panel.appendChild(mark);
    document.body.appendChild(panel);

    let done = false;
    const go = () => { if (!done) { done = true; location.href = url.href; } };
    setTimeout(go, 620);
    anim(400, p => panel.style.transform = slide(outDir, 1 - p)).then(go);
  });
}
