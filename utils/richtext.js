window.OHCHR = window.OHCHR || {};

(function() {
    function moduleUrl(path) {
        const current = document.currentScript?.src;

        if (current) {
            return new URL(path, current).href;
        }

        return `https://cdn.jsdelivr.net/gh/yansu-blip/ohchr-web-plumsail@main/${path.replace(/^\.\.\//, '')}`;
    }

    function loadModule(readyKey, namespace, path) {
        if (OHCHR[namespace]) {
            return Promise.resolve(OHCHR[namespace]);
        }

        if (OHCHR[readyKey]) {
            return OHCHR[readyKey];
        }

        OHCHR[readyKey] = new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = moduleUrl(path);
            script.onload = function() {
                if (OHCHR[namespace]) {
                    resolve(OHCHR[namespace]);
                } else {
                    reject(new Error(`${path} loaded without exposing OHCHR.${namespace}.`));
                }
            };
            script.onerror = function() {
                reject(new Error(`Failed to load ${path}.`));
            };
            document.head.appendChild(script);
        });

        return OHCHR[readyKey];
    }

    function createToolbarFallback(options = {}) {
        const headings = options.headings || ['h5', 'p'];

        const headingLabels = {
            h3: 'Heading-Large',
            h4: 'Heading-Medium',
            h5: 'Heading-Small',
            p: 'Paragraph'
        };

        const tools = [
            'undo', 'redo',
            {
                name: 'formatting',
                items: headings.map(tag => ({
                    text: headingLabels[tag] || tag,
                    value: tag
                }))
            }
        ];

        if (options.lineBreak) {
            tools.push({
                exec: function() {
                    const $k = window.kendo?.jQuery;

                    if (!$k) {
                        console.warn('kendo.jQuery not available');
                        return;
                    }

                    const editor = $k(this).data('kendoEditor');

                    if (!editor) {
                        console.warn('Kendo Editor not found for line break button.');
                        return;
                    }

                    editor.exec('inserthtml', { value: '<br/>' });
                },
                template: '<a class="k-button k-tool k-group-start k-group-end" role="button" title="Insert Line Break" aria-label="Insert Line Break" style="color:black;"><span class="k-icon k-i-insert-m"></span></a>'
            });
        }

        tools.push('bold');

        if (options.italic !== false) {
            tools.push('italic');
        }

        tools.push(
            'superscript',
            'createLink',
            'unlink',
            'insertUnorderedList',
            'insertOrderedList',
            'viewHtml'
        );

        return { tools };
    }

    OHCHR.createRichTextToolbar = function(options = {}) {
        if (OHCHR.RichTextEditors) {
            return OHCHR.RichTextEditors.createToolbar(options);
        }

        return createToolbarFallback(options);
    };

    OHCHR.initRichTextEditors = function(config = {}, form) {
        return loadModule('_richTextEditorsReady', 'RichTextEditors', '../modules/richtext-editors.js')
            .then(function(richTextEditors) {
                return richTextEditors.init(form || window.fd, config);
            })
            .catch(function(err) {
                console.error('Failed to initialize rich text editors:', err);
                throw err;
            });
    };

    OHCHR.initRichTextCleaners = function(config = [], form) {
        return loadModule('_richTextCleanersReady', 'RichTextCleaners', '../modules/richtext-cleaners.js')
            .then(function(richTextCleaners) {
                return richTextCleaners.init(form || window.fd, config);
            })
            .catch(function(err) {
                console.error('Failed to initialize rich text cleaners:', err);
                throw err;
            });
    };

    window.initRichTextCleaners = function(config = [], form) {
        return OHCHR.initRichTextCleaners(config, form);
    };
})();
