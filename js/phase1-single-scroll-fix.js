(function () {
  function optimizeMediaLoading() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var imgs = document.querySelectorAll('img');

    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img) continue;

      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      if (img.hasAttribute('loading')) continue;
      var rect = img.getBoundingClientRect();
      var isNearViewport = rect.top < vh * 1.5;
      if (isNearViewport) continue;

      img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('fetchpriority')) {
        img.setAttribute('fetchpriority', 'low');
      }
    }
  }

  function isPc() {
    return (window.innerWidth || document.documentElement.clientWidth || 0) > 840;
  }

  function isRoot(el) {
    return (
      el === document.documentElement ||
      el === document.body ||
      el === document.scrollingElement
    );
  }

  function hasScrollableY(el, cs) {
    var oy = cs.overflowY;
    return (
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
      el.scrollHeight > el.clientHeight + 2
    );
  }

  function forceWindowSingleScrollRoot() {
    if (!isPc()) return;
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'visible';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
  }

  var observer = null;
  var wheelBound = false;
  var pendingFrame = null;
  var isMutating = false;

  // Only target elements likely to have overflow issues, not every DOM node
  var SCROLL_TARGETS = [
    '#phase1-image-clone',
    '#phase1-top-video',
    '#phase1-item-lineup',
    '#phase1-message-visual',
    '#phase1-left-overlay',
    '#phase1-information-text',
    '.phase1-mv-video',
    '.phase1-item-lineup-stage',
    '.phase1-item-lineup-body'
  ].join(',');

  function forceSingleScroll() {
    if (!isPc()) return;

    isMutating = true;

    forceWindowSingleScrollRoot();

    var nodes = document.querySelectorAll(SCROLL_TARGETS);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el || isRoot(el)) continue;

      var cs = window.getComputedStyle(el);
      if (hasScrollableY(el, cs)) {
        if (el.style.overflowY === 'visible') continue;
        el.style.overflowY = 'visible';
      }
    }

    isMutating = false;
  }

  function nearestScrollableAncestor(node) {
    var el = node && node.nodeType === 1 ? node : node && node.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      var cs = window.getComputedStyle(el);
      if (hasScrollableY(el, cs)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function bindWheelToWindowScroll() {
    if (wheelBound) return;
    wheelBound = true;

    document.addEventListener(
      'wheel',
      function (e) {
        if (!isPc()) return;
        if (!e.cancelable) return;

        var nestedScrollable = nearestScrollableAncestor(e.target);
        if (!nestedScrollable) return;
        if (isRoot(nestedScrollable)) return;

        e.preventDefault();
        window.scrollBy({
          top: e.deltaY,
          left: 0,
          behavior: 'auto'
        });
      },
      { passive: false, capture: true }
    );
  }

  function startObserver() {
    if (!document.body) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(function () {
      // Skip mutations caused by our own style changes
      if (isMutating) return;
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(function () {
        pendingFrame = null;
        forceSingleScroll();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  var resizeTimer = null;
  window.addEventListener('load', function () {
    optimizeMediaLoading();
    forceSingleScroll();
    setTimeout(forceSingleScroll, 300);
    setTimeout(forceSingleScroll, 1200);
    startObserver();
    bindWheelToWindowScroll();
  });

  window.addEventListener('DOMContentLoaded', function () {
    optimizeMediaLoading();
  });

  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(forceSingleScroll, 150);
  });
})();
