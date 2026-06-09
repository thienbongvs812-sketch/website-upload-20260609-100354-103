(function() {
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function() {
      var opened = mobilePanel.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      navToggle.textContent = opened ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function(dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var controls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-control]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function currentControl(name) {
    return document.querySelector('[data-filter-control="' + name + '"]');
  }

  function applyFilters() {
    if (!controls.length || !cards.length) {
      return;
    }

    var queryInput = currentControl('query');
    var yearSelect = currentControl('year');
    var regionSelect = currentControl('region');
    var typeSelect = currentControl('type');
    var query = normalize(queryInput ? queryInput.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var visible = 0;

    cards.forEach(function(card) {
      var search = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (query && search.indexOf(query) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }

      card.classList.toggle('hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  controls.forEach(function(control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  var queryControl = currentControl('query');

  if (q && queryControl) {
    queryControl.value = q;
    applyFilters();
  }
}());
