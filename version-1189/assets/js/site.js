(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav-links');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    if (slides.length) {
      var prev = document.querySelector('.hero-prev');
      var next = document.querySelector('.hero-next');
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var filterSearch = document.getElementById('filterSearch');
    var filterGenre = document.getElementById('filterGenre');
    var filterYear = document.getElementById('filterYear');
    var filterRegion = document.getElementById('filterRegion');
    var filterEmpty = document.querySelector('.filter-empty');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      if (!filterSearch && !filterGenre && !filterYear && !filterRegion) {
        return;
      }
      var keyword = normalize(filterSearch && filterSearch.value);
      var genre = normalize(filterGenre && filterGenre.value);
      var year = normalize(filterYear && filterYear.value);
      var region = normalize(filterRegion && filterRegion.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region'));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (filterEmpty) {
        filterEmpty.classList.toggle('show', visible === 0);
      }
    }

    [filterSearch, filterGenre, filterYear, filterRegion].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();

    var searchResults = document.getElementById('searchResults');
    if (searchResults && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get('q'));
      var input = document.getElementById('searchPageInput');
      if (input) {
        input.value = params.get('q') || '';
      }
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        if (!query) {
          return true;
        }
        return normalize(movie.title + ' ' + movie.desc + ' ' + movie.genre + ' ' + movie.region + ' ' + movie.year + ' ' + movie.category).indexOf(query) !== -1;
      }).slice(0, 240);
      searchResults.innerHTML = results.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="./' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="play-chip">播放</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>' +
          '<h2><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.desc) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
      var empty = document.getElementById('searchEmpty');
      if (empty) {
        empty.classList.toggle('show', results.length === 0);
      }
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
