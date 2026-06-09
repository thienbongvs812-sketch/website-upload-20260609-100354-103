const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
}

const navToggle = document.querySelector('[data-nav-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
        mobilePanel.classList.toggle('is-open');
    });
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function setupFilters() {
    const grid = document.querySelector('[data-filterable]');
    const panel = document.querySelector('[data-filter-panel]');
    const count = document.querySelector('[data-result-count]');

    if (!grid || !panel) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const keywordInput = panel.querySelector('[data-filter-keyword]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const yearSelect = panel.querySelector('[data-filter-year]');

    function applyFilter() {
        const keyword = normalize(keywordInput ? keywordInput.value : '');
        const region = normalize(regionSelect ? regionSelect.value : '');
        const type = normalize(typeSelect ? typeSelect.value : '');
        const year = normalize(yearSelect ? yearSelect.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year
            ].join(' '));
            const matched =
                (!keyword || haystack.includes(keyword)) &&
                (!region || normalize(card.dataset.region) === region) &&
                (!type || normalize(card.dataset.type) === type) &&
                (!year || normalize(card.dataset.year) === year);

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `共 ${visible} 部影片`;
        }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    applyFilter();
}

setupFilters();

function createSearchCard(movie) {
    const tags = (movie.tags || [])
        .slice(0, 3)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join('');

    return `
<article class="movie-card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}">
    <a class="poster-link" href="./${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-badge">${escapeHtml(movie.score)}</span>
        <span class="poster-play">播放</span>
    </a>
    <div class="movie-card-body">
        <div class="movie-tags">${tags}</div>
        <h3><a href="./${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
        <div class="movie-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
        </div>
    </div>
</article>`;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function setupSearchPage() {
    const root = document.querySelector('[data-search-page]');

    if (!root) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = normalize(params.get('q'));
    const title = root.querySelector('[data-search-title]');
    const results = root.querySelector('[data-search-results]');

    if (!query) {
        return;
    }

    try {
        let movies = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : null;

        if (!movies) {
            const response = await fetch('./assets/movies-search.json');
            movies = await response.json();
        }

        const matched = movies
            .filter((movie) => normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine,
                movie.summary
            ].join(' ')).includes(query))
            .slice(0, 120);

        if (title) {
            title.textContent = `“${params.get('q')}” 的搜索结果（${matched.length}）`;
        }

        if (results) {
            results.innerHTML = matched.map(createSearchCard).join('');
        }
    } catch (error) {
        if (title) {
            title.textContent = '搜索数据加载失败';
        }
    }
}

setupSearchPage();

function setupPlayers() {
    const players = Array.from(document.querySelectorAll('.video-shell'));

    players.forEach((shell) => {
        const video = shell.querySelector('video[data-m3u8]');
        const button = shell.querySelector('.play-overlay');

        if (!video || !button) {
            return;
        }

        let initialized = false;

        async function playVideo() {
            try {
                await video.play();
            } catch (error) {
                button.classList.remove('is-hidden');
            }
        }

        async function startPlayback() {
            const source = video.dataset.m3u8;

            if (!source) {
                return;
            }

            button.classList.add('is-hidden');

            if (initialized) {
                await playVideo();
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                await playVideo();
                return;
            }

            try {
                const module = await import('./player-dru42stk.js');
                const Hls = module.H;

                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);

                    if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
                        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
                    } else {
                        video.addEventListener('loadedmetadata', playVideo, { once: true });
                    }
                } else {
                    video.src = source;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                    await playVideo();
                }
            } catch (error) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                await playVideo();
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('play', () => button.classList.add('is-hidden'));
    });
}

setupPlayers();
