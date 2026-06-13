(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initNavSearch() {
        var forms = document.querySelectorAll('[data-nav-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var url = './search.html';
                if (value) {
                    url += '?q=' + encodeURIComponent(value);
                }
                window.location.href = url;
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var panels = document.querySelectorAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var input = panel.querySelector('[data-filter-search]');
            var year = panel.querySelector('[data-filter-year]');
            var category = panel.querySelector('[data-filter-category]');
            var reset = panel.querySelector('[data-filter-reset]');
            var empty = scope.querySelector('[data-empty-state]');

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var yearValue = year ? normalize(year.value) : '';
                var categoryValue = category ? normalize(category.value) : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchCategory = !categoryValue || cardCategory === categoryValue;
                    var active = matchKeyword && matchYear && matchCategory;
                    card.classList.toggle('is-hidden', !active);
                    if (active) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            if (category) {
                category.addEventListener('change', apply);
            }
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (category) {
                        category.value = '';
                    }
                    apply();
                });
            }
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-cta');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src') || player.getAttribute('data-src') || '';
            var hlsInstance = null;
            var hasLoaded = false;

            function loadAndPlay() {
                if (!source) {
                    return;
                }
                player.classList.add('is-playing');
                if (!hasLoaded) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    hasLoaded = true;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    loadAndPlay();
                });
            }
            player.addEventListener('click', function (event) {
                if (event.target === video && !video.paused) {
                    return;
                }
                if (event.target.closest && event.target.closest('button')) {
                    return;
                }
                loadAndPlay();
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    player.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initNavSearch();
        initHero();
        initFilters();
        initPlayers();
    });
})();
