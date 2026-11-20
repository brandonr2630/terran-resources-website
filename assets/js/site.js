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

  // Filled in by the home page task.
  function initSlider(rootSelector) {
    var el = rootSelector && document.querySelector(rootSelector);
    if (!el) return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initSlider('#core-values');
  });
})();
