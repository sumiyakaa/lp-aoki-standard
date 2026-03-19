(function () {
  var section = document.getElementById("phase1-item-lineup");
  if (!section) return;

  var targets = section.querySelectorAll(".phase1-item-lineup-layer");
  if (!targets.length) return;

  function reveal(el) {
    if (!el || el.classList.contains("is-revealed")) return;
    el.classList.add("is-revealed");
  }

  function revealFlowCopyByLayer(el) {
    if (!el || !el.matches(".phase1-item-lineup-layer--c")) return;

    var stage = el.closest(".phase1-item-lineup-stage");
    if (!stage) return;

    var copies = stage.querySelectorAll(".phase1-item-lineup-copy");
    copies.forEach(function (copyEl) {
      reveal(copyEl);
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        revealFlowCopyByLayer(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach(function (el) {
    el.style.transitionDelay = "100ms";
    el.style.transitionDuration = "600ms";
    observer.observe(el);
  });

  var vh = window.innerHeight || document.documentElement.clientHeight || 800;
  targets.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top <= vh * 1.1 && rect.bottom >= -vh * 0.1) {
      reveal(el);
      revealFlowCopyByLayer(el);
      observer.unobserve(el);
    }
  });
})();

