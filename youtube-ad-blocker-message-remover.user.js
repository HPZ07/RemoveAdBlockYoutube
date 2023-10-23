// ==UserScript==
// @name         Youtube Bypassed Ad-Blocker TOS Violation
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Removes the annoying Ad-blockers TOS violation on Youtube
// @author       HPZ07
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let player = null;

    function loadVideo() {
        (function loadYoutubeIFrameApiScript() {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";

            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            tag.onload = setupPlayer;
        })();

        function setupPlayer() {
            window.YT.ready(function() {
                player = new window.YT.Player("customPlayer", {
                    videoId: (window.location.href.match(/v=([A-Za-z0-9_\-]+)/) || [])[1],
                    playerVars: {
                        'autoplay': 1,
                        'controls': 1,
                        'disablekb': 0,
                        'enablejsapi': 1
                    },
                    events: {
                        onReady: onPlayerReady,
                    }
                });

            });
        }

        function onPlayerReady(event) {
            event.target.getIframe().focus();
        }
    }

    let currentTime;
    document.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 32:
                if (player.getPlayerState() == 1) {
                    player.pauseVideo();
                } else {
                    player.playVideo();
                }
                event.preventDefault();
                break;
            case 37:
                currentTime = player.getCurrentTime();
                player.seekTo(currentTime - 5, true);
                break;
            case 39:
                currentTime = player.getCurrentTime();
                player.seekTo(currentTime + 5, true);
                break;
            case 70:
                var isFullScreen = (document.fullscreenElement || document.webkitFullscreenElement) !== null;
                if (isFullScreen) {
                    document.exitFullscreen();
                } else {
                    player.getIframe().requestFullscreen();
                }
                break;
        }
    });

    function pageChangeCallback() {
        if (window.location.pathname === "/watch") {
            replaceViolationWithIframe();
        }
    }

    function replaceViolationWithIframe() {
        let frame = document.createElement('div');
        frame.setAttribute('id', 'customPlayer');
        frame.className = 'video-stream html5-main-video';

        const elementToRemove = document.querySelector('ytd-enforcement-message-view-model.style-scope');
        const hotkeyManager = document.querySelector('yt-hotkey-manager');

        if (elementToRemove) {
            elementToRemove.replaceWith(frame);
            loadVideo();
        }
        if(hotkeyManager){
            hotkeyManager.remove();
        }
    }

    const observer = new MutationObserver(pageChangeCallback);
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    pageChangeCallback();
})();