// ==UserScript==
// @name         Youtube Bypassed Ad-Blocker TOS Violation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Removes the annoying Ad-blockers TOS violation on Youtube
// @author       HPZ07
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let isReplaced = false;
    let isPlaying = true;
    let frame, newIframe;

    function addKeyPressListener() {
        frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');

        document.addEventListener('keydown', function (event) {
            if (event.key === ' ' || event.key === ' ') {
                if (isPlaying) {
                    frame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    isPlaying = false;
                } else {
                    frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    isPlaying = true;
                }
            }
        });
    }

    function pageChangeCallback() {
        if (window.location.pathname === "/watch") {
            replaceViolationWithIframe();
        }
    }

    function replaceViolationWithIframe() {
        newIframe = document.createElement('iframe');
        newIframe.className = 'video-stream html5-main-video';
        newIframe.src = getVideoID();
        newIframe.setAttribute('id', 'iframe-video-stream');
        newIframe.setAttribute('allowfullscreen', '');

        const elementToRemove = document.querySelector('ytd-enforcement-message-view-model.style-scope');

        if (elementToRemove) {
            elementToRemove.replaceWith(newIframe);
            isReplaced = true;
            frame = newIframe;
            addKeyPressListener();
        }
    }

    function getVideoID() {
        const videoURL = window.location.href;
        const videoID = videoURL.match(/v=([A-Za-z0-9_\-]+)/)[1];
        const embeddedURL = `https://www.youtube.com/embed/${videoID}?enablejsapi=1&autoplay=1`;
        return embeddedURL;
    }

    const observer = new MutationObserver(pageChangeCallback);
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    pageChangeCallback();
})();