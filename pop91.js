(function(window, document, screen) {
    // Function T: Seems to handle the creation and display of a pop-up/floating advertisement.
    function createFloatingAd(adUrl, position, width, height, clickUrl) {
        // Ensure body and head elements exist
        if (document.body === null) {
            document.body = document.createElement("body");
        }
        if (document.head === null) {
            document.head = document.createElement("head");
        }
        // Create and append style element for the ad
        var styleElement = document.createElement("style");
        styleElement.innerHTML = `
            #a_timer_oYvwGmQc, #a_title_nEYjMupI, .a_close_nEYjMupI { top: 0; right: 0; height: 30px; line-height: 30px; text-align: center; }
            .top-left_vUTDnibMkZJIvuTH { position: fixed; top: 0; left: 0; }
            .bottom-left_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; left: 0; }
            .top-right_vUTDnibMkZJIvuTH { position: fixed; top: 0; right: 0; }
            .bottom-right_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; right: 0; }
            .top-center_vUTDnibMkZJIvuTH { position: fixed; top: 0; left: 50%; transform: translateX(-50%); }
            .bottom-center_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); }
            .c_window_xEucqIjg { z-index: 9999999; overflow: hidden; position: fixed; background-color: #FFF; margin: 20px; padding: 0; border: 1px solid #ccc; border-radius: 5px; -webkit-box-shadow: 0 0 5px 1px rgba(153,153,153,.5); -moz-box-shadow: 0 0 5px 1px rgba(153,153,153,.5); box-shadow: 0 0 5px 1px rgba(153,153,153,.5); }
            #alink_overlay_EPXdyaUf { position: absolute; z-index: 1; background: rgba(0,0,0,0); cursor: pointer; }
            #a_iframe_DwTGCjTm { z-index: -1; padding: 0 !important; }
            .a_close_nEYjMupI { position: absolute; color: rgba(0,0,0,.3); width: 30px; font-size: 30px; }
            #a_title_nEYjMupI { position: absolute; color: rgba(0,0,0,1); font-size: 18px; }
            .a_close_nEYjMupI a { text-decoration: none !important; }
            #a_timer_oYvwGmQc { position: absolute; color: rgba(0,0,0,.3); width: 30px; font-size: 30px; }
            .a_close_nEYjMupI:focus, .a_close_nEYjMupI:hover { color: #000; cursor: pointer; }
            .a_open_rrTmtfGj { display: block; }
            .a_hide_qkasklrO { display: none; }
        `;
        document.head.appendChild(styleElement);
        // Remove existing ad window if it exists
        if (document.getElementById("c_window_xEucqIjg")) {
            clearTimeout(timedis); // Assuming 'timedis' is a global or accessible variable
            document.getElementById("c_window_xEucqIjg").remove();
        }
        // Create the ad window div
        var adWindow = document.createElement("div");
        adWindow.id = "c_window_xEucqIjg";
        document.body.appendChild(adWindow);
        adWindow.classList.add("c_window_xEucqIjg");
        // Set inner HTML for the ad window (title, close button, timer, overlay)
        adWindow.innerHTML = `
            <div style="height:30px;">
                <span id="a_title_nEYjMupI">Advertisement</span>
                <span class="a_close_nEYjMupI a_hide_qkasklrO" data-alink="data-alink" id="a_close_nEYjMupI" data-dismiss_OLjQnDvi="c_xEucqIjg">
                    <a href="#" data-alink="data-alink" data-dismiss_OLjQnDvi="c_xEucqIjg" style="text-decoration: none!important; color: rgba(0,0,0,0.3);">&times;</a>
                </span>
                <span id="a_timer_oYvwGmQc">5</span>
            </div>
            <div id="alink_overlay_EPXdyaUf" alink="alink"></div>
        `;
        // Add position class to the ad window
        adWindow.classList.add(position + "_vUTDnibMkZJIvuTH");
        // Create iframe for the ad content
        var iframe = document.createElement("iframe");
        var adTitle = document.getElementById("a_title_nEYjMupI");
        var overlay = document.getElementById("alink_overlay_EPXdyaUf");
        adWindow.style.width = width;
        // Determine if width/height are in pixels or percentage and adjust
        var widthInPx = width.search(/px/i);
        var heightInPx = height.search(/px/i);
        var clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (widthInPx === -1) {
            overlay.style.width = "100%";
            iframe.style.width = "100%";
            adTitle.style.width = "100%";
        } else {
            overlay.style.width = width;
            iframe.style.width = width;
            adTitle.style.width = width;
        }
        if (heightInPx === -1) {
            iframe.style.height = "100%";
            overlay.style.height = "96%";
            adWindow.style.height = height;
        } else {
            var parsedHeight = parseInt(height.split("px")[0]);
            var totalHeight = parsedHeight + 30; // Add 30px for header/title
            overlay.style.height = height;
            iframe.style.height = height;
            adWindow.style.height = totalHeight + "px";
            var parsedWidth = parseInt(width.split("px")[0]);
            var totalWidth = parsedWidth + 40; // Add 40px for padding/border
            // Function to adjust ad window position on resize
            function adjustAdWindowPosition() {
                if (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) < totalHeight) {
                    document.getElementById("c_window_xEucqIjg").style.top = "0";
                }
            }
            window.onresize = adjustAdWindowPosition;
            window.onload = adjustAdWindowPosition;
            // Add media queries for responsive behavior
            var responsiveStyle = document.createElement("style");
            responsiveStyle.innerHTML = `
                @media all and (max-width: ${totalWidth}px) {
                    #c_window_xEucqIjg { position: fixed; top: 0 !important; left: 0; right: 0; width: 90% !important; margin: 10px auto auto !important; text-align: center; }
                    .bottom-center_vUTDnibMkZJIvuTH, .top-center_vUTDnibMkZJIvuTH { left: 0 !important; right: 0 !important; transform: none !important; }
                    #a_iframe_DwTGCjTm { width: 100% !important; }
                    #alink_overlay_EPXdyaUf { width: 90% !important; height: 90% !important; }
                    .bottom-right_vUTDnibMkZJIvuTH { top: 0px !important; }
                }
            `;
            document.head.appendChild(responsiveStyle);
            if (matchMedia) {
                var minWidthQuery = window.matchMedia("(min-width: " + parsedWidth + "px)");
                minWidthQuery.addListener(function(mq) {
                    if (mq.matches) {
                        // Logic if the media query matches
                    }
                });
                // Initial check
                if (minWidthQuery.matches) {
                    // Logic if the media query matches
                }
            }
            // Orientation change handling
            if (window.matchMedia("(orientation: landscape)").matches && clientHeight < totalHeight) {
                document.getElementById("c_window_xEucqIjg").style.top = "0";
            }
            window.addEventListener("orientationchange", function() {
                if (!window.matchMedia("(orientation:landscape)").matches || clientHeight < totalHeight) {
                    document.getElementById("c_window_xEucqIjg").style.top = "0";
                }
            });
        }
        // Set iframe attributes
        iframe.src = adUrl;
        iframe.name = "a_iframe_DwTGCjTm";
        iframe.id = "a_iframe_DwTGCjTm";
        iframe.frameBorder = "0";
        iframe.scrolling = "no";
        iframe.sandbox = "allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation allow-pointer-lock allow-downloads";
        adWindow.appendChild(iframe);
        // Display the ad window
        adWindow.classList.add("a_open_rrTmtfGj");
        document.getElementById("a_iframe_DwTGCjTm").src = adUrl; // Redundant src setting?
        // Timer for closing button visibility
        var timerValue = 5;
        var timerInterval = setInterval(function() {
            timerValue--;
            if (timerValue <= 0) {
                clearInterval(timerInterval);
            } else if (document.getElementById("a_timer_oYvwGmQc")) {
                document.getElementById("a_timer_oYvwGmQc").textContent = timerValue;
            }
        }, 1000);
        var timedis = setTimeout(function() {
            document.getElementById("a_close_nEYjMupI").classList.remove("a_hide_qkasklrO");
            document.getElementById("a_timer_oYvwGmQc").classList.add("a_hide_qkasklrO");
        }, 5000);
        // Event listener for clicks within the document (likely for closing the ad)
        document.addEventListener("click", function(event) {
            clearInterval(timerInterval);
            var newTimerValue = 5;
            timerInterval = setInterval(function() {
                newTimerValue--;
                if (newTimerValue <= 0) {
                    clearInterval(newTimerValue); // Typo in original code, should be timerInterval
                } else if (document.getElementById("a_timer_oYvwGmQc")) {
                    document.getElementById("a_timer_oYvwGmQc").textContent = newTimerValue;
                }
            }, 1000);
            var targetElement = (event = event || window.event).target || event.srcElement;
            // Handle dismiss click (close button)
            if (targetElement.hasAttribute("data-dismiss_OLjQnDvi") && "c_xEucqIjg" === targetElement.getAttribute("data-dismiss_OLjQnDvi")) {
                var windowToClose = document.getElementById("c_window_xEucqIjg");
                document.getElementById("c_window_xEucqIjg").classList.add("a_hide_qkasklrO");
                windowToClose.classList.remove("a_open_rrTmtfGj");
                document.getElementById("c_window_xEucqIjg").remove();
                event.preventDefault();
            }
            // Handle data-alink click (also closes ad)
            if (targetElement.hasAttribute("data-alink")) {
                var windowToClose = document.getElementById("c_window_xEucqIjg");
                document.getElementById("c_window_xEucqIjg").classList.add("a_hide_qkasklrO");
                windowToClose.classList.remove("a_open_rrTmtfGj");
                event.preventDefault();
            }
            // Handle alink click (closes ad and opens clickUrl in new tab)
            if (targetElement.hasAttribute("alink")) {
                var windowToClose = document.getElementById("c_window_xEucqIjg");
                document.getElementById("c_window_xEucqIjg").classList.add("a_hide_qkasklrO");
                windowToClose.classList.remove("a_open_rrTmtfGj");
                window.open(clickUrl, "_blank").focus();
            }
        }, false);
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
    // Object 'utils': Contains methods for cookie/localStorage, window opening, and browser detection.
    var utils = {
        _cookieLockSet: function(value) {
            // ELIMINADO: Esta función ya no necesita escribir en cookies/localStorage si eliminamos las limitaciones.
            return true;
        },
        _cookieLockGet: function() {
            // MODIFICADO: Siempre devuelve false para no bloquear nunca.
            return false;
        },
        // Detects browser and device type
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
            var canPopunder = false;
            var canPopup = true;
            var canTabunder = true;
            var punderminipop = false;
            var isCrossOriginReferrer = env.isCrossOriginReferrer;
            if (env.deviceType === "desktop") {
                if (env.browser === "chrome") canPopunder = true;
                if (env.browser === "firefox") canPopunder = true;
                if (env.browser === "msie") canPopunder = true;
                if (env.browser === "safari") canPopunder = true;
                if (env.browser === "chromium") canPopunder = true;
                if (env.browser === "edge") canPopunder = false; // Note: Edge popunder explicitly set to false
            } else {
                canTabunder = canPopunder = canPopup = false;
            }
            if (env.isInIframe === 1) {
                canTabunder = false;
            }
            punderminipop = canPopunder && (
                (env.browser === "msie" && env.version === 11) ||
                env.browser === "edge" ||
                env.browser === "chromium" ||
                env.browser === "chrome" ||
                (env.browser === "firefox" && env.version >= 85)
            );
            return {
                env: env,
                popup: canPopup,
                popunder: canPopunder,
                tabup: true,
                tabunder: canTabunder,
                punderminipop: punderminipop,
                isCrossOriginReferrer: isCrossOriginReferrer
            };
        },
        _openAd: function(url, options) {
            // Call createFloatingAd directly with the URL.
            // We're assuming a default position, width, height, and clickUrl if not provided.
            // You might need to adjust these default values based on your desired behavior.
            const defaultPosition = "bottom-right"; // Or "top-left", "top-right", "bottom-left", etc.
            const defaultWidth = "300px";
            const defaultHeight = "250px";
            // For clickUrl, if the options object doesn't contain a specific clickUrl,
            // you might want to use the adUrl itself or a different default.
            const clickUrl = options.clickUrl || url;

            createFloatingAd(url, defaultPosition, defaultWidth, defaultHeight, clickUrl);

            // Indicate that an ad "opening" has been initiated.
            return true;
        },

        abortPop: function() {
            this._removeCatchAllDiv();
            this.clearUrls();
            this.settings.prepop = false;
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
            // Handle browser back button hook
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
                    history.go(-1);
                    return false;
                }
                var urlToOpen = bbrUrl.url;
                if (bbrUrl.options.onbeforeopen instanceof Function) {
                    urlToOpen = bbrUrl.options.onbeforeopen(urlToOpen);
                } else if (this.settings.onbeforeopen instanceof Function) {
                    urlToOpen = this.settings.onbeforeopen(urlToOpen);
                }
                window.top.location.replace(urlToOpen);
                return true;
            }
            // User Activation API checks
            try {
                if (this.userActivation && this.settings.catchalldiv !== "extreme" && !window.navigator.userActivation.isActive) { // Removed iframewin check
                    this.settings.catchalldiv = "never";
                    this._removeCatchAllDiv();
                    return false;
                }
            } catch (e) {}
            if (this.urls.length === 0) return false;
            this.settings.prepop = false;
            var currentAd = this.urls[0];
            var openedAd = this._openAd(currentAd.url, currentAd.options);
            if (!openedAd) {
                if (this.settings.catchalldiv !== "extreme") {
                    this.settings.catchalldiv = "never";
                    this._removeCatchAllDiv();
                } else if (event.type !== "uah") { // user activation handler
                    this._addWarningToCatchAllDiv();
                }
            }
            if (openedAd || this.settings.ignorefailure) {
                this.urls.shift();
                if (this.urls.length === 0) {
                    clearInterval(this.uahtimer);
                    this.uahtimer = 0;
                    this._removeCatchAllDiv();
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
            var target = event.target || event.srcElement || event.toElement;
            if (this.urls.length === 0) return false;
            if (target.tagName !== "A") return false;
            if (target.target === "_blank" || (document.getElementsByTagName("BASE").length > 0 && (document.getElementsByTagName("BASE")[0].target || "").toLowerCase() === "_blank")) {
                target.popjsoriginalhref = target.href;
                target.href = "#";
                target.target = "";
            }
        },
        _onMouseUpHandler: function(event) {
            var target = event.target || event.srcElement || event.toElement;
            if (target.popjsoriginalhref) {
                setTimeout(function() {
                    target.href = target.popjsoriginalhref;
                    delete target.popjsoriginalhref;
                    target.target = "_blank";
                }, 100);
            }
        },
        _isCatchAllNeeded: function() {
            if (this.catchalldiv || this.settings.catchalldiv === "never" || this.urls.length === 0) return false;
            if (this.settings.catchalldiv === "always" || this.settings.catchalldiv === "extreme") return true;
            var iframes = document.getElementsByTagName("IFRAME");
            for (var i = 0; i < iframes.length; i++) {
                if ((iframes.item(i).clientHeight || iframes.item(i).offsetHeight || 0) > 100 || (iframes.item(i).clientWidth || iframes.item(i).offsetWidth || 0) > 100) {
                    return true;
                }
            }
            return false;
        },
        _removeCatchAllDiv: function() {
            if (this.catchallmon) {
                clearInterval(this.catchallmon);
                this.catchallmon = false;
            }
            if (this.catchalldiv) {
                this.catchalldiv.parentNode.removeChild(this.catchalldiv);
                delete this.catchalldiv;
            }
        },
        _createCatchAllDiv: function() {
            if (document.getElementsByTagName("body").length === 0) return false;
            var div = document.createElement("div");
            div.style = `
                text-align:center; padding-top:48vh; font-size:4vw; position:fixed; display:block; width:100%; height:100%; top:0; left:0; right:0; bottom:0; background-color:rgba(0,0,0,0); z-index:300000;
            `;
            if (document.addEventListener) {
                if (this.cap.env.os === "ios") {
                    div.addEventListener("touchend", this._onExecute.bind(this));
                }
                div.addEventListener("click", this._onExecute.bind(this));
            } else {
                div.attachEvent("onclick", this._onExecute.bind(this));
            }
            document.getElementsByTagName("body")[0].appendChild(div);
            this.catchalldiv = div;
            return true;
        },
        _deployCatchAll: function() {
            if (this.settings.catchalldiv === "never") return false;
            if (!this.catchalldiv) {
                if (this._isCatchAllNeeded()) {
                    this._createCatchAllDiv();
                }
                if (!this.catchallmon) {
                    this.catchallmon = setInterval(function() {
                        if (this._isCatchAllNeeded()) {
                            this._createCatchAllDiv();
                        }
                    }.bind(this), 200);
                }
            }
        },
        _addWarningToCatchAllDiv: function() {
            if (!this.catchalldiv) return false;
            this.catchalldiv.style.backgroundColor = "black";
            this.catchalldiv.style.color = "white";
            this.catchalldiv.innerText = "Access blocked due to popup blocker.\nDisable popup blocker and click anywhere to access the content.";
        },
        init: function(config) {
            this.userActivation = true;
            try {
                navigator.userActivation.isActive;
            } catch (e) {
                this.userActivation = false;
            }
            this.cap = this._getBrowserCapabilities();
            this.urls = [];
            this.bbrurl = false; // Back Button Redirect URL
            this.settings = {}; // Initialize settings from config object
            this.settings.prepop = false; // prepop is no longer used
            this.settings.crtimeout = config.crtimeout || 60 * 1000; // 60 seconds
            this.settings.targetblankhandler = config.targetblankhandler || true;
            this.settings.onbeforeopen = config.onbeforeopen;
            this.settings.onafteropen = config.onafteropen;
            this.settings.ignorefailure = config.ignorefailure || false;
            this.settings.catchalldiv = config.catchalldiv || "auto";
            // If user activation API is not available, force catchall to "always"
            if (!this.userActivation) {
                this.settings.catchalldiv = "always";
            }
            // Deploy catch-all mechanism if not "never"
            if (this.settings.catchalldiv !== "never") {
                window.addEventListener("load", this._deployCatchAll.bind(this), true);
                setInterval(this._deployCatchAll.bind(this), 200);
                this._deployCatchAll();
            }
            this.bbrhooked = false;
            this.minipopmon = false;
            this.settings.openernull = true; // Set new window.opener to null

            // Set up User Activation Handler timer
            this.uahtimer = this.userActivation ? setInterval(this._userActivationHandler.bind(this), 50) : 0;
            // Add event listeners to the main window
            if (window.addEventListener) {
                window.addEventListener("touchend", this._onExecute.bind(this), true);
                window.addEventListener("click", this._onExecute.bind(this), true);
                if (this.cap.isCrossOriginReferrer) { // bbr is "browser back button redirect"
                    window.addEventListener("popstate", this._onExecute.bind(this), true);
                }
                if (this.settings.targetblankhandler) {
                    window.addEventListener("mousedown", this._onMouseDownHandler.bind(this), true);
                    window.addEventListener("mouseup", this._onMouseUpHandler.bind(this), true);
                }
            } else { // Fallback for older IE
                window.attachEvent("onclick", this._onExecute.bind(this));
                if (this.cap.isCrossOriginReferrer) {
                    window.attachEvent("onpopstate", this._onExecute.bind(this));
                }
                if (this.settings.targetblankhandler) {
                    window.attachEvent("onmousedown", this._onMouseDownHandler.bind(this));
                }
            }
        },
        _hookBackButton: function() {
            if (document.readyState === "complete") {
                if (!this.bbrhooked) {
                    window.history.pushState({}, "", null);
                    this.bbrhooked = true;
                }
            } else {
                window.addEventListener("load", this._hookBackButton.bind(this), true);
            }
        },
        clearUrls: function() {
            this.urls = [];
        },
        addUrl: function(url, options) {
            if (!url.match(/^https?:\/\//) || !this.cap) return false;
            if (options.type === "bbr") { // Back Button Redirect type
                if (!this.cap.isCrossOriginReferrer) return false;
                if (!this.bbrhooked) this._hookBackButton();
                this.bbrurl = {
                    url: url,
                    options: options
                };
                return true;
            }
            // For other ad types
            if (this.userActivation && this.uahtimer === 0) {
                this.uahtimer = setInterval(this._userActivationHandler.bind(this), 50);
            }
            this._deployCatchAll();
            this.urls.push({
                url: url,
                options: options
            });
        }
    };
    // Base64 encoding/decoding object
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
    // detectZoom library (appears to be a copy-paste)
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
    // Global variables for paths and obfuscated strings
    var BASE_PATH = "/c";
    var POP_GLOBAL_VAR = "_pop";
    var PAO_GLOBAL_VAR = "_pao"; // Likely refers to "PopAds Object"
    window.Base64 = Base64; // Assign the Base64 object to window.Base64 for broader access
    var currentScriptElement = document.currentScript;
    var adscoreTimeout = null;
    // Cookie storage utility
    var cookieStorage = {
        _set: function(name, value, expiration, path, domain) {
            // ELIMINADO: Esta función ya no necesita escribir en cookies.
            // var expires = expiration || "";
            // if (expires) {
            //     if (typeof expires === "number") {
            //         var date = new Date();
            //         date.setTime(date.getTime() + 1000 * expires);
            //         expires = date;
            //     }
            //     expires = ";expires=" + expires.toUTCString();
            // }
            // document.cookie = name + "=" + escape("" + value) + expires + (domain ? ";domain=" + domain : "") + ";path=" + (path || "/") + ";SameSite=Lax";
        },
        _get: function(name) {
            // MODIFICADO: Siempre devuelve null para no leer cookies.
            return null;
        },
        _remove: function(name) {
            // ELIMINADO: Esta función ya no necesita remover cookies.
            // this._set(name, 0, new Date(0));
        }
    };
    // LocalStorage utility with fallback to cookies
    var storage = {
        _available: null,
        _isAvailable: function() {
            // MODIFICADO: Siempre devuelve false para no usar localStorage.
            return false;
        },
        _set: function(name, value) {
            // ELIMINADO: No hace nada, ya que no usamos localStorage ni cookies para limitar.
        },
        _get: function(name) {
            // MODIFICADO: Siempre devuelve null para no leer almacenamiento.
            return null;
        },
        _remove: function(name) {
            // ELIMINADO: No hace nada.
        }
    };
    // Main Ad Manager object
    var adManager = {
        _inventory: {},
        _config: {
            _siteId: 0,
            _minBid: 0,
            _popPerDay: 0,
            _popDelay: 0,
            _inpagePerDay: 0,
            _inpageDelay: 0,
            _defaultDelay: 0,
            _blockedCountries: false,
            _default: false,
            _defaultType: "popunder",
            _defaultPerDay: 0,
            _useOverlay: true,
            _trafficType: 0,
            _popunderFailover: "tabup",
            _prepop: cookieStorage._get("_popprepop") === null,
            _adscorebp: null,
            _adscorept: null,
            _adscoreak: "QpUJAAAAAAAAGu98Hdz1l_lcSZ2rY60Ajjk9U1c" // Adscore API key
        },
        _init: function() {
            var self = this;
            this._loadConfig();
            this.adfired = false;
            utils.init({
                // MODIFICADO: prepop ya no depende de _isDelayBetweenExpired().
                prepop: this._config._prepop,
                catchalldiv: this._config._useOverlay,
                onafteropen: function() {
                    self.adfired = true;
                    // ELIMINADO: Ya no actualizamos el contador de disparos.
                    // self._updateFiredCount();
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
                        // ELIMINADO: No enviamos popundersPerIP, ya no estamos limitando por IP en el cliente.
                        // popundersPerIP: config._popPerDay + "," + config._inpagePerDay,
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
        _parseFloatingBanner: function(bannerData) {
            var self = this;
            setTimeout(function() {
                createFloatingAd(bannerData.url, bannerData.position, bannerData.width, bannerData.height, bannerData.clickurl);
            }.bind(self), this._mSecondsTillDelayExpired("inpage"));
        },
        _parseInventory: function(inventoryData) {
            this._inventory = inventoryData || {};
            this._preparePop();
        },
        _parseBBR: function(bbrData) {
            utils.addUrl(bbrData.url, {
                type: "bbr",
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
            if (this._config._default === false || this._config._default === "") { // Solo si no hay URL por defecto.
                utils.abortPop();
            } else {
                // Modified to directly call createFloatingAd for default URL
                const defaultUrl = this._config._default;
                const defaultPosition = "bottom-right"; // Or choose another default
                const defaultWidth = "300px";
                const defaultHeight = "250px";
                createFloatingAd(defaultUrl, defaultPosition, defaultWidth, defaultHeight, defaultUrl);

                // No longer need to handle other types or fallbacks here, as we are always opening a floating ad.
                // The ad will open immediately as _mSecondsTillDelayExpired is set to 0.
            }
        },
        _preparePopInventory: function() {
            var self = this;
            setTimeout(function() {
                const inventoryUrl = self._inventory.url;
                const adType = self._inventory.type; // You might want to use this to determine ad appearance if needed
                const clickUrl = inventoryUrl + "&s=" + self._getScreenData() + "&v=&m="; // Original click URL construction

                // Call createFloatingAd with inventory data
                createFloatingAd(inventoryUrl, "bottom-right", "300px", "250px", clickUrl); // Use default position/size or pull from inventory if available

                // Clear timeout for adscore if ad opens
                try {
                    clearTimeout(adscoreTimeout);
                } catch (e) {}

            }, this._mSecondsTillDelayExpired());
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
            // MODIFICADO: Siempre devuelve 0 para no limitar por conteo.
            return 0;
        },
        _updateFiredCount: function(type) {
            // MODIFICADO: Esta función no hace nada, ya no necesitamos actualizar los contadores.
        },
        _getLastOpenAt: function(type) {
            // MODIFICADO: Siempre devuelve 0 para no limitar por tiempo.
            return 0;
        },
        _isDelayBetweenExpired: function(type, delay) {
            // MODIFICADO: Siempre devuelve true para que el retraso siempre se considere expirado.
            return true;
        },
        _mSecondsTillDelayExpired: function(type, delay) {
            // MODIFICADO: Siempre devuelve 0 para que no haya retraso.
            return 0;
        },
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
                setTimeout(this._init.bind(this), 0); // Inicia inmediatamente
            }
        },
        _loadConfig: function() {
            var globalConfig = window[POP_GLOBAL_VAR] || [];
            var config = this._config;
            for (var i = 0; i < globalConfig.length; i++) {
                var key = globalConfig[i][0];
                var value = globalConfig[i][1];
                // Type conversion for certain config values
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
                    case "popundersPerIP":
                        // ELIMINADO: No limitamos por IP.
                        // config._popPerDay = value;
                        break;
                    case "delayBetween":
                        // ELIMINADO: No hay delay entre pops.
                        // config._popDelay = value;
                        break;
                    case "blockedCountries":
                        config._blockedCountries = value;
                        break;
                    case "default":
                        config._default = value;
                        break;
                    case "defaultType":
                        config._defaultType = value;
                        break;
                    case "defaultPerIP":
                        // ELIMINADO: No limitamos por IP.
                        // config._defaultPerDay = value;
                        break;
                    case "topmostLayer":
                        config._useOverlay = value;
                        break;
                    case "trafficType":
                        config._trafficType = value;
                        break;
                    case "popunderFailover":
                        config._popunderFailover = value;
                        break;
                    case "prepop":
                        config._prepop = value;
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
                    case "inpagePerIP":
                        // ELIMINADO: No limitamos inpage por IP.
                        // config._inpagePerDay = value;
                        break;
                    case "inpageDelayBetween":
                        // ELIMINADO: No hay delay inpage.
                        // config._inpageDelay = value;
                        break;
                    case "defaultDelayBetween":
                        // ELIMINADO: No hay delay default.
                        // config._defaultDelay = value;
                        break;
                }
            }
            if (!config._useOverlay.length) { // Seems to check if it's not a string
                config._useOverlay = config._useOverlay ? "always" : "auto";
            }
        }
    };
    // Attempt to find a dynamic global variable name (likely another obfuscation layer)
    for (var prop in window) {
        try {
            if (prop.match(/[0-9a-f]{32,32}/) && window[prop] && window[prop].length >= 7 && window[prop][0] && window[prop][0][0] && !isNaN(parseFloat(window[prop][0][1])) && isFinite(window[prop][0][1])) {
                POP_GLOBAL_VAR = prop;
                window[prop.slice(0, 16) + prop.slice(0, 16)] = window[prop]; // Duplicate a global variable
                break;
            }
        } catch (e) {}
    }
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
        fbparse: function(bannerData) {
            adManager._parseFloatingBanner(bannerData);
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
