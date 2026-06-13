(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
        };

        const start = () => {
            timer = window.setInterval(() => show(active + 1), 5600);
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(active + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    const filterInput = document.querySelector('[data-card-filter]');
    const cards = Array.from(document.querySelectorAll('.js-movie-card'));

    if (filterInput && cards.length) {
        const runFilter = () => {
            const value = filterInput.value.trim().toLowerCase();
            cards.forEach((card) => {
                const text = card.getAttribute('data-search') || '';
                card.classList.toggle('is-hidden', value && !text.includes(value));
            });
        };

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');

        if (filterInput.hasAttribute('data-query-input') && q) {
            filterInput.value = q;
        }

        filterInput.addEventListener('input', runFilter);
        runFilter();
    }

    const players = Array.from(document.querySelectorAll('.js-player'));

    players.forEach((player) => {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.player-overlay');
        const stream = player.getAttribute('data-stream');
        let hlsInstance = null;
        let initialized = false;

        const init = () => {
            if (!video || !stream || initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        };

        const play = () => {
            init();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(() => {
                    video.controls = true;
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', () => {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
