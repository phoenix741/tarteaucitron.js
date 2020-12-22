/*jslint browser: true, evil: true */

(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.tarteaucitronjs = factory();
    }
}(this, function () {
    "use strict";

    var scripts = document.getElementsByTagName('script'),
        path = scripts[scripts.length - 1].src.split('?')[0],
        tarteaucitronForceCDN = (tarteaucitronForceCDN === undefined) ? '' : tarteaucitronForceCDN,
        cdn = (tarteaucitronForceCDN === '') ? path.split('/').slice(0, -1).join('/') + '/' : tarteaucitronForceCDN,
        alreadyLaunch = (alreadyLaunch === undefined) ? 0 : alreadyLaunch,
        tarteaucitronForceLanguage = (tarteaucitronForceLanguage === undefined) ? '' : tarteaucitronForceLanguage,
        tarteaucitronForceExpire = (tarteaucitronForceExpire === undefined) ? '' : tarteaucitronForceExpire,
        tarteaucitronCustomText = (tarteaucitronCustomText === undefined) ? '' : tarteaucitronCustomText,
        // tarteaucitronExpireInDay: true for day(s) value - false for hour(s) value
        tarteaucitronExpireInDay = (tarteaucitronExpireInDay === undefined || typeof tarteaucitronExpireInDay !== "boolean") ? true : tarteaucitronExpireInDay,
        timeExpire = 31536000000,
        tarteaucitronProLoadServices,
        tarteaucitronNoAdBlocker = false;



    var tarteaucitronjs = {
        "version": 20201110,
        "cdn": cdn,
        "user": {},
        "lang": {},
        "services": {},
        "added": [],
        "idprocessed": [],
        "state": [],
        "launch": [],
        "parameters": {},
        "isAjax": false,
        "reloadThePage": false,
        "events": {
            "init": function () { },
            "load": function () { },
        },
        "init": function (params) {
            var origOpen;

            tarteaucitronjs.parameters = params;
            if (alreadyLaunch === 0) {
                alreadyLaunch = 1;
                if (window.addEventListener) {
                    window.addEventListener("load", function () {
                        tarteaucitronjs.initEvents.loadEvent(false);
                    }, false);
                    window.addEventListener("scroll", function () {
                        tarteaucitronjs.initEvents.scrollEvent();
                    }, false);

                    window.addEventListener("keydown", function (evt) {
                        tarteaucitronjs.initEvents.keydownEvent(false, evt);
                    }, false);
                    window.addEventListener("hashchange", function () {
                        tarteaucitronjs.initEvents.hashchangeEvent();
                    }, false);
                    window.addEventListener("resize", function () {
                        tarteaucitronjs.initEvents.resizeEvent();
                    }, false);
                } else {
                    window.attachEvent("onload", function () {
                        tarteaucitronjs.initEvents.loadEvent(true);
                    });
                    window.attachEvent("onscroll", function () {
                        tarteaucitronjs.initEvents.scrollEvent();
                    });
                    window.attachEvent("onkeydown", function (evt) {
                        tarteaucitronjs.initEvents.keydownEvent(true, evt);

                    });
                    window.attachEvent("onhashchange", function () {
                        tarteaucitronjs.initEvents.hashchangeEvent();
                    });
                    window.attachEvent("onresize", function () {
                        tarteaucitronjs.initEvents.resizeEvent();
                    });
                }

                if (typeof XMLHttpRequest !== 'undefined') {
                    origOpen = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function () {

                        if (window.addEventListener) {
                            this.addEventListener("load", function () {
                                if (typeof tarteaucitronProLoadServices === 'function') {
                                    tarteaucitronProLoadServices();
                                }
                            }, false);
                        } else if (typeof this.attachEvent !== 'undefined') {
                            this.attachEvent("onload", function () {
                                if (typeof tarteaucitronProLoadServices === 'function') {
                                    tarteaucitronProLoadServices();
                                }
                            });
                        } else {
                            if (typeof tarteaucitronProLoadServices === 'function') {
                                setTimeout(tarteaucitronProLoadServices, 1000);
                            }
                        }

                        try {
                            origOpen.apply(this, arguments);
                        } catch (err) { }
                    };
                }
            }

            if (tarteaucitronjs.events.init) {
                tarteaucitronjs.events.init();
            }
        },
        "initEvents": {
            "loadEvent": function (isOldBrowser) {
                tarteaucitronjs.load();
                tarteaucitronjs.fallback(['tarteaucitronOpenPanel'], function (elem) {
                    if (isOldBrowser) {
                        elem.attachEvent("onclick", function (event) {
                            tarteaucitronjs.userInterface.openPanel();
                            event.preventDefault();
                        });
                    } else {
                        elem.addEventListener("click", function (event) {
                            tarteaucitronjs.userInterface.openPanel();
                            event.preventDefault();
                        }, false);
                    }
                }, true);
            },
            "keydownEvent": function (isOldBrowser, evt) {
                if (evt.keyCode === 27) {
                    tarteaucitronjs.userInterface.closePanel();
                }

                if (isOldBrowser) {
                    if (evt.keyCode === 9 && focusableEls.indexOf(evt.target) >= 0) {
                        if (evt.shiftKey) /* shift + tab */ {
                            if (document.activeElement === firstFocusableEl) {
                                lastFocusableEl.focus();
                                evt.preventDefault();
                            }
                        } else /* tab */ {
                            if (document.activeElement === lastFocusableEl) {
                                firstFocusableEl.focus();
                                evt.preventDefault();
                            }
                        }
                    }
                }
            },
            "hashchangeEvent": function () {
                if (document.location.hash === tarteaucitronjs.hashtag && tarteaucitronjs.hashtag !== '') {
                    tarteaucitronjs.userInterface.openPanel();
                }
            },
            "resizeEvent": function () {
                var tacElem = document.getElementById('tarteaucitron');
                var tacCookieContainer = document.getElementById('tarteaucitronCookiesListContainer');

                if (tacElem && tacElem.style.display === 'block') {
                    tarteaucitronjs.userInterface.jsSizing('main');
                }

                if (tacCookieContainer && tacCookieContainer.style.display === 'block') {
                    tarteaucitronjs.userInterface.jsSizing('cookie');
                }
            },
            "scrollEvent": function () {
                var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
                var heightPosition;
                var tacPercentage = document.getElementById('tarteaucitronPercentage');
                var tacAlertBig = document.getElementById('tarteaucitronAlertBig');

                if (tacAlertBig && !tarteaucitronjs.highPrivacy) {
                    if (tacAlertBig.style.display === 'block') {
                        heightPosition = tacAlertBig.offsetHeight + 'px';

                        if (scrollPos > (screen.height * 2)) {
                            tarteaucitronjs.userInterface.respondAll(true);
                        } else if (scrollPos > (screen.height / 2)) {
                            document.getElementById('tarteaucitronDisclaimerAlert').innerHTML = '<strong>' + tarteaucitronjs.lang.alertBigScroll + '</strong> ' + tarteaucitronjs.lang.alertBig;
                        }

                        if (tacPercentage) {
                            if (tarteaucitronjs.orientation === 'top') {
                                tacPercentage.style.top = heightPosition;
                            } else {
                                tacPercentage.style.bottom = heightPosition;
                            }
                            tacPercentage.style.width = ((100 / (screen.height * 2)) * scrollPos) + '%';
                        }
                    }
                }
            },
        },
        "load": function () {
            var cdn = tarteaucitronjs.cdn,
                language = tarteaucitronjs.getLanguage(),
                pathToLang = cdn + 'lang/tarteaucitronjs.' + language + '.js?v=' + tarteaucitronjs.version,
                pathToServices = cdn + 'tarteaucitronjs.services.js?v=' + tarteaucitronjs.version,
                linkElement = document.createElement('link'),
                defaults = {
                    "adblocker": false,
                    "hashtag": '#tarteaucitron',
                    "cookieName": 'tarteaucitron',
                    "highPrivacy": true,
                    "orientation": "middle",
                    "bodyPosition": "bottom",
                    "removeCredit": false,
                    "showAlertSmall": false,
                    "showIcon": true,
                    "iconPosition": "BottomRight",
                    "cookieslist": false,
                    "handleBrowserDNTRequest": false,
                    "DenyAllCta": true,
                    "AcceptAllCta": true,
                    "moreInfoLink": true,
                    "privacyUrl": "",
                    "useExternalCss": false,
                    "useExternalJs": false,
                    "mandatory": true
                },
                params = tarteaucitronjs.parameters;

            // Don't show the middle bar if we are on the privacy policy or more page
            if (((tarteaucitronjs.parameters.readmoreLink !== undefined && window.location.href == tarteaucitronjs.parameters.readmoreLink) || window.location.href == tarteaucitronjs.parameters.privacyUrl) && tarteaucitronjs.parameters.orientation == "middle") {
                tarteaucitronjs.parameters.orientation = "bottom";
            }

            // Step -1
            if (typeof tarteaucitronCustomPremium !== 'undefined') {
                tarteaucitronCustomPremium();
            }

            // Step 0: get params
            if (params !== undefined) {

                for (var k in defaults) {
                    if (!tarteaucitronjs.parameters.hasOwnProperty(k)) {
                        tarteaucitronjs.parameters[k] = defaults[k];
                    }
                }
            }

            // global
            tarteaucitronjs.orientation = tarteaucitronjs.parameters.orientation;
            tarteaucitronjs.hashtag = tarteaucitronjs.parameters.hashtag;
            tarteaucitronjs.highPrivacy = tarteaucitronjs.parameters.highPrivacy;
            tarteaucitronjs.handleBrowserDNTRequest = tarteaucitronjs.parameters.handleBrowserDNTRequest;

            // Step 1: load css
            if (!tarteaucitronjs.parameters.useExternalCss) {
                linkElement.rel = 'stylesheet';
                linkElement.type = 'text/css';
                linkElement.href = cdn + 'css/tarteaucitronjs.css?v=' + tarteaucitronjs.version;
                document.getElementsByTagName('head')[0].appendChild(linkElement);
            }
            // Step 2: load language and services
            tarteaucitronjs.addInternalScript(pathToLang, '', function () {

                if (tarteaucitronCustomText !== '') {
                    tarteaucitronjs.lang = tarteaucitronjs.AddOrUpdate(tarteaucitronjs.lang, tarteaucitronCustomText);
                }
                tarteaucitronjs.addInternalScript(pathToServices, '', function () {


                    // css for new middle bar
                    if (tarteaucitronjs.orientation === 'middle') {
                        var customThemeMiddle = document.createElement('style'),
                            cssRuleMiddle = 'div#tarteaucitronRoot.tarteaucitronBeforeVisible:before {content: \'\';position: fixed;width: 100%;height: 100%;background: white;top: 0;left: 0;z-index: 999;opacity: 0.5;}div#tarteaucitronAlertBig:before {content: \'' + tarteaucitronjs.lang.middleBarHead + '\';font-size: 35px;}body #tarteaucitronRoot div#tarteaucitronAlertBig {width: 60%;min-width: 285px;height: auto;margin: auto;left: 50%;top: 50%;transform: translate(-50%, -50%);box-shadow: 0 0 9000px #000;border-radius: 20px;padding: 35px 25px;}span#tarteaucitronDisclaimerAlert {padding: 0 30px;}#tarteaucitronRoot span#tarteaucitronDisclaimerAlert {margin: 10px 0 30px;display: block;text-align: center;font-size: 21px;}@media screen and (max-width: 900px) {div#tarteaucitronAlertBig button {margin: 0 auto 10px!important;display: block!important;}}';

                        customThemeMiddle.type = 'text/css';
                        if (customThemeMiddle.styleSheet) {
                            customThemeMiddle.styleSheet.cssText = cssRuleMiddle;
                        } else {
                            customThemeMiddle.appendChild(document.createTextNode(cssRuleMiddle));
                        }
                        document.getElementsByTagName('head')[0].appendChild(customThemeMiddle);
                    }

                    var body = document.body,
                        div = document.createElement('div'),
                        html = '',
                        index,
                        orientation = 'Top',
                        cat = ['ads', 'analytic', 'api', 'comment', 'social', 'support', 'video', 'other'],
                        i;

                    cat = cat.sort(function (a, b) {
                        if (tarteaucitronjs.lang[a].title > tarteaucitronjs.lang[b].title) { return 1; }
                        if (tarteaucitronjs.lang[a].title < tarteaucitronjs.lang[b].title) { return -1; }
                        return 0;
                    });

                    // Step 3: prepare the html
                    html += '<div id="tarteaucitronPremium"></div>';
                    html += '<button type="button" id="tarteaucitronBack" aria-label="' + tarteaucitronjs.lang.close + '"></button>';
                    html += '<div id="tarteaucitron" role="dialog" aria-labelledby="dialogTitle">';
                    html += '   <button type="button" id="tarteaucitronClosePanel">';
                    html += '       ' + tarteaucitronjs.lang.close;
                    html += '   </button>';
                    html += '   <div id="tarteaucitronServices">';
                    html += '      <div class="tarteaucitronLine tarteaucitronMainLine" id="tarteaucitronMainLineOffset">';
                    html += '         <span class="tarteaucitronH1" role="heading" aria-level="1" id="dialogTitle">' + tarteaucitronjs.lang.title + '</span>';
                    html += '         <div id="tarteaucitronInfo">';
                    html += '         ' + tarteaucitronjs.lang.disclaimer;
                    if (tarteaucitronjs.parameters.privacyUrl !== "") {
                        html += '   <br/><br/>';
                        html += '   <button type="button" id="tarteaucitronPrivacyUrlDialog">';
                        html += '       ' + tarteaucitronjs.lang.privacyUrl;
                        html += '   </button>';
                    }
                    html += '         </div>';
                    html += '         <div class="tarteaucitronName">';
                    html += '            <span class="tarteaucitronH2" role="heading" aria-level="2">' + tarteaucitronjs.lang.all + '</span>';
                    html += '         </div>';
                    html += '         <div class="tarteaucitronAsk" id="tarteaucitronScrollbarAdjust">';
                    html += '            <button type="button" id="tarteaucitronAllAllowed" class="tarteaucitronAllow">';
                    html += '               <span class="tarteaucitronCheck"></span> ' + tarteaucitronjs.lang.allowAll;
                    html += '            </button> ';
                    html += '            <button type="button" id="tarteaucitronAllDenied" class="tarteaucitronDeny">';
                    html += '               <span class="tarteaucitronCross"></span> ' + tarteaucitronjs.lang.denyAll;
                    html += '            </button>';
                    html += '         </div>';
                    html += '      </div>';
                    html += '      <div class="tarteaucitronBorder">';
                    html += '         <div class="clear"></div><ul>';


                    if (tarteaucitronjs.parameters.mandatory == true) {
                        html += '<li id="tarteaucitronServicesTitle_mandatory">';
                        html += '<div class="tarteaucitronTitle">';
                        html += '   <button type="button" tabindex="-1">&nbsp; ' + tarteaucitronjs.lang.mandatoryTitle + '</button>';
                        html += '</div>';
                        html += '<ul id="tarteaucitronServices_mandatory">';
                        html += '<li class="tarteaucitronLine">';
                        html += '   <div class="tarteaucitronName">';
                        html += '       <span class="tarteaucitronH3" role="heading" aria-level="3">' + tarteaucitronjs.lang.mandatoryText + '</span>';
                        html += '       <span class="tarteaucitronListCookies"></span><br/>';
                        html += '   </div>';
                        html += '   <div class="tarteaucitronAsk">';
                        html += '       <button type="button" class="tarteaucitronAllow" tabindex="-1">';
                        html += '           <span class="tarteaucitronCheck"></span> ' + tarteaucitronjs.lang.allow;
                        html += '       </button> ';
                        html += '       <button type="button" class="tarteaucitronDeny" style="visibility:hidden" tabindex="-1">';
                        html += '           <span class="tarteaucitronCross"></span> ' + tarteaucitronjs.lang.deny;
                        html += '       </button> ';
                        html += '   </div>';
                        html += '</li>';
                        html += '</ul></li>';
                    }

                    for (i = 0; i < cat.length; i += 1) {
                        html += '         <li id="tarteaucitronServicesTitle_' + cat[i] + '" class="tarteaucitronHidden">';
                        html += '            <div class="tarteaucitronTitle">';
                        html += '               <button type="button" class="catToggleBtn" data-cat="tarteaucitronDetails' + cat[i] + '"><span class="tarteaucitronPlus"></span> ' + tarteaucitronjs.lang[cat[i]].title + '</button>';
                        html += '            </div>';
                        html += '            <div id="tarteaucitronDetails' + cat[i] + '" class="tarteaucitronDetails tarteaucitronInfoBox">';
                        html += '               ' + tarteaucitronjs.lang[cat[i]].details;
                        html += '            </div>';
                        html += '         <ul id="tarteaucitronServices_' + cat[i] + '"></ul></li>';
                    }
                    html += '             <li id="tarteaucitronNoServicesTitle" class="tarteaucitronLine">' + tarteaucitronjs.lang.noServices + '</li>';
                    html += '         </ul>';
                    html += '         <div class="tarteaucitronHidden spacer-20" id="tarteaucitronScrollbarChild"></div>';
                    if (tarteaucitronjs.parameters.removeCredit === false) {
                        html += '     <a class="tarteaucitronSelfLink" href="https://tarteaucitronjs.io/" rel="nofollow noreferrer noopener" target="_blank" title="tarteaucitron ' + tarteaucitronjs.lang.newWindow + '"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAeCAYAAAAWwoEYAAADl0lEQVRoge1Y0W3bQAx9CjKARlC+9GVUmqDJBHEmiDyB6wkcTxBngtgTxJ0gzgQW4C/9aYOmE6g4lTQo+k6y3Rb94QOERNQd+cjj8XiGwWAwGAwGg8FgMBgMBoPB8F8RNRXe+whEKe7c36ZCAeCRxC9Rig2PUd8kPgAsoxSfQ3YAzAA8D/HwYYCb05kBKKO0teFkmbC1jlKsAnq/Abjn+QBqAIsoRS30ttwG/HNz1wH/XIxWTicLdvtW7xTAGEAMtP685CNsBTe2d/BLydfXAG57SEnMAST0zgYZSUCPk02bCvkJduIzuJzDLfPolbY+tLKmar+/8+IRePy4qdpE03qHuH8fipFb4N2+XdA3AJ/0vaQxt7s9FvkIS2XvtqnwM0rxpOQfbnE5G2LhTCmUO2fHIngOmcv+KG3HafDchB6ntwjYqenR2PqC7sOZ3E7FXHB0vqxoFyUyLh7OEH7LOGouvhhN3eIBeKXv0n5MsufdHqXcwYR5U2EbpV35lSspVPJmQj4TcgRK7jTg5IzmPUhhwM5a2WHUFCx+NgiDucmgh7idikLovHFlL0pxQ9xzX+IIP9Y6FrJsqhjlQpZRAkFVDCjZfcCHt6bqJDmuh5ylCWx0RVnk3oumaknqTH5sqrY0fBWyULaHUIgAgxb46MxV3DbieAhxOxUxjSuljig9lMQ/Bcfoi9BTEv9aLORSndVxYOH525sUDC6u2gWxcNzBNRxPanyh3ktKinOgy3WoxPbtUM0t6RkbQnzBnFPgi9GCOEubY9UffIryz9iKRe8s/FUfEWosJJGxagp85bpUO3VywQ46lOtAWfNxKwa4JXQ+628+bpxYGXXMzp5rXH401VEyXwIdowXFaKWSMFHvMTVmGnc+P3oXV2QOiBCfgex8QtcQCbcQE/H+eoHzrkFo1KM7zVO4jVVj5s6lRiWF7zyXyfRMc97J3tzj87mYqZ7E2YjzUct9GUi4tjHLR8dVkBLjQcuHFleWvQfRNEhFR7uX7pkctOwvZXsft7sAtyldEUIN2UTeLxnEfxKYswzdi88BdbZ8hifUoSMftQvP+muRwN6+Q3DeqqRExP9QmTtcheiHh0Ot1x2i2km1bP9pbufw5zZdyWsOrh7vQae5OZWbsMv30pi7cd/CKj3coPEVaCP4Zhx4eQWhOZ1Y9MTXGyP8/iGjEyfa1T4fO/4Lea9vBoPBYDAYDAaDwWAwGAwGwz8GgF8siXCCbrSRhgAAAABJRU5ErkJggg==" /></a>';
                    }
                    html += '       </div>';
                    html += '   </div>';
                    html += '</div>';

                    if (tarteaucitronjs.parameters.orientation === 'bottom') {
                        orientation = 'Bottom';
                    }

                    if (tarteaucitronjs.parameters.highPrivacy && !tarteaucitronjs.parameters.AcceptAllCta) {
                        html += '<div id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' + orientation + '">';
                        //html += '<div class="tarteaucitronAlertBigWrapper">';
                        html += '   <span id="tarteaucitronDisclaimerAlert">';
                        html += '       ' + tarteaucitronjs.lang.alertBigPrivacy;
                        html += '   </span>';
                        //html += '   <span class="tarteaucitronAlertBigBtnWrapper">';
                        html += '   <button type="button" id="tarteaucitronPersonalize">';
                        html += '       ' + tarteaucitronjs.lang.personalize;
                        html += '   </button>';

                        if (tarteaucitronjs.parameters.privacyUrl !== "") {
                            html += '   <button type="button" id="tarteaucitronPrivacyUrl">';
                            html += '       ' + tarteaucitronjs.lang.privacyUrl;
                            html += '   </button>';
                        }

                        //html += '   </span>';
                        //html += '</div>';
                        html += '</div>';
                    } else {
                        html += '<div id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' + orientation + '">';
                        //html += '<div class="tarteaucitronAlertBigWrapper">';
                        html += '   <span id="tarteaucitronDisclaimerAlert">';

                        if (tarteaucitronjs.parameters.highPrivacy) {
                            html += '       ' + tarteaucitronjs.lang.alertBigPrivacy;
                        } else {
                            html += '       ' + tarteaucitronjs.lang.alertBigClick + ' ' + tarteaucitronjs.lang.alertBig;
                        }

                        html += '   </span>';
                        //html += '   <span class="tarteaucitronAlertBigBtnWrapper">';
                        html += '   <button type="button" class="tarteaucitronCTAButton tarteaucitronAllow" id="tarteaucitronPersonalize2">';
                        html += '       <span class="tarteaucitronCheck"></span> ' + tarteaucitronjs.lang.acceptAll;
                        html += '   </button>';


                        if (tarteaucitronjs.parameters.DenyAllCta) {
                            html += '   <button type="button" class="tarteaucitronCTAButton tarteaucitronDeny" id="tarteaucitronAllDenied2">';
                            html += '       <span class="tarteaucitronCross"></span> ' + tarteaucitronjs.lang.denyAll;
                            html += '   </button>';
                            //html += '   <br/><br/>';
                        }

                        html += '   <button type="button" id="tarteaucitronCloseAlert">';
                        html += '       ' + tarteaucitronjs.lang.personalize;
                        html += '   </button>';

                        if (tarteaucitronjs.parameters.privacyUrl !== "") {
                            html += '   <button type="button" id="tarteaucitronPrivacyUrl">';
                            html += '       ' + tarteaucitronjs.lang.privacyUrl;
                            html += '   </button>';
                        }

                        //html += '   </span>';
                        //html += '</div>';
                        html += '</div>';
                        html += '<div id="tarteaucitronPercentage"></div>';
                    }

                    if (tarteaucitronjs.parameters.showIcon) {
                        var image = (image === true) ?
                            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAGA0lEQVRoge1a207bWBRdBtJwLYZhKDMVmlSK1LxNkPo+ZH6g8B6p5AuALwC+APoFoVLeoT8whPeRSt+CZKmZVu3AiIsRlEtCktGyjy8xzuXYhvahS0JJHJ/4rLP3XnuffcAPfGdQ7mM6jRLSAF4BxqsbewB2lRS2o35mpEQaJcwCyANIdLi1DGBNSWEzqmdHRqRRwjqAJclhtExOSUEP+/xIiDRKhhUWfL7ShTtBuJnqcw+/z4Ql0xNmMEwSSz4kuNIzSgpjSsqYJP/GeE185wYJroedRyiLNEpGLLzzrHSuk+83SgbxvOcyyRaDziWsRVZkSRDinpzPbwVGWIucuohsKynMS47fAQyls/BMSRmKJo3AFhG5wm2N1wF+Zs3zebbFfR0RxrXcJHQlgH+LMW616pR/WiIMEXfW3mtzXyeEGWsjKot8c4TOI98L+iKaR5PS6IUk88RLAO9F8UjrbYoYMOosNavpfmODIiwRXRR/G3ohaWVo1RU/c30jV8ab2mV8qVGzHWBOLyTLZiWs5Rolg/C3ySOi0tXP/k4aEwOwSBKPJs7Rp16ABJTe+p1xVX0It/owqqdDEMRoqd3RFxqDPh20Ig6VEPVC0i5RSCD+6wl6HlW7GksSlUMV11/GrUs5NasFLusDE9ELSVphXemtJwaT/8JyIRvxNNCfBmIiNdR04LII3DSrbe0yjqvyJF/ppptqVlt+MCLCEh/oOkPPP6N38Mb5cnQBGFsEqmXg5j3QMwoMzwGnr4HYbybBq13gZAOom/FO63zdf2qQArCsZrUN2TlJy69eSDKYV+6Q4MpP75ivHzPA53ngaBW4eGuSOt0A/lsGPmXMz0+3TFJcTfFbPfFbfnwlhON+iQhlWmA82CQ4ocQ7c6KcfL3DHuls0yT6Sx4YnLXJDCQOIRRv5yGIJBgP8Sdisj2qubpc5UGJmo+W49ifVmzL8HcpGhQPvZCUKiCliIhEN0tr2OCqHuSA8gwQ/92MkU7gxEmeVqGrTTgpxPXbUrtGWYus0I9thRIraagRQUIDf7Qn4yZhKRiFQIyhfMfUr3yblokVWSJ6k8xSnc7eNN/RjowfCYiFoDUFer1S3gW6JiJ8Nt30EMbEhU+vzSIztuRYjRLsR8IHLjlf7HZ+MrWWEXxNmbvapt4jGSqZRYSkGUetSNTPzHsui5YMQ2ajJUNks6mw4wT54Ok2ShnzzIPCUGshzawCRKy5FqvrTZe0RWzQGvw79m67XZjKmxJrLsICjtZa55gxXy+6F4sYsEtxTqhXdRTLC8ulSDaWoCLsolfN+8YUhOsJV709H7Cudr0LlVEtzqBcN+shEyThdR941OnAbF8pirKJqXyupTRTtQSReiVmXW1j7oBErB0d9xM2WEd5J9ZKYtuR4WKwwBSoORbpGrJ5ZI9lt71irJmGX1px0JYE26uNErawr2zfIcP4OHEKXm66PA3wjpCNEfpJunI4muifPjKvsFCkGjExTq63yxMJsZNMYF/J4HmDC5A3Yq36jy0ClePHVhwuu/b1HSFlEfHD5ZtD1bEK44Qu1mWys6tbWmZyPWckzlPTGiRw/XHCuk+q4Rek+mVrVL/UppwrdDEGNV2kpyuhccgc5Oxm9vWnn+19vJrVpLor0kTUrGacMplb1CfOFyTD4o9uNrHqr2Z+ZMSp1c2XcVSORnh9Q81q3k599ETgkNnjg0nGzi10K7rX+bZpHbrblPcY5A4Zxk2xcjzCvTpd9027Aa0QtouyyrKFRR6D/04DwkFGvHPXM3Qda/Jb4nPgI7hQLVM1q5HIBt2MzQNa57Z1DiiLAGa5Mi+O4Sz3Mpp6laPHO6InII3ITnX1QtI+EOX+m9ZxleOZ/j9PiuKoLi3aqXPuEoSye/Vhkm+LalbLtHhMS0R6zu7aZ3vP2jOjL7QVv4McxhcDnZIelAQibGIbULOapf3PuE1Vs9qeaOTdkVKr00gCQiw4NlBzDvf1Lxx+uP5r3Dgv5KQZRzWn+GRwz8jmDS8itUg7iB6vLuJCF5Uty4A9mVKkFR6MiJDachST/oHvHgD+B4SoUIitpF05AAAAAElFTkSuQmCC' :
                            tarteaucitronjs.parameters.showIcon;
                        html += '<div id="tarteaucitronIcon" class="tarteaucitronIcon' + tarteaucitronjs.parameters.iconPosition + '">';
                        html += '   <button type="button" id="tarteaucitronManager">';
                        html += '       <img src="' + image + '" alt="Cookies">';
                        html += '   </button>';
                        html += '</div>';
                    }

                    if (tarteaucitronjs.parameters.showAlertSmall === true) {
                        html += '<div id="tarteaucitronAlertSmall" class="tarteaucitronAlertSmall' + orientation + '">';
                        html += '   <button type="button" id="tarteaucitronManager">';
                        html += '       ' + tarteaucitronjs.lang.alertSmall;
                        html += '       <span id="tarteaucitronDot">';
                        html += '           <span id="tarteaucitronDotGreen"></span>';
                        html += '           <span id="tarteaucitronDotYellow"></span>';
                        html += '           <span id="tarteaucitronDotRed"></span>';
                        html += '       </span>';
                        if (tarteaucitronjs.parameters.cookieslist === true) {
                            html += '   </button><!-- @whitespace';
                            html += '   --><button type="button" id="tarteaucitronCookiesNumber">0</button>';
                            html += '   <div id="tarteaucitronCookiesListContainer">';
                            html += '       <button type="button" id="tarteaucitronClosePanelCookie">';
                            html += '           ' + tarteaucitronjs.lang.close;
                            html += '       </button>';
                            html += '       <div class="tarteaucitronCookiesListMain" id="tarteaucitronCookiesTitle">';
                            html += '            <span class="tarteaucitronH2" role="heading" aria-level="2" id="tarteaucitronCookiesNumberBis">0 cookie</span>';
                            html += '       </div>';
                            html += '       <div id="tarteaucitronCookiesList"></div>';
                            html += '    </div>';
                        } else {
                            html += '   </div>';
                        }
                        html += '</div>';
                    }

                    tarteaucitronjs.addInternalScript(tarteaucitronjs.cdn + 'advertising.js?v=' + tarteaucitronjs.version, '', function () {
                        if (tarteaucitronNoAdBlocker === true || tarteaucitronjs.parameters.adblocker === false) {

                            // create a wrapper container at the same level than tarteaucitron so we can add an aria-hidden when tarteaucitron is opened
                            /*var wrapper = document.createElement('div');
                            wrapper.id = "contentWrapper";
    
                            while (document.body.firstChild)
                            {
                                wrapper.appendChild(document.body.firstChild);
                            }
    
                            // Append the wrapper to the body
                            document.body.appendChild(wrapper);*/

                            div.id = 'tarteaucitronRoot';
                            if (tarteaucitronjs.parameters.bodyPosition === 'top') {
                                // Prepend tarteaucitron: #tarteaucitronRoot first-child of the body for better accessibility
                                var bodyFirstChild = body.firstChild;
                                body.insertBefore(div, bodyFirstChild);
                            }
                            else {
                                // Append tarteaucitron: #tarteaucitronRoot last-child of the body
                                body.appendChild(div, body);
                            }
                            div.innerHTML = html;

                            //ie compatibility
                            var tacRootAvailableEvent;
                            if (typeof (Event) === 'function') {
                                tacRootAvailableEvent = new Event("tac.root_available");
                            } else {
                                tacRootAvailableEvent = document.createEvent('Event');
                                tacRootAvailableEvent.initEvent("tac.root_available", true, true);
                            }
                            //end ie compatibility

                            window.dispatchEvent(tacRootAvailableEvent);

                            if (tarteaucitronjs.job !== undefined) {
                                tarteaucitronjs.job = tarteaucitronjs.cleanArray(tarteaucitronjs.job);
                                for (index = 0; index < tarteaucitronjs.job.length; index += 1) {
                                    tarteaucitronjs.addService(tarteaucitronjs.job[index]);
                                }
                            } else {
                                tarteaucitronjs.job = []
                            }

                            tarteaucitronjs.isAjax = true;

                            tarteaucitronjs.job.push = function (id) {

                                // ie <9 hack
                                if (typeof tarteaucitronjs.job.indexOf === 'undefined') {
                                    tarteaucitronjs.job.indexOf = function (obj, start) {
                                        var i,
                                            j = this.length;
                                        for (i = (start || 0); i < j; i += 1) {
                                            if (this[i] === obj) { return i; }
                                        }
                                        return -1;
                                    };
                                }

                                if (tarteaucitronjs.job.indexOf(id) === -1) {
                                    Array.prototype.push.call(this, id);
                                }
                                tarteaucitronjs.launch[id] = false;
                                tarteaucitronjs.addService(id);
                            };

                            if (document.location.hash === tarteaucitronjs.hashtag && tarteaucitronjs.hashtag !== '') {
                                tarteaucitronjs.userInterface.openPanel();
                            }

                            tarteaucitronjs.cookie.number();
                            setInterval(tarteaucitronjs.cookie.number, 60000);
                        }
                    }, tarteaucitronjs.parameters.adblocker);

                    if (tarteaucitronjs.parameters.adblocker === true) {
                        setTimeout(function () {
                            if (tarteaucitronNoAdBlocker === false) {
                                html = '<div id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' + orientation + ' display-block" role="alert" aria-live="polite">';
                                html += '   <p id="tarteaucitronDisclaimerAlert">';
                                html += '       ' + tarteaucitronjs.lang.adblock + '<br/>';
                                html += '       <strong>' + tarteaucitronjs.lang.adblock_call + '</strong>';
                                html += '   </p>';
                                html += '   <button type="button" class="tarteaucitronCTAButton" id="tarteaucitronCTAButton">';
                                html += '       ' + tarteaucitronjs.lang.reload;
                                html += '   </button>';
                                html += '</div>';
                                html += '<div id="tarteaucitronPremium"></div>';

                                div.id = 'tarteaucitronRoot';
                                if (tarteaucitronjs.parameters.bodyPosition === 'top') {
                                    // Prepend tarteaucitron: #tarteaucitronRoot first-child of the body for better accessibility
                                    var bodyFirstChild = body.firstChild;
                                    body.insertBefore(div, bodyFirstChild);
                                }
                                else {
                                    // Append tarteaucitron: #tarteaucitronRoot last-child of the body
                                    body.appendChild(div, body);
                                }
                                div.innerHTML = html;
                            }
                        }, 1500);
                    }

                    // add a little timeout to be sure everything is accessible
                    setTimeout(function () {

                        // Setup events
                        tarteaucitronjs.addClickEventToId("tarteaucitronPersonalize", function () {
                            tarteaucitronjs.userInterface.openPanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronPersonalize2", function () {
                            tarteaucitronjs.userInterface.respondAll(true);
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronManager", function () {
                            tarteaucitronjs.userInterface.openPanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronBack", function () {
                            tarteaucitronjs.userInterface.closePanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronClosePanel", function () {
                            tarteaucitronjs.userInterface.closePanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronClosePanelCookie", function () {
                            tarteaucitronjs.userInterface.closePanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronPrivacyUrl", function () {
                            document.location = tarteaucitronjs.parameters.privacyUrl;
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronPrivacyUrlDialog", function () {
                            document.location = tarteaucitronjs.parameters.privacyUrl;
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronCookiesNumber", function () {
                            tarteaucitronjs.userInterface.toggleCookiesList();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronAllAllowed", function () {
                            tarteaucitronjs.userInterface.respondAll(true);
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronAllDenied", function () {
                            tarteaucitronjs.userInterface.respondAll(false);
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronAllDenied2", function () {
                            tarteaucitronjs.userInterface.respondAll(false);
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronCloseAlert", function () {
                            tarteaucitronjs.userInterface.openPanel();
                        });
                        tarteaucitronjs.addClickEventToId("tarteaucitronCTAButton", function () {
                            location.reload();
                        });
                        var toggleBtns = document.getElementsByClassName("catToggleBtn"), i;
                        for (i = 0; i < toggleBtns.length; i++) {
                            toggleBtns[i].dataset.index = i;
                            tarteaucitronjs.addClickEventToElement(toggleBtns[i], function () {
                                tarteaucitronjs.userInterface.toggle('tarteaucitronDetails' + cat[this.dataset.index], 'tarteaucitronInfoBox');
                                return false;
                            });
                        }

                        var allowBtns = document.getElementsByClassName("tarteaucitronAllow");
                        for (i = 0; i < allowBtns.length; i++) {
                            tarteaucitronjs.addClickEventToElement(allowBtns[i], function () {
                                tarteaucitronjs.userInterface.respond(this, true);
                            });
                        }
                        var denyBtns = document.getElementsByClassName("tarteaucitronDeny");
                        for (i = 0; i < denyBtns.length; i++) {
                            tarteaucitronjs.addClickEventToElement(denyBtns[i], function () {
                                tarteaucitronjs.userInterface.respond(this, false);
                            });
                        }
                    }, 500);

                });
            });

            if (tarteaucitronjs.events.load) {
                tarteaucitronjs.events.load();
            }
        },
        "addService": function (serviceId) {
            var html = '',
                s = tarteaucitronjs.services,
                service = s[serviceId],
                cookie = tarteaucitronjs.cookie.read(),
                hostname = document.location.hostname,
                hostRef = document.referrer.split('/')[2],
                isNavigating = (hostRef === hostname && window.location.href !== tarteaucitronjs.parameters.privacyUrl),
                isAutostart = (!service.needConsent),
                isWaiting = (cookie.indexOf(service.key + '=wait') >= 0),
                isDenied = (cookie.indexOf(service.key + '=false') >= 0),
                isAllowed = ((cookie.indexOf(service.key + '=true') >= 0) || (!service.needConsent && cookie.indexOf(service.key + '=false') < 0)),
                isResponded = (cookie.indexOf(service.key + '=false') >= 0 || cookie.indexOf(service.key + '=true') >= 0),
                isDNTRequested = (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" || navigator.msDoNotTrack === "1" || window.doNotTrack === "1");

            if (tarteaucitronjs.added[service.key] !== true) {
                tarteaucitronjs.added[service.key] = true;

                html += '<li id="' + service.key + 'Line" class="tarteaucitronLine">';
                html += '   <div class="tarteaucitronName">';
                html += '       <span class="tarteaucitronH3" role="heading" aria-level="3">' + service.name + '</span>';
                html += '       <span id="tacCL' + service.key + '" class="tarteaucitronListCookies"></span><br/>';

                if (tarteaucitronjs.parameters.moreInfoLink == true) {

                    var link = 'https://tarteaucitron.io/service/' + service.key + '/';
                    if (service.readmoreLink !== undefined && service.readmoreLink !== '') {
                        link = service.readmoreLink;
                    }
                    if (tarteaucitronjs.parameters.readmoreLink !== undefined && tarteaucitronjs.parameters.readmoreLink !== '') {
                        link = tarteaucitronjs.parameters.readmoreLink;
                    }
                    html += '       <a href="' + link + '" target="_blank" rel="noreferrer noopener nofollow" title="' + tarteaucitronjs.lang.cookieDetail + ' ' + service.name + ' ' + tarteaucitronjs.lang.ourSite + ' ' + tarteaucitronjs.lang.newWindow + '">';
                    html += '           ' + tarteaucitronjs.lang.more;
                    html += '       </a>';
                    html += '        - ';
                    html += '       <a href="' + service.uri + '" target="_blank" rel="noreferrer noopener" title="' + service.name + ' ' + tarteaucitronjs.lang.newWindow + '">';
                    html += '           ' + tarteaucitronjs.lang.source;
                    html += '       </a>';
                }

                html += '   </div>';
                html += '   <div class="tarteaucitronAsk">';
                html += '       <button type="button" id="' + service.key + 'Allowed" class="tarteaucitronAllow">';
                html += '           <span class="tarteaucitronCheck"></span> ' + tarteaucitronjs.lang.allow;
                html += '       </button> ';
                html += '       <button type="button" id="' + service.key + 'Denied" class="tarteaucitronDeny">';
                html += '           <span class="tarteaucitronCross"></span> ' + tarteaucitronjs.lang.deny;
                html += '       </button>';
                html += '   </div>';
                html += '</li>';

                tarteaucitronjs.userInterface.css('tarteaucitronServicesTitle_' + service.type, 'display', 'block');

                if (document.getElementById('tarteaucitronServices_' + service.type) !== null) {
                    document.getElementById('tarteaucitronServices_' + service.type).innerHTML += html;
                }

                tarteaucitronjs.userInterface.css('tarteaucitronNoServicesTitle', 'display', 'none');

                tarteaucitronjs.userInterface.order(service.type);

                tarteaucitronjs.addClickEventToId(service.key + 'Allowed', function () {
                    tarteaucitronjs.userInterface.respond(this, true);
                });

                tarteaucitronjs.addClickEventToId(service.key + 'Denied', function () {
                    tarteaucitronjs.userInterface.respond(this, false);
                });
            }

            tarteaucitronjs.pro('!' + service.key + '=' + isAllowed);

            // allow by default for non EU
            if (isResponded === false && tarteaucitronjs.user.bypass === true) {
                isAllowed = true;
                tarteaucitronjs.cookie.create(service.key, true);
            }

            if ((!isResponded && (isAutostart || (isNavigating && isWaiting)) && !tarteaucitronjs.highPrivacy) || isAllowed) {
                if (!isAllowed || (!service.needConsent && cookie.indexOf(service.key + '=false') < 0)) {
                    tarteaucitronjs.cookie.create(service.key, true);
                }
                if (tarteaucitronjs.launch[service.key] !== true) {
                    tarteaucitronjs.launch[service.key] = true;
                    service.js();
                    tarteaucitronjs.sendEvent(service.key + '_loaded');
                }
                tarteaucitronjs.state[service.key] = true;
                tarteaucitronjs.userInterface.color(service.key, true);
            } else if (isDenied) {
                if (typeof service.fallback === 'function') {
                    service.fallback();
                }
                tarteaucitronjs.state[service.key] = false;
                tarteaucitronjs.userInterface.color(service.key, false);
            } else if (!isResponded && isDNTRequested && tarteaucitronjs.handleBrowserDNTRequest) {
                tarteaucitronjs.cookie.create(service.key, 'false');
                if (typeof service.fallback === 'function') {
                    service.fallback();
                }
                tarteaucitronjs.state[service.key] = false;
                tarteaucitronjs.userInterface.color(service.key, false);
            } else if (!isResponded) {
                tarteaucitronjs.cookie.create(service.key, 'wait');
                if (typeof service.fallback === 'function') {
                    service.fallback();
                }
                tarteaucitronjs.userInterface.color(service.key, 'wait');
                tarteaucitronjs.userInterface.openAlert();
            }

            tarteaucitronjs.cookie.checkCount(service.key);
            tarteaucitronjs.sendEvent(service.key + '_added')
        },
        "sendEvent": function (event_key) {
            if (event_key !== undefined) {
                //ie compatibility
                var send_event_item;
                if (typeof (Event) === 'function') {
                    send_event_item = new Event(event_key);
                } else {
                    send_event_item = document.createEvent('Event');
                    send_event_item.initEvent(event_key, true, true);
                }
                //end ie compatibility

                document.dispatchEvent(send_event_item);
            }
        },
        "cleanArray": function cleanArray(arr) {
            var i,
                len = arr.length,
                out = [],
                obj = {},
                s = tarteaucitronjs.services;

            for (i = 0; i < len; i += 1) {
                if (!obj[arr[i]]) {
                    obj[arr[i]] = {};
                    if (tarteaucitronjs.services[arr[i]] !== undefined) {
                        out.push(arr[i]);
                    }
                }
            }

            out = out.sort(function (a, b) {
                if (s[a].type + s[a].key > s[b].type + s[b].key) { return 1; }
                if (s[a].type + s[a].key < s[b].type + s[b].key) { return -1; }
                return 0;
            });

            return out;
        },
        "userInterface": {
            "css": function (id, property, value) {
                if (document.getElementById(id) !== null) {

                    if (property == "display" && value == "none" && (id == "tarteaucitron" || id == "tarteaucitronBack" || id == "tarteaucitronAlertBig")) {
                        document.getElementById(id).style["opacity"] = "0";

                        setTimeout(function () { document.getElementById(id).style[property] = value; }, 200);
                    } else {

                        document.getElementById(id).style[property] = value;

                        if (property == "display" && value == "block" && (id == "tarteaucitron" || id == "tarteaucitronAlertBig")) {
                            document.getElementById(id).style["opacity"] = "0";
                            setTimeout(function () { document.getElementById(id).style["opacity"] = "1"; }, 1);
                        }

                        if (property == "display" && value == "block" && id == "tarteaucitronBack") {
                            document.getElementById(id).style["opacity"] = "0";
                            setTimeout(function () { document.getElementById(id).style["opacity"] = "0.7"; }, 1);
                        }
                    }
                }
            },
            "addClass": function (id, className) {
                if (document.getElementById(id) !== null) {
                    document.getElementById(id).classList.add(className);
                }
            },
            "removeClass": function (id, className) {
                if (document.getElementById(id) !== null) {
                    document.getElementById(id).classList.remove(className);
                }
            },
            "respondAll": function (status) {
                var s = tarteaucitronjs.services,
                    service,
                    key,
                    index = 0;

                for (index = 0; index < tarteaucitronjs.job.length; index += 1) {
                    service = s[tarteaucitronjs.job[index]];
                    key = service.key;
                    if (tarteaucitronjs.state[key] !== status) {
                        if (status === false && tarteaucitronjs.launch[key] === true) {
                            tarteaucitronjs.reloadThePage = true;
                        }
                        if (tarteaucitronjs.launch[key] !== true && status === true) {

                            tarteaucitronjs.pro('!' + key + '=engage');

                            tarteaucitronjs.launch[key] = true;
                            tarteaucitronjs.services[key].js();
                        }
                        tarteaucitronjs.state[key] = status;
                        tarteaucitronjs.cookie.create(key, status);
                        tarteaucitronjs.userInterface.color(key, status);
                    }
                }
            },
            "respond": function (el, status) {
                if (el.id === '') {
                    return;
                }
                var key = el.id.replace(new RegExp("(Eng[0-9]+|Allow|Deni)ed", "g"), '');

                if (key.substring(0, 13) === 'tarteaucitron' || key === '') { return; }

                // return if same state
                if (tarteaucitronjs.state[key] === status) {
                    return;
                }

                if (status === false && tarteaucitronjs.launch[key] === true) {
                    tarteaucitronjs.reloadThePage = true;
                }

                // if not already launched... launch the service
                if (status === true) {
                    if (tarteaucitronjs.launch[key] !== true) {

                        tarteaucitronjs.pro('!' + key + '=engage');

                        tarteaucitronjs.launch[key] = true;
                        tarteaucitronjs.sendEvent(key + '_loaded');
                        tarteaucitronjs.services[key].js();
                    }
                }
                tarteaucitronjs.state[key] = status;
                tarteaucitronjs.cookie.create(key, status);
                tarteaucitronjs.userInterface.color(key, status);
            },
            "color": function (key, status) {
                var c = 'tarteaucitron',
                    nbDenied = 0,
                    nbPending = 0,
                    nbAllowed = 0,
                    sum = tarteaucitronjs.job.length,
                    index;

                if (status === true) {
                    document.getElementById(key + 'Line').classList.add('tarteaucitronIsAllowed');
                    document.getElementById(key + 'Line').classList.remove('tarteaucitronIsDenied');
                } else if (status === false) {
                    document.getElementById(key + 'Line').classList.remove('tarteaucitronIsAllowed');
                    document.getElementById(key + 'Line').classList.add('tarteaucitronIsDenied');
                }

                // check if all services are allowed
                for (index = 0; index < sum; index += 1) {
                    if (tarteaucitronjs.state[tarteaucitronjs.job[index]] === false) {
                        nbDenied += 1;
                    } else if (tarteaucitronjs.state[tarteaucitronjs.job[index]] === undefined) {
                        nbPending += 1;
                    } else if (tarteaucitronjs.state[tarteaucitronjs.job[index]] === true) {
                        nbAllowed += 1;
                    }
                }

                tarteaucitronjs.userInterface.css(c + 'DotGreen', 'width', ((100 / sum) * nbAllowed) + '%');
                tarteaucitronjs.userInterface.css(c + 'DotYellow', 'width', ((100 / sum) * nbPending) + '%');
                tarteaucitronjs.userInterface.css(c + 'DotRed', 'width', ((100 / sum) * nbDenied) + '%');

                if (nbDenied === 0 && nbPending === 0) {
                    tarteaucitronjs.userInterface.removeClass(c + 'AllDenied', c + 'IsSelected');
                    tarteaucitronjs.userInterface.addClass(c + 'AllAllowed', c + 'IsSelected');

                    tarteaucitronjs.userInterface.addClass(c + 'MainLineOffset', c + 'IsAllowed');
                    tarteaucitronjs.userInterface.removeClass(c + 'MainLineOffset', c + 'IsDenied');
                } else if (nbAllowed === 0 && nbPending === 0) {
                    tarteaucitronjs.userInterface.removeClass(c + 'AllAllowed', c + 'IsSelected');
                    tarteaucitronjs.userInterface.addClass(c + 'AllDenied', c + 'IsSelected');

                    tarteaucitronjs.userInterface.removeClass(c + 'MainLineOffset', c + 'IsAllowed');
                    tarteaucitronjs.userInterface.addClass(c + 'MainLineOffset', c + 'IsDenied');
                } else {
                    tarteaucitronjs.userInterface.removeClass(c + 'AllAllowed', c + 'IsSelected');
                    tarteaucitronjs.userInterface.removeClass(c + 'AllDenied', c + 'IsSelected');

                    tarteaucitronjs.userInterface.removeClass(c + 'MainLineOffset', c + 'IsAllowed');
                    tarteaucitronjs.userInterface.removeClass(c + 'MainLineOffset', c + 'IsDenied');
                }

                // close the alert if all service have been reviewed
                if (nbPending === 0) {
                    tarteaucitronjs.userInterface.closeAlert();
                }

                if (tarteaucitronjs.services[key].cookies.length > 0 && status === false) {
                    tarteaucitronjs.cookie.purge(tarteaucitronjs.services[key].cookies);
                }

                if (status === true) {
                    if (document.getElementById('tacCL' + key) !== null) {
                        document.getElementById('tacCL' + key).innerHTML = '...';
                    }
                    setTimeout(function () {
                        tarteaucitronjs.cookie.checkCount(key);
                    }, 2500);
                } else {
                    tarteaucitronjs.cookie.checkCount(key);
                }
            },
            "openPanel": function () {
                tarteaucitronjs.userInterface.css('tarteaucitron', 'display', 'block');
                tarteaucitronjs.userInterface.css('tarteaucitronBack', 'display', 'block');
                tarteaucitronjs.userInterface.css('tarteaucitronCookiesListContainer', 'display', 'none');

                document.getElementById('tarteaucitronClosePanel').focus();
                document.getElementsByTagName('body')[0].classList.add('modal-open');
                tarteaucitronjs.userInterface.focusTrap();
                tarteaucitronjs.userInterface.jsSizing('main');

                //ie compatibility
                var tacOpenPanelEvent;
                if (typeof (Event) === 'function') {
                    tacOpenPanelEvent = new Event("tac.open_panel");
                } else {
                    tacOpenPanelEvent = document.createEvent('Event');
                    tacOpenPanelEvent.initEvent("tac.open_panel", true, true);
                }
                //end ie compatibility

                window.dispatchEvent(tacOpenPanelEvent);
            },
            "closePanel": function () {
                if (document.location.hash === tarteaucitronjs.hashtag) {
                    if (window.history) {
                        window.history.replaceState('', document.title, window.location.pathname + window.location.search);
                    } else {
                        document.location.hash = '';
                    }
                }
                tarteaucitronjs.userInterface.css('tarteaucitron', 'display', 'none');
                tarteaucitronjs.userInterface.css('tarteaucitronCookiesListContainer', 'display', 'none');

                tarteaucitronjs.fallback(['tarteaucitronInfoBox'], function (elem) {
                    elem.style.display = 'none';
                }, true);

                if (tarteaucitronjs.reloadThePage === true) {
                    window.location.reload();
                } else {
                    tarteaucitronjs.userInterface.css('tarteaucitronBack', 'display', 'none');
                }
                if (document.getElementById('tarteaucitronCloseAlert') !== null) {
                    document.getElementById('tarteaucitronCloseAlert').focus();
                }
                document.getElementsByTagName('body')[0].classList.remove('modal-open');

                //ie compatibility
                var tacClosePanelEvent;
                if (typeof (Event) === 'function') {
                    tacClosePanelEvent = new Event("tac.close_panel");
                } else {
                    tacClosePanelEvent = document.createEvent('Event');
                    tacClosePanelEvent.initEvent("tac.close_panel", true, true);
                }
                //end ie compatibility

                window.dispatchEvent(tacClosePanelEvent);
            },
            "focusTrap": function () {
                var focusableEls,
                    firstFocusableEl,
                    lastFocusableEl,
                    filtered;

                focusableEls = document.getElementById('tarteaucitron').querySelectorAll('a[href], button');
                filtered = [];

                // get only visible items
                for (var i = 0, max = focusableEls.length; i < max; i++) {
                    if (focusableEls[i].offsetHeight > 0) {
                        filtered.push(focusableEls[i]);
                    }
                }

                firstFocusableEl = filtered[0];
                lastFocusableEl = filtered[filtered.length - 1];

                //loop focus inside tarteaucitron
                document.getElementById('tarteaucitron').addEventListener("keydown", function (evt) {

                    if (evt.key === 'Tab' || evt.keyCode === 9) {

                        if (evt.shiftKey) /* shift + tab */ {
                            if (document.activeElement === firstFocusableEl) {
                                lastFocusableEl.focus();
                                evt.preventDefault();
                            }
                        } else /* tab */ {
                            if (document.activeElement === lastFocusableEl) {
                                firstFocusableEl.focus();
                                evt.preventDefault();
                            }
                        }
                    }
                })
            },
            "openAlert": function () {
                var c = 'tarteaucitron';
                tarteaucitronjs.userInterface.css(c + 'Percentage', 'display', 'block');
                tarteaucitronjs.userInterface.css(c + 'AlertSmall', 'display', 'none');
                tarteaucitronjs.userInterface.css(c + 'Icon', 'display', 'none');
                tarteaucitronjs.userInterface.css(c + 'AlertBig', 'display', 'block');
                tarteaucitronjs.userInterface.addClass(c + 'Root', 'tarteaucitronBeforeVisible');

                //ie compatibility
                var tacOpenAlertEvent;
                if (typeof (Event) === 'function') {
                    tacOpenAlertEvent = new Event("tac.open_alert");
                } else {
                    tacOpenAlertEvent = document.createEvent('Event');
                    tacOpenAlertEvent.initEvent("tac.open_alert", true, true);
                }
                //end ie compatibility

                window.dispatchEvent(tacOpenAlertEvent);
            },
            "closeAlert": function () {
                var c = 'tarteaucitron';
                tarteaucitronjs.userInterface.css(c + 'Percentage', 'display', 'none');
                tarteaucitronjs.userInterface.css(c + 'AlertSmall', 'display', 'block');
                tarteaucitronjs.userInterface.css(c + 'Icon', 'display', 'block');
                tarteaucitronjs.userInterface.css(c + 'AlertBig', 'display', 'none');
                tarteaucitronjs.userInterface.removeClass(c + 'Root', 'tarteaucitronBeforeVisible');
                tarteaucitronjs.userInterface.jsSizing('box');

                //ie compatibility
                var tacCloseAlertEvent;
                if (typeof (Event) === 'function') {
                    tacCloseAlertEvent = new Event("tac.close_alert");
                } else {
                    tacCloseAlertEvent = document.createEvent('Event');
                    tacCloseAlertEvent.initEvent("tac.close_alert", true, true);
                }
                //end ie compatibility

                window.dispatchEvent(tacCloseAlertEvent);
            },
            "toggleCookiesList": function () {
                var div = document.getElementById('tarteaucitronCookiesListContainer');

                if (div === null) {
                    return;
                }

                if (div.style.display !== 'block') {
                    tarteaucitronjs.cookie.number();
                    div.style.display = 'block';
                    tarteaucitronjs.userInterface.jsSizing('cookie');
                    tarteaucitronjs.userInterface.css('tarteaucitron', 'display', 'none');
                    tarteaucitronjs.userInterface.css('tarteaucitronBack', 'display', 'block');
                    tarteaucitronjs.fallback(['tarteaucitronInfoBox'], function (elem) {
                        elem.style.display = 'none';
                    }, true);
                } else {
                    div.style.display = 'none';
                    tarteaucitronjs.userInterface.css('tarteaucitron', 'display', 'none');
                    tarteaucitronjs.userInterface.css('tarteaucitronBack', 'display', 'none');
                }
            },
            "toggle": function (id, closeClass) {
                var div = document.getElementById(id);

                if (div === null) {
                    return;
                }

                if (closeClass !== undefined) {
                    tarteaucitronjs.fallback([closeClass], function (elem) {
                        if (elem.id !== id) {
                            elem.style.display = 'none';
                        }
                    }, true);
                }

                if (div.style.display !== 'block') {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            },
            "order": function (id) {
                var main = document.getElementById('tarteaucitronServices_' + id),
                    allDivs,
                    store = [],
                    i;

                if (main === null) {
                    return;
                }

                allDivs = main.childNodes;

                if (typeof Array.prototype.map === 'function' && typeof Enumerable === 'undefined') {
                    Array.prototype.map.call(main.children, Object).sort(function (a, b) {
                        //var mainChildren = Array.from(main.children);
                        //mainChildren.sort(function (a, b) {
                        if (tarteaucitronjs.services[a.id.replace(/Line/g, '')].name > tarteaucitronjs.services[b.id.replace(/Line/g, '')].name) { return 1; }
                        if (tarteaucitronjs.services[a.id.replace(/Line/g, '')].name < tarteaucitronjs.services[b.id.replace(/Line/g, '')].name) { return -1; }
                        return 0;
                    }).forEach(function (element) {
                        main.appendChild(element);
                    });
                }
            },
            "jsSizing": function (type) {
                var scrollbarMarginRight = 10,
                    scrollbarWidthParent,
                    scrollbarWidthChild,
                    servicesHeight,
                    e = window,
                    a = 'inner',
                    windowInnerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    mainTop,
                    mainHeight,
                    closeButtonHeight,
                    headerHeight,
                    cookiesListHeight,
                    cookiesCloseHeight,
                    cookiesTitleHeight,
                    paddingBox,
                    alertSmallHeight,
                    cookiesNumberHeight;

                if (type === 'box') {
                    if (document.getElementById('tarteaucitronAlertSmall') !== null && document.getElementById('tarteaucitronCookiesNumber') !== null) {

                        // reset
                        tarteaucitronjs.userInterface.css('tarteaucitronCookiesNumber', 'padding', '0px 10px');

                        // calculate
                        alertSmallHeight = document.getElementById('tarteaucitronAlertSmall').offsetHeight;
                        cookiesNumberHeight = document.getElementById('tarteaucitronCookiesNumber').offsetHeight;
                        paddingBox = (alertSmallHeight - cookiesNumberHeight) / 2;

                        // apply
                        tarteaucitronjs.userInterface.css('tarteaucitronCookiesNumber', 'padding', paddingBox + 'px 10px');
                    }
                } else if (type === 'main') {

                    // get the real window width for media query
                    if (window.innerWidth === undefined) {
                        a = 'client';
                        e = document.documentElement || document.body;
                    }

                    // height of the services list container
                    if (document.getElementById('tarteaucitron') !== null && document.getElementById('tarteaucitronClosePanel') !== null && document.getElementById('tarteaucitronMainLineOffset') !== null) {

                        // reset
                        tarteaucitronjs.userInterface.css('tarteaucitronServices', 'height', 'auto');

                        // calculate
                        mainHeight = document.getElementById('tarteaucitron').offsetHeight;
                        closeButtonHeight = document.getElementById('tarteaucitronClosePanel').offsetHeight;

                        // apply
                        servicesHeight = (mainHeight - closeButtonHeight + 2);
                        tarteaucitronjs.userInterface.css('tarteaucitronServices', 'height', servicesHeight + 'px');
                        tarteaucitronjs.userInterface.css('tarteaucitronServices', 'overflow-x', 'auto');
                    }

                    // align the main allow/deny button depending on scrollbar width
                    if (document.getElementById('tarteaucitronServices') !== null && document.getElementById('tarteaucitronScrollbarChild') !== null) {
                        // media query
                        if (e[a + 'Width'] <= 479) {
                            //tarteaucitronjs.userInterface.css('tarteaucitronScrollbarAdjust', 'marginLeft', '11px');
                        } else if (e[a + 'Width'] <= 767) {
                            scrollbarMarginRight = 12;
                        }

                        scrollbarWidthParent = document.getElementById('tarteaucitronServices').offsetWidth;
                        scrollbarWidthChild = document.getElementById('tarteaucitronScrollbarChild').offsetWidth;
                        //tarteaucitronjs.userInterface.css('tarteaucitronScrollbarAdjust', 'marginRight', ((scrollbarWidthParent - scrollbarWidthChild) + scrollbarMarginRight) + 'px');
                    }

                    // center the main panel
                    if (document.getElementById('tarteaucitron') !== null) {

                        // media query
                        if (e[a + 'Width'] <= 767) {
                            mainTop = 0;
                        } else {
                            mainTop = ((windowInnerHeight - document.getElementById('tarteaucitron').offsetHeight) / 2) - 21;
                        }

                        if (document.getElementById('tarteaucitronMainLineOffset') !== null) {
                            if (document.getElementById('tarteaucitron').offsetHeight < (windowInnerHeight / 2)) {
                                mainTop -= document.getElementById('tarteaucitronMainLineOffset').offsetHeight;
                            }
                        }

                        // correct
                        if (mainTop < 0) {
                            mainTop = 0;
                        }

                        // apply
                        tarteaucitronjs.userInterface.css('tarteaucitron', 'top', mainTop + 'px');
                    }


                } else if (type === 'cookie') {

                    // put cookies list at bottom
                    if (document.getElementById('tarteaucitronAlertSmall') !== null) {
                        tarteaucitronjs.userInterface.css('tarteaucitronCookiesListContainer', 'bottom', (document.getElementById('tarteaucitronAlertSmall').offsetHeight) + 'px');
                    }

                    // height of cookies list
                    if (document.getElementById('tarteaucitronCookiesListContainer') !== null) {

                        // reset
                        tarteaucitronjs.userInterface.css('tarteaucitronCookiesList', 'height', 'auto');

                        // calculate
                        cookiesListHeight = document.getElementById('tarteaucitronCookiesListContainer').offsetHeight;
                        cookiesCloseHeight = document.getElementById('tarteaucitronClosePanelCookie').offsetHeight;
                        cookiesTitleHeight = document.getElementById('tarteaucitronCookiesTitle').offsetHeight;

                        // apply
                        tarteaucitronjs.userInterface.css('tarteaucitronCookiesList', 'height', (cookiesListHeight - cookiesCloseHeight - cookiesTitleHeight - 2) + 'px');
                    }
                }
            }
        },
        "cookie": {
            "owner": {},
            "create": function (key, status) {
                if (tarteaucitronForceExpire !== '') {
                    // The number of day(s)/hour(s) can't be higher than 1 year
                    if ((tarteaucitronExpireInDay && tarteaucitronForceExpire < 365) || (!tarteaucitronExpireInDay && tarteaucitronForceExpire < 8760)) {
                        if (tarteaucitronExpireInDay) {
                            // Multiplication to tranform the number of days to milliseconds
                            timeExpire = tarteaucitronForceExpire * 86400000;
                        } else {
                            // Multiplication to tranform the number of hours to milliseconds
                            timeExpire = tarteaucitronForceExpire * 3600000;
                        }
                    }
                }

                var d = new Date(),
                    time = d.getTime(),
                    expireTime = time + timeExpire, // 365 days
                    regex = new RegExp("!" + key + "=(wait|true|false)", "g"),
                    cookie = tarteaucitronjs.cookie.read().replace(regex, ""),
                    value = tarteaucitronjs.parameters.cookieName + '=' + cookie + '!' + key + '=' + status,
                    domain = (tarteaucitronjs.parameters.cookieDomain !== undefined && tarteaucitronjs.parameters.cookieDomain !== '') ? '; domain=' + tarteaucitronjs.parameters.cookieDomain : '',
                    secure = location.protocol === 'https:' ? '; Secure' : '';

                d.setTime(expireTime);
                document.cookie = value + '; expires=' + d.toGMTString() + '; path=/' + domain + secure + '; samesite=lax';
            },
            "read": function () {
                var nameEQ = tarteaucitronjs.parameters.cookieName + "=",
                    ca = document.cookie.split(';'),
                    i,
                    c;

                for (i = 0; i < ca.length; i += 1) {
                    c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
                return '';
            },
            "purge": function (arr) {
                var i;

                for (i = 0; i < arr.length; i += 1) {
                    document.cookie = arr[i] + '=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/;';
                    document.cookie = arr[i] + '=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/; domain=.' + location.hostname + ';';
                    document.cookie = arr[i] + '=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/; domain=.' + location.hostname.split('.').slice(-2).join('.') + ';';
                }
            },
            "checkCount": function (key) {
                var arr = tarteaucitronjs.services[key].cookies,
                    nb = arr.length,
                    nbCurrent = 0,
                    html = '',
                    i,
                    status = document.cookie.indexOf(key + '=true');

                if (status >= 0 && nb === 0) {
                    html += tarteaucitronjs.lang.useNoCookie;
                } else if (status >= 0) {
                    for (i = 0; i < nb; i += 1) {
                        if (document.cookie.indexOf(arr[i] + '=') !== -1) {
                            nbCurrent += 1;
                            if (tarteaucitronjs.cookie.owner[arr[i]] === undefined) {
                                tarteaucitronjs.cookie.owner[arr[i]] = [];
                            }
                            if (tarteaucitronjs.cookie.crossIndexOf(tarteaucitronjs.cookie.owner[arr[i]], tarteaucitronjs.services[key].name) === false) {
                                tarteaucitronjs.cookie.owner[arr[i]].push(tarteaucitronjs.services[key].name);
                            }
                        }
                    }

                    if (nbCurrent > 0) {
                        html += tarteaucitronjs.lang.useCookieCurrent + ' ' + nbCurrent + ' cookie';
                        if (nbCurrent > 1) {
                            html += 's';
                        }
                        html += '.';
                    } else {
                        html += tarteaucitronjs.lang.useNoCookie;
                    }
                } else if (nb === 0) {
                    html = tarteaucitronjs.lang.noCookie;
                } else {
                    html += tarteaucitronjs.lang.useCookie + ' ' + nb + ' cookie';
                    if (nb > 1) {
                        html += 's';
                    }
                    html += '.';
                }

                if (document.getElementById('tacCL' + key) !== null) {
                    document.getElementById('tacCL' + key).innerHTML = html;
                }
            },
            "crossIndexOf": function (arr, match) {
                var i;
                for (i = 0; i < arr.length; i += 1) {
                    if (arr[i] === match) {
                        return true;
                    }
                }
                return false;
            },
            "number": function () {
                var cookies = document.cookie.split(';'),
                    nb = (document.cookie !== '') ? cookies.length : 0,
                    html = '',
                    i,
                    name,
                    namea,
                    nameb,
                    c,
                    d,
                    s = (nb > 1) ? 's' : '',
                    savedname,
                    regex = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i,
                    regexedDomain = (tarteaucitronjs.cdn.match(regex) !== null) ? tarteaucitronjs.cdn.match(regex)[1] : tarteaucitronjs.cdn,
                    host = (tarteaucitronjs.domain !== undefined) ? tarteaucitronjs.domain : regexedDomain;

                cookies = cookies.sort(function (a, b) {
                    namea = a.split('=', 1).toString().replace(/ /g, '');
                    nameb = b.split('=', 1).toString().replace(/ /g, '');
                    c = (tarteaucitronjs.cookie.owner[namea] !== undefined) ? tarteaucitronjs.cookie.owner[namea] : '0';
                    d = (tarteaucitronjs.cookie.owner[nameb] !== undefined) ? tarteaucitronjs.cookie.owner[nameb] : '0';
                    if (c + a > d + b) { return 1; }
                    if (c + a < d + b) { return -1; }
                    return 0;
                });

                if (document.cookie !== '') {
                    for (i = 0; i < nb; i += 1) {
                        name = cookies[i].split('=', 1).toString().replace(/ /g, '');
                        if (tarteaucitronjs.cookie.owner[name] !== undefined && tarteaucitronjs.cookie.owner[name].join(' // ') !== savedname) {
                            savedname = tarteaucitronjs.cookie.owner[name].join(' // ');
                            html += '<div class="tarteaucitronHidden">';
                            html += '     <span class="tarteaucitronTitle tarteaucitronH3" role="heading" aria-level="3">';
                            html += '        ' + tarteaucitronjs.cookie.owner[name].join(' // ');
                            html += '    </span>';
                            html += '</div><ul class="cookie-list">';
                        } else if (tarteaucitronjs.cookie.owner[name] === undefined && host !== savedname) {
                            savedname = host;
                            html += '<div class="tarteaucitronHidden">';
                            html += '     <span class="tarteaucitronTitle tarteaucitronH3" role="heading" aria-level="3">';
                            html += '        ' + host;
                            html += '    </span>';
                            html += '</div><ul class="cookie-list">';
                        }
                        html += '<li class="tarteaucitronCookiesListMain">';
                        html += '    <div class="tarteaucitronCookiesListLeft"><button type="button" class="purgeBtn" data-cookie="' + tarteaucitronjs.fixSelfXSS(cookies[i].split('=', 1)) + '"><strong>&times;</strong></button> <strong>' + tarteaucitronjs.fixSelfXSS(name) + '</strong>';
                        html += '    </div>';
                        html += '    <div class="tarteaucitronCookiesListRight">' + tarteaucitronjs.fixSelfXSS(cookies[i].split('=').slice(1).join('=')) + '</div>';
                        html += '</li>';
                    }
                    html += '</ul>';
                } else {
                    html += '<div class="tarteaucitronCookiesListMain">';
                    html += '    <div class="tarteaucitronCookiesListLeft"><strong>-</strong></div>';
                    html += '    <div class="tarteaucitronCookiesListRight"></div>';
                    html += '</div>';
                }

                html += '<div class="tarteaucitronHidden spacer-20"></div>';

                if (document.getElementById('tarteaucitronCookiesList') !== null) {
                    document.getElementById('tarteaucitronCookiesList').innerHTML = html;
                }

                if (document.getElementById('tarteaucitronCookiesNumber') !== null) {
                    document.getElementById('tarteaucitronCookiesNumber').innerHTML = nb;
                }

                if (document.getElementById('tarteaucitronCookiesNumberBis') !== null) {
                    document.getElementById('tarteaucitronCookiesNumberBis').innerHTML = nb + ' cookie' + s;
                }

                var purgeBtns = document.getElementsByClassName("purgeBtn");
                for (i = 0; i < purgeBtns.length; i++) {
                    tarteaucitronjs.addClickEventToElement(purgeBtns[i], function () {
                        tarteaucitronjs.cookie.purge([this.dataset.cookie]);
                        tarteaucitronjs.cookie.number();
                        tarteaucitronjs.userInterface.jsSizing('cookie');
                        return false;
                    });
                }

                for (i = 0; i < tarteaucitronjs.job.length; i += 1) {
                    tarteaucitronjs.cookie.checkCount(tarteaucitronjs.job[i]);
                }
            }
        },
        "fixSelfXSS": function (html) {
            const fixed = html.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            return fixed;
        },
        "getLanguage": function () {
            var availableLanguages = 'bg,cn,cs,da,de,el,en,es,fi,fr,hu,it,ja,nl,oc,pl,pt,ro,ru,se,sk,tr,vi',
                defaultLanguage = 'en';

            if (tarteaucitronForceLanguage !== '') {
                if (availableLanguages.indexOf(tarteaucitronForceLanguage) !== -1) {
                    return tarteaucitronForceLanguage;
                }
            }

            if (!navigator) { return 'en'; }

            var lang = navigator.language || navigator.browserLanguage ||
                navigator.systemLanguage || navigator.userLang || null,
                userLanguage = lang ? lang.substr(0, 2) : null;

            if (availableLanguages.indexOf(userLanguage) === -1) {
                return defaultLanguage;
            }
            return userLanguage;
        },
        "getLocale": function () {
            if (!navigator) { return 'en_US'; }

            var lang = navigator.language || navigator.browserLanguage ||
                navigator.systemLanguage || navigator.userLang || null,
                userLanguage = lang ? lang.substr(0, 2) : null;

            if (userLanguage === 'fr') {
                return 'fr_FR';
            } else if (userLanguage === 'en') {
                return 'en_US';
            } else if (userLanguage === 'de') {
                return 'de_DE';
            } else if (userLanguage === 'es') {
                return 'es_ES';
            } else if (userLanguage === 'it') {
                return 'it_IT';
            } else if (userLanguage === 'pt') {
                return 'pt_PT';
            } else if (userLanguage === 'nl') {
                return 'nl_NL';
            } else if (userLanguage === 'el') {
                return 'el_EL';
            } else {
                return 'en_US';
            }
        },
        "addScript": function (url, id, callback, execute, attrName, attrVal, internal) {
            var script,
                done = false;

            if (execute === false) {
                if (typeof callback === 'function') {
                    callback();
                }
            } else {
                script = document.createElement('script');
                script.type = 'text/javascript';
                script.id = (id !== undefined) ? id : '';
                script.async = true;
                script.src = url;

                if (attrName !== undefined && attrVal !== undefined) {
                    script.setAttribute(attrName, attrVal);
                }

                if (typeof callback === 'function') {
                    if (!tarteaucitronjs.parameters.useExternalJs || !internal) {
                        script.onreadystatechange = script.onload = function () {
                            var state = script.readyState;
                            if (!done && (!state || /loaded|complete/.test(state))) {
                                done = true;
                                callback();
                            }
                        };
                    } else {
                        callback();
                    }
                }

                if (!tarteaucitronjs.parameters.useExternalJs || !internal) {
                    document.getElementsByTagName('head')[0].appendChild(script);
                }
            }
        },
        "addInternalScript": function (url, id, callback, execute, attrName, attrVal) {
            tarteaucitronjs.addScript(url, id, callback, execute, attrName, attrVal, true);
        },
        "makeAsync": {
            "antiGhost": 0,
            "buffer": '',
            "init": function (url, id) {
                var savedWrite = document.write,
                    savedWriteln = document.writeln;

                document.write = function (content) {
                    tarteaucitronjs.makeAsync.buffer += content;
                };
                document.writeln = function (content) {
                    tarteaucitronjs.makeAsync.buffer += content.concat("\n");
                };

                setTimeout(function () {
                    document.write = savedWrite;
                    document.writeln = savedWriteln;
                }, 20000);

                tarteaucitronjs.makeAsync.getAndParse(url, id);
            },
            "getAndParse": function (url, id) {
                if (tarteaucitronjs.makeAsync.antiGhost > 9) {
                    tarteaucitronjs.makeAsync.antiGhost = 0;
                    return;
                }
                tarteaucitronjs.makeAsync.antiGhost += 1;
                tarteaucitronjs.addInternalScript(url, '', function () {
                    if (document.getElementById(id) !== null) {
                        document.getElementById(id).innerHTML += "<span class='display-none'>&nbsp;</span>" + tarteaucitronjs.makeAsync.buffer;
                        tarteaucitronjs.makeAsync.buffer = '';
                        tarteaucitronjs.makeAsync.execJS(id);
                    }
                });
            },
            "execJS": function (id) {
                /* not strict because third party scripts may have errors */
                var i,
                    scripts,
                    childId,
                    type;

                if (document.getElementById(id) === null) {
                    return;
                }

                scripts = document.getElementById(id).getElementsByTagName('script');
                for (i = 0; i < scripts.length; i += 1) {
                    type = (scripts[i].getAttribute('type') !== null) ? scripts[i].getAttribute('type') : '';
                    if (type === '') {
                        type = (scripts[i].getAttribute('language') !== null) ? scripts[i].getAttribute('language') : '';
                    }
                    if (scripts[i].getAttribute('src') !== null && scripts[i].getAttribute('src') !== '') {
                        childId = id + Math.floor(Math.random() * 99999999999);
                        document.getElementById(id).innerHTML += '<div id="' + childId + '"></div>';
                        tarteaucitronjs.makeAsync.getAndParse(scripts[i].getAttribute('src'), childId);
                    } else if (type.indexOf('javascript') !== -1 || type === '') {
                        eval(scripts[i].innerHTML);
                    }
                }
            }
        },
        "fallback": function (matchClass, content, noInner) {
            var elems = document.getElementsByTagName('*'),
                i,
                index = 0;

            for (i in elems) {
                if (elems[i] !== undefined) {
                    for (index = 0; index < matchClass.length; index += 1) {
                        if ((' ' + elems[i].className + ' ')
                            .indexOf(' ' + matchClass[index] + ' ') > -1) {
                            if (typeof content === 'function') {
                                if (noInner === true) {
                                    content(elems[i]);
                                } else {
                                    elems[i].innerHTML = content(elems[i]);
                                }
                            } else {
                                elems[i].innerHTML = content;
                            }
                        }
                    }
                }
            }
        },
        "engage": function (id) {
            var html = '',
                r = Math.floor(Math.random() * 100000),
                engage = tarteaucitronjs.services[id].name + ' ' + tarteaucitronjs.lang.fallback;

            if (tarteaucitronjs.lang['engage-' + id] !== undefined) {
                engage = tarteaucitronjs.lang['engage-' + id];
            }

            html += '<div class="tac_activate tac_activate_' + id + '">';
            html += '   <div class="tac_float">';
            html += '      ' + engage;
            html += '      <button type="button" class="tarteaucitronAllow" id="Eng' + r + 'ed' + id + '">';
            html += '          <span class="tarteaucitronCheck"></span> ' + tarteaucitronjs.lang.allow;
            html += '       </button>';
            html += '   </div>';
            html += '</div>';

            return html;
        },
        "extend": function (a, b) {
            var prop;
            for (prop in b) {
                if (b.hasOwnProperty(prop)) {
                    a[prop] = b[prop];
                }
            }
        },
        "proTemp": '',
        "proTimer": function () {
            setTimeout(tarteaucitronjs.proPing, 500);
        },
        "pro": function (list) {
            tarteaucitronjs.proTemp += list;
            clearTimeout(tarteaucitronjs.proTimer);
            tarteaucitronjs.proTimer = setTimeout(tarteaucitronjs.proPing, 500);
        },
        "proPing": function () {
            if (tarteaucitronjs.uuid !== '' && tarteaucitronjs.uuid !== undefined && tarteaucitronjs.proTemp !== '') {
                var div = document.getElementById('tarteaucitronPremium'),
                    timestamp = new Date().getTime(),
                    url = 'https://tarteaucitronjs.io/log/?';

                if (div === null) {
                    return;
                }

                url += 'account=' + tarteaucitronjs.uuid + '&';
                url += 'domain=' + tarteaucitronjs.domain + '&';
                url += 'status=' + encodeURIComponent(tarteaucitronjs.proTemp) + '&';
                url += '_time=' + timestamp;

                div.innerHTML = '<img src="' + url + '" class="display-none" />';

                tarteaucitronjs.proTemp = '';
            }

            tarteaucitronjs.cookie.number();
        },
        "AddOrUpdate": function (source, custom) {
            /**
             Utility function to Add or update the fields of obj1 with the ones in obj2
             */
            for (var key in custom) {
                if (custom[key] instanceof Object) {
                    source[key] = tarteaucitronjs.AddOrUpdate(source[key], custom[key]);
                } else {
                    source[key] = custom[key];
                }
            }
            return source;
        },
        "getElemWidth": function (elem) {
            return elem.getAttribute('width') || elem.clientWidth;
        },
        "getElemHeight": function (elem) {
            return elem.getAttribute('height') || elem.clientHeight;
        },
        "addClickEventToId": function (elemId, func) {
            tarteaucitronjs.addClickEventToElement(document.getElementById(elemId), func);
        },
        "addClickEventToElement": function (e, func) {
            if (e) {
                if (e.addEventListener) {
                    e.addEventListener("click", func);
                } else {
                    e.attachEvent("onclick", func);
                }
            }
        }
    };

    return tarteaucitronjs;
}));
