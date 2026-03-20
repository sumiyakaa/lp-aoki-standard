(function () {
  var mount = document.getElementById("phase1-top-video");
  if (!mount) return;

  var videoParams = 'rel=0&autoplay=1&mute=1&loop=1&playlist=c6VO8KRLlfo&fs=0&controls=0';
  var videoUrl = 'https://www.youtube.com/embed/c6VO8KRLlfo?' + videoParams;

  // Only create the iframe needed for the current viewport
  var isSp = (window.innerWidth || document.documentElement.clientWidth || 0) <= 840;
  var wrapClass = isSp ? 'phase1-mv-iframe phase1-mv-iframe-sp' : 'phase1-mv-iframe phase1-mv-iframe-pc';

  mount.innerHTML = [
    '<div class="phase1-mv">',
    '  <div class="phase1-mv-video">',
    '    <div class="' + wrapClass + '">',
    '      <iframe src="' + videoUrl + '" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>',
    '    </div>',
    '    <div class="phase1-mv-click-guard" aria-hidden="true"></div>',
    '  </div>',
    '</div>'
  ].join('');
})();

(function () {
  var mask = document.getElementById('phase1-opening-mask');
  if (!mask) return;

  var dismissed = false;

  function hideMask() {
    if (dismissed) return;
    dismissed = true;
    mask.style.opacity = '0';
    mask.style.filter = 'blur(8px)';
    setTimeout(function () {
      mask.style.visibility = 'hidden';
    }, 1100);
  }

  mask.addEventListener('animationend', function (e) {
    if (e.animationName === 'phase1-opening-reveal') {
      hideMask();
    }
  });

  setTimeout(hideMask, 2500);
})();
