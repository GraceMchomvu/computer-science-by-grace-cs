/* Light / dark theme toggle. The chosen mode is applied in <head> before paint;
   this file only wires the buttons and keeps labels in sync. */
(function () {
  var KEY = 'gcs-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme, save) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    if (save) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121027' : '#3d348b');
    var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  apply(current(), false);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    apply(current() === 'dark' ? 'light' : 'dark', true);
  });

  try {
    if (!localStorage.getItem(KEY) && window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light', false);
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  } catch (e) {}
})();
