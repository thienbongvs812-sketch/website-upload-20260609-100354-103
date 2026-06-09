(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializeMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initializeHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initializeCategoryFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var count = panel.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(" ").toLowerCase();

        var isMatch = true;
        if (keyword && text.indexOf(keyword) === -1) {
          isMatch = false;
        }
        if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
          isMatch = false;
        }
        if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
          isMatch = false;
        }
        if (selectedType && normalize(card.dataset.type) !== selectedType) {
          isMatch = false;
        }

        card.classList.toggle("is-hidden", !isMatch);
        if (isMatch) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = String(visibleCount);
      }
    }

    [search, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function initializeSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var summary = document.querySelector("[data-search-summary]");
    if (!results || !input || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderCard(item) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(item.url) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-play" aria-hidden="true">▶</span>',
        '    <span class="poster-type">' + escapeHtml(item.type) + '</span>',
        '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.genre) + '</span>',
        '    </div>',
        '    <div class="tag-list">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function performSearch(value) {
      var keyword = String(value || "").trim().toLowerCase();
      if (!keyword) {
        summary.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }

      var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 120);

      summary.textContent = '搜索 “' + value + '” ，共找到 ' + matches.length + ' 个相关作品。';
      results.innerHTML = matches.map(renderCard).join("");
    }

    performSearch(query);
  }

  function initializePlayers() {
    var playerCards = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!playerCards.length) {
      return;
    }

    playerCards.forEach(function (card) {
      var video = card.querySelector("video[data-hls-src]");
      var startButton = card.querySelector("[data-player-start]");
      var toggleButton = card.querySelector("[data-player-toggle]");
      var muteButton = card.querySelector("[data-player-mute]");
      var fullscreenButton = card.querySelector("[data-player-fullscreen]");
      var hls = null;

      if (!video) {
        return;
      }

      function attachSource() {
        if (video.dataset.sourceAttached === "true") {
          return;
        }

        var source = video.dataset.hlsSrc;
        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.controls = true;
        video.dataset.sourceAttached = "true";
      }

      function playVideo() {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(function () {
            card.classList.add("is-paused");
          });
        }
      }

      function togglePlayback() {
        attachSource();
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (startButton) {
        startButton.addEventListener("click", playVideo);
      }

      if (toggleButton) {
        toggleButton.addEventListener("click", togglePlayback);
      }

      video.addEventListener("click", togglePlayback);
      video.addEventListener("play", function () {
        card.classList.add("is-playing");
        card.classList.remove("is-paused");
      });
      video.addEventListener("pause", function () {
        card.classList.remove("is-playing");
        card.classList.add("is-paused");
      });

      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
          var target = video;
          if (target.requestFullscreen) {
            target.requestFullscreen();
          } else if (target.webkitEnterFullscreen) {
            target.webkitEnterFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initializeMobileMenu();
    initializeHeroSlider();
    initializeCategoryFilters();
    initializeSearchPage();
    initializePlayers();
  });
})();
