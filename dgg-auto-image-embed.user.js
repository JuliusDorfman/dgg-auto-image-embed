// ==UserScript==
// @name        DGG Auto Image Embed
// @namespace   boofus
// @description Shows a preview of images linked in destiny.gg chat without opening new tabs. NSFW blur toggle + preserves autoscroll.
// @match       https://www.destiny.gg/embed/chat*
// @icon        https://cdn.destiny.gg/2.49.0/emotes/6296cf7e8ccd0.png
// @version     10.0.1
// @author      boofus (credits: legolas, vyneer)
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// @connect     discordapp.net
// @connect     discordapp.com
// @connect     pbs.twimg.com
// @connect     polecat.me
// @connect     imgur.com
// @connect     gyazo.com
// @connect     redd.it
// @downloadURL https://update.greasyfork.org/scripts/547316/DGG%20Auto%20Image%20Embed.user.js
// @updateURL https://update.greasyfork.org/scripts/547316/DGG%20Auto%20Image%20Embed.meta.js
// ==/UserScript==


const imageRegex = /http.+(redd.it|pbs.twimg.com|(media|cdn).discordapp.(net|com)|imgur.com|gyazo.com|polecat.me|catbox.moe).+\.(png|jpe?g|gifv?)/gm;
let overlay;

// START STOLEN FROM VYNEER
// START STOLEN FROM LEGOLAS (also from vyneer)

class ConfigItem {
    constructor(keyName, defaultValue) {
        this.keyName = keyName;
        this.defaultValue = defaultValue;
    }
}

const configItems = {
    BlurNSFW: new ConfigItem("BlurNSFW", true),
    HideLink: new ConfigItem("HideLink", true)
};
class Config {
    constructor(configKeys, keyPrefix) {
        this.configItems = configKeys;
        this.configKeyPrefix = keyPrefix;
    }

    getFullKeyName(configKey) {
        return `${this.configKeyPrefix}${configKey}`;
    }

    save(configKey, value) {
        const fullKeyName = this.getFullKeyName(configKey);
        unsafeWindow.localStorage.setItem(fullKeyName, JSON.stringify(value));
    }

    load(configKey) {
        const fullKeyName = this.getFullKeyName(configKey);
        const item = unsafeWindow.localStorage.getItem(fullKeyName);
        if (item != null) return JSON.parse(item);
    }
}
const config = new Config(configItems, "img-util.");
// Sticky-bottom state must be global so image handler can read it
let shouldStickToBottom = true;

function getChatEl() {
    return unsafeWindow.document.getElementsByClassName("chat-lines")[0];
}
function isAtBottom(el, threshold = 2) {
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
}
function scrollToBottom(el) {
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
}
let addSettings = () => {

    let settingsArea = document.querySelector("#chat-settings-form");

    // Settings Title
    let settingsTitle = document.createElement("h4");
    settingsTitle.innerHTML = "D.GG Img Preview Settings";

    // Blur Nsfw
    let blurNsfw = document.createElement("div");
    blurNsfw.className = "form-group checkbox";

    let blurNsfwLabel = document.createElement("label");
    blurNsfwLabel.innerHTML = "Blur nsfw/nsfl images";
    blurNsfw.appendChild(blurNsfwLabel);

    let blurNsfwCheck = document.createElement("input");
    blurNsfwCheck.name = "blurNsfw";
    blurNsfwCheck.type = "checkbox";
    blurNsfwCheck.checked = config.BlurNSFW;
    blurNsfwCheck.addEventListener("change", () => {
        config.BlurNSFW = blurNsfwCheck.checked;
    });
    blurNsfwLabel.prepend(blurNsfwCheck);

    // Hide Link
    let hideLink = document.createElement("div");
    hideLink.className = "form-group checkbox";

    let hideLinkLabel = document.createElement("label");
    hideLinkLabel.innerHTML = "Hide Link from previewed messages";
    hideLink.appendChild(hideLinkLabel);

    let hideLinkCheck = document.createElement("input");
    hideLinkCheck.name = "HideLink";
    hideLinkCheck.type = "checkbox";
    hideLinkCheck.checked = config.HideLink;
    hideLinkCheck.addEventListener("change", () => {
        config.HideLink = hideLinkCheck.checked;
    });
    hideLinkLabel.prepend(hideLinkCheck);

    // Add to settings
    settingsArea.appendChild(settingsTitle);
    settingsArea.appendChild(blurNsfw);
    settingsArea.appendChild(hideLink);

    console.log("[D.gg Img Preview] Settings Added");
};

// END STOLEN FROM VYNEER

