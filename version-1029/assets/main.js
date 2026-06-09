(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHeroSlide(index) {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;

        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });

        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    if (heroSlides.length) {
        heroDots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showHeroSlide(dotIndex);
            });
        });

        setInterval(function () {
            showHeroSlide(heroIndex + 1);
        }, 5000);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

    filterInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var section = input.closest('[data-filter-section]') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card-title]'));
            var keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-card-title') || '').toLowerCase();
                card.style.display = haystack.indexOf(keyword) === -1 ? 'none' : '';
            });
        });
    });

    var searchRoot = document.querySelector('[data-search-results]');

    if (searchRoot && typeof SEARCH_MOVIES !== 'undefined') {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');

        if (input) {
            input.value = query;
        }

        if (!query) {
            searchRoot.innerHTML = '<div class="empty-state">输入关键词开始搜索影片。</div>';
            return;
        }

        var lowered = query.toLowerCase();
        var results = SEARCH_MOVIES.filter(function (movie) {
            return movie.searchText.toLowerCase().indexOf(lowered) !== -1;
        }).slice(0, 120);

        if (!results.length) {
            searchRoot.innerHTML = '<div class="empty-state">未找到相关影片，请尝试其他关键词。</div>';
            return;
        }

        searchRoot.innerHTML = results.map(function (movie) {
            return '<a class="movie-card" href="' + movie.url + '" data-card-title="' + escapeHtml(movie.searchText) + '">' +
                '<div class="movie-card-poster">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="movie-card-category">' + escapeHtml(movie.category) + '</span>' +
                '<span class="movie-card-year">' + escapeHtml(movie.year) + '</span>' +
                '<span class="movie-card-play">▶</span>' +
                '</div>' +
                '<div class="movie-card-body">' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="movie-meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                '</div>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }
})();
