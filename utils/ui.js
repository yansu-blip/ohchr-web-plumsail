window.OHCHR = window.OHCHR || {};

(function() {
    function moduleUrl(path) {
        const current = document.currentScript?.src;

        if (current) {
            return new URL(path, current).href;
        }

        return `https://cdn.jsdelivr.net/gh/yansu-blip/ohchr-web-plumsail@main/${path.replace(/^\.\.\//, '')}`;
    }

    function loadBackToTopModule() {
        if (OHCHR.BackToTop) {
            return Promise.resolve(OHCHR.BackToTop);
        }

        if (OHCHR._backToTopModuleReady) {
            return OHCHR._backToTopModuleReady;
        }

        OHCHR._backToTopModuleReady = new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = moduleUrl('../modules/back-to-top.js');
            script.onload = function() {
                if (OHCHR.BackToTop) {
                    resolve(OHCHR.BackToTop);
                } else {
                    reject(new Error('Back to top module loaded without exposing OHCHR.BackToTop.'));
                }
            };
            script.onerror = function() {
                reject(new Error('Failed to load back to top module.'));
            };
            document.head.appendChild(script);
        });

        return OHCHR._backToTopModuleReady;
    }

    OHCHR.initBackToTop = function(options = {}) {
        return loadBackToTopModule()
            .then(function(backToTop) {
                return backToTop.init(options);
            })
            .catch(function(err) {
                console.error('Failed to initialize Back to Top button:', err);
                throw err;
            });
    };

    loadBackToTopModule().catch(function(err) {
        console.error('Failed to load Back to Top module:', err);
    });
})();
