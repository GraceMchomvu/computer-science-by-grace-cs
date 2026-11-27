/* On-site reader for Grace.CS notes and slides. Pages are painted onto canvas
   (no <img> tags) and common save/print/copy shortcuts are blocked. This is
   a deterrent, not a guarantee — screenshots still work on the device itself. */
(function () {
  var CATALOG_URL = 'assets/reader/catalog.json';
  var PAGE_DIR = 'assets/reader/p/';
  var ORIGIN = 'https://gracemchomvu.github.io/computer-science-by-grace-cs';

  /* Old bookmarks for notes that were later merged into a fuller document. */
  var DOC_ALIASES = { dfe75ce5d568: 'f7b82d40fbd4' };

  var params = new URLSearchParams(location.search);
  var docId = (params.get('doc') || '').replace(/[^a-f0-9]/gi, '').slice(0, 12);
  if (DOC_ALIASES[docId]) {
    docId = DOC_ALIASES[docId];
    try {
      params.set('doc', docId);
      history.replaceState(null, '', location.pathname + '?' + params.toString() + location.hash);
    } catch (e) {}
  }

  var titleEl = document.getElementById('reader-title');
  var kickerEl = document.getElementById('reader-kicker');
  var countEl = document.getElementById('reader-count');
  var pagesEl = document.getElementById('reader-pages');
  var errorEl = document.getElementById('reader-error');
  var backEl = document.getElementById('reader-back');
  var ctaEl = document.getElementById('reader-cta');
  var zoomLabel = document.getElementById('zoom-label');
  var toolsEl = document.querySelector('.reader-tools');
  var noteEl = document.querySelector('.reader-note');

  function setMeta(sel, attr, value) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, value);
  }

  function showError() {
    if (titleEl) titleEl.textContent = 'Notes not found';
    if (kickerEl) kickerEl.textContent = '';
    if (pagesEl) pagesEl.hidden = true;
    if (toolsEl) toolsEl.hidden = true;
    if (noteEl) noteEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    document.title = 'Notes not found – Computer Science By Grace.CS';
    setMeta('meta[name="robots"]', 'content', 'noindex');
  }

  function guard() {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.addEventListener('copy', function (e) { e.preventDefault(); });
    document.addEventListener('cut', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p' || k === 'c' || k === 'u' || k === 'a')) {
        e.preventDefault();
      }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'PrintScreen' || e.key === 'Print') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(function () {});
        }
      }
    });
  }

  guard();

  if (!docId || !pagesEl) { showError(); return; }

  var zoom = 1;
  function applyZoom() {
    pagesEl.style.setProperty('--zoom', String(zoom));
    if (zoomLabel) zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }
  applyZoom();
  var zin = document.getElementById('zoom-in');
  var zout = document.getElementById('zoom-out');
  if (zin) zin.addEventListener('click', function () { zoom = Math.min(1.75, Math.round((zoom + 0.15) * 100) / 100); applyZoom(); });
  if (zout) zout.addEventListener('click', function () { zoom = Math.max(0.7, Math.round((zoom - 0.15) * 100) / 100); applyZoom(); });

  function paintCanvas(canvas, src, w, h) {
    var img = new Image();
    img.onload = function () {
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      canvas.parentNode.classList.add('ready');
    };
    img.onerror = function () { canvas.parentNode.classList.add('failed'); };
    img.src = src;
  }

  fetch(CATALOG_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('catalog'); return r.json(); })
    .then(function (cat) {
      var doc = cat.docs && cat.docs[docId];
      if (!doc) { showError(); return; }

      var title = doc.title || 'Notes';
      var type = doc.type || 'Notes';
      var level = doc.levelLabel || '';
      var back = (doc.level || 'index') + '.html';
      var n = (doc.pages || []).length;
      var canonical = ORIGIN + '/reader.html?doc=' + docId;
      var desc = type + ' for ' + (doc.topic || 'Computer Science') + ' — read online at Computer Science By Grace.CS.';

      document.title = title + ' – Computer Science By Grace.CS';
      if (titleEl) titleEl.textContent = title;
      if (kickerEl) kickerEl.textContent = [level, type, doc.topic].filter(Boolean).join(' · ');
      if (backEl) {
        backEl.href = back;
        backEl.textContent = '← Back to ' + (level || 'materials');
      }
      if (ctaEl) { ctaEl.href = back; ctaEl.textContent = 'Browse ' + (level || 'materials'); }
      setMeta('link[rel="canonical"]', 'href', canonical);
      setMeta('meta[name="description"]', 'content', desc);
      setMeta('meta[property="og:title"]', 'content', document.title);
      setMeta('meta[property="og:description"]', 'content', desc);
      setMeta('meta[property="og:url"]', 'content', canonical);
      setMeta('meta[name="twitter:title"]', 'content', document.title);
      setMeta('meta[name="twitter:description"]', 'content', desc);
      if (countEl) countEl.textContent = 'Page 1 of ' + n;

      var sheets = [];
      doc.pages.forEach(function (file, i) {
        var w = doc.widths[i] || 1400;
        var h = doc.heights[i] || 1980;
        var sheet = document.createElement('figure');
        sheet.className = 'reader-sheet';
        sheet.style.aspectRatio = w + ' / ' + h;
        sheet.setAttribute('data-page', String(i + 1));
        sheet.setAttribute('aria-label', 'Page ' + (i + 1) + ' of ' + n);
        var canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        canvas.width = w;
        canvas.height = h;
        var cover = document.createElement('div');
        cover.className = 'reader-cover';
        cover.setAttribute('aria-hidden', 'true');
        sheet.appendChild(canvas);
        sheet.appendChild(cover);
        pagesEl.appendChild(sheet);
        sheets.push({ el: sheet, canvas: canvas, src: PAGE_DIR + file, w: w, h: h, painted: false });
      });

      var loadObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var item = sheets[parseInt(en.target.getAttribute('data-page'), 10) - 1];
          if (item && !item.painted) {
            item.painted = true;
            paintCanvas(item.canvas, item.src, item.w, item.h);
          }
        });
      }, { rootMargin: '800px 0px' });
      sheets.forEach(function (s) { loadObs.observe(s.el); });

      var current = 1;
      function setCurrent(p) {
        if (p === current) return;
        current = p;
        if (countEl) countEl.textContent = 'Page ' + current + ' of ' + n;
      }
      var pageObs = new IntersectionObserver(function (entries) {
        var best = null;
        entries.forEach(function (en) {
          if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
        });
        if (best) setCurrent(parseInt(best.target.getAttribute('data-page'), 10));
      }, { threshold: [0.3, 0.5, 0.7] });
      sheets.forEach(function (s) { pageObs.observe(s.el); });

      if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.from('.reader-heading, .reader-tools', { y: 16, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 });
        gsap.from('.reader-sheet', { y: 24, opacity: 0, duration: 0.55, ease: 'power2.out', stagger: 0.06, delay: 0.1 });
      }
    })
    .catch(function () { showError(); });
})();
