(function () {
  var loaderPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (loaderPromise) {
      return loaderPromise;
    }
    loaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  function init(rootId, streamUrl) {
    var root = document.getElementById(rootId);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var started = false;
    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      overlay.classList.add("is-hidden");
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          root.hlsPlayer = hls;
          return;
        }
        video.src = streamUrl;
        video.play().catch(function () {});
      }).catch(function () {
        video.src = streamUrl;
        video.play().catch(function () {});
      });
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
