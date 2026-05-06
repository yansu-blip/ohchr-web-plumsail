(async function () {
    try {
        await OHCHR.initializeDropdowns(window.OHCHR_FORM_CONFIG?.dropdowns);

        OHCHR.initRichTextEditors(window.OHCHR_FORM_CONFIG?.richTextEditors);

        initRichTextCleaners(window.OHCHR_FORM_CONFIG?.richTextCleaners || []);

        console.log('Form initialized successfully.');
    } catch (error) {
        console.error('Error initializing Statements form:', error);
    }
})();

function attachRichTextCleaner(field, options = {}) {
    const editor = field.widget;

    OHCHR.enforceNoImages(editor);

    editor.bind('paste', function() {
        setTimeout(function() {
            let html = editor.value();
            html = OHCHR.cleanRichTextHtml(html, options);

            editor.value(html);
            field.value = html;
        }, 300);
    });
}

function initRichTextCleaners(config = []) {
    if (window._renderedPasteCleanup) return;
    window._renderedPasteCleanup = true;

    config.forEach(item => {
        const languages = item.languages?.length ? item.languages : [""];

        languages.forEach(lang => {
            const field = fd.field(`${item.prefix}${lang}`);
            if (!field) return;
            
            field.ready().then(function () {
                attachRichTextCleaner(field, item.options);
            });
        });
    });
}
