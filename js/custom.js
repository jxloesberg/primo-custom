(function () {
     "use strict";
     'use strict';


     var app = angular.module('viewCustom', ['angularLoad']);

     /****************************************************************************************************/

     /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

     /*var app = angular.module('centralCustom', ['angularLoad']);*/

     /****************************************************************************************************/

     /* UC Library Search logo
 * Code adapted from CSU Central Package by David Walker
 * https://github.com/dswalker/csu-central-package/
 *
 */
     app.component('prmSearchBarAfter', {
          bindings: { parentCtrl: '<' },
          controller: 'SearchBarAfterController',
          templateUrl: 'custom/01UCS_BER-JESSE_TEST/html/prmSearchBarAfter.html',
     });

     app.controller('SearchBarAfterController', ['$location', '$window', function($location, $window){
          this.navigateToHomePage = function () {
               var params = $location.search();
               var vid = params.vid;
               var lang = params.lang || "en_US";
               var split = $location.absUrl().split('/discovery/');

               if (split.length === 1) {
                    console.log(split[0] + ' : Could not detect the view name!');
                    return false;
               }

               var baseUrl = split[0];
               $window.location.href = baseUrl + '/discovery/search?vid=' + vid + '&lang=' + lang;
               return true;
          };
     }]);


})();