function waitForElm(selector) { // stolen from stack overflow
    return new Promise(resolve => {
        if (unsafeWindow.document.querySelector(selector)) {
            return resolve(unsafeWindow.document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (unsafeWindow.document.querySelector(selector)) {
                resolve(unsafeWindow.document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(unsafeWindow.document.body, {
            childList: true,
            subtree: true
        });
    });
}

let chatObserver = new MutationObserver(function (mutations) {
    if (mutations[0].addedNodes[0] && mutations[0].addedNodes[0].tagName == "DIV" && mutations[0].addedNodes[0].querySelector(".externallink")) {
        let links = mutations[0].addedNodes[0].querySelectorAll(".externallink ");
        links.forEach((el) => {
            if (imageRegex.test(el.href)) {

                GM_xmlhttpRequest({ // get image data since csp blocks us from just using the url directly
                    method: "GET",
                    url: el.href,
                    responseType: 'blob',
                    onload: function (res) {

                        var reader = new FileReader();
                        reader.readAsDataURL(res.response);

                        reader.onloadend = function () {

                            var base64data = reader.result;
                            let PreviewImage = unsafeWindow.document.createElement("img");

                            PreviewImage.src = base64data;

                            PreviewImage.style.maxHeight = "300px";
                            PreviewImage.style.maxWidth = "300px";
                            PreviewImage.style.marginLeft = "5px";
                            PreviewImage.style.marginBottom = "10px";
                            PreviewImage.style.marginTop = "10px";
                            PreviewImage.style.display = "block";
                            PreviewImage.style.cursor = "pointer";

                            let blurred = false;
                            if (el.className.includes("nsfw") && config.BlurNSFW || el.className.includes("nsfl") && config.BlurNSFW) {
                                PreviewImage.style.filter = "blur(15px)";
                                blurred = true;
                            }

                            // PEPE WINS

                            PreviewImage.onclick = () => {
                                if (blurred) {
                                    PreviewImage.style.filter = "blur(0px)";
                                    blurred = false;
                                } else {
                                    overlay.style.display = "flex";
                                    let PreviewImg = unsafeWindow.document.createElement("img");
                                    PreviewImg.src = base64data;
                                    PreviewImg.style.maxHeight = "70%";
                                    PreviewImg.style.maxWidth = "70%";
                                    PreviewImg.style.display = "block";
                                    PreviewImg.style.position = "relative";

                                    overlay.appendChild(PreviewImg);

                                    let openOriginal = document.createElement("a");
                                    openOriginal.href = el.href;
                                    openOriginal.innerHTML = "Open Original";
                                    openOriginal.target = "_blank";
                                    openOriginal.style.marginTop = "5px";
                                    openOriginal.style.color = "#999";
                                    overlay.appendChild(openOriginal);
                                }
                            };

                            el.parentNode.appendChild(PreviewImage);
                            if (config.HideLink) { el.remove(); }

                            // append image, then only scroll if user was at bottom
                            const chatEl = unsafeWindow.document.getElementsByClassName("chat-lines")[0];
                            const _onReady = () => {
                                if (shouldStickToBottom) {
                                    requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; });
                                }
                            };

                            if ('decode' in PreviewImage && typeof PreviewImage.decode === 'function') {
                                PreviewImage.decode().then(_onReady).catch(_onReady);
                            } else {
                                PreviewImage.addEventListener('load', _onReady, { once: true });
                                PreviewImage.addEventListener('error', _onReady, { once: true });
                            }

                            el.parentNode.appendChild(PreviewImage);
                            if (config.HideLink) { el.remove(); }

                        };

                    }
                });
            }
        });
    }
});
console.log("[D.gg Img Preview] Connecting");
waitForElm('.chat-lines').then((elm) => {
    // overlay
    overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.inset = "0px";
    overlay.style.margin = "0px";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "999";
    overlay.style.height = "100%";
    overlay.style.width = "100%";
    overlay.style.display = "none";
    overlay.style.flexDirection = "column";
    overlay.onclick = () => { overlay.style.display = "none"; overlay.innerHTML = ""; };
    document.body.appendChild(overlay);

    // --- sticky-bottom engine ---
    const chatEl = elm; // already resolved by waitForElm

    // initialize & track user intent
    shouldStickToBottom = isAtBottom(chatEl);
    chatEl.addEventListener('scroll', () => {
        shouldStickToBottom = isAtBottom(chatEl);
    }, { passive: true });

    // re-pin on growth (images decoding / layout changes)
    const ro = new ResizeObserver(() => {
        if (shouldStickToBottom) scrollToBottom(chatEl);
    });
    ro.observe(chatEl);

    // start observing chat for new messages
    chatObserver.observe(chatEl, { attributes: false, childList: true, characterData: false, subtree: true });

    console.log("[D.gg Img Preview] Connected");
    console.log("[D.gg Img Preview] Adding Settings");
    addSettings();
});


