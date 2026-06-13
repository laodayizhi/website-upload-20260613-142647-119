(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
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

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search-input'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
  var movieCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('.empty-state');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function currentQuery() {
    for (var i = 0; i < searchInputs.length; i += 1) {
      if (searchInputs[i].value) {
        return normalize(searchInputs[i].value);
      }
    }

    return '';
  }

  function applyFilters() {
    var query = currentQuery();
    var visibleCount = 0;

    movieCards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category')
      ].join(' '));

      var typeValue = normalize(card.getAttribute('data-type'));
      var categoryValue = normalize(card.getAttribute('data-category'));
      var filterValue = normalize(activeFilter);
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = filterValue === 'all' || typeValue.indexOf(filterValue) !== -1 || categoryValue.indexOf(filterValue) !== -1 || haystack.indexOf(filterValue) !== -1;
      var shouldShow = matchesQuery && matchesFilter;

      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0 && movieCards.length > 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });

      button.classList.add('active');
      activeFilter = button.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });
})();
