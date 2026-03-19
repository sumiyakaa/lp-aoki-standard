(function () {
  var section = document.getElementById("phase1-message-visual");
  if (!section) return;

  var targets = section.querySelectorAll(
    ".phase1-message-visual-base, .phase1-message-visual-pc, .phase1-message-visual-sp"
  );
  if (!targets.length) return;

  function reveal(el) {
    if (!el || el.classList.contains("is-revealed")) return;
    el.classList.add("is-revealed");
  }

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
    if ((rect.top <= vh * 1.1 && rect.bottom >= -vh * 0.1) || (rect.height === 0 && rect.top < vh * 0.5)) {
      reveal(el);
      observer.unobserve(el);
    }
  });
})();