(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function text(value) {
        return value == null ? "" : String(value);
    }

    function createMovieCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";

        var poster = document.createElement("a");
        poster.className = "movie-poster";
        poster.href = movie.url;
        poster.setAttribute("aria-label", "观看" + movie.title);

        var image = document.createElement("img");
        image.src = movie.cover;
        image.alt = movie.title + "海报";
        image.loading = "lazy";
        image.decoding = "async";
        poster.appendChild(image);

        var shine = document.createElement("span");
        shine.className = "poster-shine";
        poster.appendChild(shine);

        var play = document.createElement("span");
        play.className = "poster-play";
        play.textContent = "▶";
        poster.appendChild(play);

        var content = document.createElement("div");
        content.className = "movie-card-content";

        var title = document.createElement("a");
        title.className = "movie-card-title";
        title.href = movie.url;
        title.textContent = movie.title;
        content.appendChild(title);

        var meta = document.createElement("div");
        meta.className = "movie-card-meta";
        [movie.year, movie.region, movie.type].forEach(function (item) {
            var span = document.createElement("span");
            span.textContent = text(item);
            meta.appendChild(span);
        });
        content.appendChild(meta);

        var intro = document.createElement("p");
        intro.textContent = movie.oneLine || "";
        content.appendChild(intro);

        var tags = document.createElement("div");
        tags.className = "movie-tags";
        (movie.tags || []).slice(0, 3).forEach(function (tag) {
            var tagNode = document.createElement("span");
            tagNode.textContent = tag;
            tags.appendChild(tagNode);
        });
        content.appendChild(tags);

        article.appendChild(poster);
        article.appendChild(content);
        return article;
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SEARCH_MOVIES) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var clearButton = page.querySelector("[data-search-clear]");
        var results = page.querySelector("[data-search-results]");
        var status = page.querySelector("[data-search-status]");
        var initialQuery = getQueryValue("q");

        function render(query) {
            var keyword = query.trim().toLowerCase();
            var matched = window.SEARCH_MOVIES;
            if (keyword) {
                matched = window.SEARCH_MOVIES.filter(function (movie) {
                    var haystack = [
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.category,
                        movie.genre,
                        movie.oneLine,
                        (movie.tags || []).join(" ")
                    ].join(" ").toLowerCase();
                    return haystack.indexOf(keyword) !== -1;
                });
            } else {
                matched = window.SEARCH_MOVIES.slice(0, 24);
            }
            results.innerHTML = "";
            matched.slice(0, 96).forEach(function (movie) {
                results.appendChild(createMovieCard(movie));
            });
            if (keyword) {
                status.textContent = "找到 " + matched.length + " 个相关结果";
            } else {
                status.textContent = "展示推荐影片，输入关键词可继续搜索";
            }
        }

        if (initialQuery) {
            input.value = initialQuery;
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        clearButton.addEventListener("click", function () {
            input.value = "";
            input.focus();
            render("");
        });
        render(input.value);
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupSearchPage();
    });
})();
