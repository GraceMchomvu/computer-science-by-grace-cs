(function () {
  // header border on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // search / filter on level pages
  var q = document.getElementById('q'), type = document.getElementById('type'),
      ms = document.getElementById('ms'), count = document.getElementById('count'),
      empty = document.getElementById('empty');
  if (!q) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.topic'));
  var params = new URLSearchParams(location.search);
  if (params.get('q')) q.value = params.get('q');
  if (params.get('type') && type.querySelector('option[value="' + params.get('type') + '"]')) type.value = params.get('type');
  if (params.get('ms') === '0') ms.checked = false;
  function apply() {
    var words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var t = type.value, showMs = ms.checked, shown = 0;
    cards.forEach(function (c) {
      var types = ' ' + c.dataset.types + ' ', text = c.dataset.search;
      var ok = words.every(function (w) { return text.indexOf(w) !== -1; });
      if (t && types.indexOf(' ' + t + ' ') === -1) ok = false;
      if (!showMs && types.indexOf(' ms ') !== -1) ok = false;
      c.hidden = !ok; if (ok) shown++;
    });
    sections.forEach(function (s) {
      var vis = s.querySelectorAll('.card:not([hidden])').length;
      s.hidden = vis === 0;
      var link = document.querySelector('.toc a[href="#' + s.id + '"]');
      if (link) link.parentNode.hidden = vis === 0;
    });
    count.textContent = shown + ' of ' + cards.length + ' files';
    empty.hidden = shown !== 0;
    document.dispatchEvent(new CustomEvent('cs:filter'));
  }
  var timer;
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 80); });
  type.addEventListener('change', apply);
  ms.addEventListener('change', apply);
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
  });
  apply();
})();
