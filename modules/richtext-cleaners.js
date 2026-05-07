window.OHCHR = window.OHCHR || {};

OHCHR.RichTextCleaners = OHCHR.RichTextCleaners || {};

OHCHR.RichTextCleaners.attach = function(field, options = {}) {
    if (!field) return;

    const editor = field.widget;

    if (!editor) {
        console.warn('Rich text editor widget is not available.');
        return;
    }

    if (typeof OHCHR.enforceNoImages === 'function') {
        OHCHR.enforceNoImages(editor);
    }

    if (typeof editor.bind !== 'function') {
        console.warn('Rich text editor does not expose a bind method.');
        return;
    }

    editor.bind('paste', function() {
        setTimeout(function() {
            let html = editor.value();

            if (typeof OHCHR.cleanRichTextHtml === 'function') {
                html = OHCHR.cleanRichTextHtml(html, options);
            }

            editor.value(html);
            field.value = html;
        }, 300);
    });
};

OHCHR.RichTextCleaners.init = function(form, config = []) {
    if (window._renderedPasteCleanup) return Promise.resolve();

    const activeForm = form || window.fd;

    if (!activeForm || typeof activeForm.field !== 'function') {
        return Promise.reject(new Error('Plumsail form object is not available for rich text cleaners.'));
    }

    window._renderedPasteCleanup = true;

    const pending = [];

    config.forEach(item => {
        const languages = item.languages?.length ? item.languages : [''];

        languages.forEach(lang => {
            const field = activeForm.field(`${item.prefix}${lang}`);
            if (!field || typeof field.ready !== 'function') return;

            pending.push(field.ready().then(function() {
                OHCHR.RichTextCleaners.attach(field, item.options);
            }));
        });
    });

    return Promise.all(pending);
};

OHCHR.attachRichTextCleaner = function(field, options = {}) {
    return OHCHR.RichTextCleaners.attach(field, options);
};

OHCHR.initRichTextCleaners = function(config = [], form) {
    return OHCHR.RichTextCleaners.init(form || window.fd, config);
};

window.attachRichTextCleaner = function(field, options = {}) {
    return OHCHR.RichTextCleaners.attach(field, options);
};

window.initRichTextCleaners = function(config = [], form) {
    return OHCHR.RichTextCleaners.init(form || window.fd, config);
};
