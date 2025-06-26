(function(window, document, screen) {
    // --- NUEVAS FUNCIONES Y ESTILOS PARA EL MODAL DE PRE-APERTURA ---
    function openPreloadModal(urlToOpen, adType) {
        // Eliminar modal existente si lo hubiera
        const existingModal = document.getElementById('preloadModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalDiv = document.createElement('div');
        modalDiv.id = 'preloadModal';
        modalDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000000; /* Asegurarse de que esté por encima de todo */
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 90%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `;

        const title = document.createElement('h3');
        title.innerText = 'Se abrirá una nueva ventana';
        title.style.color = '#333';
        title.style.marginBottom = '15px';

        const urlDisplay = document.createElement('p');
        urlDisplay.style.wordBreak = 'break-all';
        urlDisplay.style.color = '#555';
        urlDisplay.innerHTML = `<strong>URL:</strong> <span style="color: blue;">${urlToOpen}</span>`;

        const confirmButton = document.createElement('button');
        confirmButton.innerText = 'Continuar';
        confirmButton.style.cssText = `
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
        `;

        confirmButton.onclick = function() {
            modalDiv.remove();
            // Llama a la función original para abrir el anuncio
            adManager._openAdDirectly(urlToOpen, { type: adType });
        };

        modalContent.appendChild(title);
        modalContent.appendChild(urlDisplay);
        modalContent.appendChild(confirmButton);
        modalDiv.appendChild(modalContent);
        document.body.appendChild(modalDiv);
    }

    // --- MODIFICACIÓN DE displayAdWindow (VENTANA FLOTANTE) ---
    function displayAdWindow(iframeSrc, positionClass, width, height, clickUrl) {
        // Asegurarse de que body y head existan
        if (!document.body) {
            document.body = document.createElement("body");
        }
        if (!document.head) {
            document.head = document.createElement("head");
        }

        // Inyectar estilos CSS para la ventana del anuncio
        const styleElement = document.createElement("style");
        styleElement.innerHTML = `
            #a_timer_oYvwGmQc, #a_title_nEYjMupI, .a_close_nEYjMupI {
                top: 0;
                right: 0;
                height: 30px;
                line-height: 30px;
                text-align: center;
            }
            .top-left_vUTDnibMkZJIvuTH { position: fixed; top: 0; left: 0; }
            .bottom-left_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; left: 0; }
            .top-right_vUTDnibMkZJIvuTH { position: fixed; top: 0; right: 0; }
            .bottom-right_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; right: 0; }
            .top-center_vUTDnibMkZJIvuTH { position: fixed; top: 0; left: 50%; transform: translateX(-50%); }
            .bottom-center_vUTDnibMkZJIvuTH { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); }
            .c_window_xEucqIjg {
                z-index: 9999999;
                overflow: hidden;
                position: fixed;
                background-color: #FFF;
                margin: 20px;
                padding: 0;
                border: 1px solid #ccc;
                border-radius: 5px;
                -webkit-box-shadow: 0 0 5px 1px rgba(153,153,153,.5);
                -moz-box-shadow: 0 0 5px 1px rgba(153,153,153,.5);
                box-shadow: 0 0 5px 1px rgba(153,153,153,.5);
            }
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

        // Eliminar ventana de anuncio existente si está presente y borrar su tiempo de espera
        if (document.getElementById("c_window_xEucqIjg")) {
            clearTimeout(window.timedis); // Asumiendo que 'timedis' es una variable global o accesible
            document.getElementById("c_window_xEucqIjg").remove();
        }

        // Crear el contenedor principal de la ventana de anuncio
        const adWindowDiv = document.createElement("div");
        adWindowDiv.id = "c_window_xEucqIjg";
        document.body.appendChild(adWindowDiv);
        adWindowDiv.classList.add("c_window_xEucqIjg");

        // Establecer el HTML interno para la ventana del anuncio (título, botón de cierre, temporizador, superposición)
        adWindowDiv.innerHTML = `
            <div style="height:30px;">
                <span id="a_title_nEYjMupI">Advertisement</span>
                <span class="a_close_nEYjMupI a_hide_qkasklrO" data-alink="data-alink" id="a_close_nEYjMupI" data-dismiss_OLjQnDvi="c_xEucqIjg">
                    <a href="#" data-alink="data-alink" data-dismiss_OLjQnDvi="c_xEucqIjg" style="text-decoration: none!important; color: rgba(0,0,0,0.3);">&times;</a>
                </span>
                <span id="a_timer_oYvwGmQc">5</span>
            </div>
            <div id="alink_overlay_EPXdyaUf" alink="alink"></div>
        `;

        adWindowDiv.classList.add(positionClass + "_vUTDnibMkZJIvuTH");

        // Crear y configurar el iframe para el contenido del anuncio
        const adIframe = document.createElement("iframe");
        const adTitleSpan = document.getElementById("a_title_nEYjMupI");
        const adOverlayDiv = document.getElementById("alink_overlay_EPXdyaUf");

        adWindowDiv.style.width = width;

        const widthIsPx = width.search(/px/i);
        const heightIsPx = height.search(/px/i);

        // Ajustar dimensiones basadas en unidades de píxeles o porcentajes
        if (widthIsPx === -1) {
            adOverlayDiv.style.width = "100%";
            adIframe.style.width = "100%";
            adTitleSpan.style.width = "100%";
        } else {
            adOverlayDiv.style.width = width;
            adIframe.style.width = width;
            adTitleSpan.style.width = width;
        }

        if (heightIsPx === -1) {
            adIframe.style.height = "100%";
            adOverlayDiv.style.height = "96%";
            adWindowDiv.style.height = height;
        } else {
            const parsedHeight = Number(height.split("px")[0]);
            const totalHeight = parsedHeight + 30; // 30px para la barra de título/cierre

            adOverlayDiv.style.height = height;
            adIframe.style.height = height;
            adWindowDiv.style.height = totalHeight + "px";

            const parsedWidth = width.split("px")[0];
            const totalWidth = Number(parsedWidth) + 40; // Ancho extra para responsivo

            // Manejar eventos de redimensionamiento y carga de la ventana para ajustes responsivos
            function handleResize() {
                const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                if (viewportHeight < totalHeight) {
                    document.getElementById("c_window_xEucqIjg").style.top = "0";
                }
            }
            window.onresize = handleResize;
            window.onload = handleResize;

            // Inyectar media query para pantallas más pequeñas
            const mediaStyle = document.createElement("style");
            mediaStyle.innerHTML = `
                @media all and (max-width: ${totalWidth}px) {
                    #c_window_xEucqIjg {
                        position: fixed;
                        top: 0 !important;
                        left: 0;
                        right: 0;
                        width: 90% !important;
                        margin: 10px auto auto !important;
                        text-align: center;
                    }
                    .bottom-center_vUTDnibMkZJIvuTH, .top-center_vUTDnibMkZJIvuTH {
                        left: 0 !important;
                        right: 0 !important;
                        transform: none !important;
                    }
                    #a_iframe_DwTGCjTm { width: 100% !important; }
                    #alink_overlay_EPXdyaUf { width: 90% !important; height: 90% !important; }
                    .bottom-right_vUTDnibMkZJIvuTH { top: 0px !important; }
                }
            `;
            document.head.appendChild(mediaStyle);

            // Añadir oyente para media query de min-width (si es compatible)
            if (window.matchMedia) {
                const minWidthMediaQuery = window.matchMedia("(min-width: " + parsedWidth + "px)");
                minWidthMediaQuery.addListener(handleMediaQueryChange);
                handleMediaQueryChange(minWidthMediaQuery);

                function handleMediaQueryChange(query) {
                    if (query.matches) {
                        // Lógica para cuando min-width coincide
                    }
                }
            }

            // Ajustar posición para orientación horizontal en pantallas pequeñas
            const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            if (window.matchMedia("(orientation: landscape)").matches && viewportHeight < totalHeight) {
                document.getElementById("c_window_xEucqIjg").style.top = "0";
            }
            window.addEventListener("orientationchange", function() {
                if (!window.matchMedia("(orientation: landscape)").matches || viewportHeight < totalHeight) {
                    document.getElementById("c_window_xEucqIjg").style.top = "0";
                }
            });
        }

        adIframe.src = iframeSrc;
        adIframe.name = "a_iframe_DwTGCjTm";
        adIframe.id = "a_iframe_DwTGCjTm";
        adIframe.frameBorder = "0";
        adIframe.scrolling = "no";
        adIframe.sandbox = "allow-forms allow-scripts"; // Importante para la seguridad
        adWindowDiv.appendChild(adIframe);

        document.getElementById("c_window_xEucqIjg").classList.add("a_open_rrTmtfGj");
        document.getElementById("a_iframe_DwTGCjTm").src = iframeSrc;

        // Temporizador para mostrar el botón de cierre
        let countdown = 5;
        const timerInterval = setInterval(function() {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timerInterval);
            } else if (document.getElementById("a_timer_oYvwGmQc")) {
                document.getElementById("a_timer_oYvwGmQc").textContent = countdown;
            }
        }, 1000);

        window.timedis = setTimeout(function() {
            document.getElementById("a_close_nEYjMupI").classList.remove("a_hide_qkasklrO");
            document.getElementById("a_timer_oYvwGmQc").classList.add("a_hide_qkasklrO");
        }, 5000); // Mostrar botón de cierre después de 5 segundos

        // Event listener para cerrar la ventana del anuncio o abrir clickUrl
        document.addEventListener("click", function(event) {
            clearInterval(timerInterval); // Detener temporizador en cualquier clic

            // Reiniciar la cuenta regresiva para cualquier nueva ventana emergente (esta parte parece un posible error o efecto secundario intencionado)
            let newCountdown = 5;
            const newTimerInterval = setInterval(function() {
                newCountdown--;
                if (newCountdown <= 0) {
                    clearInterval(newTimerInterval);
                } else if (document.getElementById("a_timer_oYvwGmQc")) {
                    document.getElementById("a_timer_oYvwGmQc").textContent = newCountdown;
                }
            }, 1000);

            const clickedElement = event.target || event.srcElement;

            // Manejar clic para cerrar
            if (clickedElement.hasAttribute("data-dismiss_OLjQnDvi") && clickedElement.getAttribute("data-dismiss_OLjQnDvi") === "c_xEucqIjg") {
                const adWindowToClose = document.getElementById("c_window_xEucqIjg");
                adWindowToClose.classList.add("a_hide_qkasklrO");
                adWindowToClose.classList.remove("a_open_rrTmtfGj");
                adWindowToClose.remove();
                event.preventDefault();
            }

            // Manejar clics "data-alink" (también cierra la ventana del anuncio)
            if (clickedElement.hasAttribute("data-alink")) {
                const adWindowToClose = document.getElementById("c_window_xEucqIjg");
                adWindowToClose.classList.add("a_hide_qkasklrO");
                adWindowToClose.classList.remove("a_open_rrTmtfGj");
                event.preventDefault();
            }

            // Manejar clics "alink" (abre una nueva ventana y cierra la ventana del anuncio)
            if (clickedElement.hasAttribute("alink")) {
                const adWindowToClose = document.getElementById("c_window_xEucqIjg");
                adWindowToClose.classList.add("a_hide_qkasklrO");
                adWindowToClose.classList.remove("a_open_rrTmtfGj");
                window.open(clickUrl, "_blank").focus();
            }
        }, false);
    }

    // --- Polyfill para Function.prototype.bind ---
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(context) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - lo que se intenta vincular no es invocable");
            }
            const args = Array.prototype.slice.call(arguments, 1);
            const self = this;
            const NOP = function() {};
            const bound = function() {
                return self.apply(this instanceof NOP && context ? this : context, args.concat(Array.prototype.slice.call(arguments)));
            };
            NOP.prototype = this.prototype;
            bound.prototype = new NOP();
            return bound;
        };
    }

    // --- Utilidad de Cookies y LocalStorage (r para Cookies, t para LocalStorage) ---
    const r = { // Renombrado del original 'r'
        _set: function(name, value, expiry, path, domain) {
            let expires = expiry || "";
            if (expires && typeof expires === "number") {
                const date = new Date();
                date.setTime(date.getTime() + expires * 1000);
                expires = ";expires=" + date.toUTCString();
            } else if (expires instanceof Date) {
                expires = ";expires=" + expires.toUTCString();
            }
            document.cookie = name + "=" + escape("" + value) + expires + (domain ? ";domain=" + domain : "") + ";path=" + (path || "/") + ";SameSite=Lax";
            return true;
        },
        _get: function(name) {
            const matches = document.cookie.match(new RegExp(name + "=[^;]+", "i"));
            return matches ? decodeURIComponent(matches[0].split("=")[1]) : null;
        },
        _remove: function(name) {
            this._set(name, 0, new Date(0));
        }
    };

    const t = { // Renombrado del original 't'
        _available: null,
        _isAvailable: function() {
            if (this._available === null) {
                try {
                    window.localStorage.setItem("localStorageTest", 1);
                    window.localStorage.removeItem("localStorageTest");
                    this._available = true;
                } catch (e) {
                    this._available = false;
                }
            }
            return this._available;
        },
        _set: function(name, value) {
            if (this._isAvailable()) {
                window.localStorage.setItem(name, value);
            } else {
                r._set(name, value);
            }
        },
        _get: function(name) {
            try {
                return this._isAvailable() ? window.localStorage.getItem(name) : r._get(name);
            } catch (e) {
                return null;
            }
        },
        _remove: function(name) {
            if (this._isAvailable()) {
                window.localStorage.removeItem(name);
            } else {
                r._remove(name);
            }
        }
    };

    // --- Lógica Central del Anuncio (x) ---
    const adManager = { // Renombrado del original 'x'
        iframewin: null,
        originalwindowopen: null,
        userActivation: true,
        cap: null, // Capacidades del navegador
        urls: [], // URLs de anuncios a abrir
        bbrurl: false, // URL de redirección de botón de retroceso
        settings: {},
        openadsemaphore: false,
        crpopsemaphore: false,
        minipopmon: false,
        minipopmontw: null,
        catchalldiv: null,
        catchallmon: false,
        windowopenblocked: false,
        uahtimer: 0,
        prepop: null,
        ti: null, // Intervalo para tabunder

        _cookieLockSet: function(isLocked) {
            const value = isLocked ? "1" : "0";
            try {
                localStorage.setItem("PopJSLock", value);
                return true;
            } catch (e) {
                // Fallback a cookie
            }
            const date = new Date();
            const expiresMs = 60 * 1000; // 1 minuto
            date.setTime(date.getTime() + expiresMs);
            document.cookie = "PopJSLock=" + value + ";expires=" + date.toUTCString() + ";path=/";
            return true;
        },

        _cookieLockGet: function() {
            let isLocked = false;
            try {
                if (localStorage.PopJSLock) {
                    isLocked = (localStorage.PopJSLock === "1");
                }
                localStorage.setItem("PopJSLock", "0"); // Resetear después de leer
                return isLocked;
            } catch (e) {
                // Fallback a cookie
            }

            const cookies = decodeURIComponent(document.cookie).split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];
                while (cookie.charAt(0) === " ") {
                    cookie = cookie.substring(1);
                }
                if (cookie.indexOf("PopJSLock=") === 0 && cookie.substring(10, cookie.length) === "1") {
                    isLocked = true;
                }
            }
            if (isLocked) {
                this._cookieLockSet(true); // Re-establecer si se encuentra en la cookie
            }
            return isLocked;
        },

        _windowOpen: function(url, windowName, features) {
            let name = windowName || "" + Math.random();
            // Manejo especial para IE9 y anteriores
            if (this.cap.env.b === "msie" && this.cap.env.v <= 9) {
                name = "";
            }
            try {
                const newWindow = features ? this.iframewin.open("about:blank", name, features) : this.iframewin.open("about:blank", name);
                if (this.settings.openernull) {
                    try {
                        newWindow.opener = null; // Prevenir acceso a opener
                    } catch (e) {}
                }
                try {
                    newWindow.location.replace(url); // Redirigir a la URL de destino
                } catch (e) {}
                return newWindow;
            } catch (e) {
                return false;
            }
        },

        _openTabup: function(url) {
            return this._windowOpen(url);
        },

        _openTabunder: function(url) {
            if (this.cap.tabunder === 0) { // Verificar capacidad específica de tabunder
                return this._openTabup(url);
            }
            this._cookieLockSet(false); // Desbloquear cookie
            const newTab = this._openTabup(document.location.href); // Abrir página actual
            if (!newTab) {
                return false;
            }
            this.ti = setInterval(function() {
                if (newTab) {
                    try {
                        document.location.replace(url); // Redirigir la página original a la URL del anuncio
                    } catch (e) {
                        clearInterval(this.ti);
                    }
                }
            }.bind(this), 100);
            return true;
        },

        _getOptString: function() { // Cadena de opciones para características de window.open
            const width = window.outerWidth === 0 ? 99999 : window.outerWidth || screen.width;
            const height = window.outerHeight === 0 ? 99999 : window.outerHeight || screen.height;
            return `top=${window.screenY || 0},left=${window.screenX || 0},width=${width},height=${height},status=0,location=1,toolbar=1,menubar=1,resizable=1,scrollbars=1`;
        },

        _openPopup: function(url) {
            return this._windowOpen(url, this._getOptString());
        },

        _openPopunderSafari: function(url) {
            function createHiddenIframeAndOpen(targetUrl, name, options) {
                const hiddenIframe = document.createElement("iframe");
                hiddenIframe.style.display = "none";
                document.body.appendChild(hiddenIframe);

                const script = hiddenIframe.contentWindow.document.createElement("script");
                script.type = "text/javascript";
                script.innerHTML = `
                    window.parent = window.top = window.frameElement = null;
                    window.mkp = function(url, name, opts) {
                        var popWin = window.open(url, name, opts);
                        try { popWin.opener = null } catch (e) {}
                        return popWin;
                    };
                `;
                hiddenIframe.contentWindow.document.body.appendChild(script);

                const popWindow = hiddenIframe.contentWindow.mkp(targetUrl, name, options);
                document.body.removeChild(hiddenIframe);
                return popWindow;
            }

            window.name = "" + Math.random(); // Establecer un nombre aleatorio para la ventana actual
            const adWindow = createHiddenIframeAndOpen(url, "" + Math.random(), this._getOptString());
            createHiddenIframeAndOpen("", window.name, ""); // Abrir otra ventana para desenfocar la principal (truco común de popunder en Safari)
            window.name = null; // Borrar el nombre
            return adWindow;
        },

        _openPopunderBlur: function(url) {
            const adWindow = this._openPopup(url);
            try {
                document.focus();
            } catch (e) {}
            try {
                window.focus();
            } catch (e) {}
            try {
                adWindow.blur(); // Intentar desenfocar el popunder
            } catch (e) {}
            return adWindow;
        },

        _openPopunderFF: function(url) { // Popunder específico de Firefox
            let newWindow;
            setTimeout(function() {
                newWindow = this._openPopup(url);
                if (url === "about:blank") {
                    this.prepop = newWindow;
                }
            }.bind(this), 0);
            setTimeout(function() {
                const selfWindow = window.open("about:blank", "_self"); // Abrir una nueva pestaña y luego cerrarla o enfocar la original
                if (selfWindow && !selfWindow.closed) {
                    selfWindow.focus();
                }
            }, 0);
            return true;
        },

        _getPopunderCRResident: function(durationMs) { // HTML de Popunder Residente de Chrome
            const screenWidth = screen.width;
            const screenHeight = screen.height;
            return `<body>
                <script>
                s1i=0;s2i=0;dc=0;focuscount=0;
                window.resizeTo(20,20);
                function posred(){window.resizeTo(1,1);if (window.screenY>100) window.moveTo(0,0); else window.moveBy(${screenWidth},${screenHeight})};
                function dance(){dc++;if (dc<3) return !1;if (s1i==0 ){s1i=window.setInterval(function(){ posred(); }, 50);}posred();window.clearInterval(s2i);document.onmousemove=null;};
                document.onmousemove=dance;
                function phash(){return window.screenX+','+window.screenY+','+window.outerWidth+','+window.outerHeight};
                phashc=phash();s2i=setInterval(function(){if (phashc!=phash()) {dance();phashc=phash()}; },100);
                var deploy=function()
                {
                    dc=0;window.clearInterval(s1i);window.clearInterval(s2i);document.onmousemove=null;
                    window.moveTo(0,0);
                    window.resizeTo(${screenWidth},${screenHeight});
                    if (window.name.match(/^https?:\\/\\//)) { window.location.replace(window.name); } else {window.name='ready';}
                };
                window.onblur=deploy;
                window.onfocus=function(){window.focuscount=1};
                setTimeout(function(){if (window.focuscount==0) deploy();}, 1000);
                setTimeout(function(){if (window.name.match(/^https?:\\/\\//)) deploy();}, ${durationMs})
                </script>`;
        },

        _getPopunderCROptionsString: function() {
            let width = screen.width;
            let topOffset = 0;
            // Ajustes para IE y Firefox
            if (window.MSInputMethodContext && document.documentMode) {
                width -= 200;
                topOffset -= 200;
            } else if (navigator.userAgent.toLowerCase().indexOf("firefox") !== -1) {
                width -= 50;
            }
            return `popup=1,top=${topOffset},left=${width},width=5,height=5`;
        },

        _openPopunderCRPre: function(timeout) { // Pre-apertura de Popunder Residente de Chrome
            if (this.crpopsemaphore) return false;
            this.crpopsemaphore = true;
            const residentHtml = this._getPopunderCRResident(timeout);
            let newWindow;
            try {
                newWindow = this.iframewin.open("about:blank", "", this._getPopunderCROptionsString());
            } catch (e) {
                this.crpopsemaphore = false;
                return false;
            }
            if (this.settings.openernull) {
                try {
                    newWindow.opener = null;
                } catch (e) {}
            }
            try {
                newWindow.document.open();
                newWindow.document.write(residentHtml);
                newWindow.document.close();
            } catch (e) {
                this.crpopsemaphore = false;
                return false;
            }
            this.crpopsemaphore = false;
            return newWindow;
        },

        _openPopunderCRPost: function(url) { // Post-apertura de Popunder Residente de Chrome (redirección)
            if (this.prepop.name === "ready") {
                this.prepop.location.replace(url);
            } else {
                this.prepop.name = url;
            }
        },

        _getMinipopStatus: function(miniPopWindow) {
            if (!miniPopWindow || miniPopWindow.closed || !miniPopWindow.location) return "closed";
            try {
                const name = miniPopWindow.name;
                if (name === "error") return "success"; // Esto parece ser un indicador interno específico
                if (name === "") return "waiting";
                if (name === "ready") return "prepopready";
                return "redirecting";
            } catch (e) {
                return "error";
            }
        },

        _openPopunderCR: function(url, timeout) { // Popunder Residente de Chrome
            if (this.crpopsemaphore) return false;
            this.crpopsemaphore = true;
            const residentHtml = this._getPopunderCRResident(timeout);
            let newWindow;
            try {
                newWindow = this.iframewin.open("about:blank", url, this._getPopunderCROptionsString());
            } catch (e) {
                this.crpopsemaphore = false;
                return false;
            }
            if (this.settings.openernull) {
                try {
                    newWindow.opener = null;
                } catch (e) {}
            }
            try {
                newWindow.document.open();
                newWindow.document.write(residentHtml);
                newWindow.document.close();
            } catch (e) {
                this.crpopsemaphore = false;
                return false;
            }
            this.crpopsemaphore = false;
            return newWindow;
        },

        _openPopunderIE11: function(url) { // Popunder específico de IE11
            this.tw = this._openPopup(url); // 'tw' parece ser una referencia a una ventana temporal
            if (this.focusInterval) {
                clearInterval(this.focusInterval);
            }
            this.runs = 0;
            this.focusInterval = setInterval(function() {
                try {
                    if (this.tw) {
                        this.tw.blur();
                        if (this.tw.opener) this.tw.opener.focus();
                        window.self.focus();
                        window.focus();
                        document.focus();
                    }
                } catch (e) {}
                this.runs++;
                if (this.runs > 10 && this.focusInterval) {
                    clearInterval(this.focusInterval);
                }
            }.bind(this), 100);
            return this.tw;
        },

        _detectBrowser: function() {
            let os, browser, version;
            const userAgent = navigator.userAgent;
            let device = "desktop";
            let browserFamily = "chromium";
            let browserVersion = 100;

            let match;
            if (match = userAgent.match(/^Mozilla\/5\.0 \([^\)]+\) AppleWebKit\/[0-9\.]+ \(KHTML, like Gecko\) Chrome\/([0-9]+)[0-9\.]+ Safari\/[0-9\.]+$/)) {
                browserFamily = "chrome";
                browserVersion = match[1];
            }
            if (match = userAgent.match(/(Firefox|OPR|Edge?)\/([0-9]+)/)) {
                browserFamily = match[1].toLowerCase();
                browserVersion = match[2];
            }
            if (match = userAgent.match(/rv:([0-9]+)\.0\) like Gecko/)) {
                browserFamily = "msie";
                browserVersion = match[1];
            }
            if (match = userAgent.match(/MSIE ([0-9]+)/)) {
                browserFamily = "msie";
                browserVersion = match[1];
            }
            if (userAgent.match(/Windows NT/)) {
                os = "windows";
            }
            if (match = userAgent.match(/([0-9]+)(_([0-9]+)){0,} like Mac OS X/)) {
                os = "ios";
                browserFamily = "safari";
                browserVersion = match[1];
                device = "mobile";
            }
            if (match = userAgent.match(/(CrOS)\/([0-9]+)/)) {
                browserFamily = "chrome";
                browserVersion = match[2];
            }
            if (match = userAgent.match(/\(KHTML, like Gecko\) Version\/([0-9]+)/)) {
                browserFamily = "safari";
                browserVersion = match[1];
            }
            if (userAgent.match(/Macintosh; Intel Mac OS X /)) {
                os = "macosx";
            }
            if (userAgent.match(/Android|like Mac OS X|Mobile|Phone|Tablet/)) {
                device = "mobile";
            }
            if (userAgent.match(/^Mozilla\/5\.0 \(Linux; Android/)) {
                os = "android";
            }

            if (browserFamily === "edg") browserFamily = "edge";
            if (browserFamily === "edge" && browserVersion > 50) browserFamily = "chromium";
            if (browserFamily === "opr") browserFamily = "chromium"; // Opera

            if (os === "macosx" && navigator.maxTouchPoints > 0) {
                os = "ios";
                browserFamily = "safari";
                device = "mobile";
            }
            if (navigator.userAgent.startsWith("Mozilla/5.0 (X11; Linux x86_64)") &&
                !navigator.platform.includes("84_64") &&
                navigator.maxTouchPoints >= 2) {
                os = "android";
                browserFamily = "chrome";
                device = "mobile";
            }

            const isInIframe = (window != window.top);
            const isCrossOriginReferrer = (document.referrer.startsWith(window.location.origin) === false && !isInIframe);

            return {
                os: os,
                browser: browserFamily,
                version: browserVersion,
                device: device,
                isInIframe: isInIframe,
                isCrossOriginReferrer: isCrossOriginReferrer
            };
        },

        _getBrowserCapabilities: function() {
            const env = this._detectBrowser();
            let canPopup = true;
            let canPopunder = false;
            let canTabunder = true; // Renombrado de 'e'
            let punderminipop = false; // Renombrado del original 'punderminipop'
            const isCrossOriginReferrer = env.isCrossOriginReferrer; // Renombrado de 'g'

            if (env.device === "desktop") {
                if (env.browser === "chrome" || env.browser === "firefox" || env.browser === "msie" || env.browser === "safari" || env.browser === "chromium") {
                    canPopunder = true;
                }
            } else {
                canPopup = canPopunder = canTabunder = false;
            }

            if (env.isInIframe === 1) {
                canTabunder = false;
            }

            // Capacidad específica de mini-popunder del navegador
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
                bbr: isCrossOriginReferrer // Capacidad de redirección de botón de retroceso
            };
        },

        _openPopunder: function(url, crTimeout) {
            const browserEnv = this.cap.env;
            if (browserEnv.device === "desktop") {
                if (this.cap.punderminipop) {
                    const openedWindow = this._openPopunderCR(url, crTimeout);
                    if (openedWindow) {
                        this.minipopmon = true;
                    }
                    return openedWindow;
                }
                if (browserEnv.browser === "firefox") {
                    return this._openPopunderFF(url);
                }
                if (browserEnv.browser === "msie" && browserEnv.version < 11) {
                    return this._openPopunderBlur(url);
                }
                if (browserEnv.browser === "msie" && browserEnv.version === 11) {
                    return this._openPopunderIE11(url);
                }
                if (browserEnv.browser === "safari") {
                    return this._openPopunderSafari(url);
                }
                // Popunder de escritorio por defecto
                return this._openPopup(url);
            }
            // Fallback para móvil
            return this._openTabup(url);
        },

        _prepopOpen: function(crTimeout) {
            this.prepop = this.cap.punderminipop ? this._openPopunderCRPre(crTimeout) : this._openPopunder("about:blank");
        },

        _prepopReady: function() {
            return !!(this.prepop && !this.prepop.closed && this.prepop.location);
        },

        _prepopUse: function(url, options) {
            let finalUrl = url;
            if (options.onbeforeopen instanceof Function) {
                finalUrl = options.onbeforeopen(url);
            } else if (this.settings.onbeforeopen instanceof Function) {
                finalUrl = this.settings.onbeforeopen(url);
            }

            try {
                if (this.cap.punderminipop) {
                    this._openPopunderCRPost(finalUrl);
                } else {
                    this.prepop.location.replace(finalUrl);
                }
                this.prepop = 0; // Limpiar referencia prepop
            } catch (e) {
                return 0; // Falló el uso de prepop
            }

            try {
                if (options.onafteropen instanceof Function) {
                    options.onafteropen(finalUrl);
                } else if (this.settings.onafteropen instanceof Function) {
                    this.settings.onafteropen(finalUrl);
                }
            } catch (e) {}
            return 1; // Éxito
        },

        _prepopClose: function() {
            try {
                this.prepop.close();
            } catch (e) {
                return false;
            }
            return true;
        },

        // --- NUEVA FUNCIÓN: _openAdDirectly (abre el anuncio sin el modal) ---
        _openAdDirectly: function(url, options) {
            if (this.openadsemaphore) return false;
            this.openadsemaphore = true;

            let finalUrl = url;
            if (options.onbeforeopen instanceof Function) {
                finalUrl = options.onbeforeopen(url);
            } else if (this.settings.onbeforeopen instanceof Function) {
                finalUrl = this.settings.onbeforeopen(url);
            }

            let adType = options.type;
            // Tipos de anuncio de respaldo basados en las capacidades
            if (adType === "popunder" && !this.cap.popunder) adType = "tabunder";
            if (adType === "tabunder" && !this.cap.tabunder) adType = "tabup";
            if (adType === "tabup" && !this.cap.tabup) adType = "popup";
            if (adType === "popup" && !this.cap.popup) adType = "tabup";

            let openedAdWindow;
            if (adType === "popunder") {
                openedAdWindow = this._openPopunder(finalUrl, options.crtimeout || this.settings.crtimeout);
            } else if (adType === "popup") {
                openedAdWindow = this._openPopup(finalUrl);
            } else if (adType === "tabup") {
                openedAdWindow = this._openTabup(finalUrl);
            } else if (adType === "tabunder") {
                openedAdWindow = this._openTabunder(finalUrl);
            }

            if (openedAdWindow !== false) {
                try {
                    if (options.onafteropen instanceof Function) {
                        options.onafteropen(finalUrl);
                    } else if (this.settings.onafteropen instanceof Function) {
                        this.settings.onafteropen(finalUrl);
                    }
                } catch (e) {}
            }
            this.openadsemaphore = false;
            return openedAdWindow;
        },

        // --- MODIFICACIÓN: _openAd ahora abre el modal de pre-apertura ---
        _openAd: function(url, options) {
            // Llama al modal de pre-apertura
            openPreloadModal(url, options.type);
            return true; // Asume que el modal se abre exitosamente
        },

        abortPop: function() {
            if (this._prepopReady()) {
                this._prepopClose();
            }
            this._removeCatchAllDiv();
            this.clearUrls();
            this.settings.prepop = false;
        },

        _minipopCheck: function(startInterval) {
            if (this.minipopmon) {
                const status = this._getMinipopStatus(this.minipopmontw);
                if (status === "prepopready" || status === "success" || status === "redirecting") {
                    if (status === "redirecting" || status === "success") {
                        this.urls.shift(); // Eliminar URL actual si es exitosa/redirigida
                        this.minipopmon = false;
                    }
                } else if (status === "closed") {
                    this.minipopmon = false;
                }
                if (startInterval) {
                    setInterval(this._minipopCheck.bind(this), 100, true);
                }
            }
        },

        _onExecute: function(event) {
            event = event || window.event;
            // Prevenir la ejecución en clic central
            if (event.type === "click") {
                let isMiddleClick = false;
                if ("which" in event) {
                    isMiddleClick = (event.which === 3);
                } else if ("button" in event) {
                    isMiddleClick = (event.button === 2);
                }
                if (isMiddleClick) return false;
            }

            // Manejar redirección de botón de retroceso (BBR)
            if (this.bbrhooked && event.type === "popstate") {
                let bbrEntry = this.bbrurl;
                if (!bbrEntry) { // Si no hay una URL BBR específica, buscar en las URLs actuales
                    for (let i = 0; i < this.urls.length; i++) {
                        if (this.urls[i].options.bbr) {
                            bbrEntry = this.urls[i];
                            break;
                        }
                    }
                }
                if (!bbrEntry) { // Si aún no hay URL BBR, deshabilitar el gancho y retroceder
                    this.bbrhooked = false;
                    history.go(-1);
                    return false;
                }
                // Ejecutar BBR
                this._prepopReady() && this._prepopClose();
                let bbrUrl = bbrEntry.url;
                if (bbrEntry.options.onbeforeopen instanceof Function) {
                    bbrUrl = bbrEntry.options.onbeforeopen(bbrUrl);
                } else if (this.settings.onbeforeopen instanceof Function) {
                    bbrUrl = this.settings.onbeforeopen(bbrUrl);
                }
                window.top.location.replace(bbrUrl);
                return true;
            }

            // Verificación de la API de Activación de Usuario (para bloqueo de ventanas emergentes en Chrome/Firefox)
            try {
                if (this.userActivation && this.settings.catchalldiv !== "extreme" &&
                    !window.navigator.userActivation.isActive &&
                    !this.iframewin.navigator.userActivation.isActive) {
                    this.settings.catchalldiv = "never";
                    this._removeCatchAllDiv();
                    return false;
                }
            } catch (e) {}

            this._minipopCheck(false); // Verificar estado de minipop sin iniciar nuevo intervalo

            // Si la ventana minipop está esperando o lista, no hacer nada
            if (this.minipopmontw && (this._getMinipopStatus(this.minipopmontw) === "waiting" || this._getMinipopStatus(this.minipopmontw) === "prepopready")) {
                return false;
            }

            // Si no hay URLs y prepop habilitado, intentar abrir la ventana prepop
            if (this.urls.length === 0 && this.settings.prepop && !this._prepopReady()) {
                this.settings.prepop = false; // Deshabilitar intentos posteriores de prepop
                this._prepopOpen(this.settings.crtimeout);
                this._unblockWindowOpen();
                this._removeCatchAllDiv();
            }

            // Si aún no hay URLs, salir
            if (this.urls.length === 0) return false;

            // Lógica principal de apertura de anuncios
            this.settings.prepop = false; // Restablecer la configuración de prepop
            const currentAd = this.urls[0];
            this.minipopmon = false; // Restablecer el monitoreo de minipop

            // --- CAMBIO CLAVE: Usa _openAd (que ahora abre el modal) ---
            const openedAd = this._openAd(currentAd.url, currentAd.options);

            if (!openedAd) {
                if (this.settings.catchalldiv !== "extreme") {
                    this.settings.catchalldiv = "never";
                    this._removeCatchAllDiv();
                } else if (event.type !== "uah") { // 'uah' parece ser el Controlador de Activación de Usuario
                    this._addWarningToCatchAllDiv();
                }
            }

            // La lógica posterior a la apertura (eliminación de URL de la cola, etc.)
            // debe ejecutarse después de que el usuario haga clic en "Continuar" en el modal.
            // Para simplificar, la movemos a _openAdDirectly, pero aquí asumimos
            // que _openAd (el modal) siempre tiene éxito al "abrirse".
            // Sin embargo, la lógica de `this.urls.shift()` y `clearInterval`
            // debe ocurrir SÓLO cuando el anuncio real se abre, NO cuando el modal lo hace.
            // Esto requiere una refactorización más profunda para manejar la cola de forma asíncrona
            // o pasar la referencia al modal. Por ahora, si `_openAd` devuelve `true` (modal abierto),
            // la URL se mantiene en la cola hasta que el usuario la confirme.
            // Esto es crucial para la lógica de "mostrar la URL antes de abrir".

            // Originalmente:
            // if (this.minipopmon) { ... } else if (openedAd || this.settings.ignorefailure) { ... }
            // Ahora, la URL se elimina de la cola solo después de que el usuario confirma en el modal.
            // Esto se manejará en `_openAdDirectly` después del `confirmButton.onclick`.
        },

        _userActivationHandler: function() {
            let isActive = false;
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
            // Si el elemento activo es un IFRAME, considerar la activación como falsa
            if (document.activeElement && document.activeElement.tagName === "IFRAME") {
                isActive = false;
            }

            if (isActive) {
                this._onExecute({
                    type: "uah"
                });
            }
        },

        _onMouseDownHandler: function(event) {
            const targetElement = event.target || event.srcElement || event.toElement;
            if (this._prepopReady()) return false; // No interferir si prepop está listo
            if (this.minipopmontw) {
                const status = this._getMinipopStatus(this.minipopmontw);
                if (status === "waiting" || status === "prepopready") return false;
            }
            // Si el elemento clicado es una etiqueta A y hay URLs
            if (targetElement.tagName === "A" && this.urls.length > 0) {
                // Si el objetivo del enlace es _blank o el objetivo base es _blank
                if (targetElement.target === "_blank" || (document.getElementsByTagName("BASE").length > 0 && (document.getElementsByTagName("BASE")[0].target || "").toLowerCase() === "_blank")) {
                    targetElement.popjsoriginalhref = targetElement.href; // Almacenar href original
                    targetElement.href = "#"; // Prevenir navegación por defecto
                    targetElement.target = ""; // Limpiar objetivo
                }
            }
            return false;
        },

        _onMouseUpHandler: function(event) {
            const targetElement = event.target || event.srcElement || event.toElement;
            // Restaurar el href original si fue modificado
            if (targetElement.popjsoriginalhref) {
                setTimeout(function() {
                    targetElement.href = targetElement.popjsoriginalhref;
                    delete targetElement.popjsoriginalhref;
                    targetElement.target = "_blank";
                }, 100);
            }
        },

        _onBeforeUnloadHandler: function() {
            if (this._prepopReady()) {
                this._prepopClose();
            }
        },

        _isCatchAllNeeded: function() {
            if (this.catchalldiv || this.settings.catchalldiv === "never" || this.urls.length === 0) {
                return false;
            }
            if (this.settings.catchalldiv === "always" || this.settings.catchalldiv === "extreme") {
                return true;
            }
            // Comprobar si hay iframes grandes
            const iframes = document.getElementsByTagName("IFRAME");
            for (let i = 0; i < iframes.length; i++) {
                if ((iframes.item(i).clientHeight || iframes.item(i).offsetHeight || 0) > 100 ||
                    (iframes.item(i).clientWidth || iframes.item(i).offsetWidth || 0) > 100) {
                    return true;
                }
            }
            return false;
        },

        _removeCatchAllDiv: function() {
            if (this.catchallmon) { // Si el intervalo de monitoreo está activo
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
            const div = document.createElement("div");
            div.style = `
                text-align:center;
                padding-top:48vh;
                font-size:4vw;
                position:fixed;
                display:block;
                width:100%;
                height:100%;
                top:0;
                left:0;
                right:0;
                bottom:0;
                background-color:rgba(0,0,0,0);
                z-index:300000;
            `;
            if (document.addEventListener) {
                if (this.cap.env.os === "ios") div.addEventListener("touchend", this._onExecute.bind(this));
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
            if (!this.catchalldiv) { // Si el div catch-all no existe
                if (this._isCatchAllNeeded()) {
                    this._createCatchAllDiv();
                }
                if (!this.catchallmon) { // Iniciar monitoreo si aún no está
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
            this.catchalldiv.innerText = "Acceso bloqueado debido a un bloqueador de ventanas emergentes.\nDesactive el bloqueador de ventanas emergentes y haga clic en cualquier lugar para acceder al contenido.";
            return true;
        },

        _blockWindowOpen: function() {
            if (this.windowopenblocked) return false;
            this.windowopenblocked = true;
            // Proxy window.open para devolver la ventana de un iframe ficticio
            window.open = new Proxy(window.open, {
                apply(target, thisArg, argumentsList) {
                    const iframe = document.createElement("iframe");
                    iframe.src = "javascript:false";
                    iframe.style.display = "none";
                    iframe.width = "0";
                    iframe.height = "0";
                    const firstScript = document.getElementsByTagName("script")[0];
                    if (firstScript && firstScript.parentNode) {
                        firstScript.parentNode.insertBefore(iframe, firstScript);
                    } else {
                        document.body.appendChild(iframe); // Fallback
                    }
                    return iframe.contentWindow || iframe;
                }
            });
            return true;
        },

        _unblockWindowOpen: function() {
            if (!this.windowopenblocked) return false;
            this.windowopenblocked = false;
            window.open = this.originalwindowopen; // Restaurar window.open original
            return true;
        },

        init: function(config) {
            if (this._cookieLockGet()) return false;

            // Crear un iframe oculto para las llamadas a window.open para evitar ciertas restricciones del navegador
            const iframe = document.createElement("iframe");
            iframe.src = "javascript:false";
            iframe.style.display = "none";
            iframe.width = "0";
            iframe.height = "0";
            const firstScript = document.getElementsByTagName("script")[0];
            if (firstScript && firstScript.parentNode) {
                firstScript.parentNode.insertBefore(iframe, firstScript);
            } else {
                document.body.appendChild(iframe); // Fallback
            }
            this.iframewin = iframe.contentWindow || iframe;
            this.originalwindowopen = this.iframewin.open; // Almacenar window.open original del iframe

            // Verificar soporte de la API de Activación de Usuario
            this.userActivation = true;
            try {
                if (!this.iframewin.navigator.userActivation.isActive) {
                    // Esta verificación es parte de la "la activación de usuario es compatible y activa" inicial
                }
            } catch (e) {
                this.userActivation = false;
            }

            this.cap = this._getBrowserCapabilities();
            this.urls = [];
            this.bbrurl = false;
            this.settings = {};

            // Aplicar configuraciones
            this.settings.prepop = (config.prepop || false) && this.cap.popunder;
            this.settings.crtimeout = config.crtimeout || 60 * 1000; // 60 segundos
            this.settings.targetblankhandler = config.targetblankhandler || true;
            this.settings.onbeforeopen = config.onbeforeopen;
            this.settings.onafteropen = config.onafteropen;
            this.settings.ignorefailure = config.ignorefailure || false;
            this.settings.catchalldiv = config.catchalldiv || "auto";

            // Si la API de Activación de Usuario no es compatible, forzar catch-all-div a "always"
            if (!this.userActivation) {
                this.settings.catchalldiv = "always";
            }

            // Desplegar catch-all div si no es "never"
            if (this.settings.catchalldiv !== "never") {
                window.addEventListener("load", this._deployCatchAll.bind(this), true);
                setInterval(this._deployCatchAll.bind(this), 200);
                this._deployCatchAll(); // Despliegue inicial
            }

            this.bbrhooked = false;
            this.minipopmon = false;
            this.settings.openernull = true; // Prevenir que la nueva ventana acceda a su opener

            if (this.settings.prepop) {
                this._blockWindowOpen(); // Bloquear llamadas directas a window.open si prepop está habilitado
            }

            // Configurar el temporizador del Controlador de Activación de Usuario si es compatible
            this.uahtimer = this.userActivation ? setInterval(this._userActivationHandler.bind(this), 50) : 0;

            // Añadir escuchadores de eventos a la ventana principal
            if (window.addEventListener) {
                window.addEventListener("touchend", this._onExecute.bind(this), true);
                window.addEventListener("click", this._onExecute.bind(this), true);
                if (this.cap.bbr) window.addEventListener("popstate", this._onExecute.bind(this), true);
                if (this.settings.targetblankhandler) {
                    window.addEventListener("mousedown", this._onMouseDownHandler.bind(this), true);
                    window.addEventListener("mouseup", this._onMouseUpHandler.bind(this), true);
                }
                if (this.settings.prepop) window.addEventListener("beforeunload", this._onBeforeUnloadHandler.bind(this), true);
            } else { // Fallback para IE más antiguos
                window.attachEvent("onclick", this._onExecute.bind(this));
                if (this.cap.bbr) window.attachEvent("onpopstate", this._onExecute.bind(this));
                if (this.settings.targetblankhandler) {
                    window.attachEvent("onmousedown", this._onMouseDownHandler.bind(this));
                    window.attachEvent("onmouseup", this._onMouseUpHandler.bind(this));
                }
                if (this.settings.prepop) window.attachEvent("onbeforeunload", this._onBeforeUnloadHandler.bind(this));
            }

            // Añadir escuchadores de eventos a la ventana del iframe oculto
            if (this.iframewin.addEventListener) {
                this.iframewin.addEventListener("touchend", this._onExecute.bind(this), true);
                this.iframewin.addEventListener("click", this._onExecute.bind(this), true);
                if (this.settings.targetblankhandler) this.iframewin.addEventListener("mousedown", this._onMouseDownHandler.bind(this), true);
                if (this.settings.prepop) this.iframewin.addEventListener("beforeunload", this._onBeforeUnloadHandler.bind(this), true);
            } else { // Fallback para IE más antiguos
                this.iframewin.attachEvent("onclick", this._onExecute.bind(this));
                if (this.settings.targetblankhandler) this.iframewin.attachEvent("onmousedown", this._onMouseDownHandler.bind(this));
                if (this.settings.prepop) this.iframewin.attachEvent("onbeforeunload", this._onBeforeUnloadHandler.bind(this));
            }
        },

        _hookBackButton: function() {
            if (document.readyState === "complete") {
                if (!this.bbrhooked) {
                    window.history.pushState({}, "", null); // Añadir una entrada al historial
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

            if (options.type === "bbr") {
                if (!this.cap.bbr) return false;
                if (!this.bbrhooked) this._hookBackButton();
                this.bbrurl = {
                    url: url,
                    options: options
                };
                return true;
            }

            // Iniciar el Controlador de Activación de Usuario si no está ya en ejecución y es necesario
            if (this.userActivation && this.uahtimer === 0) {
                this.uahtimer = setInterval(this._userActivationHandler.bind(this), 50);
            }

            let usedPrepop = false;
            if (this._prepopReady()) {
                if (options.type === "popunder") {
                    if (this._prepopUse(url, options)) {
                        usedPrepop = true;
                    }
                } else {
                    this._prepopClose();
                }
            }

            if (!usedPrepop && !this.settings.ignorefailure) {
                this._blockWindowOpen();
                this._deployCatchAll();
            }
            this.urls.push({
                url: url,
                options: options
            });
            return true;
        }
    };

    // --- Utilidad Base64 (H) ---
    const Base64 = { // Renombrado del original 'H'
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function(input) {
            let output = "";
            let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            let i = 0;
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
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },

        decode: function(input) {
            let output = "";
            let chr1, chr2, chr3;
            let enc1, enc2, enc3, enc4;
            let i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/=]/g, "");
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
            return Base64._utf8_decode(output);
        },

        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            let utftext = "";
            for (let n = 0; n < string.length; n++) {
                const c = string.charCodeAt(n);
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
            let string = "";
            let i = 0;
            let c = 0,
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

    // --- Detect Zoom (detectZoom) ---
    // (Esta parte es una librería de terceros, se deja en gran parte tal cual para mantener la integridad)
    (function(global, moduleName, factory) {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = factory(moduleName, global);
        } else if (typeof define === "function" && define.amd) {
            define("detect-zoom", function() {
                return factory(moduleName, global);
            });
        } else {
            global[moduleName] = factory(moduleName, global);
        }
    })(window, "detectZoom", function() {
        const getDevicePixelRatio = function() {
            return window.devicePixelRatio || 1;
        };
        const defaultReturn = function() {
            return {
                zoom: 1,
                devicePxPerCssPx: 1
            };
        };
        const viaScreenDPI = function() { // Para IE (screen.deviceXDPI / screen.logicalXDPI)
            const zoom = Math.round(screen.deviceXDPI / screen.logicalXDPI * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaOffsetHeight = function() { // Para navegadores que permiten la comprobación de offsetHeight en relación con innerHeight
            const zoom = Math.round(document.documentElement.offsetHeight / window.innerHeight * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaOuterInnerWidth = function() { // Para navegadores que permiten la comprobación de outerWidth / innerWidth
            const zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaClientWidth = function() { // Para Safari y Webkit antiguos
            const zoom = Math.round(document.documentElement.clientWidth / window.innerWidth * 100) / 100;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaOrientation = function() { // Para móviles con cambios de orientación
            const zoom = (Math.abs(window.orientation) === 90 ? screen.height : screen.width) / window.innerWidth;
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaFontHeight = function() { // Fallback para Webkit text-size-adjust
            const div = document.createElement("div");
            div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
            div.setAttribute("style", "font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;".replace(/;/g, " !important;"));

            const wrapper = document.createElement("div");
            wrapper.setAttribute("style", "width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;".replace(/;/g, " !important;"));
            wrapper.appendChild(div);
            document.body.appendChild(wrapper);

            let zoom = 1000 / div.clientHeight;
            zoom = Math.round(100 * zoom) / 100;
            document.body.removeChild(wrapper);
            return {
                zoom: zoom,
                devicePxPerCssPx: zoom * getDevicePixelRatio()
            };
        };
        const viaMozDevicePixelRatio = function() { // Para Firefox (min--moz-device-pixel-ratio)
            const binarySearch = function(k, n, v, w, y, U) {
                function innerSearch(z, M, N) {
                    const I = (z + M) / 2;
                    return N <= 0 || M - z < U ? I : (window.matchMedia("(" + k + ":" + I + n + ")").matches ? innerSearch(I, M, N - 1) : innerSearch(z, I, N - 1));
                }
                let mqChecker, styleEl, testDiv;

                if (window.matchMedia) {
                    mqChecker = window.matchMedia;
                } else {
                    const head = document.getElementsByTagName("head")[0];
                    styleEl = document.createElement("style");
                    head.appendChild(styleEl);
                    testDiv = document.createElement("div");
                    testDiv.className = "mediaQueryBinarySearch";
                    testDiv.style.display = "none";
                    document.body.appendChild(testDiv);
                    mqChecker = function(z) {
                        styleEl.sheet.insertRule("@media " + z + "{.mediaQueryBinarySearch {text-decoration: underline} }", 0);
                        const matches = getComputedStyle(testDiv, null).textDecoration === "underline";
                        styleEl.sheet.deleteRule(0);
                        return {
                            matches: matches
                        };
                    };
                }
                v = innerSearch(v, w, y);
                if (testDiv) {
                    head.removeChild(styleEl);
                    document.body.removeChild(testDiv);
                }
            }
        });
    }

    "use strict";

    // --- Módulo Principal de Publicidad (J) ---
    // Estas cadenas se utilizan para identificar elementos o rutas
    let endpointPath = "/c"; // Q -> endpointPath
    let popConfigVar = "_pop"; // R -> popConfigVar (encontrado por heurística)
    let paoVar = "_pao"; // E -> paoVar (generado o usado desde la configuración)

    // Asignar utilidad Base64 a window.Base64 si está disponible
    if (window.Base64) {
        // Esta línea parece problemática, reasigna H (Base64) a window.Base64 pero H está definido arriba.
        // Se mantiene el comportamiento original pero se anota la posible confusión.
        // Original: H=d.Base64;
        // Corregido para mayor claridad asumiendo la intención de acceso global:
        // window.Base64 = Base64; // Usar nuestro Base64 definido
    }


    // `V` es document.currentScript, `F` es un ID de temporizador para el reintento de adscore
    const currentScript = document.currentScript;
    let adscoreRetryTimerId = null;

    // --- Inventario y Configuración de Anuncios (J) ---
    const adInventoryManager = { // Renombrado del original 'J'
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
            _prepop: (r._get("_popprepop") === null), // true si no hay cookie "_popprepop"
            _adscorebp: null,
            _adscorept: null,
            _adscoreak: "QpUJAAAAAAAAGu98Hdz1l_lcSZ2rY60Ajjk9U1c" // Clave API de Adscore
        },
        adfired: false,
        _lastci: 0, // Última vez que se verificó el inventario

        _init: function() {
            const self = this;
            this._loadConfig();
            this.adfired = false; // Bandera para rastrear si se ha disparado un anuncio
            adManager.init({
                prepop: this._config._prepop && this._isDelayBetweenExpired(),
                catchalldiv: this._config._useOverlay,
                onafteropen: function() {
                    self.adfired = true;
                    self._updateFiredCount();
                }
            });
            this._adscoreDeploy();

            // Escuchar cambios de visibilidad para desplegar adscore si aún no se ha disparado
            if (document.hidden) {
                document.addEventListener("visibilitychange", function() {
                    if (!self.adfired && !document.hidden) {
                        self._adscoreDeploy();
                    }
                });
            }

            // Comprobar periódicamente si se ha abierto un pop-up externamente y volver a desplegar adscore
            setInterval(function() {
                if (!self.adfired && self._getLastOpenAt() > self._lastci) {
                    self._adscoreDeploy();
                }
            }, 1000);
        },

        _adscoreDeploy: function() {
            const self = this;
            let timeoutId = 0;
            const config = this._config;

            if (config._adscorebp) { // Si los datos de adscore ya están presentes (ej. desde una fuente interna)
                self._checkInventory(config._adscorebp);
            } else if (typeof AdscoreInit === "function") { // Si la función AdscoreInit existe globalmente
                try {
                    AdscoreInit(config._adscoreak, {
                        sub_id: config._siteId,
                        callback: function(result) {
                            self._checkInventory(result.signature || "4" + result.error);
                        }
                    });
                } catch (e) {
                    self._checkInventory("4" + e.message); // Error durante la llamada a AdscoreInit
                }
            } else if (document.body) { // Si AdscoreInit no está presente, cargar dinámicamente el script
                const parts = ["re", "adsco"];
                parts.push(parts[1][3]); // añade 'c' a parts
                const adscoreScriptUrl = "https://" + parts.reverse().join(".") + "/"; // construye "https://score.ads.re/"
                const scriptElement = document.createElement("script");
                scriptElement.src = adscoreScriptUrl;
                scriptElement.onerror = function() {
                    if (scriptElement.src === adscoreScriptUrl) {
                        // Fallback a otra URL si la primera falla
                        scriptElement.src = "https://" + Math.round(Math.pow(52292.244664, 2)) + "/a.js"; // Esto calcula un número grande, probablemente un dominio de respaldo ofuscado
                    } else {
                        clearTimeout(timeoutId);
                        self._checkInventory("1"); // Código de error genérico '1' para falla de carga de script
                    }
                };
                scriptElement.onload = function() {
                    clearTimeout(timeoutId);
                    try {
                        AdscoreInit(config._adscoreak, {
                            sub_id: config._siteId,
                            callback: function(result) {
                                self._checkInventory(result.signature || "2" + result.error);
                            }
                        });
                    } catch (e) {
                        self._checkInventory("4" + e.message); // Error después de cargar el script de Adscore
                    }
                };
                document.body.appendChild(scriptElement);
                timeoutId = setTimeout(function() {
                    self._checkInventory("3"); // Código de error por tiempo de espera '3'
                }, 5000); // 5 segundos de tiempo de espera para la carga del script de adscore
            } else { // Si document.body no está listo, reintentar _adscoreDeploy después de un pequeño retraso
                setTimeout(function() {
                    self._adscoreDeploy();
                }, 50);
            }
        },

        _checkInventory: function(adscoreSignature) {
            this._lastci = (new Date()).getTime();
            adManager.clearUrls(); // Borrar URLs de anuncios existentes

            const self = this;
            const config = this._config;

            if (config._adscorept) { // Si existe una función de procesamiento posterior a adscore
                config._adscorept(adscoreSignature);
            }

            try {
                clearTimeout(adscoreRetryTimerId); // Borrar el temporizador de reintento anterior
            } catch (e) {}

            // Establecer un nuevo temporizador de reintento para el despliegue de adscore (ej. cada 5 minutos)
            adscoreRetryTimerId = setTimeout(function() {
                self._adscoreDeploy();
            }, 300000); // 5 minutos

            // Esperar a que document.body esté listo para inyectar el script de inventario
            let checkBodyInterval = setInterval(function() {
                if (document.body) {
                    clearInterval(checkBodyInterval); // Dejar de verificar una vez que el cuerpo esté listo

                    let inventoryUrl = "//serve.popads.net" + endpointPath;
                    const params = {
                        _: encodeURIComponent(adscoreSignature),
                        v: 4,
                        siteId: config._siteId,
                        minBid: config._minBid,
                        popundersPerIP: config._popPerDay + "," + config._inpagePerDay,
                        blockedCountries: config._blockedCountries || "",
                        documentRef: encodeURIComponent(document.referrer),
                        s: self._getScreenData() // Datos de pantalla para segmentación
                    };

                    for (const key in params) {
                        if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
                            inventoryUrl += (inventoryUrl.indexOf("?") === -1 ? "?" : "&") + key + "=" + params[key];
                        }
                    }

                    const inventoryScript = document.createElement("script");
                    inventoryScript.referrerPolicy = "unsafe-url";
                    inventoryScript.src = inventoryUrl;

                    try {
                        inventoryScript.onerror = function() {
                            adManager.abortPop();
                            if (currentScript && currentScript.onerror instanceof Function) {
                                currentScript.onerror(); // Disparar el onerror del script actual si está definido
                            }
                        };
                    } catch (e) {}

                    document.body.appendChild(inventoryScript);
                }
            }, 100);
        },

        _parseFloatingBanner: function(bannerData) {
            if (this._config._inpageDelayPerDay > 0 && this._getFiredCount("inpage") >= this._config._inpageDelayPerDay) {
                return; // No mostrar si se alcanzó el límite diario
            }

            const self = this;
            setTimeout(function() {
                self._updateFiredCount("inpage");
                displayAdWindow(bannerData.url, bannerData.position, bannerData.width, bannerData.height, bannerData.clickurl);
            }.bind(self), this._mSecondsTillDelayExpired("inpage"));
        },

        _parseInventory: function(inventoryData) {
            this._inventory = inventoryData || {};
            this._preparePop();
        },

        _parseBBR: function(bbrData) {
            adManager.addUrl(bbrData.url, {
                type: "bbr",
                onbeforeopen: function(url) {
                    try {
                        clearTimeout(adscoreRetryTimerId);
                    } catch (e) {}
                    return url;
                }.bind(this)
            });
        },

        _preparePopDefault: function() {
            const self = this;
            // Comprobar si el anuncio por defecto está deshabilitado o si se alcanzó el límite diario
            if (this._config._default === false || this._config._default === "" ||
                (this._config._defaultPerDay > 0 && this._getFiredCount("fallback") >= this._config._defaultPerDay)) {
                adManager.abortPop();
                r._set("_popprepop", 1, 21600); // Establecer un bloqueo temporal por 6 horas (21600 segundos)
                return;
            }

            let popunderType = this._config._defaultType; // Usar _defaultType
            if (adManager._prepopReady()) {
                popunderType = "popunder"; // Si prepop está listo, forzar popunder
            }

            if (/^https?:\/\//.test(this._config._default)) { // Si el valor por defecto es una URL directa
                setTimeout(function() {
                    adManager.addUrl(this._config._default, {
                        type: popunderType, // Usar el tipo determinado
                        onbeforeopen: function(url) {
                            try {
                                clearTimeout(adscoreRetryTimerId);
                            } catch (e) {}
                            return url;
                        }.bind(self)
                    });
                }.bind(self), this._mSecondsTillDelayExpired("default", this._config._defaultDelay)); // Usar el retraso por defecto
            } else { // Si el valor por defecto es un script codificado
                this._updateFiredCount("fallback");
                let decodedScript = Base64.decode(this._config._default);
                decodedScript = ("<script>" + decodedScript + "</script>").replace(/^\s*<script[^>]*>|<\/script>\s*$/g, ""); // Limpiar etiquetas de script
                const scriptElement = document.createElement("script");
                scriptElement.type = "text/javascript";
                scriptElement.text = decodedScript;
                document.body.appendChild(scriptElement);
            }
        },

        _preparePopInventory: function() {
            const self = this;
            // Comprobar si se alcanzó el límite diario de pop-ups
            if (this._config._popPerDay > 0 && this._getFiredCount() >= this._config._popPerDay) {
                return;
            }

            setTimeout(function() {
                adManager.addUrl(self._inventory.url, {
                    type: self._inventory.type,
                    bbr: self._inventory.bbr || false,
                    onbeforeopen: function(url) {
                        try {
                            clearTimeout(adscoreRetryTimerId);
                        } catch (e) {}
                        return url + "&s=" + self._getScreenData() + "&v=&m=";
                    }.bind(self)
                });
            }, this._mSecondsTillDelayExpired());
        },

        _getScreenData: function() {
            try {
                const zoomInfo = window.detectZoom.zoom();
                return [
                    screen.width,
                    screen.height,
                    zoomInfo,
                    screen.width * zoomInfo,
                    screen.height * zoomInfo,
                    (window.self !== window.top) ? "1" : "0" // ¿Está en iframe?
                ].join();
            } catch (e) {
                return "";
            }
        },

        _getFiredCount: function(type = "") {
            const counterName = "_popfired" + type;
            const expiryName = counterName + "_expires";

            const expiryTime = t._isAvailable() ? t._get("_spop" + expiryName) : r._get(expiryName);
            let count = 0;

            if (typeof expiryTime === "number") {
                if ((new Date()).getTime() < expiryTime) { // Si el tiempo de caducidad está en el futuro
                    count = t._isAvailable() ? t._get("_spop" + counterName) : r._get(counterName);
                }
                count = parseInt(count, 10) || 0; // Asegurarse de que sea un número
                if (isNaN(count)) count = 0;
            }
            return count;
        },

        _updateFiredCount: function(type = "") {
            const counterName = "_popfired" + type;
            const expiryName = counterName + "_expires";

            let expiryTime = t._isAvailable() ? t._get("_spop" + expiryName) : r._get(expiryName);
            const defaultExpiryMs = 86400000; // 24 horas en milisegundos

            if (typeof expiryTime !== "number") {
                expiryTime = (new Date()).getTime() + defaultExpiryMs;
            }

            // Obtener el recuento actual, restablecer si ha caducado
            let currentCount = ((new Date()).getTime() < expiryTime) ? this._getFiredCount(type) : 0;

            if (t._isAvailable()) {
                t._set("_spop" + counterName, currentCount + 1);
                t._set("_spop" + expiryName, expiryTime);
                t._set("_spoplastOpenAt", (new Date()).getTime());
            } else {
                r._set(counterName, currentCount + 1, new Date(expiryTime)); // Almacenar recuento con fecha completa para cookie
                r._set(expiryName, (new Date(expiryTime)).toUTCString(), (new Date(expiryTime)).getTime()); // Almacenar cadena de caducidad para cookie
                r._set("lastOpenAt", (new Date()).getTime(), 86400); // Almacenar última hora de apertura por 24 horas
            }
        },

        _getLastOpenAt: function(type = "") {
            return t._isAvailable() ? t._get("_spoplastOpenAt") : r._get("lastOpenAt");
        },

        _isDelayBetweenExpired: function(type = "", delaySeconds) {
            return this._mSecondsTillDelayExpired(type, delaySeconds) === 0;
        },

        _mSecondsTillDelayExpired: function(type = "", delaySeconds) {
            const lastOpenAt = this._getLastOpenAt(type);
            if (typeof lastOpenAt !== "string" && typeof lastOpenAt !== "number") return 0;

            const parsedLastOpenAt = parseInt(lastOpenAt, 10);
            if (isNaN(parsedLastOpenAt)) return 0;

            const configDelay = this._config._popDelay; // Retraso principal del pop
            const inpageDelay = this._config._inpageDelay; // Retraso en la página
            const defaultDelay = this._config._defaultDelay; // Retraso por defecto

            let effectiveDelay = delaySeconds; // Usar el retraso proporcionado si está disponible
            if (type === "inpage") {
                effectiveDelay = effectiveDelay || inpageDelay;
            } else if (type === "fallback") { // Suponiendo que el tipo 'fallback' podría usar defaultDelay
                effectiveDelay = effectiveDelay || defaultDelay;
            } else {
                effectiveDelay = effectiveDelay || configDelay;
            }

            return Math.max(0, parsedLastOpenAt + (1000 * effectiveDelay) - (new Date()).getTime());
        },

        _preparePop: function() {
            if (this._inventory.url !== "") {
                this._preparePopInventory();
                r._remove("_popprepop"); // Eliminar el bloqueo de prepop si el inventario está disponible
            } else {
                this._preparePopDefault();
            }
        },

        _waitForGoodWeather: function() {
            // Comprobar si no está en la ventana superior Y tiene dimensiones externas/internas cero Y está oculto
            if ((top !== window && window.outerWidth === 0 && window.outerHeight === 0 && window.innerWidth === 0 && window.innerWidth === 0) || document.hidden) {
                setTimeout(this._waitForGoodWeather.bind(this), 50);
            } else {
                setTimeout(this._init.bind(this), this._mSecondsTillDelayExpired()); // Inicializar después del retraso
            }
        },

        _loadConfig: function() {
            const incomingConfig = window[popConfigVar] || [];
            const currentConfig = this._config;

            for (let i = 0; i < incomingConfig.length; i++) {
                const settingKey = incomingConfig[i][0];
                let settingValue = incomingConfig[i][1];

                // Convertir valores específicos a números
                switch (settingKey) {
                    case "siteId":
                    case "delayBetween":
                    case "defaultPerIP":
                    case "trafficType":
                        settingValue = parseInt(settingValue, 10);
                        if (isNaN(settingValue)) continue;
                }

                // Aplicar configuraciones al objeto de configuración
                switch (settingKey) {
                    case "siteId":
                        currentConfig._siteId = settingValue;
                        break;
                    case "minBid":
                        currentConfig._minBid = settingValue;
                        break;
                    case "popundersPerIP":
                        currentConfig._popPerDay = settingValue;
                        break;
                    case "delayBetween":
                        currentConfig._popDelay = settingValue;
                        break;
                    case "blockedCountries":
                        currentConfig._blockedCountries = settingValue;
                        break;
                    case "default":
                        currentConfig._default = settingValue;
                        break;
                    case "defaultType":
                        currentConfig._defaultType = settingValue;
                        break;
                    case "defaultPerIP":
                        currentConfig._defaultPerDay = settingValue;
                        break;
                    case "topmostLayer":
                        currentConfig._useOverlay = settingValue;
                        break;
                    case "trafficType":
                        currentConfig._trafficType = settingValue;
                        break;
                    case "popunderFailover":
                        currentConfig._popunderFailover = settingValue;
                        break;
                    case "prepop":
                        currentConfig._prepop = settingValue;
                        break;
                    case "adscorebp":
                        currentConfig._adscorebp = settingValue;
                        break;
                    case "adscorept":
                        currentConfig._adscorept = settingValue;
                        break;
                    case "adscoreak":
                        currentConfig._adscoreak = settingValue;
                        break;
                    case "inpagePerIP":
                        currentConfig._inpagePerDay = settingValue;
                        break;
                    case "inpageDelayBetween":
                        currentConfig._inpageDelay = settingValue;
                        break;
                    case "defaultDelayBetween":
                        currentConfig._defaultDelay = settingValue;
                        break;
                }
            }

            // Asegurarse de que _useOverlay sea booleano, o cadena 'always'/'auto'
            if (currentConfig._useOverlay.length === 0) { // Si es una cadena vacía, convertir booleano a cadena
                currentConfig._useOverlay = currentConfig._useOverlay ? "always" : "auto";
            }
        }
    };

    // --- Descubrimiento Dinámico de Variables (parte de la ofuscación inicial) ---
    // Este bucle intenta encontrar una variable global que coincida con un patrón hexadecimal de 32 caracteres
    // y parezca contener datos de configuración.
    for (let prop in window) {
        try {
            if (prop.match(/[0-9a-f]{32,32}/) &&
                window[prop] &&
                window[prop].length >= 7 &&
                window[prop][0] &&
                window[prop][0][0] &&
                !isNaN(parseFloat(window[prop][0][1])) &&
                isFinite(window[prop][0][1])) {
                popConfigVar = prop; // Se encontró el nombre de la variable de configuración
                // Esta línea crea una variable global duplicada con los primeros 16 caracteres duplicados.
                // Es parte de la ofuscación.
                window[prop.slice(0, 16) + prop.slice(0, 16)] = window[prop];
                break;
            }
        } catch (e) {}
    }

    // --- Ofuscación/Generación de Ruta de Endpoint ---
    // Esto verifica si "//serve.popads.net" contiene ".net" (lo que siempre hace).
    // La condición `!".includes(".net")` es `false`, por lo que el bloque `if` a continuación siempre se omite.
    // Toda esta sección (y, por lo tanto, la generación de `paoVar`) es probable que sea código muerto o un remanente de una técnica de ofuscación anterior.
    // Si *fuera* a ejecutarse, generaría una cadena aleatoria para `paoVar` y reemplazaría `endpointPath`.
    if (!"//serve.popads.net".includes(".net")) { // Esta condición siempre será falsa
        paoVar = "";
        let randomLength = 10 + Math.floor(10 * Math.random());
        for (let i = 0; i < randomLength; i++) {
            paoVar += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(26 * Math.random()));
        }
        endpointPath = "/" + paoVar;
    }

    // --- Exponer Funciones API ---
    // Exponer funciones bajo `window._pao` (E) y una propiedad con nombre dinámico (paoVar)
    // `p` es el objeto que contiene las funciones API expuestas.
    const publicApi = { // Renombrado de 'p'
        parse: function(inventoryData) {
            adInventoryManager._parseInventory(inventoryData);
        },
        fbparse: function(bannerData) { // Análisis de Banner Flotante
            adInventoryManager._parseFloatingBanner(bannerData);
        },
        bbrparse: function(bbrData) { // Análisis de redirección de botón de retroceso
            adInventoryManager._parseBBR(bbrData);
        }
    };

    try {
        window._pao = publicApi;
        Object.freeze(window._pao); // Prevenir modificaciones
    } catch (e) {}

    try {
        window[paoVar] = publicApi; // Asignar a la variable descubierta/generada dinámicamente
        Object.freeze(window[paoVar]);
    } catch (e) {}

    // --- Inicialización ---
    // Solo se ejecuta si la cadena del agente de usuario no comienza con "://", lo que siempre es cierto.
    // Esto es un truco común para asegurar que el script solo se ejecute en un contexto de navegador.
    // Llama a _waitForGoodWeather para asegurar que el entorno sea adecuado antes de inicializar.
    if (!navigator.userAgent.includes("://")) {
        adInventoryManager._waitForGoodWeather();
    }

})(window, window.document, window.screen);
