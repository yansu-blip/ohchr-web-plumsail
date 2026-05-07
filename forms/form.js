(async function() {
    try {
        const form = window.fd || (typeof fd !== 'undefined' ? fd : null);

        if (!form) {
            throw new Error('Plumsail form object is not available.');
        }

        await OHCHR.initLanguageFields(window.OHCHR_FORM_CONFIG?.languages, form);

        await OHCHR.initializeDropdowns(window.OHCHR_FORM_CONFIG?.dropdowns, form);

        await OHCHR.initRichTextEditors(window.OHCHR_FORM_CONFIG?.richTextEditors, form);

        await OHCHR.initRichTextCleaners(window.OHCHR_FORM_CONFIG?.richTextCleaners || [], form);

        console.log('Form initialized successfully.');
    } catch (error) {
        console.error('Error initializing Statements form:', error);
    }
})();
