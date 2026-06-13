(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (slides.length) {
      activateSlide(0);
      window.setInterval(function () {
        activateSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activateSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activateSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activateSlide(index);
      });
    });

    var searchInput = document.querySelector("#movieSearch");
    var regionSelect = document.querySelector("#regionFilter");
    var typeSelect = document.querySelector("#typeFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));
        var regionMatch = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
        var typeMatch = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-by-filter", !(regionMatch && typeMatch && keywordMatch));
      });
    }

    [searchInput, regionSelect, typeSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector("#movieVideo");
  var layer = document.querySelector("#playLayer");
  var started = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    if (layer) {
      layer.classList.add("hidden");
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener("click", attachStream);
  }

  video.addEventListener("click", function () {
    if (!started) {
      attachStream();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
