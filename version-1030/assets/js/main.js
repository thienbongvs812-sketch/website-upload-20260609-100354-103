(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    show(0);
    play();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var type = root.querySelector('[data-filter-type]');
      var region = root.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var empty = root.querySelector('[data-filter-empty]');

      function value(el) {
        return el ? el.value.trim().toLowerCase() : '';
      }

      function apply() {
        var q = value(input);
        var t = value(type);
        var r = value(region);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var typeText = String(card.getAttribute('data-type') || '').toLowerCase();
          var regionText = String(card.getAttribute('data-region') || '').toLowerCase();
          var match = (!q || haystack.indexOf(q) !== -1) && (!t || typeText.indexOf(t) !== -1) && (!r || regionText.indexOf(r) !== -1);
          card.style.display = match ? '' : 'none';
          if (match) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', shown === 0);
        }
      }

      [input, type, region].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  window.setupVideoPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var trigger = document.getElementById(options.triggerId);
    var hls = null;
    var started = false;

    if (!video || !trigger || !options.source) {
      return;
    }

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      trigger.classList.add('hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = options.source;
            video.play().catch(function () {});
          }
        });
        return;
      }

      video.src = options.source;
      video.play().catch(function () {});
    }

    trigger.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      } else if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  };
})();
