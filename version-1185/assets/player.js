function initMoviePlayer(videoId, layerId, sourceUrl) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  var ready = false;
  var hls = null;

  if (!video || !layer || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function begin() {
    attachSource();
    layer.classList.add("is-hidden");

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        layer.classList.remove("is-hidden");
      });
    }
  }

  layer.addEventListener("click", begin);

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener("play", function () {
    layer.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    layer.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
