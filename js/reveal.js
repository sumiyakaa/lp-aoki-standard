/*
 * reveal.js — the single scroll-reveal engine for the whole site.
 *
 * Carried over from the previous build, where it replaced five near-identical
 * IntersectionObserver files that each had their own trigger geometry. Two
 * things were wrong with those and stay fixed here:
 *
 *   1. Trigger line. They used `rootMargin: 0px 0px -10% 0px`, firing the
 *      moment an element's top edge crossed 90% of the viewport height. On
 *      1250px-tall images that meant the animation finished while the image
 *      was still ~93% below the fold — you never saw it happen. The line is
 *      at 82%, and durations are long, so an element is still settling as it
 *      rises into reading position.
 *
 *   2. Borrowed geometry. Product copy was revealed by whichever image layer
 *      happened to intersect, so it animated 200–280px *below* the bottom of
 *      the screen and was simply "already there" once scrolled to. Every
 *      element is observed on its own box.
 *
 * One change for the four-page build: targets are declared in the markup as
 * `data-reveal`, not as a hard-coded selector list. The old list had to be
 * kept in sync by hand with the `html.is-shot` rules in css/motion.css, and
 * had already drifted — the SP-only overlay was in one and not the other, so
 * headless QC at phone widths photographed it as blank. There is now one
 * source of truth, and css/page-*.css can add revealing elements without
 * touching this file.
 *
 * Stagger and easing are not set here — they live in css/motion.css as
 * `--reveal-delay`, so the choreography is readable in one place.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* Screenshot / QC mode: ?shot=1 pins everything to its end state.
     css/motion.css does the pinning in a single rule keyed off this class. */
  if (location.search.indexOf('shot=') !== -1) {
    root.classList.add('is-shot');
    return;
  }

  /* Fraction of the viewport an element's top must reach before it reveals.
     0.82 = "the element is entering the lower quarter of the screen". */
  var TRIGGER = 0.82;

  var TARGETS = '[data-reveal]';

  function reveal(el) {
    if (el && !el.classList.contains('is-revealed')) {
      el.classList.add('is-revealed');
    }
  }

  function start() {
    var targets = [].slice.call(document.querySelectorAll(TARGETS));
    if (!targets.length) return;

    /* No IntersectionObserver (very old engines): show everything. */
    if (!('IntersectionObserver' in window)) {
      targets.forEach(reveal);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          reveal(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -' + Math.round((1 - TRIGGER) * 100) + '% 0px'
      }
    );

    /* Elements hidden by a media query (e.g. an SP-only overlay on desktop)
       have no box, so they can never intersect. Settle them so they are
       correct the moment a resize brings them in.

       This runs again on load and on resize, and that repeat is not belt and
       braces. Whether an element has a box at the moment `start()` runs is
       engine-dependent: measured on WebKit, up to twelve elements per page
       were observed rather than settled — they had boxes then, lost them once
       layout finished, and could no longer intersect anything. They stay
       invisible for the life of the page, and the way you meet that is by
       rotating an iPad or resizing a Split View, where a whole stacked hero
       simply fails to appear. Sweeping again closes it in either order. */
    function settleBoxless() {
      targets.forEach(function (el) {
        if (!el.classList.contains('is-revealed') && !el.getClientRects().length) reveal(el);
      });
    }

    targets.forEach(function (el) {
      if (!el.getClientRects().length) {
        reveal(el);
        return;
      }
      observer.observe(el);
    });

    window.addEventListener('load', settleBoxless);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(settleBoxless, 200);
    }, { passive: true });
  }

  /* The previous build held the observers for 950ms because an opening
     curtain covered the page for the first second. There is no curtain now —
     the site opens on the key visual — so waiting would only leave the first
     screen blank. Start as soon as there is a layout to measure. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
