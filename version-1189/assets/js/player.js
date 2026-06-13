(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('.player-card').forEach(function (box) {
      var video = box.querySelector('video[data-video-url]');
      var button = box.querySelector('.play-mask');
      var hls = null;
      var loaded = false;

      function attach() {
        if (!video || loaded) {
          return;
        }
        var url = video.getAttribute('data-video-url');
        if (!url) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      function start() {
        attach();
        if (!video) {
          return;
        }
        box.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
          if (hls && hls.destroy) {
            hls.destroy();
            hls = null;
            loaded = false;
          }
        });
      }
    });
  });
})();
