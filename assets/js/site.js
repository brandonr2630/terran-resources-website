(function () {
  document.documentElement.classList.add('js');

  function initNav() {
    var btn = document.querySelector('button.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
    });
  }

  function initSlider(rootSelector) {
    var root = rootSelector && document.querySelector(rootSelector);
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    var viewport = root.querySelector('.slides');
    if (slides.length < 2 || !viewport) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DELAY = 6000;
    var current = 0, timer = null, userPaused = reduce, hovering = false, focusing = false;

    function btn(cls, label, text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.setAttribute('aria-label', label);
      if (text) b.textContent = text;
      return b;
    }
    var controls = document.createElement('div');
    controls.className = 'slider-controls';
    var prev = btn('prev', 'Previous slide', '\u2039');
    var next = btn('next', 'Next slide', '\u203A');
    var toggle = btn('toggle', 'Pause automatic slide show', 'Pause');
    var dots = slides.map(function (s, i) {
      var d = btn('dot', 'Show slide ' + (i + 1));
      d.addEventListener('click', function () { show(i); });
      return d;
    });
    controls.appendChild(prev);
    dots.forEach(function (d) { controls.appendChild(d); });
    controls.appendChild(next);
    controls.appendChild(toggle);
    root.appendChild(controls);
    if (reduce) { toggle.textContent = 'Play'; toggle.setAttribute('aria-label', 'Start automatic slide show'); }

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === current); });
      dots.forEach(function (d, n) {
        if (n === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    function running() { return !userPaused && !hovering && !focusing; }
    function sync() {
      clearTimeout(timer);
      timer = null;
      viewport.setAttribute('aria-live', running() ? 'off' : 'polite');
      if (running()) timer = setTimeout(function () { show(current + 1); sync(); }, DELAY);
    }
    prev.addEventListener('click', function () { show(current - 1); sync(); });
    next.addEventListener('click', function () { show(current + 1); sync(); });
    dots.forEach(function (d) { d.addEventListener('click', sync); });
    toggle.addEventListener('click', function () {
      userPaused = !userPaused;
      toggle.textContent = userPaused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', userPaused ? 'Start automatic slide show' : 'Pause automatic slide show');
      sync();
    });
    root.addEventListener('mouseenter', function () { hovering = true; sync(); });
    root.addEventListener('mouseleave', function () { hovering = false; sync(); });
    root.addEventListener('focusin', function () { focusing = true; sync(); });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { focusing = false; sync(); }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); sync(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { show(current + 1); sync(); e.preventDefault(); }
    });
    show(0);
    sync();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSlider('#core-values');
  });
})();
