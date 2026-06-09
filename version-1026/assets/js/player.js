(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupPlayer(player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var message = player.querySelector("[data-player-message]");
        var source = video ? video.getAttribute("data-src") : "";
        var hlsInstance = null;
        var started = false;

        if (!video || !button || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
                    button.classList.remove("is-hidden");
                });
            }
        }

        function start() {
            button.classList.add("is-hidden");
            setMessage("正在加载播放内容...");

            if (started) {
                playVideo();
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                setMessage("");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage("");
                    playVideo();
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage("网络加载异常，正在尝试恢复...");
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage("播放解码异常，正在尝试恢复...");
                        hlsInstance.recoverMediaError();
                    } else {
                        setMessage("当前浏览器无法播放该内容，请更换浏览器或稍后重试。");
                        hlsInstance.destroy();
                    }
                });

                return;
            }

            setMessage("当前浏览器不支持 HLS 播放。请使用 Safari、Edge、Chrome 或其他现代浏览器访问。");
            button.classList.remove("is-hidden");
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
    });
}());
