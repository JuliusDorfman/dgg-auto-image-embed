// ==UserScript==
// @name        DGG Auto Image Embed (Actively Maintained + Growing list of Img Hosts)
// @namespace   boofus
// @description Preview images linked in destiny.gg chat. NSFW blur, hide-link, sticky autoscroll, optional 4chan block. Stable de-duplication + Imgur page/album resolver.
// @match       https://www.destiny.gg/embed/chat*
// @icon        https://cdn.destiny.gg/2.49.0/emotes/6296cf7e8ccd0.png
// @version     10.5.0
// @author      boofus (credits: legolas, vyneer, cyclone, Torrniquet)
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// @connect     discordapp.net
// @connect     discordapp.com
// @connect     pbs.twimg.com
// @connect     polecat.me
// @connect     imgur.com
// @connect     i.imgur.com
// @connect     gyazo.com
// @connect     redd.it
// @connect     i.redd.it
// @connect     files.catbox.moe
// @connect     catbox.moe
// @connect     i.4cdn.org
// @connect     i.kym-cdn.com
// @connect     femboy.beauty
// @connect     kappa.lol
// @downloadURL https://update.greasyfork.org/scripts/547316/DGG%20Auto%20Image%20Embed%20%28Actively%20Maintained%20%2B%20Growing%20list%20of%20Img%20Hosts%29.user.js
// @updateURL https://update.greasyfork.org/scripts/547316/DGG%20Auto%20Image%20Embed%20%28Actively%20Maintained%20%2B%20Growing%20list%20of%20Img%20Hosts%29.meta.js
// ==/UserScript==