(function () {
     var options = {
          "id": 20726,
          "hash": "e3cba83ef74e8285af62ba3fb7e93af6",
          "base_domain": "v2.libanswers.com",
          "iid": 2539,
          "onlinerules": [{"u": 0, "d": [5250], "c": ""}, {
               "u": 0,
               "d": [],
               "c": "64db2953-8bc2-11ea-ad82-0e1082533e2f",
               "coverageType": 1,
               "coverageHours": {},
               "fallbackSeconds": 0
          }, {
               "u": 0,
               "d": [],
               "c": "7ecfef2d-1d12-11ea-af03-1205983d2cc2",
               "coverageType": 1,
               "coverageHours": {},
               "fallbackSeconds": 0
          }, {
               "u": 0,
               "d": [],
               "c": "9170771e-ba2d-11ea-b473-0a569fab77af",
               "coverageType": 1,
               "coverageHours": {},
               "fallbackSeconds": 40
          }],
          "width": "375px",
          "height": "300",
          "autoload_time": 10,
          "slidebutton_height": "80px",
          "slidebutton_width": "80px",
          "slidebutton_bcolor": "#286090",
          "slidebutton_color": "#ffffff",
          "slidebutton_bcolor_off": "#286090",
          "slidebutton_color_off": "#ffffff",
          "slidebutton_url": "https:\/\/www.lib.berkeley.edu\/sites\/default\/files\/askus.svg",
          "slidebutton_url_off": "",
          "slidebutton_text": "Chat with us",
          "slidebutton_text_off": "Offline",
          "translation": {
               "ch_float_show": "Open chat",
               "ch_float_hide": "Minimize chat",
               "ch_float_start": "Start chat"
          }
     };
     var cascadeServer = "https:\/\/chat-us.libanswers.com";
     var referer = "";
     var refererTitle = "";
     const removeCoverageFromRule = function (rule) {
          return {u: rule.u, d: rule.d, c: rule.c, fallbackSeconds: rule.fallbackSeconds || 0}
     }, isCoverageInRange = function (hour, minute, ranges) {
          if (0 === ranges.length) return !1;
          for (let i = 0; i <= ranges.length; i++) {
               const range = ranges[i];
               if (!Array.isArray(range) || 2 !== range.length) continue;
               const start = range[0].split(":").map(el => parseInt(el, 10)),
                    end = range[1].split(":").map(el => parseInt(el, 10));
               if (!(start[0] > hour || end[0] < hour)) {
                    if (start[0] < hour && end[0] > hour) return !0;
                    if (start[0] !== hour) {
                         if (end[0] !== hour) ; else if (end[1] > minute) return !0
                    } else if (start[1] < minute) return !0
               }
          }
          return !1
     };
     var adjustStatusRequestForCoverage = function (onlineRules) {
          const finalRules = [], now = new Date, day = now.getUTCDay(), hour = now.getUTCHours(),
               minute = now.getUTCMinutes();
          return onlineRules.forEach(rule => {
               if (!rule.c || 1 === rule.coverageType) return void finalRules.push(removeCoverageFromRule(rule));
               if (0 === rule.coverageType) return;
               const times = rule.coverageHours;
               if (!times || !times[day] || 0 === times[day].length) return;
               const ranges = times[day];
               isCoverageInRange(hour, minute, ranges) && finalRules.push(removeCoverageFromRule(rule))
          }), finalRules
     };
     ;
     const floatWidget = {
          config: {},
          online: !1,
          loaded: !1,
          autoload: !1,
          chat_load: null,
          chat_button: null,
          openBtnContent: "",
          chat_timer: null,
          referer: "",
          refererTitle: "",
          narrowScreen: null,
          insertWidgetCSS: function () {
               const css = `/* LibChat Widget CSS */\n            .s-lch-widget-float { position: fixed; bottom: 1px; right: 1px; z-index: 1000; padding: 1em; font-size: 16px; display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; -ms-flex-wrap: nowrap; flex-wrap: nowrap; -ms-flex-pack: end; justify-content: flex-end; -ms-flex-line-pack: end; align-content: flex-end; -ms-flex-align: end; align-items: flex-end; box-sizing: border-box; pointer-events: none; }\n            .s-lch-widget-float.open { top: 1px; width: ${this.config.width}; height: 100%; }\n            .s-lch-widget-float > * { pointer-events: auto; }\n            .s-lch-widget-float-load { -ms-flex: 0 1 auto; flex: 0 1 auto; display: none; transition: flex-grow 2s; border-radius: 5px; border: 1px solid rgb(221, 221, 221); box-shadow: 0.1em 0.2em 0.5em #ccc; min-height: 200px; width: 100%; height: 200px; }\n            .s-lch-widget-float-load.expanded { -ms-flex: 2 1 auto; flex: 2 1 auto; min-height: 0; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { display: block; }\n            .s-lch-widget-float-btn { border: none; padding: .75em .75em .5em .75em; border-radius: 5px; position: relative; bottom: 0; right: 0; -ms-flex: 0 0 auto; flex: 0 0 auto; box-shadow: 0.1em 0.2em 0.5em #ccc; font-size: .9em; background-color: ${this.config.slidebutton_bcolor_off}; color: ${this.config.slidebutton_color_off}; width: 4em; height: 3.75em; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { margin-top: 1em; }\n            .s-lch-widget-float-btn.online { background-color: ${this.config.slidebutton_bcolor}; color: ${this.config.slidebutton_color}; }\n            .s-lch-widget-float-btn svg .dots { display: none; }\n            .s-lch-widget-float-btn.online svg .dots { display: block; }\n            .s-lch-widget-float-btn.s-lch-widget-img-btn, .s-lch-widget-float-btn img { padding: 0; height: ${this.config.slidebutton_height}; width: ${this.config.slidebutton_width}; }\n            #s-lch-widget-float-indicator { position: absolute; top: -.5em; right: -.5em; background-color: red; border-radius: 1em; width: 1em; height: 1em; }\n            @media (max-width: 550px) {\n            .s-lch-widget-float { left: 0; width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { display: none; }\n            }`,
                    head = document.head || document.getElementsByTagName("head")[0],
                    style = document.createElement("style");
               style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css)), head.appendChild(style)
          },
          isNarrowScreen: function () {
               if (null !== this.narrowScreen) return this.narrowScreen;
               const mediaQuery = window.matchMedia("(max-width: 700px)");
               return this.narrowScreen = mediaQuery.matches, this.narrowScreen
          },
          getWidgetUrl: function () {
               "" === this.referer && (this.referer = window.location.href), "" === this.refererTitle && window.document.title && (this.refererTitle = window.document.title);
               let qs = `https://${this.config.base_domain}/chati.php?hash=${this.config.hash}&referer=${encodeURIComponent(this.referer)}&referer_title=${encodeURIComponent(this.refererTitle)}`;
               return this.autoload && (qs += "&auto=true", this.autoload = !1), qs
          },
          statusError: function () {
               this.online = !1, this.buildButton()
          },
          statusSuccess: function (data) {
               this.online = !1, (data.u || data.d || data.c) && (this.online = !0), this.buildButton();
               let isCoopOnline = !1;
               data.c && data.c.length > 0 && (isCoopOnline = !0), this.setTimer(isCoopOnline)
          },
          statusComplete: function (ev) {
               const xhr = ev.target, status = xhr.status;
               if (status >= 200 && status < 300) try {
                    this.statusSuccess(JSON.parse(xhr.responseText))
               } catch (e) {
                    this.statusError()
               } else this.statusError()
          },
          checkStatus: function () {
               const adjustedRules = adjustStatusRequestForCoverage(this.config.onlinerules), xhr = new XMLHttpRequest;
               xhr.onload = this.statusComplete.bind(this), xhr.onerror = this.statusError.bind(this), xhr.open("GET", `${this.cascadeServer}/widget_status?iid=${this.config.iid}&rules=${encodeURIComponent(JSON.stringify(adjustedRules))}`), xhr.send()
          },
          autoPopDenied: function () {
               try {
                    let obj = localStorage.getItem("libchat_auto");
                    if ("" === obj) return !1;
                    obj = JSON.parse(obj);
                    return !(Math.floor(Date.now() / 1e3) - obj.date > 3600) || (this.deleteAutoPopDeny(), !1)
               } catch (e) {
                    this.deleteAutoPopDeny()
               }
               return !1
          },
          deleteAutoPopDeny: function () {
               try {
                    localStorage.removeItem("libchat_auto")
               } catch (e) {
               }
          },
          showMsgNotice: function () {
               this.indicator || (this.indicator = document.createElement("span"), this.indicator.id = "s-lch-widget-float-indicator"), null === this.indicator.parentNode && this.chat_button.appendChild(this.indicator), this.indicator.style.display = "block"
          },
          hideMsgNotice: function () {
               this.indicator && (this.indicator.style.display = "none")
          },
          handleMessages: function (e) {
               const data = e.data;
               "object" == typeof data && data.action && ("closeWidget" === data.action ? this.closeWidget() : "chatStarted" === data.action || "expandWidget" === data.action ? this.chat_load.classList.contains("expanded") || (this.chat_load.classList.add("expanded"), this.chat_load.style.minHeight = 0) : "autopop" === data.action ? this.openWidget() : "height" === data.action ? null !== this.chat_load && data.height && (this.chat_load.style.minHeight = data.height + "px") : "newMessage" === data.action && "true" === this.chat_load.getAttribute("aria-hidden") && this.showMsgNotice())
          },
          closeWidget: function () {
               this.chat_load.removeAttribute("aria-live"), this.chat_load.setAttribute("aria-hidden", "true"), this.chat_div.classList.remove("open"), this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_show), this.chat_button.setAttribute("title", this.config.translation.ch_float_show), this.chat_button.setAttribute("aria-expanded", !1), this.chat_load.contentWindow.postMessage("closeChatWidget", `https://${this.config.base_domain}/`)
          },
          openWidget: function () {
               this.chat_div.classList.contains("open") || this.chat_div.classList.add("open"), this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_hide), this.chat_button.setAttribute("title", this.config.translation.ch_float_hide), this.chat_button.setAttribute("aria-expanded", !0), this.hideMsgNotice(), null === this.chat_load ? this.loadIframe() : this.chat_load.setAttribute("aria-hidden", "false")
          },
          loadIframe: function () {
               const chatUrl = this.getWidgetUrl();
               this.chat_load = document.createElement("iframe"), this.chat_load.setAttribute("id", "iframe_" + this.config.hash), this.chat_load.setAttribute("name", "iframe_" + this.config.hash), this.chat_load.setAttribute("src", chatUrl), this.chat_load.setAttribute("title", "Chat Widget"), this.chat_load.setAttribute("scrolling", "no"), this.chat_load.className = "s-lch-widget-float-load", this.chat_load.setAttribute("aria-live", "polite"), this.chat_load.setAttribute("aria-hidden", "false"), this.chat_load.innerHTML = "Content is loading...", this.chat_div.insertBefore(this.chat_load, this.chat_button), window.addEventListener("message", this.handleMessages.bind(this))
          },
          autoOpenWidget: function () {
               this.autoload = !0, this.loadIframe()
          },
          toggleWidget: function () {
               window.clearTimeout(this.chat_timer), this.chat_div.classList.contains("open") ? this.closeWidget() : this.openWidget()
          },
          showButton: function () {
               this.chat_button.style.display = ""
          },
          setTimer: function (isCoopOnline) {
               if (!this.isNarrowScreen()) if (this.online) {
                    if (isCoopOnline) return;
                    this.config.autoload_time && parseInt(this.config.autoload_time, 10) > 0 && !this.autoPopDenied() && (this.chat_timer = window.setTimeout(this.autoOpenWidget.bind(this), 1e3 * parseInt(this.config.autoload_time, 10)))
               } else this.autoload = !1
          },
          buildButton: function () {
               this.chat_button = document.createElement("button"), this.chat_button.setAttribute("aria-controls", "s-lch-widget-" + this.config.id), this.chat_button.setAttribute("aria-expanded", !1), this.chat_button.setAttribute("type", "button"), this.chat_button.className = "s-lch-widget-float-btn", this.online && this.chat_button.classList.add("online");
               const img_prop = this.online ? "slidebutton_url" : "slidebutton_url_off",
                    text_prop = this.online ? "slidebutton_text" : "slidebutton_text_off";
               if ("" !== this.config[img_prop]) {
                    this.chat_button.style.display = "none";
                    const img = document.createElement("img");
                    img.addEventListener("load", this.showButton.bind(this)), img.setAttribute("src", this.config[img_prop]), img.setAttribute("alt", this.config[text_prop]), this.chat_button.classList.add("s-lch-widget-img-btn"), this.chat_button.appendChild(img)
               } else this.chat_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 78" role="img" aria-labelledby="s-lch-widget-float-img-title"><title id="s-lch-widget-float-img-title">${this.config[text_prop]}</title><path fill="#FFF" stroke="#000" stroke-width="4.365" stroke-linecap="round" stroke-linejoin="round" d="M18.116 3.513h48.766c7.875 0 14.282 6.407 14.282 14.28v29.684c0 7.875-6.407 14.28-14.282 14.28H33.22l-12.17 12.17c-.366.367-.855.56-1.344.56-.245 0-.49-.052-.733-.14-.716-.297-1.17-.994-1.17-1.764V61.758c-7.734-.175-13.968-6.513-13.968-14.28V17.793c.017-7.874 6.406-14.28 14.28-14.28z"/><g class="dots"><path d="M24.664 28.48c2.356 0 4.276 1.92 4.276 4.278 0 2.373-1.92 4.276-4.276 4.276-2.357 0-4.277-1.92-4.277-4.276-.018-2.357 1.903-4.28 4.277-4.28zM42.508 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.92 4.276-4.277 4.276s-4.277-1.92-4.277-4.276c0-2.357 1.904-4.28 4.278-4.28zM60.352 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.922 4.276-4.278 4.276s-4.278-1.92-4.278-4.276c0-2.357 1.92-4.28 4.278-4.28z"/></g></svg>`;
               this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_start), this.chat_button.setAttribute("title", this.config.translation.ch_float_start), this.chat_div.appendChild(this.chat_button), this.isNarrowScreen() ? this.chat_button.addEventListener("click", this.openChat.bind(this)) : this.chat_button.addEventListener("click", this.toggleWidget.bind(this))
          },
          openChat: function () {
               const chatUrl = this.getWidgetUrl();
               window.open(chatUrl, "libchat", `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=${this.config.width}, height=${this.config.height}`)
          },
          start: function () {
               !0 !== this.loaded && (this.loaded = !0, this.insertWidgetCSS(), this.chat_div = document.createElement("div"), this.chat_div.id = "s-lch-widget-" + this.config.id, this.chat_div.setAttribute("role", "region"), this.chat_div.setAttribute("aria-label", "Chat Widget"), this.chat_div.className = "s-lch-widget-float", document.body.appendChild(this.chat_div), this.checkStatus())
          }
     };
     floatWidget.config = options, floatWidget.cascadeServer = cascadeServer, floatWidget.referer = referer, floatWidget.refererTitle = refererTitle, window.openChat = floatWidget.openChat.bind(floatWidget), "complete" === document.readyState || "interactive" === document.readyState ? floatWidget.start() : (document.addEventListener("DOMContentLoaded", floatWidget.start.bind(floatWidget), !1), window.addEventListener("load", floatWidget.start.bind(floatWidget), !1));
})();


