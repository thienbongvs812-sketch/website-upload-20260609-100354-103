(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-hero-dot") || "0");
                show(target);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);

        if (slides.length > 1) {
            start();
        }
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupLocalFilters() {
        var input = document.querySelector("[data-filter-input]");
        var grid = document.querySelector("[data-card-grid]");
        var count = document.querySelector("[data-filter-count]");
        var sort = document.querySelector("[data-sort-select]");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var defaultOrder = cards.slice();

        function applyFilter() {
            var query = normalizeText(input ? input.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-category") + " " + card.getAttribute("data-year"));
                var shouldShow = !query || haystack.indexOf(query) !== -1;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        function applySort() {
            var value = sort ? sort.value : "default";
            var ordered = cards.slice();

            if (value === "year-desc") {
                ordered.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            } else if (value === "score-desc") {
                ordered.sort(function (a, b) {
                    return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
                });
            } else if (value === "title-asc") {
                ordered.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            } else {
                ordered = defaultOrder.slice();
            }

            ordered.forEach(function (card) {
                grid.appendChild(card);
            });

            applyFilter();
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (sort) {
            sort.addEventListener("change", applySort);
        }

        applyFilter();
    }

    function getSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function movieCardHtml(movie) {
        var cover = movie.cover || "1.jpg";
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('is-missing')\">",
            "<span class=\"poster-glow\"></span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.region || "") + "</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "<div class=\"card-actions\"><a class=\"text-link\" href=\"" + escapeHtml(movie.url) + "\">查看详情</a><span>" + escapeHtml(movie.category || "") + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");

        if (!page || !window.SEARCH_MOVIES) {
            return;
        }

        var input = page.querySelector("[data-search-page-input]");
        var status = page.querySelector("[data-search-status]");
        var results = page.querySelector("[data-search-results]");
        var query = getSearchQuery();

        if (input) {
            input.value = query;
        }

        function render(value) {
            var normalized = normalizeText(value);
            var matches = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = normalizeText([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));

                return !normalized || haystack.indexOf(normalized) !== -1;
            }).slice(0, 120);

            if (status) {
                status.textContent = normalized ? "找到 " + matches.length + " 条相关结果" : "展示热度靠前的 120 部影片";
            }

            if (results) {
                results.innerHTML = matches.map(movieCardHtml).join("");
            }
        }

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }

        render(query);
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
}());
