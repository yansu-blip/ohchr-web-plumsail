fd.rendered(async function () {
    try {
        await OHCHR.initializeDropdowns();

        OHCHR.initRichTextEditors();

        initRichTextCleaners([
            {
                prefix: 'MainBody',
                languages: UN_LANGUAGES
            },
            {
                prefix: 'Boilerplate',
                languages: UN_LANGUAGES,
                options: {
                    removeEm: true
                }
            }
        ]);

        console.log('Form initialized successfully.');
    } catch (error) {
        console.error('Error initializing Statements form:', error);
    }
});

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

            attachRichTextCleaner(field, item.options);
        });
    });
}
