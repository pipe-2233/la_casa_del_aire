(function () {
  try {
    if (document.getElementById('om-veil-css')) return;   // no inyectar dos veces

    var css = document.createElement('style');
    css.id = 'om-veil-css';
    css.textContent = '[data-page]{opacity:0}';
    document.head.appendChild(css);

    // Red de seguridad: se arma SIEMPRE, antes de cualquier salida anticipada.
    setTimeout(function () {
      var a = document.getElementById('om-veil'); if (a) a.remove();
      var b = document.getElementById('om-curtain'); if (b) b.remove();
      document.querySelectorAll('#om-veil-css').forEach(function (e) { e.remove(); });
      try { sessionStorage.removeItem('om-curtain'); } catch (e) {}
    }, 4200);

    var offset = function (dir) {
      if (dir === 'left') return 'translate3d(-100%,0,0)';
      if (dir === 'right') return 'translate3d(100%,0,0)';
      if (dir === 'up') return 'translate3d(0,-100%,0)';
      return 'translate3d(0,100%,0)';
    };

    var mount = function (el) {
      if (document.getElementById('om-curtain') || document.getElementById('om-veil')) return;
      if (document.body) document.body.appendChild(el);
      else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });
    };

    var pending = null;
    try { pending = sessionStorage.getItem('om-curtain'); } catch (e) {}

    if (pending) {                       // llegada por navegación interna: el telón ya cubre
      var c = document.createElement('div');
      c.id = 'om-curtain';
      c.setAttribute('data-dir', pending);
      c.style.cssText = 'position:fixed;inset:0;z-index:320;background:#dfe5ec;display:grid;place-items:center;will-change:transform';
      var cm = document.createElement('img');
      cm.src = 'assets/logo-casa-del-gas.png';
      cm.alt = '';
      cm.style.cssText = 'width:64px;height:64px;object-fit:contain;opacity:.55';
      c.appendChild(cm);
      mount(c);
      return;
    }

    var nav = performance.getEntriesByType('navigation')[0];
    var reload = nav ? nav.type === 'reload' : false;
    var internal = !!document.referrer && document.referrer.indexOf(location.host) > -1;
    if (!(reload || !internal)) return;  // fundido simple

    var v = document.createElement('div');
    v.id = 'om-veil';
    v.style.cssText = 'position:fixed;inset:0;z-index:330;background:#e9edf2;display:grid;place-items:center';
    var logo = document.createElement('img');
    logo.src = 'assets/logo-casa-del-gas.png';
    logo.alt = '';
    logo.style.cssText = 'width:clamp(96px,18vw,160px);height:auto;object-fit:contain;opacity:0;transition:opacity .5s ease;will-change:transform,opacity';
    v.appendChild(logo);
    mount(v);
    requestAnimationFrame(function () { logo.style.opacity = '1'; });
  } catch (e) {
    document.querySelectorAll('#om-veil-css').forEach(function (el) { el.remove(); });
  }
})();
