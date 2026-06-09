(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    activate(0);
    schedule();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var searchInput = document.querySelector(".filter-search");
    var typeSelect = document.querySelector(".filter-type");
    var yearSelect = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    if (!cards.length || !searchInput) {
      return;
    }
    var types = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute("data-type") || "";
    }))).sort();
    var years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute("data-year") || "";
    }))).sort().reverse();

    fillSelect(typeSelect, types);
    fillSelect(yearSelect, years);

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      searchInput.value = q;
    }

    function filter() {
      var term = searchInput.value.trim().toLowerCase();
      var selectedType = typeSelect ? typeSelect.value : "";
      var selectedYear = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var haystack = (
          card.getAttribute("data-title") + " " +
          card.getAttribute("data-tags") + " " +
          card.getAttribute("data-region")
        ).toLowerCase();
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedType = !selectedType || card.getAttribute("data-type") === selectedType;
        var matchedYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        card.classList.toggle("is-hidden", !(matchedTerm && matchedType && matchedYear));
      });
    }

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });
    filter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".play-layer");
      var url = player.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function start() {
        if (!video || !url) {
          return;
        }
        if (!started) {
          started = true;
          video.controls = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
        }
        if (layer) {
          layer.classList.add("hidden");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", start);
      }
      player.addEventListener("click", function (event) {
        if (!started && event.target !== video) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
