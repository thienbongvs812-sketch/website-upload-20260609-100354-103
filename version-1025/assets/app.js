(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === activeIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === activeIndex);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5800);
    }

    function uniqueSorted(values, numeric) {
        var map = {};
        values.forEach(function (value) {
            if (value) {
                map[value] = true;
            }
        });
        var out = Object.keys(map);
        if (numeric) {
            out.sort(function (a, b) {
                return Number(b) - Number(a);
            });
        } else {
            out.sort();
        }
        return out;
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var searchInput = document.querySelector(".site-search");
    var yearFilter = document.querySelector(".year-filter");
    var typeFilter = document.querySelector(".type-filter");
    var emptyState = document.querySelector(".empty-state");

    if (cards.length && (searchInput || yearFilter || typeFilter)) {
        fillSelect(yearFilter, uniqueSorted(cards.map(function (card) {
            return card.getAttribute("data-year");
        }), true));
        fillSelect(typeFilter, uniqueSorted(cards.map(function (card) {
            return card.getAttribute("data-type");
        }), false));

        function applyFilters() {
            var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (term && text.indexOf(term) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-wrap[data-stream]")).forEach(function (block) {
        var video = block.querySelector("video");
        var layer = block.querySelector(".play-layer");
        var stream = block.getAttribute("data-stream");
        var ready = false;
        var hlsInstance = null;

        function attachStream() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            attachStream();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            if (video) {
                video.controls = true;
                var playAction = video.play();
                if (playAction && typeof playAction.catch === "function") {
                    playAction.catch(function () {});
                }
            }
        }

        if (layer) {
            layer.addEventListener("click", startPlayback);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!ready) {
                    startPlayback();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
