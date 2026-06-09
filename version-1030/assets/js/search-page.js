(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function run() {
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (!input || !results || !empty || typeof SITE_MOVIES === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        empty.textContent = '输入关键词查看影片';
        empty.classList.add('visible');
        return;
      }
      var list = SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.type, movie.region, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(card).join('');
      empty.textContent = '暂未匹配到影片';
      empty.classList.toggle('visible', list.length === 0);
    }

    input.addEventListener('input', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
