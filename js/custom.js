(function(){
"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var app = angular.module('viewCustom', ['angularLoad', 'externalSearch']);

/**
 * Alert Bar
 *
 * To show an alert:
 *  - change the value of the 'showAlert' variable below to 'true'
 *  - edit the value of the 'alertText' variable below to the desired text/HTML
 *
 *  To hide an alert:
 *  - change the value of the 'showAlert' variable below to 'false'
 */

var showAlert = true;
var alertText = "Update: Moffitt Library is closed for seismic work, but most other libraries are open. <a href=\"https://www.lib.berkeley.edu/help/research-help/remote-resources\">Learn more</a>.";

var topbarWrapper = document.getElementsByClassName('topbar-wrapper');
var alertBanner = window.setInterval(function () {
     if (showAlert) {
          // Create alert bar element
          var alertBarDiv = document.createElement('div');
          alertBarDiv.id = "primo-alert-bar";
          // Get the alert message
          alertBarDiv.innerHTML = "<p>" + alertText + "</p>";
          // Append the element to the wrapper (can't use straight up prepend() because of IE)
          topbarWrapper[0].insertBefore(alertBarDiv, topbarWrapper[0].firstChild);
     }
     clearInterval(alertBanner);
}, 1000);
/**
 * Add footer
 */
app.component('prmExploreFooterAfter', {
     bindings: { parentCtrl: '<' },
     controller: 'ExploreFooterAfterController',
     templateUrl: 'custom/01UCS_BER-UCB/html/prmExploreFooterAfter.html'
});
/**
 * Libchat
 *
 * */
(function () {
     var options = {
          "id": 20726,
          "hash": "e3cba83ef74e8285af62ba3fb7e93af6",
          "base_domain": "v2.libanswers.com",
          "iid": 2539,
          "onlinerules": [{ "u": 0, "d": [5250], "c": "" }, {
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
          "autoload_time": 0,
          "slidebutton_height": "40px",
          "slidebutton_width": "90px",
          "slidebutton_bcolor": "#FDB515",
          "slidebutton_color": "#ffffff",
          "slidebutton_bcolor_off": "#FDB515",
          "slidebutton_color_off": "#ffffff",
          "slidebutton_url": "custom\/01UCS_BER-UCB\/img\/chat-button.svg",
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
     var removeCoverageFromRule = function removeCoverageFromRule(rule) {
          return { u: rule.u, d: rule.d, c: rule.c, fallbackSeconds: rule.fallbackSeconds || 0 };
     },
         isCoverageInRange = function isCoverageInRange(hour, minute, ranges) {
          if (0 === ranges.length) return !1;
          for (var i = 0; i <= ranges.length; i++) {
               var range = ranges[i];
               if (!Array.isArray(range) || 2 !== range.length) continue;
               var start = range[0].split(":").map(function (el) {
                    return parseInt(el, 10);
               }),
                   end = range[1].split(":").map(function (el) {
                    return parseInt(el, 10);
               });
               if (!(start[0] > hour || end[0] < hour)) {
                    if (start[0] < hour && end[0] > hour) return !0;
                    if (start[0] !== hour) {
                         if (end[0] !== hour) ;else if (end[1] > minute) return !0;
                    } else if (start[1] < minute) return !0;
               }
          }
          return !1;
     };
     var adjustStatusRequestForCoverage = function adjustStatusRequestForCoverage(onlineRules) {
          var finalRules = [],
              now = new Date(),
              day = now.getUTCDay(),
              hour = now.getUTCHours(),
              minute = now.getUTCMinutes();
          return onlineRules.forEach(function (rule) {
               if (!rule.c || 1 === rule.coverageType) return void finalRules.push(removeCoverageFromRule(rule));
               if (0 === rule.coverageType) return;
               var times = rule.coverageHours;
               if (!times || !times[day] || 0 === times[day].length) return;
               var ranges = times[day];
               isCoverageInRange(hour, minute, ranges) && finalRules.push(removeCoverageFromRule(rule));
          }), finalRules;
     };
     ;
     var floatWidget = {
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
          insertWidgetCSS: function insertWidgetCSS() {
               var css = '/* LibChat Widget CSS */\n            .s-lch-widget-float { position: fixed; bottom: 1px; right: 1px; z-index: 1000; padding: 1em; font-size: 16px; display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; -ms-flex-wrap: nowrap; flex-wrap: nowrap; -ms-flex-pack: end; justify-content: flex-end; -ms-flex-line-pack: end; align-content: flex-end; -ms-flex-align: end; align-items: flex-end; box-sizing: border-box; pointer-events: none; }\n            .s-lch-widget-float.open { top: 1px; width: ' + this.config.width + '; height: 100%; }\n            .s-lch-widget-float > * { pointer-events: auto; }\n            .s-lch-widget-float-load { -ms-flex: 0 1 auto; flex: 0 1 auto; display: none; transition: flex-grow 2s; border-radius: 5px; border: 1px solid rgb(221, 221, 221); box-shadow: 0.1em 0.2em 0.5em #ccc; min-height: 200px; width: 100%; height: 200px; }\n            .s-lch-widget-float-load.expanded { -ms-flex: 2 1 auto; flex: 2 1 auto; min-height: 0; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { display: block; }\n            .s-lch-widget-float-btn { border: none; padding: .75em .75em .5em .75em; border-radius: 5px; position: relative; bottom: 0; right: 0; -ms-flex: 0 0 auto; flex: 0 0 auto; box-shadow: 0.1em 0.2em 0.5em #ccc; font-size: .9em; background-color: ' + this.config.slidebutton_bcolor_off + '; color: ' + this.config.slidebutton_color_off + '; width: 4em; height: 3.75em; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { margin-top: 1em; }\n            .s-lch-widget-float-btn.online { background-color: ' + this.config.slidebutton_bcolor + '; color: ' + this.config.slidebutton_color + '; }\n            .s-lch-widget-float-btn svg .dots { display: none; }\n            .s-lch-widget-float-btn.online svg .dots { display: block; }\n            .s-lch-widget-float-btn.s-lch-widget-img-btn, .s-lch-widget-float-btn img { padding: 0; height: ' + this.config.slidebutton_height + '; width: ' + this.config.slidebutton_width + '; }\n            #s-lch-widget-float-indicator { position: absolute; top: -.5em; right: -.5em; background-color: red; border-radius: 1em; width: 1em; height: 1em; }\n            @media (max-width: 550px) {\n            .s-lch-widget-float { left: 0; width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { display: none; }\n            }',
                   head = document.head || document.getElementsByTagName("head")[0],
                   style = document.createElement("style");
               style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css)), head.appendChild(style);
          },
          isNarrowScreen: function isNarrowScreen() {
               if (null !== this.narrowScreen) return this.narrowScreen;
               var mediaQuery = window.matchMedia("(max-width: 700px)");
               return this.narrowScreen = mediaQuery.matches, this.narrowScreen;
          },
          getWidgetUrl: function getWidgetUrl() {
               "" === this.referer && (this.referer = window.location.href), "" === this.refererTitle && window.document.title && (this.refererTitle = window.document.title);
               var qs = 'https://' + this.config.base_domain + '/chati.php?hash=' + this.config.hash + '&referer=' + encodeURIComponent(this.referer) + '&referer_title=' + encodeURIComponent(this.refererTitle);
               return this.autoload && (qs += "&auto=true", this.autoload = !1), qs;
          },
          statusError: function statusError() {
               this.online = !1, this.buildButton();
          },
          statusSuccess: function statusSuccess(data) {
               this.online = !1, (data.u || data.d || data.c) && (this.online = !0), this.buildButton();
               var isCoopOnline = !1;
               data.c && data.c.length > 0 && (isCoopOnline = !0), this.setTimer(isCoopOnline);
          },
          statusComplete: function statusComplete(ev) {
               var xhr = ev.target,
                   status = xhr.status;
               if (status >= 200 && status < 300) try {
                    this.statusSuccess(JSON.parse(xhr.responseText));
               } catch (e) {
                    this.statusError();
               } else this.statusError();
          },
          checkStatus: function checkStatus() {
               var adjustedRules = adjustStatusRequestForCoverage(this.config.onlinerules),
                   xhr = new XMLHttpRequest();
               xhr.onload = this.statusComplete.bind(this), xhr.onerror = this.statusError.bind(this), xhr.open("GET", this.cascadeServer + '/widget_status?iid=' + this.config.iid + '&rules=' + encodeURIComponent(JSON.stringify(adjustedRules))), xhr.send();
          },
          autoPopDenied: function autoPopDenied() {
               try {
                    var obj = localStorage.getItem("libchat_auto");
                    if ("" === obj) return !1;
                    obj = JSON.parse(obj);
                    return !(Math.floor(Date.now() / 1e3) - obj.date > 3600) || (this.deleteAutoPopDeny(), !1);
               } catch (e) {
                    this.deleteAutoPopDeny();
               }
               return !1;
          },
          deleteAutoPopDeny: function deleteAutoPopDeny() {
               try {
                    localStorage.removeItem("libchat_auto");
               } catch (e) {}
          },
          showMsgNotice: function showMsgNotice() {
               this.indicator || (this.indicator = document.createElement("span"), this.indicator.id = "s-lch-widget-float-indicator"), null === this.indicator.parentNode && this.chat_button.appendChild(this.indicator), this.indicator.style.display = "block";
          },
          hideMsgNotice: function hideMsgNotice() {
               this.indicator && (this.indicator.style.display = "none");
          },
          handleMessages: function handleMessages(e) {
               var data = e.data;
               "object" == (typeof data === 'undefined' ? 'undefined' : _typeof(data)) && data.action && ("closeWidget" === data.action ? this.closeWidget() : "chatStarted" === data.action || "expandWidget" === data.action ? this.chat_load.classList.contains("expanded") || (this.chat_load.classList.add("expanded"), this.chat_load.style.minHeight = 0) : "autopop" === data.action ? this.openWidget() : "height" === data.action ? null !== this.chat_load && data.height && (this.chat_load.style.minHeight = data.height + "px") : "newMessage" === data.action && "true" === this.chat_load.getAttribute("aria-hidden") && this.showMsgNotice());
          },
          closeWidget: function closeWidget() {
               this.chat_load.removeAttribute("aria-live"), this.chat_load.setAttribute("aria-hidden", "true"), this.chat_div.classList.remove("open"), this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_show), this.chat_button.setAttribute("title", this.config.translation.ch_float_show), this.chat_button.setAttribute("aria-expanded", !1), this.chat_load.contentWindow.postMessage("closeChatWidget", 'https://' + this.config.base_domain + '/');
          },
          openWidget: function openWidget() {
               this.chat_div.classList.contains("open") || this.chat_div.classList.add("open"), this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_hide), this.chat_button.setAttribute("title", this.config.translation.ch_float_hide), this.chat_button.setAttribute("aria-expanded", !0), this.hideMsgNotice(), null === this.chat_load ? this.loadIframe() : this.chat_load.setAttribute("aria-hidden", "false");
          },
          loadIframe: function loadIframe() {
               var chatUrl = this.getWidgetUrl();
               this.chat_load = document.createElement("iframe"), this.chat_load.setAttribute("id", "iframe_" + this.config.hash), this.chat_load.setAttribute("name", "iframe_" + this.config.hash), this.chat_load.setAttribute("src", chatUrl), this.chat_load.setAttribute("title", "Chat Widget"), this.chat_load.setAttribute("scrolling", "no"), this.chat_load.className = "s-lch-widget-float-load", this.chat_load.setAttribute("aria-live", "polite"), this.chat_load.setAttribute("aria-hidden", "false"), this.chat_load.innerHTML = "Content is loading...", this.chat_div.insertBefore(this.chat_load, this.chat_button), window.addEventListener("message", this.handleMessages.bind(this));
          },
          autoOpenWidget: function autoOpenWidget() {
               this.autoload = !0, this.loadIframe();
          },
          toggleWidget: function toggleWidget() {
               window.clearTimeout(this.chat_timer), this.chat_div.classList.contains("open") ? this.closeWidget() : this.openWidget();
          },
          showButton: function showButton() {
               this.chat_button.style.display = "";
          },
          setTimer: function setTimer(isCoopOnline) {
               if (!this.isNarrowScreen()) if (this.online) {
                    if (isCoopOnline) return;
                    this.config.autoload_time && parseInt(this.config.autoload_time, 10) > 0 && !this.autoPopDenied() && (this.chat_timer = window.setTimeout(this.autoOpenWidget.bind(this), 1e3 * parseInt(this.config.autoload_time, 10)));
               } else this.autoload = !1;
          },
          buildButton: function buildButton() {
               this.chat_button = document.createElement("button"), this.chat_button.setAttribute("aria-controls", "s-lch-widget-" + this.config.id), this.chat_button.setAttribute("aria-expanded", !1), this.chat_button.setAttribute("type", "button"), this.chat_button.className = "s-lch-widget-float-btn", this.online && this.chat_button.classList.add("online");
               var img_prop = this.online ? "slidebutton_url" : "slidebutton_url_off",
                   text_prop = this.online ? "slidebutton_text" : "slidebutton_text_off";
               if ("" !== this.config[img_prop]) {
                    this.chat_button.style.display = "none";
                    var img = document.createElement("img");
                    img.addEventListener("load", this.showButton.bind(this)), img.setAttribute("src", this.config[img_prop]), img.setAttribute("alt", this.config[text_prop]), this.chat_button.classList.add("s-lch-widget-img-btn"), this.chat_button.appendChild(img);
               } else this.chat_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 78" role="img" aria-labelledby="s-lch-widget-float-img-title"><title id="s-lch-widget-float-img-title">' + this.config[text_prop] + '</title><path fill="#FFF" stroke="#000" stroke-width="4.365" stroke-linecap="round" stroke-linejoin="round" d="M18.116 3.513h48.766c7.875 0 14.282 6.407 14.282 14.28v29.684c0 7.875-6.407 14.28-14.282 14.28H33.22l-12.17 12.17c-.366.367-.855.56-1.344.56-.245 0-.49-.052-.733-.14-.716-.297-1.17-.994-1.17-1.764V61.758c-7.734-.175-13.968-6.513-13.968-14.28V17.793c.017-7.874 6.406-14.28 14.28-14.28z"/><g class="dots"><path d="M24.664 28.48c2.356 0 4.276 1.92 4.276 4.278 0 2.373-1.92 4.276-4.276 4.276-2.357 0-4.277-1.92-4.277-4.276-.018-2.357 1.903-4.28 4.277-4.28zM42.508 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.92 4.276-4.277 4.276s-4.277-1.92-4.277-4.276c0-2.357 1.904-4.28 4.278-4.28zM60.352 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.922 4.276-4.278 4.276s-4.278-1.92-4.278-4.276c0-2.357 1.92-4.28 4.278-4.28z"/></g></svg>';
               this.chat_button.setAttribute("aria-label", this.config.translation.ch_float_start), this.chat_button.setAttribute("title", this.config.translation.ch_float_start), this.chat_div.appendChild(this.chat_button), this.isNarrowScreen() ? this.chat_button.addEventListener("click", this.openChat.bind(this)) : this.chat_button.addEventListener("click", this.toggleWidget.bind(this));
          },
          openChat: function openChat() {
               var chatUrl = this.getWidgetUrl();
               window.open(chatUrl, "libchat", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' + this.config.width + ', height=' + this.config.height);
          },
          start: function start() {
               !0 !== this.loaded && (this.loaded = !0, this.insertWidgetCSS(), this.chat_div = document.createElement("div"), this.chat_div.id = "s-lch-widget-" + this.config.id, this.chat_div.setAttribute("role", "region"), this.chat_div.setAttribute("aria-label", "Chat Widget"), this.chat_div.className = "s-lch-widget-float", document.body.appendChild(this.chat_div), this.checkStatus());
          }
     };
     floatWidget.config = options, floatWidget.cascadeServer = cascadeServer, floatWidget.referer = referer, floatWidget.refererTitle = refererTitle, window.openChat = floatWidget.openChat.bind(floatWidget), "complete" === document.readyState || "interactive" === document.readyState ? floatWidget.start() : (document.addEventListener("DOMContentLoaded", floatWidget.start.bind(floatWidget), !1), window.addEventListener("load", floatWidget.start.bind(floatWidget), !1));
})();
/* UC Library Search logo
* Code adapted from CSU Central Package by David Walker
* https://github.com/dswalker/csu-central-package/
*
*/

app.component('prmSearchBarAfter', {
     bindings: { parentCtrl: '<' },
     controller: 'SearchBarAfterController',
     templateUrl: 'custom/01UCS_BER-UCB/html/prmSearchBarAfter.html'
});

app.controller('SearchBarAfterController', ['$location', '$window', function ($location, $window) {
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

/**
 * Add WorldCat
 */

app.value('searchTargets', [{
     "name": "Search in Worldcat",
     "desc": "for advanced filtering options",
     "url": "https://berkeley.on.worldcat.org/search?",
     "img": "custom/01UCS_BER-UCB/img/worldcat-logo.png",
     mapping: function mapping(queries, filters) {
          var query_mappings = {
               'any': 'kw',
               'title': 'ti',
               'creator': 'au',
               'subject': 'su',
               'isbn': 'bn',
               'issn': 'n2'
          };
          try {
               return 'queryString=' + queries.map(function (part) {
                    var terms = part.split(',');
                    var type = query_mappings[terms[0]] || 'kw';
                    var string = terms[2] || '';
                    var join = terms[3] || '';
                    return type + ':' + string + ' ' + join + ' ';
               }).join('');
          } catch (e) {
               return '';
          }
     }
}]);

/*
 * From https://github.com/alliance-pcsg/primo-explore-external-search
 *
 * With customizations, all commented below.
 */
angular.module('externalSearch', []).value('searchTargets', []).component('prmFacetAfter', {
     bindings: { parentCtrl: '<' },
     controller: ['externalSearchService', function (externalSearchService) {
          externalSearchService.controller = this.parentCtrl;
          externalSearchService.addExtSearch();
     }]
}).component('prmPageNavMenuAfter', {
     controller: ['externalSearchService', function (externalSearchService) {
          if (externalSearchService.controller) externalSearchService.addExtSearch();
     }]
}).component('prmFacetExactAfter', {
     bindings: { parentCtrl: '<' },
     /* Customized the template. Removed some div with chips classes. Added target.desc and span wrapper.
        Changed width/height to 40. */
     templateUrl: 'custom/01UCS_BER-UCB/html/prmFacetExactAfter.html',
     controller: ['$scope', '$location', 'searchTargets', function ($scope, $location, searchTargets) {
          $scope.name = this.parentCtrl.facetGroup.name;
          $scope.targets = searchTargets;
          var query = $location.search().query;
          var filter = $location.search().pfilter;
          $scope.queries = Array.isArray(query) ? query : query ? [query] : false;
          $scope.filters = Array.isArray(filter) ? filter : filter ? [filter] : false;
          /*
           * Customized to replace "University of California" with "UC" in facets and to alphabetize the list.
           */
          if ($scope.name == 'institution') {
               // Once the institutions facets load, find them in the document.
               var institutionFacets = document.querySelector('[data-facet-group="institution"]');
               // Facets are created and destroyed in the DOM when the group is toggled so watch for clicks
               institutionFacets.addEventListener('click', function () {
                    // There is a slight delay as Alma loads the facets, so check on a tight interval
                    var i = 0;
                    var institutionsInterval = window.setInterval(function () {
                         var institutions = institutionFacets.getElementsByClassName('text-number-space');
                         // When found, cycle through the institutions and replace the text as appropriate
                         if (institutions.length > 0) {
                              var _iteratorNormalCompletion = true;
                              var _didIteratorError = false;
                              var _iteratorError = undefined;

                              try {
                                   for (var _iterator = institutions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var oneInst = _step.value;

                                        oneInst.textContent = oneInst.textContent.replace(',', '');
                                        oneInst.textContent = oneInst.textContent.replace('University of California', 'UC');
                                        oneInst.title = oneInst.title.replace(',', '');
                                        oneInst.title = oneInst.title.replace('University of California', 'UC');
                                        clearInterval(institutionsInterval);
                                   }
                                   // Now alphabetize! First, get the better query for doing this.
                              } catch (err) {
                                   _didIteratorError = true;
                                   _iteratorError = err;
                              } finally {
                                   try {
                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                             _iterator.return();
                                        }
                                   } finally {
                                        if (_didIteratorError) {
                                             throw _iteratorError;
                                        }
                                   }
                              }

                              var elems = institutionFacets.getElementsByClassName('md-chip');
                              console.log("Elems: ", elems);
                              // turn into a sortable array
                              elems = Array.prototype.slice.call(elems);
                              // Sort it.
                              elems.sort(function (a, b) {
                                   return a.textContent.localeCompare(b.textContent);
                              });
                              // Reattached the sorted elements
                              for (var i = 0; i < elems.length; i++) {
                                   var parent = elems[i].parentNode;
                                   var detatchedItem = parent.removeChild(elems[i]);
                                   parent.appendChild(detatchedItem);
                              }
                         }
                         // Only try 10 times before exiting.
                         i > 10 ? clearInterval(institutionsInterval) : i++;
                    }, 100);
               });
          } // End UC facet customization
     }]
}).factory('externalSearchService', function () {
     return {
          get controller() {
               return this.prmFacetCtrl || false;
          },
          set controller(controller) {
               this.prmFacetCtrl = controller;
          },
          addExtSearch: function addExtSearch() {
               // Changed this conditional to look for our intended scope.
               if (this.prmFacetCtrl.$stateParams.search_scope == 'WorldCat') {
                    this.prmFacetCtrl.facetService.results.unshift({
                         name: 'External Search',
                         displayedType: 'exact',
                         limitCount: 0,
                         facetGroupCollapsed: false,
                         values: undefined
                    });
               }
          }
     };
});
})();