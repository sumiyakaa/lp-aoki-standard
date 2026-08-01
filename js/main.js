/*
 * main.js — the behaviour every page shares.
 *
 * Two things live here, and deliberately nothing else:
 *
 *   1. Rail controls. base.css draws the 2px progress track and the pair of
 *      54φ buttons; this drives them. The rails are native horizontal
 *      scrollers with snap points, so without JavaScript they still work —
 *      you just lose the buttons and the fill stops tracking.
 *
 *   2. The header's hide-on-scroll. The anchor carries `data-visible` and
 *      `data-scroll` on its <header> and styles off those attributes rather
 *      than toggling classes; base.css does the same.
 *
 * What used to be here and is gone: the YouTube mount (the hero is a masked
 * <video> now) and the opening curtain (the site opens on the key visual).
 * Also gone is a scroll "fix" that cancelled wheel events and re-drove the
 * page with window.scrollBy() — its underlying cause, `overflow-x:hidden`
 * promoting overflow-y to `auto`, is handled in CSS with `overflow-x:clip`,
 * so nothing needs to police the scroll at runtime.
 *
 * Scroll reveals are js/reveal.js, not this file.
 */
(function () {
  'use strict';

  var IS_SHOT = location.search.indexOf('shot=') !== -1;

  /* ------------------------------------------------------------------ *
   * Rails
   * ------------------------------------------------------------------ */
  function initRails() {
    var blocks = document.querySelectorAll('[data-rail]');
    if (!blocks.length) return;

    Array.prototype.forEach.call(blocks, function (block) {
      var track = block.querySelector('[data-rail-track]');
      if (!track) return;

      var fill = block.querySelector('[data-rail-fill]');
      var prev = block.querySelector('[data-rail-prev]');
      var next = block.querySelector('[data-rail-next]');

      /* One click moves by as many whole slides as are currently on screen. */
      function step() {
        var first = track.firstElementChild;
        if (!first) return track.clientWidth;
        var w = first.getBoundingClientRect().width;
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return (w + gap) * Math.max(1, Math.floor(track.clientWidth / (w + gap)));
      }

      /* The fill is a scrollbar thumb: its length is the visible fraction,
         its offset is how far through the track you are. */
      function sync() {
        var max = track.scrollWidth - track.clientWidth;
        var ratio = max > 4 ? track.scrollLeft / max : 0;

        if (fill) {
          var span = Math.min(100, track.clientWidth / track.scrollWidth * 100);
          fill.style.width = span.toFixed(2) + '%';
          fill.style.marginLeft = ((100 - span) * ratio).toFixed(2) + '%';
        }
        if (prev) prev.setAttribute('aria-disabled', ratio <= 0.01 ? 'true' : 'false');
        if (next) next.setAttribute('aria-disabled', max <= 4 || ratio >= 0.99 ? 'true' : 'false');
      }

      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left:  step(), behavior: 'smooth' }); });

      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  }

  /* ------------------------------------------------------------------ *
   * Header
   *
   * Hides going down, returns going up. The threshold is the header's own
   * height, so it never hides while the key visual is still at the top, and
   * a few pixels of scroll jitter cannot flicker it. Left alone in shot mode
   * so full-page captures always include it.
   * ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header || IS_SHOT) return;

    var HEIGHT = 130;
    var DEADZONE = 6;
    var last = window.pageYOffset;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset;
      var delta = y - last;

      header.setAttribute('data-scroll', y > 4 ? 'true' : 'false');

      if (Math.abs(delta) < DEADZONE) return;
      header.setAttribute('data-visible', (delta < 0 || y <= HEIGHT) ? 'true' : 'false');
      last = y;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------ *
   * Menu
   *
   * The button existed from the start, announced `aria-controls="site-menu"`
   * and `aria-expanded="false"`, and did nothing — there was no `#site-menu`
   * anywhere in the markup and no handler. Below 1024px base.css also hides
   * the inline links, so on a phone the header offered no way off the page
   * at all, while telling assistive technology there was a menu to open.
   * ------------------------------------------------------------------ */
  function initMenu() {
    var button = document.querySelector('.menu-button');
    var panel = document.getElementById('site-menu');
    if (!button || !panel) return;

    function setOpen(open) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    }

    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    /* Taking a link closes it, so coming back does not land on an open panel. */
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (button.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      button.focus();
    });

    /* Widening past the breakpoint brings the inline links back; leaving the
       panel open on top of them would show the same three links twice. */
    var wide = window.matchMedia('(min-width: 1025px)');
    var onWide = function () { if (wide.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);

    setOpen(false);
  }

  /* ------------------------------------------------------------------ *
   * Hero intro
   *
   * Flips `data-intro` on any element that declares it, which starts the
   * choreography css/motion.css describes. It waits for fonts, because the
   * largest thing in the feature page's first view is a glyph — start before
   * it resolves and the opening plays against a fallback face, then jumps.
   * A 900ms cap keeps a slow font from holding the page hostage.
   * ------------------------------------------------------------------ */
  function initIntro() {
    var hosts = document.querySelectorAll('[data-intro]');
    if (!hosts.length || IS_SHOT) return;

    var fired = false;
    function play() {
      if (fired) return;
      fired = true;
      Array.prototype.forEach.call(hosts, function (el) {
        el.setAttribute('data-intro', 'ready');
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(play).catch(play);
    }
    setTimeout(play, 900);
  }

  function start() {
    initRails();
    initHeader();
    initMenu();
    initIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
