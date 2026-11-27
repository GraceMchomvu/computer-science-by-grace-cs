/* Computer Science By Grace.CS — GSAP motion layer (GSAP 3.15, all files bundled locally in assets/vendor/).
   Built from the official GSAP skills guidance (gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-performance):
   - gsap.matchMedia() with desktop / mobile / reduced-motion conditions; heavy effects (pins, horizontal scroll,
     parallax background, magnetic buttons, page-load intro) run on desktop only; nothing runs for reduced motion.
   - transforms + opacity for movement (clip-path only for the wipe reveals, strokes only for the underline draw).
   - timelines + position parameter for sequencing; ScrollTrigger only on top-level tweens/timelines;
     ScrollTrigger.batch for card staggers; triggers created top-to-bottom; no markers.
   Content is visible without JS: the inline head script only adds .motion-pending / .intro-pending when JS runs,
   this file removes them, and a 2.5 s timeout removes them anyway if anything fails to load. */
(function () {
  var root = document.documentElement;
  function unpend() { root.classList.remove('motion-pending'); }
  function endIntro() { root.classList.remove('intro-pending'); }
  if (!window.gsap || !window.ScrollTrigger) { unpend(); endIntro(); return; }

  var hasSplit = !!window.SplitText, hasDraw = !!window.DrawSVGPlugin;
  gsap.registerPlugin.apply(gsap, [ScrollTrigger].concat(hasSplit ? [SplitText] : [], hasDraw ? [DrawSVGPlugin] : []));
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });

  var q = gsap.utils.toArray;
  var isHome = !!document.querySelector('.hero');
  var header = document.querySelector('.site-header');

  function drawFrom(paths) {               // set underline strokes to "not drawn yet"
    if (hasDraw) gsap.set(paths, { drawSVG: '0%' });
    else paths.forEach(function (p) { var l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
  }
  function drawTo(vars) {                  // vars for drawing them in
    return hasDraw ? Object.assign({ drawSVG: '100%' }, vars) : Object.assign({ strokeDashoffset: 0 }, vars);
  }
  function countUp(el, pop) {              // real value comes from data-count (also the no-JS text)
    var end = parseInt(el.getAttribute('data-count'), 10), o = { v: 0 };
    el.textContent = '0';
    var tl = gsap.timeline();
    tl.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); }, onComplete: function () { el.textContent = end; } });
    if (pop) tl.fromTo(el, { scale: 1 }, { scale: 1.22, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1, transformOrigin: '0% 100%' }, '-=0.15');
    return tl;
  }

  var mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (c.reduce) { unpend(); endIntro(); return; }
    root.classList.add('gsap-on');
    var splits = [];

    /* ================= 1. page-load intro (home, desktop, once per session, ~1.1 s) ================= */
    var introDelay = 0;
    if (isHome && c.desktop && root.classList.contains('intro-pending')) {
      var itl = gsap.timeline({ onComplete: endIntro });
      itl.from('.intro-mark img', { scale: 0, rotation: -200, duration: 0.5, ease: 'back.out(2)' })
         .from('.intro-mark span', { x: -24, autoAlpha: 0, duration: 0.3 }, '-=0.2')
         .to('.intro', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.45, ease: 'power4.inOut' }, '+=0.12');
      introDelay = 0.75;
    } else { endIntro(); }

    /* ================= 2. hero ================= */
    var hero = document.querySelector('.hero, .page-hero');
    if (hero) {
      var title = hero.querySelector('h1');
      var paths = q('.mark path', hero);
      drawFrom(paths);
      var tl = gsap.timeline({ delay: introDelay, defaults: { duration: 0.8, ease: 'power3.out' } });
      tl.addLabel('start', 0);

      if (isHome && hasSplit) {
        var st = SplitText.create(title, { type: 'chars', charsClass: 'ch' });
        splits.push(st);
        tl.from(st.chars, { yPercent: 110, rotation: 12, autoAlpha: 0, stagger: 0.028, duration: 0.7, ease: 'back.out(1.7)' }, 'start');
      } else {
        tl.from(q('.w', hero), { yPercent: 60, autoAlpha: 0, rotation: 3, stagger: 0.09, transformOrigin: '0% 100%' }, 'start');
      }
      tl.to(paths, drawTo({ duration: 0.8, ease: 'power2.inOut', stagger: 0.2 }), 'start+=0.55');

      if (isHome) {
        tl.from(['.hero .lead', '.hero-actions > *'], { y: 30, autoAlpha: 0, stagger: 0.08 }, 'start+=0.3')
          .fromTo('.bento-card', { clipPath: 'inset(0% 100% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.9, ease: 'power4.inOut', stagger: 0.15 }, 'start+=0.5')
          .add(q('.bento [data-count]').map(function (el) { return countUp(el, true); }), 'start+=0.8')
          .from('.hero-art', { scale: 0.82, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.3)' }, 'start+=0.1')
          .from('.hero-art .sparkle, .hero-art .doodle, .hero-art .orb, .chip-float', { scale: 0, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'back.out(2.2)' }, 'start+=0.7');
      } else {
        tl.from(q('.page-intro > :not(h1)', hero), { y: 24, autoAlpha: 0, stagger: 0.1 }, 'start+=0.2')
          .from('.page-art', { scale: 0.85, autoAlpha: 0, duration: 1, ease: 'back.out(1.3)' }, 'start+=0.1')
          .from('.toolbar', { y: 20, autoAlpha: 0, duration: 0.6 }, 'start+=0.45');
      }
      unpend();

      /* idle life: floating illustration, orbiting sparkles, twinkling doodles */
      var art = hero.querySelector('.hero-art, .page-art');
      if (art) gsap.to(art.querySelector('img'), { y: -14, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      if (document.querySelector('.orbit')) gsap.to('.orbit', { rotation: 360, duration: 26, ease: 'none', repeat: -1 });
      if (document.querySelector('.chip-float')) gsap.to('.chip-float', { y: 9, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    } else { unpend(); }
    q('.sparkle:not(.orbit .sparkle)').forEach(function (s, i) {
      gsap.to(s, { rotation: i % 2 ? -25 : 25, scale: 1.18, duration: gsap.utils.random(2, 3.4), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: gsap.utils.random(0, 1) });
    });
    q('.orbit .sparkle').forEach(function (s) { gsap.to(s, { rotation: -360, duration: 9, ease: 'none', repeat: -1 }); });
    q('.doodle').forEach(function (d) { gsap.to(d, { y: -8, rotation: 8, duration: gsap.utils.random(2.6, 4), ease: 'sine.inOut', yoyo: true, repeat: -1 }); });

    /* pinned, scroll-scrubbed hero (desktop home) — wrappers/layers only, so it never fights the intro tweens */
    if (isHome && c.desktop) {
      gsap.timeline({
        scrollTrigger: { trigger: '.hero', start: function () { return 'top top+=' + (header ? header.offsetHeight : 0); }, end: '+=65%', pin: true, scrub: 1, anticipatePin: 1 }
      })
        .to('.hero-grid > div:first-child', { y: -50, ease: 'none' }, 0)
        .to('.hero-art .blob', { rotation: 28, scale: 1.12, y: -30, ease: 'none' }, 0)
        .to('.hero-art .sun', { x: 50, y: -110, scale: 1.25, ease: 'none' }, 0)
        .to('.hero-art img', { scale: 1.08, ease: 'none' }, 0)
        .to('.hero-art .orbit', { scale: 1.18, ease: 'none' }, 0);
    }

    /* ================= 3. section headings: masked line reveal + underline draw ================= */
    q('.section-head').forEach(function (head) {
      var h2 = head.querySelector('h2'), p = head.querySelector('p');
      var hp = q('.mark path', head);
      drawFrom(hp);
      var htl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 82%', once: true } });
      if (hasSplit) {
        var sp = SplitText.create(h2, { type: 'lines', linesClass: 'h-line', mask: 'lines' });
        splits.push(sp);
        htl.from(sp.lines, { yPercent: 115, duration: 0.95, ease: 'power4.out', stagger: 0.12 });
      } else {
        htl.from(h2, { y: 40, autoAlpha: 0 });
      }
      htl.to(hp, drawTo({ duration: 0.8, ease: 'power2.inOut' }), '-=0.4');
      if (p) htl.from(p, { y: 24, autoAlpha: 0, duration: 0.7 }, '<');
    });

    /* ================= 4. feature cards ================= */
    if (document.querySelector('.feature')) {
      gsap.set('.feature', { autoAlpha: 0, y: 70, rotation: 2 });
      ScrollTrigger.batch('.feature', { start: 'top 88%', once: true, onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.14, duration: 1, ease: 'power4.out', overwrite: true });
      } });
    }

    /* ================= 5. "Why" mosaic: clip-path wipes + counters that pop ================= */
    var why = document.querySelector('.why-grid');
    if (why) {
      var wtl = gsap.timeline({ scrollTrigger: { trigger: why, start: 'top 78%', once: true } });
      wtl.fromTo('.why-art', { clipPath: 'inset(0% 100% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.1, ease: 'power4.inOut' })
         .from('.why-art img', { scale: 1.3, duration: 1.6, ease: 'power3.out' }, '<0.2')
         .fromTo('.why-grid .tile', { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 0.8, ease: 'power4.inOut', stagger: { each: 0.1, from: 'start' } }, '<0.25')
         .add(q('.why-grid [data-count]').map(function (el) { return countUp(el, true); }), '-=0.35');
    }

    /* ================= 6. levels: horizontal pinned scroll on desktop ================= */
    var hs = document.querySelector('.hs');
    if (hs && c.desktop) {
      root.classList.add('hs-on');
      var track = hs.querySelector('.hs-track'), wrap = hs.querySelector('.hs-wrap');
      var dist = function () { return Math.max(0, track.scrollWidth - document.documentElement.clientWidth + parseFloat(getComputedStyle(wrap).paddingLeft) + 48); };
      var hTween = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      q('.level', hs).forEach(function (card) {
        gsap.from(card, { rotation: 5, yPercent: 10, scale: 0.88, autoAlpha: 0.35, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left 100%', end: 'left 60%', scrub: true } });
        gsap.fromTo(card.querySelector('.art img'), { x: -30, rotation: -1.5 }, { x: 30, rotation: 1.5, ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
      });
    } else if (hs) {
      gsap.set('.level', { autoAlpha: 0, y: 60 });
      ScrollTrigger.batch('.level', { start: 'top 90%', once: true, onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, overwrite: true });
      } });
    }

    /* ================= 7. tips + useful content ================= */
    ['.tip', '.ucard'].forEach(function (sel) {
      if (!document.querySelector(sel)) return;
      gsap.set(sel, { autoAlpha: 0, y: 60 });
      ScrollTrigger.batch(sel, { start: 'top 90%', once: true, onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'power4.out', overwrite: true });
      } });
    });
    q('.ucard .img').forEach(function (box) {
      gsap.fromTo(box, { clipPath: 'inset(0% 0% 100% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1, ease: 'power4.inOut',
        scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
      if (c.desktop) gsap.fromTo(box.querySelector('img'), { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* ================= 8. CTA panel scales in ================= */
    var cta = document.querySelector('[data-cta]');
    if (cta) {
      gsap.timeline({ scrollTrigger: { trigger: cta, start: 'top 85%', once: true } })
        .from(cta, { scale: 0.86, autoAlpha: 0, y: 60, duration: 1, ease: 'power4.out' })
        .from(q('img, .eyebrow, h2, p, .btn', cta), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, '-=0.5')
        .from(cta.querySelector('.burst'), { rotation: -120, scale: 0.3, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.8)' }, '<');
      gsap.to(cta.querySelector('.ring'), { rotation: 360, duration: 40, ease: 'none', repeat: -1 });
    }

    /* ================= 9. level pages: light entrances only (keeps search/filter fast) ================= */
    var fileCards = q('.card');
    if (fileCards.length) {
      var fileTriggers;
      gsap.set(fileCards, { autoAlpha: 0, y: 24 });
      fileTriggers = ScrollTrigger.batch(fileCards, { start: 'top 95%', once: true, interval: 0.08, batchMax: 6, onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.5, overwrite: true });
      } });
      q('.topic h2 .tn').forEach(function (tn) {
        gsap.from(tn, { scale: 0.3, rotation: -25, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.2)', scrollTrigger: { trigger: tn, start: 'top 92%', once: true } });
      });
      var onFilter = function () {          // first search/filter: show every card instantly, drop entrance triggers
        if (!fileTriggers) return;
        fileTriggers.forEach(function (t) { t.kill(); });
        fileTriggers = null;
        gsap.set(fileCards, { autoAlpha: 1, y: 0, overwrite: true });
        ScrollTrigger.refresh();
      };
      document.addEventListener('cs:filter', onFilter);
    }

    /* ================= 10. hover lifts + magnetic buttons ================= */
    if (document.querySelector('.plan-card')) {
      gsap.set('.plan-card', { autoAlpha: 0, y: 56, rotation: 1.2 });
      ScrollTrigger.batch('.plan-card', { start: 'top 90%', once: true, onEnter: function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.12, duration: 0.95, ease: 'power4.out', overwrite: true });
      } });
      var badge = document.querySelector('.plan-card.popular .plan-badge');
      if (badge) gsap.from(badge, { scale: 0, rotation: -12, duration: 0.55, ease: 'back.out(2.2)', delay: 0.35 });
    }

    q('.level, .feature, .tip, .tile, .bento-card, .card, .ucard, .plan-card').forEach(function (el) {
      if (c.desktop && el.classList.contains('level') && root.classList.contains('hs-on')) return; // scroll owns these
      var lift = el.classList.contains('card') ? -4 : -7;
      var img = el.querySelector('.ucard .img img, .art img');
      el.addEventListener('mouseenter', function () { gsap.to(el, { y: lift, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }); if (img && el.classList.contains('ucard')) gsap.to(img, { scale: 1.07, duration: 0.4, overwrite: 'auto' }); });
      el.addEventListener('mouseleave', function () { gsap.to(el, { y: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' }); if (img && el.classList.contains('ucard')) gsap.to(img, { scale: 1, duration: 0.4, overwrite: 'auto' }); });
    });
    if (c.desktop && window.matchMedia('(pointer: fine)').matches) {
      q('.btn-cta, .arrow-tile, .header-cta, .wa-float').forEach(function (b) {
        var xTo = gsap.quickTo(b, 'x', { duration: 0.45, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.45, ease: 'power3' });
        var strength = b.classList.contains('arrow-tile') ? 0.4 : 0.3;
        b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * strength); yTo((e.clientY - r.top - r.height / 2) * strength); });
        b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
    }

    /* ================= 11. floating code/binary background parallax (desktop home) ================= */
    if (isHome && c.desktop) {
      q('.bg-code .cb').forEach(function (cb) {
        var sp = parseFloat(cb.getAttribute('data-speed')) || 0.5;
        gsap.to(cb, { y: -sp * 600, rotation: gsap.utils.random(-30, 30), ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 } });
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });

    return function () {
      splits.forEach(function (s) { s.revert(); });
      root.classList.remove('gsap-on', 'hs-on');
    };
  });
})();
