(function () {
   "use strict";
   'use strict';

   var app = angular.module('viewCustom', ['angularLoad', 'externalSearch', 'googleTagManager', 'hathiTrustAvailability']);


   var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
   } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
   };

   /**
    * HathiTrust Icon
    */
   app.component('prmSearchResultAvailabilityLineAfter', {
      template: '<hathi-trust-availability hide-online="true" msg="Available online with HathiTrust - Public Domain Access"></hathi-trust-availability>'
   });

   angular.module('hathiTrustAvailability', []).constant('hathiTrustBaseUrl', 'https://catalog.hathitrust.org/api/volumes/brief/json/').config(['$sceDelegateProvider', 'hathiTrustBaseUrl', function ($sceDelegateProvider, hathiTrustBaseUrl) {
      var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
      urlWhitelist.push(hathiTrustBaseUrl + '**');
      $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
   }]).factory('hathiTrust', ['$http', '$q', 'hathiTrustBaseUrl', function ($http, $q, hathiTrustBaseUrl) {
      var svc = {};

      var lookup = function lookup(ids) {
         if (ids.length) {
            var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
            return $http.jsonp(hathiTrustLookupUrl, {
               cache: true,
               jsonpCallbackParam: 'callback'
            }).then(function (resp) {
               return resp.data;
            });
         } else {
            return $q.resolve(null);
         }
      };

      // find a HT record URL for a given list of identifiers (regardless of copyright status)
      svc.findRecord = function (ids) {
         return lookup(ids).then(function (bibData) {
            for (var i = 0; i < ids.length; i++) {
               var recordId = Object.keys(bibData[ids[i]].records)[0];
               if (recordId) {
                  return $q.resolve(bibData[ids[i]].records[recordId].recordURL);
               }
            }
            return $q.resolve(null);
         }).catch(function (e) {
            console.error(e);
         });
      };

      // find a public-domain HT record URL for a given list of identifiers
      svc.findFullViewRecord = function (ids) {
         var handleResponse = function handleResponse(bibData) {
            var fullTextUrl = null;
            for (var i = 0; !fullTextUrl && i < ids.length; i++) {
               var result = bibData[ids[i]];
               for (var j = 0; j < result.items.length; j++) {
                  var item = result.items[j];
                  if (item.usRightsString.toLowerCase() === 'full view') {
                     fullTextUrl = result.records[item.fromRecord].recordURL;
                     break;
                  }
               }
            }
            return $q.resolve(fullTextUrl);
         };
         return lookup(ids).then(handleResponse).catch(function (e) {
            console.error(e);
         });
      };

      return svc;
   }]).controller('hathiTrustAvailabilityController', ['hathiTrust', function (hathiTrust) {
      var self = this;

      self.$onInit = function () {
         if (!self.msg) self.msg = 'Full Text Available at HathiTrust';

         // prevent appearance/request iff 'hide-online'
         if (self.hideOnline && isOnline()) {
            return;
         }

         // prevent appearance/request iff 'hide-if-journal'
         if (self.hideIfJournal && isJournal()) {
            return;
         }

         // look for full text at HathiTrust
         updateHathiTrustAvailability();
      };

      var isJournal = function isJournal() {
         var format = self.prmSearchResultAvailabilityLine.result.pnx.addata.format[0];
         return !(format.toLowerCase().indexOf('journal') == -1); // format.includes("Journal")
      };

      var isOnline = function isOnline() {
         var delivery = self.prmSearchResultAvailabilityLine.result.delivery || [];
         if (!delivery.GetIt1) return delivery.deliveryCategory.indexOf('Alma-E') !== -1;
         return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(function (g) {
            return g.links.some(function (l) {
               return l.isLinktoOnline;
            });
         });
      };

      var formatLink = function formatLink(link) {
         return self.entityId ? link + '?signon=swle:' + self.entityId : link;
      };

      var isOclcNum = function isOclcNum(value) {
         return value.match(/^(\(ocolc\))?\d+$/i);
      };

      var updateHathiTrustAvailability = function updateHathiTrustAvailability() {
         var hathiTrustIds = (self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []).filter(isOclcNum).map(function (id) {
            return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
         });
         hathiTrust[self.ignoreCopyright ? 'findRecord' : 'findFullViewRecord'](hathiTrustIds).then(function (res) {
            if (res) self.fullTextLink = formatLink(res);
         });
      };
   }]).component('hathiTrustAvailability', {
      require: {
         prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine'
      },
      bindings: {
         entityId: '@',
         ignoreCopyright: '<',
         hideIfJournal: '<',
         hideOnline: '<',
         msg: '@?'
      },
      controller: 'hathiTrustAvailabilityController',
      template: '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
                <md-icon alt="HathiTrust Logo">\
                  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">  <image id="image0" width="16" height="16" x="0" y="0"\
                  xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJN\
                  AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACNFBMVEXuegXvegTsewTveArw\
                  eQjuegftegfweQXsegXweQbtegnsegvxeQbvegbuegbvegbveQbtegfuegbvegXveQbvegbsfAzt\
                  plfnsmfpq1/wplPuegXvqFrrq1znr2Ptok/sewvueQfuegbtegbrgRfxyJPlsXDmlTznnk/rn03q\
                  pVnomkjnlkDnsGnvwobsfhPveQXteQrutHDqpF3qnUnpjS/prmDweQXsewjvrWHsjy7pnkvqqGDv\
                  t3PregvqhB3uuXjusmzpp13qlz3pfxTskC3uegjsjyvogBfpmkHpqF/us2rttXLrgRjrgBjttXDo\
                  gx/vtGznjzPtfhHqjCfuewfrjCnwfxLpjC7wtnDogBvssmjpfhLtegjtnEjrtnTmjC/utGrsew7s\
                  o0zpghnohB/roUrrfRHtsmnlkTbrvH3tnEXtegXvegTveQfqhyHvuXjrrGTpewrsrmXqfRHogRjt\
                  q2Dqewvqql/wu3vqhyDueQnwegXuegfweQPtegntnUvnt3fvxI7tfhTrfA/vzJvmtXLunEbtegrw\
                  egTregzskjbsxI/ouoPsqFzniyrz2K3vyZnokDLpewvtnkv30J/w17XsvYXjgBbohR7nplnso1L0\
                  1Kf40Z/um0LvegXngBnsy5juyJXvsGftrGTnhB/opVHoew7qhB7rzJnnmErkkz3splbqlT3smT3t\
                  tXPqqV7pjzHvunjrfQ7vewPsfA7uoU3uqlruoEzsfQ/vegf///9WgM4fAAAAFHRSTlOLi4uLi4uL\
                  i4uLi4uLi4tRUVFRUYI6/KEAAAABYktHRLvUtndMAAAAB3RJTUUH4AkNDgYNB5/9vwAAAQpJREFU\
                  GNNjYGBkYmZhZWNn5ODk4ubh5WMQERUTl5CUEpWWkZWTV1BUYlBWUVVT19BUUtbS1tHV0zdgMDQy\
                  NjE1MzRXsrC0sraxtWOwd3B0cnZxlXZz9/D08vbxZfDzDwgMCg4JdQsLj4iMio5hiI2LT0hMSk5J\
                  TUvPyMzKzmHIzcsvKCwqLiktK6+orKquYZCuratvaGxqbmlta+8QNRBl6JQ26Oru6e3rnzBx0uQ8\
                  aVGGvJopU6dNn1E8c9bsOXPniYoySM+PXbBw0eIlS5fl1C+PFRFlEBUVXbFy1eo1a9fliQDZYIHY\
                  9fEbNm7avEUUJiC6ddv2HTt3mSuBBfhBQEBQSEgYzOIHAHtfTe/vX0uvAAAAJXRFWHRkYXRlOmNy\
                  ZWF0ZQAyMDE2LTA5LTEzVDE0OjA2OjEzLTA1OjAwNMgVqAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAx\
                  Ni0wOS0xM1QxNDowNjoxMy0wNTowMEWVrRQAAAAASUVORK5CYII=" />\
                  </svg> \
                </md-icon>\
                <a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
                {{ ::$ctrl.msg }}\
                  <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
                </a>\
              </span>'
   });

   /* END HathiTrust Availability add-on */

   /**
    * GTM
    */
   // Google Tag Manager - START
   // Google Tag Manager - START
   // Google Tag Manager - START
   /*
   * Begin Google Tag Manager code
   * Adapted from: https://github.com/csudhlib/primo-explore-google-analytics
   */
   angular.module('googleTagManager', []);
   angular.module('googleTagManager').run(function ($rootScope, $interval, tagOptions) {
      if (tagOptions.hasOwnProperty("enabled") && tagOptions.enabled) {
         if (tagOptions.hasOwnProperty("siteId") && tagOptions.siteId != '') {
            if (typeof gtag === 'undefined') {
               var _gtag = function _gtag() {
                  dataLayer.push(arguments);
               };

               var s = document.createElement('script');
               s.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagOptions.siteId;
               document.body.appendChild(s);
               window.dataLayer = window.dataLayer || [];

               _gtag('js', new Date());

               _gtag('config', tagOptions.siteId, {
                  'allow_ad_personalization_signals': false,
                  'allow_google_signals': false,
                  'alwaysSendReferrer': true,
                  'anonymizeIp': true
               });
            }
         }
         $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
            if (tagOptions.hasOwnProperty("defaultTitle")) {
               var documentTitle = tagOptions.defaultTitle;
               var interval = $interval(function () {
                  if (document.title !== '') documentTitle = document.title;
                  if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1) if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return; else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();

                  if (typeof gtag !== 'undefined') {
                     if (fromState != toState) {
                        gtag('event', 'page_view', {
                           'referrer': fromState,
                           'location': toState,
                           'title': documentTitle
                        });
                     } else {
                        gtag('event', 'page_view', {
                           'location': toState,
                           'title': documentTitle
                        });
                     }
                  }
                  $interval.cancel(interval);
               }, 0);
            }
         });
      }
   });
   angular.module('googleTagManager').value('tagOptions', {
      enabled: true,
      siteId: 'GTM-P4PMP66',
      defaultTitle: 'Library Search'
   });
   /* End Google Tag Manager integration */
   // Google Tag Manager - END
   // Google Tag Manager - END
   // Google Tag Manager - END


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

   var showAlert = false;
   var alertText = '<p>News alert: <a href="http://ucberk.li/university-librarian">UC Berkeley has announced its next university librarian</a></p>';

   var topbarWrapper = document.getElementsByClassName('topbar-wrapper');
   var alertBanner = window.setInterval(function () {
      if (showAlert) {
         // Create alert bar element
         var alertBarDiv = document.createElement('div');
         alertBarDiv.id = "primo-alert-bar";
         // Get the alert message
         alertBarDiv.innerHTML = alertText;
         // Append the element to the wrapper (can't use straight up prepend() because of IE)
         topbarWrapper[0].insertBefore(alertBarDiv, topbarWrapper[0].firstChild);
      }
      clearInterval(alertBanner);
   }, 1000);
   /**
    * Add footer
    */
   app.component('prmExploreFooterAfter', {
      bindings: {parentCtrl: '<'},
      controller: 'ExploreFooterAfterController',
      templateUrl: 'custom/01UCS_BER-UCB/html/prmExploreFooterAfter.html'
   });
   /**
    * Libchat
    *
    * */
   (function() { var options = {"id":20726,"hash":"e3cba83ef74e8285af62ba3fb7e93af6","siteUrl":"https:\/\/ucberkeley.libanswers.com","iid":2539,"onlinerules":[{"u":0,"d":[5250],"c":""},{"u":0,"d":[],"c":"7ecfef2d-1d12-11ea-af03-1205983d2cc2","coverageType":1,"coverageHours":{},"fallbackSeconds":0},{"u":0,"d":[],"c":"9170771e-ba2d-11ea-b473-0a569fab77af","coverageType":1,"coverageHours":{},"fallbackSeconds":40}],"width":"375px","height":"300","autoload_time":0,"slidebutton_height":"40px","slidebutton_width":"90px","slidebutton_bcolor":"#FDB515","slidebutton_color":"#FFFFFF","slidebutton_bcolor_off":"#FDB515","slidebutton_color_off":"#FFFFFF","slidebutton_url":"https:\/\/search.library.berkeley.edu\/discovery\/custom\/01UCS_BER-UCB\/img\/chat-button.svg","slidebutton_url_off":"https:\/\/search.library.berkeley.edu\/discovery\/custom\/01UCS_BER-UCB\/img\/chat-button.svg","slidebutton_text":"Chat with us","slidebutton_text_off":"Offline","translation":{"ch_float_show":"Open chat","ch_float_hide":"Minimize chat","ch_float_start":"Start chat"}}; var cascadeServer = "https:\/\/chat-us.libanswers.com"; var referer = ""; var refererTitle = ""; const removeCoverageFromRule=function(rule){return{u:rule.u,d:rule.d,c:rule.c,fallbackSeconds:rule.fallbackSeconds||0}},isCoverageInRange=function(hour,minute,ranges){if(0===ranges.length)return!1;for(let i=0;i<=ranges.length;i++){const range=ranges[i];if(!Array.isArray(range)||2!==range.length)continue;const start=range[0].split(":").map((el=>parseInt(el,10))),end=range[1].split(":").map((el=>parseInt(el,10)));if(!(start[0]>hour||end[0]<hour)){if(start[0]<hour&&end[0]>hour)return!0;if(start[0]!==hour){if(end[0]!==hour);else if(end[1]>minute)return!0}else if(start[1]<minute)return!0}}return!1};var adjustStatusRequestForCoverage=function(onlineRules){const finalRules=[],now=new Date,day=now.getUTCDay(),hour=now.getUTCHours(),minute=now.getUTCMinutes();return onlineRules.forEach((rule=>{if(!rule.c||1===rule.coverageType)return void finalRules.push(removeCoverageFromRule(rule));if(0===rule.coverageType)return;const times=rule.coverageHours;if(!times||!times[day]||0===times[day].length)return;const ranges=times[day];isCoverageInRange(hour,minute,ranges)&&finalRules.push(removeCoverageFromRule(rule))})),finalRules};;
      const floatWidget={config:{},online:!1,loaded:!1,autoload:!1,chat_load:null,chat_button:null,image:null,svgTitle:null,openBtnContent:"",overlay:null,chat_timer:null,referer:"",refererTitle:"",boundKeyboardHandler:null,boundOverlayHandler:null,narrowScreen:null,insertWidgetCSS:function(){const css=`/* LibChat Widget CSS */\n            .s-lch-widget-float { position: fixed; bottom: 1px; right: 1px; z-index: 1000; padding: 1em; font-size: 16px; display: flex; flex-direction: column; flex-wrap: nowrap; justify-content: flex-end; align-content: flex-end; align-items: flex-end; box-sizing: border-box; pointer-events: none; }\n            .s-lch-widget-float.open { top: 1px; width: ${this.config.width}; height: 100%; }\n            .s-lch-widget-float > * { pointer-events: auto; }\n            .s-lch-widget-float-load { flex: 0 1 auto; display: none; transition: flex-grow 2s; border-radius: 5px; border: 1px solid rgb(221, 221, 221); box-shadow: 0.1em 0.2em 0.5em #ccc; min-height: 200px; width: 100%; height: 200px; z-index: 501; position: relative; }\n            .s-lch-widget-float-load.expanded {flex: 2 1 auto; min-height: 0; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { display: block; }\n            .s-lch-widget-float-btn { border: none; padding: .75em .75em .5em .75em; border-radius: 5px; position: relative; bottom: 0; right: 0; flex: 0 0 auto; box-shadow: 0.1em 0.2em 0.5em #ccc; font-size: .9em; background-color: ${this.config.slidebutton_bcolor_off}; color: ${this.config.slidebutton_color_off}; width: 4em; height: 3.75em; z-index: 501; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { margin-top: 1em; }\n            .s-lch-widget-float-btn.online { background-color: ${this.config.slidebutton_bcolor}; color: ${this.config.slidebutton_color}; }\n            .s-lch-widget-float-btn svg .dots { display: none; }\n            .s-lch-widget-float-btn.online svg .dots { display: block; }\n            .s-lch-widget-float-btn.s-lch-widget-img-btn, .s-lch-widget-float-btn img { padding: 0; height: ${this.config.slidebutton_height}; width: ${this.config.slidebutton_width}; }\n            #s-lch-widget-float-indicator { position: absolute; top: -.5em; right: -.5em; background-color: red; border-radius: 1em; width: 1em; height: 1em; }\n            .s-lch-widget-float div.tab_overlay { position: fixed; background-color: rgb(0, 0, 0); top: 0; left: 0; bottom: 0; right: 0; opacity: 0.0; z-index: 500; display: none; }\n            @media (max-width: 550px) {\n            .s-lch-widget-float { left: 0; width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-load { width: 100%; }\n            .s-lch-widget-float.open .s-lch-widget-float-btn { display: none; }\n            }`,head=document.head||document.getElementsByTagName("head")[0],style=document.createElement("style");style.styleSheet?style.styleSheet.cssText=css:style.appendChild(document.createTextNode(css)),head.appendChild(style)},isNarrowScreen:function(){if(null!==this.narrowScreen)return this.narrowScreen;const mediaQuery=window.matchMedia("(max-width: 700px)");return this.narrowScreen=mediaQuery.matches,this.narrowScreen},getWidgetUrl:function(){""===this.referer&&(this.referer=window.location.href),""===this.refererTitle&&window.document.title&&(this.refererTitle=window.document.title);let authId=0;window.springSpace&&window.springSpace.la&&window.springSpace.la.Page&&window.springSpace.la.Page.auth_id&&(authId=window.springSpace.la.Page.auth_id);let qs=`${this.config.siteUrl}/chat/widget/${this.config.hash}?referer=${encodeURIComponent(this.referer)}&referer_title=${encodeURIComponent(this.refererTitle)}&auth_id=${authId}`;return this.autoload&&(qs+="&auto=true",this.autoload=!1),qs},statusSuccess:function(data){let online=!1;(data.u||data.d||data.c)&&(online=!0),this.changeButtonStatus(online);let isCoopOnline=!1;data.c&&data.c.length>0&&(isCoopOnline=!0),this.setTimer(isCoopOnline)},checkStatus:function(){const adjustedRules=adjustStatusRequestForCoverage(this.config.onlinerules),xhr=new XMLHttpRequest;xhr.onload=()=>{const status=xhr.status;if(status>=200&&status<300)try{this.statusSuccess(JSON.parse(xhr.responseText))}catch(e){this.changeButtonStatus(!1)}else this.changeButtonStatus(!1)},xhr.onerror=()=>{this.changeButtonStatus(!1)},xhr.open("GET",`${this.cascadeServer}/widget_status?iid=${this.config.iid}&rules=${encodeURIComponent(JSON.stringify(adjustedRules))}`),xhr.send()},autoPopDenied:function(){try{let obj=localStorage.getItem("libchat_auto");if(""===obj)return!1;obj=JSON.parse(obj);return!(Math.floor(Date.now()/1e3)-obj.date>3600)||(this.deleteAutoPopDeny(),!1)}catch(e){this.deleteAutoPopDeny()}return!1},deleteAutoPopDeny:function(){try{localStorage.removeItem("libchat_auto")}catch(e){}},showMsgNotice:function(){this.indicator||(this.indicator=document.createElement("span"),this.indicator.id="s-lch-widget-float-indicator"),null===this.indicator.parentNode&&this.chat_button.appendChild(this.indicator),this.indicator.style.display="block"},hideMsgNotice:function(){this.indicator&&(this.indicator.style.display="none")},handleMessages:function(e){const data=e.data;if("object"==typeof data&&data.action)switch(data.action){case"closeWidget":this.chat_button.focus(),this.closeWidget();break;case"chatStarted":case"expandWidget":this.boundOverlayHandler&&this.overlay.removeEventListener("click",this.boundOverlayHandler),this.overlay.style.display="none",this.chat_load.classList.contains("expanded")||(this.chat_load.classList.add("expanded"),this.chat_load.style.minHeight=0);break;case"autopop":this.openWidget(),this.boundOverlayHandler=this.closeWidget.bind(this),this.overlay.addEventListener("click",this.boundOverlayHandler),this.overlay.style.display="block";break;case"height":null!==this.chat_load&&data.height&&(this.chat_load.style.minHeight=`${data.height}px`);break;case"newMessage":"true"===this.chat_load.getAttribute("aria-hidden")&&this.showMsgNotice();break;case"changeStatus":this.changeButtonStatus(data.online||!1)}},closeWidget:function(){this.chat_load.removeAttribute("aria-live"),this.chat_load.setAttribute("aria-hidden","true"),this.chat_div.classList.remove("open"),this.chat_button.setAttribute("aria-label",this.config.translation.ch_float_show),this.chat_button.setAttribute("title",this.config.translation.ch_float_show),this.chat_button.setAttribute("aria-expanded",!1),this.chat_load.contentWindow.postMessage("closeChatWidget",`${this.config.siteUrl}/`),document.body.removeEventListener("keydown",this.boundKeyboardHandler),this.boundOverlayHandler&&this.overlay.removeEventListener("click",this.boundOverlayHandler),this.overlay.style.display="none"},openWidget:function(){this.chat_div.classList.contains("open")||this.chat_div.classList.add("open"),this.chat_button.setAttribute("aria-label",this.config.translation.ch_float_hide),this.chat_button.setAttribute("title",this.config.translation.ch_float_hide),this.chat_button.setAttribute("aria-expanded",!0),this.hideMsgNotice(),this.boundKeyboardHandler=this.keyboardCloseWidget.bind(this),document.body.addEventListener("keydown",this.boundKeyboardHandler),null===this.chat_load?this.loadIframe():this.chat_load.setAttribute("aria-hidden","false")},keyboardCloseWidget:function(ev){"Escape"===ev.key&&this.closeWidget()},loadIframe:function(){if(null!==this.chat_load)return;const chatUrl=this.getWidgetUrl();this.chat_load=document.createElement("iframe"),this.chat_load.setAttribute("id",`iframe_${this.config.hash}`),this.chat_load.setAttribute("name",`iframe_${this.config.hash}`),this.chat_load.setAttribute("src",chatUrl),this.chat_load.setAttribute("title","Chat Widget"),this.chat_load.setAttribute("scrolling","no"),this.chat_load.className="s-lch-widget-float-load",this.chat_load.setAttribute("aria-live","polite"),this.chat_load.setAttribute("aria-hidden","false"),this.chat_load.innerHTML="Content is loading...",this.chat_div.insertBefore(this.chat_load,this.chat_button),window.addEventListener("message",this.handleMessages.bind(this))},autoOpenWidget:function(){this.autoPopDenied()||(this.autoload=!0,this.loadIframe())},toggleWidget:function(){window.clearTimeout(this.chat_timer),this.chat_div.classList.contains("open")?this.closeWidget():this.openWidget()},showButton:function(){this.chat_button.style.display=""},setTimer:function(isCoopOnline){if(!this.isNarrowScreen())if(this.online){if(isCoopOnline)return;this.config.autoload_time&&parseInt(this.config.autoload_time,10)>0&&!this.autoPopDenied()&&(this.chat_timer=window.setTimeout(this.autoOpenWidget.bind(this),1e3*parseInt(this.config.autoload_time,10)))}else this.autoload=!1},changeButtonStatus(online){if(online!==this.online){if(this.online=online,this.online)return this.chat_button.classList.add("online"),void(this.image?(this.image.setAttribute("src",this.config.slidebutton_url),this.image.setAttribute("alt",this.config.slidebutton_text)):this.svgTitle.innerHTML=this.config.slidebutton_text);this.chat_button.classList.remove("online"),this.image?(this.image.setAttribute("src",this.config.slidebutton_url_off),this.image.setAttribute("alt",this.config.slidebutton_text_off)):this.svgTitle.innerHTML=this.config.slidebutton_text_off}},buildButton:function(){this.chat_button=document.createElement("button"),this.chat_button.setAttribute("aria-controls",`s-lch-widget-${this.config.id}`),this.chat_button.setAttribute("aria-expanded",!1),this.chat_button.setAttribute("type","button"),this.chat_button.className="s-lch-widget-float-btn",""!==this.config.slidebutton_url_off&&""!==this.config.slidebutton_url?(this.chat_button.style.display="none",this.image=document.createElement("img"),this.image.addEventListener("load",this.showButton.bind(this)),this.image.setAttribute("src",this.config.slidebutton_url_off),this.image.setAttribute("alt",this.config.slidebutton_text_off),this.chat_button.classList.add("s-lch-widget-img-btn"),this.chat_button.appendChild(this.image)):(this.chat_button.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 78" role="img" aria-labelledby="s-lch-widget-float-img-title"><title id="s-lch-widget-float-img-title">${this.config.slidebutton_text_off}</title><path fill="#FFF" stroke="#000" stroke-width="4.365" stroke-linecap="round" stroke-linejoin="round" d="M18.116 3.513h48.766c7.875 0 14.282 6.407 14.282 14.28v29.684c0 7.875-6.407 14.28-14.282 14.28H33.22l-12.17 12.17c-.366.367-.855.56-1.344.56-.245 0-.49-.052-.733-.14-.716-.297-1.17-.994-1.17-1.764V61.758c-7.734-.175-13.968-6.513-13.968-14.28V17.793c.017-7.874 6.406-14.28 14.28-14.28z"/><g class="dots"><path d="M24.664 28.48c2.356 0 4.276 1.92 4.276 4.278 0 2.373-1.92 4.276-4.276 4.276-2.357 0-4.277-1.92-4.277-4.276-.018-2.357 1.903-4.28 4.277-4.28zM42.508 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.92 4.276-4.277 4.276s-4.277-1.92-4.277-4.276c0-2.357 1.904-4.28 4.278-4.28zM60.352 28.48c2.356 0 4.277 1.92 4.277 4.278 0 2.373-1.922 4.276-4.278 4.276s-4.278-1.92-4.278-4.276c0-2.357 1.92-4.28 4.278-4.28z"/></g></svg>`,this.svgTitle=this.chat_button.querySelector("svg title")),this.chat_button.setAttribute("aria-label",this.config.translation.ch_float_start),this.chat_button.setAttribute("title",this.config.translation.ch_float_start),this.chat_div.appendChild(this.chat_button),this.isNarrowScreen()?this.chat_button.addEventListener("click",this.openChat.bind(this)):this.chat_button.addEventListener("click",this.toggleWidget.bind(this))},openChat:function(){const chatUrl=this.getWidgetUrl();window.open(chatUrl,"libchat",`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=${this.config.width}, height=${this.config.height}`)},start:function(){!0!==this.loaded&&(this.loaded=!0,this.insertWidgetCSS(),this.chat_div=document.createElement("div"),this.chat_div.id=`s-lch-widget-${this.config.id}`,this.chat_div.setAttribute("role","region"),this.chat_div.setAttribute("aria-label","Chat Widget"),this.chat_div.className="s-lch-widget-float",this.overlay=document.createElement("div"),this.overlay.classList.add("tab_overlay"),this.chat_div.appendChild(this.overlay),document.body.appendChild(this.chat_div),this.buildButton(),this.checkStatus(),document.addEventListener("visibilitychange",(()=>{"visible"!==document.visibilityState||this.chat_load||this.checkStatus()})))}};floatWidget.config=options,floatWidget.cascadeServer=cascadeServer,floatWidget.referer=referer,floatWidget.refererTitle=refererTitle,window.openChat=floatWidget.openChat.bind(floatWidget),"complete"===document.readyState||"interactive"===document.readyState?floatWidget.start():(document.addEventListener("DOMContentLoaded",floatWidget.start.bind(floatWidget),!1),window.addEventListener("load",floatWidget.start.bind(floatWidget),!1));})();
   /* UC Library Search logo
   * Code adapted from CSU Central Package by David Walker
   * https://github.com/dswalker/csu-central-package/
   *
   */

   app.component('prmSearchBarAfter', {
      bindings: {parentCtrl: '<'},
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

   /**
    * From https://github.com/alliance-pcsg/primo-explore-external-search
    *
    * With customizations, all commented below.
    */
   angular.module('externalSearch', []).value('searchTargets', []).component('prmFacetAfter', {
      bindings: {parentCtrl: '<'},
      controller: ['externalSearchService', function (externalSearchService) {
         this.$onInit = function () {
            {
               externalSearchService.controller = this.parentCtrl;
               externalSearchService.addExtSearch();
            }
         }
      }]
   }).component('prmPageNavMenuAfter', {
      controller: ['externalSearchService', function (externalSearchService) {
         if (externalSearchService.controller) externalSearchService.addExtSearch();
      }]
   }).component('prmFacetExactAfter', {
      bindings: {parentCtrl: '<'},
      /* Customized the template. Removed some div with chips classes. Added target.desc and span wrapper.
         Changed width/height to 40. */
      templateUrl: 'custom/01UCS_BER-UCB/html/prmFacetExactAfter.html',
      controller: ['$scope', '$location', 'searchTargets', function ($scope, $location, searchTargets) {
         this.$onInit = function () {
            {
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
            }
         }
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