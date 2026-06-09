(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  function runSearch(scope) {
    const input = scope.querySelector('.search-input');
    const typeSelect = scope.querySelector('.filter-type');
    const regionSelect = scope.querySelector('.filter-region');
    const buttons = Array.from(scope.querySelectorAll('.filter-button'));
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('.empty-result');
    let chip = 'all';

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const type = typeSelect ? typeSelect.value : 'all';
      const region = regionSelect ? regionSelect.value : 'all';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = card.dataset.search || '';
        const cardType = card.dataset.type || '';
        const cardRegion = card.dataset.region || '';
        const passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const passType = type === 'all' || cardType.indexOf(type) !== -1;
        const passRegion = region === 'all' || cardRegion.indexOf(region) !== -1;
        const passChip = chip === 'all' || haystack.indexOf(chip) !== -1;
        const show = passKeyword && passType && passRegion && passChip;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        chip = button.dataset.filter || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  }

  document.querySelectorAll('[data-search-scope]').forEach(runSearch);

  function preparePlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-action');
    let ready = false;

    function attach() {
      if (!video || ready) {
        return;
      }
      const url = video.dataset.stream;
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = url;
      }
      ready = true;
    }

    function play() {
      attach();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      const started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }

    if (button && video) {
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  }

  document.querySelectorAll('.player-shell').forEach(preparePlayer);
}());
