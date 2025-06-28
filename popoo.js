(function(window, document, screen) {
    // New function to create and display the iframe ad
    function createIframeAd(url, topPosition) {
        // Remove existing iframe if it exists
        const existingIframe = document.getElementById('ad-iframe');
        if (existingIframe) {
            existingIframe.remove();
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'ad-iframe';
        iframe.src = url;
        iframe.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 999999;
            transform: translateY(${topPosition}%); /* Use transform for smooth positioning */
        `;
        document.body.appendChild(iframe);
    }

    // Polyfill for Function.prototype.bind
    Function.prototype.bind || (Function.prototype.bind = function(thisArg) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        var noOp = function() {};
        var bound = function() {
            return self.apply(this instanceof noOp && thisArg ? this : thisArg, args.concat(Array.prototype.slice.call(arguments)));
        };
        noOp.prototype = this.prototype;
        bound.prototype = new noOp;
        return bound;
    });

    var utils = {
        _cookieLockSet: function(value) {
            // This function no longer needs to write to cookies/localStorage.
            return true;
        },
        _cookieLockGet: function() {
            // Always returns false to never block.
            return false;
        },
        _windowOpen: function(url, options) {
            // This function is still present for potential internal use but won't be used for ad display.
            var name = "" + Math.random();
            if (this.cap.env.b === "msie" && this.cap.env.v <= 9) {
                name = "";
            }
            try {
                var newWindow = options ? this.iframewin.open("about:blank", name, options) : this.iframewin.open("about:blank", name);
            } catch (e) {
                return false;
            }
            if (this.settings.openernull) {
                try {
                    newWindow.opener = null;
                } catch (e) {}
            }
            try {
                newWindow.location.replace(url);
            } catch (e) {}
            return newWindow;
        },
        // Only iframe ad will be created, so this function simplifies the ad opening logic.
        _openAd: function(url, options) {
            createIframeAd(url, adManager._config._iframeTopPosition);
            return true; // Indicate that the action has been scheduled.
        },
        abortPop: function() {
            this.clearUrls();
        },
        _detectBrowser: function() {
            var os, browser, version;
            var userAgent = navigator.userAgent;
            var deviceType = "desktop";
            browser = "chromium";
            version = 100;
            var match;
            if (match = userAgent.match(/^Mozilla\/5\.0 \([^\)]+\) AppleWebKit\/[0-9\.]+ \(KHTML, like Gecko\) Chrome\/([0-9]+)[0-9\.]+ Safari\/[0-9\.]+$/)) {
                browser = "chrome";
                version = match[1];
            }
            if (match = userAgent.match(/(Firefox|OPR|Edge?)\/([0-9]+)/)) {
                browser = match[1].toLowerCase();
                version = match[2];
            }
            if (match = userAgent.match(/rv:([0-9]+)\.0\) like Gecko/)) {
                browser = "msie";
                version = match[1];
            }
            if (match = userAgent.match(/MSIE ([0-9]+)/)) {
                browser = "msie";
                version = match[1];
            }
            if (userAgent.match(/Windows NT/)) {
                os = "windows";
            }
            if (match = userAgent.match(/([0-9]+)(_([0-9]+)){0,} like Mac OS X/)) {
                os = "ios";
                browser = "safari";
                version = match[1];
                deviceType = "mobile";
            }
            if (match = userAgent.match(/(CrOS)\/([0-9]+)/)) {
                browser = "chrome";
                version = match[2];
            }
            if (match = userAgent.match(/\(KHTML, like Gecko\) Version\/([0-9]+)/)) {
                browser = "safari";
                version = match[1];
            }
            if (userAgent.match(/Macintosh; Intel Mac OS X /)) {
                os = "macosx";
            }
            if (userAgent.match(/Android|like Mac OS X|Mobile|Phone|Tablet/)) {
                deviceType = "mobile";
            }
            if (userAgent.match(/^Mozilla\/5\.0 \(Linux; Android/)) {
                os = "android";
            }
            if (browser === "edg") {
                browser = "edge";
            }
            if (browser === "edge" && version > 50) {
                browser = "chromium";
            }
            if (browser === "opr") {
                browser = "chromium";
            }
            if (os === "macosx" && navigator.maxTouchPoints > 0) {
                os = "ios";
                browser = "safari";
                deviceType = "mobile";
            }
            if (navigator.userAgent.startsWith("Mozilla/5.0 (X11; Linux x86_64)") && !navigator.platform.includes("84_64") && navigator.maxTouchPoints >= 2) {
                os = "android";
                browser = "chrome";
                deviceType = "mobile";
            }
            var isInIframe = (window != window.top);
            var isCrossOriginReferrer = (document.referrer.startsWith(window.location.origin) === false && !isInIframe);
            return {
                os: os,
                browser: browser,
                version: version,
                deviceType: deviceType,
                isInIframe: isInIframe,
                isCrossOriginReferrer: isCrossOriginReferrer
            };
        },
        _getBrowserCapabilities: function() {
            var env = this._detectBrowser();
            // All capabilities related to popups/popunders are effectively set to false or ignored
            return {
                env: env,
                popup: false,
                popunder: false,
                tabup: false,
                tabunder: false,
                punderminipop: false,
                isCrossOriginReferrer: env.isCrossOriginReferrer
            };
        },
        _onExecute: function(event) {
            event = event || window.event;
            // Handle middle click
            if (event.type === "click") {
                var isMiddleClick = false;
                if ("which" in event) {
                    isMiddleClick = (event.which === 3);
                } else if ("button" in event) {
                    isMiddleClick = (event.button === 2);
                }
                if (isMiddleClick) return false;
            }

            // User Activation API checks (simplified)
            try {
                if (this.userActivation && !window.navigator.userActivation.isActive && !this.iframewin.navigator.userActivation.isActive) {
                    return false;
                }
            } catch (e) {}

            if (this.urls.length === 0) return false;

            var currentAd = this.urls[0];
            var openedAd = this._openAd(currentAd.url, currentAd.options);

            if (openedAd) {
                this.urls.shift();
                if (this.urls.length === 0) {
                    clearInterval(this.uahtimer);
                    this.uahtimer = 0;
                }
            }
        },
        _userActivationHandler: function() {
            var isActive = false;
            try {
                isActive = window.navigator.userActivation.isActive;
            } catch (e) {}
            if (!isActive) {
                try {
                    isActive = top.navigator.userActivation.isActive;
                } catch (e) {}
            }
            if (!isActive) {
                try {
                    isActive = this.iframewin.navigator.userActivation.isActive;
                } catch (e) {}
            }
            if (document.activeElement.tagName === "IFRAME") {
                isActive = false;
            }
            if (isActive) {
                this._onExecute({
                    type: "uah"
                });
            }
        },
        _onMouseDownHandler: function(event) {
            // Removed popunder-specific logic related to target blank
        },
        _onMouseUpHandler: function(event) {
            // Removed popunder-specific logic related to target blank
        },
        _onBeforeUnloadHandler: function() {
            // No popunder to close
        },
        // Removed all catch-all div related functions as they were for popunders.
        init: function(config) {
            // Create a hidden iframe for window.open operations (still needed for some browser environments)
            var iframe = document.createElement("iframe");
            iframe.src = "javascript:false";
            iframe.style.display = "none";
            iframe.width = "0";
            iframe.height = "0";
            var script = document.getElementsByTagName("script")[0];
            script.parentNode.insertBefore(iframe, script);
            this.iframewin = iframe.contentWindow || iframe;
            this.originalwindowopen = this.iframewin.open;
            this.userActivation = true;
            try {
                this.iframewin.navigator.userActivation.isActive;
            } catch (e) {
                this.userActivation = false;
            }
            this.cap = this._getBrowserCapabilities();
            this.urls = [];
            this.settings = {}; // Initialize settings from config object
            this.settings.onbeforeopen = config.onbeforeopen;
            this.settings.onafteropen = config.onafteropen;
            this.settings.ignorefailure = config.ignorefailure || false;
            this.settings.openernull = true; // Set new window.opener to null

            // Set up User Activation Handler timer
            this.uahtimer = this.userActivation ? setInterval(this._userActivationHandler.bind(this), 50) : 0;

            // Add event listeners to the main window
            if (window.addEventListener) {
                window.addEventListener("touchend", this._onExecute.bind(this), true);
                window.addEventListener("click", this._onExecute.bind(this), true);
            } else { // Fallback for older IE
                window.attachEvent("onclick", this._onExecute.bind(this));
            }

            // Add event listeners to the hidden iframe's window
            if (this.iframewin.addEventListener) {
                this.iframewin.addEventListener("touchend", this._onExecute.bind(this), true);
                this.iframewin.addEventListener("click", this._onExecute.bind(this), true);
            } else { // Fallback for older IE
                this.iframewin.attachEvent("onclick", this._onExecute.bind(this));
            }
        },
        clearUrls: function() {
            this.urls = [];
        },
        addUrl: function(url, options) {
            if (!url.match(/^https?:\/\//) || !this.cap) return false;
            // No BBR type support since it's a popunder/popup mechanism.

            if (this.userActivation && this.uahtimer === 0) {
                this.uahtimer = setInterval(this._userActivationHandler.bind(this), 50);
            }
            this.urls.push({
                url: url,
                options: options
            });
        }
    };
    "use strict";
    var BASE_PATH = "/c";
    var POP_GLOBAL_VAR = "_pop";
    var PAO_GLOBAL_VAR = "_pao";
    var currentScriptElement = document.currentScript;
    var adscoreTimeout = null;

    // Cookie storage utility - simplified
    var cookieStorage = {
        _set: function(name, value, expiration, path, domain) {
            return;
        },
        _get: function(name) {
            return null;
        },
        _remove: function(name) {
            return;
        }
    };

    // LocalStorage utility with fallback to cookies - simplified
    var storage = {
        _available: null,
        _isAvailable: function() {
            return false;
        },
        _set: function(name, value) {
            return;
        },
        _get: function(name) {
            return null;
        },
        _remove: function(name) {
            return;
        }
    };

    // Main Ad Manager object
    var adManager = {
        _inventory: {},
        _config: {
            _siteId: 0,
            _minBid: 0,
            _blockedCountries: false,
            _default: false,
            _trafficType: 0,
            _adscorebp: null,
            _adscorept: null,
            _adscoreak: "QpUJAAAAAAAAGu98Hdz1l_lcSZ2rY60Ajjk9U1c", // Adscore API key
            _showInIframe: true, // Nuevo: Habilitar la visualización en iframe
            _iframeTopPosition: 20 // Nuevo: Posición top del iframe en porcentaje
        },
        _init: function() {
            var self = this;
            this._loadConfig();
            this.adfired = false;
            utils.init({
                onafteropen: function() {
                    self.adfired = true;
                }
            });
            this._adscoreDeploy();
            if (document.hidden) {
                document.addEventListener("visibilitychange", function() {
                    if (!self.adfired && !document.hidden) {
                        self._adscoreDeploy();
                    }
                });
            }
            // Simplified interval check for adscoreDeploy
            setInterval(function() {
                if (!self.adfired) {
                    self._adscoreDeploy();
                }
            }, 1000);
        },
        _adscoreDeploy: function() {
            var self = this;
            var adscoreScriptTimeout = 0;
            var config = this._config;
            if (self._config._adscorebp) {
                self._checkInventory(self._config._adscorebp);
            } else if (typeof AdscoreInit === "function") {
                try {
                    AdscoreInit(self._config._adscoreak, {
                        sub_id: config._siteId,
                        callback: function(result) {
                            self._checkInventory(result.signature || "2" + result.error);
                        }
                    });
                } catch (e) {
                    self._checkInventory("4" + e.message);
                }
            } else if (document.body) {
                var domainParts = ["re", "adsco"];
                domainParts.push(domainParts[1][3]); // Adds 's' to make "adscore"
                var adscoreUrl = "https://" + domainParts.reverse().join(".") + "/";
                var script = document.createElement("script");
                script.src = adscoreUrl;
                try {
                    script.onerror = function() {
                        if (script.src === adscoreUrl) {
                            script.src = "https://" + Math.round(Math.pow(52292.244664, 2)) + "/a.js";
                        } else {
                            clearTimeout(adscoreScriptTimeout);
                            self._checkInventory("1");
                        }
                    };
                } catch (e) {}
                script.onload = function() {
                    clearTimeout(adscoreScriptTimeout);
                    try {
                        AdscoreInit(self._config._adscoreak, {
                            sub_id: config._siteId,
                            callback: function(result) {
                                self._checkInventory(result.signature || "2" + result.error);
                            }
                        });
                    } catch (e) {
                        self._checkInventory("4" + e.message);
                    }
                };
                document.body.appendChild(script);
                adscoreScriptTimeout = setTimeout(function() {
                    self._checkInventory("3");
                }, 5000);
            } else {
                setTimeout(function() {
                    self._adscoreDeploy();
                }, 50);
            }
        },
        _checkInventory: function(adscoreSignature) {
            this._lastci = (new Date).getTime();
            utils.clearUrls();
            var self = this;
            var intervalId = 0;
            var config = this._config;
            if (config._adscorept) {
                config._adscorept(adscoreSignature);
            }
            // Removed adscoreTimeout for scheduling inventory checks, as iframe loads directly.

            intervalId = setInterval(function() {
                var inventoryUrl = "//serve.popads.net" + BASE_PATH;
                if (document.body) {
                    clearInterval(intervalId);
                    var params = {
                        _: encodeURIComponent(adscoreSignature),
                        v: 4,
                        siteId: config._siteId,
                        minBid: config._minBid,
                        blockedCountries: config._blockedCountries || "",
                        documentRef: encodeURIComponent(document.referrer),
                        s: self._getScreenData()
                    };
                    for (var key in params) {
                        if (params.hasOwnProperty(key)) {
                            inventoryUrl += (inventoryUrl.indexOf("?") !== -1 ? "&" : "?") + key + "=" + (params[key] || "");
                        }
                    }
                    var script = document.createElement("script");
                    script.referrerPolicy = "unsafe-url";
                    script.src = inventoryUrl;
                    try {
                        script.onerror = function() {
                            utils.abortPop();
                            currentScriptElement.onerror();
                        };
                    } catch (e) {}
                    document.body.appendChild(script);
                }
            }, 100);
        },
        // Removed _parseFloatingBanner as it's no longer needed.
        _parseInventory: function(inventoryData) {
            this._inventory = inventoryData || {};
            this._preparePop(); // Renamed from _prepareAd to reflect pop being the primary entry, but it will only result in iframe
        },
        // Removed _parseBBR as it's no longer needed.
        _preparePopDefault: function() {
            var self = this;
            if (this._config._default === false || this._config._default === "") {
                utils.abortPop();
            } else {
                if (/^https?:\/\//.test(this._config._default)) {
                    setTimeout(function() {
                        utils.addUrl(this._config._default, {
                            type: "iframe", // Always "iframe" now
                            onbeforeopen: function(url) {
                                return url;
                            }.bind(self)
                        });
                    }.bind(self), 0); // No delay
                } else {
                    // This block for executing base64 decoded script remains if it's still desired for default fallback.
                    var decodedScript = atob(this._config._default); // Using atob instead of custom Base64 as it's built-in
                    decodedScript = ("<script>" + decodedScript + "</script>").replace(/^\s*<script[^>]*>|<\/script>\s*$/g, "");
                    var scriptElement = document.createElement("script");
                    scriptElement.type = "text/javascript";
                    scriptElement.text = decodedScript;
                    document.body.appendChild(scriptElement);
                }
            }
        },
        _preparePopInventory: function() {
            var self = this;
            setTimeout(function() {
                utils.addUrl(self._inventory.url, {
                    type: "iframe", // Always "iframe" now
                    onbeforeopen: function(url) {
                        return url + "&s=" + self._getScreenData() + "&v=&m=";
                    }.bind(self)
                });
            }, 0); // No delay
        },
        _getScreenData: function() {
            // Simplified, as detectZoom library is removed.
            try {
                return [screen.width, screen.height, 1, screen.width, screen.height, window.self != window.top ? "1" : "0"].join();
            } catch (e) {
                return "";
            }
        },
        // Removed all _getFiredCount, _updateFiredCount, _getLastOpenAt, _isDelayBetweenExpired, _mSecondsTillDelayExpired
        // as they are no longer needed for managing ad frequency.
        _preparePop: function() {
            if (this._inventory.url !== "") {
                this._preparePopInventory();
            } else {
                this._preparePopDefault();
            }
        },
        _waitForGoodWeather: function() {
            // Check if not in top window, or if window dimensions are zero (likely hidden/minimized)
            if (top != window && window.outerWidth === 0 && window.outerHeight === 0 && window.innerWidth === 0 && window.innerWidth === 0 || document.hidden) {
                setTimeout(this._waitForGoodWeather.bind(this), 50);
            } else {
                setTimeout(this._init.bind(this), 0); // Start immediately
            }
        },
        _loadConfig: function() {
            var globalConfig = window[POP_GLOBAL_VAR] || [];
            var config = this._config;
            for (var i = 0; i < globalConfig.length; i++) {
                var key = globalConfig[i][0];
                var value = globalConfig[i][1];
                switch (key) {
                    case "siteId":
                        value = parseInt(value, 10);
                        if (isNaN(value)) continue;
                        config._siteId = value;
                        break;
                    case "minBid":
                        config._minBid = value;
                        break;
                    case "blockedCountries":
                        config._blockedCountries = value;
                        break;
                    case "default":
                        config._default = value;
                        break;
                    case "trafficType":
                        value = parseInt(value, 10);
                        if (isNaN(value)) continue;
                        config._trafficType = value;
                        break;
                    case "adscorebp":
                        config._adscorebp = value;
                        break;
                    case "adscorept":
                        config._adscorept = value;
                        break;
                    case "adscoreak":
                        config._adscoreak = value;
                        break;
                    case "showInIframe": // New: Load config for showing in iframe
                        config._showInIframe = value;
                        break;
                    case "iframeTopPosition": // New: Load config for iframe top position
                        config._iframeTopPosition = parseInt(value, 10);
                        if (isNaN(config._iframeTopPosition)) config._iframeTopPosition = 90; // Default value if not a valid number
                        break;
                }
            }
        }
    };
    // Dynamic path generation if the base URL doesn't contain ".net"
    if (!"//serve.popads.net".includes(".net")) {
        PAO_GLOBAL_VAR = "";
        var randomLength = 10 + Math.floor(10 * Math.random());
        for (var i = 0; i < randomLength; i++) {
            PAO_GLOBAL_VAR += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(26 * Math.random()));
        }
        BASE_PATH = "/" + PAO_GLOBAL_VAR;
    }
    // Public API for the ad manager
    var publicApi = {
        parse: function(inventoryData) {
            adManager._parseInventory(inventoryData);
        },
        // Removed fbparse and bbrparse as they are no longer supported.
    };
    // Expose the public API globally, attempting to freeze it
    try {
        window._pao = publicApi;
        Object.freeze(window._pao);
    } catch (e) {}
    try {
        window[PAO_GLOBAL_VAR] = publicApi;
        Object.freeze(window[PAO_GLOBAL_VAR]);
    } catch (e) {}
    // Initialize the ad manager if not within a suspicious URL context
    if (!navigator.userAgent.includes("://")) {
        adManager._waitForGoodWeather();
    }
})(window, window.document, window.screen);
