(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var select = document.querySelector("[data-local-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filterable-card]"));
    if (!input || !cards.length) {
      return;
    }
    function filter() {
      var term = input.value.trim().toLowerCase();
      var type = select ? select.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var typeMatch = !type || card.getAttribute("data-type").indexOf(type) !== -1;
        card.style.display = text.indexOf(term) !== -1 && typeMatch ? "" : "none";
      });
    }
    input.addEventListener("input", filter);
    if (select) {
      select.addEventListener("change", filter);
    }
  }

  function renderSearch() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !form || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function card(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        '<article class="movie-card">',
        '<a class="movie-cover" href="' + escapeAttr(item.url) + '">',
        '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
        '<span class="play-chip">播放</span>',
        '</a>',
        '<div class="movie-info">',
        '<a class="movie-title" href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a>',
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join("");
    }
    function search() {
      var term = input.value.trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ").toLowerCase();
        return !term || text.indexOf(term) !== -1;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = list.map(card).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      url.searchParams.set("q", input.value.trim());
      window.history.replaceState({}, "", url.toString());
      search();
    });
    input.addEventListener("input", search);
    search();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupLocalFilter();
    renderSearch();
  });
})();
