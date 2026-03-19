(function () {
  var section = document.getElementById("phase1-left-overlay");
  if (!section) return;

  var targets = section.querySelectorAll(".phase1-left-overlay-layer");
  var copy = section.querySelector(".phase1-left-overlay-copy");
  if (!targets.length && !copy) return;

  function reveal(el) {
    if (!el || el.classList.contains("is-revealed")) return;
    el.classList.add("is-revealed");
  }

  if (targets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });

    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    targets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= vh * 1.1 && rect.bottom >= -vh * 0.1) {
        reveal(el);
        observer.unobserve(el);
      }
    });
  }

  if (copy) {
    var copyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(copy);
          copyObserver.unobserve(copy);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -35% 0px" }
    );

    copyObserver.observe(copy);

    var vhCopy = window.innerHeight || document.documentElement.clientHeight || 800;
    var copyRect = copy.getBoundingClientRect();
    if (copyRect.top <= vhCopy * 0.82 && copyRect.bottom >= -vhCopy * 0.1) {
      reveal(copy);
      copyObserver.unobserve(copy);
    }
  }
})();
