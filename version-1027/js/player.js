import { H as Hls } from "./hls-player.js";

function setupPlayer(container) {
    var video = container.querySelector("video");
    var source = container.getAttribute("data-src");
    var playButton = container.querySelector("[data-play-button]");
    var errorBox = container.querySelector("[data-player-error]");

    if (!video || !source) {
        return;
    }

    function markReady() {
        container.classList.add("is-ready");
    }

    function showError(message) {
        markReady();
        if (errorBox) {
            errorBox.textContent = message;
        }
    }

    function syncPlayingState() {
        container.classList.toggle("is-playing", !video.paused && !video.ended);
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                showError("视频暂时无法加载，请稍后重试");
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", markReady, { once: true });
    } else {
        showError("当前浏览器不支持该视频格式");
    }

    if (playButton) {
        playButton.addEventListener("click", function () {
            if (video.paused || video.ended) {
                video.play();
            } else {
                video.pause();
            }
        });
    }

    video.addEventListener("play", syncPlayingState);
    video.addEventListener("pause", syncPlayingState);
    video.addEventListener("ended", syncPlayingState);
    video.addEventListener("canplay", markReady);
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
