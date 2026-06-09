function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-button');
    var errorBox = document.getElementById('player-error');
    var hlsInstance = null;
    var isReady = false;

    if (!video || !overlay) {
        return;
    }

    function showError() {
        if (errorBox) {
            errorBox.textContent = '播放暂时不可用，请稍后再试。';
            errorBox.classList.add('show');
        }
    }

    function prepare() {
        if (isReady) {
            return Promise.resolve();
        }

        isReady = true;

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        showError();
        return Promise.reject(new Error('unavailable'));
    }

    function start() {
        prepare().then(function () {
            overlay.classList.add('hidden');
            video.controls = true;
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    overlay.classList.remove('hidden');
                });
            }
        }).catch(function () {
            overlay.classList.remove('hidden');
        });
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (!isReady || video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
