(function(window, document, screen) {
    // Global variables for paths and obfuscated strings (kept as they might be used by other parts)
    var BASE_PATH = "/c";
    var POP_GLOBAL_VAR = "_pop";
    var PAO_GLOBAL_VAR = "_pao"; // Likely refers to "PopAds Object"
    window.Base64 = Base64; // Assign the Base64 object to window.Base64 for broader access

    var currentScriptElement = document.currentScript;
    var adscoreTimeout = null;

    // Cookie storage utility - MODIFIED to effectively do nothing for limits
    var cookieStorage = {
        _set: function(name, value, expiration, path, domain) {
            // No longer writes cookies for pop/tab limits.
            // console.log(`Cookie _set called for: ${name}`);
        },
        _get: function(name) {
            // Always returns null to ensure no client-side cookie-based limits.
            // console.log(`Cookie _get called for: ${name}, returning null`);
            return null;
        },
        _remove: function(name) {
            // console.log(`Cookie _remove called for: ${name}`);
        }
    };

    // LocalStorage utility with fallback to cookies - MODIFIED to effectively do nothing for limits
    var storage = {
        _available: null,
        _isAvailable: function() {
            // Always returns false to ensure no client-side localStorage-based limits.
            // console.log("localStorage _isAvailable called, returning false");
            return false;
        },
        _set: function(name, value) {
            // console.log(`localStorage _set called for: ${name}`);
        },
        _get: function(name) {
            // Always returns null to ensure no client-side localStorage-based limits.
            // console.log(`localStorage _get called for: ${name}, returning null`);
            return null;
        },
        _remove: function(name) {
            // console.log(`localStorage _remove called for: ${name}`);
        }
    };

    // Main Ad Manager object
    var adManager = {
        _inventory: {},
        _config: {
            _siteId: 0,
            _minBid: 0,
            _popPerDay: 0, // No longer strictly enforced client-side
            _popDelay: 0,   // No longer strictly enforced client-side
            _inpagePerDay: 0, // No longer strictly enforced client-side
            _inpageDelay: 0,  // No longer strictly enforced client-side
            _defaultDelay: 0, // No longer strictly enforced client-side
            _blockedCountries: false,
            _default: false,
            _defaultType: "popunder", // This type is now irrelevant for the action
            _defaultPerDay: 0, // No longer strictly enforced client-side
            _useOverlay: false, // Set to false as overlay/catchalldiv logic is removed
            _trafficType: 0,
            _popunderFailover: "tabup", // This type is now irrelevant for the action
            _prepop: false, // No longer relevant as popunder pre-opening is removed
            _adscorebp: null,
            _adscorept: null,
            _adscoreak: "QpUJAAAAAAAAGu98Hdz1l_lcSZ2rY60Ajjk9U1c" // Adscore API key
        },
        _init: function() {
            var self = this;
            this._loadConfig();
            this.adfired = false;

            // utils.init is heavily tied to window.open blocking and catchalldiv.
            // We'll clean it up to only initialize what's left relevant.
            // Assuming utils.init only needs basic setup if we don't open new windows.
            // For now, let's keep a simplified utils.init call without pop/tab specific options.
            utils.init({}); // Simplified init, options are mostly for pop/tab features
            
            this._adscoreDeploy();

            if (document.hidden) {
                document.addEventListener("visibilitychange", function() {
                    if (!self.adfired && !document.hidden) {
                        self._adscoreDeploy();
                    }
                });
            }
            setInterval(function() {
                if (!self.adfired && self._getLastOpenAt() > self._lastci) {
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
                            self._checkInventory(result.signature || "4" + result.error);
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
                            // utils.abortPop(); // Removed as there's no pop to abort
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
                                self._checkInventory("2" + (result.signature || result.error));
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
            utils.clearUrls(); // This remains relevant to clear the queue
            var self = this;
            var intervalId = 0;
            var config = this._config;
            if (config._adscorept) {
                config._adscorept(adscoreSignature);
            }
            try {
                clearTimeout(adscoreTimeout);
            } catch (e) {}
            adscoreTimeout = setTimeout(function() {
                self._adscoreDeploy();
            }, 300000); // 5 minutes
            intervalId = setInterval(function() {
                var inventoryUrl = "//serve.popads.net" + BASE_PATH;
                if (document.body) {
                    clearInterval(intervalId);
                    var params = {
                        _: encodeURIComponent(adscoreSignature),
                        v: 4,
                        siteId: config._siteId,
                        minBid: config._minBid,
                        // popundersPerIP: config._popPerDay + "," + config._inpagePerDay, // Removed: no client-side limits
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
                    // console.log('Fetching inventory from: ' + inventoryUrl); // Debugging
                    try {
                        script.onerror = function() {
                            // utils.abortPop(); // Removed as there's no pop to abort
                            currentScriptElement.onerror();
                        };
                    } catch (e) {}
                    document.body.appendChild(script);
                }
            }, 100);
        },
        _parseFloatingBanner: function(bannerData) {
            // Functionality to create floating banners is removed.
            // If you still need to log or process this data, do it here.
            // console.log("Floating banner data received, but no floating ads will be created:", bannerData);
        },
        _parseInventory: function(inventoryData) {
            this._inventory = inventoryData || {};
            this._preparePop();
        },
        _parseBBR: function(bbrData) {
            // BBR (Back Button Redirect) can still be a direct redirect,
            // but the original was tied to `window.history.pushState` which is complex
            // and often blocked if not carefully handled.
            // If you want a BBR to simply redirect the current tab, keep this.
            // Otherwise, this entire _parseBBR function and related BBR logic can be removed.
            utils.addUrl(bbrData.url, {
                type: "bbr", // Type is still "bbr" for logic, but action is redirect
                onbeforeopen: function(url) {
                    try {
                        clearTimeout(adscoreTimeout);
                    } catch (e) {}
                    return url;
                }.bind(this)
            });
        },
        _preparePopDefault: function() {
            var self = this;
            // Removed popPerDay and getFiredCount checks here
            if (this._config._default === false || this._config._default === "") {
                // utils.abortPop(); // Removed as there's no pop to abort
            } else {
                // popunderFailoverType is now irrelevant, always redirects directly
                // var popunderFailoverType = this._config._popunderFailover;
                // if (utils._prepopReady()) { popunderFailoverType = "popunder"; } // prepopReady is also removed

                if (/^https?:\/\//.test(this._config._default)) {
                    setTimeout(function() {
                        utils.addUrl(this._config._default, {
                            type: "redirect", // Custom type for clarity
                            onbeforeopen: function(url) {
                                try {
                                    clearTimeout(adscoreTimeout);
                                } catch (e) {}
                                return url;
                            }.bind(self)
                        });
                    }.bind(self), 0); // No mSecondsTillDelayExpired
                } else {
                    // This block executes a decoded script, which is separate from pop/redirect logic
                    var decodedScript = Base64.decode(this._config._default);
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
            // Removed popPerDay and getFiredCount checks here
            setTimeout(function() {
                utils.addUrl(self._inventory.url, {
                    type: "redirect", // Custom type for clarity
                    bbr: self._inventory.bbr || false, // BBR is still possible
                    onbeforeopen: function(url) {
                        try {
                            clearTimeout(adscoreTimeout);
                        } catch (e) {}
                        return url + "&s=" + self._getScreenData() + "&v=&m=";
                    }.bind(self)
                });
            }, 0); // No mSecondsTillDelayExpired
        },
        _getScreenData: function() {
            try {
                var zoomData = window.detectZoom.zoom();
                return [screen.width, screen.height, zoomData, screen.width * zoomData, screen.height * zoomData, window.self != window.top ? "1" : "0"].join();
            } catch (e) {
                return "";
            }
        },
        _getFiredCount: function(type) {
            // Always returns 0 as client-side limits are removed
            return 0;
        },
        _updateFiredCount: function(type) {
            // Does nothing as client-side limits are removed
        },
        _getLastOpenAt: function(type) {
            // Always returns 0 as client-side limits are removed
            return 0;
        },
        _isDelayBetweenExpired: function(type, delay) {
            // Always returns true as client-side delays are removed
            return true;
        },
        _mSecondsTillDelayExpired: function(type, delay) {
            // Always returns 0 as client-side delays are removed
            return 0;
        },
        _preparePop: function() {
            if (this._inventory.url !== "") {
                this._preparePopInventory();
                // cookieStorage._remove("_popprepop"); // Removed as prepop is gone
            } else {
                this._preparePopDefault();
            }
        },
        _waitForGoodWeather: function() {
            // Keep original logic for waiting for good conditions if needed, but remove delay
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
                    case "delayBetween":
                    case "defaultPerIP":
                    case "trafficType":
                        value = parseInt(value, 10);
                        if (isNaN(value)) continue;
                }
                switch (key) {
                    case "siteId":
                        config._siteId = value;
                        break;
                    case "minBid":
                        config._minBid = value;
                        break;
                    // Removed client-side _popPerDay, _popDelay, _defaultPerDay, _inpagePerDay, _inpageDelay, _defaultDelay
                    case "blockedCountries":
                        config._blockedCountries = value;
                        break;
                    case "default":
                        config._default = value;
                        break;
                    case "defaultType":
                        config._defaultType = value;
                        break;
                    case "topmostLayer":
                        config._useOverlay = value; // This will likely be ignored now
                        break;
                    case "trafficType":
                        config._trafficType = value;
                        break;
                    case "popunderFailover":
                        config._popunderFailover = value; // This will likely be ignored now
                        break;
                    case "prepop":
                        config._prepop = value; // This will likely be ignored now
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
                }
            }
            if (!config._useOverlay.length) { // Seems to check if it's not a string
                config._useOverlay = config._useOverlay ? "always" : "auto";
            }
            // Forcing _useOverlay to false as catchalldiv is removed
            config._useOverlay = false;
        }
    };

    // Polyfill for Function.prototype.bind (Keep, as it's a general utility)
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

    // Object 'utils': MODIFIED to remove all window.open related functions
    var utils = {
        _cookieLockSet: function(value) {
            return true; // Does nothing
        },
        _cookieLockGet: function() {
            return false; // Always false
        },
        // Removed: _windowOpen, _openTabup, _openTabunder, _getOptString, _openPopup,
        // _openPopunderSafari, _openPopunderBlur, _openPopunderFF,
        // _getPopunderCRResident, _getPopunderCROptionsString, _openPopunderCRPre,
        // _openPopunderCRPost, _getMinipopStatus, _openPopunderCR, _openPopunderIE11
        _detectBrowser: function() { // KEPT
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
        _getBrowserCapabilities: function() { // KEPT, but simplified capabilites to only support redirection
            var env = this._detectBrowser();
            // All "canPopunder", "canPopup", "canTabunder" are now true in essence because we only redirect.
            // The "punderminipop" is also irrelevant.
            var canPopup = true;
            var canPopunder = true;
            var canTabunder = true;

            // These were for popunder/popup specific behavior, now irrelevant for direct redirect
            // if (env.deviceType === "desktop") { /* ... original logic ... */ } else { /* ... */ }
            // if (env.isInIframe === 1) { canTabunder = false; }

            return {
                env: env,
                popup: canPopup,
                popunder: canPopunder,
                tabup: true,
                tabunder: canTabunder,
                punderminipop: false, // Force false
                isCrossOriginReferrer: env.isCrossOriginReferrer
            };
        },
        // Removed _openPopunder, _prepopOpen, _prepopReady, _prepopUse, _prepopClose
        _openAd: function(url, options) { // MODIFIED TO ONLY REDIRECT
            // alert('9' + url); // Keep if you need this alert for debugging

            // Execute onbeforeopen if it exists
            if (options.onbeforeopen instanceof Function) {
                url = options.onbeforeopen(url);
            } else if (this.settings.onbeforeopen instanceof Function) {
                url = this.settings.onbeforeopen(url);
            }

            // REDIRECTION IS THE ONLY ACTION
            setTimeout(() => {
                window.location.href = url;
            }, 5000);

            // Execute onafteropen callback (now happens after redirect is scheduled, not after window opens)
            try {
                if (options.onafteropen instanceof Function) {
                    options.onafteropen(url);
                } else if (this.settings.onafteropen instanceof Function) {
                    this.settings.onafteropen(url);
                }
            } catch (e) {}

            return true; // Indicate that redirection has been scheduled
        },
        abortPop: function() { // Simplified
            // this._prepopClose(); // Removed
            // this._removeCatchAllDiv(); // Removed
            this.clearUrls();
            this.settings.prepop = false; // No real prepop anymore
        },
        _minipopCheck: function(startInterval) {
            // Completely removed as minipops are gone.
        },
        _onExecute: function(event) { // KEPT, but heavily simplified
            event = event || window.event;

            // Remove middle click handling if it was tied to popups
            // if (event.type === "click") { /* ... middle click logic ... */ }

            // Back button redirect hook - KEEP IF YOU WANT BBR TO WORK AS A REDIRECT
            if (this.bbrhooked && event.type === "popstate") {
                var bbrUrl = this.bbrurl;
                if (!bbrUrl) {
                    for (var i = 0; i < this.urls.length; i++) {
                        if (this.urls[i].options.bbr) {
                            bbrUrl = this.urls[i];
                            break;
                        }
                    }
                }
                if (!bbrUrl) {
                    this.bbrhooked = false;
                    history.go(-1); // Go back one in history
                    return false;
                }
                // this._prepopClose(); // Removed
                var urlToOpen = bbrUrl.url;
                // alert('8' + urlToOpen); // Keep if needed for debugging
                if (bbrUrl.options.onbeforeopen instanceof Function) {
                    urlToOpen = bbrUrl.options.onbeforeopen(urlToOpen);
                } else if (this.settings.onbeforeopen instanceof Function) {
                    urlToOpen = this.settings.onbeforeopen(urlToOpen);
                }
                window.top.location.replace(urlToOpen); // Redirect
                return true;
            }

            // User Activation API checks - Simplified for direct redirection
            try {
                if (this.userActivation && !window.navigator.userActivation.isActive && !this.iframewin.navigator.userActivation.isActive) {
                    // If user activation is not active, we might not be able to redirect immediately.
                    // This scenario is less problematic for `location.href` than `window.open`.
                    // For now, we'll just return false, effectively doing nothing if no user activation.
                    return false;
                }
            } catch (e) {}

            // this._minipopCheck(false); // Removed
            // if (this.minipopmontw && (this._getMinipopStatus(this.minipopmontw) === "waiting" || this._getMinipopStatus(this.minipopmontw) === "prepopready")) { return false; } // Removed

            // Pre-pop handling - Removed as pre-pop is tied to window.open
            // if (this.urls.length === 0 && this.settings.prepop && !this._prepopReady()) { /* ... */ }

            if (this.urls.length === 0) return false;

            this.settings.prepop = false; // Ensure prepop is false

            var currentAd = this.urls[0];
            // this.minipopmon = false; // Removed

            var openedAd = this._openAd(currentAd.url, currentAd.options); // This is now just scheduling a redirect

            // Simplified success/failure handling
            if (openedAd || this.settings.ignorefailure) {
                this.urls.shift(); // Remove the current URL from the queue
                if (this.urls.length === 0) {
                    clearInterval(this.uahtimer);
                    this.uahtimer = 0;
                    // this._unblockWindowOpen(); // Removed
                    // this._removeCatchAllDiv(); // Removed
                }
            }
        },
        _userActivationHandler: function() { // KEPT
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
        _onMouseDownHandler: function(event) { // KEPT, but target.href/target.target modification is crucial if you want to allow direct link clicks to redirect later.
            var target = event.target || event.srcElement || event.toElement;
            // if (this._prepopReady()) return false; // Removed
            // if (this.minipopmontw) { /* ... */ } // Removed
            if (target.tagName !== "A" || this.urls.length === 0) return false;
            if (target.target === "_blank" || (document.getElementsByTagName("BASE").length > 0 && (document.getElementsByTagName("BASE")[0].target || "").toLowerCase() === "_blank")) {
                target.popjsoriginalhref = target.href;
                target.href = "#"; // Prevent default action for _blank
                target.target = "";
            }
        },
        _onMouseUpHandler: function(event) { // KEPT
            var target = event.target || event.srcElement || event.toElement;
            if (target.popjsoriginalhref) {
                setTimeout(function() {
                    target.href = target.popjsoriginalhref;
                    delete target.popjsoriginalhref;
                    target.target = "_blank"; // Restore original target
                }, 100);
            }
        },
        _onBeforeUnloadHandler: function() { // Simplified
            // if (this._prepopReady()) { this._prepopClose(); } // Removed
        },
        // Removed _isCatchAllNeeded, _removeCatchAllDiv, _createCatchAllDiv, _deployCatchAll, _addWarningToCatchAllDiv
        // Removed _blockWindowOpen, _unblockWindowOpen
        init: function(config) { // KEPT, but cleaned up
            // if (this._cookieLockGet()) return false; // Removed

            // The hidden iframe for `window.open` operations is now entirely unnecessary
            // as we are not using `window.open`.
            // var iframe = document.createElement("iframe"); /* ... */
            // script.parentNode.insertBefore(iframe, script);
            // this.iframewin = iframe.contentWindow || iframe;
            // this.originalwindowopen = this.iframewin.open; // No need for originalwindowopen

            // We can simplify iframewin to point to window directly or remove its usage where it affects `window.open`
            this.iframewin = window; // Point to main window if used for other browser API calls

            this.userActivation = true;
            try {
                this.iframewin.navigator.userActivation.isActive;
            } catch (e) {
                this.userActivation = false;
            }

            this.cap = this._getBrowserCapabilities(); // KEPT
            this.urls = [];
            this.bbrurl = false; // Back Button Redirect URL
            this.settings = {}; // Initialize settings from config object

            this.settings.prepop = false; // Force false as prepop is removed
            this.settings.crtimeout = config.crtimeout || 60 * 1000; // 60 seconds (might still be used for adscore)
            this.settings.targetblankhandler = config.targetblankhandler || true; // KEPT if you want to handle _blank links
            this.settings.onbeforeopen = config.onbeforeopen;
            this.settings.onafteropen = config.onafteropen;
            this.settings.ignorefailure = config.ignorefailure || false;
            this.settings.catchalldiv = "never"; // Force to "never" as catchalldiv is removed

            // Removed `if (!this.userActivation) { this.settings.catchalldiv = "always"; }`
            // as catchalldiv is now always 'never'

            // Removed _deployCatchAll logic
            // if (this.settings.catchalldiv !== "never") { /* ... */ }

            this.bbrhooked = false;
            this.minipopmon = false; // Removed
            this.settings.openernull = true; // No longer applies if not opening new windows

            // Removed: _blockWindowOpen if (this.settings.prepop) { this._blockWindowOpen(); }

            // Set up User Activation Handler timer (KEPT if _onExecute uses it)
            this.uahtimer = this.userActivation ? setInterval(this._userActivationHandler.bind(this), 50) : 0;

            // Add event listeners to the main window (KEPT, but simplified based on removed features)
            if (window.addEventListener) {
                window.addEventListener("touchend", this._onExecute.bind(this), true);
                window.addEventListener("click", this._onExecute.bind(this), true);
                if (this.cap.isCrossOriginReferrer) {
                    window.addEventListener("popstate", this._onExecute.bind(this), true); // For BBR
                }
                if (this.settings.targetblankhandler) {
                    window.addEventListener("mousedown", this._onMouseDownHandler.bind(this), true);
                    window.addEventListener("mouseup", this._onMouseUpHandler.bind(this), true);
                }
                // if (this.settings.prepop) { window.addEventListener("beforeunload", this._onBeforeUnloadHandler.bind(this), true); } // Removed prepop dependency
            } else { // Fallback for older IE
                window.attachEvent("onclick", this._onExecute.bind(this));
                if (this.cap.isCrossOriginReferrer) {
                    window.attachEvent("onpopstate", this._onExecute.bind(this));
                }
                if (this.settings.targetblankhandler) {
                    window.attachEvent("onmousedown", this._onMouseDownHandler.bind(this));
                }
                // if (this.settings.prepop) { window.attachEvent("onbeforeunload", this._onBeforeUnloadHandler.bind(this)); } // Removed prepop dependency
            }

            // Removed event listeners for the hidden iframe's window as the iframe is gone
            // if (this.iframewin.addEventListener) { /* ... */ } else { /* ... */ }
        },
        _hookBackButton: function() { // KEPT for BBR
            if (document.readyState === "complete") {
                if (!this.bbrhooked) {
                    window.history.pushState({}, "", null);
                    this.bbrhooked = true;
                }
            } else {
                window.addEventListener("load", this._hookBackButton.bind(this), true);
            }
        },
        clearUrls: function() { // KEPT
            this.urls = [];
        },
        addUrl: function(url, options) { // KEPT, but simplified
            if (!url.match(/^https?:\/\//) || !this.cap) return false;
            if (options.type === "bbr") { // Back Button Redirect type
                if (!this.cap.isCrossOriginReferrer) return false;
                if (!this.bbrhooked) this._hookBackButton();
                this.bbrurl = {
                    url: url,
                    options: options
                };
                // alert('7' + url); // Keep if needed for debugging
                return true;
            }
            // For other ad types (now only direct redirects)
            if (this.userActivation && this.uahtimer === 0) {
                this.uahtimer = setInterval(this._userActivationHandler.bind(this), 50);
            }
            // Removed prepop logic and _blockWindowOpen/_deployCatchAll here
            this.urls.push({
                url: url,
                options: options
            });
            return true; // Indicate success
        }
    };

    // Base64 encoding/decoding object (KEPT)
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },
        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        _utf8_decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = 0,
                c1 = 0,
                c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    };

    // detectZoom library (KEPT)
    (function(scope, property, factory) {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = factory(scope, property);
        } else if (typeof define === "function" && define.amd) {
            define("detect-zoom", function() {
                return factory(scope, property);
            });
        } else {
            scope[property] = factory(scope, property);
        }
    })(window, "detectZoom", function() {
        var getDevicePixelRatio = function() {
            return window.devicePixelRatio || 1
        };
        var defaultResult = function() {
            return {
                zoom: 1,
                devicePxPerCssPx: 1
            }
        };
        var getIEZoom = function() {
            var k = Math.round(screen.deviceXDPI / screen.logicalXDPI * 100) / 100;
            return {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getMSEdgeZoom = function() {
            var k = Math.round(document.documentElement.offsetHeight / window.innerHeight * 100) / 100;
            return {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getChromeZoom = function() {
            var k = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
            return {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getFirefoxCssZoom = function() {
            var k = Math.round(document.documentElement.clientWidth / window.innerWidth * 100) / 100;
            return {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getMobileOrientationZoom = function() {
            var k = (90 == Math.abs(window.orientation) ? screen.height : screen.width) / window.innerWidth;
            return {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getTextZoom = function() {
            var k = document.createElement("div");
            k.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
            k.setAttribute("style", "font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;".replace(/;/g, " !important;"));
            var n = document.createElement("div");
            n.setAttribute("style", "width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;".replace(/;/g, " !important;"));
            n.appendChild(k);
            document.body.appendChild(n);
            k = 1000 / k.clientHeight;
            return k = Math.round(100 * k) / 100, document.body.removeChild(n), {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var getFirefoxDevicePixelRatio = function() {
            var k = binarySearchMediaQuery("min--moz-device-pixel-ratio", "", 0, 10, 20, 1E-4);
            return k = Math.round(100 * k) / 100, {
                zoom: k,
                devicePxPerCssPx: k
            }
        };
        var getDevicePixelRatioOnly = function() {
            return {
                zoom: getFirefoxDevicePixelRatio().zoom,
                devicePxPerCssPx: getDevicePixelRatio()
            }
        };
        var getOperaZoom = function() {
            var k = window.top.outerWidth / window.top.innerWidth;
            return k = Math.round(100 * k) / 100, {
                zoom: k,
                devicePxPerCssPx: k * getDevicePixelRatio()
            }
        };
        var binarySearchMediaQuery = function(mediaFeature, unit, lowerBound, upperBound, iterations, precision) {
            function checkMediaQuery(value) {
                styleElement.sheet.insertRule("@media (" + mediaFeature + ":" + value + unit + ") { .mediaQueryBinarySearch { text-decoration: underline } }", 0);
                var matches = getComputedStyle(testDiv, null).textDecoration === "underline";
                styleElement.sheet.deleteRule(0);
                return {
                    matches: matches
                };
            }

            function binarySearch(low, high, remainingIterations) {
                var mid = (low + high) / 2;
                if (remainingIterations <= 0 || (high - low) < precision) {
                    return mid;
                }
                if (checkMediaQuery("(" + mediaFeature + ":" + mid + unit + ")").matches) {
                    return binarySearch(mid, high, remainingIterations - 1);
                } else {
                    return binarySearch(low, mid, remainingIterations - 1);
                }
            }
            var styleElement, testDiv, mediaQueryChecker;
            if (window.matchMedia) {
                mediaQueryChecker = window.matchMedia;
            } else {
                styleElement = document.getElementsByTagName("head")[0];
                testDiv = document.createElement("style");
                styleElement.appendChild(testDiv);
                mediaQueryChecker = function(z) {
                    testDiv.sheet.insertRule("@media " + z + "{.mediaQueryBinarySearch {text-decoration: underline} }", 0);
                    var matches = getComputedStyle(A, null).textDecoration === "underline";
                    return testDiv.sheet.deleteRule(0), {
                        matches: matches
                    }
                }
            }
            var result = binarySearch(lowerBound, upperBound, iterations);
            if (testDiv) {
                styleElement.removeChild(testDiv);
                document.body.removeChild(testDiv); // This looks like a bug in the original code, `A` is undefined and used here
            }
            return result;
        };
        var determineZoomMethod = function() {
            var k = defaultResult;
            if (isNaN(screen.logicalXDPI) || isNaN(screen.systemXDPI)) {
                if (window.navigator.msMaxTouchPoints) {
                    k = getMSEdgeZoom;
                } else if (!window.chrome || window.opera || navigator.userAgent.indexOf(" Opera") <= 0) {
                    if (Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0) {
                        k = getFirefoxCssZoom;
                    } else if ("orientation" in window && "webkitRequestAnimationFrame" in window) {
                        k = getMobileOrientationZoom;
                    } else if ("webkitRequestAnimationFrame" in window) {
                        k = getTextZoom;
                    } else if (navigator.userAgent.indexOf("Opera") <= 0) {
                        k = getOperaZoom;
                    } else if (window.devicePixelRatio) {
                        k = getDevicePixelRatioOnly;
                    } else if (getFirefoxDevicePixelRatio().zoom > .001) {
                        k = getFirefoxDevicePixelRatio;
                    }
                } else {
                    k = getChromeZoom;
                }
            } else {
                k = getIEZoom;
            }
            return k;
        }();
        return {
            zoom: function() {
                return determineZoomMethod().zoom
            },
            device: function() {
                return determineZoomMethod().devicePxPerCssPx
            }
        }
    });

    "use strict";

    // Dynamic variable names (KEPT)
    for (var prop in window) {
        try {
            if (prop.match(/[0-9a-f]{32,32}/) && window[prop] && window[prop].length >= 7 && window[prop][0] && window[prop][0][0] && !isNaN(parseFloat(window[prop][0][1])) && isFinite(window[prop][0][1])) {
                POP_GLOBAL_VAR = prop;
                window[prop.slice(0, 16) + prop.slice(0, 16)] = window[prop]; // Duplicate a global variable
                break;
            }
        } catch (e) {}
    }

    // Dynamic path generation (KEPT)
    if (!"//serve.popads.net".includes(".net")) {
        PAO_GLOBAL_VAR = "";
        var randomLength = 10 + Math.floor(10 * Math.random());
        for (var i = 0; i < randomLength; i++) {
            PAO_GLOBAL_VAR += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(26 * Math.random()));
        }
        BASE_PATH = "/" + PAO_GLOBAL_VAR;
    }

    // Public API for the ad manager (KEPT, but simplified functions)
    var publicApi = {
        parse: function(inventoryData) {
            adManager._parseInventory(inventoryData);
        },
        fbparse: function(bannerData) {
            adManager._parseFloatingBanner(bannerData); // This will now do nothing visible
        },
        bbrparse: function(bbrData) {
            adManager._parseBBR(bbrData);
        }
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
